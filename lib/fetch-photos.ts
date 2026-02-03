import { sanityFetch, urlFor } from './sanity'

export type PhotoImage = {
  src: string
  span: number
  aspect: string
  title?: string
  caption?: string
  category?: string
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
    const orderClause = category === 'personal'
      ? 'order(orderRank asc)'
      : 'order(subcategory asc, _createdAt desc)'
    
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
      src: photo.image?.asset?.url || getFallbackPhotoPath(category, 1),
      span: 1,
      aspect: photo.image?.asset?.metadata?.dimensions
        ? photo.image.asset.metadata.dimensions.width > photo.image.asset.metadata.dimensions.height
          ? '16/9'
          : '3/4'
        : '3/4',
    }))
  } catch (error) {
    console.error(`Error fetching photos for category "${category}":`, error)
    // Fallback a immagini statiche se fetch fallisce
    return getFallbackPhotos(category)
  }
}

/**
 * Fallback: genera elenco di immagini statiche da /public
 */
function getFallbackPhotos(category: 'work' | 'commissioned'): PhotoImage[] {
  const totalCount = category === 'work' ? 63 : 26
  return Array.from({ length: totalCount }, (_, i) => ({
    src: getFallbackPhotoPath(category, i + 1),
    span: 1,
    aspect: '3/4',
    title: `${category} ${String(i + 1).padStart(2, '0')}`,
  }))
}

/**
 * Percorso fallback per immagini statiche
 */
function getFallbackPhotoPath(category: 'work' | 'commissioned', index: number): string {
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
