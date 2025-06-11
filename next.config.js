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
  // Configure build behavior
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
    return config;
  },
};

module.exports = nextConfig;