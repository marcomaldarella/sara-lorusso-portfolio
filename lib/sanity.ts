import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

export const sanityConfig = {
  projectId: '3tjmr9u6',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  ignoreBrowserTokenWarning: true,
}

export const sanityClient = createClient(sanityConfig)

// Helper for image URLs
const builder = createImageUrlBuilder(sanityClient)
export const urlFor = (source: any) => builder.image(source)

// Convenience function for queries
export async function sanityFetch<T = any>(query: string, params?: Record<string, any>): Promise<T> {
  return await sanityClient.fetch(query, params)
}

// Common queries
export const queries = {
  // Get all photos for the infinite canvas
  getAllPhotos: `*[_type == "photo"] {
    _id,
    title,
    caption,
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
    },
    category
  }`,
  
  // Get photos by category
  getPhotosByCategory: `*[_type == "photo" && category == $category] {
    _id,
    title,
    caption,
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
  }`,
}