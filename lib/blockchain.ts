import { ethers } from "ethers"

// U2U Testnet configuration
export const U2U_TESTNET_CONFIG = {
  chainId: 2484,
  name: "U2U Testnet",
  rpcUrl: "https://rpc-nebulas-testnet.uniultra.xyz",
  blockExplorer: "https://testnet.u2uscan.xyz",
  nativeCurrency: {
    name: "U2U",
    symbol: "U2U",
    decimals: 18,
  },
}

// Contract ABI (simplified for demo)
export const RWA_NFT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "string", name: "itemName", type: "string" },
      { internalType: "string", name: "serialNumber", type: "string" },
    ],
    name: "mintNFT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getRWAMetadata",
    outputs: [
      {
        components: [
          { internalType: "string", name: "itemName", type: "string" },
          { internalType: "string", name: "serialNumber", type: "string" },
          { internalType: "uint256", name: "mintTimestamp", type: "uint256" },
          { internalType: "address", name: "originalOwner", type: "address" },
        ],
        internalType: "struct RWANFTContract.RWAMetadata",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "string", name: "itemName", type: "string" },
      { indexed: false, internalType: "string", name: "serialNumber", type: "string" },
      { indexed: false, internalType: "string", name: "metadataURI", type: "string" },
    ],
    name: "NFTMinted",
    type: "event",
  },
]

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x..." // Replace with actual deployed contract address

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private contract: ethers.Contract | null = null

  async connectWallet(): Promise<{ address: string; chainId: number }> {
    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask.")
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      const address = await this.signer.getAddress()
      const network = await this.provider.getNetwork()

      // Check if we're on U2U testnet
      if (Number(network.chainId) !== U2U_TESTNET_CONFIG.chainId) {
        await this.switchToU2UTestnet()
      }

      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") {
        console.warn("Contract address not set. Please deploy the contract and update CONTRACT_ADDRESS.")
      }

      // Initialize contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, RWA_NFT_ABI, this.signer)

      return {
        address,
        chainId: Number(network.chainId),
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  async switchToU2UTestnet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    try {
      // Try to switch to U2U testnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${U2U_TESTNET_CONFIG.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // If the chain doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${U2U_TESTNET_CONFIG.chainId.toString(16)}`,
              chainName: U2U_TESTNET_CONFIG.name,
              rpcUrls: [U2U_TESTNET_CONFIG.rpcUrl],
              blockExplorerUrls: [U2U_TESTNET_CONFIG.blockExplorer],
              nativeCurrency: U2U_TESTNET_CONFIG.nativeCurrency,
            },
          ],
        })
      } else {
        throw switchError
      }
    }
  }

  async mintNFT(
    to: string,
    itemName: string,
    serialNumber: string,
    imageUrl: string,
  ): Promise<{ tokenId: number; transactionHash: string }> {
    if (!this.contract || !this.signer) {
      throw new Error("Wallet not connected")
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") {
      throw new Error("Contract not deployed. Please deploy the contract first.")
    }

    try {
      // Create metadata JSON
      const metadata = {
        name: `${itemName} #${serialNumber}`,
        description: `Real World Asset NFT for ${itemName}`,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Item Type",
            value: itemName,
          },
          {
            trait_type: "Serial Number",
            value: serialNumber,
          },
          {
            trait_type: "Mint Date",
            value: new Date().toISOString(),
          },
          {
            trait_type: "Blockchain",
            value: "U2U Testnet",
          },
        ],
      }

      // For demo purposes, we'll use a mock metadata URI
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

      const gasEstimate = await this.contract.mintNFT.estimateGas(to, metadataURI, itemName, serialNumber)
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100) // Add 20% buffer

      // Call the mint function
      const transaction = await this.contract.mintNFT(to, metadataURI, itemName, serialNumber, {
        gasLimit: gasLimit,
      })

      console.log("Transaction submitted:", transaction.hash)

      // Wait for transaction confirmation
      const receipt = await transaction.wait()
      console.log("Transaction confirmed:", receipt)

      let tokenId = 0

      // Try to parse NFTMinted event first
      const nftMintedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log)
          return parsed?.name === "NFTMinted"
        } catch {
          return false
        }
      })

      if (nftMintedEvent) {
        const parsed = this.contract.interface.parseLog(nftMintedEvent)
        tokenId = Number(parsed?.args[0] || 0)
      } else {
        // Fallback to Transfer event
        const transferEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = this.contract!.interface.parseLog(log)
            return parsed?.name === "Transfer"
          } catch {
            return false
          }
        })

        if (transferEvent) {
          const parsed = this.contract.interface.parseLog(transferEvent)
          tokenId = Number(parsed?.args[2] || 0)
        }
      }

      return {
        tokenId,
        transactionHash: receipt.hash,
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error)

      if (error.code === 4001) {
        throw new Error("Transaction was rejected by user")
      } else if (error.code === -32603) {
        throw new Error("Internal JSON-RPC error. Please check your network connection.")
      } else if (error.message.includes("insufficient funds")) {
        throw new Error("Insufficient funds for transaction")
      } else if (error.message.includes("gas")) {
        throw new Error("Transaction failed due to gas issues")
      }

      throw error
    }
  }

  async getTotalSupply(): Promise<number> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const supply = await this.contract.totalSupply()
      return Number(supply)
    } catch (error) {
      console.error("Error getting total supply:", error)
      throw error
    }
  }

  async getRWAMetadata(tokenId: number) {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const metadata = await this.contract.getRWAMetadata(tokenId)
      return {
        itemName: metadata.itemName,
        serialNumber: metadata.serialNumber,
        mintTimestamp: Number(metadata.mintTimestamp),
        originalOwner: metadata.originalOwner,
      }
    } catch (error) {
      console.error("Error getting RWA metadata:", error)
      throw error
    }
  }

  async isContractDeployed(): Promise<boolean> {
    if (!this.provider || !CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") {
      return false
    }

    try {
      const code = await this.provider.getCode(CONTRACT_ADDRESS)
      return code !== "0x"
    } catch (error) {
      console.error("Error checking contract deployment:", error)
      return false
    }
  }

  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error("Provider not initialized")
    }

    try {
      const network = await this.provider.getNetwork()
      return {
        chainId: Number(network.chainId),
        name: network.name,
        isU2UTestnet: Number(network.chainId) === U2U_TESTNET_CONFIG.chainId,
      }
    } catch (error) {
      console.error("Error getting network info:", error)
      throw error
    }
  }
}

// Global blockchain service instance
export const blockchainService = new BlockchainService()

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
