# WeddingGuest - Style Guide

**Design System:** Shadcn/ui + Tailwind CSS
**Theme:** Zinc (Professional SaaS)
**Last Updated:** November 2025

---

## 🌓 Theming

**App supports Light/Dark/System themes using next-themes.**

### Theme Toggle

The app includes a theme toggle component accessible from:
- **Sidebar** - Theme toggle button below navigation
- **Programmatic access** - Via `useTheme` hook

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

// Use the theme toggle component
<ThemeToggle />
```

### Programmatic Theme Change

```tsx
import { useTheme } from "next-themes"

const { theme, setTheme } = useTheme()

setTheme("dark")   // Force dark mode
setTheme("light")  // Force light mode
setTheme("system") // Follow system preference
```

### Theme Provider

The app is wrapped with `ThemeProvider` in the root layout:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### Color Variables

All colors automatically adapt to the active theme. The app uses oklch color space for better color consistency across light and dark modes.

**IMPORTANT:** Always use CSS variables - NEVER hardcode colors!

```typescript
// ✅ Correct - Colors adapt to theme
bg-background       // White in light, dark in dark
text-foreground     // Dark in light, light in dark
bg-muted           // Light gray in light, dark gray in dark
text-muted-foreground  // Gray in both modes

// ❌ Wrong - Fixed colors break theme switching
bg-white, bg-gray-900, text-black, text-gray-100
```

---

## 🎨 Colors

**Always use Shadcn theme tokens:**

```typescript
// ✅ Correct - Use theme colors
bg-background       // Main background
bg-card            // Card backgrounds
bg-muted           // Subtle backgrounds
bg-primary         // Primary actions
text-foreground    // Main text
text-muted-foreground  // Secondary text
border-border      // All borders

// ✅ Semantic colors (allowed)
text-blue-600      // Information/primary actions
bg-blue-600        // Primary buttons
text-green-600     // Success states
text-red-600       // Error/destructive actions
text-orange-600    // Warning states

// ❌ Wrong - Never use raw colors
bg-pink-500, bg-purple-600, from-blue-500 to-cyan-500
text-indigo-400, bg-violet-500, bg-fuchsia-600
```

**Button Colors:**
```typescript
// Primary action buttons
className="bg-blue-600 hover:bg-blue-700 text-white"

// Success buttons
className="bg-green-600 hover:bg-green-700 text-white"

// Destructive buttons
<Button variant="destructive">Delete</Button>
```

---

## 📝 Typography

```typescript
// Headings
H1: "text-3xl font-bold tracking-tight"
H2: "text-2xl font-bold tracking-tight"
H3: "text-xl font-semibold"
H4: "text-lg font-semibold"

// Body text
Body: "text-base text-foreground"
Secondary: "text-sm text-muted-foreground"
Small: "text-xs text-muted-foreground"

// Labels
Label: "text-sm font-medium"
Strong Label: "text-base font-semibold"
```

**Examples:**
```tsx
<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
<p className="text-muted-foreground mt-1">Welcome back</p>
<label className="text-base font-semibold">Email Address</label>
```

---

## 📏 Spacing

```typescript
// Container padding
Page Container: "p-6"
Mobile: "p-4"
Card: "p-6"

// Gaps
Grid: "gap-4"
Flex: "gap-2" or "gap-3"
Section: "space-y-6"
Form Fields: "space-y-4"

// Margins
Bottom: "mb-4" or "mb-6"
Top: "mt-1" or "mt-2"
Between sections: "my-8"
```

---

## 🎯 Component Patterns

### Buttons

```tsx
// Primary action
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  <Plus className="w-4 h-4 mr-2" />
  Create New
</Button>

// Secondary action
<Button variant="outline">
  Cancel
</Button>

// Ghost button
<Button variant="ghost">
  <Edit className="w-4 h-4 mr-2" />
  Edit
</Button>

// Destructive action
<Button variant="destructive">
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</Button>

// Icon only
<Button variant="ghost" size="icon">
  <MoreVertical className="w-4 h-4" />
</Button>
```

### Cards

```tsx
// Standard card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Stats card
<Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
  <CardContent className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <Calendar className="w-5 h-5 text-blue-600" />
      </div>
      <Badge variant="secondary">+12%</Badge>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">Total Events</p>
      <p className="text-3xl font-bold tracking-tight">1,234</p>
    </div>
    <p className="text-xs text-muted-foreground mt-2">
      Pertumbuhan stabil
    </p>
  </CardContent>
</Card>

// Event card with stats
<Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md border-border">
  <div className="absolute top-4 right-4 z-10">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
      <Calendar className="w-5 h-5 text-foreground" />
    </div>
  </div>

  <CardHeader className="pb-3">
    <h3 className="text-xl font-bold text-foreground truncate">Event Name</h3>
    <p className="text-sm text-muted-foreground">Subtitle</p>
  </CardHeader>

  <CardContent className="space-y-4">
    <Badge variant="default">Status</Badge>
    {/* Content */}
  </CardContent>

  <CardFooter className="bg-muted/30 border-t pt-4 pb-4 gap-2">
    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
      Action
    </Button>
  </CardFooter>
</Card>
```

### Forms

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    {/* Text input */}
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold">
            Name
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Enter name"
              className="h-11"
              {...field}
            />
          </FormControl>
          <FormDescription>
            This is your display name
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Section divider */}
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-sm font-medium text-muted-foreground">
        Section Title
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>

    {/* Select */}
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Form actions */}
    <div className="flex items-center justify-end gap-3 pt-6 border-t">
      <Button type="button" variant="outline" size="lg">
        Cancel
      </Button>
      <Button
        type="submit"
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Submit
      </Button>
    </div>
  </form>
</Form>
```

### Tables

```tsx
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <TableRow key={item.id}>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {item.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.email}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="secondary">{item.status}</Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Badges

```tsx
// Status badges
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Inactive</Badge>
<Badge variant="destructive">Error</Badge>

// With icon
<Badge variant="outline" className="gap-1">
  <TrendingUp className="w-3 h-3" />
  High Attendance
</Badge>
```

### Dialogs

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleDelete}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 📱 Layout Patterns

### Page Layout

```tsx
<div className="flex flex-col gap-6 p-6">
  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
      <p className="text-muted-foreground mt-1">
        Page description
      </p>
    </div>
    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
      <Plus className="w-5 h-5 mr-2" />
      Create New
    </Button>
  </div>

  {/* Stats Grid */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {/* Stats cards */}
  </div>

  {/* Main Content */}
  <Card>
    <CardHeader>
      <CardTitle>Section Title</CardTitle>
      <CardDescription>Section description</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

### Form Page Layout

```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <div className="border-b bg-background/95 backdrop-blur">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/back">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Form Title</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Form description
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Form Content */}
  <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>Section Title</CardTitle>
        <CardDescription>Section description</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* Form fields */}
        </Form>
      </CardContent>
    </Card>
  </main>
</div>
```

### Responsive Grids

```tsx
// 4 columns (stats/metrics)
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Cards */}
</div>

// 3 columns (event cards)
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>

// 2 columns (form sections)
<div className="grid gap-6 md:grid-cols-2">
  {/* Form fields */}
</div>
```

---

## 🎭 States

### Loading States

```tsx
// Skeleton loader
<div className="space-y-4">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-8 w-1/2" />
</div>

// Spinner
<div className="flex items-center justify-center py-12">
  <Loader2 className="w-8 h-8 animate-spin text-primary" />
</div>

// Button loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
    <Calendar className="w-8 h-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">
    No Data Found
  </h3>
  <p className="text-sm text-muted-foreground mb-6 max-w-md">
    Get started by creating your first item
  </p>
  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
    <Plus className="w-4 h-4 mr-2" />
    Create New
  </Button>
</div>
```

### Error States

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

### Success States

```tsx
<Alert className="border-green-200 bg-green-50">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertTitle className="text-green-900">Success</AlertTitle>
  <AlertDescription className="text-green-700">
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>
```

---

## 🔍 Icons

**Library:** `lucide-react` only

**Icon Sizes:**
```typescript
// In buttons/inline
w-4 h-4

// In cards/headers
w-5 h-5

// Standalone icons
w-6 h-6

// Empty states
w-12 h-12 or w-16 h-16
```

**Common Icons:**
```tsx
import {
  Plus, Edit, Trash2, Save, X, Check,
  Calendar, Users, MapPin, Mail, Phone,
  Settings, LogOut, Home, Search,
  ChevronLeft, ChevronRight, ChevronDown,
  MoreVertical, ExternalLink, Download,
  AlertCircle, CheckCircle, Info, Loader2
} from 'lucide-react'
```

**Usage:**
```tsx
// With text
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Create
</Button>

// Icon only
<Button variant="ghost" size="icon">
  <Edit className="w-4 h-4" />
</Button>

// In cards
<Calendar className="w-5 h-5 text-blue-600" />
```

---

## 🎬 Animations

```typescript
// Hover transitions
className="transition-all hover:shadow-md"
className="transition-colors hover:bg-muted"
className="transition-transform hover:scale-105"

// Duration (use sparingly)
className="duration-150"  // Fast
className="duration-200"  // Normal
className="duration-300"  // Slow

// Group hover
className="group"
className="group-hover:text-primary"
```

**Examples:**
```tsx
// Card hover
<Card className="transition-all hover:shadow-md">

// Button hover
<Button className="transition-colors">

// Scale on hover (use sparingly)
<div className="transition-transform hover:scale-[1.02]">
```

---

## ✅ Component Checklist

Before committing any component, verify:

- [ ] Uses Shadcn/ui components (no raw Tailwind for UI)
- [ ] Follows spacing system (gap-4, p-6, space-y-6)
- [ ] Uses theme colors (no hardcoded colors like bg-blue-500)
- [ ] Has proper TypeScript types
- [ ] Includes loading states
- [ ] Has error handling
- [ ] Implements empty states
- [ ] Is keyboard accessible
- [ ] Responsive on mobile/tablet/desktop
- [ ] Uses Lucide React icons only
- [ ] Follows naming conventions (PascalCase for components)
- [ ] Has proper ARIA labels where needed

---

## 🚀 Quick Reference

### Most Common Patterns

```typescript
// Page container
"flex flex-col gap-6 p-6"

// Stats grid
"grid gap-4 md:grid-cols-2 lg:grid-cols-4"

// Header with action
"flex items-center justify-between mb-6"

// Form spacing
"space-y-6"

// Button group
"flex gap-2"

// Card hover
"transition-all hover:shadow-md border-border"
```

### Color Quick Reference

```typescript
// Backgrounds
bg-background       // Page background
bg-card            // Card background
bg-muted           // Subtle background
bg-muted/30        // Very subtle (30% opacity)

// Text
text-foreground    // Primary text
text-muted-foreground  // Secondary text

// Borders
border-border      // All borders

// Actions
bg-blue-600        // Primary buttons
text-blue-600      // Primary text/icons
text-green-600     // Success
text-red-600       // Error
```

### Common Class Combinations

```typescript
// Card
"relative overflow-hidden transition-all hover:shadow-md border-border"

// Heading
"text-3xl font-bold tracking-tight"

// Secondary text
"text-sm text-muted-foreground"

// Icon badge
"w-10 h-10 rounded-lg bg-muted flex items-center justify-center"

// Section divider
"flex items-center gap-2"
"h-px flex-1 bg-border"
```

---

## 🎨 Real-World Examples

### Dashboard Stats Card
```tsx
<Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
  <CardContent className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <Calendar className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-700">
        <ArrowUp className="w-3 h-3" />
        <span>12%</span>
      </div>
    </div>

    <div className="space-y-1 mb-4">
      <p className="text-sm font-medium text-muted-foreground">
        Total Events
      </p>
      <div className="text-3xl font-bold tracking-tight">1,234</div>
    </div>

    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <TrendingUp className="w-3 h-3 text-green-600" />
      <span className="font-medium">Pertumbuhan stabil</span>
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Semua event yang dibuat
    </p>
  </CardContent>
</Card>
```

### Event Card
```tsx
<Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md border-border">
  <div className="absolute top-4 right-4 z-10">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
      <Calendar className="w-5 h-5 text-foreground" />
    </div>
  </div>

  <Link href={`/events/${id}`}>
    <CardHeader className="pb-3">
      <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors mb-2">
        Wedding Celebration
      </h3>
      <p className="text-sm text-muted-foreground">
        Sarah & John
      </p>
    </CardHeader>

    <CardContent className="space-y-4 pb-4">
      <Badge variant="default">Hari Ini</Badge>

      <div className="flex items-center text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
        <span>25 Desember 2024</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Users className="h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Tamu</span>
            <span className="text-sm font-bold">150</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Link>

  <CardFooter className="bg-muted/30 border-t pt-4 pb-4 gap-2">
    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
      Lihat Detail
    </Button>
  </CardFooter>
</Card>
```

---

## 🚨 Common Mistakes to Avoid

❌ **Don't:**
```tsx
// Hardcoded colors
<div className="bg-blue-500 text-white">

// Inconsistent spacing
<div className="p-3 gap-5">

// Raw Tailwind buttons
<button className="px-4 py-2 bg-blue-500">

// Inconsistent hover states
<div className="hover:bg-gray-200">
```

✅ **Do:**
```tsx
// Theme colors
<div className="bg-primary text-primary-foreground">

// Standard spacing
<div className="p-6 gap-4">

// Shadcn buttons
<Button className="bg-blue-600 hover:bg-blue-700 text-white">

// Consistent hover states
<div className="hover:bg-muted">
```

---

**💡 Remember:** When in doubt, check existing components for patterns. Consistency is key!

**📚 Resources:**
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
