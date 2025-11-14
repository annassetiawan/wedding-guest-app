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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Vendors</h1>
          <p className="text-muted-foreground">
            Kelola vendor yang di-assign untuk {event.event_name}
          </p>
        </div>
        <Button onClick={() => setAssignVendorOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Vendor
        </Button>
      </div>

      {/* Vendors List */}
      {vendorsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Belum ada vendor yang di-assign
              </h3>
              <p className="text-muted-foreground mb-4">
                Mulai assign vendor untuk event ini
              </p>
              <Button onClick={() => setAssignVendorOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Vendor Pertama
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((vendorAssignment) => (
            <Card key={vendorAssignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {vendorAssignment.vendor.name}
                      {vendorAssignment.status === 'confirmed' && (
                        <Badge variant="default" className="text-xs">
                          Confirmed
                        </Badge>
                      )}
                      {vendorAssignment.status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {getCategoryLabel(vendorAssignment.vendor.category)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                {(vendorAssignment.vendor.phone || vendorAssignment.vendor.email) && (
                  <div className="space-y-2 text-sm">
                    {vendorAssignment.vendor.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{vendorAssignment.vendor.phone}</span>
                      </div>
                    )}
                    {vendorAssignment.vendor.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{vendorAssignment.vendor.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Contract Info */}
                {vendorAssignment.contract_amount && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nilai Kontrak:</span>
                      <span className="font-semibold">
                        {vendorAssignment.currency === 'USD' ? '$' : 'Rp '}
                        {vendorAssignment.contract_amount.toLocaleString()}
                      </span>
                    </div>
                    {vendorAssignment.down_payment && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Down Payment:</span>
                        <span className="font-medium">
                          {vendorAssignment.currency === 'USD' ? '$' : 'Rp '}
                          {vendorAssignment.down_payment.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Status */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Badge
                      variant={
                        vendorAssignment.payment_status === 'paid'
                          ? 'default'
                          : vendorAssignment.payment_status === 'dp_paid'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {PAYMENT_STATUS_LABELS[vendorAssignment.payment_status]}
                    </Badge>
                  </div>

                  <div className="flex gap-1">
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
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {vendorAssignment.notes && (
                  <div className="text-sm text-muted-foreground border-t pt-3">
                    <p className="font-medium mb-1">Catatan:</p>
                    <p className="text-xs">{vendorAssignment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
    </div>
  )
}
