'use client'

import { useEffect, useState } from 'react'
import { Guest } from '@/types/database.types'
import { generateQRCodeDataURL, downloadQRCode } from '@/lib/utils/qrcode'
import { toast } from 'sonner'
import { Download, Loader2, QrCode as QrCodeIcon, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface GuestQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
  eventName?: string
}

export default function GuestQRDialog({
  open,
  onOpenChange,
  guest,
  eventName,
}: GuestQRDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (open && guest) {
      generateQR()
    } else {
      setQrDataUrl(null)
    }
  }, [open, guest])

  const generateQR = async () => {
    if (!guest) return

    try {
      setLoading(true)
      const dataUrl = await generateQRCodeDataURL(guest.qr_code, {
        width: 512,
        margin: 3,
        errorCorrectionLevel: 'H',
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Gagal membuat QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!guest) return

    try {
      setDownloading(true)
      const filename = `QR-${guest.name.replace(/\s+/g, '-')}-${guest.qr_code}`
      await downloadQRCode(guest.qr_code, filename)
      toast.success('QR code berhasil diunduh')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('Gagal mengunduh QR code')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    if (!qrDataUrl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Gagal membuka jendela print')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${guest?.name}</title>
          <style>
            @media print {
              @page {
                margin: 0;
              }
              body {
                margin: 1cm;
              }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              text-align: center;
              max-width: 600px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
              color: #1f2937;
            }
            .info {
              color: #6b7280;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              background: #e5e7eb;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 500;
              margin: 4px;
            }
            img {
              max-width: 100%;
              height: auto;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              background: white;
            }
            .qr-text {
              margin-top: 16px;
              font-family: monospace;
              font-size: 12px;
              color: #9ca3af;
            }
            .event-name {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${eventName ? `<div class="event-name">${eventName}</div>` : ''}
            <h1>${guest?.name}</h1>
            <div class="info">
              <span class="badge">${guest?.category}</span>
            </div>
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="qr-text">${guest?.qr_code}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleCopyQRCode = async () => {
    if (!guest) return

    try {
      await navigator.clipboard.writeText(guest.qr_code)
      toast.success('Kode QR disalin ke clipboard')
    } catch (error) {
      console.error('Error copying QR code:', error)
      toast.error('Gagal menyalin kode QR')
    }
  }

  if (!guest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5" />
            QR Code - {guest.name}
          </DialogTitle>
          <DialogDescription>
            Scan QR code ini untuk check-in tamu di acara
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest Info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-semibold text-foreground">{guest.name}</p>
              <p className="text-sm text-muted-foreground">
                {guest.phone || 'Tidak ada nomor telepon'}
              </p>
            </div>
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

          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Membuat QR code...</p>
              </div>
            ) : qrDataUrl ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${guest.name}`}
                  className="w-full max-w-[400px] h-auto"
                />
                <div className="text-center">
                  <p className="text-xs font-mono text-muted-foreground">{guest.qr_code}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyQRCode}
                    className="mt-2"
                  >
                    Salin Kode
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <X className="h-12 w-12 text-red-500" />
                <p className="text-sm text-muted-foreground">Gagal memuat QR code</p>
                <Button onClick={generateQR} variant="outline" size="sm">
                  Coba Lagi
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handlePrint} disabled={!qrDataUrl || loading}>
            <QrCodeIcon className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} disabled={!qrDataUrl || loading || downloading}>
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengunduh...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
