"""
Check saved ads in Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment explicitly
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path, override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

try:
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # Get all ads
    response = client.table("plan_ads").select("*").order("created_at", desc=True).limit(5).execute()
    
    print(f"Total ads found: {len(response.data)}")
    for ad in response.data:
        print(f"- [{ad['created_at']}] Plan: {ad['plan_name']} | Type: {ad['ad_type']} | Headline: {ad['headline']}")
        
except Exception as e:
    print(f"Error: {e}")
