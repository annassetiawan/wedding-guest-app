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
      toast.success('Event berhasil dibuat!')
      router.push(`/events/${event.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat event')
      console.error('Error creating event:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">Buat Event Baru</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Atur detail acara pernikahan Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Informasi Event</CardTitle>
            <CardDescription className="text-base">
              Isi detail lengkap untuk acara pernikahan Anda
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
                      <FormLabel className="text-base font-semibold">Nama Event</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Pernikahan Sarah & John"
                          className="h-11"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Nama event yang akan ditampilkan di undangan
                      </FormDescription>
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
                      <FormLabel className="text-base font-semibold">Tanggal Event</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-11"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Tanggal pelaksanaan acara pernikahan
                      </FormDescription>
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
                      <FormLabel className="text-base font-semibold">Lokasi Venue</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Grand Ballroom, Hotel California"
                          className="h-11"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Lokasi lengkap tempat acara diadakan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bride & Groom Names - Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm font-medium text-muted-foreground">Nama Pasangan</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bride_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Nama Mempelai Wanita</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Sarah"
                              className="h-11"
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
                          <FormLabel className="text-base font-semibold">Nama Mempelai Pria</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="h-11"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm font-medium text-muted-foreground">Pilih Template Undangan</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Template</FormLabel>
                        <FormDescription>
                          Pilih desain undangan yang sesuai dengan tema acara Anda
                        </FormDescription>
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
                                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:shadow-md">
                                    <FormControl>
                                      <RadioGroupItem
                                        value={template.id}
                                        className="sr-only"
                                      />
                                    </FormControl>
                                    <div
                                      className={cn(
                                        "relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all",
                                        isSelected
                                          ? "border-primary bg-primary/5 shadow-sm"
                                          : "border-border hover:border-primary/50 hover:shadow-sm"
                                      )}
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <div className="p-3 rounded-lg bg-primary/10">
                                            <Icon className="w-6 h-6 text-primary" />
                                          </div>
                                          <div>
                                            <p className="font-semibold text-foreground text-lg">
                                              {template.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                              {template.description}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <div className="ml-3">
                                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-5 h-5 text-primary-foreground" />
                                          </div>
                                        </div>
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
                </div>

                {/* Photo Upload Placeholder */}
                <div className="space-y-3">
                  <FormLabel className="text-base font-semibold">
                    Foto Event <span className="text-muted-foreground text-sm font-normal">(Segera Hadir)</span>
                  </FormLabel>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-primary"
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
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Fitur Upload Foto
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fitur ini akan tersedia di Phase 2
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    disabled={form.formState.isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                    className="min-w-[160px] bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Membuat...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Buat Event
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
