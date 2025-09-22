"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase/client'
import type { Asset, Loan } from '@/lib/types/database'
import { Loader2, TrendingUp, ShieldCheck, Wallet, Coins } from 'lucide-react'

export default function UserPortfolioPage() {
  const { user, profile, loading } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [healthFactor, setHealthFactor] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      setIsLoadingData(true)
      setError('')
      try {
        // Fetch assets
        try {
          const { data: assetsData } = await supabase
            .from('assets')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
          setAssets(assetsData || [])
        } catch {
          setAssets([])
        }

        // Fetch loans
        try {
          const { data: loansData } = await supabase
            .from('loans')
            .select('*')
            .eq('borrower_id', user.id)
            .order('created_at', { ascending: false })
          setLoans(loansData || [])
        } catch {
          setLoans([])
        }

        // Try RPC for health factor
        try {
          const { data } = await supabase.rpc('calculate_health_factor', { user_uuid: user.id })
          if (typeof data === 'number') setHealthFactor(data)
        } catch {
          // Fallback compute: collateral/appraised vs total debt
          const totalCollateral = loans
            .filter((l) => l.status === 'active')
            .map((l) => assets.find((a) => a.id === l.asset_id))
            .reduce((sum, a) => sum + (a?.appraised_value || 0), 0)
          const totalDebt = loans.filter((l) => l.status === 'active').reduce((s, l) => s + (l.total_amount || 0), 0)
          setHealthFactor(totalDebt === 0 ? 999.9999 : Number((totalCollateral / totalDebt).toFixed(4)))
        }
      } catch (e: any) {
        setError(e?.message || 'Không tải được dữ liệu')
      } finally {
        setIsLoadingData(false)
      }
    }
    if (!loading) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center text-white">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải portfolio...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Bạn chưa đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <a href="/auth/login">Đến trang đăng nhập</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeLoans = loans.filter((l) => l.status === 'active')
  const totalMonthlyInterest = activeLoans.reduce((sum, l) => sum + l.principal_amount * (l.interest_rate / 100), 0)
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.total_amount, 0)
  const totalCollateral = activeLoans
    .map((l) => assets.find((a) => a.id === l.asset_id))
    .reduce((sum, a) => sum + (a?.appraised_value || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Portfolio của bạn</h1>
          <div className="text-slate-300">{profile?.email || ''}</div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base">Health Factor</CardTitle>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white flex items-baseline gap-2">
                {healthFactor !== null ? healthFactor.toFixed(2) : '--'}
                {healthFactor && healthFactor < 1.1 ? (
                  <Badge variant="destructive">Rủi ro</Badge>
                ) : (
                  <Badge className="bg-emerald-600">An toàn</Badge>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-2">Tài sản / Nợ. &gt;= 1.0 là an toàn.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base">Lãi hàng tháng</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">{totalMonthlyInterest.toFixed(2)} U2U</div>
              <p className="text-slate-400 text-sm mt-2">Tổng lãi dự kiến từ các khoản vay đang active.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base">Tổng nợ</CardTitle>
              <Wallet className="w-4 h-4 text-yellow-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">{totalDebt.toFixed(2)} U2U</div>
              <p className="text-slate-400 text-sm mt-2">Tổng phải trả (gồm cả lãi).</p>
            </CardContent>
          </Card>
        </div>

        {/* Assets List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-white">Tài sản của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-slate-400">Chưa có tài sản nào.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((a) => (
                  <div key={a.id} className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium">{a.name}</div>
                      <Badge className="bg-slate-700">{a.status}</Badge>
                    </div>
                    <div className="text-slate-400 text-sm mt-1">Serial: {a.serial_number || 'N/A'}</div>
                    {a.appraised_value !== null && (
                      <div className="text-slate-300 text-sm mt-1">Định giá: {a.appraised_value} U2U</div>
                    )}
                    {a.image_url && (
                      <img src={a.image_url} alt={a.name} className="mt-3 w-full h-36 object-cover rounded" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loans List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-white">Khoản vay của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            {loans.length === 0 ? (
              <div className="text-slate-400">Chưa có khoản vay nào.</div>
            ) : (
              <div className="space-y-3">
                {loans.map((l) => (
                  <div key={l.id} className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium">{l.status.toUpperCase()}</div>
                      <Badge className="bg-slate-700">{new Date(l.due_date).toLocaleDateString()}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-300 mt-2">
                      <div>
                        <div className="text-slate-400">Principal</div>
                        <div>{l.principal_amount} U2U</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Interest</div>
                        <div>{(l.interest_rate * 100).toFixed(2)}‰ /tháng</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Total</div>
                        <div>{l.total_amount} U2U</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Duration</div>
                        <div>{l.loan_duration_days} ngày</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="text-red-400 text-sm">Lỗi: {error}</div>
        )}
      </div>
    </div>
  )
}
