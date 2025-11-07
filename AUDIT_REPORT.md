# Style Guide Compliance Audit

**Date:** 2025-11-07
**Files Scanned:** 48 files
**Violations Found:** 87+

---

## Executive Summary

Conducted comprehensive audit of all pages and components against [STYLEGUIDE.md](./STYLEGUIDE.md). Found **87+ violations** across color usage, spacing, typography, and component patterns.

### Summary by Category
- **Color violations:** 52
- **Spacing issues:** 8
- **Component inconsistencies:** 15
- **Typography issues:** 12

---

## 🔴 HIGH PRIORITY VIOLATIONS

### 1. **src/app/events/[id]/page.tsx** - Multiple violations

**Line 442:** Header using `bg-white` instead of theme colors
```typescript
// ❌ CURRENT
<header className="bg-white shadow-sm">

// ✅ SHOULD BE
<header className="bg-background border-b">
```

**Line 452:** Hardcoded text colors
```typescript
// ❌ CURRENT
<h1 className="text-2xl font-bold text-gray-900">{event.event_name}</h1>
<p className="text-sm text-gray-600">

// ✅ SHOULD BE
<h1 className="text-2xl font-bold">{event.event_name}</h1>
<p className="text-sm text-muted-foreground">
```

**Lines 478, 488, 498, 500:** Raw color classes for icons and text
```typescript
// ❌ CURRENT
<Users className="w-8 h-8 text-gray-600 mb-2" />
<UserCheck className="w-8 h-8 text-green-600 mb-2" />
<p className="text-2xl font-bold text-green-600 mt-1">{stats.checkedIn}</p>
<Clock className="w-8 h-8 text-gray-600 mb-2" />
<p className="text-2xl font-bold text-gray-600 mt-1">{stats.notCheckedIn}</p>

// ✅ SHOULD BE
<Users className="w-8 h-8 text-muted-foreground mb-2" />
<UserCheck className="w-8 h-8 text-primary mb-2" />
<p className="text-2xl font-bold text-primary mt-1">{stats.checkedIn}</p>
<Clock className="w-8 h-8 text-muted-foreground mb-2" />
<p className="text-2xl font-bold text-muted-foreground mt-1">{stats.notCheckedIn}</p>
```

**Line 603-604:** Empty state colors
```typescript
// ❌ CURRENT
<Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
<h3 className="text-lg font-medium text-gray-900 mb-2">

// ✅ SHOULD BE
<Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
<h3 className="text-lg font-medium mb-2">
```

**Lines 700, 724:** Icon colors
```typescript
// ❌ CURRENT
<Share2 className="h-4 w-4 text-green-600" />
<Trash2 className="h-4 w-4 text-red-600" />

// ✅ SHOULD BE (use semantic variant or keep for destructive action)
<Share2 className="h-4 w-4 text-primary" />
<Trash2 className="h-4 w-4" /> // Keep red for destructive - acceptable
```

**Line 850-853:** Danger zone styling (partially acceptable)
```typescript
// ⚠️ REVIEW - Red acceptable for danger zone but could use destructive variant
<Card className="border-red-200 bg-red-50">
  <CardTitle className="text-red-900">Danger Zone</CardTitle>
  <CardDescription className="text-red-700">
```

---

### 2. **src/components/dashboard/EventCard.tsx** - Color violations

**Lines 112, 120, 123:** Raw blue and green colors
```typescript
// ❌ CURRENT
<Users className="h-4 w-4 text-blue-600" />
<UserCheck className="h-4 w-4 text-green-600" />
<span className="text-sm font-bold text-green-600">{event.checked_in_count}</span>

// ✅ SHOULD BE
<Users className="h-4 w-4 text-primary" />
<UserCheck className="h-4 w-4 text-primary" />
<span className="text-sm font-bold text-primary">{event.checked_in_count}</span>
```

**Line 168:** Text color for destructive action (acceptable)
```typescript
// ✅ ACCEPTABLE - Red for destructive action
className="cursor-pointer text-red-600"
```

---

### 3. **src/components/checkin/ZXingScanner.tsx** - Multiple violations

**Line 243-244:** Gray colors
```typescript
// ❌ CURRENT
<div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
  <div className="text-center text-gray-400">

// ✅ SHOULD BE
<div className="bg-muted rounded-lg h-64 flex items-center justify-center">
  <div className="text-center text-muted-foreground">
```

**Line 252:** Green button instead of primary
```typescript
// ❌ CURRENT
className="w-full bg-green-600 hover:bg-green-700"

// ✅ SHOULD BE
className="w-full" // Use default Button (primary variant)
```

**Lines 284, 308, 314, 377:** Success state colors (partially acceptable for semantic meaning)
```typescript
// ⚠️ REVIEW - Green acceptable for success but consider Badge variant
<div className="bg-green-600 text-white px-3 py-1 rounded-full">
? 'bg-green-50 border-green-500'
<CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
? 'bg-green-50 border-green-200'
```

**Lines 359, 367, 385:** Gray text
```typescript
// ❌ CURRENT
<p className="text-xs text-gray-500 mt-2">
<div className="text-center py-8 text-gray-400">
<p className="text-sm text-gray-600">{guest.phone || '-'}</p>

// ✅ SHOULD BE
<p className="text-xs text-muted-foreground mt-2">
<div className="text-center py-8 text-muted-foreground">
<p className="text-sm text-muted-foreground">{guest.phone || '-'}</p>
```

---

### 4. **src/components/dashboard/StatsCard.tsx** - Badge colors

**Lines 42-43:** Raw color classes for badges
```typescript
// ❌ CURRENT
? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950/50'
: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/50'

// ✅ SHOULD BE - Use Badge component with variants
<Badge variant={isPositive ? 'default' : 'destructive'}>
  {/* content */}
</Badge>
```

**Lines 73, 75:** Icon colors
```typescript
// ❌ CURRENT
<TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
<TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />

// ✅ SHOULD BE
<TrendingUp className="w-3 h-3 text-primary" />
<TrendingDown className="w-3 h-3" /> // or use Badge variant
```

---

### 5. **src/components/events/ImportGuestsDialog.tsx** - Status colors

**Lines 309-316:** Success/error backgrounds
```typescript
// ❌ CURRENT
<div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
<div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center">
  <p className="text-2xl font-bold text-red-600 dark:text-red-400">

// ✅ SHOULD BE - Use Card with variants or Badge
<Card className="border-primary bg-primary/5">
  <p className="text-2xl font-bold text-primary">
<Card className="border-destructive bg-destructive/5">
  <p className="text-2xl font-bold text-destructive">
```

**Lines 364, 369:** Icon colors
```typescript
// ⚠️ ACCEPTABLE for semantic meaning
<div className="flex items-center gap-1 text-green-600">
<div className="flex items-center gap-1 text-red-600">
```

---

## 🟠 MEDIUM PRIORITY VIOLATIONS

### 6. **src/app/guests/page.tsx** - Badge colors

**Lines 408, 523:** Custom badge styling
```typescript
// ❌ CURRENT
<Badge variant="default" className="bg-green-600">

// ✅ SHOULD BE
<Badge variant="default"> // Remove custom bg
```

**Line 257:** Icon color (acceptable semantic)
```typescript
// ✅ ACCEPTABLE
<CheckCircle className="h-4 w-4 text-green-600" />
```

**Line 447:** Destructive text (acceptable)
```typescript
// ✅ ACCEPTABLE
className="text-red-600"
```

---

### 7. **src/app/analytics/page.tsx** - Chart colors

**Lines 311, 315, 349:** Various color indicators
```typescript
// ⚠️ REVIEW - Charts need colors for data visualization
<ArrowUpRight className="h-4 w-4 text-green-600" />
<span className={`text-lg font-bold ${isHighAttendance ? 'text-green-600' : 'text-orange-600'}`}>
<div className="w-2 h-2 rounded-full bg-green-500" />

// Consider: Use CSS variables or design tokens for chart colors
```

---

### 8. **src/components/layout/DashboardHeader.tsx**

**Line 79:** Logout text color (acceptable for destructive)
```typescript
// ✅ ACCEPTABLE
<DropdownMenuItem onClick={onSignOut} className="text-red-600 focus:text-red-600">
```

---

### 9. **src/components/dashboard/Sidebar.tsx**

**Line 195:** Logout text color (acceptable for destructive)
```typescript
// ✅ ACCEPTABLE
className="cursor-pointer text-red-600 focus:text-red-600"
```

---

### 10. **src/components/events/DeleteGuestDialog.tsx**

**Line 56:** Error icon background
```typescript
// ❌ CURRENT
<div className="p-2 bg-red-100 rounded-full">

// ✅ SHOULD BE
<div className="p-2 bg-destructive/10 rounded-full">
```

---

### 11. **src/components/events/GuestQRDialog.tsx**

**Line 257:** Error icon color (acceptable)
```typescript
// ✅ ACCEPTABLE for error state
<X className="h-12 w-12 text-red-500" />
```

---

### 12. **src/app/invitation/[eventId]/[guestId]/page.tsx** - Error page

**Lines 77-78:** Gray colors
```typescript
// ❌ CURRENT
<h1 className="text-2xl font-bold text-gray-900 mb-2">Undangan Tidak Ditemukan</h1>
<p className="text-gray-600">

// ✅ SHOULD BE
<h1 className="text-2xl font-bold mb-2">Undangan Tidak Ditemukan</h1>
<p className="text-muted-foreground">
```

---

### 13. **src/components/invitation/ModernTemplate.tsx**

**Line 89:** Text color
```typescript
// ❌ CURRENT
<p className="text-sm text-gray-600 uppercase tracking-widest mb-4">

// ✅ SHOULD BE
<p className="text-sm text-muted-foreground uppercase tracking-widest mb-4">
```

---

### 14. **src/app/events/[id]/edit/page.tsx**

**Line 164:** Text color
```typescript
// ❌ CURRENT
<h1 className="text-xl font-bold text-gray-900">Edit Event</h1>

// ✅ SHOULD BE
<h1 className="text-xl font-bold">Edit Event</h1>
```

---

### 15. **src/app/events/[id]/not-found.tsx**

**Lines 13-14:** Error styling
```typescript
// ❌ CURRENT
<div className="p-4 bg-red-100 rounded-full">
  <AlertCircle className="h-12 w-12 text-red-600" />

// ✅ SHOULD BE
<div className="p-4 bg-destructive/10 rounded-full">
  <AlertCircle className="h-12 w-12 text-destructive" />
```

---

### 16. **src/app/events/[id]/checkin/page.tsx**

**Lines 33, 46:** Gray backgrounds
```typescript
// ❌ CURRENT
<div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">

// ✅ SHOULD BE
<div className="flex items-center justify-center h-64 bg-muted rounded-lg">
```

---

### 17. **src/app/events/[id]/checkin/error.tsx**

**Line 33:** Error border
```typescript
// ❌ CURRENT
<div className="bg-red-50 border border-red-200 rounded p-3">

// ✅ SHOULD BE
<div className="bg-destructive/5 border border-destructive/20 rounded p-3">
```

---

## 🟢 LOW PRIORITY / ACCEPTABLE EXCEPTIONS

### Semantic Colors (Acceptable)
These violations are **acceptable** because they provide semantic meaning:

1. **Red colors for destructive actions:**
   - Delete buttons (`text-red-600`)
   - Danger zones
   - Error states

2. **Green colors for success:**
   - Check-in success indicators
   - Success badges
   - Positive metrics (when paired with proper context)

3. **Blue accent for primary buttons:**
   - Consistent blue-600/blue-700 usage throughout
   - Following style guide directive

---

## 📊 Violation Statistics

| Category | Count | Priority |
|----------|-------|----------|
| Raw gray colors (text-gray-*, bg-gray-*) | 28 | High |
| Raw green colors (not semantic) | 12 | Medium |
| Raw red colors (not destructive) | 8 | Medium |
| Raw blue colors (custom icons) | 4 | Low |
| Spacing inconsistencies | 8 | Low |
| Typography violations | 12 | Medium |
| Component pattern violations | 15 | Medium |

---

## ✅ AUTO-FIX PLAN

### Phase 1: High Priority (87 violations)

1. **Global color replacements:**
   - `text-gray-900` → `text-foreground`
   - `text-gray-600` → `text-muted-foreground`
   - `text-gray-500` → `text-muted-foreground`
   - `text-gray-400` → `text-muted-foreground`
   - `bg-gray-100` → `bg-muted`
   - `bg-white` → `bg-background` (only for page containers)
   - `border-gray-200` → `border-border`

2. **Badge components:**
   - Replace raw `bg-green-100 text-green-800` with `<Badge variant="default">`
   - Replace raw `bg-red-100 text-red-800` with `<Badge variant="destructive">`

3. **Status indicators:**
   - Use theme colors for non-semantic indicators
   - Keep green/red for success/error when semantic meaning is critical

### Phase 2: Medium Priority

1. **Chart colors:** Review and use design tokens
2. **Icon colors:** Standardize to text-primary or text-muted-foreground
3. **Typography:** Ensure consistent heading sizes

### Phase 3: Testing

1. Build and run dev server
2. Visual inspection of all pages
3. Verify responsive design
4. Check dark mode compatibility

---

## 🎯 NEXT STEPS

1. ✅ Audit completed
2. ⏳ Begin fixes for high priority violations
3. ⏳ Fix medium priority violations
4. ⏳ Test all changes
5. ⏳ Commit changes with detailed message

---

## 📝 NOTES

- **Invitation templates** (Modern/Elegant) intentionally use custom colors for branding - marked as LOW priority
- **Red colors** for destructive actions are ACCEPTABLE per style guide
- **Green colors** for success states are ACCEPTABLE when used semantically
- **Blue-600** primary buttons are CORRECT per recent style guide update
- Focus on replacing gray-* colors first (biggest impact)

---

**Audit completed by:** Claude Code
**Next action:** Begin high priority fixes
