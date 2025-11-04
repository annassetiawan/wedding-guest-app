'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Sparkles } from 'lucide-react'

export type TemplateStyle = 'modern' | 'elegant' | 'all'

export interface TemplateInfo {
  id: string
  name: string
  style: TemplateStyle
  description: string
  thumbnail: string
  features: string[]
  colorScheme: string
}

interface TemplateCardProps {
  template: TemplateInfo
  onPreview: (template: TemplateInfo) => void
}

export function TemplateCard({ template, onPreview }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {/* Thumbnail Preview */}
        <div
          className="w-full h-full bg-gradient-to-br"
          style={{
            backgroundImage: template.thumbnail
          }}
        >
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              onClick={() => onPreview(template)}
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              <Eye className="h-5 w-5" />
              Preview Template
            </Button>
          </div>
        </div>

        {/* Style Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="capitalize">
            {template.style}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Template Name */}
          <div>
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>

          {/* Color Scheme */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>{template.colorScheme}</span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {template.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.features.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
