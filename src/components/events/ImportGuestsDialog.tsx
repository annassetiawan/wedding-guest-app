'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { Upload, Download, FileText, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { guestService } from '@/lib/services/guests'
import { GuestCategory } from '@/types/database.types'

interface ImportGuestsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onSuccess: () => void
}

interface CSVRow {
  name: string
  phone: string
  category: string
}

interface ParsedGuest extends CSVRow {
  valid: boolean
  errors: string[]
  rowNumber: number
}

const VALID_CATEGORIES: GuestCategory[] = ['VIP', 'Regular', 'Family']

export default function ImportGuestsDialog({
  open,
  onOpenChange,
  eventId,
  onSuccess,
}: ImportGuestsDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([])
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('File harus berformat CSV')
      return
    }

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const parseCSV = (file: File) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        console.log('CSV parsed:', results)

        const validated = results.data.map((row, index) => {
          const errors: string[] = []

          // Validate name (required, min 2 chars)
          if (!row.name || row.name.trim().length < 2) {
            errors.push('Nama minimal 2 karakter')
          }

          // Validate category (required, must be valid)
          const category = row.category?.trim()
          if (!category) {
            errors.push('Kategori wajib diisi')
          } else if (!VALID_CATEGORIES.includes(category as GuestCategory)) {
            errors.push(`Kategori harus: ${VALID_CATEGORIES.join(', ')}`)
          }

          // Phone is optional, no validation needed

          return {
            ...row,
            name: row.name?.trim() || '',
            phone: row.phone?.trim() || '',
            category: category || '',
            valid: errors.length === 0,
            errors,
            rowNumber: index + 2, // +2 because of header and 0-index
          }
        })

        setParsedGuests(validated)

        const validCount = validated.filter((g) => g.valid).length
        const errorCount = validated.length - validCount

        if (errorCount > 0) {
          toast.warning(`${validCount} valid, ${errorCount} error ditemukan`)
        } else {
          toast.success(`${validCount} tamu siap diimport`)
        }
      },
      error: (error) => {
        console.error('CSV parse error:', error)
        toast.error('Gagal membaca file CSV')
      },
    })
  }

  const handleImport = async () => {
    const validGuests = parsedGuests.filter((g) => g.valid)

    if (validGuests.length === 0) {
      toast.error('Tidak ada tamu yang valid untuk diimport')
      return
    }

    try {
      setImporting(true)
      setImportProgress(0)

      let successCount = 0
      let errorCount = 0

      // Import guests one by one (with progress)
      for (let i = 0; i < validGuests.length; i++) {
        const guest = validGuests[i]

        try {
          await guestService.createGuest({
            event_id: eventId,
            name: guest.name,
            phone: guest.phone,
            category: guest.category as GuestCategory,
            rsvp_status: 'pending' as const,
          })
          successCount++
        } catch (error) {
          console.error(`Error importing guest ${guest.name}:`, error)
          errorCount++
        }

        // Update progress
        setImportProgress(Math.round(((i + 1) / validGuests.length) * 100))
      }

      // Show results
      if (errorCount === 0) {
        toast.success(`${successCount} tamu berhasil diimport`)
      } else {
        toast.warning(`${successCount} berhasil, ${errorCount} gagal`)
      }

      // Reset and close
      if (successCount > 0) {
        handleReset()
        onOpenChange(false)
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengimport tamu')
      console.error('Import error:', error)
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  const handleDownloadTemplate = () => {
    const template = `name,phone,category
John Doe,08123456789,VIP
Jane Smith,08198765432,Regular
Ahmad Family,08177778888,Family`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'template-import-tamu.csv')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Template CSV berhasil diunduh')
  }

  const handleReset = () => {
    setFile(null)
    setParsedGuests([])
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validCount = parsedGuests.filter((g) => g.valid).length
  const errorCount = parsedGuests.length - validCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Tamu dari CSV
          </DialogTitle>
          <DialogDescription>
            Upload file CSV untuk menambahkan banyak tamu sekaligus
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Button */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Template CSV</p>
                <p className="text-sm text-muted-foreground">
                  Download template untuk format yang benar
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate} className="hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={importing}
            />
            <Button
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">
                    {file ? file.name : 'Pilih file CSV'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Klik untuk memilih file
                  </p>
                </div>
              </div>
            </Button>
          </div>

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Mengimport...</span>
                <span className="font-semibold">{importProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary */}
          {parsedGuests.length > 0 && !importing && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">
                  {parsedGuests.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Baris</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {validCount}
                </p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {errorCount}
                </p>
                <p className="text-sm text-muted-foreground">Error</p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedGuests.length > 0 && !importing && (
            <div>
              <h3 className="font-semibold mb-2">Preview Data ({parsedGuests.length})</h3>
              <div className="rounded-md border max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Baris</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedGuests.map((guest, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-muted-foreground">
                          {guest.rowNumber}
                        </TableCell>
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {guest.phone || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              guest.category === 'VIP'
                                ? 'default'
                                : guest.category === 'Family'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {guest.category || 'Invalid'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {guest.valid ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs">Valid</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs">Error</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Error Messages */}
              {errorCount > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ditemukan {errorCount} baris dengan error</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {parsedGuests
                        .filter((g) => !g.valid)
                        .slice(0, 5)
                        .map((guest, index) => (
                          <li key={index}>
                            <strong>Baris {guest.rowNumber}:</strong>{' '}
                            {guest.errors.join(', ')}
                          </li>
                        ))}
                      {errorCount > 5 && (
                        <li className="text-muted-foreground">
                          ... dan {errorCount - 5} error lainnya
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {parsedGuests.length > 0 && !importing && (
            <Button variant="outline" onClick={handleReset} className="hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all">
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importing}
            className="hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
          >
            Batal
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || validCount === 0}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengimport {importProgress}%
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {validCount} Tamu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
