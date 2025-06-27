import { Article } from '@/lib/supabase'
import { ExternalLink, Clock, User, Building2, Calendar, Tag } from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'

interface NewsCardProps {
  article: Article
}

export default function NewsCard({ article }: NewsCardProps) {
  const publishDate = article.pub_date || article.created_at

  return (
    <div className="glass-card neon-glow-hover rounded-xl p-5 h-full flex flex-col group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Building2 className="h-4 w-4 text-cyan-400" />
          <span className="neon-text text-xs font-medium">{article.source}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4 text-purple-400" />
          <span className="text-xs">{getRelativeTime(publishDate)}</span>
        </div>
      </div>

      {/* Category */}
      {article.category && (
        <div className="flex items-center gap-1 mb-3">
          <Tag className="h-3 w-3 text-blue-400" />
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30">
            {article.category}
          </span>
        </div>
      )}

      {/* Crypto Tags */}
      {article.name_category && (
        <div className="flex flex-wrap gap-1 mb-3">
          <span
            className="gradient-crypto px-2 py-1 text-xs font-bold rounded-md bg-gray-800/50 border border-orange-400/30"
          >
            {article.name_category}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-white text-lg font-semibold leading-tight mb-3 group-hover:text-cyan-300 transition-colors duration-300">
        {article.title}
      </h3>

      {/* Description */}
      {article.description && (
        <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {article.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        {/* Article Info */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(publishDate).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          {article.creator && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">{article.creator}</span>
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