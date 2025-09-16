"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ARCanvas } from "@/components/ar-canvas"
import { ARScene, WatchModel } from "@/components/ar-scene"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, AlertCircle, Scan, Zap, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WalletConnectRainbow } from "@/components/wallet-connect-rainbow"
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'



// Contract ABI
const CONTRACT_ABI = [
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
] as const

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function ARNFTDemo() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isARActive, setIsARActive] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState<"idle" | "success" | "error">("idle")
  const [detectionConfidence, setDetectionConfidence] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string>("")
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null)
  const [transactionHash, setTransactionHash] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  
  // Use wagmi hooks
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  // Wagmi contract hooks
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const startCamera = async () => {
    try {
      setCameraError("")
      setIsScanning(true)

      // Try to get back camera first, fallback to any available camera
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
      } catch (error) {
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
      }

      setCameraStream(stream)
      setIsARActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      simulateObjectDetection()

      toast({
        title: "Camera Started",
        description: "AR mode activated. Point camera at a watch to detect RWA.",
      })
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      setCameraError(error.message || "Unable to access camera")
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const simulateObjectDetection = useCallback(() => {
    let confidence = 0
    const interval = setInterval(() => {
      confidence += Math.random() * 0.1 + 0.05
      if (confidence > 1) confidence = 1

      setDetectionConfidence(confidence)

      if (confidence > 0.9) {
        clearInterval(interval)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
      setIsARActive(false)
      setDetectionConfidence(0)
      setCameraError("")
    }
  }

  const mintNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (detectionConfidence < 0.7) {
      toast({
        title: "Detection Required",
        description: "Please ensure the watch is clearly detected (>70% confidence)",
        variant: "destructive",
      })
      return
    }

    if (chainId !== 2484) {
      toast({
        title: "Wrong Network",
        description: "Please switch to U2U Testnet to mint NFT",
        variant: "destructive",
      })
      return
    }

    if (!address) {
      toast({
        title: "No Address",
        description: "Wallet address not found",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Minting NFT with address:", address)
      console.log("Chain ID:", chainId)
      console.log("Contract address:", CONTRACT_ADDRESS)

      // Create metadata
      const metadata = {
        name: "Luxury Watch #LW-2024-001",
        description: "Real World Asset NFT for Luxury Watch",
        image: "/luxury-watch-with-serial-number-lw-2024-001.jpg",
        attributes: [
          { trait_type: "Item Type", value: "Luxury Watch" },
          { trait_type: "Serial Number", value: "LW-2024-001" },
          { trait_type: "Mint Date", value: new Date().toISOString() },
          { trait_type: "Blockchain", value: "U2U Testnet" },
        ],
      }

      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
      console.log("Metadata URI:", metadataURI)

      toast({
        title: "Submitting Transaction",
        description: "Please confirm the transaction in your wallet...",
      })

      // Call contract using wagmi
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintNFT',
        args: [address, metadataURI, "Luxury Watch", "LW-2024-001"],
      })

    } catch (error: any) {
      console.error("Minting error:", error)
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      })
    }
  }

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      setMintStatus("success")
      setTransactionHash(hash)
      setMintedTokenId(1) // Placeholder token ID
      
      toast({
        title: "NFT Minted Successfully!",
        description: `Transaction: ${hash.slice(0, 10)}...`,
      })
    }
  }, [isConfirmed, hash, toast])

  // Handle transaction error
  useEffect(() => {
    if (error) {
      setMintStatus("error")
      toast({
        title: "Minting Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">AR + NFT RWA Demo</h1>
          <p className="text-slate-300 text-lg">Mint Real World Assets as NFTs using Augmented Reality</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* AR Camera View */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="w-5 h-5" />
                AR Camera View
                {isScanning && (
                  <Badge variant="secondary" className="bg-blue-600 animate-pulse">
                    <Scan className="w-3 h-3 mr-1" />
                    Scanning
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-square bg-slate-900 rounded-lg overflow-hidden">
                {/* Video background */}
                {cameraStream && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Camera error overlay */}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="text-center text-white">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                      <p className="text-lg font-medium mb-2">Camera Error</p>
                      <p className="text-sm text-slate-300">{cameraError}</p>
                    </div>
                  </div>
                )}

                {/* 3D AR Overlay */}
                <div className="absolute inset-0">
                  <ARCanvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    {/* 3D Watch Model */}
                    <WatchModel isDetected={isARActive && detectionConfidence > 0.5} />

                    {/* AR Overlay */}
                    <ARScene isVisible={isARActive} detectionConfidence={detectionConfidence} />
                  </ARCanvas>
                </div>

                {/* Camera controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                  {!isARActive ? (
                    <Button onClick={startCamera} className="bg-green-600 hover:bg-green-700" disabled={isScanning}>
                      {isScanning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Starting Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Start AR Camera
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={stopCamera} variant="destructive">
                      Stop Camera
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            <WalletConnectRainbow />

            {/* RWA Detection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">RWA Detection</CardTitle>
              </CardHeader>
              <CardContent>
                {isARActive ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">Luxury Watch Detected</span>
                    </div>

                    {/* Confidence meter */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Detection Confidence</span>
                        <span className="text-white">{Math.round(detectionConfidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${detectionConfidence * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-300 space-y-1">
                      <p>
                        <strong>Item:</strong> Luxury Watch
                      </p>
                      <p>
                        <strong>Serial:</strong> LW-2024-001
                      </p>
                      <p>
                        <strong>Status:</strong> {detectionConfidence > 0.7 ? "Ready to mint" : "Scanning..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>Start camera to detect RWA</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mint NFT */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Mint NFT RWA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={mintNFT}
                  disabled={
                    !isARActive || !isConnected || isPending || isConfirming || detectionConfidence < 0.7 || chainId !== 2484
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  size="lg"
                >
                  {isPending || isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isPending ? "Confirming..." : "Minting NFT..."}
                    </>
                  ) : (
                    "Mint NFT RWA"
                  )}
                </Button>

                {/* Validation messages */}
                {!isConnected && <p className="text-sm text-yellow-400 mt-2">⚠️ Connect wallet to continue</p>}
                {!isARActive && isConnected && (
                  <p className="text-sm text-yellow-400 mt-2">⚠️ Start camera to detect RWA</p>
                )}
                {isARActive && isConnected && detectionConfidence < 0.7 && (
                  <p className="text-sm text-yellow-400 mt-2">⚠️ Improve detection confidence (&gt;70%)</p>
                )}
                {isConnected && chainId !== 2484 && (
                  <p className="text-sm text-red-400 mt-2">⚠️ Switch to U2U Testnet to mint</p>
                )}

                {mintStatus === "success" && (
                  <div className="mt-4 p-3 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">NFT Minted Successfully!</span>
                    </div>
                    <div className="text-sm text-green-300 mt-2 space-y-1">
                      <p>Token ID: #{mintedTokenId} | Network: U2U Testnet</p>
                      {transactionHash && (
                        <div className="flex items-center gap-1">
                          <span>Transaction:</span>
                          <a
                            href={`https://testnet.u2uscan.xyz/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 underline flex items-center gap-1"
                          >
                            {transactionHash.slice(0, 10)}...
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {mintStatus === "error" && (
                  <div className="mt-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Minting Failed</span>
                    </div>
                    <p className="text-sm text-red-300 mt-1">Please check your wallet and try again.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
