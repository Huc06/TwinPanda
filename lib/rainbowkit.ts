import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'AR NFT RWA Demo',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id-12345678', // Get this from https://cloud.walletconnect.com
  chains: [
    // Add U2U Testnet first
    {
      id: 2484,
      name: 'U2U Testnet',
      nativeCurrency: {
        decimals: 18,
        name: 'U2U',
        symbol: 'U2U',
      },
      rpcUrls: {
        default: { http: ['https://rpc-nebulas-testnet.uniultra.xyz'] },
        public: { http: ['https://rpc-nebulas-testnet.uniultra.xyz'] },
      },
      blockExplorers: {
        default: { name: 'U2U Scan', url: 'https://testnet.u2uscan.xyz' },
      },
      testnet: true,
    },
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
  ],
  ssr: false, // Disable SSR to avoid WalletConnect conflicts
})
