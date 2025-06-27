import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // Handle get categories action
    if (action === 'categories') {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('name_category')
        .not('name_category', 'is', null)
      
      if (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
      }
      
      // Extract all unique crypto tags from name_category
      const allTags = new Set<string>()
      articles.forEach((article: { name_category: string }) => {
        if (article.name_category) {
          const tags = article.name_category.split(',').map((tag: string) => tag.trim())
          tags.forEach((tag: string) => allTags.add(tag))
        }
      })
      
      return NextResponse.json({
        categories: Array.from(allTags).sort()
      })
    }
    
    // Handle regular article fetching
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const source = searchParams.get('source')
    const nameCategory = searchParams.get('name_category')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('articles')
      .select('*')

    // Add filters
    if (source && source !== 'all') {
      query = query.eq('source', source)
    }

    if (nameCategory && nameCategory !== 'all') {
      if (nameCategory === 'others') {
        query = query.is('name_category', null)
      } else {
        query = query.like('name_category', `%${nameCategory}%`)
      }
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
    let countQuery = supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    // Apply same filters for count
    if (source && source !== 'all') {
      countQuery = countQuery.eq('source', source)
    }

    if (nameCategory && nameCategory !== 'all') {
      if (nameCategory === 'others') {
        countQuery = countQuery.is('name_category', null)
      } else {
        countQuery = countQuery.like('name_category', `%${nameCategory}%`)
      }
    }

    const { count: totalCount } = await countQuery

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
    const { title, url, content, description, source, pub_date, category, name_category, creator } = body

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
        description: description || null,
        source,
        pub_date: pub_date || null,
        category: category || null,
        name_category: name_category || null,
        creator: creator || null
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