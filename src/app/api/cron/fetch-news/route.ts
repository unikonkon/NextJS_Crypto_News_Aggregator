import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { newsAggregator, NEWS_SOURCES, extractCryptoTags } from '@/lib/rss-parser'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role key
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
)

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

          // Clean content 
          const cleanContent = newsAggregator.cleanContent(
            article.content || article.description || ''
          )

          // Extract crypto tags from title
          const cryptoTags = extractCryptoTags(article.title)
          const nameCategory = cryptoTags.length > 0 ? cryptoTags.join(',') : null

          // Insert into database with crypto tags
          const { error } = await supabaseAdmin
            .from('articles')
            .insert({
              title: article.title,
              url: article.link,
              content: cleanContent,
              description: article.description || null,
              source: source.name,
              pub_date: article.pubDate ? new Date(article.pubDate).toISOString() : null,
              category: null, // Will be set by AI later if needed
              name_category: nameCategory, // เก็บชื่อเหรียญคริปโต
              creator: null // Can be extracted from RSS if available
            })

          if (error) {
            console.error('Error inserting article:', error)
          } else {
            sourceNew++
            console.log(`Article saved with crypto tags: ${nameCategory || 'none'}`)
          }

          sourceProcessed++

          // Add small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100))
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