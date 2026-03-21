-- =====================================================
-- COMPLETE MIGRATION SCRIPT - RUN ALL MIGRATIONS
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- MIGRATION 1: Initial Schema Setup
-- File: 20251228162146_047d11d0-2631-4cbd-8c78-2a794b8d16b5.sql
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create business_ideas table
CREATE TABLE IF NOT EXISTS public.business_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_range TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on business_ideas
ALTER TABLE public.business_ideas ENABLE ROW LEVEL SECURITY;

-- Business ideas policies
DROP POLICY IF EXISTS "Users can view their own business ideas" ON public.business_ideas;
CREATE POLICY "Users can view their own business ideas"
ON public.business_ideas
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own business ideas" ON public.business_ideas;
CREATE POLICY "Users can insert their own business ideas"
ON public.business_ideas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own business ideas" ON public.business_ideas;
CREATE POLICY "Users can update their own business ideas"
ON public.business_ideas
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own business ideas" ON public.business_ideas;
CREATE POLICY "Users can delete their own business ideas"
ON public.business_ideas
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_ideas_updated_at ON public.business_ideas;
CREATE TRIGGER update_business_ideas_updated_at
BEFORE UPDATE ON public.business_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- MIGRATION 2: Marketplace Listings
-- File: 20260102091624_2e562740-deb4-4690-838b-361a1424e09c.sql
-- =====================================================

-- Create marketplace listings table for buyers/exporters
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sell', 'buy', 'export')),
  price_range TEXT,
  quantity TEXT,
  location TEXT NOT NULL,
  contact_info TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active');

-- Users can insert their own listings
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.marketplace_listings;
CREATE POLICY "Users can insert their own listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;
CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own listings
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.marketplace_listings;
CREATE POLICY "Users can delete their own listings"
ON public.marketplace_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- MIGRATION 3: Suppliers Table with Dummy Data
-- File: 20260213012000_add_suppliers_table.sql
-- =====================================================

-- Create suppliers table for MSME/verified supplier data
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  enterprise_type TEXT NOT NULL CHECK (enterprise_type IN ('Micro', 'Small', 'Medium')),
  major_activity TEXT NOT NULL CHECK (major_activity IN ('Manufacturing', 'Services')),
  nic_code TEXT NOT NULL,
  production_commenced BOOLEAN NOT NULL DEFAULT true,
  registration_date DATE,
  social_category TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_suppliers_state ON public.suppliers(state);
CREATE INDEX IF NOT EXISTS idx_suppliers_district ON public.suppliers(district);
CREATE INDEX IF NOT EXISTS idx_suppliers_nic_code ON public.suppliers(nic_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_enterprise_type ON public.suppliers(enterprise_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_major_activity ON public.suppliers(major_activity);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Anyone can view suppliers (public data)
DROP POLICY IF EXISTS "Anyone can view suppliers" ON public.suppliers;
CREATE POLICY "Anyone can view suppliers"
ON public.suppliers
FOR SELECT
USING (true);

-- Only authenticated users can suggest new suppliers (for future feature)
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can insert suppliers"
ON public.suppliers
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert dummy supplier data
-- (Check if exists first to avoid duplicates or key errors, though ID is random so duplicates are possible if run twice. 
-- For simplicity, we assume this is okay or use ON CONFLICT DO NOTHING if we had a unique key. 
-- Since we don't have a unique constraint on name/district, we'll leave as is but wrapped in a DO block or just leave it.
-- Ideally we should clear old dummy data or check. Let's keep it simple.)
-- Better: DELETE FROM public.suppliers WHERE is_verified = true; -- Clear old verified suppliers before re-inserting
-- But that might be destructive. Let's assume re-running inserts duplicates which is bad.
-- Let's stick to just fixing Policies for now as that was the error.

INSERT INTO public.suppliers (enterprise_name, district, state, enterprise_type, major_activity, nic_code, production_commenced, registration_date, social_category, contact_phone, contact_email) 
SELECT * FROM (VALUES
-- Food & Beverages
('Shree Krishna Food Products', 'MUMBAI', 'MAHARASHTRA', 'Small', 'Manufacturing', '10712', true, '2022-03-15'::date, 'General', '+91 22 2345 6789', 'info@skfoodproducts.com'),
('Annapurna Spices & Masala', 'DELHI', 'DELHI', 'Micro', 'Manufacturing', '10751', true, '2021-08-20'::date, 'General', '+91 11 4567 8901', 'sales@annapurnaspices.in'),
('Fresh Valley Organic Foods', 'BANGALORE', 'KARNATAKA', 'Small', 'Manufacturing', '10320', true, '2023-01-10'::date, 'General', '+91 80 2234 5678', 'contact@freshvalley.co.in'),
('Golden Harvest Flour Mills', 'LUDHIANA', 'PUNJAB', 'Medium', 'Manufacturing', '10611', true, '2020-05-12'::date, 'General', '+91 161 234 5678', 'info@goldenharvest.com'),
('Dairy Fresh Products Ltd', 'PUNE', 'MAHARASHTRA', 'Small', 'Manufacturing', '10501', true, '2021-11-25'::date, 'General', '+91 20 3456 7890', 'orders@dairyfresh.in'),

-- Textiles & Clothing
('Rajasthan Handloom Exports', 'JAIPUR', 'RAJASTHAN', 'Small', 'Manufacturing', '13201', true, '2019-07-18'::date, 'General', '+91 141 234 5678', 'export@rajhandloom.com'),
('Cotton Craft Textiles', 'COIMBATORE', 'TAMIL NADU', 'Medium', 'Manufacturing', '13101', true, '2018-03-22'::date, 'General', '+91 422 345 6789', 'sales@cottoncraft.co.in'),
('Fashion Forward Garments', 'SURAT', 'GUJARAT', 'Small', 'Manufacturing', '14101', true, '2022-09-05'::date, 'General', '+91 261 456 7890', 'info@fashionforward.in'),

-- Electronics & Technology
('TechVision Electronics', 'NOIDA', 'UTTAR PRADESH', 'Small', 'Manufacturing', '26401', true, '2021-06-14'::date, 'General', '+91 120 567 8901', 'contact@techvision.in'),
('Smart Components India', 'CHENNAI', 'TAMIL NADU', 'Medium', 'Manufacturing', '26110', true, '2020-02-28'::date, 'General', '+91 44 2345 6789', 'sales@smartcomponents.co.in'),

-- Agriculture & Raw Materials
('Green Fields Agro Suppliers', 'NASHIK', 'MAHARASHTRA', 'Micro', 'Services', '01110', true, '2022-04-10'::date, 'General', '+91 253 234 5678', 'info@greenfields.in'),
('Organic Harvest Co-operative', 'INDORE', 'MADHYA PRADESH', 'Small', 'Services', '01130', true, '2021-12-05'::date, 'General', '+91 731 345 6789', 'contact@organicharvest.co.in'),

-- Packaging & Industrial
('EcoPack Solutions', 'AHMEDABAD', 'GUJARAT', 'Small', 'Manufacturing', '17021', true, '2023-02-18'::date, 'General', '+91 79 4567 8901', 'sales@ecopack.in'),
('Prime Plastic Industries', 'KOLKATA', 'WEST BENGAL', 'Medium', 'Manufacturing', '22201', true, '2019-10-30'::date, 'General', '+91 33 2345 6789', 'info@primeplastic.com'),

-- Export Partners
('Global Trade Solutions', 'MUMBAI', 'MAHARASHTRA', 'Small', 'Services', '46900', true, '2020-08-15'::date, 'General', '+91 22 6789 0123', 'export@globaltradesolutions.in'),
('India Export Hub', 'DELHI', 'DELHI', 'Medium', 'Services', '52291', true, '2018-11-20'::date, 'General', '+91 11 5678 9012', 'contact@indiaexporthub.com'),

-- Handicrafts & Artisan
('Heritage Handicrafts', 'VARANASI', 'UTTAR PRADESH', 'Micro', 'Manufacturing', '32120', true, '2021-05-08'::date, 'OBC', '+91 542 234 5678', 'sales@heritagehandicrafts.in'),
('Artisan Collective India', 'JAIPUR', 'RAJASTHAN', 'Small', 'Manufacturing', '31091', true, '2022-07-22'::date, 'General', '+91 141 345 6789', 'info@artisancollective.co.in'),

-- Health & Beauty
('Ayurvedic Wellness Products', 'KOCHI', 'KERALA', 'Small', 'Manufacturing', '21001', true, '2020-12-10'::date, 'General', '+91 484 456 7890', 'contact@ayurvedicwellness.in'),
('Natural Beauty Cosmetics', 'HYDERABAD', 'TELANGANA', 'Micro', 'Manufacturing', '20423', true, '2023-03-15'::date, 'General', '+91 40 2345 6789', 'sales@naturalbeauty.co.in')
) AS v(enterprise_name, district, state, enterprise_type, major_activity, nic_code, production_commenced, registration_date, social_category, contact_phone, contact_email)
WHERE NOT EXISTS (
    SELECT 1 FROM public.suppliers WHERE enterprise_name = v.enterprise_name
);

-- =====================================================
-- MIGRATION 4: Saved Business Plans
-- File: 20260213123000_add_saved_plans.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS public.saved_business_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  user_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  business_idea JSONB NOT NULL DEFAULT '{}'::jsonb,
  business_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_business_plans ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own saved plans" ON public.saved_business_plans;
CREATE POLICY "Users can view their own saved plans"
ON public.saved_business_plans
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved plans" ON public.saved_business_plans;
CREATE POLICY "Users can insert their own saved plans"
ON public.saved_business_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved plans" ON public.saved_business_plans;
CREATE POLICY "Users can update their own saved plans"
ON public.saved_business_plans
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved plans" ON public.saved_business_plans;
CREATE POLICY "Users can delete their own saved plans"
ON public.saved_business_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger
DROP TRIGGER IF EXISTS update_saved_business_plans_updated_at ON public.saved_business_plans;
CREATE TRIGGER update_saved_business_plans_updated_at
BEFORE UPDATE ON public.saved_business_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- You should now have:
-- ✅ profiles table
-- ✅ business_ideas table
-- ✅ marketplace_listings table
-- ✅ suppliers table with 20 dummy suppliers
-- ✅ All RLS policies enabled
-- ✅ All triggers configured
-- =====================================================
