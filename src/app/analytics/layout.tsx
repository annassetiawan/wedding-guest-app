import { FixedSidebar } from '@/components/dashboard/FixedSidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { BreadcrumbNav } from '@/components/dashboard/BreadcrumbNav'

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <div className="container mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
