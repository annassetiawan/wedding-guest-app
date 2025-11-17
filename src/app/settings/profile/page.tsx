'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { profileService } from '@/lib/services/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Mail, Upload, X } from 'lucide-react'
import { z } from 'zod'

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional().or(z.literal('')),
  phone: z.string().regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone number format').optional().or(z.literal('')),
  businessName: z.string().max(100, 'Business name must be less than 100 characters').optional().or(z.literal('')),
  businessType: z.string(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    businessName: user?.user_metadata?.business_name || '',
    businessType: user?.user_metadata?.business_type || 'individual',
    location: user?.user_metadata?.location || '',
    bio: user?.user_metadata?.bio || '',
  })

  // Load avatar URL on mount
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url)
    }
  }, [user])

  const getUserInitials = () => {
    const name = formData.name || user?.email
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    setUploading(true)
    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        await profileService.deleteAvatar(avatarUrl)
      }

      // Upload new avatar
      const newAvatarUrl = await profileService.uploadAvatar(file, user.id)
      setAvatarUrl(newAvatarUrl)

      // Update profile with new avatar URL
      await profileService.updateProfile({ avatarUrl: newAvatarUrl })

      toast.success('Profile photo updated successfully!')
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast.error(error.message || 'Failed to upload photo')
      setAvatarPreview(null) // Reset preview on error
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return

    setUploading(true)
    try {
      // Delete from storage
      await profileService.deleteAvatar(avatarUrl)

      // Update profile to remove avatar URL
      await profileService.updateProfile({ avatarUrl: '' })

      setAvatarUrl(null)
      setAvatarPreview(null)
      toast.success('Profile photo removed')
    } catch (error: any) {
      console.error('Avatar removal error:', error)
      toast.error(error.message || 'Failed to remove photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data with zod
      const validationResult = profileSchema.safeParse({
        name: formData.name,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.location,
        bio: formData.bio,
      })

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0]
        toast.error(firstError.message)
        return
      }

      // Update profile via Supabase
      await profileService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.location,
        bio: formData.bio,
      })

      toast.success('Profile updated successfully!')

      // Reload the page to refresh user data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information and public details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {(avatarPreview || avatarUrl) && (
                  <AvatarImage
                    src={avatarPreview || avatarUrl || undefined}
                    alt={formData.name || 'Profile'}
                  />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploading}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="pl-10"
                  />
                </div>
                <Badge variant="secondary" className="h-10 px-3 flex items-center">
                  Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+62 812-3456-7890"
              />
            </div>

            <Separator />

            {/* Business Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Business Information</h3>
                <p className="text-xs text-muted-foreground">
                  Optional - for wedding vendors and organizers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) =>
                    handleInputChange('businessName', e.target.value)
                  }
                  placeholder="Elite Wedding Organizer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) =>
                    handleInputChange('businessType', value)
                  }
                >
                  <SelectTrigger id="businessType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="wedding_organizer">
                      Wedding Organizer
                    </SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="photographer">Photographer</SelectItem>
                    <SelectItem value="other">Other Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / City</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Jakarta, Indonesia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself or your business..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                className="hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
                onClick={() => {
                  setFormData({
                    name: user?.user_metadata?.name || '',
                    email: user?.email || '',
                    phone: user?.user_metadata?.phone || '',
                    businessName: user?.user_metadata?.business_name || '',
                    businessType:
                      user?.user_metadata?.business_type || 'individual',
                    location: user?.user_metadata?.location || '',
                    bio: user?.user_metadata?.bio || '',
                  })
                  toast.info('Changes discarded')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
