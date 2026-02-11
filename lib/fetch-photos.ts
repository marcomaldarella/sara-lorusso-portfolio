import { sanityFetch, urlFor } from './sanity'

export type PhotoImage = {
  src: string
  span: number
  aspect: string
  title?: string
  caption?: string
  category?: string
  subcategory?: string
  _id?: string
}

/**
 * Fetch photos da Sanity per categoria (work | commissioned)
 * Con fallback a immagini statiche se il fetch fallisce
 */
export async function fetchPhotosByCategory(
  category: 'personal' | 'commissioned'
): Promise<PhotoImage[]> {
  try {
    const orderClause = 'order(orderRank asc)'
    
    console.log(`[fetch-photos] Fetching ${category} photos...`)
    
    const query = `*[_type == "photo" && category == $category] | ${orderClause} {
      _id,
      title,
      caption,
      category,
      subcategory,
      orderRank,
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

    // Trasforma risultati Sanity nel formato PhotoImage
    return result.map((photo: any) => ({
      _id: photo._id,
      title: photo.title || 'Untitled',
      caption: photo.caption,
      category: photo.category,
      subcategory: photo.subcategory,
      src: photo.image?.asset?.url || getFallbackPhotoPath(category, 1),
      span: 1,
      aspect: photo.image?.asset?.metadata?.dimensions
        ? photo.image.asset.metadata.dimensions.width > photo.image.asset.metadata.dimensions.height
          ? '16/9'
          : '3/4'
        : '3/4',
    }))
  } catch (error) {
    console.error(`[fetch-photos] Error fetching ${category} from Sanity:`, error)
    console.warn(`[fetch-photos] Falling back to static images for ${category}`)
    // Fallback a immagini statiche se fetch fallisce
    return getFallbackPhotos(category)
  }
}

/**
 * Fallback: genera elenco di immagini statiche da /public
 */
function getFallbackPhotos(category: 'personal' | 'commissioned'): PhotoImage[] {
  const totalCount = category === 'personal' ? 63 : 26
  const fallbackCategory = category === 'personal' ? 'personal' : 'commissioned'
  console.log(`[fetch-photos] Generating ${totalCount} fallback ${fallbackCategory} photos`)
  return Array.from({ length: totalCount }, (_, i) => ({
    src: getFallbackPhotoPath(fallbackCategory, i + 1),
    span: 1,
    aspect: '3/4',
    title: `${fallbackCategory} ${String(i + 1).padStart(2, '0')}`,
  }))
}

/**
 * Percorso fallback per immagini statiche
 */
function getFallbackPhotoPath(category: 'personal' | 'commissioned', index: number): string {
  return `/${category}/${String(index).padStart(2, '0')}.jpg`
}

/**
 * Preload immagini per migliorare performance
 */
export async function preloadPhotos(photos: PhotoImage[]): Promise<void> {
  const promises = photos.slice(0, 10).map((photo) => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = photo.src
    })
  })
  await Promise.all(promises)
}
