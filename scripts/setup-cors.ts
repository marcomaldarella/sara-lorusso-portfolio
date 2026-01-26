#!/usr/bin/env tsx
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false
})

async function addCorsOrigins() {
  try {
    console.log('🔧 Adding CORS origins for localhost...')
    
    // Add localhost origins for development
    const origins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3000',
      'https://127.0.0.1:3000'
    ]
    
    for (const origin of origins) {
      try {
        const response = await fetch(
          `https://api.sanity.io/v2021-06-07/projects/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/cors`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.SANITY_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              origin,
              allowCredentials: false
            })
          }
        )
        
        if (response.ok) {
          console.log(`✅ Added CORS origin: ${origin}`)
        } else {
          const error = await response.text()
          console.log(`⚠️  ${origin}: ${error}`)
        }
      } catch (error) {
        console.log(`⚠️  Failed to add ${origin}:`, error)
      }
    }
    
    console.log('\n🎉 CORS configuration completed!')
    console.log('You can now make requests from localhost:3000')
    
  } catch (error) {
    console.error('❌ Error configuring CORS:', error)
  }
}

addCorsOrigins()