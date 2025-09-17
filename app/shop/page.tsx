"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Settings,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function ShopPage() {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Authentication Required
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
                Please connect your wallet using the navbar to access shop
                management
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!hasRole(["shop", "admin"])) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-400 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Access Denied
            </h1>
            <p className="text-slate-300 mb-8">
              You need shop owner privileges to access this page
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Store className="w-8 h-8" />
              Shop Management
            </h1>
            <p className="text-slate-300">
              Manage your pawn shop operations and asset appraisals
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Settings className="w-4 h-4 mr-2" />
            Shop Settings
          </Button>
        </div>

        {/* Shop Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <p className="text-slate-300 text-sm">Items under evaluation</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">$0</div>
              <p className="text-slate-300 text-sm">Active loan value</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <p className="text-slate-300 text-sm">Active customers</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">$0</div>
              <p className="text-slate-300 text-sm">This month</p>
            </CardContent>
          </Card>
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
      </div>
    </div>
  );
}
