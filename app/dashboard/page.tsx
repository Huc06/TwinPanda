"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/page-layout";
import {
  StatsCard,
  EmptyState,
  LoadingSpinner,
  ActionCard,
  FeatureCard,
} from "@/components/ui";
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
      <PageLayout>
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
                <LoadingSpinner message="Please sign the message in your wallet to authenticate..." />
              ) : (
                <p className="text-slate-300">
                  Connect your wallet using the navbar to get started with our
                  platform
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Camera className="w-8 h-8" />}
              title="AR Scanning"
              description="Use augmented reality to scan and authenticate real-world assets"
              iconColor="text-purple-400"
            />
            <FeatureCard
              icon={<Package className="w-8 h-8" />}
              title="NFT Creation"
              description="Convert your physical assets into blockchain-based NFTs"
              iconColor="text-green-400"
            />
            <FeatureCard
              icon={<DollarSign className="w-8 h-8" />}
              title="Instant Loans"
              description="Get instant loans using your NFT assets as collateral"
              iconColor="text-yellow-400"
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
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
        <ActionCard
          title="Scan Asset"
          subtitle="Quick Actions"
          icon={<Camera className="w-8 h-8" />}
          iconColor="text-purple-400"
          buttonText="Start AR Scan"
          buttonColor="bg-purple-600 hover:bg-purple-700"
          href="/ar-scan"
        />
        <ActionCard
          title="My Assets"
          subtitle="Portfolio"
          icon={<ShoppingCart className="w-8 h-8" />}
          iconColor="text-green-400"
          buttonText="View Assets"
          buttonColor="bg-green-600 hover:bg-green-700"
          href="/assets"
        />
        <ActionCard
          title="Active Loans"
          subtitle="Loans"
          icon={<DollarSign className="w-8 h-8" />}
          iconColor="text-yellow-400"
          buttonText="View Loans"
          buttonColor="bg-yellow-600 hover:bg-yellow-700"
          href="/loans"
        />
        {user?.role === "shop" && (
          <ActionCard
            title="Management"
            subtitle="Shop"
            icon={<TrendingUp className="w-8 h-8" />}
            iconColor="text-blue-400"
            buttonText="Manage Shop"
            buttonColor="bg-blue-600 hover:bg-blue-700"
            href="/shop"
          />
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Assets"
          value={0}
          description="NFT assets in portfolio"
        />
        <StatsCard
          title="Portfolio Value"
          value="$0"
          description="Total estimated value"
        />
        <StatsCard
          title="Health Factor"
          value="∞"
          description="Loan health status"
          valueColor="text-green-400"
        />
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Zap className="w-12 h-12 text-slate-600" />}
            title="No recent activity"
            description="Start by scanning your first asset!"
            className="py-12"
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
