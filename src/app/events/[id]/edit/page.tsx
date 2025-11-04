'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { eventService, Event } from '@/lib/services/events'
import { toast } from 'sonner'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ArrowLeft, Zap, Sparkles, Check, Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const formSchema = z.object({
  event_name: z.string().min(1, 'Event name is required').min(3, 'Event name must be at least 3 characters'),
  event_date: z.string().min(1, 'Event date is required'),
  venue: z.string().min(1, 'Venue is required').min(3, 'Venue must be at least 3 characters'),
  bride_name: z.string().min(1, 'Bride name is required').min(2, 'Bride name must be at least 2 characters'),
  groom_name: z.string().min(1, 'Groom name is required').min(2, 'Groom name must be at least 2 characters'),
  template_id: z.enum(['modern', 'elegant']),
})

type FormValues = z.infer<typeof formSchema>

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design',
    icon: Zap,
    color: 'blue',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated and classic style',
    icon: Sparkles,
    color: 'purple',
  },
]

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_name: '',
      event_date: '',
      venue: '',
      bride_name: '',
      groom_name: '',
      template_id: 'modern',
    },
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEvent()
  }, [eventId, user])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const eventData = await eventService.getEventById(eventId)

      if (eventData) {
        setEvent(eventData)

        // Format date to YYYY-MM-DD for input
        const formattedDate = new Date(eventData.event_date).toISOString().split('T')[0]

        form.reset({
          event_name: eventData.event_name,
          event_date: formattedDate,
          venue: eventData.venue,
          bride_name: eventData.bride_name,
          groom_name: eventData.groom_name,
          template_id: eventData.template_id as 'modern' | 'elegant',
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load event')
      console.error('Error loading event:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to edit an event')
      router.push('/login')
      return
    }

    try {
      await eventService.updateEvent(eventId, values)
      toast.success('Event updated successfully!')
      router.push(`/events/${eventId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event')
      console.error('Error updating event:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/events/${eventId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-sm text-gray-600">
                Update your wedding event details
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>
              Update the details for your wedding event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Event Name */}
                <FormField
                  control={form.control}
                  name="event_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Sarah & John's Wedding"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Event Date */}
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Venue */}
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Grand Ballroom, Hotel California"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bride & Groom Names - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bride_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bride Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sarah"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="groom_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groom Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Template Selection */}
                <FormField
                  control={form.control}
                  name="template_id"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Template</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {templates.map((template) => {
                            const Icon = template.icon
                            const isSelected = field.value === template.id

                            return (
                              <FormItem key={template.id}>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                  <FormControl>
                                    <RadioGroupItem
                                      value={template.id}
                                      className="sr-only"
                                    />
                                  </FormControl>
                                  <div
                                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <div
                                          className="p-2 rounded-lg mr-3 bg-muted"
                                        >
                                          <Icon
                                            className="w-6 h-6 text-primary"
                                          />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900">
                                            {template.name}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {template.description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check
                                        className="w-6 h-6 text-primary"
                                      />
                                    )}
                                  </div>
                                </FormLabel>
                              </FormItem>
                            )
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/events/${eventId}`)}
                    disabled={form.formState.isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
