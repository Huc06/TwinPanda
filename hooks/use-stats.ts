import { useMemo } from "react";
import { Asset, StatsData, ShopStats } from "@/types/common";

export function usePortfolioStats(assets: Asset[]): StatsData {
  return useMemo(() => {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.estimatedValue || 0), 0);
    
    return {
      totalAssets: assets.length,
      portfolioValue: totalValue,
      availableCredit: Math.floor(totalValue * 0.7), // 70% LTV
      healthFactor: totalValue > 0 ? "∞" : "∞"
    };
  }, [assets]);
}

export function useShopStats(): ShopStats {
  // This would normally fetch from your backend/API
  return useMemo(() => ({
    assets: 0,
    loans: 0,
    customers: 0,
    revenue: 0,
  }), []);
}
