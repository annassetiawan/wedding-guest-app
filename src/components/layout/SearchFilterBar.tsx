'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterOption {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
  defaultValue?: string
}

interface SearchFilterBarProps {
  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: FilterOption[]
  onFilterChange?: (key: string, value: string) => void
  className?: string
}

export function SearchFilterBar({
  searchable,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters,
  onFilterChange,
  className,
}: SearchFilterBarProps) {
  // Don't render if neither search nor filters are enabled
  if (!searchable && (!filters || filters.length === 0)) {
    return null
  }

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Search Input */}
      {searchable && (
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Filters */}
      {filters && filters.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              defaultValue={filter.defaultValue || filter.options[0]?.value}
              onValueChange={(value) => onFilterChange?.(filter.key, value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
    </div>
  )
}
