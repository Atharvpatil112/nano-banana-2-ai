import pkg from "workflow/next"
const { withWorkflow } = pkg

/** @type {import('next').NextConfig} */
const nextConfig = {

  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'generativelanguage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'vercel.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-avatar',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      'date-fns',
      'class-variance-authority',
      'swr',
    ],
  },
}

export default withWorkflow(nextConfig)
