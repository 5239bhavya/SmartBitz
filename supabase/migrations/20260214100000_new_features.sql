-- =====================================================
-- NEW FEATURES DATABASE MIGRATION
-- Date: 2026-02-14
-- Purpose: Add tables for new isolated features
-- =====================================================

-- 1. EXTENDED USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    business_name TEXT,
    industry TEXT,
    business_stage TEXT CHECK (business_stage IN ('Idea', 'Startup', 'Growing')),
    location TEXT,
    preferred_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. USER PROGRESS TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plans_created INTEGER DEFAULT 0,
    marketing_campaigns_generated INTEGER DEFAULT 0,
    dashboard_updates INTEGER DEFAULT 0,
    last_dashboard_update TIMESTAMP WITH TIME ZONE,
    budget_optimization_count INTEGER DEFAULT 0,
    revenue_growth DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 3. USER POINTS TABLE (GAMIFICATION)
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 4. POINT ACTIVITIES LOG TABLE
CREATE TABLE IF NOT EXISTS public.point_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    points_awarded INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. GENERATED ADS TABLE
CREATE TABLE IF NOT EXISTS public.generated_ads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    ad_type TEXT NOT NULL,
    headline TEXT NOT NULL,
    caption TEXT NOT NULL,
    cta TEXT NOT NULL,
    hashtags TEXT NOT NULL,
    suggested_time TEXT,
    tone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. SUCCESS GUIDES TABLE
CREATE TABLE IF NOT EXISTS public.success_guides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type TEXT NOT NULL,
    weekly_goals JSONB,
    marketing_checklist JSONB,
    cost_control_checklist JSONB,
    growth_strategies JSONB,
    export_readiness JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_rank ON public.user_points(rank);
CREATE INDEX IF NOT EXISTS idx_point_activities_user_id ON public.point_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_ads_user_id ON public.generated_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_success_guides_user_id ON public.success_guides(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_guides ENABLE ROW LEVEL SECURITY;

-- USER PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- USER PROGRESS POLICIES
CREATE POLICY "Users can view their own progress"
    ON public.user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON public.user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON public.user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- USER POINTS POLICIES
CREATE POLICY "Users can view all points (for leaderboard)"
    ON public.user_points FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own points"
    ON public.user_points FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
    ON public.user_points FOR UPDATE
    USING (auth.uid() = user_id);

-- POINT ACTIVITIES POLICIES
CREATE POLICY "Users can view their own activities"
    ON public.point_activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
    ON public.point_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- GENERATED ADS POLICIES
CREATE POLICY "Users can view their own ads"
    ON public.generated_ads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ads"
    ON public.generated_ads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads"
    ON public.generated_ads FOR DELETE
    USING (auth.uid() = user_id);

-- SUCCESS GUIDES POLICIES
CREATE POLICY "Users can view their own guides"
    ON public.success_guides FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guides"
    ON public.success_guides FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guides"
    ON public.success_guides FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON public.user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_success_guides_updated_at
    BEFORE UPDATE ON public.success_guides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION TO AWARD POINTS
-- =====================================================

CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_activity_type TEXT,
    p_points INTEGER,
    p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Insert activity log
    INSERT INTO public.point_activities (user_id, activity_type, points_awarded, description)
    VALUES (p_user_id, p_activity_type, p_points, p_description);
    
    -- Update or insert user points
    INSERT INTO public.user_points (user_id, total_points)
    VALUES (p_user_id, p_points)
    ON CONFLICT (user_id)
    DO UPDATE SET total_points = public.user_points.total_points + p_points;
    
    -- Update ranks (simple ranking by total points)
    WITH ranked_users AS (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_points DESC) as new_rank
        FROM public.user_points
    )
    UPDATE public.user_points
    SET rank = ranked_users.new_rank
    FROM ranked_users
    WHERE public.user_points.user_id = ranked_users.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
