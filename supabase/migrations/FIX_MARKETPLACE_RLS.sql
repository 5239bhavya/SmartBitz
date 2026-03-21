-- =====================================================
-- FIX MARKETPLACE LISTINGS RLS POLICY
-- Allow viewing all active listings (not just user's own)
-- =====================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;

-- Create new policy that allows viewing ALL active listings
CREATE POLICY "Anyone can view all active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active');

-- =====================================================
-- POLICY FIX COMPLETE!
-- =====================================================
-- Now all active marketplace listings will be visible
-- regardless of who created them
-- =====================================================
