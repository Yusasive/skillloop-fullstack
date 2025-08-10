/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },

  output: "standalone",

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "mongodb-client-encryption": "commonjs mongodb-client-encryption",
        aws4: "commonjs aws4",
        snappy: "commonjs snappy",
        kerberos: "commonjs kerberos",
        "@mongodb-js/zstd": "commonjs @mongodb-js/zstd",
      });
    }

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

  images: {
    domains: ["images.pexels.com"],
    unoptimized: false,
  },

  swcMinify: true,

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
