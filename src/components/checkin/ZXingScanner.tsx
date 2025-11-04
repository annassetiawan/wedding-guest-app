'use client'

import { useState, useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Camera,
  CameraOff,
  Search,
  UserCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Guest } from '@/types/database.types'
import { toast } from 'sonner'

interface ZXingScannerProps {
  eventId: string
  guests: Guest[]
  onScanSuccess: (guest: Guest) => void
}

export default function ZXingScanner({
  eventId,
  guests,
  onScanSuccess
}: ZXingScannerProps) {
  // Mount check for hydration
  const [isMounted, setIsMounted] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [lastScannedGuest, setLastScannedGuest] = useState<Guest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<any>(null)
  const mountedRef = useRef(true)

  // Mount check
  useEffect(() => {
    setIsMounted(true)
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Initialize reader
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      // Get video devices (prefer back camera on mobile)
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error('Kamera tidak ditemukan. Pastikan device memiliki kamera.')
      }

      // Prefer back camera (environment facing)
      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )

      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId

      // Start decoding from video element
      if (videoRef.current) {
        const controls = await reader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (!mountedRef.current) return

            if (result) {
              const scannedText = result.getText()

              // Avoid duplicate scans
              if (scannedText !== lastScanned) {
                setLastScanned(scannedText)
                console.log('QR Code detected:', scannedText)

                // Find guest by QR code
                const guest = guests.find((g) => g.qr_code === scannedText)

                if (!guest) {
                  toast.error('QR code tidak ditemukan dalam daftar tamu')
                  playBeepSound(false)
                  setTimeout(() => setLastScanned(null), 2000)
                  return
                }

                // Play success beep
                playBeepSound(true)

                // Show scanned guest
                setLastScannedGuest(guest)

                // Callback
                onScanSuccess(guest)

                // Reset after 3 seconds
                setTimeout(() => {
                  if (mountedRef.current) {
                    setLastScanned(null)
                    setLastScannedGuest(null)
                  }
                }, 3000)
              }
            }

            if (error && !(error instanceof NotFoundException)) {
              console.error('Scan error:', error)
            }
          }
        )

        controlsRef.current = controls
        toast.success('Scanner aktif')
      }

    } catch (err: any) {
      console.error('Failed to start scanner:', err)
      setError(err.message || 'Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.')
      setIsScanning(false)
      toast.error(err.message || 'Gagal memulai scanner')
    }
  }

  const stopScanning = () => {
    try {
      // Stop video stream
      if (controlsRef.current) {
        controlsRef.current.stop()
        controlsRef.current = null
      }

      // Reset reader
      if (readerRef.current) {
        readerRef.current = null
      }

      // Stop video element
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }

    } catch (err) {
      console.error('Error stopping scanner:', err)
    } finally {
      setIsScanning(false)
      setLastScanned(null)
      toast.info('Scanner dihentikan')
    }
  }

  const playBeepSound = (success: boolean) => {
    try {
      // Create beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = success ? 800 : 400
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (err) {
      // Silent fail
    }
  }

  const handleManualCheckIn = async (guest: Guest) => {
    setLastScannedGuest(guest)
    onScanSuccess(guest)

    setTimeout(() => {
      setSearchQuery('')
      setLastScannedGuest(null)
    }, 3000)
  }

  const getFilteredGuests = () => {
    if (!searchQuery) return []

    return guests.filter((guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Don't render on server
  if (!isMounted) {
    return null
  }

  const filteredGuests = getFilteredGuests()

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* QR Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isScanning ? (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <CameraOff className="h-16 w-16 mx-auto mb-4" />
                  <p>Kamera belum aktif</p>
                  <p className="text-xs mt-2">Klik tombol di bawah untuk memulai</p>
                </div>
              </div>
              <Button
                onClick={startScanning}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Camera className="mr-2 h-4 w-4" />
                Mulai Scanner
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video preview */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />

                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-white/50 rounded-lg w-48 h-48" />
                </div>

                {/* Instructions */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-center text-sm">
                    Arahkan kamera ke QR code pada undangan
                  </p>
                </div>

                {/* Scanning indicator */}
                {isScanning && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Scanning...</span>
                  </div>
                )}
              </div>

              {/* Stop button */}
              <Button
                onClick={stopScanning}
                variant="outline"
                className="w-full"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Scanner
              </Button>
            </div>
          )}

          {/* Last Scanned Guest */}
          {lastScannedGuest && (
            <div
              className={`p-4 rounded-lg border-2 ${
                lastScannedGuest.checked_in
                  ? 'bg-green-50 border-green-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {lastScannedGuest.checked_in ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{lastScannedGuest.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        lastScannedGuest.category === 'VIP'
                          ? 'default'
                          : lastScannedGuest.category === 'Family'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {lastScannedGuest.category}
                    </Badge>
                    <Badge variant={lastScannedGuest.checked_in ? 'default' : 'secondary'}>
                      {lastScannedGuest.checked_in ? 'Checked In ✓' : 'Already Checked In'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pencarian Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Cari nama atau nomor telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              Jika scanner tidak berfungsi, gunakan pencarian manual
            </p>
          </div>

          {searchQuery && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredGuests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-2" />
                  <p>Tidak ada tamu ditemukan</p>
                </div>
              ) : (
                filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className={`p-4 rounded-lg border-2 ${
                      guest.checked_in
                        ? 'bg-green-50 border-green-200'
                        : 'bg-card border-border hover:border-primary/50'
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{guest.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">{guest.phone || '-'}</p>
                          <Badge
                            variant={
                              guest.category === 'VIP'
                                ? 'default'
                                : guest.category === 'Family'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {guest.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleManualCheckIn(guest)}
                        disabled={guest.checked_in}
                      >
                        {guest.checked_in ? (
                          <>
                            <UserCheck className="mr-1 h-4 w-4" />
                            Checked In
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-1 h-4 w-4" />
                            Check In
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
