'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { eventService } from '@/lib/services/events'
import { toast } from 'sonner'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ArrowLeft, Zap, Sparkles, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()

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

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to create an event')
      router.push('/login')
      return
    }

    try {
      const event = await eventService.createEvent(user.id, values)
      toast.success('Event created successfully!')
      router.push(`/events/${event.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event')
      console.error('Error creating event:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-sm text-gray-600">
                Set up your wedding event details
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
              Fill in the details for your wedding event
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
                          defaultValue={field.value}
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
                                    className={cn(
                                      "relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                                      isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    )}
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

                {/* Photo Upload Placeholder */}
                <div className="space-y-2">
                  <FormLabel>
                    Event Photo <span className="text-gray-400">(Coming soon)</span>
                  </FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500">
                      Photo upload feature coming in Phase 2
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Create Event
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
