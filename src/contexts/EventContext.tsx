'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Event } from '@/lib/services/events'

interface EventContextType {
  activeEventId: string | null
  activeEvent: Event | null
  setActiveEvent: (eventId: string | null, event: Event | null) => void
  clearActiveEvent: () => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

const ACTIVE_EVENT_STORAGE_KEY = 'wedding-app-active-event-id'
const ACTIVE_EVENT_DATA_STORAGE_KEY = 'wedding-app-active-event-data'

export function EventProvider({ children }: { children: ReactNode }) {
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [activeEvent, setActiveEventData] = useState<Event | null>(null)

  // Load active event from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEventId = localStorage.getItem(ACTIVE_EVENT_STORAGE_KEY)
      const storedEventData = localStorage.getItem(ACTIVE_EVENT_DATA_STORAGE_KEY)

      if (storedEventId) {
        setActiveEventId(storedEventId)
      }

      if (storedEventData) {
        try {
          setActiveEventData(JSON.parse(storedEventData))
        } catch (error) {
          console.error('Failed to parse stored event data:', error)
        }
      }
    }
  }, [])

  const setActiveEvent = (eventId: string | null, event: Event | null) => {
    setActiveEventId(eventId)
    setActiveEventData(event)

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      if (eventId && event) {
        localStorage.setItem(ACTIVE_EVENT_STORAGE_KEY, eventId)
        localStorage.setItem(ACTIVE_EVENT_DATA_STORAGE_KEY, JSON.stringify(event))
      } else {
        localStorage.removeItem(ACTIVE_EVENT_STORAGE_KEY)
        localStorage.removeItem(ACTIVE_EVENT_DATA_STORAGE_KEY)
      }
    }
  }

  const clearActiveEvent = () => {
    setActiveEvent(null, null)
  }

  return (
    <EventContext.Provider
      value={{
        activeEventId,
        activeEvent,
        setActiveEvent,
        clearActiveEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useActiveEvent() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useActiveEvent must be used within EventProvider')
  }
  return context
}
