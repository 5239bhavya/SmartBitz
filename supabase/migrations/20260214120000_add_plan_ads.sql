-- =====================================================
-- AD PERSISTENCE SYSTEM
-- Migration: Add plan_ads table for storing generated ads
-- Date: 2026-02-14
-- =====================================================

-- 1. CREATE PLAN_ADS TABLE
CREATE TABLE IF NOT EXISTS public.plan_ads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    ad_type TEXT NOT NULL,
    headline TEXT NOT NULL,
    caption TEXT NOT NULL,
    cta TEXT NOT NULL,
    hashtags TEXT NOT NULL,
    suggested_time TEXT,
    image_data TEXT, -- Base64 encoded image data
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.plan_ads ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES
CREATE POLICY "Users can view their own ads"
    ON public.plan_ads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ads"
    ON public.plan_ads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads"
    ON public.plan_ads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads"
    ON public.plan_ads FOR DELETE
    USING (auth.uid() = user_id);

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_plan_ads_user_id ON public.plan_ads(user_id);
CREATE INDEX idx_plan_ads_plan_id ON public.plan_ads(plan_id);
CREATE INDEX idx_plan_ads_user_plan ON public.plan_ads(user_id, plan_id);
CREATE INDEX idx_plan_ads_archived ON public.plan_ads(is_archived);

-- 5. CREATE TRIGGER FOR UPDATED_AT
-- Reuse existing function if available, otherwise create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;
END
$$;

CREATE TRIGGER update_plan_ads_updated_at
    BEFORE UPDATE ON public.plan_ads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. GRANT PERMISSIONS
GRANT ALL ON public.plan_ads TO authenticated;
GRANT ALL ON public.plan_ads TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
