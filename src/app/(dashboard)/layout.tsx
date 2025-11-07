import { Sidebar } from "@/components/dashboard/Sidebar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { BreadcrumbNav } from "@/components/dashboard/breadcrumb-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar with Breadcrumb */}
        <header className="flex items-center gap-4 border-b bg-background px-6 h-[64px]">

          <MobileSidebar />
          <BreadcrumbNav />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
