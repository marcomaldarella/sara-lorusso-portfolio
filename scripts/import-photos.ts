#!/usr/bin/env tsx
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN, // Need write token
  useCdn: false
})

async function uploadImage(imagePath: string, category: 'work' | 'commissioned') {
  try {
    console.log(`Uploading ${imagePath}...`)
    
    // Upload image asset first
    const imageBuffer = fs.readFileSync(imagePath)
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: path.basename(imagePath)
    })
    
    // Create photo document
    const photoDoc = {
      _type: 'photo',
      title: path.basename(imagePath, path.extname(imagePath)),
      category,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      }
    }
    
    const result = await client.create(photoDoc)
    console.log(`✅ Uploaded: ${result.title} (${category})`)
    return result
  } catch (error) {
    console.error(`❌ Failed to upload ${imagePath}:`, error)
  }
}

async function importPhotos() {
  const publicDir = path.join(process.cwd(), 'public')
  
  // Import commissioned photos
  const commissionedDir = path.join(publicDir, 'commissioned')
  if (fs.existsSync(commissionedDir)) {
    const commissionedFiles = fs.readdirSync(commissionedDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    
    console.log(`\n📁 Importing ${commissionedFiles.length} commissioned photos...`)
    for (const file of commissionedFiles) {
      await uploadImage(path.join(commissionedDir, file), 'commissioned')
    }
  }
  
  // Import work photos
  const workDir = path.join(publicDir, 'works')
  if (fs.existsSync(workDir)) {
    const workFiles = fs.readdirSync(workDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    
    console.log(`\n📁 Importing ${workFiles.length} work photos...`)
    for (const file of workFiles) {
      await uploadImage(path.join(workDir, file), 'work')
    }
  }
  
  console.log('\n🎉 Import completed!')
}

// Run the import
importPhotos().catch(console.error)