import QRCode from 'qrcode'

/**
 * Generate a QR code data URL from a string
 * @param text - The text to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: {
    width?: number
    margin?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    color?: {
      dark?: string
      light?: string
    }
  }
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 512,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
    })
    return dataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Download a QR code as PNG file
 * @param text - The text to encode in the QR code
 * @param filename - The filename for the downloaded file (without extension)
 */
export async function downloadQRCode(text: string, filename: string): Promise<void> {
  try {
    const dataUrl = await generateQRCodeDataURL(text, { width: 1024 })

    // Create a temporary link element
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${filename}.png`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw new Error('Failed to download QR code')
  }
}

/**
 * Generate QR code canvas element (for custom rendering)
 * @param text - The text to encode in the QR code
 * @param canvas - HTML Canvas element to render to
 * @param options - QR code generation options
 */
export async function generateQRCodeCanvas(
  text: string,
  canvas: HTMLCanvasElement,
  options?: {
    width?: number
    margin?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  }
): Promise<void> {
  try {
    await QRCode.toCanvas(canvas, text, {
      width: options?.width || 512,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    })
  } catch (error) {
    console.error('Error generating QR code canvas:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate a printable QR code with guest information
 * @param guestData - Guest information
 * @returns Promise<string> - Data URL of the QR code with guest info overlay
 */
export async function generatePrintableQRCode(guestData: {
  qrCode: string
  name: string
  category: string
  eventName?: string
}): Promise<string> {
  try {
    // Generate base QR code with larger size for printing
    const qrDataUrl = await generateQRCodeDataURL(guestData.qrCode, {
      width: 800,
      margin: 4,
      errorCorrectionLevel: 'H', // Higher error correction for print
    })

    return qrDataUrl
  } catch (error) {
    console.error('Error generating printable QR code:', error)
    throw new Error('Failed to generate printable QR code')
  }
}
