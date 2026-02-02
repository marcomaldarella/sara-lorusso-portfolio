import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemas} from './sanity/schemas'

export default defineConfig({
  name: 'sara-lorusso-portfolio',
  title: 'Sara Lorusso Photography Portfolio',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Personal')
              .child(
                S.documentList()
                  .title('Personal Photos')
                  .filter('_type == "photo" && category == "personal"')
              ),
            S.listItem()
              .title('Commissioned')
              .child(
                S.documentList()
                  .title('Commissioned Photos')
                  .filter('_type == "photo" && category == "commissioned"')
              ),
            S.divider(),
            // Full list (all photos) still accessible
            S.documentTypeListItem('photo').title('All Photos')
          ])
    }),
    visionTool(),
  ],

  schema: {
    types: schemas,

  }
})