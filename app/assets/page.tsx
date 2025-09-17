"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Camera,
  ArrowLeft,
  Plus,
  TrendingUp,
  ExternalLink,
  Eye,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  image: string;
  estimatedValue: number;
  status: "available" | "collateral" | "inactive";
  mintDate: string;
  tokenId: string;
  transactionHash: string;
}

export default function AssetsPage() {
  const { isAuthenticated, isLoading } = useAuth();

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
                Please connect your wallet using the navbar to view your assets
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mock asset data - this will come from your backend/blockchain in the future
  const assets: Asset[] = [
    // Example asset structure for when data is available
    // {
    //   id: "1",
    //   name: "Rolex Submariner",
    //   type: "Luxury Watch",
    //   serialNumber: "LW-2024-001",
    //   image: "/placeholder-watch.jpg",
    //   estimatedValue: 15000,
    //   status: "available",
    //   mintDate: "2024-01-15",
    //   tokenId: "123",
    //   transactionHash: "0x1234...",
    // }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">
              My Asset Portfolio
            </h1>
            <p className="text-slate-300">
              Manage your tokenized real-world assets
            </p>
          </div>
          <Link href="/ar-scan">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Asset
            </Button>
          </Link>
        </div>

        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Total Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">
                {assets.length}
              </div>
              <p className="text-slate-300 text-sm">NFT assets in portfolio</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">
                $
                {assets
                  .reduce((sum, asset) => sum + (asset.estimatedValue || 0), 0)
                  .toLocaleString()}
              </div>
              <p className="text-slate-300 text-sm">Total estimated value</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Available Credit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">
                $
                {Math.floor(
                  assets.reduce(
                    (sum, asset) => sum + (asset.estimatedValue || 0),
                    0
                  ) * 0.7
                ).toLocaleString()}
              </div>
              <p className="text-slate-300 text-sm">
                Max loan amount (70% LTV)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assets Grid */}
        {assets.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16">
              <div className="text-center">
                <Package className="w-16 h-16 mx-auto text-slate-600 mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Assets Yet
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Start building your asset portfolio by scanning and tokenizing
                  your first real-world asset
                </p>
                <Link href="/ar-scan">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Your First Asset
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <Card
                key={asset.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <CardHeader>
                  <div className="aspect-video bg-slate-700 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">
                        {asset.name}
                      </CardTitle>
                      <p className="text-slate-400 text-sm">{asset.type}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        asset.status === "available"
                          ? "bg-green-600"
                          : asset.status === "collateral"
                          ? "bg-yellow-600"
                          : "bg-slate-600"
                      }
                    >
                      {asset.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Serial Number:</span>
                      <span className="text-white">{asset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Estimated Value:</span>
                      <span className="text-white font-semibold">
                        ${asset.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Token ID:</span>
                      <span className="text-white">#{asset.tokenId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Mint Date:</span>
                      <span className="text-white">
                        {new Date(asset.mintDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://testnet.u2uscan.xyz/tx/${asset.transactionHash}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>

                    {asset.status === "available" && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Use as Collateral
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
