'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getCurrentUser, signOut, AuthData } from '@/lib/auth'

export default function AuthButton() {
  const [user, setUser] = useState<AuthData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = getCurrentUser()
    setUser(userData)
    setLoading(false)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-2">
        <div className="w-20 h-9 bg-slate-700/50 rounded-md animate-pulse" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-slate-300 text-sm hidden md:inline">
          สวัสดี, {user.user.email}
        </span>
        <Button
          onClick={() => router.push('/home')}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-sm"
        >
          ข่าว
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-sm"
        >
          ข้อมูลส่วนตัว
        </Button>
        <Button
          onClick={() => {
            handleSignOut()
            router.push('/')
          }}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
        >
          ออกจากระบบ
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => router.push('/login')}
        variant="outline"
        className="border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        เข้าสู่ระบบ
      </Button>
      <Button
        onClick={() => router.push('/register')}
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
      >
        สมัครสมาชิก
      </Button>
    </div>
  )
} 