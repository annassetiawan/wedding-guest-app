# QR Code Feature Documentation

## Overview
The QR Code feature allows event organizers to generate, view, download, and print QR codes for each guest. These QR codes can be used for check-in verification at the event.

## Features Implemented ✅

### 1. Auto-Generation on Guest Creation
- **Format:** `QR-{UUID-PREFIX}` (e.g., `QR-A1B2C3D4`)
- **When:** Automatically generated when a new guest is added
- **Storage:** Stored in `guests.qr_code` column in database
- **Implementation:** [src/lib/services/guests.ts](../src/lib/services/guests.ts#L57-L60)

```typescript
const guestId = crypto.randomUUID()
const qrCode = `QR-${guestId.substring(0, 8).toUpperCase()}`
```

### 2. QR Code Utilities
**File:** [src/lib/utils/qrcode.ts](../src/lib/utils/qrcode.ts)

#### Functions:
- `generateQRCodeDataURL(text, options)` - Generate QR code as data URL
- `downloadQRCode(text, filename)` - Download QR code as PNG file
- `generateQRCodeCanvas(text, canvas, options)` - Render to canvas element
- `generatePrintableQRCode(guestData)` - Generate high-quality printable QR

**Configuration:**
- Default size: 512x512 pixels (download: 1024x1024)
- Error correction level: 'M' (medium), 'H' (high for print)
- Margin: 2-4 modules
- Colors: Black on white

### 3. QR Code Dialog Component
**File:** [src/components/events/GuestQRDialog.tsx](../src/components/events/GuestQRDialog.tsx)

**Features:**
- Large, scannable QR code display (400x400px)
- Guest information (name, phone, category)
- QR code text with copy button
- Download as PNG
- Print functionality with formatted layout
- Error handling and loading states

**Actions:**
- **Copy Code:** Copy QR text to clipboard
- **Print:** Open print dialog with formatted QR + guest info
- **Download PNG:** Save QR code as high-resolution PNG

### 4. UI Integration
**File:** [src/app/events/[id]/page.tsx](../src/app/events/[id]/page.tsx)

**Guest Table Actions:**
- QR Code icon button added to each row
- Opens GuestQRDialog on click
- Located before Edit and Delete buttons

## User Flow

### Viewing a Guest's QR Code
1. Navigate to Event Detail page
2. Click the QR code icon in the guest table
3. QR code dialog opens with:
   - Guest name and category
   - Large QR code image
   - QR code text (e.g., `QR-A1B2C3D4`)

### Downloading QR Code
1. Open QR code dialog
2. Click "Download PNG" button
3. File saved as: `QR-{GuestName}-{QRCode}.png`

### Printing QR Code
1. Open QR code dialog
2. Click "Print" button
3. Print preview opens with:
   - Event name (if available)
   - Guest name
   - Category badge
   - Large QR code
   - QR code text

## Technical Details

### Dependencies
```json
{
  "qrcode": "^1.5.x",
  "@types/qrcode": "^1.5.x"
}
```

### QR Code Specifications
- **Format:** QR Code 2D barcode
- **Encoding:** UTF-8 text string
- **Size:** 512x512 (display), 1024x1024 (download)
- **Error Correction:**
  - Medium (M) for display and download
  - High (H) for printable versions
- **File Format:** PNG (for downloads)

### Database Schema
```sql
CREATE TABLE guests (
  qr_code TEXT NOT NULL,  -- Format: QR-{UUID}
  -- ... other fields
);
```

## Print Layout

The print function generates an HTML document with:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>QR Code - {Guest Name}</title>
    <style>
      /* Print-optimized CSS */
      /* Centered layout */
      /* Guest info styling */
    </style>
  </head>
  <body>
    <div class="container">
      <div class="event-name">{Event Name}</div>
      <h1>{Guest Name}</h1>
      <div class="info">
        <span class="badge">{Category}</span>
      </div>
      <img src="{QR Data URL}" alt="QR Code" />
      <div class="qr-text">{QR Code}</div>
    </div>
  </body>
</html>
```

## Error Handling

### QR Generation Errors
- Displays error icon with "Gagal memuat QR code" message
- Provides "Coba Lagi" (Try Again) button
- Logs error to console for debugging

### Download Errors
- Shows toast error: "Gagal mengunduh QR code"
- Prevents multiple simultaneous downloads (loading state)

### Copy to Clipboard Errors
- Shows toast error: "Gagal menyalin kode QR"
- Fallback for unsupported browsers

## Usage Examples

### Generate QR Code for Guest
```typescript
import { generateQRCodeDataURL } from '@/lib/utils/qrcode'

const qrDataUrl = await generateQRCodeDataURL('QR-A1B2C3D4', {
  width: 512,
  margin: 3,
  errorCorrectionLevel: 'H',
})
```

### Download QR Code
```typescript
import { downloadQRCode } from '@/lib/utils/qrcode'

await downloadQRCode('QR-A1B2C3D4', 'Guest-John-Doe-QR')
// Downloads as: Guest-John-Doe-QR.png
```

## Future Enhancements

### Bulk Operations (Planned)
- [ ] Bulk download all QR codes for an event
- [ ] Generate ZIP file with all guest QR codes
- [ ] Filename format: `{EventName}-QR-Codes.zip`
- [ ] Individual files: `{GuestName}-{QRCode}.png`

### Advanced Features (Future)
- [ ] Custom QR code colors (event branding)
- [ ] Logo/image in center of QR code
- [ ] Batch print all QR codes (printer-friendly layout)
- [ ] QR code templates (different designs)
- [ ] QR code with guest photo
- [ ] Email QR codes to guests

## Testing Checklist

- [x] QR code generates on guest creation
- [x] QR dialog opens when clicking QR icon
- [x] QR code displays correctly in dialog
- [x] Download button saves PNG file
- [x] Print button opens print dialog
- [x] Copy button copies to clipboard
- [x] Loading states work correctly
- [x] Error states display properly
- [x] QR code is scannable
- [x] Works on mobile devices
- [x] Works on different browsers

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note:** Clipboard API requires HTTPS in production.

## Troubleshooting

### QR Code Not Generating
1. Check browser console for errors
2. Verify `qrcode` library is installed
3. Check that `crypto.randomUUID()` is supported

### Download Not Working
1. Check popup blocker settings
2. Verify file download permissions
3. Check browser console for errors

### Print Not Working
1. Check if popup blocker is blocking print window
2. Verify browser print permissions
3. Try using keyboard shortcut (Ctrl+P / Cmd+P)

## Performance Considerations

- QR codes generated on-demand (not pre-rendered)
- Canvas rendering for optimal performance
- Data URLs for easy downloading
- No external API calls (all client-side)

## Security Notes

- QR codes stored in database as plain text
- No sensitive information encoded in QR
- QR code format predictable but UUID-based
- Recommend using check-in system to validate QR codes
- Consider adding timestamp or event-specific prefix for security

## Related Documentation

- [Guest List Management](../README.md#guest-list-management)
- [Database Schema](../SCHEMA-FIX-SUMMARY.md)
- [Development Status](../README.md#development-status)
