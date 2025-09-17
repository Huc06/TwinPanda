"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useAccount, useChainId } from "wagmi";

export function WalletConnectRainbow() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="space-y-4">
            <div className="h-10 bg-slate-700 rounded animate-pulse" />
            <div className="text-center text-slate-400 text-sm">
              Loading wallet...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ConnectButton />

            {isConnected && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                  <span className="text-slate-300 text-sm font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={chainId === 2484 ? "default" : "destructive"}>
                    {chainId === 2484 ? "U2U Testnet" : `Chain ID: ${chainId}`}
                  </Badge>
                  {chainId !== 2484 && (
                    <span className="text-yellow-400 text-xs">
                      Switch to U2U Testnet
                    </span>
                  )}
                </div>
              </div>
            )}

            {!isConnected && (
              <div className="text-center text-slate-400 text-sm">
                <AlertCircle className="w-4 h-4 mx-auto mb-2" />
                Connect your wallet to continue
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
