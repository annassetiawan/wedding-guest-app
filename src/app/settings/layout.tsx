'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FixedSidebar } from '@/components/dashboard/FixedSidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { BreadcrumbNav } from '@/components/dashboard/BreadcrumbNav'
import { User, CreditCard, Sliders, Bell, Shield, Plug } from 'lucide-react'

const settingsTabs = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Preferences',
    href: '/settings/preferences',
    icon: Sliders,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'Integrations',
    href: '/settings/integrations',
    icon: Plug,
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col">
        <FixedSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar with Breadcrumb */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <MobileSidebar />
          <BreadcrumbNav />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl p-6 lg:p-8">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>

              {/* Desktop: Vertical Tabs */}
              <div className="hidden lg:flex gap-8">
                <nav className="flex flex-col gap-2 w-56 flex-shrink-0">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = pathname === tab.href
                    return (
                      <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-secondary text-secondary-foreground'
                            : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.title}
                      </Link>
                    )
                  })}
                </nav>

                <div className="flex-1 min-w-0">{children}</div>
              </div>

              {/* Mobile: Horizontal Scrollable Tabs */}
              <div className="lg:hidden space-y-6">
                <div className="overflow-x-auto pb-2 -mx-6 px-6">
                  <div className="flex gap-2">
                    {settingsTabs.map((tab) => {
                      const Icon = tab.icon
                      const isActive = pathname === tab.href
                      return (
                        <Link
                          key={tab.href}
                          href={tab.href}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                            isActive
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {tab.title}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div>{children}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
