"""
Supabase Database Helper for Backend
Fetches supplier data from Supabase database
"""

import os
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # Use service key for backend

supabase_client: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("DEBUG: Supabase client initialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to initialize Supabase client: {e}")


def fetch_suppliers_from_db():
    """
    Fetch all suppliers from Supabase database
    Returns data in format compatible with existing AI agent
    """
    if not supabase_client:
        print("DEBUG: Supabase client not available, using dummy data")
        return None
    
    try:
        response = supabase_client.table('suppliers').select('*').execute()
        
        if not response.data:
            return None
        
        # Transform database format to API format expected by AI
        records = []
        for supplier in response.data:
            records.append({
                "EnterpriseName": supplier.get('enterprise_name'),
                "District": supplier.get('district'),
                "State": supplier.get('state'),
                "EnterpriseType": supplier.get('enterprise_type'),
                "MajorActivity": supplier.get('major_activity'),
                "NIC5DigitCode": supplier.get('nic_code'),
                "WhetherProdCommenced": "YES" if supplier.get('production_commenced') else "NO",
                "RegistrationDate": str(supplier.get('registration_date', '')),
                "social_category": supplier.get('social_category'),
                "contact_phone": supplier.get('contact_phone'),
                "contact_email": supplier.get('contact_email')
            })
        
        print(f"DEBUG: Fetched {len(records)} suppliers from database")
        return {"records": records}
        
    except Exception as e:
        print(f"ERROR: Failed to fetch suppliers from database: {e}")
        return None
