export interface Asset {
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

export interface StatsData {
  totalAssets: number;
  portfolioValue: number;
  availableCredit: number;
  healthFactor: string | number;
}

export interface ShopStats {
  assets: number;
  loans: number;
  customers: number;
  revenue: number;
}
