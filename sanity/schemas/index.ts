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
            {title: 'Work', value: 'work'},
            {title: 'Commissioned', value: 'commissioned'}
          ]
        },
        initialValue: 'work'
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
        return {
          title: title || 'Untitled',
          subtitle: caption ? `${category || 'work'} — ${caption}` : (category || 'work'),
          media: media
        }
      }
    }
  }
]