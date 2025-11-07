"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pathNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  events: "Events",
  guests: "Guests",
  templates: "Templates",
  analytics: "Analytics",
  settings: "Settings",
  profile: "Profile",
  billing: "Billing",
  preferences: "Preferences",
  notifications: "Notifications",
  security: "Security",
  integrations: "Integrations",
  create: "Create",
  edit: "Edit",
  checkin: "Check-in",
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Generate breadcrumb items from path
  const paths = pathname?.split("/").filter(Boolean) || []

  // Don't show breadcrumb on root or login pages
  if (paths.length === 0 || paths[0] === "login" || paths[0] === "register") {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((path, index) => {
          const href = "/" + paths.slice(0, index + 1).join("/")
          const isLast = index === paths.length - 1

          // Try to get label from map, fallback to path, handle UUIDs
          let label = pathNameMap[path] || path

          // If it looks like a UUID or ID, use generic label
          if (path.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            label = "Details"
          }

          return (
            <div key={href} className="flex items-center gap-2">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href} className="capitalize">{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
