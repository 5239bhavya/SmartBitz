-- =====================================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =====================================================
-- Adds a plan_id column to cash_flow so transactions
-- can be linked to a specific business plan.
-- Existing rows will have plan_id = NULL (global).
-- =====================================================

-- Add plan_id column (nullable — existing entries stay global)
ALTER TABLE public.cash_flow
  ADD COLUMN IF NOT EXISTS plan_id TEXT;

-- Index for fast plan-specific queries
CREATE INDEX IF NOT EXISTS idx_cashflow_plan
  ON public.cash_flow(user_id, plan_id);

-- Verify
SELECT 'plan_id column added to cash_flow ✅' AS status;
