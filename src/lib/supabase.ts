import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Article {
  id: string
  title: string
  url: string
  content: string
  description: string | null
  source: string
  pub_date: string | null
  category: string | null
  name_category: string | null
  creator: string | null
  created_at: string
  updated_at: string
}

export interface ArticleInsert {
  title: string
  url: string
  content: string
  description?: string
  source: string
  pub_date?: string
  category?: string
  name_category?: string
  creator?: string
}

export interface SummaryNew {
  id: string
  all_select: number
  all_content: string
  all_source: string
  all_category: string | null
  name_crypto: string | null
  summary: string
  source: string
  sentiment: 'Positive' | 'Neutral' | 'Negative' | null
  trending_score: number | null
  created_at: string
  updated_at: string
}

export interface SummaryNewInsert {
  all_select: number
  all_content: string
  all_source: string
  all_category?: string
  name_crypto?: string
  summary: string
  source: string
  sentiment?: 'Positive' | 'Neutral' | 'Negative'
  trending_score?: number
} 