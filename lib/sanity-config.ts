const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01"

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
}

export function getClient() {
  return {
    async fetch(query: string, params?: Record<string, any>) {
      const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}${
        params ? `&${new URLSearchParams(params).toString()}` : ""
      }`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Sanity API error: ${response.statusText}`)
      }
      return response.json()
    },
  }
}
