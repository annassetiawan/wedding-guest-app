import { createClient } from '@/lib/supabase/client'

export interface ProfileData {
  name: string
  phone: string
  businessName: string
  businessType: string
  location: string
  bio: string
}

export interface ProfileUpdateData extends Partial<ProfileData> {
  avatarUrl?: string
}

class ProfileService {
  private supabase = createClient()

  /**
   * Update user profile metadata
   */
  async updateProfile(data: ProfileUpdateData): Promise<void> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Update user metadata
    const { error } = await this.supabase.auth.updateUser({
      data: {
        name: data.name,
        phone: data.phone,
        business_name: data.businessName,
        business_type: data.businessType,
        location: data.location,
        bio: data.bio,
        avatar_url: data.avatarUrl,
      }
    })

    if (error) {
      console.error('Profile update error:', error)
      throw new Error(error.message || 'Failed to update profile')
    }

    // Also update the users table if it exists
    await this.updateUsersTable(user.id, data)
  }

  /**
   * Update users table in database (if exists)
   */
  private async updateUsersTable(userId: string, data: ProfileUpdateData): Promise<void> {
    try {
      const updateData: any = {}

      if (data.name) updateData.name = data.name
      if (data.phone) updateData.phone = data.phone
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl

      if (Object.keys(updateData).length > 0) {
        const { error } = await this.supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)

        if (error) {
          console.warn('Users table update failed:', error.message)
          // Don't throw - users table might not exist or have different schema
        }
      }
    } catch (error) {
      console.warn('Error updating users table:', error)
      // Don't throw - this is a secondary update
    }
  }

  /**
   * Upload avatar image to Supabase Storage
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.')
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(uploadError.message || 'Failed to upload image')
    }

    // Get public URL
    const { data: { publicUrl } } = this.supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    return publicUrl
  }

  /**
   * Delete old avatar from storage
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(avatarUrl)
      const pathMatch = url.pathname.match(/\/profiles\/(.+)$/)

      if (!pathMatch) {
        console.warn('Could not extract file path from avatar URL')
        return
      }

      const filePath = pathMatch[1]

      const { error } = await this.supabase.storage
        .from('profiles')
        .remove([filePath])

      if (error) {
        console.warn('Error deleting old avatar:', error.message)
        // Don't throw - this is cleanup, not critical
      }
    } catch (error) {
      console.warn('Error in deleteAvatar:', error)
      // Don't throw - this is cleanup
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileData | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return {
      name: user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || '',
      businessName: user.user_metadata?.business_name || '',
      businessType: user.user_metadata?.business_type || 'individual',
      location: user.user_metadata?.location || '',
      bio: user.user_metadata?.bio || '',
    }
  }
}

export const profileService = new ProfileService()
