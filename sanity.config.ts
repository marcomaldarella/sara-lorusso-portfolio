import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemas} from './sanity/schemas'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export default defineConfig({
  name: 'sara-lorusso-portfolio',
  title: 'Sara Lorusso Photography Portfolio',
  basePath: '/studio',

  // Usa valori espliciti per evitare problemi con le env locali
  projectId: '3tjmr9u6',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            // Personal con lista ordinabile (drag & drop)
            orderableDocumentListDeskItem({
              type: 'photo',
              title: 'Personal',
              id: 'personal-photos',
              filter: 'category == "personal"',
              S,
              context,
            }),
            // Commissioned con lista ordinabile (drag & drop)
            orderableDocumentListDeskItem({
              type: 'photo',
              title: 'Commissioned',
              id: 'commissioned-photos',
              filter: 'category == "commissioned"',
              S,
              context,
            }),
            S.divider(),
            S.documentTypeListItem('photo').title('All Photos')
          ])
    }),
    visionTool(),
  ],

  schema: {
    types: schemas,
  }
})