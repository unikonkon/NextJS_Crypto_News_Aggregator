import Parser from 'rss-parser'

interface RSSFeed {
  title?: string
  link?: string
  description?: string
  pubDate?: string
  content?: string
  contentSnippet?: string
}

export interface NewsSource {
  name: string
  url: string
  enabled: boolean
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    enabled: true
  },
  {
    name: 'Cointelegraph',
    url: 'https://cointelegraph.com/rss',
    enabled: true
  },
  {
    name: 'CoinGape',
    url: 'https://coingape.com/feed/',
    enabled: true
  },
  {
    name: 'Bitcoin Magazine',
    url: 'https://bitcoinmagazine.com/.rss/full/',
    enabled: true
  },
  {
    name: 'CryptoSlate',
    url: 'https://cryptoslate.com/feed/',
    enabled: true
  }
]

export class NewsAggregator {
  private parser: Parser

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'content'],
          ['dc:creator', 'author']
        ]
      }
    })
  }

  async fetchFromSource(source: NewsSource): Promise<RSSFeed[]> {
    try {
      console.log(`Fetching from ${source.name}...`)
      const feed = await this.parser.parseURL(source.url)
      
      return feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        description: item.contentSnippet || item.description || '',
        pubDate: item.pubDate || new Date().toISOString(),
        content: item.content || item.contentSnippet || item.description || ''
      }))
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error)
      return []
    }
  }

  async fetchAllSources(): Promise<{ source: string; articles: RSSFeed[] }[]> {
    const enabledSources = NEWS_SOURCES.filter(source => source.enabled)
    
    const results = await Promise.allSettled(
      enabledSources.map(async (source) => ({
        source: source.name,
        articles: await this.fetchFromSource(source)
      }))
    )

    return results
      .filter((result): result is PromiseFulfilledResult<{ source: string; articles: RSSFeed[] }> => 
        result.status === 'fulfilled')
      .map(result => result.value)
  }

  // Clean and prepare content for analysis
  cleanContent(content: string): string {
    // Remove HTML tags
    const cleanText = content.replace(/<[^>]*>/g, ' ')
    // Remove extra whitespace
    const normalized = cleanText.replace(/\s+/g, ' ').trim()
    // Limit length for API efficiency
    return normalized.substring(0, 4000)
  }
}

export const newsAggregator = new NewsAggregator() 