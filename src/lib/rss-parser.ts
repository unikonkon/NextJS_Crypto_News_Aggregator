import Parser from 'rss-parser'
import * as xml2js from 'xml2js'
import * as cheerio from 'cheerio'

interface RSSFeed {
  title?: string
  link?: string
  description?: string
  pubDate?: string
  content?: string
  contentSnippet?: string
  author?: string
  category?: string
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

// Function to extract crypto mentions from title
export const extractCryptoTags = (title: string): string[] => {
  const cryptoKeywords = [
    'BTC', 'Bitcoin', 'ETH', 'Ethereum', 'ADA', 'Cardano', 
    'SOL', 'Solana', 'DOGE', 'Dogecoin', 'XRP', 'Ripple',
    'DOT', 'Polkadot', 'MATIC', 'Polygon', 'AVAX', 'Avalanche',
    'LINK', 'Chainlink', 'UNI', 'Uniswap', 'LTC', 'Litecoin',
    'AI16Z', 'HYPE', 'MOVE', 'BIO', 'VINE', 'ONDO', 'XLM', 'Stellar',
    'AIXBT', 'PNUT', 'SUSHI', 'BAT', 'WIF', 'EIGEN', 'RENDER', 'MORPHO',
    'TRX', 'TRON', 'OP', 'Optimism', 'LDO', 'Lido', 'KSM', 'Kusama',
    'SUI', 'ARB', 'Arbitrum', 'NEAR', 'WLD', 'Worldcoin', 'PYTH', 'TON'
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
      else if (keyword === 'Stellar') tags.push('XLM')
      else if (keyword === 'TRON') tags.push('TRX')
      else if (keyword === 'Optimism') tags.push('OP')
      else if (keyword === 'Lido') tags.push('LDO')
      else if (keyword === 'Kusama') tags.push('KSM')
      else if (keyword === 'Arbitrum') tags.push('ARB')
      else if (keyword === 'Worldcoin') tags.push('WLD')
      else if (keyword.length <= 6) tags.push(keyword)
    }
  })
  
  return [...new Set(tags)].slice(0, 3) // Remove duplicates and limit to 3
}

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
      
      // First, get the raw XML
      const response = await fetch(source.url)
      const xmlData = await response.text()
      
      // Parse XML with xml2js to get content:encoded
      const parser = new xml2js.Parser()
      const xmlResult = await parser.parseStringPromise(xmlData)
      
      // Also use rss-parser for standard fields
      const feed = await this.parser.parseURL(source.url)
      
      return feed.items.map((item, index) => {
        let content = ''
        let author = ''
        let category = ''
        
        // Extract content:encoded from XML if available
        const xmlItem = xmlResult?.rss?.channel?.[0]?.item?.[index]
        
        if (xmlItem?.['content:encoded']) {
          // Extract HTML content and convert to text using cheerio
          const htmlContent = xmlItem['content:encoded'][0]
          const $ = cheerio.load(htmlContent)
          content = $.text().trim()
        } else {
          // Fallback to description if no content:encoded
          content = item.contentSnippet || item.description || ''
        }
        
        // Handle different source formats
        switch (source.name) {
          case 'CoinDesk':
            // CoinDesk: title, link, pubDate, guid, description, media:content
            break
            
          case 'Cointelegraph':
            // Cointelegraph: title, link, pubDate, guid, description
            break
            
          case 'CoinGape':
            // CoinGape: dc:creator, category, content:encoded
            if (xmlItem?.['dc:creator']) {
              author = xmlItem['dc:creator'][0]
            }
            if (xmlItem?.category) {
              category = Array.isArray(xmlItem.category) ? xmlItem.category.join(', ') : xmlItem.category
            }
            break
            
          case 'Bitcoin Magazine':
            // Bitcoin Magazine: author, category, content:encoded
            if (item.author) {
              author = item.author
            }
            if (xmlItem?.category) {
              category = Array.isArray(xmlItem.category) ? xmlItem.category.join(', ') : xmlItem.category
            }
            break
            
          case 'CryptoSlate':
            // CryptoSlate: dc:creator, category, content:encoded
            if (xmlItem?.['dc:creator']) {
              author = xmlItem['dc:creator'][0]
            }
            if (xmlItem?.category) {
              category = Array.isArray(xmlItem.category) ? xmlItem.category.join(', ') : xmlItem.category
            }
            break
        }
        
        return {
          title: item.title || '',
          link: item.link || '',
          description: item.contentSnippet || item.description || '',
          pubDate: item.pubDate || new Date().toISOString(),
          content: content,
          author: author,
          category: category
        }
      })
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