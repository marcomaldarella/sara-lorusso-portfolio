import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    // Align CLI project ID with env + studio config
    projectId: '3tjmr9u6',
    dataset: 'production'
  },
  studioHost: 'sara-lorusso-portfolio'
})
