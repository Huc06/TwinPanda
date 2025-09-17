"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";
import { AuthGuard } from "@/components/layout/auth-guard";
import {
  Store,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Settings,
} from "lucide-react";
import { ShopStats } from "@/types/common";

export default function ShopPage() {
  // Mock data - replace with real data from your backend
  const shopStats: ShopStats = {
    assets: 0,
    loans: 0,
    customers: 0,
    revenue: 0,
  };

  return (
    <AuthGuard roles={["shop", "admin"]}>
      <PageLayout>
        <PageHeader
          title="Shop Management"
          description="Manage your pawn shop operations and asset appraisals"
          icon={<Store className="w-8 h-8" />}
          backHref="/dashboard"
          backLabel="Back to Dashboard"
          actions={
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Settings className="w-4 h-4 mr-2" />
              Shop Settings
            </Button>
          }
        />

        {/* Shop Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Assets"
            value={shopStats.assets}
            description="Items under evaluation"
            icon={<Package className="w-5 h-5" />}
          />
          <StatsCard
            title="Loans"
            value={`$${shopStats.loans}`}
            description="Active loan value"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatsCard
            title="Customers"
            value={shopStats.customers}
            description="Active customers"
            icon={<Users className="w-5 h-5" />}
          />
          <StatsCard
            title="Revenue"
            value={`$${shopStats.revenue}`}
            description="This month"
            icon={<TrendingUp className="w-5 h-5" />}
            valueColor="text-green-400"
          />
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Asset Appraisal Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-slate-600 mb-6" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Assets Pending
                </h3>
                <p className="text-slate-400 mb-6">
                  When customers submit assets for appraisal, they will appear
                  here
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto text-slate-600 mb-6" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Active Loans
                </h3>
                <p className="text-slate-400 mb-6">
                  Approved loans and their payment schedules will be displayed
                  here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                <TrendingUp className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">
                  Risk Assessment
                </h3>
                <p className="text-slate-400 text-sm">
                  AI-powered asset valuation and risk analysis
                </p>
              </div>
              <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                <Users className="w-12 h-12 mx-auto text-green-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">
                  Customer Management
                </h3>
                <p className="text-slate-400 text-sm">
                  Track customer history and loan performance
                </p>
              </div>
              <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                <Settings className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">
                  Automated Workflows
                </h3>
                <p className="text-slate-400 text-sm">
                  Streamline loan approval and asset processing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    </AuthGuard>
  );
}
