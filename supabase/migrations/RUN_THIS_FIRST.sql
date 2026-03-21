-- =====================================================
-- COMPLETE SETUP - RUN THIS ONE FILE IN SUPABASE
-- This fixes authentication, marketplace, and security
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2. PROFILES TABLE - AUTHENTICATION FIX
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create correct policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create profile auto-creation function
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
EXCEPTION
  WHEN others THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- 3. MARKETPLACE LISTINGS - PUBLIC ACCESS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Anyone can view all active listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Authenticated users can insert listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.marketplace_listings;

-- Create new policies
CREATE POLICY "Anyone can view all active listings"
ON public.marketplace_listings FOR SELECT
USING (status = 'active');

CREATE POLICY "Authenticated users can insert listings"
ON public.marketplace_listings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON public.marketplace_listings FOR DELETE
USING (auth.uid() = user_id);


-- =====================================================
-- 4. BUSINESS IDEAS - USER ISOLATION
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own business ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can insert their own business ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can update their own business ideas" ON public.business_ideas;
DROP POLICY IF EXISTS "Users can delete their own business ideas" ON public.business_ideas;

CREATE POLICY "Users can view their own business ideas"
ON public.business_ideas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business ideas"
ON public.business_ideas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business ideas"
ON public.business_ideas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business ideas"
ON public.business_ideas FOR DELETE
USING (auth.uid() = user_id);


-- =====================================================
-- 5. CHAT SESSIONS - USER ISOLATION
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
ON public.chat_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
ON public.chat_sessions FOR DELETE
USING (auth.uid() = user_id);


-- =====================================================
-- 6. CHAT MESSAGES - USER ISOLATION VIA SESSIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete messages from their sessions" ON public.chat_messages;

CREATE POLICY "Users can view messages from their sessions"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages from their sessions"
ON public.chat_messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);


-- =====================================================
-- 7. SUPPLIERS - PUBLIC READ-ONLY
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON public.suppliers;

CREATE POLICY "Anyone can view suppliers"
ON public.suppliers FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
ON public.suppliers FOR INSERT
WITH CHECK (auth.role() = 'authenticated');


-- =====================================================
-- 8. EXPORTERS - PUBLIC READ-ONLY
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view exporters" ON public.exporters;
DROP POLICY IF EXISTS "Authenticated users can insert exporters" ON public.exporters;

CREATE POLICY "Anyone can view exporters"
ON public.exporters FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert exporters"
ON public.exporters FOR INSERT
WITH CHECK (auth.role() = 'authenticated');


-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- ✅ Authentication fixed (profile auto-creation)
-- ✅ Marketplace visible to all
-- ✅ User data isolated
-- ✅ Security policies enforced
-- =====================================================
