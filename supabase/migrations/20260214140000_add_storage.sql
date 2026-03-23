-- =====================================================
-- STORAGE & SCHEMA UPDATE
-- Migration: Create ad-creatives bucket and add image_url column
-- Date: 2026-02-14
-- =====================================================

-- 1. CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE STORAGE POLICIES
-- Policy to allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ad-creatives' );

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'ad-creatives' AND
    auth.role() = 'authenticated'
);

-- Policy to allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'ad-creatives' AND
    auth.uid() = owner
);

-- Policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'ad-creatives' AND
    auth.uid() = owner
);

-- 3. UPDATE PLAN_ADS TABLE
ALTER TABLE public.plan_ads 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. GRANT PERMISSIONS
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO service_role;
