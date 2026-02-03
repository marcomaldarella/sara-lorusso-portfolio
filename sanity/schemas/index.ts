import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const schemas = [
  {
    name: 'photo',
    title: 'Photo',
    type: 'document',
    // Abilita ordinamenti custom (usato dal desk item orderable)
    orderings: [orderRankOrdering],
    fields: [
      // Campo nascosto usato per il drag & drop nell'elenco Personal
      orderRankField({ type: 'photo' }),
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        initialValue: 'Untitled'
      },
      {
        name: 'image',
        title: 'Image',
        type: 'image',
        options: {
          hotspot: true,
        },
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'caption',
        title: 'Caption',
        type: 'string',
        description: 'Optional caption for grid view',
      },
      {
        name: 'category',
        title: 'Category',
        type: 'string',
        options: {
          list: [
            {title: 'Personal', value: 'personal'},
            {title: 'Commissioned', value: 'commissioned'}
          ]
        },
        initialValue: 'personal'
      },
      {
        name: 'subcategory',
        title: 'Subcategory',
        type: 'string',
        description: 'Group photos by subcategory (e.g., "Portraits", "Landscapes")',
      },
      // rimuoviamo 'order' numerico: usiamo orderRank del plugin
    ],
    preview: {
      select: {
        title: 'title',
        media: 'image',
        category: 'category',
        caption: 'caption'
      },
      prepare(selection: any) {
        const {title, media, category, caption} = selection
        return {
          title: title || 'Untitled',
          subtitle: caption ? `${category || 'personal'} — ${caption}` : (category || 'personal'),
          media: media
        }
      }
    }
  }
]