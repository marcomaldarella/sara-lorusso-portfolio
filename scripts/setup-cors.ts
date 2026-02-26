#!/usr/bin/env tsx
import { createClient } from '@sanity/client'
import fs from 'node:fs'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3tjmr9u6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
let token = process.env.SANITY_TOKEN

function readTokenFromEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8')
    const match = content.match(/^SANITY_TOKEN=(.+)$/m)
    return match ? match[1].trim() : undefined
  } catch {
    return undefined
  }
}

if (!token) {
  token = readTokenFromEnvFile('.env.local') || readTokenFromEnvFile('.env')
}

if (!token) {
  console.error('❌ SANITY_TOKEN mancante. Inseriscilo in .env.local oppure imposta la variabile d’ambiente SANITY_TOKEN.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
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
      'https://127.0.0.1:3000',
      // Dominio produzione
      'https://sara-lorusso.vercel.app',
      // Vercel preview/prod domains
      'https://sara-lorusso-website-git-main-marcomaldarellas-projects.vercel.app',
      'https://sara-lorusso-website-rkdj09t84-marcomaldarellas-projects.vercel.app'
    ]
    
    for (const origin of origins) {
      try {
        const response = await fetch(
          `https://api.sanity.io/v2021-06-07/projects/${projectId}/cors`,
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