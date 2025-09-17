/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

/**
 * Format a wallet address for display
 */
export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

/**
 * Get a readable status badge variant
 */
export function getStatusVariant(status: "available" | "collateral" | "inactive") {
  switch (status) {
    case "available":
      return "bg-green-600";
    case "collateral":
      return "bg-yellow-600";
    case "inactive":
      return "bg-slate-600";
    default:
      return "bg-slate-600";
  }
}
