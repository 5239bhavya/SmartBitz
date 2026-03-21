# Database Migration Guide

## Quick Start

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Migration

1. Open the file: `supabase/migrations/20260214000000_add_new_features.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click "Run" button

### Step 3: Verify Tables Created

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'tracking_parameters',
  'market_research_links',
  'export_resources',
  'advertisement_templates',
  'social_media_accounts',
  'marketing_analytics',
  'budget_predictions'
)
ORDER BY table_name;
```

You should see 7 tables listed.

### Step 4: Verify Seed Data

Check market research links:

```sql
SELECT COUNT(*) as total_links FROM market_research_links;
```

Should return: 18 records

Check export resources:

```sql
SELECT COUNT(*) as total_resources FROM export_resources;
```

Should return: 15 records

## What This Migration Creates

### 7 New Tables:

1. ✅ **tracking_parameters** - User dashboard preferences
2. ✅ **market_research_links** - Government & verified research links (18 seed records)
3. ✅ **export_resources** - Export guidance & documentation (15 seed records)
4. ✅ **advertisement_templates** - AI-generated ad templates
5. ✅ **social_media_accounts** - User social media profiles
6. ✅ **marketing_analytics** - AI marketing insights
7. ✅ **budget_predictions** - AI budget analysis

### Security Features:

- ✅ Row-Level Security (RLS) enabled on all tables
- ✅ Policies ensure users can only access their own data
- ✅ Public data (market research, export resources) accessible to all
- ✅ Auto-updating timestamps on all tables

### Performance:

- ✅ Indexes on frequently queried columns
- ✅ Foreign key constraints for data integrity
- ✅ JSONB columns for flexible data storage

## Troubleshooting

### If you get "function update_updated_at_column() does not exist":

This means the base migration hasn't been run. First run:

```sql
-- From COMPLETE_MIGRATION.sql, lines 78-84
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then run the new features migration again.

### If you get "duplicate key value" errors:

The seed data already exists. This is safe to ignore, or you can run:

```sql
DELETE FROM market_research_links;
DELETE FROM export_resources;
```

Then run the migration again.

## Next Steps

Once the database migration is complete, notify me and I'll proceed with:

1. Backend API endpoints
2. Frontend components
3. Integration with existing features

---

**File Location**: `e:\Mini_project_Sem_6\startupdesk-main\supabase\migrations\20260214000000_add_new_features.sql`
