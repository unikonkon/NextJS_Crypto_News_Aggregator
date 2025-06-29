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

// Template prompts สำหรับการสรุป 5 ประเภท
const SUMMARY_TEMPLATES = {
  'Extractive Summarization': `You are an expert news analyst. Perform EXTRACTIVE summarization by selecting and combining the most important sentences directly from the article without modification.

Instructions:
1. Extract 3-5 key sentences directly from the original text
2. Maintain original wording and structure  
3. Focus on facts, figures, and concrete information
4. Present in logical order
5. Respond in Thai language

Article to analyze:
{content}

Also provide:
- Sentiment: Positive, Neutral, or Negative
- Trending Score: 0-100 based on market impact
- Key Points: 3-5 important facts
- Related Cryptos: mentioned cryptocurrencies
- Market Impact Score: 0-100

JSON format:
{
  "summary": "extractive summary in Thai",
  "sentiment": "sentiment",
  "trending_score": number,
  "key_points": ["point1", "point2", "point3"],
  "related_cryptos": ["crypto1", "crypto2"],
  "market_impact_score": number
}`,

  'Abstractive Summarization': `You are an expert financial news writer. Create ABSTRACTIVE summarization by rewriting and restructuring information in your own words while preserving meaning.

Instructions:
1. Rewrite content using new sentence structures
2. Synthesize and interpret information
3. Create coherent narrative flow
4. Add context and implications
5. Respond in Thai language

Article to analyze:
{content}

Also provide:
- Sentiment: Positive, Neutral, or Negative
- Trending Score: 0-100 based on market impact
- Key Points: 3-5 important interpretations
- Related Cryptos: mentioned cryptocurrencies
- Market Impact Score: 0-100

JSON format:
{
  "summary": "abstractive summary in Thai",
  "sentiment": "sentiment", 
  "trending_score": number,
  "key_points": ["interpretation1", "interpretation2", "interpretation3"],
  "related_cryptos": ["crypto1", "crypto2"],
  "market_impact_score": number
}`,

  'Sentiment-Based Summarization': `You are a market sentiment analyst. Focus on SENTIMENT ANALYSIS and emotional indicators in the news.

Instructions:
1. Analyze emotional tone and market sentiment
2. Identify positive/negative indicators
3. Assess market psychology impact
4. Highlight sentiment-driving factors
5. Respond in Thai language

Article to analyze:
{content}

Also provide:
- Sentiment: Positive, Neutral, or Negative (primary focus)
- Trending Score: 0-100 based on sentiment strength
- Key Points: 3-5 sentiment indicators
- Related Cryptos: mentioned cryptocurrencies
- Market Impact Score: 0-100 based on sentiment impact

JSON format:
{
  "summary": "sentiment-focused summary in Thai",
  "sentiment": "sentiment",
  "trending_score": number,
  "key_points": ["sentiment1", "sentiment2", "sentiment3"],
  "related_cryptos": ["crypto1", "crypto2"],
  "market_impact_score": number
}`,

  'Impact-Oriented Summarization': `You are a market impact specialist. Focus on MARKET IMPACT and potential consequences of the news.

Instructions:
1. Analyze potential market effects
2. Assess short and long-term implications
3. Identify affected sectors/projects
4. Evaluate regulatory/adoption impact
5. Respond in Thai language

Article to analyze:
{content}

Also provide:
- Sentiment: Positive, Neutral, or Negative
- Trending Score: 0-100 based on potential impact
- Key Points: 3-5 impact factors
- Related Cryptos: affected cryptocurrencies
- Market Impact Score: 0-100 (primary focus)

JSON format:
{
  "summary": "impact-focused summary in Thai",
  "sentiment": "sentiment",
  "trending_score": number,
  "key_points": ["impact1", "impact2", "impact3"],
  "related_cryptos": ["crypto1", "crypto2"],
  "market_impact_score": number
}`,

  'Actionable Insights Summarization': `You are an investment advisor. Provide ACTIONABLE INSIGHTS and recommendations based on the news.

Instructions:
1. Extract actionable investment insights
2. Provide strategic recommendations
3. Identify opportunities and risks
4. Suggest next steps for investors
5. Respond in Thai language

Article to analyze:
{content}

Also provide:
- Sentiment: Positive, Neutral, or Negative
- Trending Score: 0-100 based on actionability
- Key Points: 3-5 actionable insights
- Related Cryptos: relevant for action
- Market Impact Score: 0-100

JSON format:
{
  "summary": "actionable insights summary in Thai",
  "sentiment": "sentiment",
  "trending_score": number,
  "key_points": ["insight1", "insight2", "insight3"],
  "related_cryptos": ["crypto1", "crypto2"],
  "market_impact_score": number
}`
}

export async function GET() {
  try {
    const { data: summaries, error } = await supabaseAdmin
      .from('ainewsall')
      .select(`
        *,
        articles!inner(
          title,
          source,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching AI news summaries:', error)
      return NextResponse.json({ error: 'Failed to fetch AI news summaries' }, { status: 500 })
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
    const { 
      articles, 
      summaryType 
    }: { 
      articles: Article[], 
      summaryType: keyof typeof SUMMARY_TEMPLATES 
    } = body

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'No articles provided' }, { status: 400 })
    }

    if (!summaryType || !SUMMARY_TEMPLATES[summaryType]) {
      return NextResponse.json({ error: 'Invalid summary type' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const results = []
    const startTime = Date.now()

    // Process each article separately
    for (const article of articles) {
      const articleStartTime = Date.now()
      
      try {
        console.log(`Processing article ${article.id} with ${summaryType}...`)

        // Prepare prompt with article content
        const prompt = SUMMARY_TEMPLATES[summaryType].replace('{content}', 
          `Title: ${article.title}\nSource: ${article.source}\nContent: ${article.content}`
        )

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
                    text: prompt
                  }
                ]
              }
            ]
          })
        })

        let aiAnalysis = {
          summary: 'Unable to analyze content at this time.',
          sentiment: 'Neutral' as const,
          trending_score: 50,
          key_points: ['Analysis unavailable'],
          related_cryptos: [],
          market_impact_score: 50
        }

        if (response.ok) {
          const data = await response.json()
          const text = data.candidates[0]?.content?.parts[0]?.text

          if (text) {
            // Extract JSON from response - try multiple patterns
            let jsonMatch = text.match(/\{[\s\S]*\}/)
            
            // If no match found, try to find JSON after any markdown code blocks
            if (!jsonMatch) {
              jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/)
              if (jsonMatch) {
                jsonMatch = [jsonMatch[1]] // Use the captured group
              }
            }
            
            // If still no match, try to find JSON without markdown
            if (!jsonMatch) {
              jsonMatch = text.match(/\{[\s\S]*?\}/)
            }

            if (jsonMatch) {
              try {
                // Clean the JSON string before parsing
                const jsonString = jsonMatch[0]
                  .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
                  .replace(/\n/g, ' ') // Replace newlines with spaces
                  .replace(/\r/g, '') // Remove carriage returns
                  .replace(/\t/g, ' ') // Replace tabs with spaces
                  .replace(/\s+/g, ' ') // Normalize whitespace
                  .trim()

                const analysis = JSON.parse(jsonString)
                aiAnalysis = {
                  summary: analysis.summary || aiAnalysis.summary,
                  sentiment: analysis.sentiment || aiAnalysis.sentiment,
                  trending_score: Math.min(100, Math.max(0, parseInt(analysis.trending_score) || aiAnalysis.trending_score)),
                  key_points: Array.isArray(analysis.key_points) ? analysis.key_points : aiAnalysis.key_points,
                  related_cryptos: Array.isArray(analysis.related_cryptos) ? analysis.related_cryptos : aiAnalysis.related_cryptos,
                  market_impact_score: Math.min(100, Math.max(0, parseInt(analysis.market_impact_score) || aiAnalysis.market_impact_score))
                }
              } catch (parseError) {
                console.error('Error parsing AI response:', parseError)
                console.error('Raw text:', text)
                console.error('JSON match:', jsonMatch?.[0])
              }
            } else {
              console.error('No JSON found in AI response:', text)
            }
          }
        }

        const processingTime = Math.round((Date.now() - articleStartTime) / 1000)

        // Insert into ainewsall table
        const { data: summary, error } = await supabaseAdmin
          .from('ainewsall')
          .insert({
            article_id: article.id,
            original_title: article.title,
            original_content: article.content,
            original_source: article.source,
            original_url: article.url,
            original_category: article.category,
            original_name_category: article.name_category,
            original_pub_date: article.pub_date,
            summary_type: summaryType,
            ai_summary: aiAnalysis.summary,
            ai_sentiment: aiAnalysis.sentiment,
            trending_score: aiAnalysis.trending_score,
            key_points: aiAnalysis.key_points,
            related_cryptos: aiAnalysis.related_cryptos,
            market_impact_score: aiAnalysis.market_impact_score,
            processing_time: processingTime
          })
          .select()
          .single()

        if (error) {
          console.error('Error saving summary:', error)
          results.push({
            article_id: article.id,
            success: false,
            error: 'Failed to save summary'
          })
        } else {
          results.push({
            article_id: article.id,
            success: true,
            summary
          })
        }

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error)
        results.push({
          article_id: article.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000)
    const successCount = results.filter(r => r.success).length

    return NextResponse.json({ 
      success: true,
      processed: articles.length,
      successful: successCount,
      failed: articles.length - successCount,
      total_time: totalTime,
      summary_type: summaryType,
      results,
      message: `Processed ${successCount}/${articles.length} articles successfully`
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
