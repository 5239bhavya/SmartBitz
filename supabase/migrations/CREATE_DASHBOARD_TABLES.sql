-- =====================================================
-- BUSINESS DASHBOARD TABLES
-- Complete schema for tracking sales, cash flow, advertising, and milestones
-- =====================================================

-- =====================================================
-- 1. DASHBOARD CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.dashboard_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout JSONB DEFAULT '[]'::jsonb, -- Widget positions and sizes
  active_widgets TEXT[] DEFAULT ARRAY['sales', 'cashflow', 'phase', 'advertising'], -- Active widget IDs
  theme_preferences JSONB DEFAULT '{}'::jsonb, -- Color scheme, chart types
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- =====================================================
-- 2. SALES TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sales_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  product_service TEXT NOT NULL,
  category TEXT, -- Product category
  payment_method TEXT, -- Cash, Card, UPI, etc.
  customer_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_user_date ON public.sales_tracking(user_id, date DESC);
CREATE INDEX idx_sales_category ON public.sales_tracking(user_id, category);

-- =====================================================
-- 3. CASH FLOW (Income & Expenses)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cash_flow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL, -- Salary, Rent, Marketing, etc.
  description TEXT,
  payment_method TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_cashflow_user_date ON public.cash_flow(user_id, date DESC);
CREATE INDEX idx_cashflow_type ON public.cash_flow(user_id, type);
CREATE INDEX idx_cashflow_category ON public.cash_flow(user_id, category);

-- =====================================================
-- 4. ADVERTISING CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.advertising_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- Google Ads, Facebook, Instagram, LinkedIn, YouTube
  campaign_name TEXT NOT NULL,
  budget DECIMAL(12, 2) NOT NULL CHECK (budget >= 0),
  spent DECIMAL(12, 2) DEFAULT 0 CHECK (spent >= 0),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_advertising_user_platform ON public.advertising_campaigns(user_id, platform);
CREATE INDEX idx_advertising_status ON public.advertising_campaigns(user_id, status);

-- =====================================================
-- 5. BUSINESS MILESTONES (Phase Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.business_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('idea', 'launch', 'growth', 'scale')),
  milestone_name TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  target_date DATE,
  completed_date DATE,
  order_index INTEGER DEFAULT 0, -- For sorting milestones
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_user_phase ON public.business_milestones(user_id, phase);
CREATE INDEX idx_milestones_completed ON public.business_milestones(user_id, completed);

-- =====================================================
-- 6. ENABLE RLS ON ALL DASHBOARD TABLES
-- =====================================================

ALTER TABLE public.dashboard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_milestones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. RLS POLICIES - USER ISOLATION
-- =====================================================

-- Dashboard Config Policies
CREATE POLICY "Users can view their own dashboard config"
ON public.dashboard_config FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard config"
ON public.dashboard_config FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard config"
ON public.dashboard_config FOR UPDATE
USING (auth.uid() = user_id);

-- Sales Tracking Policies
CREATE POLICY "Users can view their own sales"
ON public.sales_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
ON public.sales_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
ON public.sales_tracking FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
ON public.sales_tracking FOR DELETE
USING (auth.uid() = user_id);

-- Cash Flow Policies
CREATE POLICY "Users can view their own cash flow"
ON public.cash_flow FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash flow"
ON public.cash_flow FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash flow"
ON public.cash_flow FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash flow"
ON public.cash_flow FOR DELETE
USING (auth.uid() = user_id);

-- Advertising Campaigns Policies
CREATE POLICY "Users can view their own campaigns"
ON public.advertising_campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
ON public.advertising_campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
ON public.advertising_campaigns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
ON public.advertising_campaigns FOR DELETE
USING (auth.uid() = user_id);

-- Business Milestones Policies
CREATE POLICY "Users can view their own milestones"
ON public.business_milestones FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
ON public.business_milestones FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
ON public.business_milestones FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
ON public.business_milestones FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate ROI for advertising campaigns
CREATE OR REPLACE FUNCTION public.calculate_campaign_roi(campaign_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  campaign_spent DECIMAL;
  campaign_conversions INTEGER;
  avg_sale_value DECIMAL;
  revenue DECIMAL;
  roi DECIMAL;
BEGIN
  -- Get campaign data
  SELECT spent, conversions INTO campaign_spent, campaign_conversions
  FROM public.advertising_campaigns
  WHERE id = campaign_id;
  
  -- Get average sale value for user
  SELECT AVG(amount) INTO avg_sale_value
  FROM public.sales_tracking
  WHERE user_id = (SELECT user_id FROM public.advertising_campaigns WHERE id = campaign_id)
  AND date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Calculate revenue from conversions
  revenue := campaign_conversions * COALESCE(avg_sale_value, 0);
  
  -- Calculate ROI
  IF campaign_spent > 0 THEN
    roi := ((revenue - campaign_spent) / campaign_spent) * 100;
  ELSE
    roi := 0;
  END IF;
  
  RETURN roi;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current business phase based on milestones
CREATE OR REPLACE FUNCTION public.get_current_phase(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  idea_complete BOOLEAN;
  launch_complete BOOLEAN;
  growth_complete BOOLEAN;
BEGIN
  -- Check completion of each phase
  SELECT COUNT(*) = COUNT(*) FILTER (WHERE completed = true) INTO idea_complete
  FROM public.business_milestones
  WHERE user_id = p_user_id AND phase = 'idea';
  
  SELECT COUNT(*) = COUNT(*) FILTER (WHERE completed = true) INTO launch_complete
  FROM public.business_milestones
  WHERE user_id = p_user_id AND phase = 'launch';
  
  SELECT COUNT(*) = COUNT(*) FILTER (WHERE completed = true) INTO growth_complete
  FROM public.business_milestones
  WHERE user_id = p_user_id AND phase = 'growth';
  
  -- Return current phase
  IF NOT idea_complete THEN
    RETURN 'idea';
  ELSIF NOT launch_complete THEN
    RETURN 'launch';
  ELSIF NOT growth_complete THEN
    RETURN 'growth';
  ELSE
    RETURN 'scale';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. INSERT DEFAULT MILESTONES FOR NEW USERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_default_milestones()
RETURNS TRIGGER AS $$
BEGIN
  -- Idea Phase Milestones
  INSERT INTO public.business_milestones (user_id, phase, milestone_name, description, order_index) VALUES
  (NEW.id, 'idea', 'Market Research', 'Complete market research and identify target audience', 1),
  (NEW.id, 'idea', 'Business Plan', 'Create comprehensive business plan', 2),
  (NEW.id, 'idea', 'Competitor Analysis', 'Analyze competitors and find your unique value proposition', 3),
  (NEW.id, 'idea', 'Financial Planning', 'Estimate startup costs and create budget', 4);
  
  -- Launch Phase Milestones
  INSERT INTO public.business_milestones (user_id, phase, milestone_name, description, order_index) VALUES
  (NEW.id, 'launch', 'Product/Service Ready', 'Finalize your product or service offering', 1),
  (NEW.id, 'launch', 'Online Presence', 'Create website and social media profiles', 2),
  (NEW.id, 'launch', 'First 10 Customers', 'Acquire your first 10 paying customers', 3),
  (NEW.id, 'launch', 'Payment System', 'Set up payment processing and invoicing', 4);
  
  -- Growth Phase Milestones
  INSERT INTO public.business_milestones (user_id, phase, milestone_name, description, order_index) VALUES
  (NEW.id, 'growth', 'Consistent Revenue', 'Achieve consistent monthly revenue', 1),
  (NEW.id, 'growth', 'Marketing Campaigns', 'Launch and optimize marketing campaigns', 2),
  (NEW.id, 'growth', 'Customer Feedback', 'Implement customer feedback system', 3),
  (NEW.id, 'growth', 'Team Expansion', 'Hire first employees or contractors', 4);
  
  -- Scale Phase Milestones
  INSERT INTO public.business_milestones (user_id, phase, milestone_name, description, order_index) VALUES
  (NEW.id, 'scale', 'Process Automation', 'Automate repetitive business processes', 1),
  (NEW.id, 'scale', 'Multiple Revenue Streams', 'Diversify income sources', 2),
  (NEW.id, 'scale', 'Brand Recognition', 'Build strong brand presence in market', 3),
  (NEW.id, 'scale', 'Market Expansion', 'Expand to new markets or locations', 4);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default milestones when user profile is created
DROP TRIGGER IF EXISTS on_profile_created_milestones ON public.profiles;
CREATE TRIGGER on_profile_created_milestones
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_milestones();

-- =====================================================
-- DASHBOARD TABLES COMPLETE!
-- =====================================================
-- ✅ 5 tables created (dashboard_config, sales_tracking, cash_flow, advertising_campaigns, business_milestones)
-- ✅ RLS policies enforced
-- ✅ Indexes for performance
-- ✅ Helper functions for ROI and phase tracking
-- ✅ Default milestones auto-created for new users
-- =====================================================
