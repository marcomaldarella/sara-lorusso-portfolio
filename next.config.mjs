/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  async redirects() {
    return [
      {
        source: '/work',
        destination: '/personal',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
