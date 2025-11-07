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

  // Don't show breadcrumb if we're at root or only one level deep
  if (paths.length === 0) {
    return null
  }

  return (
    <Breadcrumb className="flex items-center">
      <BreadcrumbList className="flex items-center">
        {paths.map((path, index) => {
          const href = "/" + paths.slice(0, index + 1).join("/")
          const isLast = index === paths.length - 1
          const label = pathNameMap[path] || path

          return (
            <div key={href} className="flex items-center gap-1.5">
              <BreadcrumbItem className="flex items-center">
                {isLast ? (
                  <BreadcrumbPage className="line-clamp-1">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href} className="line-clamp-1">{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="flex items-center">
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
