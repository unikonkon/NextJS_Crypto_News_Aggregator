-- Create enum for sentiment
CREATE TYPE sentiment_enum AS ENUM ('Positive', 'Neutral', 'Negative');

-- Create articles table สำหรับเก็บข้อมูลข่าวสารดิบที่ดึงได้
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL,
    pub_date TIMESTAMP WITH TIME ZONE,
    category TEXT,
    name_category TEXT, -- ชื่อเหรียญคริปโตที่เกี่ยวข้อง (เช่น BTC, ETH, ADA)
    creator TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create summarynew table สำหรับเก็บผลการประมวลผล AI
CREATE TABLE summarynew (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    all_select INTEGER NOT NULL, -- จำนวนข่าวที่เลือก
    all_content TEXT NOT NULL, -- เนื้อหารวมทั้งหมด
    all_source TEXT NOT NULL, -- แหล่งที่มารวม
    all_category TEXT, -- หมวดหมู่รวม
    name_crypto TEXT, -- ชื่อคริปโตที่เกี่ยวข้อง
    summary TEXT NOT NULL, -- สรุปจาก AI
    source TEXT NOT NULL, -- แหล่งที่มาหลัก
    sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
    trending_score INTEGER CHECK (trending_score >= 0 AND trending_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_articles_published_at ON articles(pub_date DESC);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_title ON articles(title);
CREATE INDEX idx_articles_name_category ON articles(name_category);

CREATE INDEX idx_summarynew_created_at ON summarynew(created_at DESC);
CREATE INDEX idx_summarynew_sentiment ON summarynew(sentiment);
CREATE INDEX idx_summarynew_trending_score ON summarynew(trending_score DESC);
CREATE INDEX idx_summarynew_source ON summarynew(source);

-- Create RLS (Row Level Security) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE summarynew ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT USING (true);
    
CREATE POLICY "Allow public read access" ON summarynew
    FOR SELECT USING (true);

-- Policy to allow service role to insert/update/delete
CREATE POLICY "Allow service role full access" ON articles
    FOR ALL USING (auth.role() = 'service_role');
    
CREATE POLICY "Allow service role full access" ON summarynew
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
    
CREATE TRIGGER update_summarynew_updated_at
    BEFORE UPDATE ON summarynew
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON articles TO anon, authenticated;
GRANT SELECT ON summarynew TO anon, authenticated; 