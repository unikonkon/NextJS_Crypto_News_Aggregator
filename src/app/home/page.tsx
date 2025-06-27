'use client'

import { useState, useEffect, useCallback } from 'react'
import { Article } from '@/lib/supabase'
import NewsCard from '@/components/NewsCard'
import FeedList from '@/components/FeedList'
import NeonHeader from '@/components/NeonHeader'
import TypewriterLoader from '@/components/TypewriterLoader'
import CyberLoader from '@/components/CyberLoader'
import { Loader2, TrendingUp, Zap, BarChart3, Download, RefreshCw, Sparkles, Terminal, Wifi, Activity } from 'lucide-react'
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

interface FetchNewsResponse {
    success: boolean
    processed: number
    new: number
    results: Array<{
        source: string
        processed: number
        new: number
        error?: string
    }>
    timestamp: string
}

const NEWS_SOURCES = [
    { name: 'CoinDesk', color: 'neon-button', icon: '📰' },
    { name: 'Cointelegraph', color: 'bg-green-500/20 hover:bg-green-500/30 border-green-400', icon: '📈' },
    { name: 'CoinGape', color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-400', icon: '💼' },
    { name: 'Bitcoin Magazine', color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-400', icon: '₿' },
    { name: 'CryptoSlate', color: 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-400', icon: '🔷' }
]

export default function Home() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [articlesLoading, setArticlesLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fetchingNews, setFetchingNews] = useState<string | null>(null)
    const [fetchResults, setFetchResults] = useState<FetchNewsResponse | null>(null)
    const [user, setUser] = useState<AuthData | null>(null)
    const router = useRouter()

    // Filter states
    const [sentiment, setSentiment] = useState('all')
    const [source, setSource] = useState('all')
    const [sortBy, setSortBy] = useState('trending_score')
    const [order, setOrder] = useState('desc')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(100)

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

    const fetchArticles = useCallback(async () => {
        setArticlesLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sentiment: sentiment !== 'all' ? sentiment : '',
                source: source !== 'all' ? source : '',
                sortBy,
                order
            })

            const response = await fetch(`/api/articles?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch articles')
            }

            const data: ArticlesResponse = await response.json()
            console.log("articles data", data)
            setArticles(data.articles)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setArticlesLoading(false)
        }
    }, [page, sentiment, source, sortBy, order, limit])

    const fetchNewsFromSource = async (sourceName: string) => {
        setFetchingNews(sourceName)
        setFetchResults(null)
        setError(null)

        try {
            const response = await fetch(`/api/cron/fetch-news?source=${sourceName}`)

            if (!response.ok) {
                throw new Error('Failed to fetch news')
            }

            const data: FetchNewsResponse = await response.json()
            setFetchResults(data)

            // Refresh articles list after successful fetch
            if (data.success && data.new > 0) {
                await fetchArticles()
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching news')
        } finally {
            setFetchingNews(null)
        }
    }

    const fetchAllNews = async () => {
        setFetchingNews('all')
        setFetchResults(null)
        setError(null)

        try {
            const response = await fetch('/api/cron/fetch-news?source=all')

            if (!response.ok) {
                throw new Error('Failed to fetch news')
            }

            const data: FetchNewsResponse = await response.json()
            setFetchResults(data)

            // Refresh articles list after successful fetch
            if (data.success && data.new > 0) {
                await fetchArticles()
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching news')
        } finally {
            setFetchingNews(null)
        }
    }

    useEffect(() => {
        fetchArticles()
    }, [fetchArticles])

    const handleRefresh = () => {
        setPage(1)
        fetchArticles()
    }


    if (!user) {
        return null // ไม่ render อะไร รอ useEffect redirect
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
                    'เข้าสู่ระบบแดชบอร์ด...'
                ]}
            />
        )
    }

    return (
        <div className="min-h-screen">
            {/* Neon Header */}
            <NeonHeader />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* News Fetching Section */}
                <div className="glass-card neon-border rounded-xl mb-8 animate-glow p-2">
                    <h2 className="gradient-text text-xl font-semibold mb-6 flex items-center gap-3">
                        <Download className="h-6 w-6" />
                        ดึงข่าวสด Real-time
                    </h2>

                    {/* Terminal Loading Animation */}
                    {fetchingNews && (
                        <div className="terminal-loader mb-6">
                            {/* Terminal Header */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-400/20">
                                <Terminal className="h-4 w-4 text-neon-green" />
                                <span className="terminal-text text-sm font-semibold">Crypto News Terminal v2.0</span>
                                <div className="ml-auto flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                </div>
                            </div>

                            {/* Typewriter Text */}
                            <div className="typewriter mb-3">
                                กำลังดึงข่าวจากเครือข่าย{fetchingNews !== 'all' ? ` ${fetchingNews}` : ' ทุกแหล่ง'}...
                            </div>

                            {/* System Status */}
                            <div className="flex items-center gap-2 text-sm mb-3">
                                <span className="terminal-prompt flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    SYSTEM:
                                </span>
                                <span className="terminal-text glitch-loading">
                                    {fetchingNews === 'all' ? 'Processing all sources...' : `Connecting to ${fetchingNews}...`}
                                </span>
                            </div>

                            {/* Neon Loading Bar */}
                            <div className="neon-loading-bar"></div>

                            {/* Terminal Stats */}
                            <div className="mt-4 text-xs terminal-text opacity-70">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1">
                                        <Wifi className="h-3 w-3 text-green-400" />
                                        <span>Connection: Active</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Zap className="h-3 w-3 text-purple-400" />
                                        <span>Status: {fetchingNews === 'all' ? 'Multi-source' : 'Single-source'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BarChart3 className="h-3 w-3 text-cyan-400" />
                                        <span>Protocol: RSS/HTTP</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-orange-400" />
                                        <span>AI Analysis: Standby</span>
                                    </div>
                                </div>
                            </div>

                            {/* Live Feed Indicator */}
                            <div className="mt-3 pt-3 border-t border-cyan-400/20">
                                <div className="flex items-center justify-center gap-2 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                    <span className="terminal-text">LIVE FEED ACTIVE</span>
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                        {NEWS_SOURCES.map((newsSource) => (
                            <button
                                key={newsSource.name}
                                onClick={() => fetchNewsFromSource(newsSource.name)}
                                disabled={fetchingNews !== null}
                                className={`
                  ${newsSource.color} px-4 py-3 rounded-lg font-medium transition-all duration-300
                  border text-white hover:scale-105 hover:shadow-lg
                  ${fetchingNews === newsSource.name ? 'animate-pulse-neon' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                            >
                                {fetchingNews === newsSource.name ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-xs">กำลังดึง...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg">{newsSource.icon}</span>
                                        <span className="text-xs">{newsSource.name}</span>
                                    </div>
                                )}
                            </button>
                        ))}

                        <button
                            onClick={fetchAllNews}
                            disabled={fetchingNews !== null}
                            className={`
                col-span-2 md:col-span-1 neon-button px-4 py-3 rounded-lg font-medium
                ${fetchingNews === 'all' ? 'animate-pulse-neon' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            {fetchingNews === 'all' ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-xs">กำลังดึงทั้งหมด...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <RefreshCw className="h-5 w-5" />
                                    <span className="text-xs">ดึงทั้งหมด</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Fetch Results */}
                    {fetchResults && (
                        <div className="glass-card bg-green-500/10 border-green-400/30 rounded-lg p-4">
                            <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                ผลการดึงข่าว
                            </h3>
                            <p className="text-green-200 mb-3">
                                ✅ ดึงได้: <span className="font-bold">{fetchResults.processed}</span> ข่าว |
                                🆕 ข่าวใหม่: <span className="font-bold">{fetchResults.new}</span> ข่าว
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {fetchResults.results.map((result, index) => (
                                    <div key={index} className="bg-gray-800/50 rounded-lg p-2 text-sm">
                                        <div className="text-cyan-300 font-medium">{result.source}</div>
                                        <div className="text-gray-300">
                                            {result.new} ใหม่ / {result.processed} ทั้งหมด
                                        </div>
                                        {result.error && (
                                            <div className="text-red-400 text-xs">❌ {result.error}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Feed List (Filters) */}
                <FeedList
                    sentiment={sentiment}
                    source={source}
                    sortBy={sortBy}
                    order={order}
                    onSentimentChange={setSentiment}
                    onSourceChange={setSource}
                    onSortByChange={setSortBy}
                    onOrderChange={setOrder}
                    onRefresh={handleRefresh}
                />

                {/* Error State */}
                {error && (
                    <div className="glass-card bg-red-500/10 border-red-400/30 rounded-lg p-4 mb-8">
                        <p className="text-red-300 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>เกิดข้อผิดพลาด: {error}</span>
                        </p>
                    </div>
                )}

                {/* Neon Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1 mb-8">
                    <div className="glass-card bg-cyan-500/10 border-cyan-400/30 rounded-xl py-2 text-center neon-glow-hover group">
                        <div className="text-cyan-300 text-3xl font-bold mb-2">
                            {articles.length}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                            <div className="text-gray-400 text-sm flex items-center justify-center gap-1 mb-2">
                                <BarChart3 className="h-4 w-4" />
                                ข่าวทั้งหมด
                                <span>จำกัด: {limit}</span>
                                <button
                                    onClick={() => {
                                        const newLimit = prompt('กรุณาใส่จำนวนข่าวที่ต้องการ:', limit.toString())
                                        if (newLimit && !isNaN(Number(newLimit)) && Number(newLimit) > 0) {
                                            setLimit(Number(newLimit))
                                        }
                                    }}
                                    className="ml-1 px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-cyan-300 border border-cyan-400/30 transition-colors"
                                >
                                    แก้ไข
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="glass-card bg-green-500/10 border-green-400/30 rounded-xl py-2 text-center neon-glow-hover">
                        <div className="text-green-300 text-3xl font-bold mb-2">
                            {articles.filter(a => (a.trending_score || 0) >= 70).length}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            ข่าวเทรนด์
                        </div>
                    </div>

                    <div className="glass-card bg-purple-500/10 border-purple-400/30 rounded-xl py-2 text-center neon-glow-hover">
                        <div className="text-purple-300 text-3xl font-bold mb-2">
                            {articles.filter(a => a.sentiment === 'Positive').length}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            ข่าวบวก
                        </div>
                    </div>

                    <div className="glass-card bg-orange-500/10 border-orange-400/30 rounded-xl py-2 text-center neon-glow-hover">
                        <div className="text-orange-300 text-3xl font-bold mb-2">
                            {articles.filter(a => a.sentiment === 'Negative').length}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                            <Zap className="h-4 w-4" />
                            ข่าวลบ
                        </div>
                    </div>
                </div>

                        {/* News Grid */}
        {articlesLoading ? (
          <TypewriterLoader isLoading={articlesLoading} />
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="glass-card neon-border rounded-xl p-12 text-center">
            <div className="animate-pulse-neon mb-6">
              <TrendingUp className="h-16 w-16 text-cyan-400 mx-auto" />
            </div>
            <h3 className="gradient-text text-2xl font-bold mb-4">
              ไม่พบข่าว
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              ยังไม่มีข่าวในระบบ กรุณาดึงข่าวจากแหล่งข่าวด้านบน
              หรือปรับเปลี่ยนตัวกรองข่าว
            </p>
            <button
              onClick={handleRefresh}
              className="neon-button px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              ลองรีเฟรชอีกครั้ง
            </button>
          </div>
        )}

            </main>

        </div>
    )
}
