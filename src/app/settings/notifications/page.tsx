'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coming Soon */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Notifications Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're building a comprehensive notification system to keep you updated
              on guest check-ins and important event updates.
            </p>
            <p className="text-xs text-muted-foreground">
              Expected release: Q2 2026
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Planned Notification Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time guest check-in notifications</li>
              <li>• Event reminder notifications</li>
              <li>• Daily attendance summary emails</li>
              <li>• Guest RSVP update notifications</li>
              <li>• Milestone alerts (50%, 75%, 100% check-in)</li>
              <li>• SMS notifications for critical updates</li>
              <li>• Push notifications on mobile devices</li>
              <li>• Customizable notification schedules</li>
              <li>• Notification preferences per event</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
