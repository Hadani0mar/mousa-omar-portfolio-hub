
-- Add links column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN links jsonb DEFAULT '[]'::jsonb;

-- Add comment explaining the links column structure
COMMENT ON COLUMN blog_posts.links IS 'JSON array of links/sources for the blog post. Each link should have title and url properties.';
