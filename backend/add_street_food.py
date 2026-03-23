import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing Supabase credentials")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

try:
    print("Inserting Business Definition...")
    # 1. Add Business Definition
    b_res = supabase.table("business_definitions").insert({
        "name": "Street Food Stall",
        "description": "Small-scale food retail like Pani Puri, Vada Pav, and local snacks.",
        "industry": "Food & Beverage"
    }).execute()
    business_id = b_res.data[0]['id']
    print(f"Created Business: Street Food Stall ({business_id})")

    # 2. Add Raw Materials
    materials = [
        {"name": "Puri (Packet of 100)", "unit": "packet", "avg_cost_per_unit": 35.00, "category": "Groceries"},
        {"name": "Potatoes", "unit": "kg", "avg_cost_per_unit": 25.00, "category": "Vegetables"},
        {"name": "Tamarind", "unit": "kg", "avg_cost_per_unit": 120.00, "category": "Spices"},
        {"name": "Mint Leaves", "unit": "bunch", "avg_cost_per_unit": 10.00, "category": "Vegetables"},
        {"name": "Pav (Bread set of 6)", "unit": "packet", "avg_cost_per_unit": 30.00, "category": "Bakery"},
        {"name": "Besan (Gram Flour)", "unit": "kg", "avg_cost_per_unit": 80.00, "category": "Groceries"},
        {"name": "Cooking Oil", "unit": "liter", "avg_cost_per_unit": 140.00, "category": "Groceries"}
    ]
    
    mat_ids = {}
    print("Inserting Raw Materials...")
    for m in materials:
        # Check if exists first
        existing = supabase.table("raw_materials").select("id").eq("name", m["name"]).execute()
        if existing.data:
            mat_ids[m["name"]] = existing.data[0]['id']
        else:
            res = supabase.table("raw_materials").insert(m).execute()
            mat_ids[m["name"]] = res.data[0]['id']

    print("Inserting Products...")
    # 3. Add Products
    p_res1 = supabase.table("products").insert({
        "business_id": business_id,
        "name": "Pani Puri Plate (6 pcs)",
        "description": "Spicy and tangy water balls filled with potato masala.",
        "avg_selling_price": 30.00
    }).execute()
    pani_puri_id = p_res1.data[0]['id']

    p_res2 = supabase.table("products").insert({
        "business_id": business_id,
        "name": "Vada Pav",
        "description": "Spicy potato dumpling inside a bread bun.",
        "avg_selling_price": 20.00
    }).execute()
    vada_pav_id = p_res2.data[0]['id']

    print("Mapping Products to Materials...")
    # 4. Map Product to Materials (Recipe)
    recipes = [
        # Pani Puri: 0.06 packet of puri, 0.05kg potato, 0.01kg tamarind, 0.1 bunch mint
        {"product_id": pani_puri_id, "material_id": mat_ids["Puri (Packet of 100)"], "quantity_required": 0.06},
        {"product_id": pani_puri_id, "material_id": mat_ids["Potatoes"], "quantity_required": 0.05},
        {"product_id": pani_puri_id, "material_id": mat_ids["Tamarind"], "quantity_required": 0.01},
        {"product_id": pani_puri_id, "material_id": mat_ids["Mint Leaves"], "quantity_required": 0.1},
        
        # Vada Pav: 0.16 packet of pav (1 piece), 0.08kg potato, 0.02kg besan, 0.02L oil
        {"product_id": vada_pav_id, "material_id": mat_ids["Pav (Bread set of 6)"], "quantity_required": 0.16},
        {"product_id": vada_pav_id, "material_id": mat_ids["Potatoes"], "quantity_required": 0.08},
        {"product_id": vada_pav_id, "material_id": mat_ids["Besan (Gram Flour)"], "quantity_required": 0.02},
        {"product_id": vada_pav_id, "material_id": mat_ids["Cooking Oil"], "quantity_required": 0.02}
    ]

    for r in recipes:
        supabase.table("product_materials").insert(r).execute()

    print("✅ Successfully seeded Street Food products and materials!")

except Exception as e:
    print(f"❌ Error: {e}")
