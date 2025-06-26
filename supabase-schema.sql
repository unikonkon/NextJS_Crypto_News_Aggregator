-- Create enum for sentiment
CREATE TYPE sentiment_enum AS ENUM ('Positive', 'Neutral', 'Negative');

-- Create articles table สร้างตาราง articles ตารางสำหรับเก็บข้อมูลข่าวสารของบทความ
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    summary TEXT,
    sentiment sentiment_enum,
    trending_score INTEGER CHECK (trending_score >= 0 AND trending_score <= 100),
    source TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_trending_score ON articles(trending_score DESC);
CREATE INDEX idx_articles_sentiment ON articles(sentiment);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_url ON articles(url);

-- Create RLS (Row Level Security) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT USING (true);

-- Policy to allow service role to insert/update/delete
CREATE POLICY "Allow service role full access" ON articles
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for trending articles (score >= 70)
CREATE VIEW trending_articles AS
SELECT *
FROM articles
WHERE trending_score >= 70
ORDER BY trending_score DESC, published_at DESC;

-- Create view for recent articles (last 24 hours)
CREATE VIEW recent_articles AS
SELECT *
FROM articles
WHERE published_at >= now() - interval '24 hours'
ORDER BY published_at DESC;

-- Create function to get articles with filters
CREATE OR REPLACE FUNCTION get_articles_filtered(
    p_sentiment sentiment_enum DEFAULT NULL,
    p_source TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_order_by TEXT DEFAULT 'trending_score',
    p_order_direction TEXT DEFAULT 'desc'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    url TEXT,
    content TEXT,
    summary TEXT,
    sentiment sentiment_enum,
    trending_score INTEGER,
    source TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    query_text TEXT;
BEGIN
    query_text := 'SELECT id, title, url, content, summary, sentiment, trending_score, source, published_at, created_at FROM articles WHERE 1=1';
    
    IF p_sentiment IS NOT NULL THEN
        query_text := query_text || ' AND sentiment = $1';
    END IF;
    
    IF p_source IS NOT NULL THEN
        query_text := query_text || ' AND source = $2';
    END IF;
    
    query_text := query_text || ' ORDER BY ' || p_order_by || ' ' || p_order_direction;
    query_text := query_text || ' LIMIT $3 OFFSET $4';
    
    RETURN QUERY EXECUTE query_text USING p_sentiment, p_source, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON articles TO anon, authenticated;
GRANT SELECT ON trending_articles TO anon, authenticated;
GRANT SELECT ON recent_articles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_articles_filtered TO anon, authenticated; 