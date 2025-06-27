import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Article } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role key
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
)

export async function GET() {
  try {
    const { data: summaries, error } = await supabaseAdmin
      .from('summarynew')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching summaries:', error)
      return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 })
    }

    return NextResponse.json({ summaries: summaries || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articles }: { articles: Article[] } = body

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'No articles provided' }, { status: 400 })
    }

    // Prepare combined content for AI analysis
    const allContent = articles.map(article => {
      return `Title: ${article.title}\nSource: ${article.source}\nContent: ${article.content}`
    }).join('\n\n---\n\n')

    const allSources = [...new Set(articles.map(a => a.source))].join(', ')
    const allCategories = [...new Set(articles.map(a => a.category).filter(Boolean))].join(', ')

    // Extract crypto names and topics
    const cryptoNames = extractCryptoNames(allContent)
    const mainCrypto = cryptoNames.length > 0 ? cryptoNames[0] : null

    let aiAnalysis = {
      summary: 'Unable to analyze content at this time.',
      sentiment: 'Neutral' as const,
      trending_score: 50
    }

    // Only perform AI analysis if API key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('Analyzing combined content with AI...')
        
        // Create a more detailed prompt for multiple articles
        const detailedPrompt = `You are analyzing ${articles.length} crypto news articles. 

Please provide:
1. A comprehensive summary combining all articles (in Thai language)
2. Overall sentiment: Positive, Neutral, or Negative
3. Trending score (0-100) based on market impact and relevance

Articles to analyze:
${allContent}

Focus on:
- Market trends and price movements
- Regulatory developments
- Technology updates
- Major partnerships or adoptions
- Risk factors

Output JSON format:
{
  "summary": "...",
  "sentiment": "Positive | Neutral | Negative", 
  "trending_score": 0-100
}`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: detailedPrompt
                  }
                ]
              }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.candidates[0]?.content?.parts[0]?.text

          if (text) {
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0])
              aiAnalysis = {
                summary: analysis.summary || aiAnalysis.summary,
                sentiment: analysis.sentiment || aiAnalysis.sentiment,
                trending_score: Math.min(100, Math.max(0, parseInt(analysis.trending_score) || aiAnalysis.trending_score))
              }
            }
          }
        }
      } catch (error) {
        console.error('AI analysis failed:', error)
        // Use fallback analysis
      }
    }

    // Insert into summarynew table
    const { data: summary, error } = await supabaseAdmin
      .from('summarynew')
      .insert({
        all_select: articles.length,
        all_content: allContent.substring(0, 10000), // Limit content length
        all_source: allSources,
        all_category: allCategories || null,
        name_crypto: mainCrypto,
        summary: aiAnalysis.summary,
        source: allSources.split(', ')[0], // Primary source
        sentiment: aiAnalysis.sentiment,
        trending_score: aiAnalysis.trending_score
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating summary:', error)
      return NextResponse.json({ error: 'Failed to create summary' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      summary,
      message: 'AI analysis completed successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function extractCryptoNames(content: string): string[] {
  const cryptoPatterns = [
    'Bitcoin', 'BTC',
    'Ethereum', 'ETH', 
    'Solana', 'SOL',
    'Cardano', 'ADA',
    'Binance', 'BNB',
    'XRP', 'Ripple',
    'Dogecoin', 'DOGE',
    'Avalanche', 'AVAX',
    'Polygon', 'MATIC',
    'Chainlink', 'LINK',
    'Litecoin', 'LTC',
    'Polkadot', 'DOT',
    'Tron', 'TRX',
    'Shiba', 'SHIB'
  ]

  const found = new Set<string>()
  const upperContent = content.toUpperCase()

  cryptoPatterns.forEach(pattern => {
    if (upperContent.includes(pattern.toUpperCase())) {
      found.add(pattern)
    }
  })

  return Array.from(found)
} 