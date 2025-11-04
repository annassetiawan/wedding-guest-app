'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sliders } from 'lucide-react'

export default function PreferencesSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your application experience and default settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coming Soon */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Sliders className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Preferences Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're building customization options to personalize your experience.
            </p>
            <p className="text-xs text-muted-foreground">
              Expected release: Q2 2026
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Planned Preferences:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Default event visibility settings</li>
              <li>• Guest list sorting preferences</li>
              <li>• Default check-in method selection</li>
              <li>• Date and time format preferences</li>
              <li>• Language and localization settings</li>
              <li>• Email notification frequency</li>
              <li>• Dashboard widget customization</li>
              <li>• Default guest category assignment</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
