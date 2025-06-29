-- Add original_url column to existing ainewsall table
-- Run this migration if you have existing data in ainewsall table

-- Add the column (allow NULL initially for existing records)
ALTER TABLE ainewsall ADD COLUMN IF NOT EXISTS original_url TEXT;

-- If you want to populate existing records with URLs from articles table:
-- UPDATE ainewsall 
-- SET original_url = articles.url 
-- FROM articles 
-- WHERE ainewsall.article_id = articles.id
-- AND ainewsall.original_url IS NULL;

-- After populating existing data, you can make it NOT NULL if desired:
-- ALTER TABLE ainewsall ALTER COLUMN original_url SET NOT NULL;
