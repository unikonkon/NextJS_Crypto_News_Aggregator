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

-- Create ainewsall table สำหรับเก็บผลการวิเคราะห์ AI แบบแยกแต่ละข่าว
CREATE TABLE ainewsall (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    original_title TEXT NOT NULL, -- ชื่อข่าวต้นฉบับ
    original_content TEXT NOT NULL, -- เนื้อหาต้นฉบับ
    original_source TEXT NOT NULL, -- แหล่งที่มาต้นฉบับ
    original_url TEXT NOT NULL, -- URL ต้นฉบับ
    original_category TEXT, -- หมวดหมู่ต้นฉบับ
    original_name_category TEXT, -- ชื่อคริปโตต้นฉบับ
    original_pub_date TIMESTAMP WITH TIME ZONE, -- วันที่เผยแพร่ต้นฉบับ
    summary_type TEXT NOT NULL CHECK (summary_type IN (
        'Extractive Summarization',
        'Abstractive Summarization', 
        'Sentiment-Based Summarization',
        'Impact-Oriented Summarization',
        'Actionable Insights Summarization'
    )), -- ประเภทการสรุป
    ai_summary TEXT NOT NULL, -- ผลการสรุปจาก AI
    ai_sentiment TEXT CHECK (ai_sentiment IN ('Positive', 'Neutral', 'Negative')),
    trending_score INTEGER CHECK (trending_score >= 0 AND trending_score <= 100),
    key_points TEXT[], -- จุดสำคัญที่ AI สกัดได้
    related_cryptos TEXT[], -- คริปโตที่เกี่ยวข้อง
    market_impact_score INTEGER CHECK (market_impact_score >= 0 AND market_impact_score <= 100),
    processing_time INTEGER, -- เวลาที่ใช้ในการประมวลผล (วินาที)
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

CREATE INDEX idx_ainewsall_created_at ON ainewsall(created_at DESC);
CREATE INDEX idx_ainewsall_article_id ON ainewsall(article_id);
CREATE INDEX idx_ainewsall_summary_type ON ainewsall(summary_type);
CREATE INDEX idx_ainewsall_sentiment ON ainewsall(ai_sentiment);
CREATE INDEX idx_ainewsall_trending_score ON ainewsall(trending_score DESC);
CREATE INDEX idx_ainewsall_source ON ainewsall(original_source);

-- Create RLS (Row Level Security) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE summarynew ENABLE ROW LEVEL SECURITY;
ALTER TABLE ainewsall ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT USING (true);
    
CREATE POLICY "Allow public read access" ON summarynew
    FOR SELECT USING (true);
    
CREATE POLICY "Allow public read access" ON ainewsall
    FOR SELECT USING (true);

-- Policy to allow service role to insert/update/delete
CREATE POLICY "Allow service role full access" ON articles
    FOR ALL USING (auth.role() = 'service_role');
    
CREATE POLICY "Allow service role full access" ON summarynew
    FOR ALL USING (auth.role() = 'service_role');
    
CREATE POLICY "Allow service role full access" ON ainewsall
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
    
CREATE TRIGGER update_ainewsall_updated_at
    BEFORE UPDATE ON ainewsall
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON articles TO anon, authenticated;
GRANT SELECT ON summarynew TO anon, authenticated;
GRANT SELECT ON ainewsall TO anon, authenticated; 