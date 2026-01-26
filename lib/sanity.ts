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
  // Get all artworks for the infinite canvas
  getAllArtworks: `*[_type == "artwork"] | order(order asc, _createdAt desc) {
    _id,
    title,
    slug,
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
      },
      alt
    },
    category->{
      title,
      slug
    },
    year,
    isCommissioned,
    isFeatured,
    order
  }`,
  
  // Get featured artworks for homepage
  getFeaturedArtworks: `*[_type == "artwork" && isFeatured == true] | order(order asc, _createdAt desc) {
    _id,
    title,
    slug,
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
      },
      alt
    },
    category->{
      title,
      slug,
      color
    }
  }`,
  
  // Get site settings
  getSiteSettings: `*[_type == "siteSettings"][0] {
    title,
    description,
    keywords,
    socialLinks,
    aboutText
  }`,
  
  // Get artworks by category
  getArtworksByCategory: `*[_type == "artwork" && category->slug.current == $categorySlug] | order(order asc, _createdAt desc) {
    _id,
    title,
    slug,
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
      },
      alt
    },
    year,
    description,
    dimensions,
    medium
  }`,
}