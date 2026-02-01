import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01"

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to true in production for faster, cheaper responses
  ignoreBrowserTokenWarning: true, // Ignore browser token warning in development
}

// Create the Sanity client with error handling
export const sanityClient = projectId && projectId !== "your-project-id" 
  ? createClient(sanityConfig)
  : null

// Helper for image URLs
const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null
export const urlFor = (source: any) => {
  if (!builder) {
    console.warn('Sanity image builder not available')
    return { url: () => '' }
  }
  return builder.image(source)
}

// Convenience function for queries
export async function sanityFetch<T = any>(query: string, params?: Record<string, any>): Promise<T> {
  if (!sanityClient) {
    throw new Error('Sanity client not configured - missing project ID')
  }
  
  try {
    return await sanityClient.fetch(query, params)
  } catch (error) {
    console.error('Sanity fetch error:', error)
    throw error
  }
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