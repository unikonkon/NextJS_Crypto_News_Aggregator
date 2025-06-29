'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Article } from '@/lib/supabase'
import NeonHeader from '@/components/NeonHeader'
import CyberLoader from '@/components/CyberLoader'
import NewsCard from '@/components/NewsCard'
import { AuthData, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import {
    Sparkles,
    Check,
    X,
    Calendar,
    Building2,
    Hash,
    Search,
    Filter,
    ArrowLeft,
    Brain,
    ChevronDown,
    ChevronUp,
    Clock,
    Target,
    Lightbulb,
    BarChart3,
    MessageSquare,
    Cpu,
    Zap,
    BookOpen,
    Star,
    Eye,
    Globe,
    CheckCircle,
    Users
} from 'lucide-react'

interface ArticlesResponse {
    articles: Article[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

interface AINewsAllResponse {
    success: boolean
    processed: number
    successful: number
    failed: number
    total_time: number
    summary_type: string
    results: Array<{
        article_id: string
        success: boolean
        summary?: {
            id: string
            ai_summary: string
            ai_sentiment: string
            trending_score: number
            market_impact_score: number
        }
        error?: string
    }>
    message: string
}

interface AINiewsAllSummary {
    id: string
    article_id: string
    original_title: string
    original_content: string
    original_source: string
    original_url: string
    original_category: string
    original_name_category: string
    original_pub_date: string
    summary_type: string
    ai_summary: string
    ai_sentiment: string
    trending_score: number
    key_points: string[]
    related_cryptos: string[]
    market_impact_score: number
    processing_time: number
    created_at: string
    updated_at: string
}

export default function AINews() {
    const [articles, setArticles] = useState<Article[]>([])
    const [selectedArticles, setSelectedArticles] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [articlesLoading, setArticlesLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<AuthData | null>(null)
    const [aiSummaries, setAiSummaries] = useState<AINiewsAllSummary[]>([])
    const [showSummaries, setShowSummaries] = useState(false)
    const [availableCategories, setAvailableCategories] = useState<string[]>([])
    
    // AI Summaries Filter States
    const [summaryDisplayType, setSummaryDisplayType] = useState('all')
    const [summaryDateFilter, setSummaryDateFilter] = useState('all') 
    const [summaryStartDate, setSummaryStartDate] = useState('')
    const [summaryEndDate, setSummaryEndDate] = useState('')
    const [summaryLimit, setSummaryLimit] = useState(20)
    
    const router = useRouter()

    // Summary type selection
    const [selectedSummaryType, setSelectedSummaryType] = useState<string>('Extractive Summarization')

    // Filter states - แยกเป็น active (ที่ใช้งานจริง) และ pending (รอกดปุ่มค้นหา)
    const [source, setSource] = useState('all')
    const [nameCategory, setNameCategory] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const [limit, setLimit] = useState(20)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Pending states สำหรับ filters ที่รอกดปุ่มค้นหา
    const [pendingSource, setPendingSource] = useState('all')
    const [pendingNameCategory, setPendingNameCategory] = useState('all')
    const [pendingDateFilter, setPendingDateFilter] = useState('all')
    const [pendingLimit, setPendingLimit] = useState(20)
    const [pendingStartDate, setPendingStartDate] = useState('')
    const [pendingEndDate, setPendingEndDate] = useState('')

        // Summary types with descriptions
    const summaryTypes = [
        {
            value: 'Extractive Summarization',
            label: 'Extractive Summarization',
            description: 'สกัดประโยคสำคัญจากข่าวต้นฉบับโดยตรง',
            icon: <BookOpen className="h-5 w-5" />,
            color: 'text-blue-400',
            tooltip: {
                suitable: 'เหมาะสำหรับผู้ที่ต้องการข้อมูลดิบและรายละเอียดที่แม่นยำ',
                usage: ['ตรวจสอบข้อเท็จจริงและตัวเลข', 'อ้างอิงข้อมูลต้นฉบับ', 'วิเคราะห์ข้อมูลเชิงลึก', 'งานวิจัยและการศึกษา'],
                benefits: ['ความแม่นยำสูง', 'รักษาคำพูดต้นฉบับ', 'เหมาะกับข้อมูลทางเทคนิค'],
                example: 'ใช้เมื่อต้องการทราบราคา, วันที่, หรือสถิติที่แม่นยำจากข่าว'
            }
        },
        {
            value: 'Abstractive Summarization', 
            label: 'Abstractive Summarization',
            description: 'เขียนสรุปใหม่ด้วยคำและประโยคของ AI',
            icon: <Brain className="h-5 w-5" />,
            color: 'text-purple-400',
            tooltip: {
                suitable: 'เหมาะสำหรับผู้ที่ต้องการเข้าใจภาพรวมและเนื้อหาที่อ่านง่าย',
                usage: ['สรุปรายงานให้ผู้บริหาร', 'เนื้อหาสำหรับโซเชียลมีเดีย', 'การนำเสนอและพิทซ์', 'บทความและบล็อก'],
                benefits: ['อ่านเข้าใจง่าย', 'ย่อเนื้อหายาวๆ', 'เสนอมุมมองใหม่'],
                example: 'ใช้เมื่อต้องการสรุปข่าวยาวๆ ให้เป็นย่อหน้าสั้นๆ ที่เข้าใจง่าย'
            }
        },
        {
            value: 'Sentiment-Based Summarization',
            label: 'Sentiment-Based Summarization', 
            description: 'วิเคราะห์อารมณ์และทัศนคติของตลาด',
            icon: <MessageSquare className="h-5 w-5" />,
            color: 'text-green-400',
            tooltip: {
                suitable: 'เหมาะสำหรับเทรดเดอร์และผู้ลงทุนที่ต้องการเข้าใจ Market Sentiment',
                usage: ['การเทรดระยะสั้น', 'วิเคราะห์จิตวิทยาตลาด', 'ประเมินความเสี่ยง', 'การจับเทรนด์'],
                benefits: ['เข้าใจอารมณ์ตลาด', 'ประเมิน Fear & Greed', 'คาดการณ์การเคลื่อนไหว'],
                example: 'ใช้เมื่อต้องการรู้ว่าตลาดมี sentiment เป็นอย่างไร เพื่อตัดสินใจซื้อ-ขาย'
            }
        },
        {
            value: 'Impact-Oriented Summarization',
            label: 'Impact-Oriented Summarization',
            description: 'ประเมินผลกระทบต่อตลาดและเหรียญคริปโต',
            icon: <Target className="h-5 w-5" />,
            color: 'text-orange-400',
            tooltip: {
                suitable: 'เหมาะสำหรับนักลงทุนระยะยาวและผู้บริหารพอร์ตโฟลิโอ',
                usage: ['การลงทุนระยะยาว', 'วางแผนพอร์ตโฟลิโอ', 'การบริหารความเสี่ยง', 'วิเคราะห์ Fundamental'],
                benefits: ['ประเมินผลกระทบระยะยาว', 'ระบุโอกาสลงทุน', 'เตือนความเสี่ยง'],
                example: 'ใช้เมื่อต้องการรู้ว่าข่าวนี้จะส่งผลต่อราคาเหรียญในระยะยาวหรือไม่'
            }
        },
        {
            value: 'Actionable Insights Summarization',
            label: 'Actionable Insights Summarization',
            description: 'ให้คำแนะนำและข้อมูลเชิงปฏิบัติ',
            icon: <Lightbulb className="h-5 w-5" />,
            color: 'text-yellow-400',
            tooltip: {
                suitable: 'เหมาะสำหรับผู้ที่ต้องการคำแนะนำชัดเจนและแผนการดำเนินงาน',
                usage: ['การตัดสินใจลงทุน', 'วางกลยุทธ์เทรด', 'การบริหารพอร์ตโฟลิโอ', 'แผนการซื้อ-ขาย'],
                benefits: ['ได้คำแนะนำที่ชัดเจน', 'แผนการปฏิบัติ', 'ประเมินโอกาสและความเสี่ยง'],
                example: 'ใช้เมื่อต้องการคำตอบว่า "ควรซื้อ-ขาย-ถือ" และทำอย่างไรต่อไป'
            }
        }
    ]

    // Base crypto categories
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

    // Generate dynamic crypto categories
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
                limit: limit.toString(),
                source: source !== 'all' ? source : '',
                name_category: nameCategory !== 'all' ? nameCategory : '',
                sortBy: 'created_at',
                order: 'desc'
            })

            const response = await fetch(`/api/articles?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch articles')
            }

            const data: ArticlesResponse = await response.json()

            // Apply date filtering on client side
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
                            if (startDate && endDate) {
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
    }, [limit, source, nameCategory, dateFilter, startDate, endDate])

    const fetchAISummaries = useCallback(async () => {
        try {
            const response = await fetch('/api/ai-news-all')
            if (response.ok) {
                const data = await response.json()
                setAiSummaries(data.summaries)
            }
        } catch (err) {
            console.error('Failed to fetch AI summaries:', err)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
        fetchArticles()
        fetchAISummaries()
    }, [fetchCategories, fetchArticles, fetchAISummaries])



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

    const handleSearchArticles = () => {
        setSource(pendingSource)
        setNameCategory(pendingNameCategory)
        setDateFilter(pendingDateFilter)
        setLimit(pendingLimit)
        setStartDate(pendingStartDate)
        setEndDate(pendingEndDate)
    }

    const handleProcessWithAI = async () => {
        if (selectedArticles.length === 0) {
            setError('กรุณาเลือกข่าวที่จะวิเคราะห์')
            return
        }

        setProcessing(true)
        setError(null)

        try {
            const selectedArticleData = articles.filter(a => selectedArticles.includes(a.id))

            const response = await fetch('/api/ai-news-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    articles: selectedArticleData,
                    summaryType: selectedSummaryType
                })
            })

            if (!response.ok) {
                throw new Error('Failed to process articles')
            }

            const result: AINewsAllResponse = await response.json()

            if (result.success) {
                // Refresh summaries
                await fetchAISummaries()
                setSelectedArticles([])
                setShowSummaries(true)
            } else {
                throw new Error(result.message || 'Processing failed')
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during processing')
        } finally {
            setProcessing(false)
        }
    }

    // Filter AI Summaries
    const filteredAISummaries = useMemo(() => {
        let filtered = aiSummaries

        // Filter by summary type
        if (summaryDisplayType !== 'all') {
            filtered = filtered.filter(summary => summary.summary_type === summaryDisplayType)
        }

        // Filter by date
        if (summaryDateFilter !== 'all') {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            filtered = filtered.filter(summary => {
                const summaryDate = new Date(summary.created_at)

                switch (summaryDateFilter) {
                    case 'today':
                        return summaryDate >= today
                    case 'yesterday':
                        const yesterday = new Date(today)
                        yesterday.setDate(yesterday.getDate() - 1)
                        return summaryDate >= yesterday && summaryDate < today
                    case 'week':
                        const weekAgo = new Date(today)
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return summaryDate >= weekAgo
                    case 'month':
                        const monthAgo = new Date(today)
                        monthAgo.setDate(monthAgo.getDate() - 30)
                        return summaryDate >= monthAgo
                    case 'custom':
                        if (summaryStartDate && summaryEndDate) {
                            const start = new Date(summaryStartDate)
                            const end = new Date(summaryEndDate)
                            end.setHours(23, 59, 59, 999)
                            return summaryDate >= start && summaryDate <= end
                        }
                        return true
                    default:
                        return true
                }
            })
        }

        // Sort by created_at desc and limit to specified number
        return filtered
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, Math.min(summaryLimit, 50)) // Maximum 50 items
    }, [aiSummaries, summaryDisplayType, summaryDateFilter, summaryStartDate, summaryEndDate, summaryLimit])

    if (!user) {
        return null
    }

    if (loading) {
        return (
            <CyberLoader
                title="กำลังโหลด AI News..."
                subtitle="รอสักครู่ เรากำลังเตรียมระบบวิเคราะห์ข่าวด้วย AI"
                showProgress={true}
                messages={[
                    'โหลดข้อมูลข่าว...',
                    'เตรียมระบบ AI...',
                    'ตั้งค่าโมเดลการวิเคราะห์...',
                    'พร้อมใช้งาน...'
                ]}
            />
        )
    }

    return (
        <div className="min-h-screen">
            <NeonHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/home')}
                        className="neon-button p-3 rounded-lg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="gradient-text text-3xl font-bold flex items-center gap-3">
                            <Cpu className="h-8 w-8" />
                            AI News Analysis
                        </h1>
                        <p className="text-gray-400 mt-2">
                            วิเคราะห์ข่าวคริปโตด้วย AI แบบแยกแต่ละข่าว พร้อม 5 รูปแบบการสรุป
                        </p>
                    </div>
                </div>

                {/* Summary Type Selection */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6">
                    <h2 className="gradient-text text-xl font-semibold mb-4 flex items-center gap-3">
                        <Brain className="h-6 w-6" />
                        เลือกประเภทการวิเคราะห์
                    </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {summaryTypes.map((type) => (
                            <div
                                key={type.value}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${selectedSummaryType === type.value
                                        ? 'neon-border bg-cyan-500/10'
                                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                                }`}
                                onClick={() => setSelectedSummaryType(type.value)}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={type.color}>{type.icon}</span>
                                    <span className={`font-medium ${selectedSummaryType === type.value ? 'text-cyan-300' : 'text-white'}`}>
                                        {type.label}
                                    </span>
                                    {selectedSummaryType === type.value && (
                                        <Check className="h-4 w-4 text-cyan-400 ml-auto" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">{type.description}</p>
                            </div>
                        ))}
                    </div>
                    
                    {/* Selected Summary Type Details */}
                    {(() => {
                        const selectedType = summaryTypes.find(type => type.value === selectedSummaryType)
                        return selectedType && (
                            <div className="mt-6 p-6 bg-gray-800/30 border border-cyan-400/30 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={selectedType.color}>{selectedType.icon}</span>
                                    <h3 className="text-lg font-semibold text-cyan-300">
                                        {selectedType.label}
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Suitable For */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-cyan-300 font-semibold mb-3">
                                            <Users className="h-4 w-4" />
                                            เหมาะสำหรับ
                                        </h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">{selectedType.tooltip.suitable}</p>
                                    </div>

                                    {/* Usage Cases */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-green-300 font-semibold mb-3">
                                            <Target className="h-4 w-4" />
                                            การใช้งาน
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedType.tooltip.usage.map((use, index) => (
                                                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                                                    <span className="text-green-400 text-xs mt-1">•</span>
                                                    <span>{use}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    {/* Benefits */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-yellow-300 font-semibold mb-3">
                                            <CheckCircle className="h-4 w-4" />
                                            ข้อดี
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedType.tooltip.benefits.map((benefit, index) => (
                                                <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Example */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-purple-300 font-semibold mb-3">
                                            <Lightbulb className="h-4 w-4" />
                                            ตัวอย่างการใช้งาน
                                        </h4>
                                        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-400/30">
                                            <p className="text-gray-300 text-sm italic leading-relaxed">{selectedType.tooltip.example}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </div>

                {/* Filters */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6">
                    <h2 className="gradient-text text-xl font-semibold mb-4 flex items-center gap-3">
                        <Filter className="h-6 w-6" />
                        กรองข่าว
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Source Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                แหล่งข่าว
                            </label>
                            <select
                                value={pendingSource}
                                onChange={(e) => setPendingSource(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            >
                                {sourceOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                หมวดหมู่
                            </label>
                            <select
                                value={pendingNameCategory}
                                onChange={(e) => setPendingNameCategory(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            >
                                {cryptoCategories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.icon} {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                ช่วงเวลา
                            </label>
                            <select
                                value={pendingDateFilter}
                                onChange={(e) => setPendingDateFilter(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            >
                                {dateOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Limit */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                จำนวน
                            </label>
                            <select
                                value={pendingLimit}
                                onChange={(e) => setPendingLimit(parseInt(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            >
                                <option value={10}>10 ข่าว</option>
                                <option value={20}>20 ข่าว</option>
                                <option value={50}>50 ข่าว</option>
                                <option value={100}>100 ข่าว</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {pendingDateFilter === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    วันที่เริ่มต้น
                                </label>
                                <input
                                    type="date"
                                    value={pendingStartDate}
                                    onChange={(e) => setPendingStartDate(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    วันที่สิ้นสุด
                                </label>
                                <input
                                    type="date"
                                    value={pendingEndDate}
                                    onChange={(e) => setPendingEndDate(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSearchArticles}
                        className="neon-button px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                    >
                        <Search className="h-4 w-4" />
                        ค้นหาข่าว
                    </button>
                </div>

                {/* Article Selection */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="gradient-text text-xl font-semibold flex items-center gap-3">
                            <Eye className="h-6 w-6" />
                            เลือกข่าวสำหรับวิเคราะห์
                        </h2>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSelectAll}
                                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
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
                                เลือกแล้ว: {selectedArticles.length}/{articles.length}
                            </span>
                        </div>
                    </div>
                    {/* Process Button */}
                    <div className="glass-card neon-border rounded-xl mb-8 p-6 text-center">
                        <button
                            onClick={handleProcessWithAI}
                            disabled={selectedArticles.length === 0 || processing}
                            className={`px-8 py-4 rounded-lg font-medium text-lg flex items-center gap-3 mx-auto transition-all duration-300 ${selectedArticles.length === 0 || processing
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'neon-button hover:scale-105'
                                }`}
                        >
                            {processing ? (
                                <>
                                    <Zap className="h-6 w-6 animate-spin" />
                                    กำลังวิเคราะห์ด้วย AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-6 w-6" />
                                    วิเคราะห์ข่าวด้วย AI ({selectedArticles.length} ข่าว)
                                </>
                            )}
                        </button>
                        <p className="text-gray-400 mt-2 text-sm">
                            เลือกข่าวและกดปุ่มเพื่อเริ่มการวิเคราะห์ด้วย AI
                        </p>
                    </div>

                    {articlesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-700 h-64 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <div key={article.id} className="relative">
                                    <div
                                        className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-300 ${selectedArticles.includes(article.id)
                                                ? 'bg-cyan-400 border-cyan-400'
                                                : 'bg-transparent border-gray-400 hover:border-cyan-400'
                                            }`}
                                        onClick={() => handleSelectArticle(article.id)}
                                    >
                                        {selectedArticles.includes(article.id) && (
                                            <Check className="h-4 w-4 text-black" />
                                        )}
                                    </div>
                                    <NewsCard article={article} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">ไม่พบข่าวที่ตรงกับเงื่อนไข</p>
                        </div>
                    )}
                </div>



                {/* Error Display */}
                {error && (
                    <div className="glass-card bg-red-500/10 border-red-400/30 rounded-lg p-4 mb-8">
                        <p className="text-red-300 flex items-center gap-2">
                            <X className="h-4 w-4" />
                            {error}
                        </p>
                    </div>
                )}

                {/* AI Summaries Filters */}
                {aiSummaries.length > 0 && (
                    <div className="glass-card neon-border rounded-xl mb-8 p-6">
                        <h2 className="gradient-text text-xl font-semibold mb-4 flex items-center gap-3">
                            <Filter className="h-6 w-6" />
                            กรองผลการวิเคราะห์ AI
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Summary Type Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    ประเภทการวิเคราะห์
                                </label>
                                <select
                                    value={summaryDisplayType}
                                    onChange={(e) => setSummaryDisplayType(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                >
                                    <option value="all">ทุกประเภท</option>
                                    {summaryTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label.replace(' Summarization', '')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    ช่วงเวลา
                                </label>
                                <select
                                    value={summaryDateFilter}
                                    onChange={(e) => setSummaryDateFilter(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                >
                                    {dateOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Limit */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    จำนวนที่แสดง
                                </label>
                                <select
                                    value={summaryLimit}
                                    onChange={(e) => setSummaryLimit(parseInt(e.target.value))}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                >
                                    <option value={10}>10 ข่าว</option>
                                    <option value={20}>20 ข่าว</option>
                                    <option value={30}>30 ข่าว</option>
                                    <option value={50}>50 ข่าว (สูงสุด)</option>
                                </select>
                            </div>

                            {/* Stats */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    สถิติ
                                </label>
                                <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                                    <div className="text-cyan-400 font-semibold">{filteredAISummaries.length}</div>
                                    <div className="text-xs text-gray-400">จาก {aiSummaries.length} ข่าว</div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Date Range */}
                        {summaryDateFilter === 'custom' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        วันที่เริ่มต้น
                                    </label>
                                    <input
                                        type="date"
                                        value={summaryStartDate}
                                        onChange={(e) => setSummaryStartDate(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        วันที่สิ้นสุด
                                    </label>
                                    <input
                                        type="date"
                                        value={summaryEndDate}
                                        onChange={(e) => setSummaryEndDate(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Show/Hide Summaries Toggle */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6">
                    <button
                        onClick={() => setShowSummaries(!showSummaries)}
                        className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Star className="h-6 w-6 text-yellow-400" />
                            <span className="gradient-text text-xl font-semibold">
                                ผลการวิเคราะห์ AI 
                                {filteredAISummaries.length !== aiSummaries.length 
                                    ? ` (${filteredAISummaries.length}/${aiSummaries.length})`
                                    : ` (${aiSummaries.length})`
                                }
                            </span>
                        </div>
                        {showSummaries ? (
                            <ChevronUp className="h-6 w-6 text-cyan-400" />
                        ) : (
                            <ChevronDown className="h-6 w-6 text-cyan-400" />
                        )}
                    </button>
                </div>

                {/* AI Summaries Display */}
                {showSummaries && (
                    <div className="space-y-6">
                        {filteredAISummaries.length > 0 ? (
                            filteredAISummaries.map((summary) => (
                                <div key={summary.id} className="glass-card neon-border rounded-xl p-6">
                                    {/* Summary Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                {summary.original_title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {summary.original_source}
                                                </span>
                                                {summary.original_url && (
                                                    <a
                                                        href={summary.original_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                                                        title="อ่านข่าวต้นฉบับ"
                                                    >
                                                        <Globe className="h-3 w-3" />
                                                        อ่านต้นฉบับ
                                                    </a>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {summary.processing_time}s
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Brain className="h-3 w-3" />
                                                    {summary.summary_type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${summary.ai_sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' :
                                                    summary.ai_sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {summary.ai_sentiment}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Summary Content */}
                                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                        <p className="text-gray-200 leading-relaxed">
                                            {summary.ai_summary}
                                        </p>
                                    </div>

                                    {/* Scores */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Trending Score:</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                        style={{ width: `${summary.trending_score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-cyan-400 font-medium">{summary.trending_score}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Market Impact:</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                                        style={{ width: `${summary.market_impact_score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-orange-400 font-medium">{summary.market_impact_score}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Points */}
                                    {summary.key_points && summary.key_points.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">จุดสำคัญ:</h4>
                                            <div className="space-y-1">
                                                {summary.key_points.map((point, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <span className="text-cyan-400 text-xs mt-1">•</span>
                                                        <span className="text-gray-200 text-sm">{point}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Related Cryptos */}
                                    {summary.related_cryptos && summary.related_cryptos.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">คริปโตที่เกี่ยวข้อง:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {summary.related_cryptos.map((crypto, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                                                    >
                                                        {crypto}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : aiSummaries.length > 0 ? (
                            <div className="glass-card neon-border rounded-xl p-12 text-center">
                                <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="gradient-text text-2xl font-bold mb-4">
                                    ไม่พบผลการวิเคราะห์ที่ตรงกับการกรอง
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    ลองเปลี่ยนเงื่อนไขการกรองหรือเลือกช่วงเวลาอื่น
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    <button
                                        onClick={() => setSummaryDisplayType('all')}
                                        className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                    >
                                        แสดงทุกประเภท
                                    </button>
                                    <button
                                        onClick={() => setSummaryDateFilter('all')}
                                        className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                    >
                                        แสดงทุกวันที่
                                    </button>
                                    <button
                                        onClick={() => setSummaryLimit(50)}
                                        className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                    >
                                        แสดง 50 ข่าว
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card neon-border rounded-xl p-12 text-center">
                                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="gradient-text text-2xl font-bold mb-4">
                                    ยังไม่มีผลการวิเคราะห์
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    เลือกข่าวและเริ่มการวิเคราะห์ด้วย AI เพื่อดูผลลัพธ์ที่นี่
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
