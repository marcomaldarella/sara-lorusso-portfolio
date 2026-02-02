export const schemas = [
  {
    name: 'photo',
    title: 'Photo',
    type: 'document',
    fields: [
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
      }
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
        const catLabel = category === 'personal' ? 'personal' : (category || 'personal')
        return {
          title: title || 'Untitled',
          subtitle: caption ? `${catLabel} — ${caption}` : catLabel,
          media: media
        }
      }
    }
  }
]