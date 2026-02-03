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
  // Avoid Turbopack picking the wrong workspace root when multiple lockfiles exist.
  turbopack: {
    root: process.cwd(),
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
