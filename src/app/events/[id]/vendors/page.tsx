'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveEvent } from '@/contexts/EventContext'
import { eventService, Event } from '@/lib/services/events'
import { vendorService } from '@/lib/services/vendors'
import type { EventVendorWithDetails } from '@/types/vendor.types'
import { getCategoryLabel, PAYMENT_STATUS_LABELS } from '@/types/vendor.types'
import { toast } from 'sonner'
import { Plus, Loader2, Edit, Trash2, Briefcase, Phone, Mail, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

// Import layout components
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchFilterBar, FilterOption } from '@/components/layout/SearchFilterBar'

// Import vendor management dialogs
import { AssignVendorDialog } from '@/components/events/AssignVendorDialog'
import { EditVendorAssignmentDialog } from '@/components/events/EditVendorAssignmentDialog'
import { RemoveVendorDialog } from '@/components/events/RemoveVendorDialog'

export default function EventVendorsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveEvent } = useActiveEvent()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [vendors, setVendors] = useState<EventVendorWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorsLoading, setVendorsLoading] = useState(false)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')

  // Dialog states
  const [assignVendorOpen, setAssignVendorOpen] = useState(false)
  const [editVendorOpen, setEditVendorOpen] = useState(false)
  const [removeVendorOpen, setRemoveVendorOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<EventVendorWithDetails | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEventData()
  }, [eventId, user])

  const loadEventData = async () => {
    try {
      setLoading(true)
      const eventData = await eventService.getEventById(eventId)
      setEvent(eventData)
      setActiveEvent(eventId, eventData)

      // Load vendors
      loadVendors()
    } catch (error: any) {
      console.error('Error loading event:', error)
      toast.error(error.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const loadVendors = async () => {
    try {
      setVendorsLoading(true)
      const vendorsData = await vendorService.getEventVendors(eventId)
      setVendors(vendorsData)
    } catch (error) {
      console.error('Error loading vendors:', error)
      toast.error('Gagal memuat data vendor')
    } finally {
      setVendorsLoading(false)
    }
  }

  const handleEditVendor = (vendorAssignment: EventVendorWithDetails) => {
    setSelectedVendor(vendorAssignment)
    setEditVendorOpen(true)
  }

  const handleRemoveVendor = (vendorAssignment: EventVendorWithDetails) => {
    setSelectedVendor(vendorAssignment)
    setRemoveVendorOpen(true)
  }

  // Filter vendors based on search and filters
  const getFilteredVendors = () => {
    return vendors.filter((vendor) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        vendor.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.vendor.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus =
        filterStatus === 'all' || vendor.status === filterStatus

      // Payment status filter
      const matchesPaymentStatus =
        filterPaymentStatus === 'all' || vendor.payment_status === filterPaymentStatus

      return matchesSearch && matchesStatus && matchesPaymentStatus
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setFilterStatus(value)
    if (key === 'payment_status') setFilterPaymentStatus(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    )
  }

  const filteredVendors = getFilteredVendors()

  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending', label: 'Pending' },
      ],
      defaultValue: filterStatus,
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      options: [
        { value: 'all', label: 'All Payments' },
        { value: 'paid', label: 'Paid' },
        { value: 'dp_paid', label: 'DP Paid' },
        { value: 'unpaid', label: 'Unpaid' },
      ],
      defaultValue: filterPaymentStatus,
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Event Vendors"
        subtitle={`Kelola vendor yang di-assign untuk ${event.event_name}`}
        action={
          <Button onClick={() => setAssignVendorOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Assign Vendor
          </Button>
        }
      />

      <SearchFilterBar
        searchable
        searchPlaceholder="Search vendors by name, phone, or email..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterOptions}
        onFilterChange={handleFilterChange}
      />

      {/* Vendors Table */}
      {vendorsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {vendors.length === 0
                  ? 'Belum ada vendor yang di-assign'
                  : 'No vendors found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {vendors.length === 0
                  ? 'Mulai assign vendor untuk event ini'
                  : 'Try adjusting your search or filters'}
              </p>
              {vendors.length === 0 && (
                <Button onClick={() => setAssignVendorOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Vendor Pertama
                </Button>
              )}
            </div>
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
                <TableHead>Contract Amount</TableHead>
                <TableHead>Down Payment</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendorAssignment) => (
                <TableRow key={vendorAssignment.id}>
                  <TableCell className="font-medium">
                    {vendorAssignment.vendor.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryLabel(vendorAssignment.vendor.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {vendorAssignment.vendor.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{vendorAssignment.vendor.phone}</span>
                        </div>
                      )}
                      {vendorAssignment.vendor.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{vendorAssignment.vendor.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {vendorAssignment.contract_amount ? (
                      <span className="font-medium">
                        {vendorAssignment.currency === 'USD' ? '$' : 'Rp '}
                        {vendorAssignment.contract_amount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendorAssignment.down_payment ? (
                      <span className="font-medium">
                        {vendorAssignment.currency === 'USD' ? '$' : 'Rp '}
                        {vendorAssignment.down_payment.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vendorAssignment.payment_status === 'paid'
                          ? 'default'
                          : vendorAssignment.payment_status === 'dp_paid'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                        vendorAssignment.payment_status === 'paid'
                          ? 'bg-green-600'
                          : ''
                      }
                    >
                      {PAYMENT_STATUS_LABELS[vendorAssignment.payment_status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vendorAssignment.status === 'confirmed' ? (
                      <Badge variant="default">Confirmed</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendorAssignment.notes ? (
                      <span className="text-sm text-muted-foreground truncate max-w-[150px] block" title={vendorAssignment.notes}>
                        {vendorAssignment.notes}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditVendor(vendorAssignment)}
                        title="Edit assignment"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVendor(vendorAssignment)}
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
      <AssignVendorDialog
        open={assignVendorOpen}
        onOpenChange={setAssignVendorOpen}
        onSuccess={loadVendors}
        eventId={eventId}
        userId={user!.id}
        existingVendorIds={vendors.map((v) => v.vendor_id)}
      />

      <EditVendorAssignmentDialog
        open={editVendorOpen}
        onOpenChange={setEditVendorOpen}
        onSuccess={loadVendors}
        vendorAssignment={selectedVendor}
      />

      <RemoveVendorDialog
        open={removeVendorOpen}
        onOpenChange={setRemoveVendorOpen}
        onSuccess={loadVendors}
        vendorAssignment={selectedVendor}
      />
    </PageLayout>
  )
}
