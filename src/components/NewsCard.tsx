import { Article } from '@/lib/supabase'
import { ExternalLink, Clock, User, Building2, Calendar, Tag, X, Eye } from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'

interface NewsCardProps {
  article: Article
}

export default function NewsCard({ article }: NewsCardProps) {
  const publishDate = article.pub_date || article.created_at
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <div className="flex flex-col items-center justify-between pt-3 border-t border-gray-700/50">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {/* View Content Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="neon-button-secondary px-8 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 hover:scale-105 transition-transform duration-200"
          >
            <Eye className="h-3 w-3" />
            ดูเนื้อหา
          </button>

          {/* Read More Link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="neon-button px-8 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 hover:scale-105 transition-transform duration-200"
          >
            <ExternalLink className="h-3 w-3" />
            อ่านต่อ
          </a>
        </div>
      </div>

      {/* Modal for Full Content */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden z-50">
            <div className=" rounded-xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-700/50">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Building2 className="h-4 w-4 text-cyan-400" />
                      <span className="neon-text text-sm font-medium">{article.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">{getRelativeTime(publishDate)}</span>
                    </div>
                  </div>

                  {/* Category */}
                  {article.category && (
                    <div className="flex items-center gap-1 mb-3">
                      <Tag className="h-4 w-4 text-blue-400" />
                      <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
                        {article.category}
                      </span>
                    </div>
                  )}

                  {/* Crypto Tags */}
                  {article.name_category && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="gradient-crypto px-3 py-1 text-sm font-bold rounded-md bg-gray-800/50 border border-orange-400/30">
                        {article.name_category}
                      </span>
                    </div>
                  )}

                  <Dialog.Title className="text-white text-xl font-bold leading-tight">
                    {article.title}
                  </Dialog.Title>
                </div>

                <Dialog.Close className="ml-4 p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {article.content || article.description || 'ไม่มีเนื้อหาเพิ่มเติม'}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(publishDate).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {article.creator && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{article.creator}</span>
                    </div>
                  )}
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  อ่านบทความต้นฉบับ
                </a>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
} 