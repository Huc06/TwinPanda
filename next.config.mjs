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
  // Disable React Strict Mode to prevent double initialization in development
  reactStrictMode: false,

  webpack: (config, { isServer }) => {
    // Handle React Three Fiber on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    // Fix for WalletConnect indexedDB SSR issues
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "idb-keyval": false,
        "indexeddb-shim": false,
        encoding: false,
      };
    }

    // Optimize for WalletConnect
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push("pino-pretty", "lokijs", "encoding");
    }

    return config;
  },
  transpilePackages: ["@react-three/fiber", "@react-three/drei", "three"],
};

export default nextConfig;
