import { Article } from '@/lib/supabase'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Clock, User } from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'

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
            <span>{getRelativeTime(article.pub_date || article.created_at)}</span>
          </div>
        </div>
        
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {article.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {article.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {article.name_category && (
            <Badge 
              variant="outline" 
              className="text-xs"
            >
              {article.name_category}
            </Badge>
          )}
          
          {article.category && (
            <Badge 
              variant="outline" 
              className="text-xs"
            >
              {article.category}
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