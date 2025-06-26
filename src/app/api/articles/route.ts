import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const sentiment = searchParams.get('sentiment')
    const source = searchParams.get('source')
    const sortBy = searchParams.get('sortBy') || 'trending_score'
    const order = searchParams.get('order') || 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('articles')
      .select('*')

    // Add filters
    if (sentiment && sentiment !== 'all') {
      query = query.eq('sentiment', sentiment)
    }

    if (source && source !== 'all') {
      query = query.eq('source', source)
    }

    // Add sorting
    query = query.order(sortBy, { ascending: order === 'asc' })

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data: articles, error } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      articles: articles || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, url, content, source, published_at } = body

    if (!title || !url || !content || !source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('url', url)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Article already exists' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        url,
        content,
        source,
        published_at: published_at || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
    }

    return NextResponse.json({ article: data }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 