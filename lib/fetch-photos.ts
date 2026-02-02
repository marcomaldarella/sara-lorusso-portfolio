import { sanityFetch, urlFor } from './sanity'

export type PhotoImage = {
  src: string
  thumbSrc: string
  span: number
  aspect: string
  title?: string
  caption?: string
  category?: string
  _id?: string
  width?: number
  height?: number
}

/**
 * Genera URL Sanity ottimizzato con dimensioni e formato automatico
 */
function optimizedUrl(rawUrl: string, width: number, quality = 80): string {
  if (!rawUrl || !rawUrl.includes('cdn.sanity.io')) return rawUrl
  // Sanity CDN supporta ?w=WIDTH&q=QUALITY&auto=format (serve WebP se supportato)
  const separator = rawUrl.includes('?') ? '&' : '?'
  return `${rawUrl}${separator}w=${width}&q=${quality}&auto=format`
}

/**
 * Fetch photos da Sanity per categoria (work | commissioned)
 * Con fallback a immagini statiche se il fetch fallisce
 */
export async function fetchPhotosByCategory(
  category: 'personal' | 'commissioned'
): Promise<PhotoImage[]> {
  try {
    const query = `*[_type == "photo" && category == $category] | order(_createdAt desc) {
      _id,
      title,
      caption,
      category,
      image {
        asset-> {
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        }
      }
    }`

    const result = await sanityFetch(query, { category })

    if (!result || result.length === 0) {
      console.warn(`No photos found for category "${category}", using fallback`)
      return getFallbackPhotos(category)
    }

    // Trasforma risultati Sanity nel formato PhotoImage con URL ottimizzati
    return result.map((photo: any) => {
      const rawUrl = photo.image?.asset?.url || ''
      const dims = photo.image?.asset?.metadata?.dimensions
      const isWide = dims ? dims.width > dims.height : false

      return {
        _id: photo._id,
        title: photo.title || 'Untitled',
        caption: photo.caption,
        src: optimizedUrl(rawUrl, 1600, 80),
        thumbSrc: optimizedUrl(rawUrl, 120, 60),
        span: 1,
        aspect: isWide ? '16/9' : '3/4',
        width: dims?.width,
        height: dims?.height,
      }
    })
  } catch (error) {
    console.error(`Error fetching photos for category "${category}":`, error)
    return getFallbackPhotos(category)
  }
}

/**
 * Fallback: genera elenco di immagini statiche da /public
 */
function getFallbackPhotos(category: 'personal' | 'commissioned'): PhotoImage[] {
  const totalCount = category === 'personal' ? 63 : 26
  const folder = category === 'personal' ? 'personal' : 'commissioned'
  return Array.from({ length: totalCount }, (_, i) => {
    const path = `/${folder}/${String(i + 1).padStart(2, '0')}.jpg`
    return {
      src: path,
      thumbSrc: path,
      span: 1,
      aspect: '3/4',
      title: `${category} ${String(i + 1).padStart(2, '0')}`,
    }
  })
}

/**
 * Preload immagini per migliorare performance
 * Precarica sia le thumbnail che le immagini full per evitare flash bianchi
 */
export async function preloadPhotos(photos: PhotoImage[]): Promise<void> {
  const loadImage = (url: string) =>
    new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = url
    })

  // Preload tutte le thumbnail (sono piccole, ~5-10KB ciascuna)
  const thumbPromises = photos.map((p) => loadImage(p.thumbSrc || p.src))
  // Preload le prime 10 immagini full
  const fullPromises = photos.slice(0, 10).map((p) => loadImage(p.src))

  await Promise.all([...thumbPromises, ...fullPromises])
}
