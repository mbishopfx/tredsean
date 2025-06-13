-- Create audits table for storing GBP audit results
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  url TEXT,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('basic', 'detailed')),
  overall_score INTEGER,
  listing_completeness_score INTEGER,
  content_alignment_score INTEGER,
  local_seo_readiness_score INTEGER,
  ai_seo_score INTEGER,
  google_ai_readiness INTEGER,
  audit_data JSONB NOT NULL,
  sales_pitch_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'completed'
);

-- Create reports table for storing PDF reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('basic', 'detailed', 'sales_pitch')),
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  mime_type TEXT DEFAULT 'application/pdf',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (audit_id) REFERENCES audits(audit_id) ON DELETE CASCADE
);

-- Create ai_outputs table for storing all AI tool outputs
CREATE TABLE IF NOT EXISTS ai_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  input_data TEXT,
  output_data TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create audit_history table for user audit history
CREATE TABLE IF NOT EXISTS audit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  audit_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  quick_summary TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(user_id, audit_id)
);

-- Create campaigns table for storing campaign data
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT UNIQUE NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  campaign_data JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  total_contacts INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0
);

-- Create storage bucket for audit reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-reports', 'audit-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audits_created_by ON audits(created_by);
CREATE INDEX IF NOT EXISTS idx_audits_business_name ON audits(business_name);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_audit_id ON reports(audit_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_user_id ON ai_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_tool_name ON ai_outputs(tool_name);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_created_at ON ai_outputs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_history_user_id ON audit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - adjust as needed)
CREATE POLICY "Allow all operations on audits" ON audits FOR ALL USING (true);
CREATE POLICY "Allow all operations on reports" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_outputs" ON ai_outputs FOR ALL USING (true);
CREATE POLICY "Allow all operations on audit_history" ON audit_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on campaigns" ON campaigns FOR ALL USING (true);

-- Create storage policy for audit reports
CREATE POLICY "Allow all operations on audit-reports bucket" ON storage.objects FOR ALL USING (bucket_id = 'audit-reports'); 