/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  // Disable static optimization for dynamic routes that depend on database
  async generateStaticParams() {
    return [];
  },
  // Configure build behavior for better deployment
  output: 'standalone',
  // Ensure database connections work during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure MongoDB driver works in serverless environment
      config.externals.push({
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        'aws4': 'commonjs aws4',
        'snappy': 'commonjs snappy',
        'kerberos': 'commonjs kerberos',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      });
    }
    
    // Ignore node-specific modules in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    return config;
  },
  // Optimize images
  images: {
    domains: ['images.pexels.com'],
    unoptimized: false,
  },
  // Reduce bundle size
  swcMinify: true,
  // Improve build performance
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;