# API Reference - Service Methods

Quick reference guide for using the event and guest service methods.

## Event Service

Import: `import { eventService } from '@/lib/services/events'`

### Get All Events
```typescript
const events = await eventService.getEvents()
// Returns: Event[]
```

### Get Events with Statistics
```typescript
const eventsWithStats = await eventService.getEventsWithStats()
// Returns: EventWithStats[]
// Each event includes: guest_count, confirmed_count, pending_count, declined_count
```

### Get Single Event
```typescript
const event = await eventService.getEventById(eventId)
// Returns: Event | null
```

### Create Event
```typescript
const newEvent = await eventService.createEvent({
  name: 'Sarah & John Wedding',
  event_date: '2024-12-25',
  venue: 'Grand Ballroom',
  bride_name: 'Sarah',
  groom_name: 'John',
  template: 'Modern', // or 'Elegant'
  photo_url: 'https://...', // optional
})
// Returns: Event
```

### Update Event
```typescript
const updatedEvent = await eventService.updateEvent(eventId, {
  name: 'Updated Name',
  venue: 'New Venue',
  // Any partial fields...
})
// Returns: Event
```

### Delete Event
```typescript
await eventService.deleteEvent(eventId)
// Returns: void
// Note: This will also delete all guests (CASCADE)
```

---

## Guest Service

Import: `import { guestService } from '@/lib/services/guests'`

### Get All Guests for Event
```typescript
const guests = await guestService.getGuestsByEventId(eventId)
// Returns: Guest[]
```

### Get Single Guest
```typescript
const guest = await guestService.getGuestById(guestId)
// Returns: Guest | null
```

### Create Guest
```typescript
const newGuest = await guestService.createGuest({
  event_id: eventId,
  name: 'Alice Johnson',
  phone: '+1234567890',
  category: 'VIP', // or 'Regular', 'Family'
  status: 'pending', // or 'confirmed', 'declined'
})
// Returns: Guest
```

### Update Guest
```typescript
const updatedGuest = await guestService.updateGuest(guestId, {
  name: 'Updated Name',
  status: 'confirmed',
  // Any partial fields...
})
// Returns: Guest
```

### Delete Guest
```typescript
await guestService.deleteGuest(guestId)
// Returns: void
```

### Check-in Guest
```typescript
const checkedInGuest = await guestService.checkInGuest(guestId)
// Returns: Guest (with checked_in=true and checked_in_at timestamp)
```

### Undo Check-in
```typescript
const guest = await guestService.undoCheckIn(guestId)
// Returns: Guest (with checked_in=false and checked_in_at=null)
```

### Update Guest Status
```typescript
const guest = await guestService.updateGuestStatus(guestId, 'confirmed')
// Status options: 'pending', 'confirmed', 'declined'
// Returns: Guest
```

### Search Guests
```typescript
const results = await guestService.searchGuests(eventId, 'Alice')
// Searches in both name and phone fields
// Returns: Guest[]
```

### Filter by Category
```typescript
const vipGuests = await guestService.filterGuestsByCategory(eventId, 'VIP')
// Category options: 'VIP', 'Regular', 'Family'
// Returns: Guest[]
```

### Filter by Status
```typescript
const confirmedGuests = await guestService.filterGuestsByStatus(eventId, 'confirmed')
// Status options: 'pending', 'confirmed', 'declined'
// Returns: Guest[]
```

### Get Guest Statistics
```typescript
const stats = await guestService.getGuestStats(eventId)
// Returns: {
//   total: number,
//   confirmed: number,
//   pending: number,
//   declined: number,
//   checkedIn: number,
//   vip: number,
//   regular: number,
//   family: number
// }
```

---

## Usage Examples

### Example 1: Create Event and Add Guests

```typescript
'use client'

import { useState } from 'react'
import { eventService } from '@/lib/services/events'
import { guestService } from '@/lib/services/guests'
import toast from 'react-hot-toast'

export default function CreateEventExample() {
  const [loading, setLoading] = useState(false)

  const handleCreateEvent = async () => {
    setLoading(true)
    try {
      // 1. Create event
      const event = await eventService.createEvent({
        name: 'My Wedding',
        event_date: '2024-12-25',
        venue: 'Grand Hotel',
        bride_name: 'Jane',
        groom_name: 'John',
        template: 'Modern',
      })

      // 2. Add guests
      await guestService.createGuest({
        event_id: event.id,
        name: 'Alice',
        phone: '+1234567890',
        category: 'VIP',
        status: 'pending',
      })

      toast.success('Event and guest created!')
    } catch (error) {
      toast.error('Error creating event')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return <button onClick={handleCreateEvent}>Create Event</button>
}
```

### Example 2: Load and Display Events

```typescript
'use client'

import { useEffect, useState } from 'react'
import { eventService } from '@/lib/services/events'
import { EventWithStats } from '@/types/database.types'

export default function EventsList() {
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await eventService.getEventsWithStats()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.name}</h3>
          <p>Guests: {event.guest_count}</p>
          <p>Confirmed: {event.confirmed_count}</p>
        </div>
      ))}
    </div>
  )
}
```

### Example 3: Guest Management with Search

```typescript
'use client'

import { useEffect, useState } from 'react'
import { guestService } from '@/lib/services/guests'
import { Guest } from '@/types/database.types'

export default function GuestsList({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadGuests()
  }, [eventId])

  const loadGuests = async () => {
    const data = await guestService.getGuestsByEventId(eventId)
    setGuests(data)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await guestService.searchGuests(eventId, query)
      setGuests(results)
    } else {
      loadGuests()
    }
  }

  const handleCheckIn = async (guestId: string) => {
    await guestService.checkInGuest(guestId)
    loadGuests() // Refresh list
  }

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search guests..."
      />

      {guests.map((guest) => (
        <div key={guest.id}>
          <span>{guest.name}</span>
          <span>{guest.status}</span>
          <button onClick={() => handleCheckIn(guest.id)}>
            Check In
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Example 4: Filter Guests by Category

```typescript
'use client'

import { useState } from 'react'
import { guestService } from '@/lib/services/guests'
import { Guest, GuestCategory } from '@/types/database.types'

export default function GuestsFilter({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [category, setCategory] = useState<GuestCategory | 'all'>('all')

  const handleFilterChange = async (cat: GuestCategory | 'all') => {
    setCategory(cat)

    if (cat === 'all') {
      const data = await guestService.getGuestsByEventId(eventId)
      setGuests(data)
    } else {
      const data = await guestService.filterGuestsByCategory(eventId, cat)
      setGuests(data)
    }
  }

  return (
    <div>
      <select value={category} onChange={(e) => handleFilterChange(e.target.value as any)}>
        <option value="all">All Guests</option>
        <option value="VIP">VIP</option>
        <option value="Regular">Regular</option>
        <option value="Family">Family</option>
      </select>

      {guests.map((guest) => (
        <div key={guest.id}>{guest.name} - {guest.category}</div>
      ))}
    </div>
  )
}
```

---

## Error Handling

All service methods throw errors that should be caught:

```typescript
try {
  const event = await eventService.createEvent(data)
  toast.success('Success!')
} catch (error: any) {
  toast.error(error.message || 'An error occurred')
  console.error('Error:', error)
}
```

---

## TypeScript Types

All types are defined in `src/types/database.types.ts`:

```typescript
import {
  Event,
  EventWithStats,
  Guest,
  GuestCategory,
  GuestStatus,
  EventTemplate,
} from '@/types/database.types'
```

### Available Types:
- `Event` - Basic event data
- `EventWithStats` - Event with guest count statistics
- `Guest` - Guest data
- `GuestCategory` - 'VIP' | 'Regular' | 'Family'
- `GuestStatus` - 'pending' | 'confirmed' | 'declined'
- `EventTemplate` - 'Modern' | 'Elegant'

---

## Best Practices

1. **Always use try-catch** when calling service methods
2. **Show loading states** during async operations
3. **Display toast notifications** for success/error feedback
4. **Refresh data** after mutations (create/update/delete)
5. **Validate data** before sending to service methods
6. **Use TypeScript types** for type safety

---

## Supabase Client Usage

Services use the browser client from `@/lib/supabase/client`.

For server components, use:
```typescript
import { createClient } from '@/lib/supabase/server'

// In async server component:
const supabase = await createClient()
```

For client components (already handled in services):
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

---

## Row Level Security (RLS)

All database operations are protected by RLS policies:
- Users can only access their own events
- Users can only access guests from their own events
- Authentication is required for all operations

RLS is automatically enforced by Supabase - no additional code needed!
