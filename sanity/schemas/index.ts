export const schemas = [
  {
    name: 'artwork',
    title: 'Artwork',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'title',
          maxLength: 96,
        },
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'image',
        title: 'Image',
        type: 'image',
        options: {
          hotspot: true,
        },
        fields: [
          {
            name: 'alt',
            type: 'string',
            title: 'Alternative Text',
            validation: (Rule: any) => Rule.required()
          }
        ],
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'category',
        title: 'Category',
        type: 'reference',
        to: [{type: 'category'}],
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
        rows: 4
      },
      {
        name: 'dimensions',
        title: 'Dimensions',
        type: 'string',
        description: 'e.g. "30x40 cm" or "12x16 inches"'
      },
      {
        name: 'year',
        title: 'Year',
        type: 'number',
        validation: (Rule: any) => Rule.required().min(1900).max(new Date().getFullYear())
      },
      {
        name: 'medium',
        title: 'Medium',
        type: 'string',
        description: 'e.g. "Digital Photography", "Film Photography", "Mixed Media"'
      },
      {
        name: 'isCommissioned',
        title: 'Is Commissioned Work',
        type: 'boolean',
        initialValue: false
      },
      {
        name: 'isFeatured',
        title: 'Featured on Homepage',
        type: 'boolean',
        initialValue: false
      },
      {
        name: 'order',
        title: 'Display Order',
        type: 'number',
        description: 'Used to sort artworks. Lower numbers appear first.'
      }
    ],
    preview: {
      select: {
        title: 'title',
        media: 'image',
        category: 'category.title'
      },
      prepare(selection: any) {
        const {title, media, category} = selection
        return {
          title: title,
          subtitle: category || 'Uncategorized',
          media: media
        }
      }
    }
  },
  {
    name: 'category',
    title: 'Category',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'title',
          maxLength: 96,
        },
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
        rows: 3
      },
      {
        name: 'color',
        title: 'Theme Color',
        type: 'color',
        description: 'Optional theme color for this category'
      }
    ]
  },
  {
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Site Title',
        type: 'string',
        initialValue: 'Sara Lorusso Photography'
      },
      {
        name: 'description',
        title: 'Site Description',
        type: 'text',
        rows: 3
      },
      {
        name: 'keywords',
        title: 'SEO Keywords',
        type: 'array',
        of: [{type: 'string'}],
        options: {
          layout: 'tags'
        }
      },
      {
        name: 'socialLinks',
        title: 'Social Media Links',
        type: 'object',
        fields: [
          {
            name: 'instagram',
            title: 'Instagram URL',
            type: 'url'
          },
          {
            name: 'email',
            title: 'Contact Email',
            type: 'email'
          }
        ]
      },
      {
        name: 'aboutText',
        title: 'About Text',
        type: 'array',
        of: [{type: 'block'}]
      }
    ]
  }
]