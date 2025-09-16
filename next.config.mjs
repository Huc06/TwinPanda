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
  webpack: (config, { isServer }) => {
    // Handle React Three Fiber on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Fix for WalletConnect indexedDB SSR issues
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "idb-keyval": false,
        "indexeddb-shim": false,
      };
    }

    return config;
  },
  transpilePackages: ["@react-three/fiber", "@react-three/drei", "three"],
};

export default nextConfig;
