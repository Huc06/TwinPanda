"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Wallet,
  TrendingUp,
  Package,
  ArrowRight,
  DollarSign,
  ShoppingCart,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to PawnShop
              </h1>
              <p className="text-slate-300 text-lg">
                The future of asset-backed lending using AR and blockchain
                technology
              </p>
            </div>

            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center gap-2">
                  <Wallet className="w-6 h-6" />
                  {isLoading ? "Authenticating..." : "Connect Your Wallet"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <p className="text-slate-300">
                      Please sign the message in your wallet to authenticate...
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-300">
                    Connect your wallet using the navbar to get started with our
                    platform
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <Camera className="w-8 h-8 text-purple-400 mb-2" />
                  <CardTitle className="text-white text-lg">
                    AR Scanning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">
                    Use augmented reality to scan and authenticate real-world
                    assets
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <Package className="w-8 h-8 text-green-400 mb-2" />
                  <CardTitle className="text-white text-lg">
                    NFT Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">
                    Convert your physical assets into blockchain-based NFTs
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
                  <CardTitle className="text-white text-lg">
                    Instant Loans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">
                    Get instant loans using your NFT assets as collateral
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-slate-300">
            Manage your assets and loans from your dashboard
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-purple-600">
              Role: {user?.role}
            </Badge>
            {user?.isVerified && (
              <Badge variant="secondary" className="bg-green-600">
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Quick Actions</p>
                  <p className="text-white font-semibold">Scan Asset</p>
                </div>
                <Camera className="w-8 h-8 text-purple-400" />
              </div>
              <Link href="/ar-scan">
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Start AR Scan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Portfolio</p>
                  <p className="text-white font-semibold">My Assets</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-400" />
              </div>
              <Link href="/assets">
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  View Assets
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Loans</p>
                  <p className="text-white font-semibold">Active Loans</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
              <Button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700">
                View Loans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {user?.role === "shop" && (
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Shop</p>
                    <p className="text-white font-semibold">Management</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <Link href="/shop">
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Manage Shop
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <p className="text-slate-300 text-sm">NFT assets in portfolio</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">$0</div>
              <p className="text-slate-300 text-sm">Total estimated value</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Health Factor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
              <p className="text-slate-300 text-sm">Loan health status</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Zap className="w-12 h-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No recent activity</p>
              <p className="text-slate-500 text-sm">
                Start by scanning your first asset!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
