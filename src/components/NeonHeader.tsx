'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import AuthButton from '@/components/AuthButton'
import { useRouter } from 'next/navigation'

interface NeonHeaderProps {
  title?: string
  subtitle?: string
  showStats?: boolean
}

export default function NeonHeader({
  title = "💸 Crypto News",
  subtitle = "ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI แบบ Real-time",
  showStats = true
}: NeonHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  // Scroll detection for header animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const threshold = 100 // px to trigger shrink
      setIsScrolled(scrollTop > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`neon-header sticky top-0 z-50 border-b border-cyan-400/20 ${isScrolled ? 'scrolled' : ''}`}>
      <div className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-1' : 'py-6'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
            onClick={() => router.push('/home')}
            className={`header-logo animate-glow p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 ${isScrolled ? 'scrolled' : ''}`}>
              <TrendingUp className={`text-cyan-400 transition-all duration-300 ${isScrolled ? 'h-6 w-6' : 'h-8 w-8'}`} />
            </div>
            <div>
              <h1 className={`sm:flex hidden header-title gradient-text font-bold mb-1 transition-all duration-300 ${isScrolled ? 'scrolled text-xl' : 'text-3xl'}`}>
                {title}
              </h1>
              <p className={`sm:flex hidden header-subtitle text-gray-400 text-sm transition-all duration-300 ${isScrolled ? 'scrolled' : ''}`}>
                {subtitle}
              </p>
            </div>
            {/* AI Insights Button */}
            <button
              onClick={() => router.push('/ai-insights')}
              className={`hidden md:flex items-center gap-2 neon-button px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled ? 'text-sm' : 'text-base'
              }`}
              title="ดู AI Insights Dashboard"
            >
              <BarChart3 className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
              <span className="gradient-text font-semibold">AI Insights</span>
            </button>
          </div>

          <div className={`header-stats flex items-center gap-3 md:gap-6 ${isScrolled ? 'scrolled' : ''}`}>
            {showStats && (
              <>
                {/* <div className="hidden md:flex items-center gap-2 text-sm">
                  <Sparkles className={`text-cyan-400 transition-all duration-300 ${isScrolled ? 'h-6 w-6' : 'h-9 w-9'}`} />
                  <span className="text-gray-300">Live Analytics</span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <Zap className={`text-purple-400 transition-all duration-300 ${isScrolled ? 'h-6 w-6' : 'h-9 w-9'}`} />
                  <span className="text-gray-300">AI Powered</span>
                </div> */}
              </>
            )}
            
            {/* Mobile AI Insights Button */}
            <button
              onClick={() => router.push('/ai-insights')}
              className={`md:hidden neon-button p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isScrolled ? 'opacity-90' : ''
              }`}
              title="ดู AI Insights Dashboard"
            >
              <BarChart3 className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </button>
            
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  )
} 