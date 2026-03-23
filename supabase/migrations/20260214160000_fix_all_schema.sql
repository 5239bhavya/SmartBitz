-- Comprehensive Schema Fix
-- Run this in Supabase SQL Editor

-- 1. Create user_progress table if missing
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    completed_tasks TEXT[] DEFAULT '{}',
    current_phase TEXT DEFAULT 'Idea',
    next_milestone TEXT,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT user_progress_user_id_key UNIQUE (user_id)
);

-- 2. Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for user_progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
ON public.user_progress FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress"
ON public.user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- 4. Create plan_ads table if missing (just in case)
CREATE TABLE IF NOT EXISTS public.plan_ads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT,
    ad_type TEXT,
    headline TEXT,
    caption TEXT,
    cta TEXT,
    hashtags TEXT,
    suggested_time TEXT,
    image_url TEXT,
    image_data TEXT,
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Enable RLS on plan_ads
ALTER TABLE public.plan_ads ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for plan_ads
DROP POLICY IF EXISTS "Users can view own ads" ON public.plan_ads;
CREATE POLICY "Users can view own ads"
ON public.plan_ads FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ads" ON public.plan_ads;
CREATE POLICY "Users can insert own ads"
ON public.plan_ads FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ads" ON public.plan_ads;
CREATE POLICY "Users can update own ads"
ON public.plan_ads FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ads" ON public.plan_ads;
CREATE POLICY "Users can delete own ads"
ON public.plan_ads FOR DELETE
USING (auth.uid() = user_id);

-- 7. Ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    business_name TEXT,
    industry TEXT,
    business_stage TEXT,
    location TEXT,
    preferred_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

-- Enable RLS for profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- 8. Backfill user_progress for existing users
INSERT INTO public.user_progress (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_progress)
ON CONFLICT (user_id) DO NOTHING;
