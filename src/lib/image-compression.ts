/**
 * Client-side image compression using HTML5 Canvas.
 * Resizes and compresses images before upload to save bandwidth and DB space.
 * No external dependencies needed.
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: string
  maxSizeBytes?: number
}

const DEFAULT = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.8,
  mimeType: 'image/jpeg',
  maxSizeBytes: 300 * 1024,
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<File> {
  const w = options.maxWidth ?? DEFAULT.maxWidth
  const h = options.maxHeight ?? DEFAULT.maxHeight
  const q = options.quality ?? DEFAULT.quality
  const mime = options.mimeType ?? DEFAULT.mimeType
  const maxBytes = options.maxSizeBytes ?? DEFAULT.maxSizeBytes

  if (file.size <= maxBytes) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onerror = reject

    reader.onload = () => {
      const img = new Image()
      img.src = reader.result as string
      img.onerror = reject

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > w) {
            height *= w / width
            width = w
          }
        } else {
          if (height > h) {
            width *= h / height
            height = h
          }
        }

        canvas.width = Math.round(width)
        canvas.height = Math.round(height)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context unavailable'))
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        let currentQ = q
        const doExport = (qualityVal: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas toBlob failed'))
                return
              }
              if (blob.size > maxBytes && qualityVal > 0.3) {
                doExport(qualityVal - 0.1)
                return
              }
              const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp'
              const base = file.name.replace(/\.[^.]+$/, '')
              resolve(new File([blob], `${base}_compressed.${ext}`, { type: mime }))
            },
            mime,
            qualityVal,
          )
        }

        doExport(currentQ)
      }
    }
  })
}
