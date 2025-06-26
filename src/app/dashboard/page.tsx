'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, AuthData } from '@/lib/auth'
import NeonHeader from '@/components/NeonHeader'
import NavigationButtons from '@/components/NavigationButtons'

export default function DashboardPage() {
    const [user, setUser] = useState<AuthData | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const userData = getCurrentUser()
        setUser(userData)
        setLoading(false)
    }, [])

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])


    // handleSignOut is available in AuthButton component now

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white">กำลังโหลด...</div>
            </div>
        )
    }




    if (!user) {
        return null // ไม่ render อะไร รอ useEffect redirect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

            {/* Neon Header */}
            <NeonHeader 
                title="💸 Crypto News Dashboard"
                subtitle={`ยินดีต้อนรับ, ${user.user.email}!`}
                showStats={false}
            />

            <div className="container mx-auto py-8 relative z-10 px-4">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-cyan-400">👤 ข้อมูลผู้ใช้</CardTitle>
                            <CardDescription className="text-slate-300">
                                ข้อมูลบัญชีของคุณ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-slate-300">
                            <div className="space-y-2">
                                <p><strong>อีเมล:</strong> {user.user.email}</p>
                                <p><strong>User ID:</strong> {user.user.id}</p>
                                <p><strong>สร้างเมื่อ:</strong> {new Date(user.user.created_at).toLocaleDateString('th-TH')}</p>
                                <p><strong>เข้าสู่ระบบล่าสุด:</strong> {new Date(user.user.last_sign_in_at || '').toLocaleDateString('th-TH')}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-purple-400">📊 Session Info</CardTitle>
                            <CardDescription className="text-slate-300">
                                ข้อมูล Session ปัจจุบัน
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-slate-300">
                            <div className="space-y-2">
                                <p><strong>Access Token:</strong> {user.session.access_token.substring(0, 20)}...</p>
                                <p><strong>Token Type:</strong> {user.session.token_type}</p>
                                <p><strong>หมดอายุ:</strong> {new Date(user.session.expires_at! * 1000).toLocaleDateString('th-TH')}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-green-400">🚀 Quick Actions</CardTitle>
                            <CardDescription className="text-slate-300">
                                การดำเนินการด่วน
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                                >
                                    🏠 ไปหน้าหลัก
                                </Button>
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    🔄 รีเฟรชหน้า
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
               
            </div>
            
            {/* Navigation Buttons */}
            {/* <NavigationButtons /> */}
        </div>
    )
} 