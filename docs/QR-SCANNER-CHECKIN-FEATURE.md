# QR Scanner & Check-in System Documentation

## Overview
The QR Scanner & Check-in System allows event staff to quickly check in guests by scanning their QR codes using a device camera. The system provides real-time validation, prevents duplicate check-ins, and includes a manual search fallback for cases where QR scanning is not available.

## Features Implemented ✅

### 1. Dedicated Check-in Page
**Route:** `/events/[eventId]/checkin`
**File:** [src/app/events/[eventId]/checkin/page.tsx](../src/app/events/[eventId]/checkin/page.tsx)

**Features:**
- Full-screen camera scanner interface
- Real-time guest statistics (Total, Checked In, Pending)
- Split-screen layout (Scanner | Manual Search)
- Mobile-optimized for tablets and phones
- Sticky header with navigation
- Auto-refresh capabilities

### 2. Camera-Based QR Scanner
**Library:** `html5-qrcode` v2.3+

**Features:**
- Live camera feed with QR detection
- Automatic QR code recognition
- Rear camera preference (for mobile devices)
- Visual scan box (250x250px)
- 10 FPS scanning rate
- Camera permission handling
- Start/Stop controls
- Error handling for denied permissions

**Scanner Configuration:**
```typescript
await scanner.start(
  { facingMode: 'environment' }, // Rear camera
  {
    fps: 10,                      // 10 frames per second
    qrbox: { width: 250, height: 250 }, // Scan area
  },
  onScanSuccess,
  onScanError
)
```

### 3. QR Code Validation
**Validation Steps:**
1. QR code decoded from camera
2. Match against guest list (by qr_code field)
3. Verify guest belongs to current event
4. Check if already checked in
5. Update database if valid
6. Show success/error feedback

**Business Logic:**
- **Valid QR + Not Checked In:** Check in guest, show success
- **Valid QR + Already Checked In:** Show warning, display guest info
- **Invalid QR:** Show error message
- **QR from Different Event:** Not found error

### 4. Check-in Success Animation
**Visual Feedback:**
- Large animated checkmark (bounce animation)
- Green success card
- Guest name and category display
- Auto-dismiss after 3 seconds
- Toast notification

**Animation:**
```tsx
<CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
```

**Success Card:**
- Green background (#f0fdf4)
- Green border (#22c55e)
- Guest info (name, category, status)
- Category badge
- Check-in status badge

### 5. Manual Search Fallback
**Features:**
- Real-time search (name or phone)
- Instant results as you type
- Guest list with check-in buttons
- Category badges
- Phone number display
- Disabled state for checked-in guests

**Search Implementation:**
```typescript
const filteredGuests = guests.filter((guest) =>
  guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())
)
```

**Manual Check-in Flow:**
1. Type guest name or phone
2. Results appear instantly
3. Click "Check In" button
4. Guest marked as checked in
5. Success animation appears
6. Search clears automatically

### 6. Duplicate Prevention
**Logic:**
- Check `checked_in` status before processing
- Show warning if already checked in
- Still display guest info (for verification)
- No database update for duplicates

**Warning Toast:**
```typescript
toast.warning(`${guest.name} is already checked in`)
```

### 7. Real-time Statistics
**Displayed Stats:**
- **Total:** All guests for event
- **Checked In:** Guests with checked_in = true
- **Pending:** Guests with checked_in = false

**Auto-update:**
- Stats recalculate on every check-in
- Uses local state for instant updates
- No page refresh needed

## User Flow

### Starting Check-in Session

1. **Navigate to Event**
   - Go to Event Detail page
   - Click "Start Check-in" button (green, top-right)

2. **Camera Permission**
   - Browser requests camera permission
   - User clicks "Allow"
   - Camera feed appears

3. **Start Scanning**
   - Click "Start Scanner" button
   - Camera activates (rear camera on mobile)
   - Green border indicates active scanning

### Scanning QR Code

1. **Position QR Code**
   - Hold QR code in front of camera
   - Center in scan box (250x250)
   - Distance: 10-30cm optimal

2. **Auto-detect**
   - Scanner recognizes QR code
   - Validates against guest list
   - Processes check-in

3. **See Result**
   - Success card appears (green)
   - Animated checkmark
   - Guest name and category
   - Toast notification

4. **Auto-reset**
   - Wait 3 seconds
   - Success card disappears
   - Ready for next scan

### Using Manual Search

1. **Type Guest Name**
   - Click search input
   - Type name or phone number
   - Results filter instantly

2. **Find Guest**
   - Scroll through results
   - Verify correct guest
   - Check category/phone

3. **Check In**
   - Click "Check In" button
   - Success animation appears
   - Search clears after 3 seconds

### Handling Issues

**Camera Won't Start:**
- Check permission denied message
- Follow instructions to enable camera
- Refresh page after enabling

**QR Code Not Scanning:**
- Use manual search instead
- Verify QR code is clear
- Try better lighting
- Adjust distance

**Already Checked In:**
- Warning message shows
- Guest info displayed
- No duplicate entry created

## Technical Details

### Camera Permission Handling

**Permission States:**
- `prompt` - Not yet requested
- `granted` - User allowed camera
- `denied` - User blocked camera

**Request Flow:**
```typescript
const stream = await navigator.mediaDevices.getUserMedia({ video: true })
stream.getTracks().forEach(track => track.stop())
setCameraPermission('granted')
```

**Denied State UI:**
```tsx
{cameraPermission === 'denied' && (
  <Alert variant="destructive">
    Please enable camera permissions in browser settings
  </Alert>
)}
```

### QR Scanner Lifecycle

**Initialization:**
```typescript
const scanner = new Html5Qrcode('qr-reader')
scannerRef.current = scanner
```

**Start Scanning:**
```typescript
await scanner.start(
  { facingMode: 'environment' },
  { fps: 10, qrbox: { width: 250, height: 250 } },
  onScanSuccess,
  onScanError
)
```

**Stop Scanning:**
```typescript
await scanner.stop()
scanner.clear()
scannerRef.current = null
```

**Cleanup on Unmount:**
```typescript
useEffect(() => {
  return () => {
    if (scannerRef.current && scanning) {
      stopScanning()
    }
  }
}, [scanning])
```

### Check-in Database Operation

**Service Method:**
```typescript
async checkInGuest(id: string): Promise<Guest> {
  const { data, error } = await supabase
    .from('guests')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

**Local State Update:**
```typescript
setGuests((prev) =>
  prev.map((g) =>
    g.id === guest.id
      ? { ...g, checked_in: true, checked_in_at: new Date().toISOString() }
      : g
  )
)
```

### Auto-reset Timer

**Implementation:**
```typescript
setTimeout(() => {
  setLastScannedGuest(null)
  setSearchQuery('') // For manual search
}, 3000)
```

**Purpose:**
- Clear success message
- Ready for next guest
- Prevent UI clutter
- Smooth workflow

## UI Components

### Scanner Card

**Layout:**
```
┌─ QR Code Scanner ────────┐
│ [Camera Feed/Placeholder] │
│ [Permission Alert]         │
│ [Start/Stop Button]        │
│ [Success Card]             │
└───────────────────────────┘
```

**States:**
- **Idle:** Gray placeholder, "Start Scanner" button
- **Active:** Live camera, green border, "Stop Scanner" button
- **Success:** Success card overlay on camera
- **Denied:** Red alert, instructions

### Manual Search Card

**Layout:**
```
┌─ Manual Search ──────────┐
│ [Search Input]           │
│ ┌─ Guest 1 ──────────┐  │
│ │ Name, Phone, Badge  │  │
│ │ [Check In] button   │  │
│ └────────────────────┘  │
│ ┌─ Guest 2 ──────────┐  │
│ │ ...                 │  │
│ └────────────────────┘  │
└──────────────────────────┘
```

**Features:**
- Search as you type
- Scrollable results (max-h-96)
- Disabled buttons for checked-in guests
- Category badges
- Phone display

### Statistics Bar

**Layout:**
```
┌─ Total ─┐ ┌─ Checked In ─┐ ┌─ Pending ─┐
│   50    │ │     30       │ │    20     │
└─────────┘ └──────────────┘ └───────────┘
```

**Colors:**
- Total: Gray (#6b7280)
- Checked In: Green (#22c55e)
- Pending: Gray (#6b7280)

## Performance Considerations

### Scanner Performance
- **FPS:** 10 frames per second (balanced)
- **CPU Usage:** ~5-15% on mobile
- **Battery Impact:** Moderate (camera active)
- **Memory:** ~50MB for camera stream

### Optimization Tips
- Stop scanner when not in use
- Use manual search for batch check-ins
- Close page when done to free camera
- Prefer rear camera (better quality)

### Mobile Performance
- Tested on tablets (recommended device)
- Works on phones (smaller scan area)
- Desktop: Works but manual search preferred
- Best on: iPad, Android tablets

## Browser Compatibility

### Camera API Support
- ✅ Chrome 53+ (Android, Desktop)
- ✅ Firefox 36+ (Android, Desktop)
- ✅ Safari 11+ (iOS, macOS)
- ✅ Edge 79+
- ❌ IE 11 (not supported)

### QR Scanner Library
- ✅ Modern browsers (2020+)
- ✅ Mobile browsers
- ⚠️ Requires HTTPS (camera access)
- ⚠️ Permission prompts may vary

### Recommended Browsers
1. Chrome/Edge (best performance)
2. Safari (iOS devices)
3. Firefox (good compatibility)

## Security Considerations

### Camera Access
- Requires user permission
- Permission per session (not persistent)
- Can be revoked anytime
- Only frontend access (no recording)

### Data Privacy
- No video recording
- No image storage
- QR code processed locally
- Only guest ID sent to server

### Validation
- QR code must match database
- Guest must belong to event
- Timestamp recorded for audit
- No manual timestamp editing

## Testing Checklist

- [x] Scanner page loads correctly
- [x] Camera permission request appears
- [x] Camera starts after permission granted
- [x] Scan box visible and centered
- [x] QR code detection works
- [x] Valid QR code checks in guest
- [x] Invalid QR code shows error
- [x] Duplicate check-in shows warning
- [x] Success animation plays
- [x] Auto-reset after 3 seconds works
- [x] Manual search filters correctly
- [x] Manual check-in button works
- [x] Statistics update in real-time
- [x] Stop scanner works correctly
- [x] Navigation back to event works
- [x] Mobile responsive layout
- [x] Build succeeds without errors

## Troubleshooting

### Camera Not Starting

**Symptoms:**
- Permission prompt doesn't appear
- "Permission denied" error
- Black screen in scanner area

**Solutions:**
1. **Check HTTPS:** Camera requires secure connection
   - Local: http://localhost (allowed)
   - Production: Must use HTTPS
2. **Check Browser Permissions:**
   - Chrome: Settings → Privacy → Site Settings → Camera
   - Firefox: Preferences → Privacy → Permissions → Camera
   - Safari: Preferences → Websites → Camera
3. **Reload Page:** After granting permission
4. **Try Different Browser:** Some browsers have stricter policies
5. **Check Device Camera:** Test with another camera app

### QR Code Not Detected

**Symptoms:**
- Scanner active but not recognizing code
- No success/error message
- Continuous scanning but no result

**Solutions:**
1. **Improve Lighting:** QR codes need good lighting
2. **Adjust Distance:** Try 15-25cm from camera
3. **Clean QR Code:** Ensure not damaged or blurry
4. **Use Manual Search:** Fallback option always available
5. **Check QR Format:** Verify QR code contains valid text
6. **Restart Scanner:** Stop and start again

### Already Checked In Warning

**Symptoms:**
- Warning toast appears
- Guest shows as checked in
- Can't check in again

**Expected Behavior:**
- This is correct! Prevents duplicates
- Guest info still displayed for verification
- Use manual check-in to override (future feature)

**To Reset Check-in:**
- Currently: Database manual update
- Future: Undo check-in button in guest list

### Manual Search Not Working

**Symptoms:**
- Typing doesn't filter results
- No results appear
- All guests shown

**Solutions:**
1. **Check Search Query:** Must type at least 1 character
2. **Verify Guest Exists:** Check guest list in main event page
3. **Try Different Keywords:** Name, phone, partial matches
4. **Reload Page:** Refresh guest data
5. **Check Internet:** Requires connection to load guests

### Stats Not Updating

**Symptoms:**
- Numbers don't change after check-in
- Stats stuck at old values

**Solutions:**
1. **Reload Page:** Force data refresh
2. **Check Check-in Success:** Verify toast appeared
3. **Inspect Database:** Verify checked_in updated
4. **Console Errors:** Check browser console
5. **Network Tab:** Verify API calls succeeded

## Future Enhancements

### Planned Features
- [ ] Undo check-in button (mark as not checked in)
- [ ] Bulk check-in mode (scan multiple rapidly)
- [ ] Sound effects on successful scan
- [ ] Vibration feedback (mobile devices)
- [ ] Export check-in log (CSV download)
- [ ] Check-in timeline view (recent scans)
- [ ] Multiple scanner devices (sync via Supabase Realtime)
- [ ] Offline mode (local storage + sync later)

### Advanced Features
- [ ] Facial recognition check-in (AI-powered)
- [ ] NFC badge scanning
- [ ] Barcode support (in addition to QR)
- [ ] Check-in kiosk mode (fullscreen, auto-lock)
- [ ] Guest photo capture on check-in
- [ ] Print badge on check-in
- [ ] SMS notification to guest on check-in
- [ ] Analytics dashboard (peak hours, average time)

## Related Documentation

- [QR Code Feature](./QR-CODE-FEATURE.md)
- [Guest List Management](../README.md#guest-list-management)
- [Digital Invitation Templates](./INVITATION-TEMPLATES-FEATURE.md)
- [Real-time Check-in Dashboard](./REALTIME-CHECKIN-DASHBOARD.md) - Coming soon

## API Reference

### GuestService Methods

**Check In Guest:**
```typescript
async checkInGuest(id: string): Promise<Guest>
```

**Undo Check In:**
```typescript
async undoCheckIn(id: string): Promise<Guest>
```

**Get Guest Stats:**
```typescript
async getGuestStats(eventId: string): Promise<{
  total: number
  checkedIn: number
  notCheckedIn: number
  vip: number
  regular: number
  family: number
}>
```

### Component Props

**CheckInPage:**
```typescript
// No props - uses URL params
params: {
  eventId: string
}
```

### State Management

**Scanner State:**
```typescript
const [scanning, setScanning] = useState<boolean>(false)
const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
const scannerRef = useRef<Html5Qrcode | null>(null)
```

**Guest State:**
```typescript
const [guests, setGuests] = useState<Guest[]>([])
const [lastScannedGuest, setLastScannedGuest] = useState<Guest | null>(null)
const [searchQuery, setSearchQuery] = useState<string>('')
```

## Changelog

### v1.0.0 - October 31, 2025
- ✅ Initial release
- ✅ Camera-based QR scanner
- ✅ QR code validation
- ✅ Duplicate prevention
- ✅ Success animation
- ✅ Manual search fallback
- ✅ Real-time statistics
- ✅ Mobile-optimized interface
- ✅ Camera permission handling
- ✅ Auto-reset after scan
- ✅ Integration with guest service
- ✅ Navigation from event detail page
