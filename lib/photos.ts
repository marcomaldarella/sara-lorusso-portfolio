import { sanityFetch, queries, urlFor } from '@/lib/sanity'
import type { MediaItem } from '@/components/infinite-canvas/types'

export interface SanityPhoto {
  _id: string
  title?: string
  category: 'work' | 'commissioned'
  image: {
    asset: {
      _id: string
      url: string
      metadata: {
        dimensions: {
          width: number
          height: number
        }
      }
    }
  }
}

export async function getPhotosForCanvas(): Promise<MediaItem[]> {
  try {
    const photos: SanityPhoto[] = await sanityFetch(queries.getAllPhotos)
    
    return photos.map(photo => ({
      url: urlFor(photo.image).url(),
      width: photo.image.asset.metadata.dimensions.width,
      height: photo.image.asset.metadata.dimensions.height,
      _id: photo._id,
      category: photo.category
    }))
  } catch (error) {
    console.error('Failed to fetch photos from Sanity, falling back to static images:', error)
    
    // Fallback to static images if Sanity fails
    return getStaticImages()
  }
}

function getStaticImages(): MediaItem[] {
  const workImages = Array.from({ length: 63 }, (_, i) => 
    `/works/${String(i + 1).padStart(2, '0')}.jpg`
  )
  const commissionedImages = Array.from({ length: 26 }, (_, i) => 
    `/commissioned/${String(i + 1).padStart(2, '0')}.jpg`
  )
  
  const allImages = [...workImages, ...commissionedImages]
  
  return allImages.map(url => ({
    url,
    width: 3,
    height: 4,
  }))
}