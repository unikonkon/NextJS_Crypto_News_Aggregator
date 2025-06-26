'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import ArticleFilters from '@/components/ArticleFilters'
import { Loader2, TrendingUp, Zap, BarChart3, Download, RefreshCw } from 'lucide-react'

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
  { name: 'CoinDesk', color: 'bg-blue-500 hover:bg-blue-600' },
  { name: 'Cointelegraph', color: 'bg-green-500 hover:bg-green-600' },
  { name: 'CoinGape', color: 'bg-purple-500 hover:bg-purple-600' },
  { name: 'Bitcoin Magazine', color: 'bg-orange-500 hover:bg-orange-600' },
  { name: 'CryptoSlate', color: 'bg-indigo-500 hover:bg-indigo-600' }
]

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchingNews, setFetchingNews] = useState<string | null>(null)
  const [fetchResults, setFetchResults] = useState<FetchNewsResponse | null>(null)
  
  // Filter states
  const [sentiment, setSentiment] = useState('all')
  const [source, setSource] = useState('all')
  const [sortBy, setSortBy] = useState('trending_score')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
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
      setLoading(false)
    }
  }

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
  }, [sentiment, source, sortBy, order, page])

  const handleRefresh = () => {
    setPage(1)
    fetchArticles()
  }

  if (loading && !fetchingNews) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg">กำลังโหลดข่าว...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Crypto News Aggregator
                </h1>
                <p className="text-sm text-gray-600">
                  ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>ดึงข่าวแบบ Real-time</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span>วิเคราะห์ด้วย AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* News Fetching Section */}
        <div className="mb-8 bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            ดึงข่าวจากแหล่งต่างๆ
          </h2>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {NEWS_SOURCES.map((newsSource) => (
              <button
                key={newsSource.name}
                onClick={() => fetchNewsFromSource(newsSource.name)}
                disabled={fetchingNews !== null}
                className={`
                  px-4 py-2 rounded-lg text-white font-medium transition-colors
                  ${newsSource.color}
                  ${fetchingNews === newsSource.name ? 'opacity-50 cursor-not-allowed' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {fetchingNews === newsSource.name ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังดึง...
                  </div>
                ) : (
                  newsSource.name
                )}
              </button>
            ))}
            
            <button
              onClick={fetchAllNews}
              disabled={fetchingNews !== null}
              className={`
                px-6 py-2 rounded-lg text-white font-medium transition-colors
                bg-gray-700 hover:bg-gray-800
                ${fetchingNews === 'all' ? 'opacity-50 cursor-not-allowed' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {fetchingNews === 'all' ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังดึงทั้งหมด...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  ดึงทั้งหมด
                </div>
              )}
            </button>
          </div>

          {/* Fetch Results */}
          {fetchResults && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">ผลการดึงข่าว</h3>
              <p className="text-green-700 mb-2">
                ดึงได้ทั้งหมด: {fetchResults.processed} ข่าว | ข่าวใหม่: {fetchResults.new} ข่าว
              </p>
              <div className="space-y-1">
                {fetchResults.results.map((result, index) => (
                  <div key={index} className="text-sm text-green-600">
                    {result.source}: {result.new} ข่าวใหม่ จากทั้งหมด {result.processed} ข่าว
                    {result.error && <span className="text-red-600"> (ข้อผิดพลาด: {result.error})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ArticleFilters
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
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">เกิดข้อผิดพลาด: {error}</p>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ไม่พบข่าว
            </h3>
            <p className="text-gray-600 mb-4">
              ยังไม่มีข่าวในระบบ กรุณาดึงข่าวจากแหล่งข่าวด้านบน
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ลองรีเฟรชอีกครั้ง
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ข่าวทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ข่าวเทรนด์</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => (a.trending_score || 0) >= 70).length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ข่าวบวก</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.sentiment === 'Positive').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
