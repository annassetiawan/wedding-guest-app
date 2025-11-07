'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { TemplateCard, TemplateInfo, TemplateStyle } from '@/components/templates/TemplateCard'
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal'
import { Search, Filter, Sparkles } from 'lucide-react'

// Template catalog
const templates: TemplateInfo[] = [
  {
    id: 'modern',
    name: 'Modern Template',
    style: 'modern',
    description: 'Clean and contemporary design with gradient backgrounds and modern typography. Perfect for couples who love minimalist aesthetics.',
    thumbnail: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.3) 100%)',
    features: ['Gradient Background', 'Modern Typography', 'QR Code', 'Calendar Integration', 'WhatsApp Share'],
    colorScheme: 'Primary Gradient',
  },
  {
    id: 'elegant',
    name: 'Elegant Template',
    style: 'elegant',
    description: 'Sophisticated and timeless design with classic serif fonts and amber gold accents. Ideal for traditional weddings.',
    thumbnail: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)',
    features: ['Serif Typography', 'Gold Accents', 'Decorative Borders', 'Classic Layout', 'Heart Icons'],
    colorScheme: 'Amber Gold',
  },
]

export default function TemplatesPage() {
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handlePreview = (template: TemplateInfo) => {
    setPreviewTemplate(template)
    setPreviewOpen(true)
  }

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesStyle = selectedStyle === 'all' || template.style === selectedStyle
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStyle && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Invitation Templates</h1>
        </div>
        <p className="text-muted-foreground">
          Browse and preview beautiful invitation templates for your events
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Available templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modern Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.style === 'modern').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Contemporary designs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elegant Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.style === 'elegant').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Classic designs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Templates
          </CardTitle>
          <CardDescription>
            Find the perfect template for your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Style Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Style</label>
            <Tabs
              value={selectedStyle}
              onValueChange={(value) => setSelectedStyle(value as TemplateStyle)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Styles</TabsTrigger>
                <TabsTrigger value="modern">Modern</TabsTrigger>
                <TabsTrigger value="elegant">Elegant</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              {selectedStyle === 'all' ? 'All Templates' : `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Templates`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={handlePreview}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedStyle('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Sparkles className="h-10 w-10 text-primary mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">More Templates Coming Soon!</h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                We're constantly adding new beautiful templates. Future releases will include Traditional,
                Minimalist, and Luxury styles with advanced customization options.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" disabled>
                Traditional Style
              </Button>
              <Button variant="outline" size="sm" disabled>
                Minimalist Style
              </Button>
              <Button variant="outline" size="sm" disabled>
                Luxury Style
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
