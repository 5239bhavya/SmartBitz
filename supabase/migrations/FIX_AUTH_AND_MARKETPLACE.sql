-- =====================================================
-- COMPREHENSIVE FIX FOR AUTH AND MARKETPLACE
-- Run this to fix both authentication and marketplace issues
-- =====================================================

-- =====================================================
-- 1. FIX PROFILES TABLE (for authentication)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate profiles policies with correct user reference
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- 2. FIX MARKETPLACE LISTINGS RLS
-- =====================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;

-- Create new policy that allows viewing ALL active listings
CREATE POLICY "Anyone can view all active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active');

-- Allow authenticated users to insert listings
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.marketplace_listings;
CREATE POLICY "Authenticated users can insert listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');


-- =====================================================
-- 3. FIX BUSINESS IDEAS TABLE
-- =====================================================

-- Ensure business_ideas policies are correct
DROP POLICY IF EXISTS "Users can view their own business ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can insert their own business ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can update their own business ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can delete their own business ideas" ON public.business_ideas;

CREATE POLICY "Users can view their own business ideas"
ON public.business_ideas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business ideas"
ON public.business_ideas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business ideas"
ON public.business_ideas
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business ideas"
ON public.business_ideas
FOR DELETE
USING (auth.uid() = user_id);


-- =====================================================
-- FIXES COMPLETE!
-- =====================================================
-- This should fix:
-- ✅ User signup/login
-- ✅ Automatic profile creation
-- ✅ Marketplace listings visibility
-- ✅ Business ideas access
-- =====================================================
