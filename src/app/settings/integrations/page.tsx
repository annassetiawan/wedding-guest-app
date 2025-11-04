'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plug } from 'lucide-react'

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect with third-party services and manage API access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coming Soon */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Plug className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Integrations Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're building integrations with popular services to enhance your
              event management workflow.
            </p>
            <p className="text-xs text-muted-foreground">
              Expected release: Q3 2026
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Planned Integrations:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Google Calendar sync for events</li>
              <li>• Email service providers (SendGrid, Mailchimp)</li>
              <li>• SMS gateways for notifications</li>
              <li>• CRM integrations (Salesforce, HubSpot)</li>
              <li>• Payment processors (Stripe, PayPal)</li>
              <li>• Zapier webhooks for automation</li>
              <li>• Slack notifications for team updates</li>
              <li>• Excel/CSV import and export</li>
              <li>• REST API access with authentication</li>
              <li>• Webhook endpoints for real-time events</li>
            </ul>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">API Access (Premium Feature):</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Generate API keys to build custom integrations and automate workflows.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• RESTful API endpoints</li>
              <li>• Comprehensive API documentation</li>
              <li>• Rate limiting and usage analytics</li>
              <li>• API key rotation and management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
