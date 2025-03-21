/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '9000',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: '127.0.0.1',
          port: '9000',
          pathname: '/**',
        },
      ],
    },
  }

  module.exports = nextConfig
