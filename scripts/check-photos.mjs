import { createClient } from '@sanity/client'

const c = createClient({
  projectId: '3tjmr9u6',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

const r = await c.fetch('*[_type == "photo"]{_id, title, category}')
const personal = r.filter(d => d.category === 'personal')
const commissioned = r.filter(d => d.category === 'commissioned')
console.log(`Total: ${r.length} | Personal: ${personal.length} | Commissioned: ${commissioned.length}`)
if (commissioned.length > 0) console.log('First commissioned:', commissioned[0])
