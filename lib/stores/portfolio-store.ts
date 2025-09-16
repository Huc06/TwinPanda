import { create } from 'zustand'
import { Asset, Loan } from '@/lib/types/database'

interface PortfolioData {
  assets: Asset[]
  loans: Loan[]
  healthFactor: number
  totalCollateralValue: number
  totalDebtValue: number
  monthlyInterest: number
}

interface PortfolioState {
  portfolio: PortfolioData | null
  loading: boolean
  error: string | null
  
  setPortfolio: (portfolio: PortfolioData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Computed values
  getActiveLoans: () => Loan[]
  getCollateralizedAssets: () => Asset[]
  getTotalMonthlyPayment: () => number
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  loading: false,
  error: null,
  
  setPortfolio: (portfolio) => set({ portfolio, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  getActiveLoans: () => {
    const { portfolio } = get()
    return portfolio?.loans.filter(loan => loan.status === 'active') || []
  },
  
  getCollateralizedAssets: () => {
    const { portfolio } = get()
    return portfolio?.assets.filter(asset => asset.status === 'collateralized') || []
  },
  
  getTotalMonthlyPayment: () => {
    const activeLoans = get().getActiveLoans()
    return activeLoans.reduce((total, loan) => {
      // Calculate monthly payment (interest + principal amortization)
      const monthlyInterest = loan.principal_amount * (loan.interest_rate / 100)
      return total + monthlyInterest
    }, 0)
  },
}))
