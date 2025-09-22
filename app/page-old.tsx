"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box, Sphere, Ring } from "@react-three/drei"
import { ARCanvas } from "@/components/ar-canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Wallet, CheckCircle, AlertCircle, Scan, Zap, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { blockchainService } from "@/lib/blockchain"
import { WalletConnectRainbow } from "@/components/wallet-connect-rainbow"
import { useAccount, useChainId } from 'wagmi'
import type * as THREE from "three"

function AROverlay({ isVisible, detectionConfidence }: { isVisible: boolean; detectionConfidence: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  if (!isVisible) return null

  const confidence = Math.max(0.3, detectionConfidence)
  const glowColor = confidence > 0.8 ? "#00ff88" : confidence > 0.5 ? "#ffaa00" : "#ff6600"

  return (
    <group>
      {/* Animated scanning ring */}
      <Ring ref={ringRef} args={[1.8, 2.0, 32]} position={[0, 0, 0.1]}>
        <meshBasicMaterial color={glowColor} transparent opacity={0.6} />
      </Ring>

      {/* Main detection frame */}
      <Box ref={meshRef} args={[2.2, 2.2, 0.1]} position={[0, 0, -0.1]}>
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
      </Box>

      {/* Corner markers */}
      {[-1, 1].map((x) =>
        [-1, 1].map((y) => (
          <Box key={`${x}-${y}`} args={[0.3, 0.3, 0.05]} position={[x * 1.2, y * 1.2, 0.05]}>
            <meshBasicMaterial color={glowColor} transparent opacity={0.8} />
          </Box>
        )),
      )}

      {/* Confidence indicator spheres */}
      {Array.from({ length: Math.floor(confidence * 5) }, (_, i) => (
        <Sphere key={i} args={[0.05]} position={[-1.5 + i * 0.3, 1.8, 0]}>
          <meshBasicMaterial color={glowColor} />
        </Sphere>
      ))}

      {/* Info text with confidence */}
      <Text position={[0, 1.8, 0]} fontSize={0.2} color={glowColor} anchorX="center" anchorY="middle">
        RWA Detected: Luxury Watch
      </Text>

      <Text position={[0, 1.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
        Confidence: {Math.round(confidence * 100)}%
      </Text>

      <Text position={[0, -1.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
        Serial: LW-2024-001
      </Text>

      <Text position={[0, -1.8, 0]} fontSize={0.12} color="#cccccc" anchorX="center" anchorY="middle">
        Ready to mint NFT
      </Text>
    </group>
  )
}

function WatchModel({ isDetected }: { isDetected: boolean }) {
  const watchRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (watchRef.current && isDetected) {
      watchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      watchRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group ref={watchRef}>
      {/* Watch face */}
      <Box args={[1.5, 1.5, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </Box>

      {/* Watch face glass */}
      <Box args={[1.4, 1.4, 0.05]} position={[0, 0, 0.15]}>
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} transmission={0.9} roughness={0} />
      </Box>

      {/* Watch band */}
      <Box args={[0.3, 2.5, 0.1]} position={[0, 0, -0.2]}>
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </Box>

      {/* Watch crown */}
      <Box args={[0.1, 0.2, 0.1]} position={[0.8, 0, 0]}>
        <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0} />
      </Box>

      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12
        const x = Math.sin(angle) * 0.6
        const y = Math.cos(angle) * 0.6
        return (
          <Box key={i} args={[0.05, 0.15, 0.02]} position={[x, y, 0.12]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        )
      })}

      {/* Watch hands */}
      <Box args={[0.02, 0.4, 0.01]} position={[0, 0.2, 0.13]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.02, 0.3, 0.01]} position={[0, 0.15, 0.13]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
    </group>
  )
}

export default function ARNFTDemo() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isARActive, setIsARActive] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState<"idle" | "success" | "error">("idle")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [detectionConfidence, setDetectionConfidence] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string>("")
  const [chainId, setChainId] = useState<number>(0)
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null)
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

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

  const connectWallet = async () => {
    if (isConnecting) return

    setIsConnecting(true)
    try {
      if (!window.ethereum) {
        toast({
          title: "Wallet Not Found",
          description: "Please install MetaMask or another Web3 wallet.",
          variant: "destructive",
        })
        return
      }

      // Check if MetaMask is available
      if (!window.ethereum.isMetaMask) {
        toast({
          title: "MetaMask Required",
          description: "Please use MetaMask wallet for this demo.",
          variant: "destructive",
        })
        return
      }

      const { address, chainId: connectedChainId } = await blockchainService.connectWallet()

      setWalletConnected(true)
      setWalletAddress(`${address.slice(0, 6)}...${address.slice(-4)}`)
      setChainId(connectedChainId)

      toast({
        title: "Wallet Connected",
        description: `Connected to ${connectedChainId === 2484 ? "U2U Testnet" : "Unknown Network"}`,
      })
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      
      let errorMessage = "Failed to connect wallet"
      if (error.message.includes("Nightly")) {
        errorMessage = "Please use MetaMask wallet instead of Nightly"
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Connection was rejected by user"
      }
      
      toast({
        title: "Wallet Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const mintNFT = async () => {
    if (!walletConnected) {
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
        description: "Please ensure the watch is clearly detected (&gt;70% confidence)",
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

    setIsMinting(true)
    setMintStatus("idle")

    try {
      // Get wallet address for minting
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      const toAddress = accounts[0]

      toast({
        title: "Preparing NFT",
        description: "Creating metadata and preparing transaction...",
      })

      // Create a placeholder image URL for the watch
      const imageUrl = "/luxury-watch-with-serial-number-lw-2024-001.jpg"

      toast({
        title: "Submitting Transaction",
        description: "Please confirm the transaction in your wallet...",
      })

      // Call the real mint function
      const result = await blockchainService.mintNFT(toAddress, "Luxury Watch", "LW-2024-001", imageUrl)

      setMintedTokenId(result.tokenId)
      setTransactionHash(result.transactionHash)
      setMintStatus("success")

      toast({
        title: "NFT Minted Successfully!",
        description: `Token ID: #${result.tokenId} | Tx: ${result.transactionHash.slice(0, 10)}...`,
      })
    } catch (error: any) {
      console.error("Minting error:", error)
      setMintStatus("error")

      let errorMessage = "Failed to mint NFT. Please try again."
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected by user."
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction."
      }

      toast({
        title: "Minting Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

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
                    <AROverlay isVisible={isARActive} detectionConfidence={detectionConfidence} />
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
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Wallet Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!walletConnected ? (
                  <Button onClick={connectWallet} className="w-full" disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      "Connect Wallet"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-600">
                        Connected
                      </Badge>
                      <span className="text-slate-300 text-sm">{walletAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={chainId === 2484 ? "default" : "destructive"}>
                        {chainId === 2484 ? "U2U Testnet" : `Chain ID: ${chainId}`}
                      </Badge>
                      {chainId !== 2484 && <span className="text-yellow-400 text-xs">Switch to U2U Testnet</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                    !isARActive || !walletConnected || isMinting || detectionConfidence < 0.7 || chainId !== 2484
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  size="lg"
                >
                  {isMinting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Minting NFT...
                    </>
                  ) : (
                    "Mint NFT RWA"
                  )}
                </Button>

                {/* Validation messages */}
                {!walletConnected && <p className="text-sm text-yellow-400 mt-2">⚠️ Connect wallet to continue</p>}
                {!isARActive && walletConnected && (
                  <p className="text-sm text-yellow-400 mt-2">⚠️ Start camera to detect RWA</p>
                )}
                {isARActive && walletConnected && detectionConfidence < 0.7 && (
                  <p className="text-sm text-yellow-400 mt-2">⚠️ Improve detection confidence (&gt;70%)</p>
                )}
                {walletConnected && chainId !== 2484 && (
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
