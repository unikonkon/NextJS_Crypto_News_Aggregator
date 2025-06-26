'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { isAuthenticated } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import NeonHeader from '@/components/NeonHeader'

export default function HomePage() {
  const router = useRouter()

  // // Auto-redirect ถ้าเข้าสู่ระบบแล้ว
  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     router.push('/home')
  //   }
  // }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <NeonHeader
        title="💸 Crypto News"
        subtitle="ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI แบบ Real-time"
        showStats={false}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Welcome to Crypto News
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            ศูนย์รวมข่าวคริปโตเคอร์เรนซีล่าสุด พร้อมการวิเคราะห์ AI และ sentiment analysis
            เพื่อให้คุณติดตามความเคลื่อนไหวของตลาดได้อย่างแม่นยำ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.push('/home')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              เข้าสู่หน้าข่าว <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 py-3 px-8 rounded-lg"
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Real-time Analytics
              </CardTitle>
              <CardDescription className="text-slate-300">
                ข้อมูลแบบเรียลไทม์
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>ติดตามข่าวและความเคลื่อนไหวของตลาดคริปโตแบบเรียลไทม์
                พร้อมการวิเคราะห์เทรนด์ที่แม่นยำ</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                AI Analysis
              </CardTitle>
              <CardDescription className="text-slate-300">
                การวิเคราะห์ด้วย AI
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>ใช้เทคโนโลยี AI ในการวิเคราะห์ความเชื่อมั่นของตลาด (Sentiment Analysis)
                และคาดการณ์แนวโน้มข่าว</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Multiple Sources
              </CardTitle>
              <CardDescription className="text-slate-300">
                หลากหลายแหล่งข่าว
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>รวบรวมข่าวจากแหล่งข่าวชั้นนำทั่วโลก เช่น CoinDesk, Cointelegraph,
                และอื่นๆ มากมาย</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-400/30 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                พร้อมเริ่มต้นแล้วหรือยัง?
              </h3>
              <p className="text-slate-300 mb-6">
                เข้าสู่ระบบเพื่อปรับแต่งฟีดข่าวและเข้าถึงฟีเจอร์เพิ่มเติม
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  สมัครสมาชิก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}