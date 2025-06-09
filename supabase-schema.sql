-- TRD Dialer & SMS System - Supabase Database Schema
-- This schema provides permanent storage for audits, reports, and posts

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create audits table for permanent audit storage
CREATE TABLE IF NOT EXISTS public.audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_id VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    url TEXT,
    audit_type VARCHAR(50) NOT NULL, -- 'basic' or 'detailed'
    overall_score INTEGER NOT NULL,
    listing_completeness_score INTEGER,
    content_alignment_score INTEGER,
    local_seo_readiness_score INTEGER,
    ai_seo_score INTEGER,
    google_ai_readiness INTEGER,
    audit_data JSONB NOT NULL, -- Complete audit results
    sales_pitch_data JSONB, -- Generated sales pitch
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255), -- Username who ran the audit
    tags TEXT[], -- For categorization
    status VARCHAR(50) DEFAULT 'completed'
);

-- Create reports table for permanent report storage
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_id VARCHAR(255) REFERENCES public.audits(audit_id),
    report_type VARCHAR(50) NOT NULL, -- 'basic', 'detailed', 'sales_pitch'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT, -- Supabase storage path
    file_url TEXT, -- Public URL
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Create posts table for permanent home feed storage
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR(50) DEFAULT 'ai_generated', -- 'ai_generated', 'manual', 'announcement'
    category VARCHAR(100), -- 'seo_tip', 'industry_update', 'trd_news', etc.
    author VARCHAR(255), -- Username or 'AI Assistant'
    engagement_data JSONB, -- Likes, comments, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    tags TEXT[]
);

-- Create audit_history table for user-specific audit tracking
CREATE TABLE IF NOT EXISTS public.audit_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Username
    audit_id VARCHAR(255) REFERENCES public.audits(audit_id),
    business_name VARCHAR(255) NOT NULL,
    quick_summary TEXT,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT
);

-- Create storage buckets for file storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-reports', 'audit-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audits_business_name ON public.audits(business_name);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON public.audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_created_by ON public.audits(created_by);
CREATE INDEX IF NOT EXISTS idx_audits_audit_type ON public.audits(audit_type);

CREATE INDEX IF NOT EXISTS idx_reports_audit_id ON public.reports(audit_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON public.posts(is_active);

CREATE INDEX IF NOT EXISTS idx_audit_history_user_id ON public.audit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_history_last_accessed ON public.audit_history(last_accessed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on audits" ON public.audits FOR ALL USING (true);
CREATE POLICY "Allow all operations on reports" ON public.reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on posts" ON public.posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on audit_history" ON public.audit_history FOR ALL USING (true);

-- Storage policies for audit reports
CREATE POLICY "Allow all operations on audit reports bucket" 
ON storage.objects FOR ALL 
USING (bucket_id = 'audit-reports');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON public.audits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data categories for posts
INSERT INTO public.posts (post_id, content, post_type, category, author, created_at) VALUES
('init_post_1', 'Welcome to TRD AI Optimization System! Our advanced AI scripts help businesses dominate search results and outrank competitors 24/7.', 'announcement', 'trd_news', 'TRD Team', NOW()),
('init_post_2', '🤖 AI Search Tip: Voice search optimization is crucial. 55% of adults use voice search daily. Our AI scripts automatically optimize for voice queries to capture this growing market.', 'ai_generated', 'seo_tip', 'AI Assistant', NOW()),
('init_post_3', '📈 Success Story: Client increased online visibility by 340% using TRD AI scripts. Featured snippet captures increased by 89% in just 60 days.', 'ai_generated', 'success_story', 'AI Assistant', NOW())
ON CONFLICT (post_id) DO NOTHING;

-- Create materialized view for audit analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS audit_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as audit_date,
    audit_type,
    COUNT(*) as total_audits,
    AVG(overall_score) as avg_score,
    MIN(overall_score) as min_score,
    MAX(overall_score) as max_score,
    COUNT(DISTINCT business_name) as unique_businesses,
    COUNT(DISTINCT created_by) as unique_users
FROM public.audits 
GROUP BY DATE_TRUNC('day', created_at), audit_type
ORDER BY audit_date DESC;

-- Refresh the materialized view daily
CREATE OR REPLACE FUNCTION refresh_audit_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW audit_analytics;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean old data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Keep last 2 years of audit data
    DELETE FROM public.audits WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Keep last 1 year of posts (can be adjusted)
    DELETE FROM public.posts WHERE created_at < NOW() - INTERVAL '1 year' AND post_type = 'ai_generated';
    
    -- Clean orphaned reports
    DELETE FROM public.reports WHERE audit_id NOT IN (SELECT audit_id FROM public.audits);
    
    -- Refresh analytics
    PERFORM refresh_audit_analytics();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE public.audits IS 'Permanent storage for all GBP and AI optimization audits';
COMMENT ON TABLE public.reports IS 'Generated PDF reports and their metadata';
COMMENT ON TABLE public.posts IS 'Home feed posts including AI-generated content';
COMMENT ON TABLE public.audit_history IS 'User-specific audit access history and favorites';

COMMENT ON COLUMN public.audits.audit_data IS 'Complete JSON audit results including all scores and recommendations';
COMMENT ON COLUMN public.audits.sales_pitch_data IS 'Generated sales pitch talking points and strategies';
COMMENT ON COLUMN public.reports.file_path IS 'Supabase storage path for the report file';
COMMENT ON COLUMN public.posts.engagement_data IS 'JSON data for likes, shares, comments etc.';

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres; 