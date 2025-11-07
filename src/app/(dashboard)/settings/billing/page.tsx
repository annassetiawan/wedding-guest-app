'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Zap } from 'lucide-react'

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
          <CardDescription>
            Manage your subscription plan and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Current Plan</h3>
                  <Badge>Free</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  You're currently on the free plan
                </p>
              </div>
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Events</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests per event</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Templates</span>
                <span className="font-medium">2 (Modern & Elegant)</span>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Premium Plans Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're working on premium subscription plans with advanced features
              like custom branding, priority support, and more templates.
            </p>
            <p className="text-xs text-muted-foreground">
              Expected release: Q2 2026
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Planned Premium Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Custom branding and white-label options</li>
              <li>• Unlimited custom templates</li>
              <li>• Priority customer support</li>
              <li>• Advanced analytics and reporting</li>
              <li>• API access for integrations</li>
              <li>• Team collaboration features</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button disabled>
              Upgrade Plan
            </Button>
            <Button variant="outline" disabled>
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
