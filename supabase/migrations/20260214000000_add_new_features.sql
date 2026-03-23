-- =====================================================
-- NEW FEATURES MIGRATION - AI-Powered Startup Planning
-- File: 20260214000000_add_new_features.sql
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TABLE 1: Tracking Parameters
-- Stores user-selected dashboard tracking parameters
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tracking_parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
  business_plan_type TEXT CHECK (business_plan_type IN ('basic', 'growth', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tracking_parameters_user_id ON public.tracking_parameters(user_id);

-- Enable RLS
ALTER TABLE public.tracking_parameters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own tracking parameters" ON public.tracking_parameters;
CREATE POLICY "Users can view their own tracking parameters"
ON public.tracking_parameters
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tracking parameters" ON public.tracking_parameters;
CREATE POLICY "Users can insert their own tracking parameters"
ON public.tracking_parameters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tracking parameters" ON public.tracking_parameters;
CREATE POLICY "Users can update their own tracking parameters"
ON public.tracking_parameters
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tracking parameters" ON public.tracking_parameters;
CREATE POLICY "Users can delete their own tracking parameters"
ON public.tracking_parameters
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_tracking_parameters_updated_at ON public.tracking_parameters;
CREATE TRIGGER update_tracking_parameters_updated_at
BEFORE UPDATE ON public.tracking_parameters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- TABLE 2: Market Research Links
-- Stores government and verified market research links
-- =====================================================

CREATE TABLE IF NOT EXISTS public.market_research_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_type TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('market_trends', 'product_research', 'industry_reports', 'government_schemes')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_government BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_research_business_type ON public.market_research_links(business_type);
CREATE INDEX IF NOT EXISTS idx_market_research_location ON public.market_research_links(location);
CREATE INDEX IF NOT EXISTS idx_market_research_category ON public.market_research_links(category);

-- Enable RLS
ALTER TABLE public.market_research_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view market research links (public data)
DROP POLICY IF EXISTS "Anyone can view market research links" ON public.market_research_links;
CREATE POLICY "Anyone can view market research links"
ON public.market_research_links
FOR SELECT
USING (true);

-- Only authenticated users can suggest new links
DROP POLICY IF EXISTS "Authenticated users can insert market research links" ON public.market_research_links;
CREATE POLICY "Authenticated users can insert market research links"
ON public.market_research_links
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_market_research_links_updated_at ON public.market_research_links;
CREATE TRIGGER update_market_research_links_updated_at
BEFORE UPDATE ON public.market_research_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for market research links
INSERT INTO public.market_research_links (business_type, location, category, title, url, description, is_government) 
SELECT * FROM (VALUES
  -- Government Schemes
  ('All', 'India', 'government_schemes', 'MSME - Ministry of Micro, Small and Medium Enterprises', 'https://msme.gov.in/', 'Official MSME portal for schemes, registration, and support', true),
  ('All', 'India', 'government_schemes', 'Startup India', 'https://www.startupindia.gov.in/', 'Government of India initiative for startup ecosystem', true),
  ('All', 'India', 'government_schemes', 'DGFT - Directorate General of Foreign Trade', 'https://dgft.gov.in/', 'Export-import policies and procedures', true),
  ('All', 'India', 'government_schemes', 'GeM - Government e-Marketplace', 'https://gem.gov.in/', 'National public procurement portal', true),
  ('All', 'India', 'government_schemes', 'Udyam Registration Portal', 'https://udyamregistration.gov.in/', 'Free MSME registration portal', true),
  ('All', 'India', 'government_schemes', 'SIDBI - Small Industries Development Bank', 'https://www.sidbi.in/', 'Financial assistance for MSMEs', true),
  ('All', 'India', 'government_schemes', 'NSIC - National Small Industries Corporation', 'https://www.nsic.co.in/', 'Marketing, technology, and financial support', true),
  
  -- Market Trends
  ('All', 'India', 'market_trends', 'IBEF - India Brand Equity Foundation', 'https://www.ibef.org/', 'Industry reports and market research', true),
  ('All', 'India', 'market_trends', 'NITI Aayog', 'https://www.niti.gov.in/', 'Policy think tank with industry insights', true),
  ('Food & Beverages', 'India', 'market_trends', 'FSSAI - Food Safety Standards', 'https://www.fssai.gov.in/', 'Food business regulations and licensing', true),
  ('Manufacturing', 'India', 'market_trends', 'Make in India', 'https://www.makeinindia.com/', 'Manufacturing sector opportunities', true),
  
  -- Product Research
  ('All', 'India', 'product_research', 'CSIR - Council of Scientific & Industrial Research', 'https://www.csir.res.in/', 'Research and development resources', true),
  ('Technology', 'India', 'product_research', 'STPI - Software Technology Parks', 'https://www.stpi.in/', 'IT/ITES sector support', true),
  ('Agriculture', 'India', 'product_research', 'APEDA - Agricultural Export Development', 'https://apeda.gov.in/', 'Agricultural product export promotion', true),
  
  -- Industry Reports
  ('All', 'India', 'industry_reports', 'Ministry of Commerce & Industry', 'https://commerce.gov.in/', 'Trade statistics and industry data', true),
  ('All', 'India', 'industry_reports', 'RBI - Reserve Bank of India', 'https://www.rbi.org.in/', 'Economic data and financial reports', true),
  ('Textile', 'India', 'industry_reports', 'Ministry of Textiles', 'https://texmin.nic.in/', 'Textile industry policies and schemes', true),
  ('Electronics', 'India', 'industry_reports', 'MeitY - Ministry of Electronics & IT', 'https://www.meity.gov.in/', 'Electronics and IT sector initiatives', true)
) AS v(business_type, location, category, title, url, description, is_government)
WHERE NOT EXISTS (
    SELECT 1 FROM public.market_research_links WHERE title = v.title
);


-- =====================================================
-- TABLE 3: Export Resources
-- Stores export-related guidance and resources
-- =====================================================

CREATE TABLE IF NOT EXISTS public.export_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('registration', 'councils', 'schemes', 'documentation', 'databases')),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_export_resources_category ON public.export_resources(category);
CREATE INDEX IF NOT EXISTS idx_export_resources_industry ON public.export_resources(industry);

-- Enable RLS
ALTER TABLE public.export_resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view export resources
DROP POLICY IF EXISTS "Anyone can view export resources" ON public.export_resources;
CREATE POLICY "Anyone can view export resources"
ON public.export_resources
FOR SELECT
USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_export_resources_updated_at ON public.export_resources;
CREATE TRIGGER update_export_resources_updated_at
BEFORE UPDATE ON public.export_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for export resources
INSERT INTO public.export_resources (category, title, description, url, documents, industry)
SELECT * FROM (VALUES
  -- Registration
  ('registration', 'IEC - Import Export Code', 'Mandatory code for export-import business', 'https://dgft.gov.in/', '["PAN Card", "Aadhaar Card", "Bank Certificate", "Cancelled Cheque"]'::jsonb, 'All'),
  ('registration', 'RCMC - Registration Cum Membership Certificate', 'Certificate from Export Promotion Council', 'https://dgft.gov.in/', '["IEC", "Business Registration", "Bank Details"]'::jsonb, 'All'),
  ('registration', 'GST Registration', 'Goods and Services Tax registration', 'https://www.gst.gov.in/', '["PAN Card", "Business Proof", "Address Proof"]'::jsonb, 'All'),
  
  -- Export Councils
  ('councils', 'FIEO - Federation of Indian Export Organisations', 'Apex export promotion body', 'https://fieo.org/', '[]'::jsonb, 'All'),
  ('councils', 'EEPC India - Engineering Export Promotion Council', 'Engineering goods export', 'https://eepcindia.org/', '[]'::jsonb, 'Engineering'),
  ('councils', 'TEXPROCIL - Cotton Textiles Export Promotion Council', 'Cotton textile exports', 'https://texprocil.org/', '[]'::jsonb, 'Textile'),
  ('councils', 'APEDA - Agricultural and Processed Food Products', 'Agricultural exports', 'https://apeda.gov.in/', '[]'::jsonb, 'Agriculture'),
  
  -- Schemes
  ('schemes', 'RoDTEP - Remission of Duties and Taxes on Exported Products', 'Duty remission scheme', 'https://dgft.gov.in/', '[]'::jsonb, 'All'),
  ('schemes', 'MEIS - Merchandise Exports from India Scheme', 'Export incentive scheme', 'https://dgft.gov.in/', '[]'::jsonb, 'All'),
  ('schemes', 'EPCG - Export Promotion Capital Goods', 'Import capital goods at zero duty', 'https://dgft.gov.in/', '[]'::jsonb, 'Manufacturing'),
  
  -- Documentation
  ('documentation', 'Export Documentation Checklist', 'Complete list of export documents', NULL, '["Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin", "Insurance Certificate", "Export License", "Shipping Bill"]'::jsonb, 'All'),
  ('documentation', 'Letter of Credit (LC) Guide', 'Understanding LC for exports', NULL, '["LC Application", "Proforma Invoice", "Bank Guarantee"]'::jsonb, 'All'),
  
  -- Databases
  ('databases', 'India Trade Portal', 'Export-import statistics', 'https://www.indiatradeportal.in/', '[]'::jsonb, 'All'),
  ('databases', 'Export Genius', 'Export data and buyer information', 'https://www.exportgenius.in/', '[]'::jsonb, 'All'),
  ('databases', 'TradeIndia Exporters Directory', 'Verified exporters database', 'https://www.tradeindia.com/', '[]'::jsonb, 'All')
) AS v(category, title, description, url, documents, industry)
WHERE NOT EXISTS (
    SELECT 1 FROM public.export_resources WHERE title = v.title
);


-- =====================================================
-- TABLE 4: Advertisement Templates
-- Stores AI-generated advertisement templates
-- =====================================================

CREATE TABLE IF NOT EXISTS public.advertisement_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- template_data structure:
  -- {
  --   "design": "template_url or base64",
  --   "caption": "ad caption text",
  --   "hashtags": ["tag1", "tag2"],
  --   "target_audience": "description",
  --   "posting_schedule": "recommended time",
  --   "platform": "instagram/facebook/linkedin"
  -- }
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advertisement_templates_user_id ON public.advertisement_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_advertisement_templates_business_type ON public.advertisement_templates(business_type);

-- Enable RLS
ALTER TABLE public.advertisement_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own advertisement templates" ON public.advertisement_templates;
CREATE POLICY "Users can view their own advertisement templates"
ON public.advertisement_templates
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own advertisement templates" ON public.advertisement_templates;
CREATE POLICY "Users can insert their own advertisement templates"
ON public.advertisement_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own advertisement templates" ON public.advertisement_templates;
CREATE POLICY "Users can update their own advertisement templates"
ON public.advertisement_templates
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own advertisement templates" ON public.advertisement_templates;
CREATE POLICY "Users can delete their own advertisement templates"
ON public.advertisement_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_advertisement_templates_updated_at ON public.advertisement_templates;
CREATE TRIGGER update_advertisement_templates_updated_at
BEFORE UPDATE ON public.advertisement_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- TABLE 5: Social Media Accounts
-- Stores user's social media account information
-- =====================================================

CREATE TABLE IF NOT EXISTS public.social_media_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'youtube')),
  username TEXT,
  account_url TEXT,
  setup_completed BOOLEAN NOT NULL DEFAULT false,
  setup_steps JSONB DEFAULT '{}'::jsonb,
  -- setup_steps structure:
  -- {
  --   "account_created": true/false,
  --   "business_profile": true/false,
  --   "bio_optimized": true/false,
  --   "logo_uploaded": true/false,
  --   "contact_setup": true/false,
  --   "analytics_enabled": true/false
  -- }
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_user_id ON public.social_media_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_platform ON public.social_media_accounts(platform);

-- Enable RLS
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own social media accounts" ON public.social_media_accounts;
CREATE POLICY "Users can view their own social media accounts"
ON public.social_media_accounts
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own social media accounts" ON public.social_media_accounts;
CREATE POLICY "Users can insert their own social media accounts"
ON public.social_media_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own social media accounts" ON public.social_media_accounts;
CREATE POLICY "Users can update their own social media accounts"
ON public.social_media_accounts
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own social media accounts" ON public.social_media_accounts;
CREATE POLICY "Users can delete their own social media accounts"
ON public.social_media_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_social_media_accounts_updated_at ON public.social_media_accounts;
CREATE TRIGGER update_social_media_accounts_updated_at
BEFORE UPDATE ON public.social_media_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- TABLE 6: Marketing Analytics
-- Stores AI-generated marketing insights and strategies
-- =====================================================

CREATE TABLE IF NOT EXISTS public.marketing_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  posting_patterns JSONB DEFAULT '{}'::jsonb,
  -- posting_patterns structure:
  -- {
  --   "frequency": "daily/weekly",
  --   "best_times": ["10:00 AM", "6:00 PM"],
  --   "engagement_rate": 5.2,
  --   "top_content_types": ["reels", "posts"]
  -- }
  ai_suggestions JSONB DEFAULT '{}'::jsonb,
  -- ai_suggestions structure:
  -- {
  --   "content_ideas": ["idea1", "idea2"],
  --   "hashtag_strategy": ["tag1", "tag2"],
  --   "posting_schedule": "schedule details",
  --   "growth_tips": ["tip1", "tip2"]
  -- }
  weekly_strategy JSONB DEFAULT '{}'::jsonb,
  -- weekly_strategy structure:
  -- {
  --   "monday": {"content": "...", "time": "10:00 AM"},
  --   "tuesday": {...},
  --   ...
  -- }
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_user_id ON public.marketing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_platform ON public.marketing_analytics(platform);

-- Enable RLS
ALTER TABLE public.marketing_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own marketing analytics" ON public.marketing_analytics;
CREATE POLICY "Users can view their own marketing analytics"
ON public.marketing_analytics
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own marketing analytics" ON public.marketing_analytics;
CREATE POLICY "Users can insert their own marketing analytics"
ON public.marketing_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own marketing analytics" ON public.marketing_analytics;
CREATE POLICY "Users can update their own marketing analytics"
ON public.marketing_analytics
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own marketing analytics" ON public.marketing_analytics;
CREATE POLICY "Users can delete their own marketing analytics"
ON public.marketing_analytics
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_marketing_analytics_updated_at ON public.marketing_analytics;
CREATE TRIGGER update_marketing_analytics_updated_at
BEFORE UPDATE ON public.marketing_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- TABLE 7: Budget Predictions
-- Stores AI-generated budget predictions and feasibility analysis
-- =====================================================

CREATE TABLE IF NOT EXISTS public.budget_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_idea TEXT NOT NULL,
  predicted_budget NUMERIC NOT NULL,
  budget_breakdown JSONB DEFAULT '{}'::jsonb,
  -- budget_breakdown structure:
  -- {
  --   "infrastructure": 50000,
  --   "equipment": 30000,
  --   "inventory": 20000,
  --   "marketing": 10000,
  --   "licenses": 5000,
  --   "working_capital": 35000
  -- }
  user_budget NUMERIC,
  feasibility_analysis JSONB DEFAULT '{}'::jsonb,
  -- feasibility_analysis structure:
  -- {
  --   "status": "feasible/challenging/not_feasible",
  --   "gap": 50000,
  --   "optimization_suggestions": ["suggestion1", "suggestion2"],
  --   "scaling_strategy": "strategy details"
  -- }
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budget_predictions_user_id ON public.budget_predictions(user_id);

-- Enable RLS
ALTER TABLE public.budget_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own budget predictions" ON public.budget_predictions;
CREATE POLICY "Users can view their own budget predictions"
ON public.budget_predictions
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own budget predictions" ON public.budget_predictions;
CREATE POLICY "Users can insert their own budget predictions"
ON public.budget_predictions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own budget predictions" ON public.budget_predictions;
CREATE POLICY "Users can update their own budget predictions"
ON public.budget_predictions
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own budget predictions" ON public.budget_predictions;
CREATE POLICY "Users can delete their own budget predictions"
ON public.budget_predictions
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_budget_predictions_updated_at ON public.budget_predictions;
CREATE TRIGGER update_budget_predictions_updated_at
BEFORE UPDATE ON public.budget_predictions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- You should now have:
-- ✅ tracking_parameters table
-- ✅ market_research_links table (with 18 seed records)
-- ✅ export_resources table (with 15 seed records)
-- ✅ advertisement_templates table
-- ✅ social_media_accounts table
-- ✅ marketing_analytics table
-- ✅ budget_predictions table
-- ✅ All RLS policies enabled
-- ✅ All triggers configured
-- ✅ All indexes created
-- =====================================================
