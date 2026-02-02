import { sanityFetch, queries, urlFor } from '@/lib/sanity'
export type MediaItem = {
  url: string
  width: number
  height: number
  _id?: string
  category?: 'personal' | 'commissioned'
  caption?: string
}

export interface SanityPhoto {
  _id: string
  title?: string
  caption?: string
  category: 'personal' | 'commissioned'
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
    // Check if Sanity is properly configured before attempting fetch
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "your-project-id") {
      console.warn('Sanity not configured, using static images')
      return getStaticImages()
    }
    
    const photos: SanityPhoto[] = await sanityFetch(queries.getAllPhotos)
    
    if (!photos || photos.length === 0) {
      console.warn('No photos found in Sanity, falling back to static images')
      return getStaticImages()
    }
    
    return photos.map(photo => ({
      url: urlFor(photo.image).url(),
      width: photo.image.asset.metadata.dimensions.width,
      height: photo.image.asset.metadata.dimensions.height,
      _id: photo._id,
      category: photo.category,
      caption: photo.caption
    }))
  } catch (error) {
    console.warn('Failed to fetch photos from Sanity, falling back to static images:', error)
    
    // Fallback to static images if Sanity fails
    return getStaticImages()
  }
}

function getStaticImages(): MediaItem[] {
  const personalImages = Array.from({ length: 63 }, (_, i) =>
    `/personal/${String(i + 1).padStart(2, '0')}.jpg`
  )
  const commissionedImages = Array.from({ length: 26 }, (_, i) => 
    `/commissioned/${String(i + 1).padStart(2, '0')}.jpg`
  )
  
  const allImages = [...personalImages, ...commissionedImages]
  
  return allImages.map(url => ({
    url,
    width: 3,
    height: 4,
  }))
}
