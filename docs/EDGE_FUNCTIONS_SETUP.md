# Supabase Edge Functions Setup Guide

## Issue

The Edge Function `generate-business-plan` is returning a non-2xx status code because it cannot access the required API keys.

## Solution

### For Local Development (Supabase CLI)

1. **Environment Variables File Created**
   - Created `supabase/.env.local` with your `OPENROUTER_API_KEY`
   - This file is used by Supabase CLI when running Edge Functions locally

2. **Start Supabase Locally** (if you want to test Edge Functions locally)
   ```bash
   cd supabase
   supabase start
   supabase functions serve
   ```

### For Production (Supabase Cloud)

If you're using Supabase Cloud (hosted), you need to set environment variables in your Supabase project dashboard:

1. Go to: https://supabase.com/dashboard/project/omtgpcjbhefrrebkucko/settings/functions
2. Click on "Edge Functions" in the sidebar
3. Click "Add new secret"
4. Add the following secret:
   - Name: `OPENROUTER_API_KEY`
   - Value: `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`

5. Deploy your Edge Functions:
   ```bash
   supabase functions deploy generate-business-plan
   supabase functions deploy generate-recommendations
   supabase functions deploy get-suppliers
   supabase functions deploy suggest-ideas
   ```

## Current Status

Your Edge Functions are configured to use:

- **Primary**: `LOVABLE_API_KEY` (if available)
- **Fallback**: `OPENROUTER_API_KEY` (currently configured)

The model being used is: `meta-llama/llama-3.1-8b-instruct`

## Testing

After setting up the environment variables, test the Edge Function:

```bash
# Test locally
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-business-plan' \
  --header 'Content-Type: application/json' \
  --data '{"userProfile":{"budget":"100000","city":"Mumbai","interest":"Food","experience":"beginner"},"selectedBusiness":{"name":"Test Business","description":"Test","investmentRange":"1L-2L","expectedRevenue":"5L","profitMargin":"20%","riskLevel":"Low","breakEvenTime":"6 months","icon":"🍔"}}'
```

## Alternative: Use Flask Backend Instead

If you prefer not to use Edge Functions, you can switch to the Flask backend by uncommenting the Flask endpoint code in `BusinessPlanPage.tsx` (lines 87-108).
