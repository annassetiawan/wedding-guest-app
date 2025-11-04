'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coming Soon */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Security Features Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're implementing advanced security features to protect your account
              and event data.
            </p>
            <p className="text-xs text-muted-foreground">
              Expected release: Q2 2026
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Planned Security Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Two-factor authentication (2FA)</li>
              <li>• Active session management</li>
              <li>• Login history and activity log</li>
              <li>• Trusted devices management</li>
              <li>• Password change and reset</li>
              <li>• Account recovery options</li>
              <li>• Privacy settings for guest data</li>
              <li>• Data export and deletion</li>
              <li>• Security alerts and notifications</li>
              <li>• API key management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
