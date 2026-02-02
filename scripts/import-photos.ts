#!/usr/bin/env tsx
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
function loadEnvFromFiles() {
  const root = process.cwd()
  const candidates = ['.env.local', '.env', '.env.production']
  for (const fname of candidates) {
    const p = path.join(root, fname)
    if (!fs.existsSync(p)) continue
    try {
      const content = fs.readFileSync(p, 'utf-8')
      content.split('\n').forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) return
        const key = trimmed.slice(0, eqIdx).trim()
        let val = trimmed.slice(eqIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
          val = val.slice(1, -1)
        }
        if (!(key in process.env)) {
          process.env[key] = val
        }
      })
    } catch {}
  }
}

// Carica env prima di creare il client
loadEnvFromFiles()

type Category = 'personal' | 'commissioned'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN, // Requires a write token
  useCdn: false
})

function ensureEnv() {
  const missing: string[] = []
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) missing.push('NEXT_PUBLIC_SANITY_PROJECT_ID')
  if (!process.env.NEXT_PUBLIC_SANITY_DATASET) missing.push('NEXT_PUBLIC_SANITY_DATASET')
  if (!process.env.SANITY_TOKEN) missing.push('SANITY_TOKEN')
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`)
  }
}

async function getExistingTitles() {
  try {
    const existing = await client.fetch<{title: string}[]>(`*[_type == "photo"]{title}`)
    return new Set(existing.map(p => p.title))
  } catch (e) {
    console.warn('Could not fetch existing photos, proceeding without dedupe')
    return new Set<string>()
  }
}

function loadCaptionsMap(dir: string): Record<string, string> {
  const mapPath = path.join(dir, 'captions.json')
  if (fs.existsSync(mapPath)) {
    try {
      const raw = fs.readFileSync(mapPath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed as Record<string, string>
    } catch (e) {
      console.warn(`Failed to parse captions.json in ${dir}, ignoring`)
    }
  }
  return {}
}

async function uploadImage(imagePath: string, category: Category, caption?: string) {
  try {
    console.log(`Uploading ${imagePath}...`)

    const imageBuffer = fs.readFileSync(imagePath)
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: path.basename(imagePath)
    })

    const photoDoc: any = {
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

    if (caption) photoDoc.caption = caption

    const result = await client.create(photoDoc)
    console.log(`✅ Uploaded: ${result.title} (${category})`)
    return result
  } catch (error) {
    console.error(`❌ Failed to upload ${imagePath}:`, error)
  }
}

function listImages(dir: string): string[] {
  return fs.readdirSync(dir).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
}

async function importFolder(publicDir: string, subdir: string, category: Category, existingTitles: Set<string>) {
  const dir = path.join(publicDir, subdir)
  if (!fs.existsSync(dir)) {
    console.log(`⏭️  Skipping ${category} (folder not found: ${subdir})`)
    return
  }

  const files = listImages(dir)
  const captions = loadCaptionsMap(dir)
  console.log(`\n📁 Importing ${files.length} ${category} photos...`)

  for (const file of files) {
    const title = file.replace(/\.[^.]+$/, '')
    if (existingTitles.has(title)) {
      console.log(`⏭️  Skipping ${file} (already exists)`) 
      continue
    }
    const caption = captions[file] || captions[title]
    await uploadImage(path.join(dir, file), category, caption)
  }
}

async function importPhotos() {
  ensureEnv()
  const args = process.argv.slice(2)
  const onlyPersonal = args.includes('--personal')
  const onlyCommissioned = args.includes('--commissioned')
  const publicDir = path.join(process.cwd(), 'public')
  const existingTitles = await getExistingTitles()

  if (!onlyCommissioned) {
    await importFolder(publicDir, 'personal', 'personal', existingTitles)
  }
  if (!onlyPersonal) {
    await importFolder(publicDir, 'commissioned', 'commissioned', existingTitles)
  }

  console.log('\n🎉 Import completed!')
}

// Run the import
importPhotos().catch((err) => {
  console.error(err)
  process.exit(1)
})