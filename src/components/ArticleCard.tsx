import { Article } from '@/lib/supabase'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TrendingUp, Clock, User } from 'lucide-react'
import { getRelativeTime, getSentimentColor, getTrendingScoreColor } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{article.source}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{getRelativeTime(article.published_at)}</span>
          </div>
        </div>
        
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {article.summary}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {article.sentiment && (
            <Badge 
              variant="outline" 
              className={`${getSentimentColor(article.sentiment)} text-xs`}
            >
              {article.sentiment}
            </Badge>
          )}
          
          {article.trending_score !== null && (
            <Badge 
              variant="outline" 
              className={`${getTrendingScoreColor(article.trending_score)} text-xs`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {article.trending_score}/100
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          อ่านข่าวเต็ม
        </a>
      </CardFooter>
    </Card>
  )
} 