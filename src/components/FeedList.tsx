'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCw, Filter, TrendingUp } from 'lucide-react'

interface FeedListProps {
  sentiment: string
  source: string
  sortBy: string
  order: string
  onSentimentChange: (value: string) => void
  onSourceChange: (value: string) => void
  onSortByChange: (value: string) => void
  onOrderChange: (value: string) => void
  onRefresh: () => void
}

const categories = [
  { value: 'all', label: 'ทั้งหมด', color: 'text-cyan-400' },
  { value: 'Positive', label: 'ข่าวดี', color: 'text-green-400' },
  { value: 'Neutral', label: 'กลางๆ', color: 'text-yellow-400' },
  { value: 'Negative', label: 'ข่าวร้าย', color: 'text-red-400' }
]

const sourceOptions = [
  { value: 'all', label: 'ทุกแหล่ง', icon: '🌐' },
  { value: 'CoinDesk', label: 'CoinDesk', icon: '📰' },
  { value: 'Cointelegraph', label: 'Cointelegraph', icon: '📈' },
  { value: 'CoinGape', label: 'CoinGape', icon: '💼' },
  { value: 'Bitcoin Magazine', label: 'Bitcoin Magazine', icon: '₿' },
  { value: 'CryptoSlate', label: 'CryptoSlate', icon: '🔷' }
]

const sortOptions = [
  { value: 'trending_score', label: 'คะแนนเทรนด์', icon: '🔥' },
  { value: 'published_at', label: 'วันที่เผยแพร่', icon: '📅' },
  { value: 'created_at', label: 'วันที่เพิ่ม', icon: '✨' }
]

export default function FeedList({
  sentiment,
  source,
  sortBy,
  order,
  onSentimentChange,
  onSourceChange,
  onSortByChange,
  onOrderChange,
  onRefresh
}: FeedListProps) {
  return (
    <div className="glass-card neon-border rounded-xl mb-8 p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-cyan-400" />
          <h2 className="gradient-text text-lg font-semibold">ตัวกรองข่าว</h2>
        </div>
        <Button
          onClick={onRefresh}
          className="neon-button flex items-center gap-2"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs.Root 
        value={sentiment} 
        onValueChange={onSentimentChange}
        className="mb-6"
      >
        <Tabs.List className="flex gap-2 p-1 bg-gray-800/30 rounded-lg backdrop-blur-sm">
          {categories.map((category) => (
            <Tabs.Trigger
              key={category.value}
              value={category.value}
              className={`
                flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${sentiment === category.value 
                  ? 'bg-gray-700/50 border border-cyan-400/50 text-cyan-300 neon-glow' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }
              `}
            >
              <span className={category.color}>{category.label}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Source Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">แหล่งข่าว</label>
          <Select value={source} onValueChange={onSourceChange}>
            <SelectTrigger className="neon-border bg-gray-800/50 border-gray-600 text-white hover:border-cyan-400 focus:border-cyan-400">
              <SelectValue placeholder="เลือกแหล่งข่าว" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 text-white">
              {sourceOptions.map(option => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="hover:bg-gray-700 focus:bg-gray-700 text-white"
                >
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">เรียงตาม</label>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="neon-border bg-gray-800/50 border-gray-600 text-white hover:border-cyan-400 focus:border-cyan-400">
              <SelectValue placeholder="เรียงตาม" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 text-white">
              {sortOptions.map(option => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="hover:bg-gray-700 focus:bg-gray-700 text-white"
                >
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">ลำดับ</label>
          <Button
            onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
            className={`
              w-full neon-button flex items-center justify-center gap-2
              ${order === 'desc' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}
            `}
          >
            <TrendingUp className={`h-4 w-4 ${order === 'asc' ? 'rotate-180' : ''}`} />
            {order === 'asc' ? 'น้อย → มาก' : 'มาก → น้อย'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-400/30">
            <div className="text-cyan-300 text-lg font-bold">∞</div>
            <div className="text-gray-400 text-xs">ข่าวรวม</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-400/30">
            <div className="text-green-300 text-lg font-bold">📈</div>
            <div className="text-gray-400 text-xs">เทรนด์</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-400/30">
            <div className="text-purple-300 text-lg font-bold">⚡</div>
            <div className="text-gray-400 text-xs">อัปเดต</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-400/30">
            <div className="text-orange-300 text-lg font-bold">🔥</div>
            <div className="text-gray-400 text-xs">ฮอต</div>
          </div>
        </div>
      </div> */}
    </div>
  )
} 