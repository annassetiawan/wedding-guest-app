'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl">{template.name}</DialogTitle>
                <Badge variant="secondary" className="capitalize">
                  {template.style}
                </Badge>
              </div>
              <DialogDescription className="text-base">
                {template.description}
              </DialogDescription>
            </div>
          </div>

          <Separator className="mt-4" />

          {/* Template Info */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Color Scheme
              </p>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{template.colorScheme}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Features
              </p>
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Template Preview */}
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="rounded-lg border overflow-hidden">
            {renderTemplate()}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              This is a preview with sample data. Your actual event details will be used.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                <Check className="mr-2 h-4 w-4" />
                Select Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
