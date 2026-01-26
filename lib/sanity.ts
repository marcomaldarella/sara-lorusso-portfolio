import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01"

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to true in production for faster, cheaper responses
}

// Create the Sanity client
export const sanityClient = createClient(sanityConfig)

// Helper for image URLs
const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source: any) => builder.image(source)

// Convenience function for queries
export async function sanityFetch<T = any>(query: string, params?: Record<string, any>): Promise<T> {
  return sanityClient.fetch(query, params)
}

// Common queries
export const queries = {
  // Get all photos for the infinite canvas
  getAllPhotos: `*[_type == "photo"] {
    _id,
    title,
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