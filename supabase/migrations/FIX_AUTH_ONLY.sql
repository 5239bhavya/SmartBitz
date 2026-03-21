-- =====================================================
-- FINAL FIX FOR AUTH (Only what's needed)
-- Run this to fix authentication issues
-- =====================================================

-- =====================================================
-- FIX PROFILES TABLE (for authentication)
-- =====================================================

-- Drop existing policies if they exist
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
-- FIX MARKETPLACE LISTINGS (if not already done)
-- =====================================================

-- Only update if the policy doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'marketplace_listings' 
    AND policyname = 'Authenticated users can insert listings'
  ) THEN
    CREATE POLICY "Authenticated users can insert listings"
    ON public.marketplace_listings
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;


-- =====================================================
-- AUTH FIX COMPLETE!
-- =====================================================
-- This should fix:
-- ✅ User signup/login
-- ✅ Automatic profile creation
-- ✅ Marketplace listings already fixed
-- =====================================================
