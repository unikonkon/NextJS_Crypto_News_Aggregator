import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Types
export interface Article {
  id: string
  title: string
  url: string
  content: string
  summary: string | null
  sentiment: 'Positive' | 'Neutral' | 'Negative' | null
  trending_score: number | null
  source: string
  published_at: string
  created_at: string
}

export interface ArticleInsert {
  title: string
  url: string
  content: string
  source: string
  published_at: string
  summary?: string
  sentiment?: 'Positive' | 'Neutral' | 'Negative'
  trending_score?: number
} 