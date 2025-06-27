'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Article, SummaryNew } from '@/lib/supabase'
import NeonHeader from '@/components/NeonHeader'
import CyberLoader from '@/components/CyberLoader'
import {
    Sparkles,
    Check,
    X,
    Calendar,
    Building2,
    Hash,
    TrendingUp,
    Search,
    Filter,
    ArrowLeft,
    Brain,
    ChevronDown,
    ChevronUp,
    Tag
} from 'lucide-react'
import { AuthData, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface ArticlesResponse {
    articles: Article[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export default function AIAnalysis() {
    const [articles, setArticles] = useState<Article[]>([])
    const [selectedArticles, setSelectedArticles] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [articlesLoading, setArticlesLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<AuthData | null>(null)
    const [summaries, setSummaries] = useState<SummaryNew[]>([])
    const router = useRouter()

    // Filter states - แยกเป็น active (ที่ใช้งานจริง) และ pending (รอกดปุ่มค้นหา)
    const [source, setSource] = useState('all') // active source ที่ใช้งานจริง
    const [nameCategory, setNameCategory] = useState('all') // active name_category ที่ใช้งานจริง
    const [dateFilter, setDateFilter] = useState('all') // active date filter ที่ใช้งานจริง
    const [limit, setLimit] = useState(50) // active limit ที่ใช้งานจริง
    const [startDate, setStartDate] = useState('') // active start date ที่ใช้งานจริง
    const [endDate, setEndDate] = useState('') // active end date ที่ใช้งานจริง

    // Pending states สำหรับ filters ที่รอกดปุ่มค้นหา
    const [pendingSource, setPendingSource] = useState('all')
    const [pendingNameCategory, setPendingNameCategory] = useState('all')
    const [pendingDateFilter, setPendingDateFilter] = useState('all')
    const [pendingLimit, setPendingLimit] = useState(50)
    const [pendingStartDate, setPendingStartDate] = useState('')
    const [pendingEndDate, setPendingEndDate] = useState('')

    const [showSummaries, setShowSummaries] = useState(false)
    const [availableCategories, setAvailableCategories] = useState<string[]>([])

    // Base crypto categories - moved inside useMemo to fix dependency warning
    const baseCryptoCategories = useMemo(() => [
        { value: 'all', label: 'ทั้งหมด', color: 'text-cyan-400', icon: '🌐' },
        { value: 'BTC', label: 'Bitcoin (BTC)', color: 'text-orange-400', icon: '₿' },
        { value: 'ETH', label: 'Ethereum (ETH)', color: 'text-blue-400', icon: '🔷' },
        { value: 'ADA', label: 'Cardano (ADA)', color: 'text-purple-400', icon: '🟣' },
        { value: 'SOL', label: 'Solana (SOL)', color: 'text-green-400', icon: '🟢' },
        { value: 'DOGE', label: 'Dogecoin (DOGE)', color: 'text-yellow-400', icon: '🐕' },
        { value: 'XRP', label: 'Ripple (XRP)', color: 'text-indigo-400', icon: '💧' },
        { value: 'DOT', label: 'Polkadot (DOT)', color: 'text-pink-400', icon: '🔴' },
        { value: 'MATIC', label: 'Polygon (MATIC)', color: 'text-violet-400', icon: '🟣' },
        { value: 'AVAX', label: 'Avalanche (AVAX)', color: 'text-red-400', icon: '🔺' },
        { value: 'LINK', label: 'Chainlink (LINK)', color: 'text-blue-300', icon: '🔗' },
        { value: 'UNI', label: 'Uniswap (UNI)', color: 'text-pink-300', icon: '🦄' },
        { value: 'LTC', label: 'Litecoin (LTC)', color: 'text-gray-400', icon: '🥈' },
        { value: 'AI16Z', label: 'ai16z (AI16Z)', color: 'text-purple-300', icon: '🤖' },
        { value: 'HYPE', label: 'Hype (HYPE)', color: 'text-pink-300', icon: '🚀' },
        { value: 'MOVE', label: 'Move (MOVE)', color: 'text-green-300', icon: '⚡' },
        { value: 'BIO', label: 'Bio (BIO)', color: 'text-emerald-400', icon: '🧬' },
        { value: 'VINE', label: 'Vine (VINE)', color: 'text-green-500', icon: '🍃' },
        { value: 'ONDO', label: 'Ondo (ONDO)', color: 'text-blue-300', icon: '🌊' },
        { value: 'XLM', label: 'Stellar (XLM)', color: 'text-blue-500', icon: '⭐' },
        { value: 'AIXBT', label: 'AIXBT (AIXBT)', color: 'text-cyan-300', icon: '🤖' },
        { value: 'PNUT', label: 'Peanut (PNUT)', color: 'text-yellow-300', icon: '🥜' },
        { value: 'SUSHI', label: 'SushiSwap (SUSHI)', color: 'text-pink-400', icon: '🍣' },
        { value: 'BAT', label: 'Basic Attention (BAT)', color: 'text-orange-300', icon: '🦇' },
        { value: 'WIF', label: 'dogwifhat (WIF)', color: 'text-yellow-500', icon: '🐶' },
        { value: 'EIGEN', label: 'EigenLayer (EIGEN)', color: 'text-purple-500', icon: '🔮' },
        { value: 'RENDER', label: 'Render (RENDER)', color: 'text-red-300', icon: '🎨' },
        { value: 'MORPHO', label: 'Morpho (MORPHO)', color: 'text-blue-600', icon: '🦋' },
        { value: 'TRX', label: 'TRON (TRX)', color: 'text-red-500', icon: '🎯' },
        { value: 'OP', label: 'Optimism (OP)', color: 'text-red-400', icon: '🔴' },
        { value: 'LDO', label: 'Lido (LDO)', color: 'text-blue-400', icon: '🛡️' },
        { value: 'KSM', label: 'Kusama (KSM)', color: 'text-purple-600', icon: '🐦' },
        { value: 'SUI', label: 'Sui (SUI)', color: 'text-cyan-500', icon: '💎' },
        { value: 'ARB', label: 'Arbitrum (ARB)', color: 'text-blue-500', icon: '🌀' },
        { value: 'NEAR', label: 'NEAR (NEAR)', color: 'text-green-400', icon: '🌿' },
        { value: 'WLD', label: 'Worldcoin (WLD)', color: 'text-gray-300', icon: '🌍' },
        { value: 'PYTH', label: 'Pyth (PYTH)', color: 'text-purple-400', icon: '🐍' },
        { value: 'TON', label: 'Toncoin (TON)', color: 'text-cyan-600', icon: '💠' }
    ], [])

    const sourceOptions = [
        { value: 'all', label: 'ทุกแหล่ง' },
        { value: 'CoinDesk', label: 'CoinDesk' },
        { value: 'Cointelegraph', label: 'Cointelegraph' },
        { value: 'CoinGape', label: 'CoinGape' },
        { value: 'Bitcoin Magazine', label: 'Bitcoin Magazine' },
        { value: 'CryptoSlate', label: 'CryptoSlate' }
    ]

    const dateOptions = [
        { value: 'all', label: 'ทั้งหมด' },
        { value: 'today', label: 'วันนี้' },
        { value: 'yesterday', label: 'เมื่อวาน' },
        { value: 'week', label: '7 วันที่แล้ว' },
        { value: 'month', label: '30 วันที่แล้ว' },
        { value: 'custom', label: 'กำหนดเอง' }
    ]

    // Generate dynamic crypto categories with "อื่นๆ" option
    const cryptoCategories = useMemo(() => {
        const baseValues = baseCryptoCategories.map(cat => cat.value)
        const otherCategories = availableCategories
            .filter(cat => !baseValues.includes(cat))
            .map(cat => ({
                value: cat,
                label: cat,
                color: 'text-gray-300',
                icon: '🪙'
            }))

        return [
            ...baseCryptoCategories,
            ...otherCategories,
            { value: 'others', label: 'อื่นๆ (ไม่มีแท็ก)', color: 'text-gray-500', icon: '❓' }
        ]
    }, [availableCategories, baseCryptoCategories])

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

    // Fetch available categories from database
    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch('/api/articles?action=categories')
            if (response.ok) {
                const data = await response.json()
                setAvailableCategories(data.categories)
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err)
        }
    }, [])

    const fetchArticles = useCallback(async () => {
        setArticlesLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                limit: limit.toString(), // ใช้ active limit
                source: source !== 'all' ? source : '', // ใช้ active source
                name_category: nameCategory !== 'all' ? nameCategory : '', // ใช้ active name_category
                sortBy: 'created_at',
                order: 'desc'
            })

            const response = await fetch(`/api/articles?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch articles')
            }

            const data: ArticlesResponse = await response.json()
            
            // Apply date filtering on client side ใช้ active date states
            let filteredArticles = data.articles
            
            if (dateFilter !== 'all') {
                const now = new Date()
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                
                filteredArticles = data.articles.filter(article => {
                    const articleDate = new Date(article.created_at)
                    
                    switch (dateFilter) {
                        case 'today':
                            return articleDate >= today
                        case 'yesterday':
                            const yesterday = new Date(today)
                            yesterday.setDate(yesterday.getDate() - 1)
                            return articleDate >= yesterday && articleDate < today
                        case 'week':
                            const weekAgo = new Date(today)
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return articleDate >= weekAgo
                        case 'month':
                            const monthAgo = new Date(today)
                            monthAgo.setDate(monthAgo.getDate() - 30)
                            return articleDate >= monthAgo
                        case 'custom':
                            if (startDate && endDate) { // ใช้ active start/end dates
                                const start = new Date(startDate)
                                const end = new Date(endDate)
                                end.setHours(23, 59, 59, 999)
                                return articleDate >= start && articleDate <= end
                            }
                            return true
                        default:
                            return true
                    }
                })
            }
            
            setArticles(filteredArticles)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setArticlesLoading(false)
        }
    }, [source, nameCategory, dateFilter, limit, startDate, endDate]) // เพิ่ม nameCategory ใน dependencies

    const fetchSummaries = useCallback(async () => {
        try {
            const response = await fetch('/api/ai-summaries')
            if (response.ok) {
                const data = await response.json()
                setSummaries(data.summaries)
            }
        } catch (err) {
            console.error('Failed to fetch summaries:', err)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
        fetchArticles()
        fetchSummaries()
    }, [fetchCategories, fetchArticles, fetchSummaries])

    const handleSelectArticle = (articleId: string) => {
        setSelectedArticles(prev => 
            prev.includes(articleId) 
                ? prev.filter(id => id !== articleId)
                : [...prev, articleId]
        )
    }

    const handleSelectAll = () => {
        if (selectedArticles.length === articles.length) {
            setSelectedArticles([])
        } else {
            setSelectedArticles(articles.map(a => a.id))
        }
    }

    // Function สำหรับการกดปุ่มค้นหาข่าว - apply ทุก pending states
    const handleSearchArticles = () => {
        setSource(pendingSource) // apply pending source
        setNameCategory(pendingNameCategory) // apply pending name_category
        setDateFilter(pendingDateFilter) // apply pending date filter
        setLimit(pendingLimit) // apply pending limit
        setStartDate(pendingStartDate) // apply pending start date
        setEndDate(pendingEndDate) // apply pending end date
        setSelectedArticles([]) // clear selections
        // fetchArticles จะถูกเรียกอัตโนมัติจาก useEffect เมื่อ states เปลี่ยน
    }

    const handleProcessWithAI = async () => {
        if (selectedArticles.length === 0) {
            setError('กรุณาเลือกข่าวอย่างน้อย 1 ข่าว')
            return
        }

        setProcessing(true)
        setError(null)

        try {
            const selectedArticleData = articles.filter(a => selectedArticles.includes(a.id))
            
            const response = await fetch('/api/ai-summaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articles: selectedArticleData
                })
            })

            if (!response.ok) {
                throw new Error('Failed to process articles with AI')
            }

            const result = await response.json()
            
            // Refresh summaries
            await fetchSummaries()
            
            // Clear selection
            setSelectedArticles([])
            
            alert(`AI ประมวลผลเสร็จแล้ว! สร้างสรุป: ${result.summary?.id}`)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while processing')
        } finally {
            setProcessing(false)
        }
    }

    // เช็คว่า filters มีการเปลี่ยนแปลงหรือไม่
    const hasFilterChanges = source !== pendingSource || 
                            nameCategory !== pendingNameCategory ||
                            dateFilter !== pendingDateFilter || 
                            limit !== pendingLimit ||
                            startDate !== pendingStartDate ||
                            endDate !== pendingEndDate

    if (!user) {
        return null
    }

    if (loading) {
        return (
            <CyberLoader
                title="กำลังโหลด..."
                subtitle="รอสักครู่ เรากำลังตรวจสอบสิทธิ์การเข้าใช้งาน"
                showProgress={true}
                messages={[
                    'เชื่อมต่อระบบรักษาความปลอดภัย...',
                    'ตรวจสอบข้อมูลผู้ใช้งาน...',
                    'โหลดข้อมูลส่วนบุคคล...',
                    'เข้าสู่ระบบ AI Analysis...'
                ]}
            />
        )
    }

    return (
        <div className="min-h-screen">
            <NeonHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/home')}
                    className="neon-button px-4 py-2 rounded-lg font-medium flex items-center gap-2 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    กลับไปหน้าหลัก
                </button>

                {/* Header */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6 text-center">
                    <h1 className="gradient-text text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                        <Brain className="h-8 w-8" />
                        AI News Analysis
                    </h1>
                    <p className="text-gray-400">
                        เลือกข่าวที่ต้องการให้ AI วิเคราะห์ และประมวลผลเพื่อสร้างสรุปข่าว
                    </p>
                </div>

                {/* Filters */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6">
                    <h2 className="gradient-text text-xl font-semibold mb-6 flex items-center gap-3">
                        <Filter className="h-6 w-6" />
                        ตัวกรองข่าว (กดปุ่มค้นหาเพื่อนำไปใช้)
                        {hasFilterChanges && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-100 px-2 py-1 rounded-full border border-yellow-400/30">
                                มีการเปลี่ยนแปลง
                            </span>
                        )}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* Source Filter - ต้องกดปุ่มค้นหา */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">แหล่งข่าว</label>
                            <select
                                value={pendingSource} // ใช้ pending source
                                onChange={(e) => setPendingSource(e.target.value)} // อัปเดต pending source
                                className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400"
                            >
                                {sourceOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Name Category Filter - ต้องกดปุ่มค้นหา */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">เหรียญคริปโต</label>
                            <select
                                value={pendingNameCategory} // ใช้ pending name_category
                                onChange={(e) => setPendingNameCategory(e.target.value)} // อัปเดต pending name_category
                                className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400"
                            >
                                {cryptoCategories.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter - ต้องกดปุ่มค้นหา */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">ช่วงเวลา</label>
                            <select
                                value={pendingDateFilter} // ใช้ pending date filter
                                onChange={(e) => setPendingDateFilter(e.target.value)} // อัปเดต pending date filter
                                className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400"
                            >
                                {dateOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Limit - ต้องกดปุ่มค้นหา */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">จำนวนข่าว</label>
                            <input
                                type="number"
                                value={pendingLimit} // ใช้ pending limit
                                onChange={(e) => setPendingLimit(Number(e.target.value))} // อัปเดต pending limit
                                min="1"
                                max="1000"
                                className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400"
                            />
                        </div>
                    </div>

                    {/* Custom Date Range - ต้องกดปุ่มค้นหา */}
                    {pendingDateFilter === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">วันที่เริ่มต้น</label>
                                <input
                                    type="date"
                                    value={pendingStartDate} // ใช้ pending start date
                                    onChange={(e) => setPendingStartDate(e.target.value)} // อัปเดต pending start date
                                    className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">วันที่สิ้นสุด</label>
                                <input
                                    type="date"
                                    value={pendingEndDate} // ใช้ pending end date
                                    onChange={(e) => setPendingEndDate(e.target.value)} // อัปเดต pending end date
                                    className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSearchArticles} // apply ทุก pending states
                        className={`
                            neon-button px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-300
                            ${hasFilterChanges 
                                ? 'bg-purple-500/30 hover:bg-purple-500/40 border-purple-400 animate-pulse' 
                                : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400'
                            }
                        `}
                    >
                        <Search className="h-4 w-4" />
                        {hasFilterChanges ? 'ค้นหาข่าว (มีการเปลี่ยนแปลง)' : 'ค้นหาข่าว'}
                    </button>
                </div>

                {/* Selection Controls */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSelectAll}
                                className="neon-button px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                {selectedArticles.length === articles.length ? (
                                    <>
                                        <X className="h-4 w-4" />
                                        ยกเลิกทั้งหมด
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        เลือกทั้งหมด
                                    </>
                                )}
                            </button>
                            <span className="text-gray-400">
                                เลือกแล้ว: {selectedArticles.length} / {articles.length} ข่าว
                            </span>
                        </div>

                        <button
                            onClick={handleProcessWithAI}
                            disabled={selectedArticles.length === 0 || processing}
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-white"
                        >
                            <Sparkles className="h-4 w-4" />
                            {processing ? 'กำลังประมวลผล...' : 'ประมวลผลด้วย AI'}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="glass-card bg-red-500/10 border-red-400/30 rounded-lg p-4 mb-8">
                        <p className="text-red-300 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>เกิดข้อผิดพลาด: {error}</span>
                        </p>
                    </div>
                )}

                {/* Previous Summaries */}
                <div className="glass-card neon-border rounded-xl p-6 mb-8  ">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="gradient-text text-xl font-semibold flex items-center gap-3">
                            <TrendingUp className="h-6 w-6" />
                            ผลการวิเคราะห์ที่แล้ว ({summaries.length})
                        </h2>
                        <button
                            onClick={() => setShowSummaries(!showSummaries)}
                            className="neon-button px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                            {showSummaries ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    ซ่อน
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    แสดง
                                </>
                            )}
                        </button>
                    </div>

                    {showSummaries && (
                        <div className="space-y-4">
                            {summaries.map((summary) => (
                                <div key={summary.id} className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-cyan-300 font-medium">
                                                    สรุป {summary.all_select} ข่าว
                                                </span>
                                                {summary.sentiment && (
                                                    <span className={`
                                                        px-2 py-1 rounded text-xs
                                                        ${summary.sentiment === 'Positive'
                                                            ? 'bg-green-500/20 text-green-300'
                                                            : summary.sentiment === 'Negative'
                                                                ? 'bg-red-500/20 text-red-300'
                                                                : 'bg-yellow-500/20 text-yellow-300'
                                                        }
                                                    `}>
                                                        {summary.sentiment}
                                                    </span>
                                                )}
                                                {summary.trending_score && (
                                                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                                        Score: {summary.trending_score}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-300 mb-3">
                                                {summary.summary}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>แหล่ง: {summary.all_source}</span>
                                                <span>
                                                    {new Date(summary.created_at).toLocaleDateString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {summaries.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">ยังไม่มีผลการวิเคราะห์</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Articles List */}
                {articlesLoading ? (
                    <div className="glass-card neon-border rounded-xl p-12 text-center">
                        <div className="animate-pulse-neon mb-6">
                            <Search className="h-16 w-16 text-cyan-400 mx-auto" />
                        </div>
                        <h3 className="gradient-text text-2xl font-bold mb-4">
                            กำลังโหลดข่าว...
                        </h3>
                    </div>
                ) : articles.length > 0 ? (
                    <div className="glass-card neon-border rounded-xl mb-8 p-6">
                        <h2 className="gradient-text text-xl font-semibold mb-6 flex items-center gap-3">
                            <Hash className="h-6 w-6" />
                            รายการข่าว ({articles.length} ข่าว)
                        </h2>

                        <div className="space-y-4">
                            {articles.map((article) => (
                                <div
                                    key={article.id}
                                    className={`
                                        p-4 rounded-lg border cursor-pointer transition-all duration-200
                                        ${selectedArticles.includes(article.id)
                                            ? 'bg-cyan-500/10 border-cyan-400/50 shadow-lg shadow-cyan-400/20'
                                            : 'bg-gray-800/30 border-gray-600 hover:bg-gray-700/30 hover:border-gray-500'
                                        }
                                    `}
                                    onClick={() => handleSelectArticle(article.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                                            ${selectedArticles.includes(article.id)
                                                ? 'bg-cyan-500 border-cyan-400'
                                                : 'border-gray-400'
                                            }
                                        `}>
                                            {selectedArticles.includes(article.id) && (
                                                <Check className="h-3 w-3 text-white" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-white font-medium mb-2 line-clamp-2">
                                                {article.title}
                                            </h3>

                                            <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                                                {article.description || article.content.substring(0, 200) + '...'}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {article.name_category && (
                                                    <div className="flex items-center gap-1 bg-indigo-500/20 rounded-full px-2 py-1">
                                                        <Tag className="h-3 w-3" />
                                                        <span>{article.name_category}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    <span>{article.source}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {new Date(article.created_at).toLocaleDateString('th-TH')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card neon-border rounded-xl p-12 text-center">
                        <div className="animate-pulse-neon mb-6">
                            <Search className="h-16 w-16 text-cyan-400 mx-auto" />
                        </div>
                        <h3 className="gradient-text text-2xl font-bold mb-4">
                            ไม่พบข่าว
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            ไม่มีข่าวที่ตรงกับเงื่อนไขที่เลือก กรุณาปรับเปลี่ยนตัวกรอง
                        </p>
                    </div>
                )}


            </main>
        </div>
    )
} 