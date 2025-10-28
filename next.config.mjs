/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable inlining of environment variables for server-side code
  // This ensures DATABASE_URL is read at runtime, not build-time
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from inlining process.env
      config.optimization.minimize = false
    }
    return config
  },
}

export default nextConfig