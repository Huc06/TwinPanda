"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";
import { AuthGuard } from "@/components/layout/auth-guard";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Package,
  Camera,
  Plus,
  TrendingUp,
  ExternalLink,
  Eye,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Asset } from "@/types/common";
import { usePortfolioStats } from "@/hooks/use-stats";
import {
  formatCurrency,
  formatDate,
  getStatusVariant,
} from "@/utils/formatters";

export default function AssetsPage() {
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

  const portfolioStats = usePortfolioStats(assets);

  return (
    <AuthGuard>
      <PageLayout>
        <PageHeader
          title="My Asset Portfolio"
          description="Manage your tokenized real-world assets"
          actions={
            <Link href="/ar-scan">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Asset
              </Button>
            </Link>
          }
        />

        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Assets"
            value={portfolioStats.totalAssets}
            description="NFT assets in portfolio"
            icon={<Package className="w-5 h-5" />}
          />
          <StatsCard
            title="Portfolio Value"
            value={formatCurrency(portfolioStats.portfolioValue)}
            description="Total estimated value"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatsCard
            title="Available Credit"
            value={formatCurrency(portfolioStats.availableCredit)}
            description="Max loan amount (70% LTV)"
            icon={<TrendingUp className="w-5 h-5" />}
            valueColor="text-green-400"
          />
        </div>

        {/* Assets Grid */}
        {assets.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16">
              <EmptyState
                icon={<Package className="w-16 h-16 text-slate-600" />}
                title="No Assets Yet"
                description="Start building your asset portfolio by scanning and tokenizing your first real-world asset"
                action={
                  <Link href="/ar-scan">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Scan Your First Asset
                    </Button>
                  </Link>
                }
              />
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
                      className={getStatusVariant(asset.status)}
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
                        {formatCurrency(asset.estimatedValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Token ID:</span>
                      <span className="text-white">#{asset.tokenId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Mint Date:</span>
                      <span className="text-white">
                        {formatDate(asset.mintDate)}
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
      </PageLayout>
    </AuthGuard>
  );
}
