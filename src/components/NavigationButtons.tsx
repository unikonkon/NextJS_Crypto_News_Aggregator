'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, BarChart3 } from 'lucide-react'
import { isAuthenticated } from '@/lib/auth'

export default function NavigationButtons() {
  const router = useRouter()
  const isLoggedIn = isAuthenticated()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <Button
        onClick={() => router.push('/home')}
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 rounded-full p-3"
        title="ไปหน้าข่าว"
      >
        <Home className="h-5 w-5" />
        <span className="hidden sm:inline">ข่าว</span>
      </Button>
      
      {isLoggedIn && (
        <Button
          onClick={() => router.push('/dashboard')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 rounded-full p-3"
          title="ไป Dashboard"
        >
          <BarChart3 className="h-5 w-5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>
      )}
    </div>
  )
} 