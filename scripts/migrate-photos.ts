import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  token: process.env.SANITY_TOKEN, // Needs write token
})

async function uploadImageToSanity(imagePath: string) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: path.basename(imagePath),
    })
    return asset
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error)
    return null
  }
}

async function createPhotoDocument(asset: any, category: string, filename: string) {
  try {
    const photo = {
      _type: 'photo',
      title: filename.replace(/\.\w+$/, ''), // Remove extension
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
      category: category,
    }

    const doc = await client.create(photo)
    return doc
  } catch (error) {
    console.error(`Error creating photo document for ${filename}:`, error)
    return null
  }
}

async function migratePhotos() {
  console.log('🚀 Starting photo migration to Sanity...')

  // Get all existing photos to avoid duplicates
  const existingPhotos = await client.fetch('*[_type == "photo"]{title}')
  const existingTitles = new Set(existingPhotos.map((p: any) => p.title))

  // Process works folder
  const worksDir = path.join(process.cwd(), 'public/works')
  if (fs.existsSync(worksDir)) {
    const workFiles = fs.readdirSync(worksDir).filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    )
    
    console.log(`📁 Found ${workFiles.length} images in works folder`)
    
    for (const file of workFiles) {
      const title = file.replace(/\.\w+$/, '')
      
      if (existingTitles.has(title)) {
        console.log(`⏭️  Skipping ${file} (already exists)`)
        continue
      }

      console.log(`📷 Processing works/${file}...`)
      const asset = await uploadImageToSanity(path.join(worksDir, file))
      
      if (asset) {
        const doc = await createPhotoDocument(asset, 'personal', file)
        if (doc) {
          console.log(`✅ Created photo: ${doc.title}`)
        }
      }
    }
  }

  // Process commissioned folder
  const commissionedDir = path.join(process.cwd(), 'public/commissioned')
  if (fs.existsSync(commissionedDir)) {
    const commissionedFiles = fs.readdirSync(commissionedDir).filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    )
    
    console.log(`📁 Found ${commissionedFiles.length} images in commissioned folder`)
    
    for (const file of commissionedFiles) {
      const title = file.replace(/\.\w+$/, '')
      
      if (existingTitles.has(title)) {
        console.log(`⏭️  Skipping ${file} (already exists)`)
        continue
      }

      console.log(`📷 Processing commissioned/${file}...`)
      const asset = await uploadImageToSanity(path.join(commissionedDir, file))
      
      if (asset) {
        const doc = await createPhotoDocument(asset, 'commissioned', file)
        if (doc) {
          console.log(`✅ Created photo: ${doc.title}`)
        }
      }
    }
  }

  console.log('🎉 Migration completed!')
}

// Run if called directly
if (require.main === module) {
  migratePhotos().catch(console.error)
}

export { migratePhotos }