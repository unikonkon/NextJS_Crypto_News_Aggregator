'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCw, Filter, TrendingUp, Eye } from 'lucide-react'

interface FeedListProps {
  // Active states (ที่ใช้งานจริง)
  source: string
  nameCategory: string
  sortBy: string
  order: string
  
  // Pending states (สำหรับ filters ที่รอกดปุ่มแสดงผล)
  pendingSource: string
  pendingSortBy: string
  pendingOrder: string
  
  // Callbacks
  onNameCategoryChange: (value: string) => void // สำหรับ tabs - แสดงผลทันที
  onPendingSourceChange: (value: string) => void // สำหรับ filters - รอกดปุ่ม
  onPendingSortByChange: (value: string) => void
  onPendingOrderChange: (value: string) => void
  onRefresh: () => void
  onShowResults: () => void // กดปุ่มแสดงผล
}

const cryptoCategories = [
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
  { value: 'created_at', label: 'วันที่เพิ่ม', icon: '✨' },
  { value: 'pub_date', label: 'วันที่เผยแพร่', icon: '📅' },
  { value: 'title', label: 'ชื่อข่าว', icon: '📝' },
  { value: 'source', label: 'แหล่งข่าว', icon: '🏢' }
]

export default function FeedList({
  source,
  nameCategory,
  sortBy,
  order,
  pendingSource,
  pendingSortBy,
  pendingOrder,
  onNameCategoryChange,
  onPendingSourceChange,
  onPendingSortByChange,
  onPendingOrderChange,
  onRefresh,
  onShowResults
}: FeedListProps) {
  
  // เช็คว่า filters มีการเปลี่ยนแปลงหรือไม่
  const hasFilterChanges = source !== pendingSource || 
                          sortBy !== pendingSortBy || 
                          order !== pendingOrder

  return (
    <div className="glass-card neon-border rounded-xl mb-8 p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-cyan-400" />
          <h2 className="gradient-text text-lg font-semibold">ตัวกรองข่าวคริปโต</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onShowResults}
            className={`
              neon-button flex items-center gap-2 transition-all duration-300
              ${hasFilterChanges 
                ? 'bg-purple-500/30 hover:bg-purple-500/40 border-purple-400 animate-pulse' 
                : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-400/50'
              }
            `}
            size="sm"
          >
            <Eye className="h-4 w-4" />
            {hasFilterChanges ? 'แสดงผล (มีการเปลี่ยนแปลง)' : 'แสดงผล'}
          </Button>
        <Button
          onClick={onRefresh}
          className="neon-button flex items-center gap-2"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>
        </div>
      </div>

      {/* Crypto Category Tabs - แสดงผลทันที */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-300">🚀 เลือกเหรียญ (แสดงผลทันที)</span>
        </div>
      <Tabs.Root 
          value={nameCategory} 
          onValueChange={onNameCategoryChange}
      >
          <Tabs.List className="flex gap-2 p-1 bg-gray-800/30 rounded-lg backdrop-blur-sm overflow-x-auto">
            {cryptoCategories.slice(0, 6).map((cat) => (
            <Tabs.Trigger
              key={cat.value}
              value={cat.value}
              className={`
                  flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${nameCategory === cat.value 
                  ? 'bg-gray-700/50 border border-cyan-400/50 text-cyan-300 neon-glow' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }
              `}
            >
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
              <span className={cat.color}>{cat.label}</span>
                </div>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
      </div>

      {/* Filters Row - ต้องกดปุ่มแสดงผล */}
      <div className="border-t border-gray-700/50 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-300">⚙️ ตัวกรองเพิ่มเติม (กดปุ่มแสดงผลเพื่อนำไปใช้)</span>
          {hasFilterChanges && (
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30 animate-pulse">
              มีการเปลี่ยนแปลง
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Source Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">แหล่งข่าว</label>
            <Select value={pendingSource} onValueChange={onPendingSourceChange}>
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

          {/* Crypto Category Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">เหรียญคริปโต (เพิ่มเติม)</label>
            <Select value={nameCategory} onValueChange={onNameCategoryChange}>
              <SelectTrigger className="neon-border bg-gray-800/50 border-gray-600 text-white hover:border-cyan-400 focus:border-cyan-400">
                <SelectValue placeholder="เลือกเหรียญคริปโต" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white max-h-64 overflow-y-auto">
                {cryptoCategories.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="hover:bg-gray-700 focus:bg-gray-700 text-white"
                  >
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span className={option.color}>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        {/* Sort By Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">เรียงตาม</label>
            <Select value={pendingSortBy} onValueChange={onPendingSortByChange}>
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
              onClick={() => onPendingOrderChange(pendingOrder === 'asc' ? 'desc' : 'asc')}
            className={`
              w-full neon-button flex items-center justify-center gap-2
                ${pendingOrder === 'desc' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}
            `}
          >
              <TrendingUp className={`h-4 w-4 ${pendingOrder === 'asc' ? 'rotate-180' : ''}`} />
              {pendingOrder === 'asc' ? 'น้อย → มาก' : 'มาก → น้อย'}
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 