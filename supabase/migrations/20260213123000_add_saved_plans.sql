-- =====================================================
-- MIGRATION: Add Saved Business Plans Table
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
CREATE POLICY "Users can view their own saved plans"
ON public.saved_business_plans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved plans"
ON public.saved_business_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved plans"
ON public.saved_business_plans
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved plans"
ON public.saved_business_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_saved_business_plans_updated_at
BEFORE UPDATE ON public.saved_business_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
