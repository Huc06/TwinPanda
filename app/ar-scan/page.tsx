"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ARCanvas } from "@/components/ar-canvas";
import { ARScene, WatchModel, PhotoModel } from "@/components/ar-scene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle,
  AlertCircle,
  Scan,
  Zap,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import Link from "next/link";

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
] as const;

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function ARScanPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Use wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Wagmi contract hooks
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Dynamic item fields
  const [itemType, setItemType] = useState("");
  const [itemName, setItemName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "environment"
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [autoCaptured, setAutoCaptured] = useState(false);
  const [showFraming, setShowFraming] = useState(false);
  const framingVideoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      setCameraError("");
      setIsScanning(true);

      // Try to get requested camera facing first, fallback to any available camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (error) {
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }

      setCameraStream(stream);
      setIsARActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      simulateObjectDetection();

      toast({
        title: "Camera Started",
        description: "AR mode activated. Point camera at the item to detect.",
      });
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setCameraError(error.message || "Unable to access camera");
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const simulateObjectDetection = useCallback(() => {
    let confidence = 0;
    const interval = setInterval(() => {
      confidence += Math.random() * 0.1 + 0.05;
      if (confidence > 1) confidence = 1;

      setDetectionConfidence(confidence);

      if (confidence > 0.9) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Auto-capture when detection is high and we haven't captured yet
  useEffect(() => {
    const shouldAutoCapture =
      isARActive &&
      detectionConfidence >= 0.8 &&
      !isCapturing &&
      !imageUrl &&
      !autoCaptured;
    if (shouldAutoCapture && videoRef.current) {
      try {
        setIsCapturing(true);
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          setImageUrl(dataUrl);
          setAutoCaptured(true);
          setShowModel(true);
          toast({
            title: "Auto-captured Image",
            description:
              "High confidence detected, created 3D model from image",
          });
        }
      } finally {
        setIsCapturing(false);
      }
    }
  }, [
    isARActive,
    detectionConfidence,
    isCapturing,
    imageUrl,
    autoCaptured,
    toast,
  ]);

  // When opening framing screen, bind the same MediaStream to a dedicated video element
  useEffect(() => {
    if (showFraming && framingVideoRef.current && cameraStream) {
      framingVideoRef.current.srcObject = cameraStream;
    }
  }, [showFraming, cameraStream]);

  // Switch camera inside framing overlay
  const switchFramingCamera = async () => {
    try {
      const nextFacing =
        cameraFacing === "environment" ? "user" : "environment";
      // Stop current tracks
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      // Request new stream
      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: nextFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (_e) {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }
      setCameraFacing(nextFacing);
      setCameraStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
      if (framingVideoRef.current)
        framingVideoRef.current.srcObject = newStream;
      toast({
        title: "Camera Switched",
        description:
          nextFacing === "environment"
            ? "Using rear camera"
            : "Using front camera",
      });
    } catch (err: any) {
      toast({
        title: "Camera Switch Failed",
        description: err?.message || "Please check camera permissions",
        variant: "destructive",
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setIsARActive(false);
      setDetectionConfidence(0);
      setCameraError("");
    }
  };

  const mintNFT = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect and authenticate your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (detectionConfidence < 0.7) {
      toast({
        title: "Detection Required",
        description:
          "Please ensure the item is clearly detected (>70% confidence)",
        variant: "destructive",
      });
      return;
    }

    if (chainId !== 2484) {
      toast({
        title: "Wrong Network",
        description: "Please switch to U2U Testnet to mint NFT",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "No Address",
        description: "Wallet address not found",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Minting NFT with address:", address);
      console.log("Chain ID:", chainId);
      console.log("Contract address:", CONTRACT_ADDRESS);

      // Validate required fields
      if (!itemName.trim() || !serialNumber.trim()) {
        toast({
          title: "Missing Fields",
          description: "Item name and serial number are required",
          variant: "destructive",
        });
        return;
      }

      // Create metadata
      const metadata = {
        name: `${itemName} #${serialNumber}`,
        description: `Real World Asset NFT for ${itemType}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Item Type", value: itemType },
          { trait_type: "Serial Number", value: serialNumber },
          { trait_type: "Mint Date", value: new Date().toISOString() },
          { trait_type: "Blockchain", value: "U2U Testnet" },
        ],
      };

      const metadataURI = `data:application/json;base64,${btoa(
        JSON.stringify(metadata)
      )}`;
      console.log("Metadata URI:", metadataURI);

      toast({
        title: "Submitting Transaction",
        description: "Please confirm the transaction in your wallet...",
      });

      // Call contract using wagmi
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "mintNFT",
        args: [address, metadataURI, itemName, serialNumber],
      });
    } catch (error: any) {
      console.error("Minting error:", error);
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      });
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      setMintStatus("success");
      setTransactionHash(hash);
      setMintedTokenId(1); // Placeholder token ID

      toast({
        title: "NFT Minted Successfully!",
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });
    }
  }, [isConfirmed, hash, toast]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      setMintStatus("error");
      toast({
        title: "Minting Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              {isLoading ? "Authenticating..." : "Authentication Required"}
            </h1>
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="text-slate-300">
                  Please sign the message in your wallet to authenticate...
                </p>
              </div>
            ) : (
              <p className="text-slate-300 mb-8">
                Please connect your wallet using the navbar to access AR
                scanning
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">AR Asset Scanner</h1>
            <p className="text-slate-300">
              Scan and authenticate real-world assets using AR technology
            </p>
          </div>
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
                  <Badge
                    variant="secondary"
                    className="bg-blue-600 animate-pulse"
                  >
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
                    {/* Prefer PhotoModel if we have a captured image; fallback to placeholder model */}
                    {imageUrl ? (
                      <PhotoModel
                        imageUrl={imageUrl}
                        isVisible={isARActive && showModel}
                      />
                    ) : (
                      showModel && (
                        <WatchModel
                          isDetected={isARActive && detectionConfidence > 0.5}
                        />
                      )
                    )}

                    {/* AR Overlay */}
                    <ARScene
                      isVisible={isARActive}
                      detectionConfidence={detectionConfidence}
                      itemName={itemName}
                      serialNumber={serialNumber}
                    />
                  </ARCanvas>
                </div>

                {/* Camera controls */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center gap-2">
                  {!isARActive ? (
                    <Button
                      onClick={startCamera}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isScanning}
                    >
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
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <Button
                        onClick={stopCamera}
                        variant="destructive"
                        size="sm"
                      >
                        Stop Camera
                      </Button>
                      <div className="flex items-center gap-2 bg-slate-800/70 px-3 py-1 rounded">
                        <Switch
                          id="showModel"
                          checked={showModel}
                          onCheckedChange={setShowModel}
                        />
                        <Label
                          htmlFor="showModel"
                          className="text-slate-200 text-sm"
                        >
                          Show 3D Model
                        </Label>
                      </div>
                      <Button
                        onClick={() => setShowFraming(true)}
                        className="bg-slate-700 hover:bg-slate-600"
                        size="sm"
                      >
                        Open Framing Screen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* RWA Detection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Asset Detection</CardTitle>
              </CardHeader>
              <CardContent>
                {isARActive ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">Item Detected</span>
                    </div>

                    {/* Confidence meter */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          Detection Confidence
                        </span>
                        <span className="text-white">
                          {Math.round(detectionConfidence * 100)}%
                        </span>
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
                        <strong>Item:</strong> {itemName || "(not entered)"}
                      </p>
                      <p>
                        <strong>Serial:</strong>{" "}
                        {serialNumber || "(not entered)"}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {detectionConfidence > 0.7
                          ? "Ready to mint"
                          : "Scanning..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>Start camera to detect assets</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Item Details & Mint NFT */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Create NFT Asset
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Item form */}
                <div className="space-y-3 mb-4">
                  {/* Captured preview */}
                  {imageUrl && imageUrl.startsWith("data:image") && (
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <img
                        src={imageUrl}
                        alt="Captured"
                        className="w-full h-40 object-cover"
                      />
                      <div className="px-2 py-1 bg-slate-800/70 text-xs text-slate-200 flex items-center gap-2">
                        <Badge>Captured</Badge>
                        <span>Image will be used as metadata</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="itemType" className="text-slate-300">
                        Item Type
                      </Label>
                      <Input
                        id="itemType"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        placeholder="e.g., Luxury Watch"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="itemName" className="text-slate-300">
                        Item Name
                      </Label>
                      <Input
                        id="itemName"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="e.g., Rolex Submariner"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="serial" className="text-slate-300">
                        Serial Number
                      </Label>
                      <Input
                        id="serial"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="e.g., LW-2024-001"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="imageUrl" className="text-slate-300">
                        Image URL
                      </Label>
                      <Input
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="/image.jpg or https://..."
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={mintNFT}
                  disabled={
                    !isARActive ||
                    !isConnected ||
                    isPending ||
                    isConfirming ||
                    detectionConfidence < 0.7 ||
                    chainId !== 2484 ||
                    !itemName.trim() ||
                    !serialNumber.trim()
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
                    "Mint NFT Asset"
                  )}
                </Button>

                {/* Validation messages */}
                {!isConnected && (
                  <p className="text-sm text-yellow-400 mt-2">
                    ⚠️ Connect wallet to continue
                  </p>
                )}
                {!isARActive && isConnected && (
                  <p className="text-sm text-yellow-400 mt-2">
                    ⚠️ Start camera to detect assets
                  </p>
                )}
                {isARActive && isConnected && detectionConfidence < 0.7 && (
                  <p className="text-sm text-yellow-400 mt-2">
                    ⚠️ Improve detection confidence (&gt;70%)
                  </p>
                )}
                {isConnected && chainId !== 2484 && (
                  <p className="text-sm text-red-400 mt-2">
                    ⚠️ Switch to U2U Testnet to mint
                  </p>
                )}
                {isConnected &&
                  isARActive &&
                  detectionConfidence >= 0.7 &&
                  (!itemName.trim() || !serialNumber.trim()) && (
                    <p className="text-sm text-yellow-400 mt-2">
                      ⚠️ Enter item name and serial number
                    </p>
                  )}

                {mintStatus === "success" && (
                  <div className="mt-4 p-3 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        NFT Minted Successfully!
                      </span>
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
                    <p className="text-sm text-red-300 mt-1">
                      Please check your wallet and try again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Framing full-screen overlay */}
        {showFraming && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h2 className="text-white text-lg font-medium">
                Frame & Capture Photo
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={switchFramingCamera}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Switch Camera (
                  {cameraFacing === "environment" ? "rear" : "front"})
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowFraming(false)}
                  className="text-white"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              {/* Large live preview */}
              <video
                ref={framingVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Grid guidelines (rule of thirds) */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/20" />
                  ))}
                </div>
                {/* Center reticle */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
              </div>

              {/* Bottom controls */}
              <div className="absolute left-0 right-0 bottom-0 p-4 flex items-center justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isCapturing}
                  onClick={() => {
                    if (!framingVideoRef.current) return;
                    try {
                      setIsCapturing(true);
                      const video = framingVideoRef.current;
                      const canvas = document.createElement("canvas");
                      canvas.width = video.videoWidth || 1280;
                      canvas.height = video.videoHeight || 720;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                        setImageUrl(dataUrl);
                        setShowModel(true);
                        setAutoCaptured(true);
                        toast({
                          title: "Photo Captured",
                          description:
                            "Image saved for minting and 3D model display",
                        });
                      }
                    } finally {
                      setIsCapturing(false);
                    }
                  }}
                >
                  {isCapturing ? "Capturing..." : "Capture Photo"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
