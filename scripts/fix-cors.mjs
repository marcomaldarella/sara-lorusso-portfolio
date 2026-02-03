import { createClient } from '@sanity/client'

const c = createClient({
  projectId: '3tjmr9u6',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// List current CORS origins
const origins = await c.request({ uri: '/cors', method: 'GET' })
console.log('Current CORS origins:', origins)

// Add localhost if missing
const hasLocalhost = origins.some(o => o.origin === 'http://localhost:3000')
if (!hasLocalhost) {
  console.log('Adding http://localhost:3000...')
  await c.request({
    uri: '/cors',
    method: 'POST',
    body: { origin: 'http://localhost:3000', allowCredentials: true },
  })
  console.log('Added!')
} else {
  console.log('Already present.')
}

// List again
const updated = await c.request({ uri: '/cors', method: 'GET' })
console.log('Updated CORS origins:', updated)
