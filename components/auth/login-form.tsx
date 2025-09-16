"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { UserIcon, Store } from 'lucide-react'

interface LoginFormProps {
  defaultRole?: 'user' | 'shop'
}

export function LoginForm({ defaultRole = 'user' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<'user' | 'shop'>(defaultRole)
  
  // Additional fields for signup
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopLicense, setShopLicense] = useState('')
  
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        // Redirect based on role (will be handled by middleware)
        router.push('/dashboard')
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          // Create user profile
          const profileData = {
            id: data.user.id,
            email: data.user.email!,
            role,
            full_name: fullName || null,
            phone: phone || null,
            shop_name: role === 'shop' ? shopName || null : null,
            shop_license: role === 'shop' ? shopLicense || null : null,
          }
          
          const { error: profileError } = await supabase
            .from('users')
            .insert([profileData])
          
          if (profileError) throw profileError
          
          // Redirect to dashboard
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(value) => setRole(value as 'user' | 'shop')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Người dùng
              </TabsTrigger>
              <TabsTrigger value="shop" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Cửa hàng
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-300">
                    {role === 'shop' ? 'Tên người đại diện' : 'Họ tên'}
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'shop' ? 'Nguyễn Văn A' : 'Họ tên của bạn'}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {role === 'shop' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="shopName" className="text-slate-300">Tên cửa hàng</Label>
                      <Input
                        id="shopName"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Tiệm cầm đồ ABC"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shopLicense" className="text-slate-300">Giấy phép kinh doanh</Label>
                      <Input
                        id="shopLicense"
                        value={shopLicense}
                        onChange={(e) => setShopLicense(e.target.value)}
                        placeholder="0123456789"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {mode === 'login' 
                ? 'Chưa có tài khoản? Đăng ký ngay' 
                : 'Đã có tài khoản? Đăng nhập'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
