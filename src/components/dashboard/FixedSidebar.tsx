'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveEvent } from '@/contexts/EventContext'
import { eventService, Event } from '@/lib/services/events'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Home,
  Users,
  TrendingUp,
  Clock,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

export function FixedSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { activeEventId, activeEvent, setActiveEvent } = useActiveEvent()
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [activeEventExpanded, setActiveEventExpanded] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      return saved === 'true'
    }
    return false
  })

  // Load user events for selector
  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed))
    }
  }, [isCollapsed])

  // Auto-collapse when navigating away from event pages
  useEffect(() => {
    if (activeEventId && !pathname.includes(`/events/${activeEventId}`)) {
      setActiveEventExpanded(false)
    } else if (activeEventId && pathname.includes(`/events/${activeEventId}`)) {
      setActiveEventExpanded(true)
    }
  }, [pathname, activeEventId])

  const loadEvents = async () => {
    if (!user) return

    try {
      setLoadingEvents(true)
      const data = await eventService.getEventsByUserId(user.id)
      setEvents(data)

      // If no active event but events exist, set first event as active
      if (!activeEventId && data.length > 0) {
        setActiveEvent(data[0].id, data[0])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar border-r border-sidebar-border overflow-hidden transition-all duration-300",
        isCollapsed ? "w-16 min-w-16" : "w-64 min-w-64"
      )}
    >
      {/* Logo Section with Toggle */}
      <div className="flex h-14 items-center border-b px-4 justify-between shrink-0">
        {!isCollapsed && <Logo />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1 px-3 overflow-hidden">
          {/* Platform Section */}
          <div className="mb-4 overflow-hidden">
            {!isCollapsed && (
              <div className="px-2 mb-2">
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  Platform
                </p>
              </div>
            )}
            <div className="space-y-2">
              {/* Dashboard */}
              <Link
                href="/dashboard"
                className={cn(
                  'flex items-center rounded-lg text-sm transition-colors',
                  pathname === '/dashboard'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto p-0' : 'gap-3 px-3 py-2'
                )}
                title={isCollapsed ? 'Dashboard' : ''}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Dashboard</span>}
              </Link>

              {/* All Events */}
              <Link
                href="/events"
                className={cn(
                  'flex items-center rounded-lg text-sm transition-colors',
                  pathname === '/events' && !pathname.includes('/events/')
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto p-0' : 'gap-3 px-3 py-2'
                )}
                title={isCollapsed ? 'All Events' : ''}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>All Events</span>}
              </Link>

              {/* Active Event - Collapsible Menu Item */}
              {activeEvent && activeEventId && !isCollapsed && (
                <>
                  <button
                    onClick={() => setActiveEventExpanded(!activeEventExpanded)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname.includes(`/events/${activeEventId}`)
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4" />
                      <span>Active Event</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        activeEventExpanded ? 'rotate-90' : ''
                      )}
                    />
                  </button>

                  {/* Active Event Expanded Content */}
                  {activeEventExpanded && (
                    <div className="mt-1 space-y-1 border-l ml-5 pl-3 pr-3">
                      {/* Event Selector */}
                      <div className="mb-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="flex text-left items-center justify-between gap-2 rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 text-sm hover:bg-sidebar-accent transition-colors w-[184px]"
                              title={`${activeEvent.event_name} - ${new Date(activeEvent.event_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium text-xs">
                                  {activeEvent.event_name}
                                </div>
                                <div className="truncate text-[10px] text-muted-foreground">
                                  {new Date(activeEvent.event_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                              </div>
                              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel className="text-xs">Switch Event</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {events.map((event) => (
                              <DropdownMenuItem
                                key={event.id}
                                onClick={() => {
                                  setActiveEvent(event.id, event)
                                  router.push(`/events/${event.id}/overview`)
                                }}
                                className={cn(
                                  'cursor-pointer text-xs',
                                  activeEventId === event.id && 'bg-sidebar-accent'
                                )}
                                title={`${event.event_name} - ${new Date(event.event_date).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}`}
                              >
                                <div className="flex flex-col gap-0.5 min-w-0 w-full">
                                  <span className="font-medium truncate">{event.event_name}</span>
                                  <span className="text-[10px] text-muted-foreground truncate">
                                    {new Date(event.event_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Event Submenu Links */}
                      <Link
                        href={`/events/${activeEventId}/overview`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === `/events/${activeEventId}/overview`
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <Home className="h-4 w-4" />
                        <span>Overview</span>
                      </Link>

                      <Link
                        href={`/events/${activeEventId}/guests`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === `/events/${activeEventId}/guests`
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <Users className="h-4 w-4" />
                        <span>Guests</span>
                      </Link>

                      <Link
                        href={`/events/${activeEventId}/vendors`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === `/events/${activeEventId}/vendors`
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Vendors</span>
                      </Link>

                      <Link
                        href={`/events/${activeEventId}/analytics`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === `/events/${activeEventId}/analytics`
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>Analytics</span>
                      </Link>

                      <Link
                        href={`/events/${activeEventId}/timeline`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === `/events/${activeEventId}/timeline`
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <Clock className="h-4 w-4" />
                        <span>Timeline</span>
                      </Link>

                      <Link
                        href={`/events/${activeEventId}/settings`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === `/events/${activeEventId}/settings`
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Vendors */}
              <Link
                href="/vendors"
                className={cn(
                  'flex items-center rounded-lg text-sm transition-colors',
                  pathname === '/vendors'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto p-0' : 'gap-3 px-3 py-2'
                )}
                title={isCollapsed ? 'Vendors' : ''}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Vendors</span>}
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                className={cn(
                  'flex items-center rounded-lg text-sm transition-colors',
                  pathname.startsWith('/settings')
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto p-0' : 'gap-3 px-3 py-2'
                )}
                title={isCollapsed ? 'Settings' : ''}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </div>
          </div>

          {/* Preferences Section */}
          {!isCollapsed && (
            <div>
              <div className="px-2 mb-2">
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  Preferences
                </p>
              </div>
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center py-1.5">
              <ThemeToggle />
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "hover:bg-sidebar-accent",
                isCollapsed
                  ? "h-10 w-10 mx-auto p-0 flex items-center justify-center"
                  : "w-full gap-2 px-2 h-auto py-2 justify-start"
              )}
            >
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs rounded-md">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex flex-1 flex-col items-start text-left">
                    <span className="text-xs font-medium leading-none">{getUserName()}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[130px] mt-0.5">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="cursor-pointer text-xs">
                <User className="mr-2 h-3.5 w-3.5" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-xs">
                <Settings className="mr-2 h-3.5 w-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-red-600 focus:text-red-600 text-xs"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
