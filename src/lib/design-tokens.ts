/**
 * Design Tokens
 * Centralized design system values for programmatic access
 * Reference: /STYLEGUIDE.md for complete documentation
 *
 * @see {@link file://../../../STYLEGUIDE.md}
 */

/**
 * Spacing scale based on Tailwind CSS
 * Use these for consistent spacing throughout the app
 */
export const spacing = {
  xs: '0.25rem',   // 4px  - Minimal spacing
  sm: '0.5rem',    // 8px  - Small gaps
  md: '1rem',      // 16px - Standard spacing
  lg: '1.5rem',    // 24px - Large spacing
  xl: '2rem',      // 32px - Extra large
  '2xl': '3rem',   // 48px - Section spacing
  '3xl': '4rem',   // 64px - Large section spacing
} as const

/**
 * Font size scale
 * Matches Tailwind's typography scale
 */
export const fontSize = {
  xs: '0.75rem',     // 12px - Small text, captions
  sm: '0.875rem',    // 14px - Secondary text
  base: '1rem',      // 16px - Body text
  lg: '1.125rem',    // 18px - Large body
  xl: '1.25rem',     // 20px - Subheadings
  '2xl': '1.5rem',   // 24px - H4
  '3xl': '1.875rem', // 30px - H3
  '4xl': '2.25rem',  // 36px - H2
  '5xl': '3rem',     // 48px - H1
} as const

/**
 * Border radius scale
 */
export const borderRadius = {
  sm: '0.375rem',  // 6px  - Small elements
  md: '0.5rem',    // 8px  - Default
  lg: '0.75rem',   // 12px - Cards
  xl: '1rem',      // 16px - Large cards
  '2xl': '1.5rem', // 24px - Very large
  full: '9999px',  // Fully rounded
} as const

/**
 * Icon sizes as Tailwind classes
 * Use these for consistent icon sizing
 */
export const iconSize = {
  sm: 'w-4 h-4',     // 16px - Buttons, inline
  md: 'w-5 h-5',     // 20px - Cards, headers
  lg: 'w-6 h-6',     // 24px - Standalone
  xl: 'w-12 h-12',   // 48px - Large standalone
  '2xl': 'w-16 h-16', // 64px - Empty states
} as const

/**
 * Common Tailwind class combinations
 * Pre-defined combinations for consistency
 */
export const classNames = {
  // Cards
  card: 'relative overflow-hidden transition-all hover:shadow-md border-border',
  statsCard: 'relative overflow-hidden transition-all hover:shadow-md border-border',

  // Typography
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-bold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  body: 'text-base text-foreground',
  secondary: 'text-sm text-muted-foreground',
  label: 'text-sm font-medium',
  labelStrong: 'text-base font-semibold',

  // Layout
  pageContainer: 'flex flex-col gap-6 p-6',
  formContainer: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8',

  // Grids
  statsGrid: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
  cardsGrid: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
  twoColGrid: 'grid gap-6 md:grid-cols-2',

  // Buttons
  primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white',

  // Common elements
  iconBadge: 'w-10 h-10 rounded-lg bg-muted flex items-center justify-center',
  sectionDivider: 'flex items-center gap-2',
  dividerLine: 'h-px flex-1 bg-border',
} as const

/**
 * Status colors and variants
 * For badges, indicators, and status displays
 */
export const status = {
  upcoming: {
    color: 'blue',
    badge: 'secondary',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  today: {
    color: 'green',
    badge: 'default',
    text: 'text-green-600',
    bg: 'bg-green-50',
  },
  past: {
    color: 'gray',
    badge: 'outline',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
  },
  cancelled: {
    color: 'red',
    badge: 'destructive',
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
} as const

/**
 * Common color values for programmatic use
 * Use these when you need to access colors in JavaScript
 */
export const colors = {
  // Primary actions
  primary: 'rgb(37, 99, 235)',      // blue-600
  primaryHover: 'rgb(29, 78, 216)', // blue-700

  // Success
  success: 'rgb(22, 163, 74)',      // green-600
  successHover: 'rgb(21, 128, 61)', // green-700

  // Error/Destructive
  error: 'rgb(220, 38, 38)',        // red-600
  errorHover: 'rgb(185, 28, 28)',   // red-700

  // Warning
  warning: 'rgb(234, 88, 12)',      // orange-600
} as const

/**
 * Animation durations in milliseconds
 */
export const duration = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const

/**
 * Common z-index values
 * Use these to maintain proper stacking order
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const

/**
 * Breakpoints (matches Tailwind defaults)
 * For use in JavaScript media queries
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Type exports for TypeScript support
 */
export type Spacing = keyof typeof spacing
export type FontSize = keyof typeof fontSize
export type BorderRadius = keyof typeof borderRadius
export type IconSize = keyof typeof iconSize
export type StatusType = keyof typeof status
export type ClassName = keyof typeof classNames

/**
 * Helper function to get consistent spacing values
 * @param size - The spacing size key
 * @returns The spacing value in rem
 */
export const getSpacing = (size: Spacing): string => spacing[size]

/**
 * Helper function to get consistent font sizes
 * @param size - The font size key
 * @returns The font size value in rem
 */
export const getFontSize = (size: FontSize): string => fontSize[size]

/**
 * Helper function to get icon size class
 * @param size - The icon size key
 * @returns The Tailwind class string for icon sizing
 */
export const getIconSize = (size: IconSize): string => iconSize[size]

/**
 * Helper function to get status badge variant
 * @param statusType - The status type
 * @returns The badge variant for the status
 */
export const getStatusBadge = (statusType: StatusType) => status[statusType].badge

/**
 * Complete design tokens export
 */
export const designTokens = {
  spacing,
  fontSize,
  borderRadius,
  iconSize,
  classNames,
  status,
  colors,
  duration,
  zIndex,
  breakpoints,
} as const

export default designTokens
