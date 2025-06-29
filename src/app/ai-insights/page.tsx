'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import NeonHeader from '@/components/NeonHeader'
import CyberLoader from '@/components/CyberLoader'
import { AuthData, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Brain,
    TrendingUp,
    TrendingDown,
    Target,
    Lightbulb,
    PieChart,
    AlertTriangle,
    Users,
    Coins,
    DollarSign,
    Minus,
    Star,
    Eye,
    RefreshCw,
    Calendar
} from 'lucide-react'

interface AINiewsAllSummary {
    id: string
    article_id: string
    original_title: string
    original_source: string
    original_url: string
    summary_type: string
    ai_summary: string
    ai_sentiment: string
    trending_score: number
    key_points: string[]
    related_cryptos: string[]
    market_impact_score: number
    created_at: string
}

interface MarketInsight {
    overall_sentiment: 'Positive' | 'Neutral' | 'Negative'
    sentiment_distribution: {
        positive: number
        neutral: number
        negative: number
    }
    average_trending_score: number
    average_market_impact: number
    top_cryptos: Array<{
        crypto: string
        count: number
        avg_sentiment_score: number
        avg_impact: number
    }>
    top_positive_cryptos: Array<{
        crypto: string
        count: number
        avg_sentiment_score: number
        avg_impact: number
    }>
    top_negative_cryptos: Array<{
        crypto: string
        count: number
        avg_sentiment_score: number
        avg_impact: number
    }>
    key_themes: string[]
    summary_types_stats: Record<string, number>
    trading_recommendation: 'BUY' | 'HOLD' | 'SELL' | 'WAIT'
    confidence_level: number
}

export default function AIInsights() {
    const [loading, setLoading] = useState(true)
    const [dataLoading, setDataLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<AuthData | null>(null)
    const [aiSummaries, setAiSummaries] = useState<AINiewsAllSummary[]>([])
    const [timeFilter, setTimeFilter] = useState('all')
    const [selectedCrypto, setSelectedCrypto] = useState('all')
    const [selectedDate, setSelectedDate] = useState('')
    const [showTrendingInfo, setShowTrendingInfo] = useState(false)
    const [showImpactInfo, setShowImpactInfo] = useState(false)
    const [showCryptoDetails, setShowCryptoDetails] = useState<string | null>(null)
    const [showThemeDetails, setShowThemeDetails] = useState<string | null>(null)
    const [showSummaryTypeModal, setShowSummaryTypeModal] = useState<string | null>(null)
    const [summaryTypeNews, setSummaryTypeNews] = useState<AINiewsAllSummary[]>([])
    const [loadingSummaryNews, setLoadingSummaryNews] = useState(false)
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

    const fetchAISummaries = useCallback(async () => {
        setDataLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/ai-news-all')
            if (response.ok) {
                const data = await response.json()
                setAiSummaries(data.summaries || [])
            } else {
                throw new Error('Failed to fetch AI summaries')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setDataLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAISummaries()
    }, [fetchAISummaries])

    // Close dropdown details when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            // Don't close if clicking on Eye buttons or detail content
            if (target.closest('[data-tooltip-content]') || target.closest('[data-tooltip-trigger]')) {
                return
            }
            setShowCryptoDetails(null)
            setShowThemeDetails(null)
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowSummaryTypeModal(null)
            }
        }

        if (showSummaryTypeModal) {
            document.addEventListener('keydown', handleEscKey)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey)
            document.body.style.overflow = 'unset'
        }
    }, [showSummaryTypeModal])

    // Get all available cryptocurrencies
    const availableCryptos = useMemo(() => {
        const cryptos = new Set<string>()
        aiSummaries.forEach(summary => {
            summary.related_cryptos?.forEach(crypto => cryptos.add(crypto))
        })
        return Array.from(cryptos).sort()
    }, [aiSummaries])

    // Filter summaries by time, crypto, and date
    const filteredSummaries = useMemo(() => {
        let filtered = aiSummaries

        // Filter by crypto
        if (selectedCrypto !== 'all') {
            filtered = filtered.filter(summary =>
                summary.related_cryptos?.includes(selectedCrypto)
            )
        }

        // Filter by specific date
        if (selectedDate) {
            const targetDate = new Date(selectedDate)
            filtered = filtered.filter(summary => {
                const summaryDate = new Date(summary.created_at)
                return summaryDate.toDateString() === targetDate.toDateString()
            })
        } else {
            // Filter by time range if no specific date
            if (timeFilter !== 'all') {
                const now = new Date()
                const filterDate = new Date()

                switch (timeFilter) {
                    case 'today':
                        filterDate.setHours(0, 0, 0, 0)
                        break
                    case 'week':
                        filterDate.setDate(now.getDate() - 7)
                        break
                    case 'month':
                        filterDate.setDate(now.getDate() - 30)
                        break
                    default:
                        return filtered
                }

                filtered = filtered.filter(summary =>
                    new Date(summary.created_at) >= filterDate
                )
            }
        }

        return filtered
    }, [aiSummaries, timeFilter, selectedCrypto, selectedDate])

    // Calculate market insights
    const marketInsights: MarketInsight = useMemo(() => {
        if (filteredSummaries.length === 0) {
            return {
                overall_sentiment: 'Neutral',
                sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
                average_trending_score: 0,
                average_market_impact: 0,
                top_cryptos: [],
                top_positive_cryptos: [],
                top_negative_cryptos: [],
                key_themes: [],
                summary_types_stats: {},
                trading_recommendation: 'WAIT',
                confidence_level: 0
            }
        }

        // Sentiment analysis
        const sentimentCounts = filteredSummaries.reduce((acc, summary) => {
            const sentiment = summary.ai_sentiment.toLowerCase()
            if (sentiment === 'positive') acc.positive++
            else if (sentiment === 'negative') acc.negative++
            else acc.neutral++
            return acc
        }, { positive: 0, neutral: 0, negative: 0 })

        const totalSummaries = filteredSummaries.length
        const sentimentDistribution = {
            positive: Math.round((sentimentCounts.positive / totalSummaries) * 100),
            neutral: Math.round((sentimentCounts.neutral / totalSummaries) * 100),
            negative: Math.round((sentimentCounts.negative / totalSummaries) * 100)
        }

        // Overall sentiment
        let overallSentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral'
        if (sentimentDistribution.positive > 50) overallSentiment = 'Positive'
        else if (sentimentDistribution.negative > 50) overallSentiment = 'Negative'

        // Average scores
        const avgTrendingScore = Math.round(
            filteredSummaries.reduce((sum, s) => sum + s.trending_score, 0) / totalSummaries
        )
        const avgMarketImpact = Math.round(
            filteredSummaries.reduce((sum, s) => sum + s.market_impact_score, 0) / totalSummaries
        )

        // Top cryptos analysis
        const cryptoStats: Record<string, { count: number; sentiments: string[]; impacts: number[] }> = {}

        filteredSummaries.forEach(summary => {
            summary.related_cryptos?.forEach(crypto => {
                if (!cryptoStats[crypto]) {
                    cryptoStats[crypto] = { count: 0, sentiments: [], impacts: [] }
                }
                cryptoStats[crypto].count++
                cryptoStats[crypto].sentiments.push(summary.ai_sentiment)
                cryptoStats[crypto].impacts.push(summary.market_impact_score)
            })
        })

        const topCryptos = Object.entries(cryptoStats)
            .map(([crypto, stats]) => {
                const positiveSentiments = stats.sentiments.filter(s => s === 'Positive').length
                const avgSentimentScore = (positiveSentiments / stats.sentiments.length) * 100
                const avgImpact = stats.impacts.reduce((sum, impact) => sum + impact, 0) / stats.impacts.length

                return {
                    crypto,
                    count: stats.count,
                    avg_sentiment_score: Math.round(avgSentimentScore),
                    avg_impact: Math.round(avgImpact)
                }
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        // Key themes from all key points
        const allKeyPoints = filteredSummaries.flatMap(s => s.key_points || [])
        const keyThemes = [...new Set(allKeyPoints)].slice(0, 8)

        // Summary types statistics
        const summaryTypesStats = filteredSummaries.reduce((acc, summary) => {
            acc[summary.summary_type] = (acc[summary.summary_type] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Top positive and negative cryptos
        const topPositiveCryptos = topCryptos
            .filter(crypto => crypto.count >= 2) // ต้องมีข่าวอย่างน้อย 2 ข่าว
            .sort((a, b) => {
                // เรียงตาม sentiment score ก่อน แล้วตาม impact
                if (b.avg_sentiment_score !== a.avg_sentiment_score) {
                    return b.avg_sentiment_score - a.avg_sentiment_score
                }
                return b.avg_impact - a.avg_impact
            })
            .slice(0, 3)

        const topNegativeCryptos = topCryptos
            .filter(crypto => crypto.count >= 2) // ต้องมีข่าวอย่างน้อย 2 ข่าว
            .sort((a, b) => {
                // เรียงตาม sentiment score จากต่ำไปสูง แล้วตาม impact
                if (a.avg_sentiment_score !== b.avg_sentiment_score) {
                    return a.avg_sentiment_score - b.avg_sentiment_score
                }
                return b.avg_impact - a.avg_impact
            })
            .slice(0, 3)

        // Trading recommendation logic
        let tradingRecommendation: 'BUY' | 'HOLD' | 'SELL' | 'WAIT' = 'WAIT'
        let confidenceLevel = 50

        if (avgTrendingScore >= 70 && avgMarketImpact >= 70 && sentimentDistribution.positive >= 60) {
            tradingRecommendation = 'BUY'
            confidenceLevel = 85
        } else if (avgTrendingScore <= 30 && avgMarketImpact <= 30 && sentimentDistribution.negative >= 60) {
            tradingRecommendation = 'SELL'
            confidenceLevel = 80
        } else if (avgTrendingScore >= 50 && sentimentDistribution.positive >= 40) {
            tradingRecommendation = 'HOLD'
            confidenceLevel = 65
        }

        return {
            overall_sentiment: overallSentiment,
            sentiment_distribution: sentimentDistribution,
            average_trending_score: avgTrendingScore,
            average_market_impact: avgMarketImpact,
            top_cryptos: topCryptos,
            top_positive_cryptos: topPositiveCryptos,
            top_negative_cryptos: topNegativeCryptos,
            key_themes: keyThemes,
            summary_types_stats: summaryTypesStats,
            trading_recommendation: tradingRecommendation,
            confidence_level: confidenceLevel
        }
    }, [filteredSummaries])

    if (!user) {
        return null
    }

    if (loading) {
        return (
            <CyberLoader
                title="กำลังโหลด AI Insights..."
                subtitle="รอสักครู่ เรากำลังวิเคราะห์ข้อมูลทั้งหมด"
                showProgress={true}
                messages={[
                    'ดึงข้อมูลการวิเคราะห์ AI...',
                    'คำนวณตัวชี้วัดตลาด...',
                    'วิเคราะห์แนวโน้มเหรียญ...',
                    'สร้างคำแนะนำการซื้อขาย...'
                ]}
            />
        )
    }

    // ฟังก์ชันดึงข่าวตาม summary type
    const fetchSummaryTypeNews = (summaryType: string) => {
        setLoadingSummaryNews(true)
        try {
            // กรองข่าวตาม summary type และ current filters
            const typeNews = filteredSummaries.filter(summary => summary.summary_type === summaryType)
            setSummaryTypeNews(typeNews)
            setShowSummaryTypeModal(summaryType)
        } catch (error) {
            console.error('Error filtering summary type news:', error)
            setSummaryTypeNews([])
        } finally {
            setLoadingSummaryNews(false)
        }
    }

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'Positive': return <TrendingUp className="h-5 w-5 text-green-400" />
            case 'Negative': return <TrendingDown className="h-5 w-5 text-red-400" />
            default: return <Minus className="h-5 w-5 text-gray-400" />
        }
    }

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'BUY': return 'text-green-400 bg-green-500/20'
            case 'SELL': return 'text-red-400 bg-red-500/20'
            case 'HOLD': return 'text-yellow-400 bg-yellow-500/20'
            default: return 'text-gray-400 bg-gray-500/20'
        }
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
                    <div className="flex-1">
                        <h1 className="gradient-text text-3xl font-bold flex items-center gap-3">
                            <Brain className="h-8 w-8" />
                            AI Market Insights
                        </h1>
                        <p className="text-gray-400 mt-2">
                            สรุปผลการวิเคราะห์ AI ทั้งหมด เพื่อการตัดสินใจซื้อขายอย่างมีข้อมูล
                        </p>
                    </div>
                    <button
                        onClick={fetchAISummaries}
                        className="neon-button p-3 rounded-lg"
                        disabled={dataLoading}
                    >
                        <RefreshCw className={`h-5 w-5 ${dataLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Filters */}
                <div className="glass-card neon-border rounded-xl mb-8 p-6">
                    <div className="space-y-4">
                        {/* Crypto Filter */}
                        <div className="flex items-center gap-4">
                            <Coins className="h-5 w-5 text-orange-400" />
                            <span className="text-gray-300 font-medium">เหรียญ:</span>
                            <select
                                value={selectedCrypto}
                                onChange={(e) => setSelectedCrypto(e.target.value)}
                                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 focus:border-cyan-400 focus:outline-none"
                            >
                                <option value="all">ทั้งหมด</option>
                                {availableCryptos.map(crypto => (
                                    <option key={crypto} value={crypto}>{crypto}</option>
                                ))}
                            </select>
                            <span className="text-gray-400">
                                ({availableCryptos.length} เหรียญ)
                            </span>
                        </div>

                        {/* Date and Time Filter */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <Calendar className="h-5 w-5 text-cyan-400" />
                            <span className="text-gray-300 font-medium">เวลา:</span>

                            {/* Specific Date */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value)
                                        if (e.target.value) setTimeFilter('all')
                                    }}
                                    className="px-3 py-2 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 focus:border-cyan-400 focus:outline-none"
                                />
                                {selectedDate && (
                                    <button
                                        onClick={() => setSelectedDate('')}
                                        className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30"
                                    >
                                        ลบ
                                    </button>
                                )}
                            </div>

                            <span className="text-gray-400">หรือ</span>

                            {/* Time Range */}
                            <div className="flex gap-2">
                                {[
                                    { value: 'all', label: 'ทั้งหมด' },
                                    { value: 'today', label: 'วันนี้' },
                                    { value: 'week', label: '7 วัน' },
                                    { value: 'month', label: '30 วัน' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setTimeFilter(option.value)
                                            if (option.value !== 'all') setSelectedDate('')
                                        }}
                                        disabled={selectedDate !== ''}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeFilter === option.value && !selectedDate
                                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                                            : selectedDate !== ''
                                                ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <span className="text-gray-400 ml-auto">
                                ({filteredSummaries.length} การวิเคราะห์)
                            </span>
                        </div>
                    </div>
                </div>

                {dataLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-700 h-32 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="glass-card bg-red-500/10 border-red-400/30 rounded-lg p-6 mb-8 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-300">{error}</p>
                    </div>
                ) : filteredSummaries.length === 0 ? (
                    <div className="glass-card neon-border rounded-xl p-12 text-center mb-8">
                        <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="gradient-text text-2xl font-bold mb-4">
                            ยังไม่มีข้อมูลการวิเคราะห์
                        </h3>
                        <p className="text-gray-400 mb-6">
                            ไปหน้า AI News เพื่อเริ่มวิเคราะห์ข่าวก่อน
                        </p>
                        <button
                            onClick={() => router.push('/ai-news')}
                            className="neon-button px-6 py-3 rounded-lg font-medium"
                        >
                            ไปหน้า AI News
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Overall Sentiment */}
                            <div className="glass-card neon-border rounded-xl p-6 text-center">
                                <div className="flex items-center justify-center mb-3">
                                    {getSentimentIcon(marketInsights.overall_sentiment)}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">ทิศทางตลาด</h3>
                                <p className={`text-2xl font-bold ${marketInsights.overall_sentiment === 'Positive' ? 'text-green-400' :
                                    marketInsights.overall_sentiment === 'Negative' ? 'text-red-400' :
                                        'text-gray-400'
                                    }`}>
                                    {marketInsights.overall_sentiment === 'Positive' ? 'บวก' :
                                        marketInsights.overall_sentiment === 'Negative' ? 'ลบ' : 'เป็นกลาง'}
                                </p>
                                <div className="mt-2 text-sm text-gray-400">
                                    {marketInsights.sentiment_distribution.positive}% บวก | {marketInsights.sentiment_distribution.negative}% ลบ
                                </div>
                            </div>

                            {/* Trending Score */}
                            <div className="glass-card bg-blue-500/10 border-blue-400/30 rounded-xl p-6 text-center">
                                <div className="flex items-center justify-between mb-3">
                                    <div></div>
                                    <TrendingUp className="h-8 w-8 text-blue-400" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setShowTrendingInfo(!showTrendingInfo)
                                        }}
                                        className={`p-1 rounded transition-colors ${showTrendingInfo ? 'bg-blue-500/30 text-blue-200' : 'text-blue-400 hover:text-blue-300'}`}
                                    >
                                        <Lightbulb className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">คะแนนเทรนด์</h3>
                                <p className="text-3xl font-bold text-blue-400 mb-2">
                                    {marketInsights.average_trending_score}
                                </p>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-400 h-2 rounded-full"
                                        style={{ width: `${marketInsights.average_trending_score}%` }}
                                    ></div>
                                </div>

                            </div>

                            {/* Market Impact */}
                            <div className="glass-card bg-orange-500/10 border-orange-400/30 rounded-xl p-6 text-center">
                                <div className="flex items-center justify-between mb-3">
                                    <div></div>
                                    <Target className="h-8 w-8 text-orange-400" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setShowImpactInfo(!showImpactInfo)
                                        }}
                                        className={`p-1 rounded transition-colors ${showImpactInfo ? 'bg-orange-500/30 text-orange-200' : 'text-orange-400 hover:text-orange-300'}`}
                                    >
                                        <Lightbulb className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">ผลกระทบตลาด</h3>
                                <p className="text-3xl font-bold text-orange-400 mb-2">
                                    {marketInsights.average_market_impact}
                                </p>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-orange-400 h-2 rounded-full"
                                        style={{ width: `${marketInsights.average_market_impact}%` }}
                                    ></div>
                                </div>


                            </div>


                            {/* Trading Recommendation */}
                            <div className={`glass-card rounded-xl p-6 text-center border-2 ${marketInsights.trading_recommendation === 'BUY' ? 'border-green-400/50 bg-green-500/10' :
                                marketInsights.trading_recommendation === 'SELL' ? 'border-red-400/50 bg-red-500/10' :
                                    marketInsights.trading_recommendation === 'HOLD' ? 'border-yellow-400/50 bg-yellow-500/10' :
                                        'border-gray-400/50 bg-gray-500/10'
                                }`}>
                                <DollarSign className={`h-8 w-8 mx-auto mb-3 ${marketInsights.trading_recommendation === 'BUY' ? 'text-green-400' :
                                    marketInsights.trading_recommendation === 'SELL' ? 'text-red-400' :
                                        marketInsights.trading_recommendation === 'HOLD' ? 'text-yellow-400' :
                                            'text-gray-400'
                                    }`} />
                                <h3 className="text-lg font-semibold text-white mb-2">คำแนะนำ</h3>
                                <p className={`text-2xl font-bold mb-2 ${marketInsights.trading_recommendation === 'BUY' ? 'text-green-400' :
                                    marketInsights.trading_recommendation === 'SELL' ? 'text-red-400' :
                                        marketInsights.trading_recommendation === 'HOLD' ? 'text-yellow-400' :
                                            'text-gray-400'
                                    }`}>
                                    {marketInsights.trading_recommendation === 'BUY' ? 'ซื้อ' :
                                        marketInsights.trading_recommendation === 'SELL' ? 'ขาย' :
                                            marketInsights.trading_recommendation === 'HOLD' ? 'ถือ' : 'รอ'}
                                </p>
                                <div className="text-sm text-gray-400">
                                    ความมั่นใจ: {marketInsights.confidence_level}%
                                </div>
                            </div>
                        </div>


                        {showTrendingInfo && (
                            <div className="mt-4 p-4 bg-gray-800/70 border border-blue-400/30 rounded-lg text-sm text-left">
                                <h4 className="font-semibold text-blue-400 mb-3">คะแนนเทรนด์คืออะไร?</h4>

                                <div className="bg-blue-500/10 p-3 rounded-lg mb-3">
                                    <div className="text-blue-300 font-medium mb-1">การคำนวณ:</div>
                                    <div className="text-gray-300 text-xs mb-2">
                                        ผลรวม: {filteredSummaries.reduce((sum, s) => sum + s.trending_score, 0)} คะแนน
                                    </div>
                                    <div className="text-gray-300 text-xs mb-2">
                                        จำนวนข่าว: {filteredSummaries.length} ข่าว
                                    </div>
                                    <div className="text-blue-400 font-semibold text-sm">
                                        เฉลี่ย = {filteredSummaries.length > 0 ? Math.round(filteredSummaries.reduce((sum, s) => sum + s.trending_score, 0) / filteredSummaries.length) : 0} คะแนน
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-gray-300 font-medium mb-2">ความหมายของคะแนน:</div>
                                    <div className="grid grid-cols-1 gap-1 text-xs">
                                        <div className="flex justify-between p-2 bg-red-500/20 rounded">
                                            <span className="text-red-300">0-30:</span>
                                            <span className="text-gray-200">เทรนด์ต่ำ - ไม่น่าสนใจ</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-yellow-500/20 rounded">
                                            <span className="text-yellow-300">31-60:</span>
                                            <span className="text-gray-200">เทรนด์ปานกลาง - ควรติดตาม</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-green-500/20 rounded">
                                            <span className="text-green-300">61-100:</span>
                                            <span className="text-gray-200">เทรนด์สูง - น่าสนใจมาก</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-blue-400/20">
                                    <div className="text-xs text-gray-400">
                                        💡 คะแนนนี้วิเคราะห์จากความถี่ในการพูดถึง, ความสำคัญของข่าว, และปฏิกิริยาจากตลาด
                                    </div>
                                </div>
                            </div>
                        )}

                        {showImpactInfo && (
                            <div className="mt-4 p-4 bg-gray-800/70 border border-orange-400/30 rounded-lg text-sm text-left">
                                <h4 className="font-semibold text-orange-400 mb-3">ผลกระทบตลาดคืออะไร?</h4>

                                <div className="bg-orange-500/10 p-3 rounded-lg mb-3">
                                    <div className="text-orange-300 font-medium mb-1">การคำนวณ:</div>
                                    <div className="text-gray-300 text-xs mb-2">
                                        ผลรวม: {filteredSummaries.reduce((sum, s) => sum + s.market_impact_score, 0)} คะแนน
                                    </div>
                                    <div className="text-gray-300 text-xs mb-2">
                                        จำนวนข่าว: {filteredSummaries.length} ข่าว
                                    </div>
                                    <div className="text-orange-400 font-semibold text-sm">
                                        เฉลี่ย = {filteredSummaries.length > 0 ? Math.round(filteredSummaries.reduce((sum, s) => sum + s.market_impact_score, 0) / filteredSummaries.length) : 0} คะแนน
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-gray-300 font-medium mb-2">ความหมายของคะแนน:</div>
                                    <div className="grid grid-cols-1 gap-1 text-xs">
                                        <div className="flex justify-between p-2 bg-red-500/20 rounded">
                                            <span className="text-red-300">0-30:</span>
                                            <span className="text-gray-200">ผลกระทบต่ำ - ไม่มีผลต่อราคา</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-yellow-500/20 rounded">
                                            <span className="text-yellow-300">31-60:</span>
                                            <span className="text-gray-200">ผลกระทบปานกลาง - อาจมีผลต่อราคา</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-green-500/20 rounded">
                                            <span className="text-green-300">61-100:</span>
                                            <span className="text-gray-200">ผลกระทบสูง - มีผลต่อราคามาก</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-orange-400/20">
                                    <div className="text-xs text-gray-400">
                                        📊 คะแนนนี้วิเคราะห์จากความสำคัญของข่าว, ผลกระทบต่อการเงิน, และการตอบสนองของนักลงทุน
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Positive & Negative Cryptos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Top Positive Cryptos */}
                            <div className="glass-card bg-green-500/10 border-green-400/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="gradient-text text-xl font-semibold flex items-center gap-3">
                                        <TrendingUp className="h-6 w-6 text-green-400" />
                                        เหรียญทิศทางบวกสูงสุด
                                    </h3>
                                    <div className="text-xs text-gray-400 text-right">
                                        <div>เรียงตาม Sentiment Score</div>
                                        <div>ที่มีข่าวอย่างน้อย 2 ข่าว</div>
                                    </div>
                                </div>
                                {marketInsights.top_positive_cryptos.length > 0 ? (
                                    <div className="space-y-3">
                                        {marketInsights.top_positive_cryptos.map((crypto, index) => (
                                            <div key={crypto.crypto}
                                                className="flex items-center justify-between p-3 bg-green-800/20 rounded-lg border border-green-500/30 hover:border-green-400/50 hover:bg-green-800/30 transition-all duration-200 cursor-pointer group"
                                                onClick={() => setSelectedCrypto(crypto.crypto)}
                                                title={`คลิกเพื่อกรองดูข้อมูลเฉพาะ ${crypto.crypto}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                                                        <span className="text-green-400 font-bold text-sm">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold group-hover:text-green-100 transition-colors">{crypto.crypto}</div>
                                                        <div className="text-sm text-gray-400">({crypto.count} ข่าว)</div>
                                                        <div className="text-xs text-green-300/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            คลิกเพื่อกรองข้อมูลเฉพาะเหรียญนี้
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-green-400 font-bold text-lg group-hover:text-green-300 transition-colors">
                                                        {crypto.avg_sentiment_score}%
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Impact: {crypto.avg_impact}
                                                    </div>
                                                    <div className="text-xs text-green-400/60 mt-1">
                                                        Sentiment: Positive
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>ไม่มีเหรียญที่มีทิศทางบวก</p>
                                        <p className="text-sm">ในช่วงเวลาที่เลือก</p>
                                    </div>
                                )}
                            </div>

                            {/* Top Negative Cryptos */}
                            <div className="glass-card bg-red-500/10 border-red-400/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="gradient-text text-xl font-semibold flex items-center gap-3">
                                        <TrendingDown className="h-6 w-6 text-red-400" />
                                        เหรียญทิศทางลบสูงสุด
                                    </h3>
                                    <div className="text-xs text-gray-400 text-right">
                                        <div>เรียงตาม Sentiment Score ต่ำสุด</div>
                                        <div>ที่มีข่าวอย่างน้อย 2 ข่าว</div>
                                    </div>
                                </div>
                                {marketInsights.top_negative_cryptos.length > 0 ? (
                                    <div className="space-y-3">
                                        {marketInsights.top_negative_cryptos.map((crypto, index) => (
                                            <div key={crypto.crypto}
                                                className="flex items-center justify-between p-3 bg-red-800/20 rounded-lg border border-red-500/30 hover:border-red-400/50 hover:bg-red-800/30 transition-all duration-200 cursor-pointer group"
                                                onClick={() => setSelectedCrypto(crypto.crypto)}
                                                title={`คลิกเพื่อกรองดูข้อมูลเฉพาะ ${crypto.crypto}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                                                        <span className="text-red-400 font-bold text-sm">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold group-hover:text-red-100 transition-colors">{crypto.crypto}</div>
                                                        <div className="text-sm text-gray-400">({crypto.count} ข่าว)</div>
                                                        <div className="text-xs text-red-300/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            คลิกเพื่อกรองข้อมูลเฉพาะเหรียญนี้
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-red-400 font-bold text-lg group-hover:text-red-300 transition-colors">
                                                        {crypto.avg_sentiment_score}%
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Impact: {crypto.avg_impact}
                                                    </div>
                                                    <div className="text-xs text-red-400/60 mt-1">
                                                        Sentiment: Negative
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>ไม่มีเหรียญที่มีทิศทางลบ</p>
                                        <p className="text-sm">ในช่วงเวลาที่เลือก</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Types Distribution */}
                        <div className="glass-card neon-border rounded-xl p-6 mb-8">
                            <h3 className="gradient-text text-xl font-semibold mb-4 flex items-center gap-3">
                                <PieChart className="h-6 w-6" />
                                การกระจายประเภทการวิเคราะห์
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {Object.entries(marketInsights.summary_types_stats).map(([type, count]) => (
                                    <div key={type}
                                        className="text-center p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 hover:border hover:border-cyan-400/30 transition-all duration-200 group"
                                        onClick={() => fetchSummaryTypeNews(type)}
                                        title={`คลิกเพื่อดูข่าวประเภท ${type.replace(' Summarization', '')}`}
                                    >
                                        <div className="text-2xl font-bold text-cyan-400 mb-1 group-hover:text-cyan-300 transition-colors">{count}</div>
                                        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{type.replace(' Summarization', '')}</div>
                                        <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">
                                            {Math.round((count / filteredSummaries.length) * 100)}%
                                        </div>
                                        <div className="text-xs text-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                            คลิกเพื่อดูรายละเอียด
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trading Decision Helper */}
                        <div className={`glass-card rounded-xl p-6 border-2 ${marketInsights.trading_recommendation === 'BUY' ? 'border-green-400/50 bg-green-500/5' :
                            marketInsights.trading_recommendation === 'SELL' ? 'border-red-400/50 bg-red-500/5' :
                                marketInsights.trading_recommendation === 'HOLD' ? 'border-yellow-400/50 bg-yellow-500/5' :
                                    'border-gray-400/50 bg-gray-500/5'
                            }`}>
                            <h3 className="gradient-text text-xl font-semibold mb-4 flex items-center gap-3">
                                <Users className="h-6 w-6" />
                                สรุปการตัดสินใจซื้อขาย
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-3">ข้อมูลสำคัญ:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">ทิศทางตลาดรวม:</span>
                                            <span className={`font-semibold ${marketInsights.overall_sentiment === 'Positive' ? 'text-green-400' :
                                                marketInsights.overall_sentiment === 'Negative' ? 'text-red-400' :
                                                    'text-gray-400'
                                                }`}>
                                                {marketInsights.overall_sentiment === 'Positive' ? 'บวก' :
                                                    marketInsights.overall_sentiment === 'Negative' ? 'ลบ' : 'เป็นกลาง'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">คะแนนเทรนด์เฉลี่ย:</span>
                                            <span className="text-cyan-400 font-semibold">{marketInsights.average_trending_score}/100</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">ผลกระทบตลาดเฉลี่ย:</span>
                                            <span className="text-orange-400 font-semibold">{marketInsights.average_market_impact}/100</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">จำนวนข่าวที่วิเคราะห์:</span>
                                            <span className="text-white font-semibold">{filteredSummaries.length} ข่าว</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-3">คำแนะนำ:</h4>
                                    <div className={`p-4 rounded-lg border-2 ${getRecommendationColor(marketInsights.trading_recommendation)} border-opacity-50`}>
                                        <div className="text-center mb-3">
                                            <div className="text-3xl font-bold mb-2">
                                                {marketInsights.trading_recommendation === 'BUY' ? 'ซื้อ' :
                                                    marketInsights.trading_recommendation === 'SELL' ? 'ขาย' :
                                                        marketInsights.trading_recommendation === 'HOLD' ? 'ถือ' : 'รอ'}
                                            </div>
                                            <div className="text-sm opacity-75">
                                                ความมั่นใจ: {marketInsights.confidence_level}%
                                            </div>
                                        </div>
                                        <div className="text-sm text-center opacity-90">
                                            {marketInsights.trading_recommendation === 'BUY' &&
                                                'ข้อมูลส่วนใหญ่เป็นบวก เหมาะสำหรับการซื้อ'}
                                            {marketInsights.trading_recommendation === 'SELL' &&
                                                'ข้อมูลส่วนใหญ่เป็นลบ ควรพิจารณาขาย'}
                                            {marketInsights.trading_recommendation === 'HOLD' &&
                                                'ตลาดมีความผันผวน ควรถือและรอดู'}
                                            {marketInsights.trading_recommendation === 'WAIT' &&
                                                'ข้อมูลยังไม่ชัดเจน ควรรอข้อมูลเพิ่มเติม'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8">
                            {/* Top Cryptos */}
                            <div className="glass-card neon-border rounded-xl p-6 relative overflow-visible">
                                <h3 className="gradient-text text-xl font-semibold mb-4 flex items-center gap-3">
                                    <Coins className="h-6 w-6" />
                                    เหรียญที่น่าสนใจ
                                </h3>
                                <div className="space-y-3 relative">
                                    {marketInsights.top_cryptos.slice(0, 8).map((crypto, index) => (
                                        <div key={crypto.crypto}>
                                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-cyan-400 font-medium">#{index + 1}</span>
                                                    <span className="text-white font-semibold">{crypto.crypto}</span>
                                                    <span className="text-sm text-gray-400">({crypto.count} ข่าว)</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-400">Sentiment</div>
                                                        <div className={`text-sm font-semibold ${crypto.avg_sentiment_score >= 60 ? 'text-green-400' :
                                                            crypto.avg_sentiment_score <= 40 ? 'text-red-400' :
                                                                'text-gray-400'
                                                            }`}>
                                                            {crypto.avg_sentiment_score}%
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-400">Impact</div>
                                                        <div className="text-sm font-semibold text-orange-400">
                                                            {crypto.avg_impact}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowCryptoDetails(showCryptoDetails === crypto.crypto ? null : crypto.crypto)
                                                        }}
                                                        className={`px-2 py-1 text-xs rounded border transition-all hover:scale-105 ${showCryptoDetails === crypto.crypto
                                                            ? 'bg-cyan-500/40 text-cyan-200 border-cyan-300 shadow-md'
                                                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/30 hover:border-cyan-300'
                                                            }`}
                                                        data-tooltip-trigger
                                                        title="ดูรายละเอียดข่าว"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            {showCryptoDetails === crypto.crypto && (
                                                <div
                                                    className="mt-2 p-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-cyan-400/50 shadow-lg relative z-50"
                                                    onClick={(e) => e.stopPropagation()}
                                                    data-tooltip-content
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="text-sm font-semibold text-cyan-400">ข้อมูลข่าวที่เกี่ยวข้อง:</h5>
                                                        <span className="text-xs text-gray-400">
                                                            ({filteredSummaries.filter(s => s.related_cryptos?.includes(crypto.crypto)).length} ข่าว)
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {filteredSummaries
                                                            .filter(s => s.related_cryptos?.includes(crypto.crypto))
                                                            .slice(0, 8)
                                                            .map((summary, idx) => (
                                                                <div key={idx} className="p-2 bg-gray-800/50 rounded text-xs">
                                                                    <div className="text-gray-200 font-medium mb-1">
                                                                        {summary.original_title.slice(0, 80)}...
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-400">
                                                                        <span>📰 {summary.original_source}</span>
                                                                        {summary.original_url && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <a
                                                                                    href={summary.original_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
                                                                                    title="อ่านข่าวต้นฉบับ"
                                                                                >
                                                                                    🔗
                                                                                </a>
                                                                            </>
                                                                        )}
                                                                        <span>•</span>
                                                                        <span className={`font-medium ${summary.ai_sentiment === 'Positive' ? 'text-green-400' :
                                                                            summary.ai_sentiment === 'Negative' ? 'text-red-400' :
                                                                                'text-gray-400'
                                                                            }`}>
                                                                            {summary.ai_sentiment}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="text-orange-400">Impact: {summary.market_impact_score}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                        {filteredSummaries.filter(s => s.related_cryptos?.includes(crypto.crypto)).length > 8 && (
                                                            <div className="text-center text-gray-400 text-xs py-2">
                                                                และอีก {filteredSummaries.filter(s => s.related_cryptos?.includes(crypto.crypto)).length - 8} ข่าว...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Themes */}
                            <div className="glass-card neon-border rounded-xl p-6 relative overflow-visible">
                                <h3 className="gradient-text text-xl font-semibold mb-4 flex items-center gap-3">
                                    <Lightbulb className="h-6 w-6" />
                                    จุดสำคัญจากข่าว
                                </h3>
                                <div className="space-y-2 relative">
                                    {marketInsights.key_themes.map((theme, index) => (
                                        <div key={index}>
                                            <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                                                <Star className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                                                <span className="text-gray-200 text-sm leading-relaxed flex-1">{theme}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setShowThemeDetails(showThemeDetails === theme ? null : theme)
                                                    }}
                                                    className={`px-2 py-1 text-xs rounded border transition-all hover:scale-105 ${showThemeDetails === theme
                                                        ? 'bg-yellow-500/40 text-yellow-200 border-yellow-300 shadow-md'
                                                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30 hover:bg-yellow-500/30 hover:border-yellow-300'
                                                        }`}
                                                    data-tooltip-trigger
                                                    title="ดูข่าวที่เกี่ยวข้อง"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </button>
                                            </div>
                                            {showThemeDetails === theme && (
                                                <div
                                                    className="mt-2 p-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-yellow-400/50 shadow-lg relative z-50"
                                                    onClick={(e) => e.stopPropagation()}
                                                    data-tooltip-content
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="text-sm font-semibold text-yellow-400">ข่าวที่มีจุดสำคัญนี้:</h5>
                                                        <span className="text-xs text-gray-400">
                                                            ({filteredSummaries.filter(s => s.key_points?.includes(theme)).length} ข่าว)
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {filteredSummaries
                                                            .filter(s => s.key_points?.includes(theme))
                                                            .slice(0, 5)
                                                            .map((summary, idx) => (
                                                                <div key={idx} className="p-2 bg-gray-800/50 rounded text-xs">
                                                                    <div className="text-gray-200 font-medium mb-1">
                                                                        {summary.original_title.slice(0, 70)}...
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                                        <span>📰 {summary.original_source}</span>
                                                                        {summary.original_url && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <a
                                                                                    href={summary.original_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
                                                                                    title="อ่านข่าวต้นฉบับ"
                                                                                >
                                                                                    🔗
                                                                                </a>
                                                                            </>
                                                                        )}
                                                                        <span>•</span>
                                                                        <span className={`font-medium ${summary.ai_sentiment === 'Positive' ? 'text-green-400' :
                                                                            summary.ai_sentiment === 'Negative' ? 'text-red-400' :
                                                                                'text-gray-400'
                                                                            }`}>
                                                                            {summary.ai_sentiment}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="text-orange-400">Impact: {summary.market_impact_score}</span>
                                                                    </div>
                                                                    {summary.related_cryptos && summary.related_cryptos.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {summary.related_cryptos.slice(0, 3).map((crypto, cryptoIdx) => (
                                                                                <span key={cryptoIdx} className="px-1 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                                                                                    {crypto}
                                                                                </span>
                                                                            ))}
                                                                            {summary.related_cryptos.length > 3 && (
                                                                                <span className="text-xs text-gray-400">+{summary.related_cryptos.length - 3}</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        }
                                                        {filteredSummaries.filter(s => s.key_points?.includes(theme)).length > 5 && (
                                                            <div className="text-center text-gray-400 text-xs py-2">
                                                                และอีก {filteredSummaries.filter(s => s.key_points?.includes(theme)).length - 5} ข่าว...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Type News Modal */}
                        {showSummaryTypeModal && (
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-gray-900/95 border border-cyan-400/50 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-3 border-b border-gray-700">
                                        <div>
                                            <h3 className="gradient-text text-xl font-semibold flex items-center gap-3">
                                                <PieChart className="h-6 w-6" />
                                                ข่าวประเภท: {showSummaryTypeModal.replace(' Summarization', '')}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                กรองตาม: {selectedCrypto !== 'all' ? selectedCrypto : 'ทั้งหมด'}
                                                {selectedDate && ` | วันที่ ${selectedDate}`}
                                                {!selectedDate && timeFilter !== 'all' && ` | ${timeFilter === 'today' ? 'วันนี้' :
                                                        timeFilter === 'week' ? '7 วันที่แล้ว' :
                                                            timeFilter === 'month' ? '30 วันที่แล้ว' : timeFilter
                                                    }`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowSummaryTypeModal(null)}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                                        {loadingSummaryNews ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                                                <span className="ml-3 text-gray-300">กำลังโหลดข่าว...</span>
                                            </div>
                                        ) : summaryTypeNews.length > 0 ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-gray-300">พบข่าวทั้งหมด {summaryTypeNews.length} ข่าว</span>
                                                    <span className="text-sm text-gray-400">
                                                        กรองตาม: {selectedCrypto !== 'all' ? selectedCrypto : 'ทั้งหมด'}
                                                        {selectedDate && ` | ${selectedDate}`}
                                                        {!selectedDate && timeFilter !== 'all' && ` | ${timeFilter}`}
                                                    </span>
                                                </div>

                                                {summaryTypeNews.map((news, index) => (
                                                    <div key={news.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                                                                        #{index + 1}
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-1 rounded ${news.ai_sentiment === 'Positive' ? 'bg-green-500/20 text-green-300' :
                                                                            news.ai_sentiment === 'Negative' ? 'bg-red-500/20 text-red-300' :
                                                                                'bg-gray-500/20 text-gray-300'
                                                                        }`}>
                                                                        {news.ai_sentiment}
                                                                    </span>
                                                                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                                                                        Impact: {news.market_impact_score}
                                                                    </span>
                                                                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                                                        Trending: {news.trending_score}
                                                                    </span>
                                                                </div>

                                                                <h4 className="text-white font-semibold mb-3 text-lg leading-relaxed">
                                                                    {news.original_title}
                                                                </h4>

                                                                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                                                                    <h5 className="text-cyan-400 font-medium mb-2">สรุปโดย AI:</h5>
                                                                    <p className="text-gray-200 leading-relaxed">
                                                                        {news.ai_summary}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                                                    <span>📰 {news.original_source}</span>
                                                                    <span>📅 {new Date(news.created_at).toLocaleDateString('th-TH')}</span>
                                                                    <span>🧠 {news.summary_type.replace(' Summarization', '')}</span>
                                                                </div>

                                                                {news.related_cryptos && news.related_cryptos.length > 0 && (
                                                                    <div className="mb-4">
                                                                        <h6 className="text-sm font-medium text-gray-300 mb-2">เหรียญที่เกี่ยวข้อง:</h6>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {news.related_cryptos.map((crypto, cryptoIdx) => (
                                                                                <span key={cryptoIdx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                                                                    {crypto}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {news.key_points && news.key_points.length > 0 && (
                                                                    <div className="mb-4">
                                                                        <h6 className="text-sm font-medium text-gray-300 mb-2">จุดสำคัญ:</h6>
                                                                        <ul className="space-y-1">
                                                                            {news.key_points.map((point, pointIdx) => (
                                                                                <li key={pointIdx} className="flex items-start gap-2 text-sm text-gray-200">
                                                                                    <span className="text-cyan-400 text-xs mt-1">•</span>
                                                                                    <span>{point}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col gap-3">
                                                                {news.original_url && (
                                                                    <a
                                                                        href={news.original_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-300 transition-all text-sm font-medium flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        เปิดข่าวต้นฉบับ
                                                                    </a>
                                                                )}

                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedCrypto(news.related_cryptos?.[0] || 'all')
                                                                        setShowSummaryTypeModal(null)
                                                                    }}
                                                                    className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-300 transition-all text-sm font-medium"
                                                                    disabled={!news.related_cryptos?.[0]}
                                                                >
                                                                    กรองเหรียญนี้
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-400">
                                                <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                                <h4 className="text-lg font-semibold mb-2">ไม่พบข่าวในประเภทนี้</h4>
                                                <p className="text-sm">ลองเปลี่ยนการกรองหรือเลือกช่วงเวลาอื่น</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-gray-700 bg-gray-800/50">
                                        <div className="flex items-center justify-between p-1">
                                            <span className="text-sm text-gray-400">
                                                ประเภทการวิเคราะห์: {showSummaryTypeModal}
                                            </span>
                                            <button
                                                onClick={() => setShowSummaryTypeModal(null)}
                                                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
                                            >
                                                ปิด
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
