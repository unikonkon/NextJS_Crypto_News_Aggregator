import { Article } from '@/lib/supabase'
import { ExternalLink, TrendingUp, Clock, User, Zap } from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'

interface NewsCardProps {
  article: Article
}

// Function to extract crypto mentions from title
const extractCryptoTags = (title: string): string[] => {
  const cryptoKeywords = [
    'BTC', 'Bitcoin', 'ETH', 'Ethereum', 'ADA', 'Cardano', 
    'SOL', 'Solana', 'DOGE', 'Dogecoin', 'XRP', 'Ripple',
    'DOT', 'Polkadot', 'MATIC', 'Polygon', 'AVAX', 'Avalanche',
    'LINK', 'Chainlink', 'UNI', 'Uniswap', 'LTC', 'Litecoin'
  ]
  
  const tags: string[] = []
  const upperTitle = title.toUpperCase()
  
  cryptoKeywords.forEach(keyword => {
    if (upperTitle.includes(keyword.toUpperCase())) {
      // Add short version for common coins
      if (keyword === 'Bitcoin') tags.push('BTC')
      else if (keyword === 'Ethereum') tags.push('ETH')
      else if (keyword === 'Cardano') tags.push('ADA')
      else if (keyword === 'Solana') tags.push('SOL')
      else if (keyword === 'Dogecoin') tags.push('DOGE')
      else if (keyword === 'Ripple') tags.push('XRP')
      else if (keyword === 'Polkadot') tags.push('DOT')
      else if (keyword === 'Polygon') tags.push('MATIC')
      else if (keyword === 'Avalanche') tags.push('AVAX')
      else if (keyword === 'Chainlink') tags.push('LINK')
      else if (keyword === 'Uniswap') tags.push('UNI')
      else if (keyword === 'Litecoin') tags.push('LTC')
      else if (keyword.length <= 4) tags.push(keyword)
    }
  })
  
  return [...new Set(tags)].slice(0, 3) // Remove duplicates and limit to 3
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'Positive':
      return <TrendingUp className="h-3 w-3 text-green-400" />
    case 'Negative':
      return <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />
    default:
      return <Zap className="h-3 w-3 text-yellow-400" />
  }
}

const getSentimentBg = (sentiment: string) => {
  switch (sentiment) {
    case 'Positive':
      return 'bg-green-500/10 border-green-400/30 text-green-300'
    case 'Negative':
      return 'bg-red-500/10 border-red-400/30 text-red-300'
    default:
      return 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300'
  }
}

export default function NewsCard({ article }: NewsCardProps) {
  const cryptoTags = extractCryptoTags(article.title)
  
  return (
    <div className="glass-card neon-glow-hover rounded-xl p-5 h-full flex flex-col group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User className="h-4 w-4 text-cyan-400" />
          <span className="neon-text text-xs font-medium">{article.source}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4 text-purple-400" />
          <span className="text-xs">{getRelativeTime(article.published_at)}</span>
        </div>
      </div>

      {/* Crypto Tags */}
      {cryptoTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {cryptoTags.map((tag, index) => (
            <span
              key={index}
              className="gradient-crypto px-2 py-1 text-xs font-bold rounded-md bg-gray-800/50 border border-orange-400/30"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-white text-lg font-semibold leading-tight mb-3 group-hover:text-cyan-300 transition-colors duration-300">
        {article.title}
      </h3>

      {/* Summary */}
      {article.summary && (
        <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {article.summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        {/* Sentiment & Trending Score */}
        <div className="flex items-center gap-3">
          {article.sentiment && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getSentimentBg(article.sentiment)}`}>
              {getSentimentIcon(article.sentiment)}
              <span className="font-medium">{article.sentiment}</span>
            </div>
          )}
          
          {article.trending_score !== null && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/10 border border-purple-400/30 text-purple-300">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">{article.trending_score}</span>
            </div>
          )}
        </div>

        {/* Read More Link */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="neon-button px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 hover:scale-105 transition-transform duration-200"
        >
          <ExternalLink className="h-3 w-3" />
          อ่านต่อ
        </a>
      </div>
    </div>
  )
} 