'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TemplateInfo } from './TemplateCard'
import ModernTemplate from '@/components/invitation/ModernTemplate'
import ElegantTemplate from '@/components/invitation/ElegantTemplate'
import { Event } from '@/lib/services/events'
import { Guest } from '@/types/database.types'
import { Loader2, Sparkles, Check } from 'lucide-react'

interface TemplatePreviewModalProps {
  template: TemplateInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Sample data for preview
const sampleEvent: Event = {
  id: 'sample-event',
  user_id: 'sample-user',
  bride_name: 'Sarah',
  groom_name: 'Michael',
  event_name: 'Wedding Celebration',
  event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  venue: 'The Grand Ballroom, Hotel Royal',
  photo_url: null,
  template_id: 'modern',
  created_at: new Date().toISOString(),
}

const sampleGuest: Guest = {
  id: 'sample-guest',
  event_id: 'sample-event',
  name: 'John Doe',
  phone: '+62 812-3456-7890',
  category: 'VIP',
  checked_in: false,
  checked_in_at: undefined,
  qr_code: 'SAMPLE-QR-12345',
  invitation_link: '',
  rsvp_status: 'pending',
  rsvp_message: undefined,
  rsvp_at: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
}: TemplatePreviewModalProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && template) {
      setLoading(true)
      // Simulate loading time for better UX
      const timer = setTimeout(() => setLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [open, template])

  if (!template) return null

  const renderTemplate = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )
    }

    switch (template.id) {
      case 'modern':
        return <ModernTemplate event={sampleEvent} guest={sampleGuest} />
      case 'elegant':
        return (
          <ElegantTemplate
            event={{ ...sampleEvent, template_id: 'elegant' }}
            guest={sampleGuest}
          />
        )
      default:
        return <ModernTemplate event={sampleEvent} guest={sampleGuest} />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">{template.name}</DialogTitle>
                <Badge variant="secondary" className="capitalize">
                  {template.style}
                </Badge>
              </div>
              <DialogDescription className="text-sm">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Grid */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Details */}
          <div className="w-80 border-r bg-muted/30 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Color Scheme</h4>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{template.colorScheme}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Features</h4>
                <ul className="space-y-2">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-4">
                  This is a preview with sample data. Your actual event details will be used when you select this template.
                </p>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                    size="lg"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Use This Template
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Template Preview */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-8 flex items-center justify-center min-h-full bg-muted/20">
                {/* Phone Frame for Mobile Preview */}
                <div className="w-full">
                  <div className="bg-background rounded-2xl shadow-2xl border overflow-hidden">
                    {/* Phone notch */}
                    <div className="h-6 bg-background flex items-center justify-center">
                      <div className="w-32 h-4 bg-muted rounded-full" />
                    </div>

                    {/* Template Content */}
                    <div className="relative">
                      {loading ? (
                        <div className="flex items-center justify-center h-96">
                          <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-sm text-muted-foreground">Loading preview...</p>
                          </div>
                        </div>
                      ) : (
                        renderTemplate()
                      )}
                    </div>

                    {/* Phone bottom bar */}
                    <div className="h-6 bg-background" />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
