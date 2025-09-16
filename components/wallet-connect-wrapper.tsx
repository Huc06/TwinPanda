"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

// Dynamic import with SSR disabled for WalletConnect components
const WalletConnectRainbow = dynamic(
  () =>
    import("./wallet-connect-rainbow").then((mod) => ({
      default: mod.WalletConnectRainbow,
    })),
  {
    ssr: false,
    loading: () => (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    ),
  }
);

export function WalletConnectWrapper() {
  return <WalletConnectRainbow />;
}
