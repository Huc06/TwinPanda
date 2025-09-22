import { ethers } from "ethers"

// Simple contract ABI - chỉ có mintNFT function
export const SIMPLE_ABI = [
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
]

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x8F7714bEb51Bb60d87Da6f9BD28874d0D7D341f1"

export class SimpleBlockchainService {
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

      console.log("Connected to:", address)
      console.log("Network:", network.name, "Chain ID:", network.chainId)

      // Initialize contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, this.signer)

      return {
        address,
        chainId: Number(network.chainId),
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
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

    try {
      console.log("Starting mint process...")
      console.log("To:", to)
      console.log("Item:", itemName)
      console.log("Serial:", serialNumber)

      // Create simple metadata
      const metadata = {
        name: `${itemName} #${serialNumber}`,
        description: `Real World Asset NFT for ${itemName}`,
        image: imageUrl,
      }

      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
      console.log("Metadata URI:", metadataURI)

      // Try to estimate gas first
      let gasEstimate
      try {
        gasEstimate = await this.contract.mintNFT.estimateGas(to, metadataURI, itemName, serialNumber)
        console.log("Gas estimate:", gasEstimate.toString())
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError)
        // Use a default gas limit
        gasEstimate = BigInt(500000)
      }

      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100) // Add 20% buffer
      console.log("Gas limit:", gasLimit.toString())

      // Call the mint function
      console.log("Calling mintNFT...")
      const transaction = await this.contract.mintNFT(to, metadataURI, itemName, serialNumber, {
        gasLimit: gasLimit,
      })

      console.log("Transaction submitted:", transaction.hash)

      // Wait for transaction confirmation
      console.log("Waiting for confirmation...")
      const receipt = await transaction.wait()
      console.log("Transaction confirmed:", receipt)

      // Try to get token ID from events
      let tokenId = 0
      
      // Look for Transfer event (standard ERC721)
      for (const log of receipt.logs) {
        try {
          const parsed = this.contract.interface.parseLog(log)
          if (parsed?.name === "Transfer") {
            tokenId = Number(parsed.args[2] || 0)
            console.log("Found Transfer event, tokenId:", tokenId)
            break
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // If no Transfer event found, try to get from totalSupply
      if (tokenId === 0) {
        try {
          const totalSupply = await this.contract.totalSupply()
          tokenId = Number(totalSupply) - 1
          console.log("Using totalSupply - 1, tokenId:", tokenId)
        } catch (e) {
          console.log("Could not get totalSupply, using 0")
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
      } else if (error.message.includes("execution reverted")) {
        throw new Error("Transaction reverted. Check contract state.")
      }

      throw error
    }
  }
}

// Global simple blockchain service instance
export const simpleBlockchainService = new SimpleBlockchainService()

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
