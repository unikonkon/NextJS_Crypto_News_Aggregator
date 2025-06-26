import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, ArrowUpDown } from 'lucide-react'

interface ArticleFiltersProps {
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

const sentimentOptions = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'Positive', label: 'บวก' },
  { value: 'Neutral', label: 'กลาง' },
  { value: 'Negative', label: 'ลบ' }
]

const sourceOptions = [
  { value: 'all', label: 'ทุกแหล่ง' },
  { value: 'CoinDesk', label: 'CoinDesk' },
  { value: 'Cointelegraph', label: 'Cointelegraph' },
  { value: 'CoinGape', label: 'CoinGape' },
  { value: 'Bitcoin Magazine', label: 'Bitcoin Magazine' },
  { value: 'CryptoSlate', label: 'CryptoSlate' }
]

const sortOptions = [
  { value: 'trending_score', label: 'คะแนนเทรนด์' },
  { value: 'published_at', label: 'วันที่เผยแพร่' },
  { value: 'created_at', label: 'วันที่เพิ่ม' }
]

export default function ArticleFilters({
  sentiment,
  source,
  sortBy,
  order,
  onSentimentChange,
  onSourceChange,
  onSortByChange,
  onOrderChange,
  onRefresh
}: ArticleFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-background border rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">ฟิลเตอร์:</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={sentiment} onValueChange={onSentimentChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            {sentimentOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={onSourceChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="แหล่งข่าว" />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="เรียงตาม" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
          className="min-w-fit"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          {order === 'asc' ? 'น้อย → มาก' : 'มาก → น้อย'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="min-w-fit"
        >
          รีเฟรช
        </Button>
      </div>
    </div>
  )
} 