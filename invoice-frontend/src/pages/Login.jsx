import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, Loader2, Eye, EyeOff } from 'lucide-react'
import API from '@/api/client'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!username || !password) {
      setError('Please enter both User ID and Password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/api/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', username)
      onLogin()
    } catch {
      setError('Invalid User ID or Password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-brand-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-gold-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Card className="w-full max-w-[420px] relative z-10 border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-brand-500/5">
        <CardHeader className="text-center pb-2 pt-8">
          {/* Logo */}
          <div className="mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500 rounded-2xl blur-xl opacity-50" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg">
                <Receipt className="h-8 w-8" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">S Four Traders</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Invoice Management System
          </CardDescription>
          
          {/* GSTIN Badge */}
          <div className="mx-auto mt-3 inline-flex items-center rounded-full bg-muted px-3 py-1">
            <span className="font-mono text-xs text-muted-foreground">
              GSTIN: 09AGOPA6566D2Z9
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-8 px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-muted-foreground text-xs uppercase tracking-wider">
                User ID
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 animate-slide-down">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Muzaffarnagar, Uttar Pradesh
          </p>
        </CardContent>
      </Card>
    </div>
  )
}