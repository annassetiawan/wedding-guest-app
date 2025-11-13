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
import { toast } from 'sonner'
import { VendorFormDialog } from '@/components/vendors/VendorFormDialog'
import { DeleteVendorDialog } from '@/components/vendors/DeleteVendorDialog'

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

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Vendor Management</h1>
              <p className="text-muted-foreground mt-1">
                Kelola database vendor Anda
              </p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Vendor
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Vendor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{vendors.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Database vendor aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rating Rata-rata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                {vendors.length > 0
                  ? (
                      vendors.reduce((sum, v) => sum + (v.rating || 0), 0) /
                      vendors.length
                    ).toFixed(1)
                  : '0.0'}
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Dari {vendors.length} vendor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {vendors.reduce((sum, v) => sum + v.total_events, 0)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Event yang ditangani
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendor Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {vendors.filter((v) => v.is_active).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Siap untuk event
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari vendor..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {Object.entries(VENDOR_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range Filter */}
              <Select
                value={filters.price_range || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('price_range', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Harga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Harga</SelectItem>
                  {Object.entries(PRICE_RANGE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onEdit={(v) => {
                  setSelectedVendor(v)
                  setEditDialogOpen(true)
                }}
                onDelete={(v) => {
                  setSelectedVendor(v)
                  setDeleteDialogOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  )
}

// ============================================
// Vendor Card Component
// ============================================

function VendorCard({
  vendor,
  onEdit,
  onDelete,
}: {
  vendor: VendorWithStats
  onEdit: (vendor: VendorWithStats) => void
  onDelete: (vendor: VendorWithStats) => void
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{vendor.name}</CardTitle>
            <CardDescription className="mt-1">
              {getCategoryLabel(vendor.category)}
            </CardDescription>
          </div>
          {!vendor.is_active && (
            <Badge variant="secondary">Nonaktif</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating */}
        {vendor.rating && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{vendor.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({vendor.total_events} event)
            </span>
          </div>
        )}

        {/* Price Range */}
        {vendor.price_range && (
          <Badge variant="outline">
            {getPriceRangeLabel(vendor.price_range)}
          </Badge>
        )}

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {vendor.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{vendor.phone}</span>
            </div>
          )}
          {vendor.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{vendor.email}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            <span className="font-medium">{vendor.active_events}</span>
            <span className="text-muted-foreground"> event aktif</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(vendor)}
              title="Edit vendor"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(vendor)}
              title="Hapus vendor"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
