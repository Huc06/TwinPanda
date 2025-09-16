"use client"

import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on role
      if (profile.role === 'user') {
        router.push('/user/portfolio')
      } else if (profile.role === 'shop') {
        router.push('/shop/dashboard')
      } else if (profile.role === 'admin') {
        router.push('/admin/dashboard')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="ml-3 text-white">Đang tải...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Đang chuyển hướng...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">Vui lòng đợi trong giây lát...</p>
        </CardContent>
      </Card>
    </div>
  )
}
