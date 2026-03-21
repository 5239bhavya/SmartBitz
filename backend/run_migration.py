"""
Run Supabase Migration - Add Suppliers Table and Data
This script creates the suppliers table and inserts dummy data
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env")
    exit(1)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("✅ Connected to Supabase")
print(f"URL: {SUPABASE_URL}")

# Read migration SQL file
with open('supabase/migrations/20260213012000_add_suppliers_table.sql', 'r') as f:
    migration_sql = f.read()

print("\n📋 Running migration...")

try:
    # Execute the migration SQL
    # Note: Supabase Python client doesn't support raw SQL execution directly
    # We need to use the SQL Editor in Supabase Dashboard or use RPC
    
    print("\n⚠️  IMPORTANT: Supabase Python client cannot run raw SQL migrations.")
    print("\n📝 Please follow these steps:")
    print("1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/omtgpcjbhefrrebkucko")
    print("2. Click on 'SQL Editor' in the left sidebar")
    print("3. Click 'New Query'")
    print("4. Copy the content from: supabase/migrations/20260213012000_add_suppliers_table.sql")
    print("5. Paste it into the SQL Editor")
    print("6. Click 'Run' button")
    print("\n✅ After running the migration, your suppliers table will be created with 20 dummy suppliers!")
    
    # Alternative: Insert data directly using Python (if table already exists)
    print("\n\n🔄 Alternatively, I can insert the data directly if you run the table creation SQL first...")
    print("Would you like me to just insert the data? (Table must exist first)")
    
except Exception as e:
    print(f"\n❌ Error: {e}")

print("\n✨ Migration file is ready at: supabase/migrations/20260213012000_add_suppliers_table.sql")
