import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { newsAggregator, NEWS_SOURCES } from '@/lib/rss-parser'
import { geminiAnalyzer } from '@/lib/gemini'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceName = searchParams.get('source')
    
    console.log('Starting news fetch job...', sourceName ? `for ${sourceName}` : 'for all sources')
    
    let sourcesToFetch = NEWS_SOURCES.filter(s => s.enabled)
    
    // If specific source is requested, filter to that source only
    if (sourceName && sourceName !== 'all') {
      sourcesToFetch = NEWS_SOURCES.filter(s => s.name === sourceName && s.enabled)
      if (sourcesToFetch.length === 0) {
        return NextResponse.json({ error: 'Source not found or disabled' }, { status: 404 })
      }
    }
    
    let totalProcessed = 0
    let totalNew = 0
    const results = []

    for (const source of sourcesToFetch) {
      console.log(`Fetching from ${source.name}...`)
      
      try {
        const articles = await newsAggregator.fetchFromSource(source)
        console.log(`Processing ${articles.length} articles from ${source.name}`)
        
        let sourceProcessed = 0
        let sourceNew = 0
        
        for (const article of articles) {
          if (!article.title || !article.link) continue

          // Check if article already exists
          const { data: existing } = await supabaseAdmin
            .from('articles')
            .select('id')
            .eq('url', article.link)
            .single()

          if (existing) {
            console.log(`Article already exists: ${article.title?.substring(0, 50)}...`)
            continue
          }

          // Clean content for analysis
          const cleanContent = newsAggregator.cleanContent(
            article.content || article.description || ''
          )

          // Analyze with Gemini (only if API key is available)
          let analysis: {
            summary: string;
            sentiment: 'Positive' | 'Neutral' | 'Negative';
            trending_score: number;
          } = {
            summary: article.description?.substring(0, 200) + '...' || 'No summary available',
            sentiment: 'Neutral',
            trending_score: 50
          }

          if (process.env.GEMINI_API_KEY) {
            try {
              console.log(`Analyzing: ${article.title?.substring(0, 50)}...`)
              analysis = await geminiAnalyzer.analyzeArticle(cleanContent)
            } catch (error) {
              console.error('Gemini analysis failed, using defaults:', error)
            }
          }

          // Insert into database
          const { error } = await supabaseAdmin
            .from('articles')
            .insert({
              title: article.title,
              url: article.link,
              content: cleanContent,
              summary: analysis.summary,
              sentiment: analysis.sentiment,
              trending_score: analysis.trending_score,
              source: source.name,
              published_at: new Date(article.pubDate || Date.now()).toISOString()
            })

          if (error) {
            console.error('Error inserting article:', error)
          } else {
            sourceNew++
          }

          sourceProcessed++
          
          // Add small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        totalProcessed += sourceProcessed
        totalNew += sourceNew
        
        results.push({
          source: source.name,
          processed: sourceProcessed,
          new: sourceNew
        })
        
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error)
        results.push({
          source: source.name,
          processed: 0,
          new: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`Job completed. Total processed: ${totalProcessed}, Total new: ${totalNew}`)

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      new: totalNew,
      results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Same logic as GET but for POST requests
  return GET(request)
} 