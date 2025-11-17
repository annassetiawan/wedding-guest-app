'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { vendorService } from '@/lib/services/vendors'
import type {
  VendorWithStats,
  VendorFilters,
  VendorCategory,
  PriceRange,
} from '@/types/vendor.types'
import {
  getCategoryLabel,
  getPriceRangeLabel,
  VENDOR_CATEGORY_LABELS,
  PRICE_RANGE_LABELS,
} from '@/types/vendor.types'
import {
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Users,
  Loader2,
  Edit,
  Trash2,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { VendorFormDialog } from '@/components/vendors/VendorFormDialog'
import { DeleteVendorDialog } from '@/components/vendors/DeleteVendorDialog'

// Import layout components
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchFilterBar, FilterOption } from '@/components/layout/SearchFilterBar'

export default function VendorsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [vendors, setVendors] = useState<VendorWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<VendorFilters>({
    category: 'all',
    price_range: 'all',
    search: '',
  })

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<VendorWithStats | null>(
    null
  )

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadVendors()
  }, [user, router])

  const loadVendors = async () => {
    try {
      setLoading(true)
      const data = await vendorService.getVendors(user!.id, filters)
      setVendors(data)
    } catch (error) {
      console.error('Error loading vendors:', error)
      toast.error('Gagal memuat data vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }))
  }

  const handleFilterChange = (
    key: keyof VendorFilters,
    value: string | boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }

  // Apply filters
  useEffect(() => {
    if (user) {
      loadVendors()
    }
  }, [filters])

  if (loading) {
    return <VendorsPageSkeleton />
  }

  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'all', label: 'Semua Kategori' },
        ...Object.entries(VENDOR_CATEGORY_LABELS).map(([key, label]) => ({
          value: key,
          label,
        })),
      ],
      defaultValue: filters.category || 'all',
    },
    {
      key: 'price_range',
      label: 'Price Range',
      options: [
        { value: 'all', label: 'Semua Harga' },
        ...Object.entries(PRICE_RANGE_LABELS).map(([key, label]) => ({
          value: key,
          label,
        })),
      ],
      defaultValue: filters.price_range || 'all',
    },
  ]

  const handleFilterChangeWrapper = (key: string, value: string) => {
    handleFilterChange(key as keyof VendorFilters, value)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Vendor Management"
        subtitle="Kelola database vendor Anda"
        action={
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Vendor
          </Button>
        }
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Vendor</p>
              <div className="text-3xl font-bold tracking-tight">{vendors.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Database vendor aktif</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Rating Rata-rata</p>
              <div className="text-3xl font-bold tracking-tight">
                {vendors.length > 0
                  ? (
                      vendors.reduce((sum, v) => sum + (v.rating || 0), 0) /
                      vendors.length
                    ).toFixed(1)
                  : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Dari {vendors.length} vendor</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Event</p>
              <div className="text-3xl font-bold tracking-tight">
                {vendors.reduce((sum, v) => sum + v.total_events, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Event yang ditangani</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Vendor Aktif</p>
              <div className="text-3xl font-bold tracking-tight text-green-600">
                {vendors.filter((v) => v.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Siap untuk event</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <SearchFilterBar
        searchable
        searchPlaceholder="Cari vendor..."
        searchValue={filters.search}
        onSearchChange={handleSearch}
        filters={filterOptions}
        onFilterChange={handleFilterChangeWrapper}
      />

      {/* Vendors Table */}
      {vendors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Belum ada vendor
            </h3>
            <p className="text-muted-foreground mb-4">
              Mulai tambahkan vendor untuk memudahkan koordinasi event Anda
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Vendor Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Active Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryLabel(vendor.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {vendor.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{vendor.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {vendor.price_range ? (
                      <Badge variant="secondary">
                        {getPriceRangeLabel(vendor.price_range)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{vendor.active_events}</span>
                      <span className="text-muted-foreground"> / {vendor.total_events}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {vendor.is_active ? (
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVendor(vendor)
                          setEditDialogOpen(true)
                        }}
                        title="Edit vendor"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVendor(vendor)
                          setDeleteDialogOpen(true)
                        }}
                        title="Hapus vendor"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <VendorFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={loadVendors}
        userId={user!.id}
      />

      <VendorFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadVendors}
        userId={user!.id}
        vendor={selectedVendor || undefined}
      />

      <DeleteVendorDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={loadVendors}
        vendor={selectedVendor}
      />
    </PageLayout>
  )
}

// ============================================
// Loading Skeleton
// ============================================

function VendorsPageSkeleton() {
  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
