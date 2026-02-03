import { createClient } from '@sanity/client'

const c = createClient({
  projectId: '3tjmr9u6',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// Check for drafts
const drafts = await c.fetch('*[_type == "photo" && _id in path("drafts.**")]{_id, title}')
console.log(`Draft documents: ${drafts.length}`)

const published = await c.fetch('*[_type == "photo" && !(_id in path("drafts.**"))]{_id, title}')
console.log(`Published documents: ${published.length}`)

console.log(`Total: ${drafts.length + published.length}`)
