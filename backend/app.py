import os
import re
import json
import base64
import logging
import traceback
import requests
import sys
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
from supabase_db import fetch_suppliers_from_db
from supabase import create_client, Client
from data.msme_dummy_data import MSME_DUMMY_DATA

# Rate limiting — install with: pip install flask-limiter
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    _limiter_available = True
except ImportError:
    _limiter_available = False
    print("WARNING: flask-limiter not installed. Rate limiting is DISABLED.")
    print("  Run: pip install flask-limiter   to enable it.")

# ===== CONFIG =====
# Load environment variables explicitly from parent directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname((__file__))), '.env')
if os.path.exists(dotenv_path):
    print(f"Loading .env from: {dotenv_path}")
    load_dotenv(dotenv_path, override=True)
else:
    print("WARNING: .env file not found in parent directory")
    load_dotenv() # Fallback to default behavior

app = Flask(__name__)
# Allow CORS securely instead of wildcard matching 
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# Initialize rate limiter (requires flask-limiter: pip install flask-limiter)
if _limiter_available:
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[],  # No blanket limit; per-route limits below
        storage_uri="memory://",
    )
    def rate_limit(limit_string):
        """Decorator factory for rate limiting individual routes."""
        return limiter.limit(limit_string)
else:
    import functools as _functools
    def rate_limit(_limit_string):  # type: ignore[misc]
        """No-op rate limit decorator when flask-limiter is not available."""
        def decorator(f):  # type: ignore[misc]
            @_functools.wraps(f)
            def wrapper(*args, **kwargs):  # type: ignore[misc]
                return f(*args, **kwargs)
            return wrapper
        return decorator

# ── BI Blueprint (non-breaking extension) ──
try:
    sys.path.insert(0, os.path.dirname(__file__))
    from routes.bi_routes import bi_bp
    app.register_blueprint(bi_bp)
    print("BI Blueprint registered at /api/bi/*")
except Exception as _bi_err:
    print(f"WARNING: BI Blueprint failed to load (non-critical): {_bi_err}")

# --- QUOTA PROTECTION: Mock Mode for testing ---
MOCK_AI = os.getenv("MOCK_AI", "False").lower() == "true"
print(f"DEBUG: MOCK_AI MODE: {MOCK_AI} (from env: {os.getenv('MOCK_AI')})")

# Groq Configuration (replaces OpenRouter — fast, free, OpenAI-compatible)
groq_api_key = os.getenv("GROQ_API_KEY")
client = OpenAI(
  base_url="https://api.groq.com/openai/v1",
  api_key=groq_api_key,
)


# Groq model name for llama 3.1 8B
MODEL_NAME = "llama-3.1-8b-instant"

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Configure logging
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend_debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_client: "Client | None" = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
else:
    logger.warning("Supabase credentials not found in environment")

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

# ===== STEP FLOW =====
STEP_FLOW = [
    "ASK_IDEA",
    "ASK_BUDGET",
    "ASK_LOCATION_PREFERENCE",
    "ASK_CUSTOM_LOCATION",
    "CONFIRM_LOCATION",
    "GENERATE_RECOMMENDATIONS",
    "RAW_MATERIALS",
    "SUPPLIER_GUIDANCE",
    "PRODUCT_PLANNING",
    "SELLING_GUIDE",
    "PRICING",
    "MARKETING",
    "GROWTH",
    "DASHBOARD_MODE"
]

# ===== GOVT DATA FETCH (data.gov.in) =====
def fetch_food_processing_msme():
    """
    Dataset:
    UDYAM Registration (MSME Registration) - List of MSME Registered Units
    Ministry of Micro, Small and Medium Enterprises
    
    Priority:
    1. Try Supabase database (if configured)
    2. Try government API (if key available)
    3. Fall back to dummy data
    """
    
    # PRIORITY 1: Try Supabase database first
    db_data = fetch_suppliers_from_db()
    if db_data:
        print("DEBUG: Using supplier data from Supabase database")
        return db_data
    
    # PRIORITY 2: Try real government API if key is available
    if DATA_GOV_API_KEY and DATA_GOV_API_KEY != "your_api_key_here":
        url = "https://api.data.gov.in/resource/2c1fd4a5-67c7-4672-a2c6-a0a76c2f00da"
        params = {
            "api-key": DATA_GOV_API_KEY,
            "format": "json",
            "limit": 50
        }
        try:
            r = requests.get(url, params=params, timeout=6)
            r.raise_for_status()
            print("DEBUG: Using supplier data from government API")
            return r.json()
        except Exception as e:
            print(f"DEBUG: Government API failed: {e}")
            pass  # Fall through to dummy data
    
    # PRIORITY 3: Fall back to comprehensive dummy data
    print("DEBUG: Using hardcoded dummy supplier data")
    return MSME_DUMMY_DATA


# ===== AI AGENT PROMPT =====
SMARTBIZ_AGENT_PROMPT = """
AGENT NAME:
SmartBiz AI – Intelligent Business Startup Advisor

AGENT ROLE:
You are a Senior AI Expert Consultant and professional business advisor with deep expertise in the Indian business ecosystem. You provide high-quality, practical, and detailed business advice. Your goal is to help entrepreneurs build successful businesses with zero error in planning.

CORE PHILOSOPHY:
- Every entrepreneur's time is valuable. Do not engage in meaningless small talk.
- If a user says "hi", "how are you", or anything non-business, politely acknowledge and immediately steer the conversation toward their business goals.
- Example: "I'm doing great! As your business consultant, I'm ready to help you plan your startup. What product or service are you planning to launch today?"

GUIDELINES FOR EXPERT ADVICE:
1.  **Professional Tone**: Use professional, encouraging, yet realistic language.
2.  **Product First**: Always prioritize understanding the core product or service the user wants to sell.
3.  **Location Context**: Always consider the specific city or area in India when providing advice on costs, suppliers, or marketing.
4.  **No Hallucination**: If you don't have specific data for a niche location or product, provide a high-quality framework for how the user can find that data.

--------------------------------------------------
OPERATING PREFERENCE: FREE-FLOWING CONVERSATION
--------------------------------------------------
- Answer directly and naturally.
- Capture business details (Product, Budget, Location) whenever the user mentions them.
- Set `step_completed`: true only if the user provides clear information for the current focus area.

JSON OUTPUT FORMAT (STRICT)
--------------------------------------------------
Your response MUST be valid JSON.
```json
{
  "reply": "Your natural, professional expert response here.",
  "extracted_info": {
    "ASK_IDEA": "Product/Business idea",
    "ASK_BUDGET": "Budget amount",
    "ASK_LOCATION_PREFERENCE": "City/Area"
  },
  "step_completed": true | false,
  "comparison_data": [] 
}
```

TONE & PERSONALITY:
- **Senior & Experienced**: You are the mentor they need.
- **Accurate & Reliable**: Minimize room for error in financial or strategic advice.
- **Supportive**: Encourage the entrepreneur while keeping them grounded.
"""

# ===== MAIN ENDPOINT =====
@app.route("/api/smartbiz-agent", methods=["POST"])
@rate_limit("10 per minute")
def smartbiz_agent():
    data = request.json or {}
    user_message = data.get("message", "")
    state_input = data.get("state")

    # State validation & parsing — always produce a canonical typed dict
    _raw_state: dict = {}
    if isinstance(state_input, str):
        try:
            _parsed = json.loads(state_input)
            if isinstance(_parsed, dict):
                _raw_state = _parsed
            else:
                return jsonify({"error": "Invalid state format: expected a JSON object"}), 400
        except Exception as e:
            return jsonify({"error": f"Invalid JSON state: {str(e)}"}), 400
    elif isinstance(state_input, dict):
        _raw_state = state_input
    elif state_input is not None:
        return jsonify({"error": "Invalid state format"}), 400

    # Build a clean, fully-typed state dict
    _step_index: int
    try:
        _step_index = int(_raw_state.get("step_index", 0))
    except (ValueError, TypeError):
        _step_index = 0
    _step_index = max(0, min(_step_index, len(STEP_FLOW) - 1))

    _answers_raw = _raw_state.get("answers", {})
    _answers: dict = _answers_raw if isinstance(_answers_raw, dict) else {}

    # Use plain typed variables going forward
    state_step_index: int = _step_index
    state_answers: dict = dict(_answers)  # force a plain dict copy

    current_step = STEP_FLOW[state_step_index]
    real_time_data = None

    # Fetch real-time data for advisory steps that need it
    if current_step in ["RAW_MATERIALS", "SUPPLIER_GUIDANCE", "SELLING_GUIDE"]:
        real_time_data = fetch_food_processing_msme()
        print(f"DEBUG: Fetched real_time_data for {current_step}")

    if MOCK_AI:
        # Simulated mentor response for testing UI/Flow
        print("--- RUNNING IN MOCK MODE (NO API COST) ---")
        mock_replies = {
            "ASK_IDEA": "That sounds like a great starting point! Before we dive in, what's your approximate budget for this business?",
            "ASK_BUDGET": "I see. Budgeting is crucial! Now, do you have a specific location or area in mind where you want to set things up?",
            "ASK_LOCATION_PREFERENCE": "Excellent! Location can make or break a business. Please tell me the exact city or area you're thinking of.",
            "ASK_CUSTOM_LOCATION": "Got it. Anand is a vibrant area! Should we proceed with this location or would you like to consider somewhere else?",
            "GENERATE_RECOMMENDATIONS": "Based on what you've told me, I have some great business ideas for you. Would you like to see them?",
            "SUPPLIER_GUIDANCE": "Great! I've found some officially registered suppliers from government data that might help you. These are verified MSME enterprises that could be potential suppliers or partners for your business.",
        }
        reply_text = mock_replies.get(current_step, f"I've noted that. Let's move to the next phase: {current_step}. Ready?")
        
        # Add mock comparison data for supplier-related steps
        mock_comparison_data = []
        mock_recommendations = []
        
        if current_step == "GENERATE_RECOMMENDATIONS":
            mock_recommendations = [
                {
                    "id": "mock-1",
                    "name": "Organic Cafe",
                    "description": "A cozy cafe serving organic snacks and beverages.",
                    "investmentRange": "₹4,00,000 - ₹6,00,000",
                    "expectedRevenue": "₹80,000/month",
                    "profitMargin": "20-30%",
                    "riskLevel": "Medium",
                    "breakEvenTime": "8-12 months",
                    "icon": "☕"
                }
            ]

        if current_step in ["RAW_MATERIALS", "SUPPLIER_GUIDANCE", "SELLING_GUIDE"]:
            mock_comparison_data = [
                {
                    "name": "Devani Reverence India",
                    "location": "GHAZIABAD, UTTAR PRADESH",
                    "type": "Micro",
                    "activity": "Manufacturing",
                    "status": "Active",
                    "price": "Approx ₹55/kg",
                    "contact": "Dist: GHAZIABAD"
                }
            ]
        
        if user_message:
            state_answers[current_step] = user_message
            # Simple mock increment
            state_step_index = min(state_step_index + 1, len(STEP_FLOW) - 1)
            
        # Rebuild state dict for response
        out_state = {"step_index": state_step_index, "answers": state_answers}
        return jsonify({
            "reply": reply_text, 
            "state": out_state, 
            "comparison_data": mock_comparison_data,
            "recommendations": mock_recommendations
        })

    # Default fallback
    reply_text = "I'm having a little trouble connecting to my brain right now, but don't worry! Could you try again in a moment?"
    extracted_info = {}
    comparison_data = []

    # Build prompt
    prompt = f"""
SYSTEM_PROMPT:
{SMARTBIZ_AGENT_PROMPT}

CURRENT_STEP:
{current_step}

USER_LATEST_MESSAGE:
"{user_message}"

USER_PREVIOUS_ANSWERS:
{state_answers}

REAL_TIME_DATA:
{real_time_data}
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "system", "content": prompt}],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        content = chat_completion.choices[0].message.content.strip()
        
        import json
        import re
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        
        recommendations = []
        
        if json_match:
            ai_data = json.loads(json_match.group(0))
            print(f"DEBUG: AI Output JSON for {current_step}: {ai_data}")
            reply_text = ai_data.get("reply", "")
            extracted_info = ai_data.get("extracted_info", {})
            comparison_data = ai_data.get("comparison_data", [])
            step_completed = ai_data.get("step_completed", False)
            
            # Save message to answers if not extracted but detected as completed
            if user_message and current_step not in extracted_info and step_completed:
                state_answers[current_step] = user_message
                
            # Update state with all extracted keys
            for step, val in extracted_info.items():
                if step in STEP_FLOW:
                    state_answers[str(step)] = val  # type: ignore[index]
                    
            # Logic to generate recommendations if we reached that step and user confirmed
            # Or if the AI thinks we are there.
            # We must be careful: if the user just answered "CONFIRM_LOCATION", the NEXT step is GENERATE_RECOMMENDATIONS.
            # So if step_completed is YES for CONFIRM_LOCATION, we increment step.
            # Then if the NEW step is GENERATE_RECOMMENDATIONS, we should generate them.
            
            should_advance: bool = bool(step_completed)
            
            # Advance step_index past already answered steps
            while should_advance and state_step_index < len(STEP_FLOW) - 1:
                # Store current step as answered if not already
                if current_step not in state_answers and user_message:
                     state_answers[current_step] = user_message

                state_step_index += 1
                next_step_name = STEP_FLOW[state_step_index]
                
                # If we just landed on GENERATE_RECOMMENDATIONS, generate them!
                if next_step_name == "GENERATE_RECOMMENDATIONS":
                    # Generate recommendations using user profile
                    user_profile = {
                        "budget": state_answers.get("ASK_BUDGET", "500000"),
                        "city": state_answers.get("ASK_CUSTOM_LOCATION") or state_answers.get("ASK_LOCATION_PREFERENCE") or "India",
                        "interest": state_answers.get("ASK_IDEA", "General Business"),
                        "experience": "Beginner" # Default
                    }
                    recommendations = _generate_recommendations_logic(user_profile)
                    should_advance = False 
                    break

                if next_step_name in state_answers:
                    # Skip if already answered
                    continue
                else:
                    break
        else:
            # Fallback if not JSON
            reply_text = content
            if user_message:
                state_answers[current_step] = user_message
            state_step_index = min(state_step_index + 1, len(STEP_FLOW) - 1)

    except Exception as e:
        print(f"ERROR in smartbiz_agent: {str(e)}")
        # Check if it was a rate limit error to provide better feedback
        if "rate_limit" in str(e).lower():
            reply_text = "I've been talking a bit too much today and hit my daily limit! I need a short break. Please try again soon or switch to Mock Mode in settings."
        
    out_state = {"step_index": state_step_index, "answers": state_answers}
    return jsonify({
        "reply": reply_text,
        "state": out_state,
        "comparison_data": comparison_data,
        "recommendations": recommendations or []
    })

# ===== MARKETPLACE ENDPOINTS =====
def map_nic_to_category(nic_code_2_digit):
    """
    Maps NIC 2 Digit Code to Frontend Categories.
    Based on NIC 2008 Classification.
    """
    # Map of NIC 2-digit -> Category
    # Reference: http://mospi.nic.in/classification/national-industrial-classification
    
    code = str(nic_code_2_digit).strip()
    
    # Food & Beverages: 10, 11, 12
    if code in ["10", "11", "12"]: return "Food & Beverages"
    
    # Clothing & Textiles: 13, 14, 15
    if code in ["13", "14", "15"]: return "Clothing & Textiles"
    
    # Electronics: 26, 27
    if code in ["26", "27"]: return "Electronics"
    
    # Agriculture: 01, 02, 03
    if code in ["01", "02", "03"]: return "Agriculture"
    
    # Industrial: 
    # 16-18 (Wood, Paper)
    # 19-23 (Petroleum, Chemicals, Pharma, Rubber, Plastic)
    # 24-25 (Metals)
    # 28 (Machinery)
    # 29-30 (Transport)
    # 33 (Repair), 35-39 (Utilities/Waste Management/Remediation) - Map to Industrial
    if code in ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "28", "29", "30", "33", "35", "36", "37", "38", "39"]: return "Industrial"
    
    # Health & Beauty specific override if needed, but 20/21 cover chemicals/pharma which are often industrial.
    # Let's map 21 (Pharma) to Health & Beauty
    if code == "21": return "Health & Beauty"
    
    # Handicrafts: 31 (Furniture), 32 (Other manufacturing)
    if code in ["31", "32"]: return "Handicrafts"
    
    # Services Range (45-99)
    try:
        code_int = int(code)
        if code_int >= 45: return "Services"
        if 10 <= code_int <= 33: return "Industrial" # Fallback for unmapped manufacturing
    except:
        pass
    
    return "Other"

@app.route("/api/marketplace/gov-listings", methods=["GET"])
def get_gov_listings():
    """
    Fetches verified MSME listings from government data and formats them
    for the marketplace.
    """
    try:
        data = fetch_food_processing_msme()
        listings = []
        
        if data and "records" in data:
            for record in data["records"]:
                # Map MSME record to Marketplace Listing format
                # Generate a unique slugified ID from the Enterprise Name
                import re
                slug_name = re.sub(r'[^a-z0-9]', '-', record.get('EnterpriseName', 'enterprise').lower())
                listing_id = f"gov-{slug_name}"
                
                # Determine listing type based on activity
                activity = record.get("MajorActivity", "Services").upper()
                
                # Fix: The API key is likely 'NIC5DigitCode' or similar. 
                # We need to handle potential case variations and extraction.
                # Example value might be "10712" or "10 - Food..." or "1) 77291"
                raw_nic = str(record.get("NIC5DigitCode", record.get("nic_5_digit_code", ""))).strip()
                
                # Extract code using Regex
                import re
                # Try to find a 5-digit code first (e.g., 77291 from "1) 77291")
                match = re.search(r'\b(\d{5})\b', raw_nic)
                if match:
                    nic_code_found: str = str(match.group(1))
                    nic_2_digit: str = nic_code_found[0:2]  # type: ignore[index]
                else:
                    # Fallback: look for exactly 2 digits if 5 not found (e.g., "10")
                    match_2 = re.search(r'\b(\d{2})\b', raw_nic)
                    if match_2:
                         nic_2_digit = match_2.group(1)
                    else:
                         nic_2_digit = "00"
                
                print(f"DEBUG: Enterprise={record.get('EnterpriseName')} | RawNIC={raw_nic} | 2Digit={nic_2_digit} | Act={activity}")
                
                mapped_category = map_nic_to_category(nic_2_digit)
                
                # STRICT LOGIC SPLIT based on mapped category
                # 1. Raw Materials (buy): Agriculture, Industrial, Chemicals, Petroleum...
                if mapped_category in ["Agriculture", "Industrial", "Chemicals"]:
                    listing_type = "buy" # Shows in "Raw Materials" tab
                    title_prefix = "Supplier: "
                    category = mapped_category
                    desc_text = f"Verified Industrial Supplier specializing in {mapped_category}. Reliable source for bulk procurement."
                
                # 2. Finished Goods (sell): Food, Textiles, Electronics, Handicrafts, Health & Beauty
                elif mapped_category in ["Food & Beverages", "Clothing & Textiles", "Electronics", "Handicrafts", "Health & Beauty"]:
                    listing_type = "sell" # Shows in "For Sale" tab
                    title_prefix = "Manufacturer: "
                    category = mapped_category
                    desc_text = f"Verified Factory & Manufacturer of {mapped_category}. Direct-from-source bulk production."
                
                # 3. Export Partners (export): Services
                else: 
                    listing_type = "export"
                    title_prefix = "Export Partner: "
                    category = mapped_category if mapped_category != "Other" else "Services"
                    desc_text = "Verified International Logistics & Trade Partner. Registered Export specialist."
                
                listings.append({
                    "id": listing_id,
                    "user_id": "gov_verified",
                    "title": f"{title_prefix}{record.get('EnterpriseName', 'Verified Enterprise')}",
                    "description": f"{desc_text} Registered under {record.get('social_category', 'General')} category. Location: {record.get('District', '')}.",
                    "category": category,
                    "listing_type": listing_type,
                    "price_range": "Contact for Quotes",
                    "quantity": "Bulk Available",
                    "location": f"{record.get('District', '')}, {record.get('State', '')}",
                    "contact_info": "Verified Government Record",
                    "status": "active",
                    "created_at": record.get("RegistrationDate", ""),
                    "is_gov_verified": True,
                    "debug_nic": f"{raw_nic}|{nic_2_digit}"
                })
                
        return jsonify(listings)
    except Exception as e:
        print(f"Error fetching gov listings: {e}")
        return jsonify([])

# ===== RECOMMENDATIONS ENDPOINT (Workaround for Supabase Edge Function) =====
@app.route("/api/recommendations", methods=["POST"])
@rate_limit("10 per minute")  # type: ignore[operator]
def generate_recommendations():
    """
    Generate business recommendations based on user profile.
    This is a temporary workaround while Supabase Edge Functions are being deployed.
    """
    try:
        data = request.json or {}
        user_profile = data.get("userProfile", {})
        
        if not user_profile:
            return jsonify({"error": "User profile is required"}), 400
            
        ideas = _generate_recommendations_logic(user_profile)
        return jsonify({"ideas": ideas})
        
    except Exception as e:
        print(f"ERROR in generate_recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def _generate_recommendations_logic(user_profile):
    """
    Internal helper logic to generate recommendations.
    Returns a list of idea objects.
    """
    budget = user_profile.get("budget", "")
    city = user_profile.get("city", "")
    interest = user_profile.get("interest", "")
    experience = user_profile.get("experience", "Beginner")
    
    system_prompt = """You are an expert business advisor specializing in small-scale businesses and startups in India. 
You provide practical, realistic advice for beginners with limited budgets.

RULES:
- Always give structured output with clear data
- Use practical, realistic advice based on Indian market conditions
- Avoid motivational or generic content
- Focus on small-scale, low-budget businesses
- Provide estimates and ranges, not exact numbers
- Use simple language for beginners
- Consider the user's budget, location, and interest area"""

    user_prompt = f"""Based on the following user profile, recommend exactly 3 realistic business ideas that match their budget and interests.

USER PROFILE:
- Budget: ₹{budget}
- City/Region: {city}
- Interest Area: {interest}
- Experience Level: {experience}

For each business idea, provide the following in valid JSON format:
{{
"ideas": [
    {{
    "id": "unique-id-lowercase",
    "name": "Business Name",
    "description": "Brief 1-2 sentence description",
    "investmentRange": "₹X,XX,XXX - ₹X,XX,XXX",
    "expectedRevenue": "₹X,XX,XXX - ₹X,XX,XXX/month",
    "profitMargin": "XX-XX%",
    "riskLevel": "Low" | "Medium" | "High",
    "breakEvenTime": "X-X months",
    "icon": "emoji representing the business"
    }}
]
}}

IMPORTANT:
- All ideas must be within the user's budget range
- Tailor recommendations to their interest area ({interest})
- Consider market conditions in {city}
- Adjust complexity based on experience level ({experience})
- Return ONLY valid JSON, no additional text"""

    # Call OpenRouter AI
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model=MODEL_NAME,
        response_format={"type": "json_object"}
    )
    
    content = chat_completion.choices[0].message.content.strip()
    print(f"DEBUG: AI response for recommendations: {content}")
    
    # Parse the JSON from the response
    import json
    import re
    json_match = re.search(r'\{[\s\S]*\}', content)
    if not json_match:
        raise ValueError("Failed to parse AI response as JSON")
    
    data = json.loads(json_match.group(0))
    return data.get("ideas", [])

# ===== NEW FEATURE ENDPOINTS =====

# ===== BUDGET PREDICTION HELPER FUNCTIONS =====

def _classify_product_cost(product: str, idea: str) -> str:
    """
    Classifies the product/idea into a cost category: 'low', 'medium', or 'high'.
    Uses signal-scoring on the combined text so it works for ANY product name or idea,
    not just pre-defined ones.
    """
    text = (product + " " + idea).lower()

    low_signals = [
        "street", "stall", "cart", "thela", "home", "homemade", "hand-made", "handmade",
        "small", "basic", "simple", "cheap", "affordable", "local", "daily",
        "snack", "tea", "chai", "puri", "pani puri", "sabji", "sabzi", "mithai",
        "pickle", "achar", "candle", "agarbatti", "incense", "flower", "fruit",
        "vegetable", "juice", "biscuit", "chaat", "momos", "dosa", "idli",
        "vada", "roti", "tiffin", "craft", "jute", "clay", "paper", "pooja",
        "ladoo", "halwa", "chikki", "murmura", "bhel", "sev", "papad",
        "masala", "spice", "herbs", "seeds", "dairy", "milk", "eggs",
        "tailoring", "stitching", "embroidery", "mehendi", "henna",
        "tiffin service", "food delivery", "home cook", "cloud kitchen"
    ]

    high_signals = [
        "pharma", "pharmaceutical", "export", "import", "factory", "industrial",
        "wholesale", "franchise", "international", "clinic", "hospital",
        "gym", "fitness center", "hotel", "resort", "tech", "software", "saas",
        "app", "platform", "electronics", "machinery", "automobile", "automotive",
        "construction", "real estate", "commercial", "large scale", "multi-branch",
        "laboratory", "lab", "medical", "diagnostic", "manufacturing plant",
        "cold storage", "logistics", "warehouse", "distribution", "supermarket",
        "mall", "multiplex", "it company", "startup", "enterprise", "b2b"
    ]

    low_score = sum(1 for s in low_signals if s in text)
    high_score = sum(1 for s in high_signals if s in text)

    if high_score > 0 and high_score >= low_score:
        return "high"
    if low_score > 0:
        return "low"
    return "medium"  # Safe default for any unknown product


def _detect_business_scale(idea: str) -> str:
    """
    Detects intended business scale ('small', 'medium', 'large') from the idea description.
    Uses signal-scoring so it works for any input text without pre-defined product matching.
    """
    text = idea.lower()

    small_signals = [
        "home", "small", "mini", "micro", "street", "stall", "cart", "thela",
        "solo", "part-time", "side", "beginner", "one person", "single",
        "low investment", "minimal", "basic setup", "start small", "hobby",
        "freelance", "self-employed", "own", "myself", "at home", "from home"
    ]

    large_signals = [
        "large", "multiple", "franchise", "commercial", "wholesale", "factory",
        "industrial", "export", "multi-city", "chain", "enterprise", "bulk",
        "expand", "scale up", "many employees", "team", "big", "huge",
        "nationwide", "pan india", "multi-location", "branches"
    ]

    small_score = sum(1 for s in small_signals if s in text)
    large_score = sum(1 for s in large_signals if s in text)

    if large_score > 0 and large_score >= small_score:
        return "large"
    if small_score > 0:
        return "small"
    return "medium"  # Safe default


def _get_location_multiplier(location: str) -> float:
    """
    Returns a cost multiplier based on city tier (Tier 1 / Tier 2 / Tier 3).
    Works by substring-matching city names in the location string.
    """
    loc = location.lower()

    tier1_cities = [
        "mumbai", "delhi", "new delhi", "bangalore", "bengaluru", "chennai",
        "kolkata", "pune", "hyderabad", "ahmedabad", "noida", "gurgaon", "gurugram"
    ]
    tier2_cities = [
        "jaipur", "surat", "lucknow", "kanpur", "nagpur", "indore", "bhopal",
        "patna", "agra", "vadodara", "ludhiana", "nashik", "coimbatore",
        "madurai", "mysore", "mysuru", "jabalpur", "raipur", "kochi", "cochin",
        "visakhapatnam", "vizag", "ranchi", "chandigarh", "amritsar", "varanasi",
        "aurangabad", "jodhpur", "guwahati", "thiruvananthapuram", "bhubaneswar"
    ]

    for city in tier1_cities:
        if city in loc:
            return 1.4  # Tier 1 — highest cost

    for city in tier2_cities:
        if city in loc:
            return 1.0  # Tier 2 — average cost

    return 0.75  # Tier 3 / rural / unknown — lowest cost


def _calculate_realistic_budget(product: str, idea: str, location: str) -> int:
    """
    Computes a realistic budget estimate using a weighted formula:
        budget = base_cost  x  scale_factor  x  location_multiplier

    Works for ANY product or idea — no hardcoded product names.
    Output is clamped between INR 15,000 and INR 50,00,000.
    """
    # Step 1: Classify inputs
    cost_category = _classify_product_cost(product, idea)
    scale = _detect_business_scale(idea)
    location_mult = _get_location_multiplier(location)

    # Step 2: Base budgets by product cost category (INR)
    base_costs = {
        "low": 40_000,
        "medium": 1_50_000,
        "high": 5_00_000
    }

    # Step 3: Scale multipliers
    scale_factors = {
        "small": 0.6,
        "medium": 1.0,
        "large": 2.5
    }

    base = base_costs.get(cost_category, 1_50_000)
    scale_factor = scale_factors.get(scale, 1.0)

    computed = int(base * scale_factor * location_mult)

    # Step 4: Clamp to a sane range
    MIN_BUDGET = 15_000       # Rs. 15,000 — absolute smallest startup
    MAX_BUDGET = 50_00_000    # Rs. 50 Lakh — reasonable upper limit for SME

    return max(MIN_BUDGET, min(computed, MAX_BUDGET))


# ===== BUDGET PREDICTION ENDPOINT =====
@app.route("/api/predict-budget", methods=["POST"])
def predict_budget():
    """
    Predicts required budget for a business idea using AI.
    Returns budget breakdown and feasibility analysis.
    """
    data = request.json or {}
    business_idea = data.get("idea", "")
    key_product = data.get("product", "")
    location = data.get("location", "Urban India")
    user_budget = data.get("user_budget")
    existing_prediction = data.get("existing_prediction") # Consistency fix
    
    if user_budget is not None:
        try:
            user_budget = int(user_budget)
        except (ValueError, TypeError):
            user_budget = 0

    if not business_idea and not key_product:
        return jsonify({"error": "Business idea or product is required"}), 400
    
    # Consistency Logic: If we already have a prediction, use it for feasibility
    if existing_prediction and user_budget is not None:
        predicted = int(existing_prediction)
        feasibility = _calculate_feasibility(predicted, user_budget)
        return jsonify({
            "predicted_budget": predicted,
            "feasibility": feasibility
        })

    if MOCK_AI:
        # Realistic mock response — uses signal-scoring helpers, works for any product
        predicted = _calculate_realistic_budget(key_product, business_idea, location)
        return jsonify({
            "predicted_budget": predicted,
            "budget_breakdown": {
                "infrastructure": round(predicted * 0.30),
                "equipment": round(predicted * 0.20),
                "inventory": round(predicted * 0.20),
                "marketing": round(predicted * 0.10),
                "licenses": round(predicted * 0.05),
                "working_capital": round(predicted * 0.15)
            },
            "feasibility": _calculate_feasibility(predicted, user_budget) if user_budget else {}
        })
    
    try:
        # Pre-compute a realistic reference budget using signal-scoring helpers.
        # This is used both as a hint in the AI prompt and as a sanity clamp on the AI's output.
        reference_budget = _calculate_realistic_budget(key_product, business_idea, location)
        min_hint = int(reference_budget * 0.5)   # Allow AI to go 50% below reference
        max_hint = int(reference_budget * 3.0)   # Allow AI to go 3x above reference

        system_prompt = """You are a Senior Financial Business Advisor specializing in the Indian startup market.
You provide balanced, realistic budget estimates for small and medium businesses in India.
Consider product type, business scale, and local cost of living when estimating.
Never over-estimate for small or home-based ideas. Never under-estimate for large commercial setups."""

        user_prompt = f"""Expert Budget Analysis Request:

BUSINESS OVERVIEW:
- Core Product: {key_product}
- Business Description: {business_idea}
- Location: {location}

BUDGET REFERENCE RANGE (based on product type and scale):
- Estimated range: ₹{min_hint:,} – ₹{max_hint:,}
- Use this range as a calibration guide. Adjust within this range based on local market costs.
- DO NOT exceed ₹{max_hint:,} unless the business clearly requires it.

Provide response in this STRICT JSON format:
{{
  "predicted_budget": <total amount in INR, must be a plain integer>,
  "budget_breakdown": {{
    "infrastructure": <rent, shop setup, interiors>,
    "equipment": <machines, tools, display units>,
    "inventory": <raw materials for first month>,
    "marketing": <branding, local ads, digital presence>,
    "licenses": <FSSAI, GST, Trade License, etc.>,
    "working_capital": <salary, utility, 3-month buffer>
  }},
  "business_type": "<industry category>",
  "expert_notes": "Brief expert advice on where to save costs in {location}"
}}
"""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )

        content = chat_completion.choices[0].message.content.strip()
        import json, re
        json_match = re.search(r'\{[\s\S]*\}', content)

        if json_match:
            ai_data = json.loads(json_match.group(0))
            ai_predicted = ai_data.get("predicted_budget", reference_budget)

            # Sanity clamp: if AI goes wildly out of the reasonable range, fall back to reference.
            # "Wildly out" = more than 10x above or less than 0.1x below the reference.
            if ai_predicted > reference_budget * 10:
                predicted = reference_budget  # AI was way too high
            elif ai_predicted < reference_budget * 0.1:
                predicted = reference_budget  # AI was way too low
            else:
                predicted = int(ai_predicted)  # AI value is within reasonable range — keep it

            return jsonify({
                "predicted_budget": predicted,
                "budget_breakdown": ai_data.get("budget_breakdown", {}),
                "business_type": ai_data.get("business_type", "General"),
                "expert_notes": ai_data.get("expert_notes", ""),
                "feasibility": _calculate_feasibility(predicted, user_budget) if user_budget else {}
            })

        return jsonify({"error": "Failed to parse AI response"}), 500
        
    except Exception as e:
        print(f"ERROR in predict_budget: {str(e)}")
        return jsonify({"error": "Budget prediction failed"}), 500

def _calculate_feasibility(predicted, user_budget):
    """Refined feasibility calculation logic with consistent gap reporting."""
    gap = predicted - user_budget
    if gap <= 0:
        return {
            "status": "feasible",
            "gap": 0,
            "optimization_suggestions": ["You have a strong budget! Consider investing in better equipment or a prime location."],
            "scaling_strategy": "Aggressive launch with high-decibel marketing."
        }
    
    percentage_gap = (gap / predicted) * 100
    
    if percentage_gap <= 20:
        return {
            "status": "feasible with adjustments",
            "gap": gap,
            "optimization_suggestions": [
                "Negotiate for lower security deposit on rent",
                "Buy refurbished equipment where possible",
                "Start with restricted inventory for the first month"
            ],
            "scaling_strategy": "Lean launch, reinvest profits immediately."
        }
    else:
        return {
            "status": "challenging",
            "gap": gap,
            "optimization_suggestions": [
                "Consider a home-based/cloud kitchen model initially",
                "Look for a smaller retail footprint",
                "Partner with existing vendors to reduce initial Capex",
                "Explore PMGEP or Mudra loans for the gap"
            ],
            "scaling_strategy": "Two-phase launch - start small, prove the concept, then seek funding for expansion."
        }



# ===== MARKET RESEARCH LINKS ENDPOINT =====
@app.route("/api/market-research", methods=["POST"])
def get_market_research():
    """
    Returns categorized market research links based on business type and location.
    Data comes from the database (seeded during migration).
    """
    data = request.json or {}
    business_type = data.get("business_type", "All")
    location = data.get("location", "India")
    
    # In a real implementation, this would query the Supabase database
    # For now, return structured data that frontend can use
    
    return jsonify({
        "links": [
            {
                "category": "government_schemes",
                "items": [
                    {"title": "MSME - Ministry of Micro, Small and Medium Enterprises", "url": "https://msme.gov.in/", "verified": True},
                    {"title": "Startup India", "url": "https://www.startupindia.gov.in/", "verified": True},
                    {"title": "DGFT - Directorate General of Foreign Trade", "url": "https://dgft.gov.in/", "verified": True},
                    {"title": "GeM - Government e-Marketplace", "url": "https://gem.gov.in/", "verified": True},
                    {"title": "Udyam Registration Portal", "url": "https://udyamregistration.gov.in/", "verified": True}
                ]
            },
            {
                "category": "market_trends",
                "items": [
                    {"title": "IBEF - India Brand Equity Foundation", "url": "https://www.ibef.org/", "verified": True},
                    {"title": "NITI Aayog", "url": "https://www.niti.gov.in/", "verified": True}
                ]
            },
            {
                "category": "product_research",
                "items": [
                    {"title": "CSIR - Council of Scientific & Industrial Research", "url": "https://www.csir.res.in/", "verified": True}
                ]
            },
            {
                "category": "industry_reports",
                "items": [
                    {"title": "Ministry of Commerce & Industry", "url": "https://commerce.gov.in/", "verified": True},
                    {"title": "RBI - Reserve Bank of India", "url": "https://www.rbi.org.in/", "verified": True}
                ]
            }
        ]
    })


# ===== RAW MATERIALS IDENTIFICATION ENDPOINT =====
@app.route("/api/identify-raw-materials", methods=["POST"])
def identify_raw_materials():
    """
    Uses AI to identify required raw materials based on business type.
    Returns materials list and supplier platform recommendations.
    """
    data = request.json or {}
    business_type = data.get("business_type", "")
    business_details = data.get("details", "")
    
    if not business_type:
        return jsonify({"error": "Business type is required"}), 400
    
    if MOCK_AI:
        return jsonify({
            "raw_materials": [
                {"name": "Flour", "specification": "Wheat flour, 50kg bags", "estimated_cost": "₹1,500-2,000 per bag"},
                {"name": "Sugar", "specification": "Refined sugar, 25kg bags", "estimated_cost": "₹1,000-1,200 per bag"},
                {"name": "Packaging Materials", "specification": "Food-grade boxes and bags", "estimated_cost": "₹5,000-10,000 monthly"}
            ],
            "supplier_platforms": [
                {"name": "IndiaMART", "url": "https://www.indiamart.com/", "type": "B2B Marketplace"},
                {"name": "TradeIndia", "url": "https://www.tradeindia.com/", "type": "B2B Marketplace"},
                {"name": "MSME Suppliers", "url": "/marketplace", "type": "Government Verified"}
            ]
        })
    
    try:
        system_prompt = """You are a supply chain expert for Indian businesses.
Identify raw materials needed for the business and provide realistic cost estimates."""

        user_prompt = f"""Identify raw materials needed for this business:

Business Type: {business_type}
Details: {business_details}

Provide response in JSON format:
{{
  "raw_materials": [
    {{
      "name": "Material name",
      "specification": "Details and quantity",
      "estimated_cost": "₹X,XXX - ₹X,XXX per unit"
    }}
  ]
}}

List 5-8 essential raw materials with realistic Indian market prices."""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        
        content = chat_completion.choices[0].message.content.strip()
        import json, re
        json_match = re.search(r'\{[\s\S]*\}', content)
        
        if json_match:
            ai_data = json.loads(json_match.group(0))
            return jsonify({
                "raw_materials": ai_data.get("raw_materials", []),
                "supplier_platforms": [
                    {"name": "IndiaMART", "url": "https://www.indiamart.com/", "type": "B2B Marketplace"},
                    {"name": "TradeIndia", "url": "https://www.tradeindia.com/", "type": "B2B Marketplace"},
                    {"name": "Alibaba India", "url": "https://www.alibaba.com/", "type": "International B2B"},
                    {"name": "MSME Suppliers", "url": "/marketplace", "type": "Government Verified"}
                ]
            })
        
        return jsonify({"error": "Failed to parse AI response"}), 500
        
    except Exception as e:
        print(f"ERROR in identify_raw_materials: {str(e)}")
        return jsonify({"error": "Raw material identification failed"}), 500


# ===== ADVERTISEMENT GENERATION ENDPOINT =====
@app.route("/api/generate-advertisements", methods=["POST"])
@rate_limit("10 per minute")  # type: ignore[operator]
def generate_advertisements():
    """
    Generates 2-3 advertisement templates with captions, hashtags, and posting strategy.
    """
    data = request.json or {}
    business_type = data.get("business_type", "")
    business_name = data.get("business_name", "")
    details = data.get("details", "")
    
    if not business_type:
        return jsonify({"error": "Business type is required"}), 400
    
    if MOCK_AI:
        return jsonify({
            "templates": [
                {
                    "id": "template-1",
                    "design_concept": "Modern minimalist with product showcase",
                    "caption": f"🎉 Introducing {business_name or 'Your Business'}! Quality products at affordable prices. Visit us today! 🛍️",
                    "hashtags": ["#NewBusiness", "#LocalBusiness", "#SmallBusiness", "#ShopLocal", "#SupportLocal"],
                    "target_audience": "Local community, age 25-45, interested in quality products",
                    "posting_schedule": "Monday & Thursday, 10:00 AM - 11:00 AM",
                    "platform": "Instagram & Facebook"
                },
                {
                    "id": "template-2",
                    "design_concept": "Vibrant colors with customer testimonials",
                    "caption": "💯 Join hundreds of happy customers! Limited time offer - 20% off on first purchase! 🎁",
                    "hashtags": ["#SpecialOffer", "#Discount", "#QualityProducts", "#CustomerFirst"],
                    "target_audience": "Deal seekers, age 20-50, value-conscious shoppers",
                    "posting_schedule": "Wednesday & Saturday, 6:00 PM - 7:00 PM",
                    "platform": "Instagram Stories & Posts"
                }
            ],
            "posting_strategy": {
                "frequency": "3-4 posts per week",
                "best_times": ["10:00 AM", "6:00 PM", "8:00 PM"],
                "content_mix": "60% product showcase, 30% customer stories, 10% behind-the-scenes"
            }
        })
    
    try:
        system_prompt = """You are a social media marketing expert specializing in small business advertising in India.
Create engaging, culturally relevant ad content that resonates with Indian audiences."""

        user_prompt = f"""Create 2-3 advertisement templates for this business:

Business Type: {business_type}
Business Name: {business_name}
Details: {details}

Provide response in JSON format:
{{
  "templates": [
    {{
      "id": "template-1",
      "design_concept": "Brief description of visual design",
      "caption": "Engaging caption text (50-100 words)",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "target_audience": "Description of ideal audience",
      "posting_schedule": "Best days and times",
      "platform": "Recommended platform"
    }}
  ],
  "posting_strategy": {{
    "frequency": "Posts per week",
    "best_times": ["time1", "time2"],
    "content_mix": "Percentage breakdown"
  }}
}}

Make captions engaging, use relevant emojis, and include Indian market context."""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        
        content = chat_completion.choices[0].message.content.strip()
        import json, re
        json_match = re.search(r'\{[\s\S]*\}', content)
        
        if json_match:
            ai_data = json.loads(json_match.group(0))
            return jsonify(ai_data)
        
        return jsonify({"error": "Failed to parse AI response"}), 500
        
    except Exception as e:
        print(f"ERROR in generate_advertisements: {str(e)}")
        return jsonify({"error": "Advertisement generation failed"}), 500


# ===== SOCIAL MEDIA ANALYTICS ENDPOINT =====
@app.route("/api/analyze-social-media", methods=["POST"])
def analyze_social_media():
    """
    Analyzes social media account and provides AI-powered marketing suggestions.
    """
    data = request.json or {}
    platform = data.get("platform", "")
    username = data.get("username", "")
    business_type = data.get("business_type", "")
    
    if not platform or not username:
        return jsonify({"error": "Platform and username are required"}), 400
    
    # Note: Real implementation would use social media APIs
    # For now, provide AI-generated suggestions based on business type
    
    if MOCK_AI:
        return jsonify({
            "posting_patterns": {
                "recommended_frequency": "4-5 posts per week",
                "best_times": ["10:00 AM", "2:00 PM", "7:00 PM"],
                "engagement_peak": "Evenings 6-9 PM",
                "top_content_types": ["Reels", "Carousel Posts", "Stories"]
            },
            "ai_suggestions": {
                "content_ideas": [
                    "Behind-the-scenes of your business operations",
                    "Customer testimonials and success stories",
                    "Product demonstrations and tutorials",
                    "Industry tips and educational content",
                    "Special offers and promotions"
                ],
                "hashtag_strategy": [
                    "Use 10-15 hashtags per post",
                    "Mix of popular and niche hashtags",
                    "Create a branded hashtag",
                    "Research competitor hashtags"
                ],
                "growth_tips": [
                    "Post consistently at optimal times",
                    "Engage with followers within 1 hour of posting",
                    "Collaborate with micro-influencers in your niche",
                    "Use Instagram Reels for maximum reach",
                    "Run targeted ads for local audience"
                ]
            },
            "weekly_strategy": {
                "monday": {"content": "Motivational post or week preview", "type": "Post", "time": "10:00 AM"},
                "tuesday": {"content": "Product showcase or tutorial", "type": "Reel", "time": "2:00 PM"},
                "wednesday": {"content": "Customer testimonial", "type": "Carousel", "time": "7:00 PM"},
                "thursday": {"content": "Behind-the-scenes", "type": "Story", "time": "6:00 PM"},
                "friday": {"content": "Weekend offer or promotion", "type": "Post", "time": "5:00 PM"},
                "saturday": {"content": "Engaging question or poll", "type": "Story", "time": "11:00 AM"},
                "sunday": {"content": "Week recap or community highlight", "type": "Carousel", "time": "8:00 PM"}
            }
        })
    
    try:
        system_prompt = """You are a social media growth strategist specializing in Indian small businesses.
Provide actionable, data-driven marketing strategies tailored to the Indian market."""

        user_prompt = f"""Analyze and provide marketing strategy for:

Platform: {platform}
Username: @{username}
Business Type: {business_type}

Provide response in JSON format:
{{
  "posting_patterns": {{
    "recommended_frequency": "X posts per week",
    "best_times": ["time1", "time2", "time3"],
    "engagement_peak": "Description",
    "top_content_types": ["type1", "type2", "type3"]
  }},
  "ai_suggestions": {{
    "content_ideas": ["idea1", "idea2", "idea3", "idea4", "idea5"],
    "hashtag_strategy": ["tip1", "tip2", "tip3"],
    "growth_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
  }},
  "weekly_strategy": {{
    "monday": {{"content": "...", "type": "Post/Reel/Story", "time": "HH:MM AM/PM"}},
    "tuesday": {{"content": "...", "type": "...", "time": "..."}},
    ...
  }}
}}

Focus on practical, achievable strategies for small businesses in India."""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        
        content = chat_completion.choices[0].message.content.strip()
        import json, re
        json_match = re.search(r'\{[\s\S]*\}', content)
        
        if json_match:
            ai_data = json.loads(json_match.group(0))
            return jsonify(ai_data)
        
        return jsonify({"error": "Failed to parse AI response"}), 500
        
    except Exception as e:
        print(f"ERROR in analyze_social_media: {str(e)}")
        return jsonify({"error": "Social media analysis failed"}), 500


# ===== BUSINESS NAME GENERATION ENDPOINT =====
@app.route("/api/generate-business-names", methods=["POST"])
def generate_business_names():
    """
    Generates creative business name suggestions based on business idea and industry.
    Returns categorized names with taglines.
    """
    data = request.json or {}
    business_idea = data.get("business_idea", "")
    industry = data.get("industry", "")
    
    if not business_idea and not industry:
        return jsonify({"error": "Business idea or industry is required"}), 400
    
    if MOCK_AI:
        return jsonify({
            "suggestions": [
                {
                    "name": "FreshBite Kitchen",
                    "category": "Professional",
                    "tagline": "Healthy meals delivered fresh to your door",
                    "domain_available": True
                },
                {
                    "name": "NutriNest",
                    "category": "Creative",
                    "tagline": "Your nest for nutritious living",
                    "domain_available": False
                },
                {
                    "name": "FlavorHub",
                    "category": "Trendy",
                    "tagline": "Where flavors meet convenience",
                    "domain_available": True
                },
                {
                    "name": "The Wellness Table",
                    "category": "Premium",
                    "tagline": "Elevated dining for health-conscious professionals",
                    "domain_available": True
                },
                {
                    "name": "GreenPlate Co.",
                    "category": "Professional",
                    "tagline": "Sustainable meals for modern lifestyles",
                    "domain_available": False
                }
            ]
        })
    
    try:
        system_prompt = """You are a creative branding expert specializing in Indian business naming.
Create memorable, unique business names that resonate with the target market.
Consider cultural relevance, pronunciation, and brand potential."""

        user_prompt = f"""Generate 5-10 unique business name suggestions for:

Business Idea: {business_idea}
Industry: {industry}

Provide response in JSON format:
{{
  "suggestions": [
    {{
      "name": "Business Name",
      "category": "Professional/Creative/Trendy/Premium",
      "tagline": "Short compelling tagline (8-12 words)",
      "domain_available": true/false (estimate)
    }}
  ]
}}

Requirements:
- Names should be memorable and easy to pronounce
- Mix different categories (Professional, Creative, Trendy, Premium)
- Taglines should capture the essence of the business
- Consider Indian market context
- Avoid generic or overused names"""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        
        content = chat_completion.choices[0].message.content.strip()
        import json, re
        json_match = re.search(r'\{[\s\S]*\}', content)
        
        if json_match:
            ai_data = json.loads(json_match.group(0))
            return jsonify(ai_data)
        
        return jsonify({"error": "Failed to parse AI response"}), 500
        
    except Exception as e:
        print(f"ERROR in generate_business_names: {str(e)}")
        return jsonify({"error": "Business name generation failed"}), 500


# ===== CHAT TITLE GENERATION ENDPOINT =====
@app.route("/api/generate-chat-title", methods=["POST"])
def generate_chat_title():
    """
    Generates a contextual chat title based on first few messages.
    """
    data = request.json or {}
    messages = data.get("messages", "")
    
    if not messages:
        return jsonify({"title": "New Conversation"})
    
    if MOCK_AI:
        return jsonify({"title": "Business Startup Planning"})
    
    try:
        system_prompt = """You are a chat title generator. Create short, descriptive titles (3-6 words) for business conversations."""

        # Convert messages to string for safe slicing
        messages_str: str = str(messages) if not isinstance(messages, str) else messages
        messages_preview: str = messages_str[:500]  # type: ignore[assignment]
        user_prompt = f"""Based on these conversation messages, generate a short, descriptive title (3-6 words max):

Messages: {messages_preview}  

Return ONLY the title, nothing else. Examples:
- "Bakery Startup Planning"
- "Organic Farming Budget Strategy"
- "Clothing Brand Marketing Plan"
"""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME
        )
        
        title = chat_completion.choices[0].message.content.strip()
        # Remove quotes if present
        title = title.strip('"').strip("'")
        
        return jsonify({"title": title})
        
    except Exception as e:
        print(f"ERROR in generate_chat_title: {str(e)}")
        return jsonify({"title": "New Conversation"})


# ===== NEW FEATURES ENDPOINTS =====

# 1. GENERATE AD POSTS ENDPOINT
@app.route("/api/generate-ad-posts", methods=["POST"])
@rate_limit("10 per minute")  # type: ignore[operator]
def generate_ad_posts():
    """
    Generates 2-3 AI-powered social media ad posts for marketing.
    """
    data = request.json or {}
    business_name = data.get("business_name", "Your Business")
    business_type = data.get("business_type", "General")
    target_audience = data.get("target_audience", "General Public")
    tone = data.get("tone", "Professional")
    
    if MOCK_AI:
        return jsonify({
            "ads": [
                {
                    "type": "Promotional Launch",
                    "headline": f"Grand Opening of {business_name}!",
                    "caption": f"We are excited to bring you the best {business_type} in town. Quality. Trust. Excellence.",
                    "cta": "Visit us today!",
                    "hashtags": "#NewBusiness #StartupIndia #Quality",
                    "suggested_time": "9:00 AM - 11:00 AM (Peak engagement)"
                },
                {
                    "type": "Problem-Solution",
                    "headline": f"Looking for reliable {business_type}?",
                    "caption": f"At {business_name}, we provide affordable and quality solutions tailored for you.",
                    "cta": "DM us now!",
                    "hashtags": "#Solutions #Affordable #TrustUs",
                    "suggested_time": "6:00 PM - 8:00 PM (Evening engagement)"
                },
                {
                    "type": "Trust Building",
                    "headline": f"Why Choose {business_name}?",
                    "caption": "✔ High Quality\n✔ Affordable Pricing\n✔ Fast Delivery\n✔ Customer Satisfaction Guaranteed",
                    "cta": "Follow us for updates!",
                    "hashtags": "#TrustWorthy #QualityFirst #CustomerFirst",
                    "suggested_time": "12:00 PM - 2:00 PM (Lunch break)"
                }
            ]
        })
    
    try:
        system_prompt = """You are a social media marketing expert. Create engaging, professional ad posts for small businesses in India.
Return ONLY a valid JSON array, no markdown formatting."""
        
        user_prompt = f"""Create 3 social media ad posts for:
Business: {business_name}
Type: {business_type}
Audience: {target_audience}
Tone: {tone}

Generate 3 different ad types:
1. Promotional Launch Post
2. Problem-Solution Post
3. Trust Building Post

For each ad, provide:
- type
- headline (catchy, max 10 words)
- caption (engaging, 2-3 lines)
- cta (call to action)
- hashtags (5-7 relevant hashtags)
- suggested_time (best time to post)

Return ONLY valid JSON array of ads in this exact format:
[{{"type": "...", "headline": "...", "caption": "...", "cta": "...", "hashtags": "...", "suggested_time": "..."}}]"""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME
        )
        
        content = chat_completion.choices[0].message.content
        print(f"DEBUG: AI Response for ads: {content[:200]}...")
        
        # Clean up the response - remove markdown code blocks if present
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        # Parse JSON
        ads = json.loads(content)
        
        # Ensure it's a list
        if not isinstance(ads, list):
            ads = [ads]
        
        return jsonify({"ads": ads})
        
    except json.JSONDecodeError as e:
        print(f"JSON ERROR in generate_ad_posts: {str(e)}")
        print(f"Content was: {content}")
        # Return fallback ads
        return jsonify({
            "ads": [
                {
                    "type": "Promotional Launch",
                    "headline": f"Introducing {business_name}!",
                    "caption": f"Discover the best {business_type} experience. Quality meets affordability.",
                    "cta": "Visit us today!",
                    "hashtags": "#NewBusiness #Quality #StartupIndia",
                    "suggested_time": "9:00 AM - 11:00 AM"
                },
                {
                    "type": "Problem-Solution",
                    "headline": f"Need {business_type}? We've Got You!",
                    "caption": f"{business_name} offers reliable solutions tailored to your needs.",
                    "cta": "Contact us now!",
                    "hashtags": "#Solutions #Reliable #CustomerFirst",
                    "suggested_time": "6:00 PM - 8:00 PM"
                },
                {
                    "type": "Trust Building",
                    "headline": f"Why {business_name}?",
                    "caption": "✔ Quality Assured\\n✔ Best Prices\\n✔ Happy Customers",
                    "cta": "Follow for updates!",
                    "hashtags": "#Trusted #QualityFirst #Excellence",
                    "suggested_time": "12:00 PM - 2:00 PM"
                }
            ]
        })
    except Exception as e:
        print(f"ERROR in generate_ad_posts: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate ad posts: {str(e)}"}), 500


# 2. AWARD POINTS ENDPOINT
@app.route("/api/award-points", methods=["POST"])
def award_points_endpoint():
    """
    Awards points to a user for completing activities.
    """
    if not supabase_client:
        return jsonify({"error": "Database connection not available"}), 500
        
    data = request.json or {}
    user_id = data.get("user_id")
    activity_type = data.get("activity_type")
    points = data.get("points", 0)
    description = data.get("description", "")
    
    if not user_id or not activity_type:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        # Call the database function to award points
        supabase_client.rpc("award_points", {
            "p_user_id": user_id,
            "p_activity_type": activity_type,
            "p_points": points,
            "p_description": description
        }).execute()
        
        return jsonify({"success": True, "points_awarded": points})
        
    except Exception as e:
        print(f"ERROR in award_points: {str(e)}")
        return jsonify({"error": "Failed to award points"}), 500


# 3. GET LEADERBOARD ENDPOINT
@app.route("/api/get-leaderboard", methods=["GET"])
def get_leaderboard():
    """
    Returns the top users by points for the leaderboard.
    """
    if not supabase_client:
        return jsonify({"leaderboard": []})
        
    try:
        limit = request.args.get("limit", 50, type=int)
        
        # Priority 1: Fetch user_points ordered by descending total_points
        points_response = supabase_client.table("user_points") \
            .select("*") \
            .order("total_points", desc=True) \
            .limit(limit) \
            .execute()
            
        points_data = points_response.data or []
        
        if not points_data:
            return jsonify({"leaderboard": []})

        user_ids = [item.get("user_id") for item in points_data if item.get("user_id")]
        
        # Priority 2: Fetch corresponding user_profiles and merge
        profiles_data = []
        if user_ids:
            profiles_response = supabase_client.table("user_profiles") \
                .select("user_id, full_name, business_name, industry, location, phone") \
                .in_("user_id", user_ids) \
                .execute()
            profiles_data = profiles_response.data or []
            
        profiles_map = {p["user_id"]: p for p in profiles_data}
        
        # Priority 3: Combine them just like the postgrest join would
        for item in points_data:
            user_id = item.get("user_id")
            if user_id in profiles_map:
                profile_info = profiles_map[user_id]
                # Filter out the user_id from the nested dict to match original struct
                item["user_profiles"] = {k: v for k, v in profile_info.items() if k != "user_id"}
            else:
                item["user_profiles"] = None
        
        return jsonify({"leaderboard": points_data})
        
    except Exception as e:
        print(f"ERROR in get_leaderboard: {str(e)}")
        return jsonify({"error": f"Failed to fetch leaderboard: {str(e)}"}), 500


# 4. GENERATE SUCCESS GUIDE ENDPOINT
@app.route("/api/generate-success-guide", methods=["POST"])
def generate_success_guide():
    """
    Generates a personalized success guide based on business type.
    """
    data = request.json or {}
    business_type = data.get("business_type", "General")
    business_stage = data.get("business_stage", "Idea")
    
    if MOCK_AI:
        return jsonify({
            "weekly_goals": [
                "Set up social media profiles",
                "Create first marketing post",
                "Research 3 competitors",
                "Define target customer"
            ],
            "marketing_checklist": [
                "Create Google My Business listing",
                "Set up WhatsApp Business",
                "Design basic logo",
                "Prepare launch announcement"
            ],
            "cost_control_checklist": [
                "Track all expenses daily",
                "Set monthly budget limits",
                "Negotiate with suppliers",
                "Avoid unnecessary purchases"
            ],
            "growth_strategies": [
                "Focus on customer retention",
                "Collect customer feedback",
                "Offer referral incentives",
                "Expand product/service range gradually"
            ],
            "export_readiness": [
                "Research export regulations",
                "Identify potential markets",
                "Get export licenses",
                "Find logistics partners"
            ]
        })
    
    try:
        system_prompt = """You are a business mentor for Indian startups. Create practical, actionable success guides."""
        
        user_prompt = f"""Create a personalized success guide for:
Business Type: {business_type}
Stage: {business_stage}

Provide specific, actionable items for:
1. weekly_goals (4-5 items)
2. marketing_checklist (4-5 items)
3. cost_control_checklist (4-5 items)
4. growth_strategies (4-5 items)
5. export_readiness (4-5 items)

Make it specific to {business_type} businesses in India.
Return ONLY valid JSON."""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME
        )
        
        content = chat_completion.choices[0].message.content
        guide = json.loads(content)
        
        return jsonify(guide)
        
    except Exception as e:
        print(f"ERROR in generate_success_guide: {str(e)}")
        return jsonify({"error": "Failed to generate success guide"}), 500


# 6. GET USER PROGRESS ENDPOINT
@app.route("/api/get-user-progress", methods=["GET"])
def get_user_progress():
    """
    Returns user progress metrics.
    """
    if not supabase_client:
        return jsonify({"error": "Database connection not available"}), 500
        
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    try:
        response = supabase_client.table("user_progress") \
            .select("*") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        return jsonify({"progress": response.data})
        
    except Exception as e:
        print(f"ERROR in get_user_progress: {str(e)}")
        return jsonify({"error": "Failed to fetch progress"}), 500


# ===== AD PERSISTENCE ENDPOINTS =====

# 7. SAVE PLAN ADS ENDPOINT
# 7. SAVE PLAN ADS ENDPOINT
@app.route("/api/save-plan-ads", methods=["POST"])
def save_plan_ads():
    """
    Save generated ads for a specific business plan.
    Handles both JSON data (legacy) and Multipart/Form-Data (with images).
    """
    logger.info("=== SAVE PLAN ADS ENDPOINT CALLED ===")
    
    # Check if Supabase client is available
    if not supabase_client:
        logger.error("Supabase client not initialized")
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        user_id = None
        plan_id = None
        plan_name = None
        ads = []
        replace_existing = False
        
        # Determine if request is JSON or Multipart
        if request.is_json:
            logger.info("Processing JSON request")
            data = request.json
            user_id = data.get("user_id")
            plan_id = data.get("plan_id")
            plan_name = data.get("plan_name")
            ads = data.get("ads", [])
            replace_existing = data.get("replace_existing", False)
        else:
            logger.info("Processing Multipart request")
            user_id = request.form.get("user_id")
            plan_id = request.form.get("plan_id")
            plan_name = request.form.get("plan_name")
            ads_json = request.form.get("ad_data", "[]")
            try:
                ads = json.loads(ads_json)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to decode ad_data JSON: {e}")
                return jsonify({"error": "Invalid ad_data JSON"}), 400
                
        if not user_id or not plan_id or not plan_name:
            logger.error(f"Missing required fields - user_id:{user_id}, plan_id:{plan_id}, plan_name:{plan_name}")
            return jsonify({"error": "Missing required fields"}), 400
        
        # Insert new ads
        saved_ads = []
        
        for i, ad in enumerate(ads):
            try:
                image_url = ad.get("image_url", "")
                
                # Check if there is an image uploaded for this ad
                # The frontend sends images with keys like 'image_0', 'image_1', etc.
                # corresponding to the index in the filtered 'ads' array
                if not request.is_json:
                    image_file = request.files.get(f"image_{i}")
                    if image_file:
                        try:
                            file_ext = image_file.filename.split('.')[-1] if '.' in image_file.filename else 'png'
                            file_path = f"{user_id}/{plan_id}/{uuid.uuid4()}.{file_ext}"
                            file_content = image_file.read()
                            
                            logger.info(f"Uploading image for ad {i} to {file_path}")
                            
                            # Upload to Supabase Storage
                            # Initialize storage client if separate, or use supabase_client.storage
                            # Note: Supabase Python client syntax for storage:
                            storage_response = supabase_client.storage.from_("ad-creatives").upload(
                                path=file_path,
                                file=file_content,
                                file_options={"content-type": f"image/{file_ext}"}
                            )
                            
                            # Get Public URL
                            # The upload response object might not contain the public URL directly
                            # We construct it or request it
                            
                            # With supabase-py, getting public URL:
                            public_url_response = supabase_client.storage.from_("ad-creatives").get_public_url(file_path)
                            
                            # public_url_response is usually a string or object with publicURL
                            if isinstance(public_url_response, str):
                                image_url = public_url_response
                            elif isinstance(public_url_response, dict) and 'publicURL' in public_url_response: # Older versions
                                print(f"Public URL dict key found: {public_url_response}") # Debugging
                                image_url = public_url_response['publicURL'] 
                            else: # Newer versions might return just the URL string
                                image_url = str(public_url_response)

                            logger.info(f"Image uploaded successfully: {image_url}")
                            
                        except Exception as upload_error:
                            logger.error(f"Failed to upload image for ad {i}: {upload_error}")
                            # Continue saving ad without image if upload fails
                            pass

                ad_data = {
                    "user_id": user_id,
                    "plan_id": plan_id,
                    "plan_name": plan_name,
                    "ad_type": ad.get("type", "General"),
                    "headline": ad.get("headline", ""),
                    "caption": ad.get("caption", ""),
                    "cta": ad.get("cta", ""),
                    "hashtags": ad.get("hashtags", ""),
                    "suggested_time": ad.get("suggested_time", ""),
                    "image_data": ad.get("image_data", ""), # Legacy field
                    "image_url": image_url, # New field
                    "is_favorite": False,
                    "is_archived": False
                }
                
                logger.debug(f"Inserting ad {i+1}/{len(ads)}: {ad_data.get('headline')}")
                
                response = supabase_client.table("plan_ads") \
                    .insert(ad_data) \
                    .execute()
                
                if response.data:
                    saved_ads.append(response.data[0])
                    logger.info(f"Ad {i+1} saved successfully, ID: {response.data[0]['id']}")
                    
            except Exception as insert_error:
                logger.error(f"Failed to insert ad {i+1}: {type(insert_error).__name__}: {insert_error}")
                import traceback
                logger.error(traceback.format_exc())
                # Don't raise, try to save other ads
                # raise insert_error

        # Award points for ad generation (first time only system)
        try:
             # Basic points logic - can be expanded
             pass
        except Exception:
             pass
        
        return jsonify({
            "success": True,
            "ads": saved_ads,
            "message": f"Saved {len(saved_ads)} ads successfully"
        })
        
    except Exception as e:
        logger.error(f"CRITICAL ERROR in save_plan_ads: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Failed to save ads: {str(e)}"}), 500


# 8. GET PLAN ADS ENDPOINT
@app.route("/api/get-plan-ads/<plan_id>", methods=["GET"])
def get_plan_ads(plan_id):
    """
    Retrieve all non-archived ads for a specific business plan.
    """
    # Check if Supabase client is available
    if not supabase_client:
        print("ERROR: Supabase client not initialized")
        return jsonify({"error": "Database connection not available"}), 500
    
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    try:
        query = supabase_client.table("plan_ads") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("is_archived", False)
            
        # Only filter by plan_id if it's not "all"
        if plan_id.lower() != "all":
            query = query.eq("plan_id", plan_id)
            
        response = query.order("created_at", desc=True).execute()
        
        # Log successful fetch
        print(f"Fetched {len(response.data) if response.data else 0} ads for user {user_id}")
        
        return jsonify({
            "success": True,
            "ads": response.data or [],
            "count": len(response.data) if response.data else 0
        })
        
    except Exception as e:
        print(f"CRITICAL ERROR in get_plan_ads: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return the actual error to the frontend for debugging
        return jsonify({"error": f"Failed to fetch ads: {str(e)}"}), 500


# 9. DELETE PLAN AD ENDPOINT
@app.route("/api/delete-plan-ad/<ad_id>", methods=["DELETE"])
def delete_plan_ad(ad_id):
    """
    Delete a specific ad (soft delete by archiving).
    """
    if not supabase_client:
        return jsonify({"error": "Database connection not available"}), 500
        
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    try:
        # Soft delete by setting is_archived to true
        response = supabase_client.table("plan_ads") \
            .update({"is_archived": True}) \
            .eq("id", ad_id) \
            .eq("user_id", user_id) \
            .execute()
        
        if response.data:
            return jsonify({
                "success": True,
                "message": "Ad deleted successfully"
            })
        else:
            return jsonify({"error": "Ad not found"}), 404
        
    except Exception as e:
        print(f"ERROR in delete_plan_ad: {str(e)}")
        return jsonify({"error": "Failed to delete ad"}), 500


# 10. TOGGLE FAVORITE AD ENDPOINT
@app.route("/api/toggle-favorite-ad/<ad_id>", methods=["PATCH"])
def toggle_favorite_ad(ad_id):
    """
    Toggle favorite status of an ad.
    """
    if not supabase_client:
        return jsonify({"error": "Database connection not available"}), 500
        
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    try:
        # Get current favorite status
        current = supabase_client.table("plan_ads") \
            .select("is_favorite") \
            .eq("id", ad_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if not current.data:
            return jsonify({"error": "Ad not found"}), 404
        
        # Toggle the status
        new_status = not current.data.get("is_favorite", False)
        
        response = supabase_client.table("plan_ads") \
            .update({"is_favorite": new_status}) \
            .eq("id", ad_id) \
            .eq("user_id", user_id) \
            .execute()
        
        return jsonify({
            "success": True,
            "is_favorite": new_status,
            "message": "Favorite status updated"
        })
        
    except Exception as e:
        print(f"ERROR in toggle_favorite_ad: {str(e)}")
        return jsonify({"error": "Failed to toggle favorite"}), 500



# 11. UPDATE USER PROFILE ENDPOINT
@app.route("/api/update-user-profile", methods=["POST"])
def update_user_profile():
    """
    Update or create user profile.
    """
    if not supabase_client:
        return jsonify({"error": "Database connection not available"}), 500

    try:
        data = request.json
        if not data:
             return jsonify({"error": "No data provided"}), 400
             
        user_id = data.get("user_id", "").strip()

        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        # Sanitize and length-limit all string inputs
        def sanitize(val: object, max_len: int = 200) -> "str | None":
            if val is None:
                return None
            s: str = str(val).strip()
            return s[0:max_len]  # type: ignore[index]

        full_name = sanitize(data.get("full_name"), 100)
        phone = sanitize(data.get("phone"), 20)
        business_name = sanitize(data.get("business_name"), 150)
        industry = sanitize(data.get("industry"), 100)
        location = sanitize(data.get("location"), 150)
        business_stage = sanitize(data.get("business_stage"), 50)

        # Prepare profile data
        profile_data = {
            "user_id": user_id,
            "full_name": full_name,
            "phone": phone,
            "business_name": business_name,
            "industry": industry,
            "location": location,
            "business_stage": business_stage,
            "updated_at": "now()"
        }

        # Remove None values to avoid overwriting with null
        profile_data = {k: v for k, v in profile_data.items() if v is not None}

        # Upsert profile (Insert or Update)
        response = supabase_client.table("user_profiles").upsert(
            profile_data, on_conflict="user_id"
        ).execute()

        if response.data:
            return jsonify({
                "success": True,
                "message": "Profile updated successfully"
            })
        else:
             # If upsert doesn't return data, fetch it manually to confirm
             fetch_profile = supabase_client.table("user_profiles").select("user_id, full_name, phone, business_name, location, business_stage").eq("user_id", user_id).execute()
             if fetch_profile.data:
                 return jsonify({
                    "success": True,
                    "message": "Profile updated successfully"
                })
             return jsonify({"error": "Failed to update profile"}), 500

    except Exception as e:
        logger.error(f"ERROR in update_user_profile: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to update profile. Please try again."}), 500



# ==========================================
# ADVANCED FEATURES EXTENSIONS (NON-BREAKING)
# ==========================================

import base64
from services.pitch_deck_service import create_pitch_deck, create_bank_loan_pdf
from services.trends_service import get_market_trends

@app.route("/api/generate-pitch-deck", methods=["POST"])
def api_generate_pitch_deck():
    """
    Receives a BusinessPlan JSON and returns base64 encoded PPTX and PDF files.
    """
    try:
        data = request.json or {}
        business_plan = data.get("business_plan")
        if not business_plan:
            return jsonify({"error": "Business plan data is required"}), 400
            
        pptx_bytes = create_pitch_deck(business_plan)
        pdf_bytes = create_bank_loan_pdf(business_plan)
        
        pptx_b64 = base64.b64encode(pptx_bytes).decode('utf-8')
        pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        return jsonify({
            "success": True,
            "pptx_base64": pptx_b64,
            "pdf_base64": pdf_b64,
            "message": "Pitch deck generated successfully"
        })
        
    except Exception as e:
        import traceback
        logger.error(f"Error generation pitch deck: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/api/market-trends", methods=["GET"])
def api_market_trends():
    """
    Returns simulated hyper-local market trends for a user's city.
    """
    try:
        city = request.args.get("city", "India")
        trends_data = get_market_trends(city)
        return jsonify({
            "success": True,
            "data": trends_data
        })
    except Exception as e:
        logger.error(f"Error fetching market trends: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route("/api/analyze-competitor", methods=["POST"])
def api_analyze_competitor():
    """
    Analyzes a competitor url or name using AI and generates a SWOT matrix.
    """
    try:
        data = request.json or {}
        competitor_query = data.get("competitor")
        industry = data.get("industry", "general")
        
        if not competitor_query:
            return jsonify({"error": "Competitor name or URL is required"}), 400
            
        from services.competitor_service import analyze_competitor
        analysis = analyze_competitor(competitor_query, industry)
        
        return jsonify({
            "success": True,
            "data": analysis
        })
    except Exception as e:
        logger.error(f"Error analyzing competitor: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    is_development = os.getenv("FLASK_ENV") == "development"
    app.run(debug=is_development, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
