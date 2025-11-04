# Invitation Link Sharing Feature Documentation

## Overview
The Invitation Link Sharing feature allows event organizers to easily share personalized wedding invitations with guests via multiple channels. Each guest has a unique invitation URL that can be copied, shared via WhatsApp, or previewed directly from the guest management interface.

## Features Implemented ✅

### 1. Copy Invitation Link
**Location:** Guest List Table → Actions Column
**Button Icon:** Link2 (chain link icon)

**Features:**
- One-click copy to clipboard
- Success toast notification with guest name
- Error handling for clipboard failures
- Works on all modern browsers

**Functionality:**
```typescript
const handleCopyInvitationLink = (guest: Guest) => {
  const invitationUrl = `${window.location.origin}/invitation/${eventId}/${guest.id}`

  navigator.clipboard.writeText(invitationUrl).then(() => {
    toast.success(`Invitation link copied for ${guest.name}`)
  }).catch(() => {
    toast.error('Failed to copy link')
  })
}
```

**Use Cases:**
- Copy link to send via email
- Share in messaging apps
- Post on social media
- Send via SMS
- Add to event management tools

### 2. Share via WhatsApp
**Location:** Guest List Table → Actions Column
**Button Icon:** Share2 (green colored)

**Features:**
- Pre-filled WhatsApp message template
- Personalized with guest name
- Includes event details (couple names, date, venue)
- Opens WhatsApp Web (desktop) or WhatsApp App (mobile)
- Works without phone number (user chooses recipient)

**Message Template:**
```
Kepada Yth. [Guest Name],

Anda diundang ke acara pernikahan [Bride Name] & [Groom Name].

Tanggal: [Event Date]
Lokasi: [Venue]

Lihat undangan lengkap di:
[Invitation URL]
```

**Functionality:**
```typescript
const handleShareWhatsApp = (guest: Guest) => {
  const invitationUrl = `${window.location.origin}/invitation/${eventId}/${guest.id}`
  const message = `Kepada Yth. ${guest.name},\n\nAnda diundang ke acara pernikahan ${event.bride_name} & ${event.groom_name}.\n\nTanggal: ${formatDate(event.event_date)}\nLokasi: ${event.venue}\n\nLihat undangan lengkap di:\n${invitationUrl}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}
```

**Use Cases:**
- Quick sharing to individual guests
- Forward to family groups
- Send reminders before event
- Share updated invitation after changes

### 3. Preview Invitation
**Location:** Guest List Table → Actions Column
**Button Icon:** ExternalLink (blue colored)

**Features:**
- Opens invitation in new tab
- Shows exactly what guest will see
- No authentication required for preview
- Real-time preview with current data
- Test before sending to guests

**Functionality:**
```typescript
const handlePreviewInvitation = (guest: Guest) => {
  const invitationUrl = `/invitation/${eventId}/${guest.id}`
  window.open(invitationUrl, '_blank')
}
```

**Use Cases:**
- Verify invitation looks correct
- Test QR code functionality
- Check event details accuracy
- Screenshot for promotional materials
- Quality assurance before bulk sending

## User Interface

### Guest Table Actions Column

The actions column now contains 6 buttons (left to right):

1. **QR Code** (QrCode icon) - View/download QR code
2. **Copy Link** (Link2 icon) - Copy invitation URL
3. **WhatsApp** (Share2 icon, green) - Share via WhatsApp
4. **Preview** (ExternalLink icon, blue) - Open invitation
5. **Edit** (Edit icon) - Edit guest details
6. **Delete** (Trash2 icon, red) - Delete guest

**Layout:**
```tsx
<div className="flex justify-end gap-1">
  {/* All action buttons */}
</div>
```

**Button Styling:**
- Variant: ghost
- Size: icon
- Tooltip: title attribute on hover
- Colors: Green (WhatsApp), Blue (Preview), Red (Delete), Default (others)

## User Flow

### Copying Invitation Link

1. **Find Guest**
   - Navigate to Event Detail page
   - Go to Guest List tab
   - Locate guest in table

2. **Copy Link**
   - Click Link2 icon button
   - Toast notification appears: "Invitation link copied for [Guest Name]"
   - Link now in clipboard

3. **Share Link**
   - Paste link anywhere (email, SMS, messenger)
   - Link format: `https://yourdomain.com/invitation/[eventId]/[guestId]`
   - Guest clicks link to view invitation

### Sharing via WhatsApp

1. **Find Guest**
   - Navigate to Event Detail page
   - Go to Guest List tab
   - Locate guest in table

2. **Click WhatsApp Button**
   - Click green Share2 icon
   - WhatsApp opens in new window
   - Message pre-filled with template

3. **Select Recipient**
   - Search for contact or group
   - Review message
   - Send message

4. **Guest Receives**
   - Opens WhatsApp
   - Sees invitation message
   - Clicks link to view full invitation

### Previewing Invitation

1. **Find Guest**
   - Navigate to Event Detail page
   - Go to Guest List tab
   - Locate guest in table

2. **Click Preview Button**
   - Click blue ExternalLink icon
   - New tab opens with invitation
   - See full invitation as guest would

3. **Review Invitation**
   - Check all details correct
   - Test QR code display
   - Verify buttons work
   - Close tab when done

## Technical Details

### Invitation URL Format

**Pattern:** `/invitation/[eventId]/[guestId]`

**Example:** `/invitation/abc123-def456/xyz789-uvw012`

**Components:**
- `eventId` - UUID of the event
- `guestId` - UUID of the guest

**Security:**
- Both IDs are UUIDs (hard to guess)
- Public access by design (no auth required)
- Validated against database
- Guest must belong to event (verified server-side)

### Clipboard API

**Browser Support:**
- Chrome/Edge: 63+
- Firefox: 53+
- Safari: 13.1+
- Opera: 50+

**Implementation:**
```typescript
navigator.clipboard.writeText(url)
  .then(() => toast.success('Copied!'))
  .catch(() => toast.error('Failed to copy'))
```

**Fallback:**
If clipboard API fails:
- Error toast shown
- User can manually copy from browser address bar
- Or use WhatsApp share instead

### WhatsApp URL Scheme

**Format:** `https://wa.me/?text=[encoded-message]`

**Encoding:**
- Uses `encodeURIComponent()` for message
- Preserves line breaks (`\n`)
- Special characters properly escaped
- URL-safe format

**Behavior:**
- Desktop: Opens WhatsApp Web
- Mobile: Opens WhatsApp App
- No phone number: User selects recipient
- With phone: `https://wa.me/[phone]?text=[message]`

**Limitations:**
- Message length: ~65,000 characters (WhatsApp limit)
- Internet connection required
- WhatsApp must be installed (mobile)

### Window.open() Security

**Configuration:**
```typescript
window.open(url, '_blank')
```

**Target:** `_blank` - Opens in new tab/window

**Security Considerations:**
- Popup blockers may block (user must allow)
- HTTPS required for secure origin
- Same-origin policy applies
- No sensitive data in URL

## Toast Notifications

### Success Messages
- **Copy Link:** "Invitation link copied for [Guest Name]"
- Format: Green checkmark icon
- Duration: 3 seconds (Sonner default)

### Error Messages
- **Copy Failed:** "Failed to copy link"
- Format: Red X icon
- Duration: 4 seconds

### Display Position
- Bottom center (Sonner default)
- Stack multiple toasts
- Auto-dismiss after duration
- Click to dismiss manually

## Performance Considerations

### Clipboard Operations
- Instant (< 10ms)
- Synchronous operation
- No server request
- No network latency

### WhatsApp Opens
- Opens immediately
- No loading time
- Browser handles redirect
- May trigger popup blocker

### Preview Opens
- Opens in ~100-300ms
- Fetches data from Supabase
- Generates QR code client-side
- Same performance as normal invitation load

### UI Responsiveness
- All buttons respond instantly
- No loading states needed
- Toast appears immediately
- No blocking operations

## Browser Compatibility

### Clipboard API
- ✅ Chrome 63+
- ✅ Firefox 53+
- ✅ Safari 13.1+
- ✅ Edge 79+
- ✅ Opera 50+
- ❌ IE 11 (not supported)

### WhatsApp URL Scheme
- ✅ All modern browsers
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Desktop browsers
- Works on any device with WhatsApp

### Window.open()
- ✅ All browsers (universal support)
- May be blocked by popup blockers
- User can allow in browser settings

## Security Considerations

### Public URLs
- Invitation URLs are public by design
- Anyone with link can view invitation
- UUIDs provide security through obscurity
- No sensitive data in URL
- Server validates guest belongs to event

### Clipboard Access
- Requires user gesture (click)
- No automatic clipboard access
- User aware of action (button click)
- Toast confirms action

### WhatsApp Integration
- No API key required
- No data sent to WhatsApp servers
- Uses standard URL scheme
- User controls message sending
- Can edit message before sending

### Preview Window
- Opens in new tab (isolated)
- No access to parent window data
- Standard browser security applies
- Same-origin policy enforced

## Testing Checklist

- [x] Copy link button displays correctly
- [x] Copy link copies correct URL format
- [x] Success toast shows with guest name
- [x] Error toast shows on clipboard failure
- [x] WhatsApp button displays with green color
- [x] WhatsApp opens with pre-filled message
- [x] Message includes guest name
- [x] Message includes event details
- [x] Message includes invitation URL
- [x] Preview button displays with blue color
- [x] Preview opens in new tab
- [x] Preview shows correct guest invitation
- [x] All buttons respond to clicks
- [x] Tooltips show on hover
- [x] Actions column layout not broken
- [x] Mobile responsive (buttons still accessible)
- [x] Build succeeds without errors

## Future Enhancements

### Planned Features
- [ ] Bulk copy all links (export as text file)
- [ ] Copy link with custom message template
- [ ] Email share button (mailto: link)
- [ ] SMS share button (sms: link)
- [ ] QR code for invitation link (scan to share)
- [ ] Link shortener integration (bit.ly, tinyurl)
- [ ] Click tracking (how many people opened invitation)
- [ ] Share analytics (which channel performed best)

### Advanced Features
- [ ] Schedule message sending (future date/time)
- [ ] Bulk WhatsApp sending (via API)
- [ ] Custom message templates per category
- [ ] Multi-language message templates
- [ ] Attachment support (PDF invitation)
- [ ] RSVP tracking from shares
- [ ] Reminder automation (send X days before event)
- [ ] Integration with email marketing tools

## Troubleshooting

### Copy Link Not Working

**Symptoms:**
- Click copy button, nothing happens
- No toast notification appears
- Console error about clipboard

**Solutions:**
1. Check browser supports Clipboard API (Chrome 63+)
2. Ensure site uses HTTPS (required for clipboard)
3. Check browser permissions for clipboard access
4. Try manual copy from preview URL
5. Use WhatsApp share as alternative

**Browser Permissions:**
- Chrome: Settings → Privacy → Site Settings → Clipboard
- Firefox: about:config → dom.events.asyncClipboard.clipboardItem
- Safari: Preferences → Websites → Clipboard

### WhatsApp Not Opening

**Symptoms:**
- Click WhatsApp button, popup blocked
- WhatsApp doesn't open
- Blank page appears

**Solutions:**
1. Allow popups for this site in browser settings
2. Check WhatsApp is installed (mobile)
3. Try opening WhatsApp manually first
4. Check internet connection
5. Try incognito/private mode

**Popup Blocker:**
- Chrome: Click popup blocked icon in address bar
- Firefox: Click "Preferences" in notification bar
- Safari: Settings → Websites → Pop-up Windows

### Preview Not Opening

**Symptoms:**
- Click preview button, nothing happens
- New tab opens but shows error
- Invitation not found message

**Solutions:**
1. Check popup blocker settings (same as WhatsApp)
2. Verify guest exists in database
3. Check event exists and guest belongs to event
4. Try refreshing guest list
5. Check browser console for errors

### Message Template Not Formatted

**Symptoms:**
- WhatsApp message appears on one line
- Line breaks not working
- Message looks jumbled

**Root Cause:**
- Different WhatsApp versions handle `\n` differently
- Some platforms strip line breaks
- URL encoding may affect formatting

**Workaround:**
- Message still readable, just not formatted
- Guest can still click link
- Consider using shorter message
- Add spaces or dashes as separators

## Related Documentation

- [Digital Invitation Templates](./INVITATION-TEMPLATES-FEATURE.md)
- [Guest List Management](../README.md#guest-list-management)
- [QR Code Feature](./QR-CODE-FEATURE.md)
- [CSV Import Feature](./CSV-IMPORT-FEATURE.md)

## API Reference

### Button Components

**Copy Link Button:**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleCopyInvitationLink(guest)}
  title="Copy Invitation Link"
>
  <Link2 className="h-4 w-4" />
</Button>
```

**WhatsApp Share Button:**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleShareWhatsApp(guest)}
  title="Share via WhatsApp"
>
  <Share2 className="h-4 w-4 text-green-600" />
</Button>
```

**Preview Invitation Button:**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => handlePreviewInvitation(guest)}
  title="Preview Invitation"
>
  <ExternalLink className="h-4 w-4 text-blue-600" />
</Button>
```

### Handler Functions

**Copy Link Handler:**
```typescript
const handleCopyInvitationLink = (guest: Guest) => {
  const invitationUrl = `${window.location.origin}/invitation/${eventId}/${guest.id}`

  navigator.clipboard.writeText(invitationUrl)
    .then(() => toast.success(`Invitation link copied for ${guest.name}`))
    .catch(() => toast.error('Failed to copy link'))
}
```

**WhatsApp Share Handler:**
```typescript
const handleShareWhatsApp = (guest: Guest) => {
  if (!event) return

  const invitationUrl = `${window.location.origin}/invitation/${eventId}/${guest.id}`
  const message = `Kepada Yth. ${guest.name},\n\nAnda diundang ke acara pernikahan ${event.bride_name} & ${event.groom_name}.\n\nTanggal: ${formatDate(event.event_date)}\nLokasi: ${event.venue}\n\nLihat undangan lengkap di:\n${invitationUrl}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}
```

**Preview Handler:**
```typescript
const handlePreviewInvitation = (guest: Guest) => {
  const invitationUrl = `/invitation/${eventId}/${guest.id}`
  window.open(invitationUrl, '_blank')
}
```

## Changelog

### v1.0.0 - October 31, 2025
- ✅ Initial release
- ✅ Copy invitation link to clipboard
- ✅ Share via WhatsApp with template
- ✅ Preview invitation in new tab
- ✅ Toast notifications for user feedback
- ✅ Mobile-responsive button layout
- ✅ Color-coded action buttons
- ✅ Comprehensive error handling
