import { createClient } from '@sanity/client'
import { readFileSync, readdirSync } from 'fs'
import path from 'path'

const client = createClient({
  projectId: '3tjmr9u6',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

async function importCategory(category) {
  const folder = path.resolve(`public/${category}`)
  const files = readdirSync(folder).filter(f => f.endsWith('.jpg')).sort()

  console.log(`Importing ${files.length} photos for "${category}"...`)

  for (const file of files) {
    const filePath = path.join(folder, file)
    const num = file.replace('.jpg', '')
    const title = `${category} ${num}`

    console.log(`  Uploading ${file}...`)
    const imageBuffer = readFileSync(filePath)
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: file,
      contentType: 'image/jpeg',
    })

    await client.create({
      _type: 'photo',
      title,
      category,
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      },
    })
    console.log(`  ✓ ${file}`)
  }

  console.log(`Done: ${files.length} "${category}" photos imported.`)
}

async function main() {
  await importCategory('personal')
  await importCategory('commissioned')
  console.log('All done!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
