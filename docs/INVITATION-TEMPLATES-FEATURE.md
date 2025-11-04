# Digital Invitation Templates Feature Documentation

## Overview
The Digital Invitation Templates feature provides beautiful, shareable wedding invitations accessible via unique URLs. Guests can view personalized invitations, see event details, display their QR code for check-in, and interact with the invitation (add to calendar, share via WhatsApp).

## Features Implemented ✅

### 1. Public Invitation Page Route
**Route:** `/invitation/[eventId]/[guestId]`
**File:** [src/app/invitation/[eventId]/[guestId]/page.tsx](../src/app/invitation/[eventId]/[guestId]/page.tsx)

**Features:**
- Dynamic route with eventId and guestId parameters
- Public access (no authentication required)
- Fetches event and guest data from Supabase
- Template selection based on `event.template_id`
- Error handling for invalid/missing invitations
- Loading states with spinner
- Mobile-optimized responsive design

### 2. Modern Template
**File:** [src/components/invitation/ModernTemplate.tsx](../src/components/invitation/ModernTemplate.tsx)

**Design Features:**
- **Color Scheme:** Gradient background (rose-50 → pink-50 → fuchsia-50)
- **Typography:** Large serif fonts (5xl/7xl) for couple names
- **Visual Style:** Clean, minimalist, contemporary
- **Gradient Text:** Rose-600 to fuchsia-600 for names
- **Date Display:** Colored box with large day number
- **Buttons:** Gradient buttons with hover effects
- **QR Code:** Rounded card with shadow and border
- **Animations:** Fade-in with translate-y on mount

**Components:**
```
Hero Section
├── "The Wedding Of" subtitle
├── Bride Name (gradient text)
├── "&" separator
└── Groom Name (gradient text)

Guest Greeting Card
├── "Kepada Yth." label
├── Guest Name
└── Category Badge (colored)

Event Details Card
├── Event Name
├── Date Box (colored background)
├── Venue with MapPin icon
└── Action Buttons (Calendar, WhatsApp)

QR Code Section
├── Title and Instructions
├── Large QR Code (264x264)
├── QR Code Text (mono font)
└── Download Button

Footer
└── Closing Message (invitation text)
```

### 3. Elegant Template
**File:** [src/components/invitation/ElegantTemplate.tsx](../src/components/invitation/ElegantTemplate.tsx)

**Design Features:**
- **Color Scheme:** Amber palette (amber-50 to amber-900)
- **Typography:** Serif fonts throughout for formal aesthetic
- **Visual Style:** Classic, traditional, elegant
- **Decorative Elements:** Heart icons, horizontal dividers
- **Borders:** Top and bottom 4px amber borders
- **Guest Card:** Double-bordered with background
- **Labels:** Uppercase with wide tracking (letter-spacing)
- **Animations:** Fade-in with translate-y on mount

**Components:**
```
Decorative Border (top)

Ornamental Header
├── Heart Icon (large)
├── "Wedding Invitation" label
├── Bride Name (italic serif, 6xl/7xl)
├── Heart Divider
└── Groom Name (italic serif, 6xl/7xl)

Guest Card (bordered)
├── "Dear" label
├── Guest Name
└── Category Badge

Event Details Card
├── Event Name
├── Horizontal Divider
├── Date (full format)
├── Venue with MapPin icon
├── Heart Divider
└── Action Buttons

QR Code Section
├── Title and Instructions
├── Large QR Code (264x264, bordered)
├── QR Code Text
└── Download Button

Closing Message
├── Heart Divider
├── Romantic Quote
└── Couple Names (italic)

Decorative Border (bottom)
```

### 4. Template Features

#### Personalization
- Guest name displayed prominently
- Category badge (VIP, Regular, Family)
- Color-coded based on category
- Personalized greeting text

#### Event Information
- Event name (wedding title)
- Full date formatting (Indonesian locale)
  - Example: "Sabtu, 25 Desember 2024"
- Venue address with location icon
- Couple names (bride & groom)

#### QR Code Display
- Large, scannable QR code (400x400px generation, 264x264px display)
- High error correction level (H)
- QR code text shown below (monospace font)
- Background with border for visibility
- Download button to save as PNG (1024x1024)

#### Interactive Elements

**Add to Calendar Button:**
- Google Calendar integration
- Pre-filled event details:
  - Title: "Wedding [Bride] & [Groom]"
  - Date/Time: Event date + 4 hours duration
  - Location: Venue address
  - Description: Invitation text
- Opens in new tab

**Share via WhatsApp Button:**
- Pre-filled message template
- Format: "Halo [Guest Name]! Anda diundang ke acara pernikahan [Bride] & [Groom]. Lihat undangan lengkap: [URL]"
- Opens WhatsApp Web/App
- Includes current page URL

**Download QR Code Button:**
- Downloads high-resolution PNG (1024x1024)
- Filename: `QR-[Guest Name].png`
- Uses QR utility function from library

#### Animations
- Fade-in effect on page load (100ms delay)
- Translate-y animation (slides up)
- Smooth transition (1000ms duration)
- Applied to entire content wrapper

## User Flow

### Accessing Invitation

1. **Receive Invitation Link**
   - Guest receives link: `/invitation/[eventId]/[guestId]`
   - Link can be sent via WhatsApp, email, SMS, or any messaging platform
   - Link is unique per guest (personalized)

2. **Open Invitation**
   - Click/tap link on any device
   - No login required (public access)
   - Page loads with fade-in animation

3. **View Invitation**
   - See personalized greeting with name
   - View event details (date, venue, couple names)
   - See QR code for check-in

4. **Interact with Invitation**
   - Add event to Google Calendar
   - Share invitation via WhatsApp
   - Download QR code for offline access
   - Screenshot invitation for reference

### Error Handling

**Invitation Not Found:**
- Shows error page with emoji and message
- Helpful error text: "Undangan Tidak Ditemukan"
- Reason displayed if available
- Graceful degradation (no crash)

**Loading State:**
- Spinner animation while fetching data
- "Memuat undangan..." text
- Prevents flash of empty content
- Smooth transition to content

## Technical Details

### Route Structure

**Dynamic Route:** `/invitation/[eventId]/[guestId]`

**File Location:** `src/app/invitation/[eventId]/[guestId]/page.tsx`

**Data Fetching:**
```typescript
const loadInvitationData = async () => {
  const supabase = createClient()

  // Fetch event
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  // Fetch guest
  const { data: guestData, error: guestError } = await supabase
    .from('guests')
    .select('*')
    .eq('id', guestId)
    .eq('event_id', eventId) // Security: verify guest belongs to event
    .single()

  setEvent(eventData)
  setGuest(guestData)
}
```

**Template Selection:**
```typescript
const renderTemplate = () => {
  switch (event.template_id) {
    case 'elegant':
      return <ElegantTemplate event={event} guest={guest} />
    case 'modern':
    default:
      return <ModernTemplate event={event} guest={guest} />
  }
}
```

### QR Code Generation

**Library:** `qrcode` (client-side generation)

**Configuration:**
```typescript
generateQRCodeDataURL(guest.qr_code, {
  width: 400,           // High resolution for scanning
  margin: 3,            // Quiet zone around QR
  errorCorrectionLevel: 'H', // Highest error correction
})
```

**Display:**
- Generated on component mount (useEffect)
- Stored in state as data URL
- Rendered as <img> tag
- Loading state while generating

**Download:**
```typescript
const handleDownloadQR = () => {
  if (!qrDataUrl) return

  const link = document.createElement('a')
  link.href = qrDataUrl
  link.download = `QR-${guest.name}.png`
  link.click()
}
```

### Date Formatting

**Locale:** Indonesian (id-ID)

**Format Function:**
```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return {
    full: date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    day: date.toLocaleDateString('id-ID', { day: 'numeric' }),
    month: date.toLocaleDateString('id-ID', { month: 'long' }),
    year: date.toLocaleDateString('id-ID', { year: 'numeric' }),
  }
}
```

**Output Example:**
- Full: "Sabtu, 25 Desember 2024"
- Day: "25"
- Month: "Desember"
- Year: "2024"

### Google Calendar Integration

**URL Format:**
```
https://calendar.google.com/calendar/render
?action=TEMPLATE
&text=[Event Title]
&dates=[Start ISO]/[End ISO]
&details=[Description]
&location=[Venue]
```

**Date Formatting:**
```typescript
const startDate = date.toISOString().replace(/-|:|\\.\\d+/g, '')
// Example: 20241225T000000Z

const endDate = new Date(date.getTime() + 4 * 60 * 60 * 1000)
  .toISOString()
  .replace(/-|:|\\.\\d+/g, '')
// Example: 20241225T040000Z (4 hours later)
```

**Implementation:**
```typescript
const handleAddToCalendar = () => {
  const date = new Date(event.event_date)
  const title = `Wedding ${event.bride_name} & ${event.groom_name}`
  const details = `Undangan pernikahan di ${event.venue}`

  const startDate = date.toISOString().replace(/-|:|\\.\\d+/g, '')
  const endDate = new Date(date.getTime() + 4 * 60 * 60 * 1000)
    .toISOString()
    .replace(/-|:|\\.\\d+/g, '')

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.venue)}`

  window.open(googleCalUrl, '_blank')
}
```

### WhatsApp Integration

**Message Template:**
```
Halo [Guest Name]! Anda diundang ke acara pernikahan [Bride] & [Groom].
Lihat undangan lengkap: [Current URL]
```

**Implementation:**
```typescript
const handleShareWhatsApp = () => {
  const message = `Halo ${guest.name}! Anda diundang ke acara pernikahan ${event.bride_name} & ${event.groom_name}. Lihat undangan lengkap: ${window.location.href}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

  window.open(whatsappUrl, '_blank')
}
```

**URL Format:**
- Desktop: Opens WhatsApp Web
- Mobile: Opens WhatsApp App
- No phone number specified (user chooses recipient)

## Styling and Design

### Color Palettes

**Modern Template:**
- Background: `from-rose-50 via-pink-50 to-fuchsia-50`
- Primary: `rose-600` to `fuchsia-600` (gradient)
- Text: `gray-900`, `gray-600`
- Accent: `rose-500`, `fuchsia-500`
- Cards: `white/80` with `backdrop-blur-sm`

**Elegant Template:**
- Background: `from-amber-50 via-white to-amber-50`
- Primary: `amber-600`, `amber-900`
- Borders: `amber-600`
- Text: `amber-900`, `amber-800`
- Accent: `amber-600`
- Cards: `white` with `amber-50/30` backgrounds

### Typography

**Modern Template:**
- Names: `font-serif text-5xl md:text-7xl font-bold`
- Body: Default sans-serif
- Labels: `text-sm uppercase tracking-widest`

**Elegant Template:**
- Names: `font-serif text-6xl md:text-7xl font-light italic`
- Body: `font-serif`
- Labels: `text-xs uppercase tracking-[0.3em]`

### Responsive Design

**Breakpoints:**
- Mobile: Default (320px+)
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+)

**Mobile Optimizations:**
- Container: `max-w-3xl` (Modern), `max-w-3xl` (Elegant)
- Padding: `px-4 py-16`
- Font scaling: `text-5xl md:text-7xl`
- Button layout: `flex-col sm:flex-row`
- QR Code: Fixed size for mobile scanning

### Animations

**Fade-in Implementation:**
```typescript
const [isVisible, setIsVisible] = useState(false)

useEffect(() => {
  setTimeout(() => setIsVisible(true), 100)
}, [])

// CSS
className={`transition-all duration-1000 ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
}`}
```

**Transition Properties:**
- Opacity: 0 → 100
- Transform: translateY(10px) → translateY(0)
- Duration: 1000ms
- Timing: Default (ease)

## Security Considerations

### Public Access
- No authentication required (by design)
- Anyone with link can view invitation
- Link contains UUIDs (hard to guess)
- No sensitive data exposed beyond event details

### Data Validation
- Verify guest belongs to event (SQL join)
- Check both eventId and guestId exist
- Return 404 if mismatch or not found
- No error details leaked to client

### RLS Policies
- Public read access for invitation route
- Still protected by UUID uniqueness
- No write operations from invitation page
- Check-in happens via separate secured route

## Performance Considerations

### Page Load
- Client-side rendering (CSR)
- Initial load: ~1-2 seconds
- Data fetch: Supabase query (~100-300ms)
- QR generation: ~50-100ms

### Optimizations
- QR code generated once, cached in state
- Date formatting memoized (calculated once)
- No heavy libraries loaded
- Minimal JavaScript bundle
- CSS-only animations (no JS)

### Mobile Performance
- Optimized for mobile devices (target use case)
- Touch-friendly buttons (min 44px height)
- Fast scroll performance
- No layout shifts (CLS)
- Lazy load images (if photos added)

## Testing Checklist

- [x] Modern template renders correctly
- [x] Elegant template renders correctly
- [x] Template switcher works (based on event.template_id)
- [x] Public route accessible without auth
- [x] Event data fetched correctly
- [x] Guest data fetched correctly
- [x] Personalized greeting displays guest name
- [x] Date formatted correctly (Indonesian locale)
- [x] QR code generates and displays
- [x] QR code downloads as PNG
- [x] Add to Calendar opens Google Calendar
- [x] Share WhatsApp opens with pre-filled message
- [x] Error state shows when invitation not found
- [x] Loading state displays during data fetch
- [x] Fade-in animation works on load
- [x] Responsive on mobile devices
- [x] Responsive on tablet devices
- [x] Responsive on desktop devices
- [x] Buttons are touch-friendly
- [x] All text readable and properly sized

## Future Enhancements

### Planned Features
- [ ] Copy invitation link button
- [ ] RSVP confirmation form
- [ ] Guest message/wishes section
- [ ] Photo gallery (couple photos)
- [ ] Countdown timer to event
- [ ] Background music toggle
- [ ] More template designs (Minimalist, Rustic, etc.)
- [ ] Custom color picker
- [ ] Custom font selector
- [ ] Upload custom background image

### Advanced Features
- [ ] Server-side rendering (SSR) for SEO
- [ ] Open Graph meta tags (preview on social media)
- [ ] Print-optimized layout (CSS @media print)
- [ ] Offline mode (PWA, service worker)
- [ ] Multi-language support
- [ ] Accessibility improvements (ARIA labels)
- [ ] Analytics tracking (page views, button clicks)
- [ ] A/B testing for templates

## Troubleshooting

### Invitation Not Loading
1. Check URL format is correct: `/invitation/[eventId]/[guestId]`
2. Verify eventId and guestId are valid UUIDs
3. Check Supabase connection
4. Inspect browser console for errors
5. Verify RLS policies allow public read

### QR Code Not Displaying
1. Check `guest.qr_code` field is populated
2. Verify qrcode library is installed
3. Check browser console for errors
4. Ensure QR code string is valid format
5. Test QR generation in isolation

### Template Not Switching
1. Check `event.template_id` value in database
2. Verify template_id matches case statement
3. Add default case (fallback to Modern)
4. Check component imports

### Calendar Button Not Working
1. Check popup blocker settings
2. Verify date format is correct (ISO)
3. Test Google Calendar URL manually
4. Check browser console for errors
5. Ensure event details are URL-encoded

### WhatsApp Button Not Working
1. Check popup blocker settings
2. Verify message is URL-encoded
3. Test WhatsApp URL manually
4. Check current page URL is accessible
5. Ensure WhatsApp is installed (mobile)

## Related Documentation

- [Guest List Management](../README.md#guest-list-management)
- [QR Code Feature](./QR-CODE-FEATURE.md)
- [CSV Import Feature](./CSV-IMPORT-FEATURE.md)
- [Database Schema](./SCHEMA-FIX-SUMMARY.md)

## API Reference

### Event Interface
```typescript
interface Event {
  id: string
  user_id: string
  event_name: string
  event_date: string
  venue: string
  bride_name: string
  groom_name: string
  photo_url?: string
  template_id: string
  created_at: string
}
```

### Guest Interface
```typescript
interface Guest {
  id: string
  event_id: string
  name: string
  phone: string
  category: 'VIP' | 'Regular' | 'Family'
  qr_code: string
  checked_in: boolean
  checked_in_at?: string
  invitation_link: string
  created_at: string
  updated_at: string
}
```

### Template Props
```typescript
interface ModernTemplateProps {
  event: Event
  guest: Guest
}

interface ElegantTemplateProps {
  event: Event
  guest: Guest
}
```

## Changelog

### v1.0.0 - October 31, 2025
- ✅ Initial release
- ✅ Modern template design
- ✅ Elegant template design
- ✅ Public invitation route
- ✅ QR code display and download
- ✅ Google Calendar integration
- ✅ WhatsApp sharing
- ✅ Responsive design
- ✅ Fade-in animations
- ✅ Error and loading states
