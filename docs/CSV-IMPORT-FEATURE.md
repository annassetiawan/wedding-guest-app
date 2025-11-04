# CSV Import Feature Documentation

## Overview
The CSV Import feature allows event organizers to bulk upload multiple guests at once using a CSV (Comma-Separated Values) file. This significantly speeds up the guest list setup process compared to adding guests one by one.

## Features Implemented ✅

### 1. Import Dialog Component
**File:** [src/components/events/ImportGuestsDialog.tsx](../src/components/events/ImportGuestsDialog.tsx)

**Features:**
- File upload with click-to-select interface
- CSV template download with sample data
- Real-time CSV parsing and validation
- Preview table showing all parsed data
- Summary statistics (Total/Valid/Error counts)
- Progress indicator during import
- Comprehensive error reporting
- Reset functionality

### 2. CSV Template Download
**Template Format:**
```csv
name,phone,category
John Doe,08123456789,VIP
Jane Smith,08198765432,Regular
Ahmad Family,08177778888,Family
```

**Download Trigger:**
- Click "Download Template" button in import dialog
- File saved as: `template-import-tamu.csv`
- Includes header row and 3 sample entries

### 3. CSV Validation

#### Required Fields
- **name** - Minimum 2 characters
- **category** - Must be one of: VIP, Regular, Family

#### Optional Fields
- **phone** - No validation applied

#### Validation Rules
1. **Name Validation:**
   - Required field
   - Minimum 2 characters
   - Whitespace trimmed
   - Error: "Nama minimal 2 karakter"

2. **Category Validation:**
   - Required field
   - Must match exactly: VIP, Regular, or Family (case-sensitive)
   - Error: "Kategori harus: VIP, Regular, Family"

3. **Phone Validation:**
   - Optional field
   - No format validation
   - Empty values allowed

### 4. Import Process

**Step 1: File Selection**
- User clicks "Pilih file CSV" upload button
- Accepts only `.csv` files
- Displays selected filename

**Step 2: Parsing & Validation**
- CSV parsed using PapaParse library
- Headers normalized (lowercase, trimmed)
- Each row validated against rules
- Results shown in preview table

**Step 3: Preview**
- Summary cards show:
  - Total Baris (rows)
  - Valid (valid rows)
  - Error (rows with errors)
- Preview table displays:
  - Row number (from CSV)
  - Name, Phone, Category
  - Status (Valid ✓ or Error ✗)
- Error details listed below table

**Step 4: Import**
- Click "Import {count} Tamu" button
- Only valid rows imported
- Progress bar shows percentage
- Each guest gets auto-generated QR code and invitation link
- Success/error counts shown after completion

### 5. UI Integration
**Location:** Event Detail Page → Guest List Tab
**Button:** "Import CSV" (outline variant, next to "Add Guest")

## User Flow

### Importing Guests from CSV

1. **Open Import Dialog**
   - Navigate to Event Detail page
   - Click "Import CSV" button in toolbar

2. **Download Template (Optional)**
   - Click "Download Template"
   - Open template in Excel/Google Sheets
   - Fill in guest data

3. **Upload CSV File**
   - Click "Pilih file CSV" button
   - Select CSV file from computer
   - Wait for parsing to complete

4. **Review Preview**
   - Check summary cards (Total/Valid/Error)
   - Review preview table
   - Check for validation errors

5. **Fix Errors (If Any)**
   - Click "Reset" to clear
   - Fix errors in CSV file
   - Re-upload corrected file

6. **Import**
   - Click "Import {count} Tamu"
   - Watch progress indicator
   - Wait for completion
   - Success notification shows imported count

## Technical Details

### Dependencies
```json
{
  "papaparse": "^5.4.x",
  "@types/papaparse": "^5.3.x"
}
```

### CSV Parsing Configuration
```typescript
Papa.parse<CSVRow>(file, {
  header: true,              // First row is header
  skipEmptyLines: true,      // Ignore empty rows
  transformHeader: (header) => header.toLowerCase().trim(),
  complete: (results) => {
    // Handle parsed data
  },
  error: (error) => {
    // Handle parsing errors
  },
})
```

### Validation Logic
```typescript
interface ParsedGuest {
  name: string
  phone: string
  category: string
  valid: boolean           // True if passes all validations
  errors: string[]         // Array of error messages
  rowNumber: number        // Row number in CSV (for display)
}

const VALID_CATEGORIES: GuestCategory[] = ['VIP', 'Regular', 'Family']

// Validation checks:
// 1. Name: !name || name.trim().length < 2
// 2. Category: !category || !VALID_CATEGORIES.includes(category)
```

### Import Algorithm
```typescript
async handleImport() {
  const validGuests = parsedGuests.filter(g => g.valid)

  for (let i = 0; i < validGuests.length; i++) {
    try {
      await guestService.createGuest({
        event_id: eventId,
        name: guest.name,
        phone: guest.phone,
        category: guest.category,
      })
      successCount++
    } catch (error) {
      errorCount++
    }

    // Update progress: (i + 1) / total * 100
    setImportProgress(Math.round(((i + 1) / validGuests.length) * 100))
  }
}
```

**Note:** Guests are imported sequentially (one-by-one) to ensure:
- Accurate progress tracking
- Proper QR code generation for each guest
- Individual error handling
- Database constraint validation

### Auto-Generated Fields
For each imported guest:
- **qr_code** - Format: `QR-{UUID}` (e.g., `QR-A1B2C3D4`)
- **invitation_link** - Format: `/invitation/{eventId}/{guestId}`
- **checked_in** - Default: `false`
- **checked_in_at** - Default: `null`

## CSV Template Specifications

### File Requirements
- **Format:** CSV (Comma-Separated Values)
- **Extension:** `.csv`
- **Encoding:** UTF-8 recommended
- **Delimiter:** Comma (`,`)
- **Header:** Required (first row)

### Column Definitions

| Column | Required | Type | Validation | Example |
|--------|----------|------|------------|---------|
| name | Yes | String | Min 2 chars | John Doe |
| phone | No | String | None | 08123456789 |
| category | Yes | Enum | VIP, Regular, Family | VIP |

### Example CSV File
```csv
name,phone,category
John Doe,08123456789,VIP
Jane Smith,08198765432,Regular
Ahmad Family,08177778888,Family
Bob Builder,,Regular
Alice Wonder,08155554444,Family
```

### Common Errors and Fixes

**Error: "Kategori harus: VIP, Regular, Family"**
- Fix: Use exact category names (case-sensitive)
- ✅ Correct: `VIP`, `Regular`, `Family`
- ❌ Wrong: `vip`, `REGULAR`, `family`, `Normal`

**Error: "Nama minimal 2 karakter"**
- Fix: Ensure name has at least 2 characters
- ✅ Correct: `Jo`, `John Doe`, `A B`
- ❌ Wrong: `J`, ` ` (empty/whitespace)

**Error: "Kategori wajib diisi"**
- Fix: Add category value to CSV
- ✅ Correct: `John,08123,VIP`
- ❌ Wrong: `John,08123,` (missing category)

## Error Handling

### File Upload Errors
- **Invalid File Type:**
  - Message: "File harus berformat CSV"
  - Check: File extension must be `.csv`

### CSV Parsing Errors
- **Parse Failure:**
  - Message: "Gagal membaca file CSV"
  - Causes: Invalid CSV format, encoding issues
  - Solution: Check file format, try re-exporting

### Validation Errors
- **Row-Level Errors:**
  - Displayed in preview table with error icon
  - Listed in error alert with row numbers
  - Only valid rows are imported

### Import Errors
- **Single Guest Failure:**
  - Continues with remaining guests
  - Error count incremented
  - Final notification shows success/error counts

- **Network/Database Errors:**
  - Import stops
  - Error toast shown
  - Progress reset

## UI Components

### Import Button
```tsx
<Button variant="outline" onClick={() => setImportDialogOpen(true)}>
  <Upload className="w-4 h-4 mr-2" />
  Import CSV
</Button>
```

### Summary Cards
- **Blue Card:** Total Baris
- **Green Card:** Valid (ready to import)
- **Red Card:** Error (will be skipped)

### Preview Table
- Row number (from CSV, accounting for header)
- Guest name (bold)
- Phone number (or "-" if empty)
- Category badge (color-coded)
- Status icon (✓ valid, ✗ error)

### Progress Indicator
- Horizontal progress bar
- Percentage display (0-100%)
- Updates in real-time during import

## Performance Considerations

### File Size Limits
- **Recommended:** Up to 500 rows
- **Maximum:** No hard limit, but performance may degrade
- **Memory:** Entire file loaded into memory for parsing

### Import Speed
- **Rate:** ~1-2 guests per second
- **100 guests:** ~1-2 minutes
- **500 guests:** ~5-10 minutes

**Note:** Sequential import ensures data integrity but is slower than batch insert. Future optimization could use batch inserts with proper transaction handling.

### Browser Compatibility
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ Large files (>1000 rows) may be slow on mobile

## Security Considerations

### Client-Side Validation
- All validation happens in browser
- Malicious data could be submitted
- Server-side validation in place (RLS policies)

### File Upload Security
- Only CSV files accepted (extension check)
- No file content executed
- Parsed as plain text data

### Data Sanitization
- Names and phones trimmed (whitespace removed)
- No HTML/script injection possible
- Database constraints enforced

## Future Enhancements

### Planned Features
- [ ] Batch insert for faster imports (100+ guests)
- [ ] Duplicate detection (check existing guests)
- [ ] Column mapping (flexible header names)
- [ ] Excel file support (.xlsx)
- [ ] Drag-and-drop file upload
- [ ] Import history/logs
- [ ] Undo import functionality
- [ ] Validation preview before upload

### Advanced Features
- [ ] Custom field mapping
- [ ] Data transformation rules
- [ ] Import scheduling (future date)
- [ ] Multi-file import
- [ ] Cloud storage integration (Google Drive, Dropbox)

## Troubleshooting

### Import Not Working
1. Check CSV file format (must have header row)
2. Verify column names are exact: `name,phone,category`
3. Ensure category values are: VIP, Regular, or Family
4. Check browser console for errors
5. Try downloading template and re-creating CSV

### Some Guests Not Imported
1. Check preview table for error icons
2. Read error messages in alert below table
3. Fix errors in CSV file
4. Click "Reset" and re-upload

### Progress Stuck
1. Check browser console for errors
2. Verify internet connection
3. Close dialog and try again
4. Check Supabase connection

### Template Not Downloading
1. Check popup blocker settings
2. Verify browser download permissions
3. Try different browser

## Testing Checklist

- [x] Template download works
- [x] CSV file upload works
- [x] Invalid file type rejected
- [x] CSV parsing works correctly
- [x] Validation rules enforce correctly
- [x] Preview table displays all data
- [x] Summary cards show correct counts
- [x] Error messages display properly
- [x] Valid guests import successfully
- [x] QR codes auto-generated
- [x] Invitation links auto-generated
- [x] Progress bar updates
- [x] Success notification shows
- [x] Reset functionality works
- [x] Dialog closes after import
- [x] Guest list refreshes

## Related Documentation

- [Guest List Management](../README.md#guest-list-management)
- [QR Code Feature](./QR-CODE-FEATURE.md)
- [Database Schema](../SCHEMA-FIX-SUMMARY.md)
