from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
import os
from supabase import create_client
from dotenv import load_dotenv
import qrcode
import io
import base64
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
from typing import Optional, Any
import jwt
from passlib.context import CryptContext
import logging

# Load environment variables
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment Variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not (SUPABASE_URL and SUPABASE_ANON_KEY):
    raise ValueError("Missing Supabase configuration.")

# Supabase Clients
supabase_auth = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else supabase_auth

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Card System Constants
DEFAULT_MEMBER_PASSWORD = "ABC1234"
DEFAULT_CARD_PREFIX = "ABC"
CARD_STATUS_AVAILABLE = "available"
CARD_STATUS_ASSIGNED = "assigned"
CARD_STATUS_LOST = "lost"
CARD_STATUS_DAMAGED = "damaged"
QR_EXPIRY_SECONDS = 300  # 5 minutes

# Security Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# FastAPI App
app = FastAPI(
    title="GymSphere API", 
    version="2.1",
    description="Complete Professional Gym Management System with QR Card Assignment & Inventory Management"
)

# Session Middleware for Flask-style templates
app.add_middleware(SessionMiddleware, secret_key='gymsphere-secret-key-2025')

# Initialize Jinja2 templates for backward compatibility
templates = Jinja2Templates(directory="templates")

def url_for(request: Request, name: str, **path_params: Any) -> str:
    """Custom URL generator for templates compatibility"""
    return request.url_for(name, **path_params)

templates.env.globals['url_for'] = url_for

# CORS Configuration - Extended for all your environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://localhost:3001", 
        "http://127.0.0.1:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models - All your existing models maintained
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    gym_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class MemberCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    membership_type: str
    card_number: Optional[str] = None
    create_login: Optional[bool] = True

class CardBatch(BaseModel):
    start: int
    end: int
    prefix: str = DEFAULT_CARD_PREFIX

class CardVerifyRequest(BaseModel):
    card_number: str

class QRRequest(BaseModel):
    member_id: int

class QRVerifyRequest(BaseModel):
    qr_data: str

class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    membership_type: Optional[str] = None
    subscription_start: Optional[str] = None
    subscription_end: Optional[str] = None
    card_id: Optional[str] = None
    is_active: Optional[bool] = None

class QRCardScanRequest(BaseModel):
    qr_data: str

# NEW: Additional models for enhanced card management
class CardStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None

class CardAssignment(BaseModel):
    member_id: int
    card_number: str

class BulkCardOperation(BaseModel):
    card_numbers: list[str]
    operation: str  # 'delete', 'mark_lost', 'mark_damaged'
    reason: Optional[str] = None

# Authentication Helper Functions - All maintained
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token for authentication"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token"""
    email = verify_token(credentials.credentials)
    return {"email": email}

# ========================================
# ROOT & HEALTH ENDPOINTS
# ========================================

@app.get("/")
async def root():
    """Root endpoint showing API status and features"""
    return {
        "message": "GymSphere API running", 
        "version": app.version,
        "features": [
            "Member Management", 
            "QR Card Assignment", 
            "Card Inventory Management",
            "Barcode Access", 
            "Attendance Tracking",
            "Analytics & Reporting",
            "Bulk Operations",
            "Real-time Dashboard"
        ]
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        test_result = supabase_admin.table("user_profiles").select("count", count="exact").limit(1).execute()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected",
            "version": app.version
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "database": "error",
            "error": str(e)
        }

# ========================================
# LEGACY FLASK-STYLE ENDPOINTS (Backward Compatibility)
# ========================================

@app.get("/", name="index")
async def legacy_index(request: Request):
    """Legacy Flask-style index endpoint for backward compatibility"""
    messages = request.session.pop('messages', [])
    try:
        # Fetch all members
        response = supabase_admin.table('members').select('*').execute()
        members = response.data or []
        
        # Fetch card inventory data
        card_response = supabase_admin.table('card_inventory').select('*').execute()
        cards = card_response.data or []
        
        # Calculate card statistics
        available_cards = [card for card in cards if card['status'] == CARD_STATUS_AVAILABLE]
        assigned_cards = [card for card in cards if card['status'] == CARD_STATUS_ASSIGNED]
        lost_damaged_cards = [card for card in cards if card['status'] in [CARD_STATUS_LOST, CARD_STATUS_DAMAGED]]
        
        # Get current date for membership status calculation
        today = datetime.today().date()

        # Process each member to determine status and format dates
        for member in members:
            try:
                # Parse subscription end date and calculate status
                if member.get('subscription_end'):
                    end_date = datetime.fromisoformat(member['subscription_end'].replace('Z', '+00:00')).date()
                elif member.get('end_date'):
                    end_date = datetime.strptime(member['end_date'], "%Y-%m-%d").date()
                else:
                    end_date = today - timedelta(days=1)  # Default to expired
                
                if end_date < today:
                    member['status'] = "Expired"
                elif (end_date - today).days <= 7:
                    member['status'] = "Near Expiry"
                else:
                    member['status'] = "Active"
                    
            except Exception:
                member['status'] = "Invalid Date"

            # Format dates for display
            for date_field in ['join_date', 'end_date', 'subscription_start', 'subscription_end']:
                if member.get(date_field):
                    try:
                        if 'T' in str(member[date_field]) or 'Z' in str(member[date_field]):
                            # ISO format
                            dt = datetime.fromisoformat(member[date_field].replace('Z', '+00:00'))
                        else:
                            # Date format
                            dt = datetime.strptime(member[date_field], "%Y-%m-%d")
                        member[f"{date_field}_formatted"] = dt.strftime("%d/%m/%Y")
                    except:
                        pass

        return {
            "members": members, 
            "messages": messages,
            "card_stats": {
                "total_cards": len(cards),
                "available_cards": len(available_cards),
                "assigned_cards": len(assigned_cards),
                "lost_damaged_cards": len(lost_damaged_cards)
            },
            "available_cards": available_cards[:50]  # Limit for performance
        }

    except Exception as e:
        error_msg = f'Error loading dashboard data: {str(e)}'
        logger.error(error_msg)
        return {
            "members": [], 
            "messages": [{'category': 'error', 'message': error_msg}], 
            "card_stats": {"total_cards": 0, "available_cards": 0, "assigned_cards": 0}
        }

# ========================================
# AUTHENTICATION ENDPOINTS
# ========================================

@app.post("/api/auth/register")
async def register(user: UserCreate):
    """Register new gym owner/admin user"""
    try:
        auth_response = supabase_auth.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "full_name": user.full_name,
                    "gym_name": user.gym_name
                }
            }
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user.")

        return {
            "message": "Registration successful. Please confirm your email.", 
            "user_id": auth_response.user.id
        }
    except Exception as e:
        errmsg = str(e).lower()
        if "already" in errmsg:
            raise HTTPException(status_code=409, detail="Email already registered")
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=400, detail="Registration failed")

@app.post("/api/auth/login")
async def login(user: UserLogin):
    """Login gym owner/admin user"""
    try:
        auth_response = supabase_auth.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if not auth_response.user or not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not auth_response.user.email_confirmed_at:
            raise HTTPException(status_code=403, detail="Email not confirmed")

        profile_result = supabase_admin.table("user_profiles").select("*").eq("user_id", auth_response.user.id).execute()
        if not profile_result.data:
            raise HTTPException(status_code=400, detail="User profile not found")

        profile = profile_result.data[0]
        access_token = create_access_token({"sub": user.email})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(auth_response.user.id),
                "email": profile["email"],
                "full_name": profile["full_name"],
                "gym_name": profile.get("gym_name"),
                "created_at": profile["created_at"]
            }
        }
    except Exception as e:
        errmsg = str(e).lower()
        if "email not confirmed" in errmsg:
            raise HTTPException(status_code=403, detail="Please confirm your email.")
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

# ========================================
# ENHANCED CARD INVENTORY MANAGEMENT
# ========================================

@app.post("/api/admin/add-card-batch")
async def add_card_batch(batch: CardBatch, current_user=Depends(get_current_user)):
    """Add a batch of cards to inventory with enhanced validation"""
    try:
        if batch.end - batch.start > 500:
            raise HTTPException(status_code=400, detail="Maximum 500 cards per batch")
        
        if batch.start < 1 or batch.end < batch.start:
            raise HTTPException(status_code=400, detail="Invalid batch range")

        cards = []
        for i in range(batch.start, batch.end + 1):
            card_number = f"{batch.prefix}{i:03d}"
            cards.append({
                "card_number": card_number,
                "status": CARD_STATUS_AVAILABLE,
                "gym_owner_email": current_user["email"],
                "created_at": datetime.now().isoformat(),
                "assigned_to_member_id": None,
                "assigned_date": None
            })
        
        # Check for existing cards
        existing_cards = supabase_admin.table("card_inventory").select("card_number").in_(
            "card_number", [card["card_number"] for card in cards]
        ).execute()
        
        if existing_cards.data:
            duplicate_numbers = [card["card_number"] for card in existing_cards.data]
            raise HTTPException(status_code=400, detail=f"Cards already exist: {', '.join(duplicate_numbers[:5])}")
        
        result = supabase_admin.table("card_inventory").insert(cards).execute()
        
        logger.info(f"Added {len(cards)} cards to inventory for {current_user['email']}")
        
        return {
            "message": f"✅ Added {len(cards)} cards to inventory successfully!",
            "cards_added": len(cards),
            "range": f"{batch.prefix}{batch.start:03d} to {batch.prefix}{batch.end:03d}",
            "status": "success",
            "next_steps": [
                "Generate QR codes for printing using /api/admin/generate-card-qr-batch",
                "Print physical cards with QR codes",
                "Scan and assign cards to members"
            ]
        }
    except Exception as e:
        logger.error(f"Add card batch error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/card-inventory")
async def get_card_inventory(current_user=Depends(get_current_user)):
    """Get comprehensive card inventory with member assignments"""
    try:
        result = supabase_admin.table("card_inventory").select("*").eq(
            "gym_owner_email", current_user["email"]
        ).order("card_number").execute()
        
        inventory = result.data or []
        
        # Enhance with member information for assigned cards
        for card in inventory:
            if card.get("assigned_to_member_id"):
                member_result = supabase_admin.table("members").select(
                    "id, full_name, email, membership_type, subscription_end"
                ).eq("id", card["assigned_to_member_id"]).execute()
                
                if member_result.data:
                    member = member_result.data[0]
                    card["assigned_member"] = {
                        "name": member["full_name"],
                        "email": member["email"],
                        "membership_type": member["membership_type"],
                        "subscription_end": member.get("subscription_end")
                    }
        
        # Calculate statistics
        stats = {
            "total": len(inventory),
            "available": len([c for c in inventory if c["status"] == CARD_STATUS_AVAILABLE]),
            "assigned": len([c for c in inventory if c["status"] == CARD_STATUS_ASSIGNED]),
            "lost": len([c for c in inventory if c["status"] == CARD_STATUS_LOST]),
            "damaged": len([c for c in inventory if c["status"] == CARD_STATUS_DAMAGED])
        }
        
        return {
            "inventory": inventory, 
            "statistics": stats,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get card inventory error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/available-cards")
async def get_available_cards(current_user=Depends(get_current_user)):
    """Get all available cards for assignment"""
    try:
        result = supabase_admin.table("card_inventory").select("card_number, created_at").eq(
            "gym_owner_email", current_user["email"]
        ).eq("status", CARD_STATUS_AVAILABLE).order("card_number").execute()
        
        return {
            "cards": result.data or [], 
            "count": len(result.data or []),
            "message": f"Found {len(result.data or [])} available cards ready for assignment"
        }
    except Exception as e:
        logger.error(f"Get available cards error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/admin/card/{card_number}/status")
async def update_card_status(
    card_number: str, 
    status_update: CardStatusUpdate, 
    current_user=Depends(get_current_user)
):
    """Update card status with reason logging"""
    try:
        valid_statuses = [CARD_STATUS_AVAILABLE, CARD_STATUS_ASSIGNED, CARD_STATUS_LOST, CARD_STATUS_DAMAGED]
        if status_update.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        # Get current card info
        current_card = supabase_admin.table("card_inventory").select("*").eq(
            "card_number", card_number
        ).eq("gym_owner_email", current_user["email"]).execute()
        
        if not current_card.data:
            raise HTTPException(status_code=404, detail="Card not found")
        
        old_status = current_card.data[0]["status"]
        
        update_data = {
            "status": status_update.status,
            "status_updated_at": datetime.now().isoformat()
        }
        
        # If marking as lost/damaged, clear assignment
        if status_update.status in [CARD_STATUS_LOST, CARD_STATUS_DAMAGED]:
            update_data.update({
                "assigned_to_member_id": None,
                "assigned_date": None
            })
            
            # Also clear from member record if assigned
            if current_card.data[0].get("assigned_to_member_id"):
                supabase_admin.table("members").update({"card_id": None}).eq(
                    "id", current_card.data[0]["assigned_to_member_id"]
                ).execute()
        
        result = supabase_admin.table("card_inventory").update(update_data).eq(
            "card_number", card_number
        ).eq("gym_owner_email", current_user["email"]).execute()
        
        # Log the status change
        log_entry = {
            "card_number": card_number,
            "old_status": old_status,
            "new_status": status_update.status,
            "reason": status_update.reason,
            "updated_by": current_user["email"],
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            supabase_admin.table("card_status_logs").insert(log_entry).execute()
        except:
            logger.warning(f"Failed to log status change for card {card_number}")
        
        return {
            "message": f"✅ Card {card_number} status updated from '{old_status}' to '{status_update.status}'",
            "card_number": card_number,
            "old_status": old_status,
            "new_status": status_update.status,
            "reason": status_update.reason
        }
    except Exception as e:
        logger.error(f"Update card status error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/scan-card-qr")
async def scan_card_qr(request: QRCardScanRequest, current_user=Depends(get_current_user)):
    """Enhanced QR card scanning with case-insensitive matching"""
    try:
        qr_data = request.qr_data.strip()
        card_number = None
        
        # Enhanced QR data parsing
        if "gymsphere:" in qr_data.lower():
            card_number = qr_data.split(":")[-1]
        elif ":" in qr_data:
            parts = qr_data.split(":")
            if len(parts) >= 2:
                card_number = parts[-1]
        elif "/" in qr_data:
            card_number = qr_data.split("/")[-1]
        elif qr_data.isalnum():
            card_number = qr_data
        else:
            # Use raw string to fix SyntaxWarning
            import re
            match = re.search(r'[A-Z]{2,4}\d{3,4}', qr_data.upper())
            if match:
                card_number = match.group()
        
        if not card_number:
            return {
                "success": False,
                "message": "❌ Invalid QR code format",
                "error": "Could not extract card number from QR data",
                "qr_data_received": qr_data[:50]
            }
        
        # 🔧 NORMALIZE CASE - This is the key fix
        card_number = card_number.upper().strip()
        user_email = current_user["email"].lower().strip()
        
        # 🔍 DEBUG LOGGING (temporary - remove after testing)
        print(f"🔍 DEBUG: Searching for card: '{card_number}'")
        print(f"🔍 DEBUG: User email: '{user_email}'")
        
        # 🚀 FIX: Use wildcards with ilike for pattern matching
        card_result = supabase_admin.table("card_inventory").select("*").ilike(
            "card_number", f"*{card_number}*"
        ).ilike("gym_owner_email", f"*{user_email}*").execute()
        
        # 🔍 DEBUG: Check if card exists anywhere (remove after testing)
        debug_result = supabase_admin.table("card_inventory").select("*").ilike(
            "card_number", f"*{card_number}*"
        ).execute()
        
        print(f"🔍 DEBUG: Cards found anywhere: {len(debug_result.data or [])}")
        print(f"🔍 DEBUG: Cards for this user: {len(card_result.data or [])}")
        
        # 🔍 ADDITIONAL DEBUG: Show the actual stored email
        if debug_result.data:
            stored_email = debug_result.data[0].get("gym_owner_email", "No email found")
            print(f"🔍 DEBUG: Card owner email in DB: '{stored_email}'")
            print(f"🔍 DEBUG: Your email: '{user_email}'")
            print(f"🔍 DEBUG: Emails match: {stored_email.lower() == user_email.lower()}")
        
        if not card_result.data:
            # Provide better error message with debug info
            return {
                "success": False,
                "message": f"❌ Card {card_number} not found in your inventory",
                "card_number": card_number,
                "debug_info": {
                    "searched_card": card_number,
                    "user_email": user_email,
                    "card_exists_anywhere": len(debug_result.data or []) > 0,
                    "card_owner_email": debug_result.data[0]["gym_owner_email"] if debug_result.data else None
                },
                "suggestion": "Check if card belongs to your account or add it to inventory first"
            }
        
        card = card_result.data[0]
        
        if card["status"] == CARD_STATUS_ASSIGNED:
            # Get member details
            member_result = supabase_admin.table("members").select("full_name, email").eq(
                "card_id", card_number
            ).eq("owner_email", user_email).execute()
            
            member_name = "Unknown Member"
            if member_result.data:
                member_name = member_result.data[0]["full_name"]
            
            return {
                "success": False,
                "message": f"❌ Card already assigned to {member_name}",
                "card_number": card_number,
                "current_status": card["status"],
                "assigned_member": member_name,
                "suggestion": "Unassign the card first or scan a different card"
            }
        elif card["status"] != CARD_STATUS_AVAILABLE:
            return {
                "success": False,
                "message": f"❌ Card status: {card['status']}",
                "card_number": card_number,
                "current_status": card["status"],
                "suggestion": "Change card status to 'available' first"
            }
        
        return {
            "success": True,
            "message": f"✅ Card {card_number} ready for assignment",
            "card_number": card_number,
            "card_details": {
                "card_number": card["card_number"],
                "status": card["status"],
                "created_at": card["created_at"]
            }
        }
        
    except Exception as e:
        logger.error(f"QR scan error: {str(e)}")
        return {
            "success": False,
            "message": f"❌ QR scan failed: {str(e)}",
            "error": str(e)
        }


@app.post("/api/admin/scan-new-card")
async def scan_new_card(request: QRCardScanRequest, current_user=Depends(get_current_user)):
    """Scan and register new physical cards into inventory"""
    try:
        qr_data = request.qr_data.strip()
        card_number = None
        
        # Parse QR data to extract card number (same logic as scan_card_qr)
        if "gymsphere:" in qr_data.lower():
            card_number = qr_data.split(":")[-1]
        elif ":" in qr_data:
            parts = qr_data.split(":")
            if len(parts) >= 2:
                card_number = parts[-1]
        elif "/" in qr_data:
            card_number = qr_data.split("/")[-1]
        elif qr_data.isalnum():
            card_number = qr_data
        else:
            import re
            match = re.search(r'[A-Z]{2,4}\d{3,4}', qr_data.upper())
            if match:
                card_number = match.group()
        
        if not card_number:
            return {
                "success": False,
                "message": "❌ Invalid QR code format",
                "error": "Could not extract card number from QR data"
            }
        
        card_number = card_number.upper()
        
        # Check if card already exists
        existing_card = supabase_admin.table("card_inventory").select("*").eq(
            "card_number", card_number
        ).eq("gym_owner_email", current_user["email"]).execute()
        
        if existing_card.data:
            card = existing_card.data[0]
            return {
                "success": False, 
                "message": f"❌ Card {card_number} already exists in inventory",
                "card_number": card_number,
                "status": card["status"],
                "created_at": card["created_at"],
                "card_exists": True
            }
        
        # Create new card in inventory
        new_card = {
            "card_number": card_number,
            "status": CARD_STATUS_AVAILABLE, 
            "gym_owner_email": current_user["email"],
            "created_at": datetime.now().isoformat(),
            "assigned_to_member_id": None,
            "assigned_date": None
        }
        
        result = supabase_admin.table("card_inventory").insert(new_card).execute()
        
        if not result.data:
            return {
                "success": False,
                "message": "❌ Failed to add card to inventory",
                "error": "Database insertion failed"
            }
        
        logger.info(f"New card {card_number} added to inventory for {current_user['email']}")
        
        return {
            "success": True, 
            "message": f"✅ Card {card_number} registered and available for assignment!", 
            "card_number": card_number,
            "status": CARD_STATUS_AVAILABLE,
            "is_new_card": True,
            "created_at": new_card["created_at"]
        }
        
    except Exception as e:
        logger.error(f"Scan new card error: {str(e)}")
        return {
            "success": False,
            "message": f"❌ Failed to register card: {str(e)}",
            "error": str(e)
        }

@app.get("/api/admin/validate-card/{card_number}")
async def validate_card_for_assignment(card_number: str, current_user=Depends(get_current_user)):
    """Validate if card is available for assignment"""
    try:
        card_result = supabase_admin.table("card_inventory").select("*").eq(
            "card_number", card_number.upper()
        ).eq("gym_owner_email", current_user["email"]).execute()
        
        if not card_result.data:
            raise HTTPException(status_code=404, detail="Card not found")
        
        card = card_result.data[0]
        
        if card["status"] != CARD_STATUS_AVAILABLE:
            raise HTTPException(status_code=400, detail=f"Card not available. Status: {card['status']}")
        
        return {
            "card_number": card["card_number"],
            "status": card["status"],
            "message": "✅ Card available for assignment",
            "ready_for_assignment": True,
            "created_at": card["created_at"]
        }
        
    except Exception as e:
        logger.error(f"Card validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/generate-card-qr-batch")
async def generate_card_qr_batch(batch: CardBatch, current_user=Depends(get_current_user)):
    """Generate QR codes for physical card printing"""
    try:
        if batch.end - batch.start > 500:
            raise HTTPException(status_code=400, detail="Maximum 500 cards per batch")
        
        qr_codes = []
        
        for i in range(batch.start, batch.end + 1):
            card_number = f"{batch.prefix}{i:03d}"
            qr_data = f"gymsphere:{card_number}"
            
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=8,
                border=2,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            qr_img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            qr_img.save(buffer, format='PNG')
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            qr_codes.append({
                "card_number": card_number,
                "qr_data": qr_data,
                "qr_image_base64": f"data:image/png;base64,{qr_base64}"
            })
        
        return {
            "message": f"✅ Generated QR codes for {len(qr_codes)} cards",
            "batch_range": f"{batch.prefix}{batch.start:03d} to {batch.prefix}{batch.end:03d}",
            "total_codes": len(qr_codes),
            "qr_codes": qr_codes,
            "print_instructions": [
                "Download and print these QR codes on card-sized paper",
                "Cut each QR code to fit on physical card",
                "Attach QR codes to blank cards",
                "Cards are now ready for member assignment"
            ]
        }
        
    except Exception as e:
        logger.error(f"QR batch generation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/bulk-card-operation")
async def bulk_card_operation(operation: BulkCardOperation, current_user=Depends(get_current_user)):
    """Perform bulk operations on multiple cards"""
    try:
        if len(operation.card_numbers) > 100:
            raise HTTPException(status_code=400, detail="Maximum 100 cards per bulk operation")
        
        valid_operations = ['delete', 'mark_lost', 'mark_damaged', 'mark_available']
        if operation.operation not in valid_operations:
            raise HTTPException(status_code=400, detail=f"Invalid operation. Must be one of: {valid_operations}")
        
        # Validate all cards belong to this gym owner
        cards_result = supabase_admin.table("card_inventory").select("*").in_(
            "card_number", operation.card_numbers
        ).eq("gym_owner_email", current_user["email"]).execute()
        
        found_cards = [card["card_number"] for card in cards_result.data or []]
        missing_cards = set(operation.card_numbers) - set(found_cards)
        
        if missing_cards:
            return {
                "success": False,
                "message": f"❌ Cards not found: {', '.join(list(missing_cards)[:5])}",
                "missing_cards": list(missing_cards)
            }
        
        success_count = 0
        errors = []
        
        for card_number in operation.card_numbers:
            try:
                if operation.operation == 'delete':
                    # Unassign from member first if assigned
                    supabase_admin.table("members").update({"card_id": None}).eq(
                        "card_id", card_number
                    ).eq("owner_email", current_user["email"]).execute()
                    
                    # Delete card
                    supabase_admin.table("card_inventory").delete().eq(
                        "card_number", card_number
                    ).eq("gym_owner_email", current_user["email"]).execute()
                    
                elif operation.operation == 'mark_lost':
                    # Update status and unassign
                    supabase_admin.table("members").update({"card_id": None}).eq(
                        "card_id", card_number
                    ).eq("owner_email", current_user["email"]).execute()
                    
                    supabase_admin.table("card_inventory").update({
                        "status": CARD_STATUS_LOST,
                        "assigned_to_member_id": None,
                        "assigned_date": None,
                        "status_updated_at": datetime.now().isoformat()
                    }).eq("card_number", card_number).eq("gym_owner_email", current_user["email"]).execute()
                    
                elif operation.operation == 'mark_damaged':
                    # Update status and unassign
                    supabase_admin.table("members").update({"card_id": None}).eq(
                        "card_id", card_number
                    ).eq("owner_email", current_user["email"]).execute()
                    
                    supabase_admin.table("card_inventory").update({
                        "status": CARD_STATUS_DAMAGED,
                        "assigned_to_member_id": None,
                        "assigned_date": None,
                        "status_updated_at": datetime.now().isoformat()
                    }).eq("card_number", card_number).eq("gym_owner_email", current_user["email"]).execute()
                    
                elif operation.operation == 'mark_available':
                    # Mark as available and unassign
                    supabase_admin.table("members").update({"card_id": None}).eq(
                        "card_id", card_number
                    ).eq("owner_email", current_user["email"]).execute()
                    
                    supabase_admin.table("card_inventory").update({
                        "status": CARD_STATUS_AVAILABLE,
                        "assigned_to_member_id": None,
                        "assigned_date": None,
                        "status_updated_at": datetime.now().isoformat()
                    }).eq("card_number", card_number).eq("gym_owner_email", current_user["email"]).execute()
                
                success_count += 1
                
            except Exception as card_error:
                errors.append(f"{card_number}: {str(card_error)}")
        
        return {
            "success": True,
            "message": f"✅ Bulk operation completed. {success_count}/{len(operation.card_numbers)} cards processed",
            "operation": operation.operation,
            "processed_count": success_count,
            "total_count": len(operation.card_numbers),
            "errors": errors if errors else None,
            "reason": operation.reason
        }
        
    except Exception as e:
        logger.error(f"Bulk card operation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ========================================
# MEMBER MANAGEMENT ENDPOINTS
# ========================================

@app.post("/api/members")
async def add_member(member: MemberCreate, current_user=Depends(get_current_user)):
    """Register member with optional QR-scanned card assignment"""
    try:
        # Check for existing member
        exists = supabase_admin.table("members").select("id").eq("email", member.email).eq(
            "owner_email", current_user["email"]
        ).execute()
        if exists.data:
            raise HTTPException(status_code=400, detail="Member with this email already exists.")

        # Validate card if provided
        if member.card_number:
            card_check = supabase_admin.table("card_inventory").select("*").eq(
                "card_number", member.card_number.upper()
            ).eq("gym_owner_email", current_user["email"]).execute()
            
            if not card_check.data:
                raise HTTPException(status_code=400, detail="Card number not found in inventory")
            if card_check.data[0]["status"] != CARD_STATUS_AVAILABLE:
                raise HTTPException(status_code=400, detail=f"Card not available. Status: {card_check.data[0]['status']}")

        # Calculate subscription dates
        start_date = datetime.now()
        if member.membership_type == "monthly":
            end_date = start_date + timedelta(days=30)
        elif member.membership_type == "quarterly":
            end_date = start_date + timedelta(days=90)
        elif member.membership_type == "yearly":
            end_date = start_date + timedelta(days=365)
        else:
            raise HTTPException(status_code=400, detail="Invalid membership type. Must be: monthly, quarterly, or yearly")

        # Prepare member data
        member_data = {
            "full_name": member.full_name,
            "email": member.email,
            "phone": member.phone,
            "membership_type": member.membership_type,
            "card_id": member.card_number.upper() if member.card_number else None,
            "subscription_start": start_date.isoformat(),
            "subscription_end": end_date.isoformat(),
            "is_active": True,
            "owner_email": current_user["email"],
            "created_at": datetime.now().isoformat()
        }

        # Insert member
        result = supabase_admin.table("members").insert(member_data).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to add member.")

        created_member = result.data[0]

        # Update card status if card was assigned
        if member.card_number:
            card_update_result = supabase_admin.table("card_inventory").update({
                "status": CARD_STATUS_ASSIGNED,
                "assigned_to_member_id": created_member["id"],
                "assigned_date": datetime.now().isoformat()
            }).eq("card_number", member.card_number.upper()).eq("gym_owner_email", current_user["email"]).execute()
            
            if not card_update_result.data:
                logger.error(f"Failed to update card {member.card_number} status to assigned")
            else:
                logger.info(f"Card {member.card_number} assigned to member {created_member['id']}")

        # Create authentication for member if requested
        auth_created = False
        auth_error = None
        
        if member.create_login:
            try:
                auth_response = supabase_admin.auth.admin.create_user({
                    "email": member.email,
                    "password": DEFAULT_MEMBER_PASSWORD,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": member.full_name,
                        "membership_type": member.membership_type,
                        "card_number": member.card_number,
                        "is_gym_member": True
                    }
                })
                
                if auth_response.user:
                    auth_created = True
                    logger.info(f"Login credentials created for {member.email}")
                else:
                    auth_error = "Failed to create login credentials"
                    
            except Exception as auth_err:
                auth_error = str(auth_err)
                logger.error(f"Auth creation error for {member.email}: {auth_err}")

        return {
            **created_member,
            "login_created": auth_created,
            "default_password": DEFAULT_MEMBER_PASSWORD if auth_created else None,
            "auth_error": auth_error,
            "message": f"✅ Member registered successfully!" + (f" Card {member.card_number} assigned." if member.card_number else ""),
            "instructions": f"Member {member.full_name} has been added to the gym." + (f" Physical card {member.card_number} can now be given to the member." if member.card_number else " Assign a card when ready.")
        }
        
    except Exception as e:
        logger.error(f"Add member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/members")
async def list_members(current_user=Depends(get_current_user)):
    """List all members for this gym owner with card information"""
    try:
        result = supabase_admin.table("members").select("*").eq(
            "owner_email", current_user["email"]
        ).order("created_at", desc=True).execute()
        
        members = result.data or []
        
        # Enhance with card information and subscription status
        for member in members:
            # Check subscription status
            if member.get("subscription_end"):
                try:
                    end_date = datetime.fromisoformat(member["subscription_end"].replace('Z', '+00:00'))
                    is_active = end_date > datetime.now(timezone.utc) and member.get("is_active", True)
                    member["subscription_active"] = is_active
                    member["days_remaining"] = (end_date.date() - datetime.now().date()).days
                except:
                    member["subscription_active"] = False
                    member["days_remaining"] = -1
            
            # Get card details if assigned
            if member.get("card_id"):
                card_result = supabase_admin.table("card_inventory").select(
                    "status, created_at"
                ).eq("card_number", member["card_id"]).execute()
                
                if card_result.data:
                    member["card_details"] = card_result.data[0]
        return {
            "members": members, 
            "count": len(members),
            "active_count": len([m for m in members if m.get("subscription_active", False)]),
            "with_cards": len([m for m in members if m.get("card_id")])
        }
    except Exception as e:
        logger.error(f"List members error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/members/{member_id}")
async def get_member(member_id: int, current_user=Depends(get_current_user)):
    """Get detailed information about a specific member"""
    try:
        result = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = result.data[0]
        
        # Get access logs for this member
        access_logs = supabase_admin.table("access_logs").select("*").eq(
            "member_id", member_id
        ).order("timestamp", desc=True).limit(10).execute()
        
        member["recent_access"] = access_logs.data or []
        
        # Get card details if assigned
        if member.get("card_id"):
            card_result = supabase_admin.table("card_inventory").select("*").eq(
                "card_number", member["card_id"]
            ).execute()
            
            if card_result.data:
                member["card_details"] = card_result.data[0]
        
        return member
    except Exception as e:
        logger.error(f"Get member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/members/{member_id}")
async def update_member(member_id: int, member_update: MemberUpdate, current_user=Depends(get_current_user)):
    """Update member information"""
    try:
        existing_member = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).execute()
        
        if not existing_member.data:
            raise HTTPException(status_code=404, detail="Member not found")

        update_data = {k: v for k, v in member_update.dict().items() if v is not None}
        
        # Remove fields that shouldn't be updated
        update_data.pop('owner_email', None)
        update_data.pop('created_at', None)
        update_data.pop('id', None)
        
        if update_data:
            result = supabase_admin.table("members").update(update_data).eq("id", member_id).execute()
            return {
                "message": "✅ Member updated successfully", 
                "updated_fields": list(update_data.keys()),
                "member_id": member_id
            }
        
        return {"message": "No changes made"}
    except Exception as e:
        logger.error(f"Update member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/members/{member_id}")
async def delete_member(member_id: int, current_user=Depends(get_current_user)):
    """Delete member and release assigned card"""
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).execute()
        
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        # Release assigned card if any
        if member.get("card_id"):
            supabase_admin.table("card_inventory").update({
                "status": CARD_STATUS_AVAILABLE,
                "assigned_to_member_id": None,
                "assigned_date": None
            }).eq("card_number", member["card_id"]).execute()
        
        # Delete member
        supabase_admin.table("members").delete().eq("id", member_id).execute()
        
        # Try to delete auth user
        try:
            users_result = supabase_admin.auth.admin.list_users()
            if users_result.users:
                for user in users_result.users:
                    if user.email == member["email"]:
                        supabase_admin.auth.admin.delete_user(user.id)
                        logger.info(f"Deleted auth user for {member['email']}")
                        break
        except Exception as auth_err:
            logger.warning(f"Could not delete auth user for {member['email']}: {auth_err}")
        
        return {
            "message": f"✅ Member {member['full_name']} deleted successfully",
            "released_card": member.get("card_id"),
            "member_id": member_id
        }
    except Exception as e:
        logger.error(f"Delete member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ========================================
# CARD ASSIGNMENT ENDPOINTS
# ========================================

@app.post("/api/members/{member_id}/assign-card/{card_number}")
async def assign_card_to_member(member_id: int, card_number: str, current_user=Depends(get_current_user)):
    """Assign a QR card to an existing member"""
    try:
        card_number = card_number.upper()
        
        # Validate card exists and is available
        card_check = supabase_admin.table("card_inventory").select("*").eq(
            "card_number", card_number
        ).eq("gym_owner_email", current_user["email"]).execute()
        
        if not card_check.data:
            raise HTTPException(status_code=404, detail="Card not found in inventory.")
        
        card = card_check.data[0]
        if card["status"] != CARD_STATUS_AVAILABLE:
            raise HTTPException(status_code=400, detail=f"Card not available. Status: {card['status']}")
        
        # Validate member exists and belongs to this gym owner
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]).execute()
        
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found.")

        member = member_result.data[0]
        
        # Release previous card if member has one
        if member.get("card_id"):
            old_card = member["card_id"]
            supabase_admin.table("card_inventory").update({
                "status": CARD_STATUS_AVAILABLE,
                "assigned_to_member_id": None,
                "assigned_date": None
            }).eq("card_number", old_card).execute()
            logger.info(f"Released old card {old_card} from member {member_id}")

        # Assign new card to member
        supabase_admin.table("members").update({
            "card_id": card_number,
            "updated_at": datetime.now().isoformat()
        }).eq("id", member_id).execute()

        # Update card status to assigned
        supabase_admin.table("card_inventory").update({
            "status": CARD_STATUS_ASSIGNED,
            "assigned_to_member_id": member_id,
            "assigned_date": datetime.now().isoformat()
        }).eq("card_number", card_number).execute()

        return {
            "message": f"✅ Card {card_number} assigned to {member['full_name']}",
            "member_id": member_id,
            "member_name": member["full_name"],
            "card_number": card_number,
            "previous_card": member.get("card_id"),
            "assignment_date": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Assign card error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/members/{member_id}/unassign-card")
async def unassign_card_from_member(member_id: int, current_user=Depends(get_current_user)):
    """Remove QR card from a member and return it to available status"""
    try:
        member = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).execute()
        
        if not member.data or not member.data[0].get("card_id"):
            raise HTTPException(status_code=404, detail="Member not found or no card assigned.")
        
        member_data = member.data[0]
        card_number = member_data["card_id"]
        
        # Remove card from member
        supabase_admin.table("members").update({
            "card_id": None,
            "updated_at": datetime.now().isoformat()
        }).eq("id", member_id).execute()
        
        # Return card to available status
        supabase_admin.table("card_inventory").update({
            "status": CARD_STATUS_AVAILABLE,
            "assigned_to_member_id": None,
            "assigned_date": None
        }).eq("card_number", card_number).execute()
        
        return {
            "message": f"✅ Card {card_number} unassigned from {member_data['full_name']}",
            "member_id": member_id,
            "member_name": member_data["full_name"],
            "released_card": card_number,
            "card_status": CARD_STATUS_AVAILABLE
        }
    except Exception as e:
        logger.error(f"Unassign card error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ========================================
# QR CODE & ACCESS VERIFICATION
# ========================================

@app.get("/api/qr/scan/{card_number}")
async def scan_qr_card(card_number: str, current_user=Depends(get_current_user)):
    """Scan QR card and get member info with live subscription status"""
    try:
        card_number = card_number.upper()
        
        # Find card in inventory
        card_result = supabase_admin.table("card_inventory").select("*").eq(
            "card_number", card_number
        ).eq("gym_owner_email", current_user["email"]).execute()
        
        if not card_result.data:
            raise HTTPException(status_code=404, detail="Card not found in inventory")
        
        card = card_result.data[0]
        if card["status"] != CARD_STATUS_ASSIGNED:
            raise HTTPException(status_code=400, detail=f"Card not assigned to any member. Status: {card['status']}")
        
        # Find member with this card
        member_result = supabase_admin.table("members").select("*").eq(
            "card_id", card_number
        ).eq("owner_email", current_user["email"]).execute()
        
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found for this card")
        
        member = member_result.data[0]
        
        # Check live subscription status
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        is_subscription_valid = subscription_end > datetime.now(timezone.utc)
        is_active = is_subscription_valid and member["is_active"]
        
        # Log access attempt
        log_data = {
            "member_id": member["id"],
            "access_type": "card_scan",
            "access_granted": is_active,
            "card_number": card_number,
            "timestamp": datetime.now().isoformat(),
            "failure_reason": None if is_active else ("Subscription expired" if not is_subscription_valid else "Member inactive")
        }
        try:
            supabase_admin.table("access_logs").insert(log_data).execute()
        except:
            logger.warning(f"Failed to log access attempt for card {card_number}")
        
        return {
            "member_name": member["full_name"],
            "email": member["email"],
            "member_id": member["id"],
            "status": "Active" if is_active else "Expired",
            "membership_type": member["membership_type"],
            "subscription_end": member["subscription_end"],
            "access_granted": is_active,
            "message": f"✅ Welcome {member['full_name']}!" if is_active else "❌ Access Denied - Subscription Issue",
            "card_number": card_number
        }
    except Exception as e:
        logger.error(f"Scan QR card error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/card/verify")
async def verify_card(request: CardVerifyRequest):
    """Verify card access at gym entrance (public endpoint for entry systems)"""
    try:
        card_number = request.card_number.upper()
        
        # Find member with this card number
        member_result = supabase_admin.table("members").select("*").eq(
            "card_id", card_number
        ).execute()
        
        if not member_result.data:
            # Log failed access attempt
            log_data = {
                "member_id": None,
                "access_type": "card_verify",
                "access_granted": False,
                "card_number": card_number,
                "timestamp": datetime.now().isoformat(),
                "failure_reason": "Invalid card number"
            }
            try:
                supabase_admin.table("access_logs").insert(log_data).execute()
            except:
                pass
            
            return {
                "access_granted": False,
                "message": "❌ Invalid Card Number",
                "member_name": "Unknown",
                "timestamp": datetime.now().isoformat()
            }
            
        member = member_result.data[0]
        
        # Check subscription status
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        is_subscription_valid = subscription_end > datetime.now(timezone.utc)
        is_active = is_subscription_valid and member["is_active"]
        
        # Log access attempt
        log_data = {
            "member_id": member["id"],
            "access_type": "card_verify",
            "access_granted": is_active,
            "card_number": card_number,
            "timestamp": datetime.now().isoformat(),
            "failure_reason": None if is_active else ("Subscription expired" if not is_subscription_valid else "Member inactive")
        }
        try:
            supabase_admin.table("access_logs").insert(log_data).execute()
        except:
            pass
        
        if is_active:
            return {
                "access_granted": True,
                "message": f"✅ Welcome {member['full_name']}!",
                "member_name": member["full_name"],
                "membership_type": member["membership_type"],
                "subscription_end": member["subscription_end"],
                "timestamp": datetime.now().isoformat()
            }
        else:
            failure_message = "❌ Subscription Expired" if not is_subscription_valid else "❌ Member Account Inactive"
            return {
                "access_granted": False,
                "message": failure_message,
                "member_name": member["full_name"],
                "subscription_end": member["subscription_end"],
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Card verify error: {str(e)}")
        
        # Log system error
        error_log = {
            "member_id": None,
            "access_type": "card_verify",
            "access_granted": False,
            "card_number": request.card_number,
            "timestamp": datetime.now().isoformat(),
            "failure_reason": "System error"
        }
        try:
            supabase_admin.table("access_logs").insert(error_log).execute()
        except:
            pass
            
        return {
            "access_granted": False,
            "message": "❌ System Error - Please Contact Staff",
            "member_name": "Unknown",
            "timestamp": datetime.now().isoformat()
        }

# ========================================
# QR CODE SYSTEM (Backup Access Method)
# ========================================

@app.post("/api/qr/generate")
async def generate_qr(request: QRRequest):
    """Generate temporary QR code for member access"""
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", request.member_id).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")

        member = member_result.data[0]
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        if subscription_end < datetime.now(timezone.utc):
            raise HTTPException(status_code=403, detail="Subscription expired")

        current_ts = int(datetime.now().timestamp())
        qr_data = f"gymsphere:{member['id']}:{member['email']}:{current_ts}"

        # Generate QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()

        return {
            "qr_code": f"data:image/png;base64,{img_str}",
            "qr_data": qr_data,
            "expires_at": datetime.fromtimestamp(current_ts + QR_EXPIRY_SECONDS).isoformat(),
            "member": {
                "id": member["id"],
                "name": member["full_name"],
                "card_number": member.get("card_id"),
                "subscription_end": member["subscription_end"],
            },
        }
    except Exception as e:
        logger.error(f"QR generation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/qr/verify")
async def verify_qr(request: QRVerifyRequest):
    """Verify temporary QR code for access"""
    try:
        parts = request.qr_data.split(":")
        if len(parts) != 4 or parts[0] != "gymsphere":
            raise HTTPException(status_code=400, detail="Invalid QR format")

        member_id = int(parts[1])
        qr_timestamp = int(parts[3])

        # Check if QR code is expired
        current_ts = int(datetime.now().timestamp())
        if current_ts - qr_timestamp > QR_EXPIRY_SECONDS:
            raise HTTPException(status_code=400, detail=f"QR expired (valid for {QR_EXPIRY_SECONDS//60} minutes)")

        # Validate member
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]

        # Check subscription status
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        is_subscription_valid = subscription_end > datetime.now(timezone.utc)
        is_active = is_subscription_valid and member["is_active"]

        # Log access attempt
        log_data = {
            "member_id": member["id"],
            "access_type": "qr_verify",
            "access_granted": is_active,
            "timestamp": datetime.now().isoformat(),
            "failure_reason": None if is_active else ("Subscription expired" if not is_subscription_valid else "Member inactive")
        }
        try:
            supabase_admin.table("access_logs").insert(log_data).execute()
        except:
            pass

        if is_active:
            return {
                "access_granted": True,
                "member": {
                    "id": member["id"],
                    "name": member["full_name"],
                    "membership_type": member["membership_type"],
                    "card_number": member.get("card_id"),
                },
                "message": f"✅ Welcome {member['full_name']}!",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "access_granted": False,
                "message": "❌ Access Denied - Subscription Expired" if not is_subscription_valid else "❌ Access Denied - Account Inactive",
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"QR verify error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ========================================
# MEMBER UTILITY ENDPOINTS
# ========================================

@app.post("/api/members/{member_id}/reset-password")
async def reset_member_password(member_id: int, current_user=Depends(get_current_user)):
    """Reset member's login password to default"""
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        # Find and update auth user
        users_result = supabase_admin.auth.admin.list_users()
        if users_result.users:
            for user in users_result.users:
                if user.email == member["email"]:
                    supabase_admin.auth.admin.update_user_by_id(
                        user.id,
                        {"password": DEFAULT_MEMBER_PASSWORD}
                    )
                    return {
                        "message": f"✅ Password reset for {member['full_name']}",
                        "new_password": DEFAULT_MEMBER_PASSWORD,
                        "email": member["email"],
                        "member_id": member_id
                    }
            
        raise HTTPException(status_code=404, detail="Auth user not found for this member")
            
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/members/{member_id}/credentials")
async def get_member_credentials(member_id: int, current_user=Depends(get_current_user)):
    """Get member's login credentials for sharing"""
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        return {
            "member_name": member["full_name"],
            "email": member["email"],
            "card_number": member.get("card_id", "Not assigned"),
            "default_password": DEFAULT_MEMBER_PASSWORD,
            "member_portal_url": "http://localhost:5173",
            "instructions": "Share these credentials with the member to access their portal.",
            "member_id": member_id
        }
            
    except Exception as e:
        logger.error(f"Get credentials error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ========================================
# ANALYTICS & REPORTING
# ========================================

@app.get("/api/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get comprehensive dashboard statistics"""
    try:
        # Get member statistics
        members_result = supabase_admin.table("members").select("*").eq(
            "owner_email", current_user["email"]
        ).execute()
        members = members_result.data or []

        total_members = len(members)
        now = datetime.now(timezone.utc)

        # Calculate active members
        active_members = 0
        for member in members:
            if member["is_active"]:
                try:
                    end_date = datetime.fromisoformat(member["subscription_end"].replace('Z', '+00:00'))
                    if end_date > now:
                        active_members += 1
                except:
                    pass

        expired_members = total_members - active_members

        # Joins this month
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        joins_this_month = 0
        for member in members:
            try:
                created_date = datetime.fromisoformat(member["created_at"].replace('Z', '+00:00'))
                if created_date >= start_of_month:
                    joins_this_month += 1
            except:
                pass

        # Card statistics
        cards_result = supabase_admin.table("card_inventory").select("status").eq(
            "gym_owner_email", current_user["email"]
        ).execute()
        cards = cards_result.data or []
        
        total_cards = len(cards)
        available_cards = sum(1 for card in cards if card["status"] == CARD_STATUS_AVAILABLE)
        assigned_cards = sum(1 for card in cards if card["status"] == CARD_STATUS_ASSIGNED)
        lost_damaged_cards = sum(1 for card in cards if card["status"] in [CARD_STATUS_LOST, CARD_STATUS_DAMAGED])

        # Access statistics
        today = datetime.now().date()
        access_today_result = supabase_admin.table("access_logs").select("id").gte(
            "timestamp", today.isoformat()
        ).eq("access_granted", True).execute()
        access_today = len(access_today_result.data or [])

        return {
            "total_members": total_members,
            "active_members": active_members,
            "expired_members": expired_members,
            "joins_this_month": joins_this_month,
            "access_today": access_today,
            "card_stats": {
                "total_cards": total_cards,
                "available_cards": available_cards,
                "assigned_cards": assigned_cards,
                "lost_damaged_cards": lost_damaged_cards,
                "utilization_rate": round((assigned_cards / total_cards * 100), 2) if total_cards > 0 else 0
            },
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Dashboard stats error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to fetch dashboard stats")

@app.get("/api/access/logs")
async def get_access_logs(limit: int = 50, current_user=Depends(get_current_user)):
    """Get recent access logs with member information"""
    try:
        # Get access logs with member information
        logs_result = supabase_admin.table("access_logs").select("*").order(
            "timestamp", desc=True
        ).limit(limit).execute()
        
        logs = []
        for log in logs_result.data or []:
            # Get member info if member_id exists
            if log.get("member_id"):
                member_result = supabase_admin.table("members").select(
                    "full_name, email, card_id, membership_type"
                ).eq("id", log["member_id"]).eq("owner_email", current_user["email"]).execute()
                
                if member_result.data:
                    member = member_result.data[0]
                    transformed_log = {
                        "timestamp": log.get("timestamp"),
                        "member_name": member.get("full_name"),
                        "member_email": member.get("email"),
                        "card_number": member.get("card_id"),
                        "membership_type": member.get("membership_type"),
                        "access_granted": log.get("access_granted", False),
                        "access_type": log.get("access_type", "unknown"),
                        "failure_reason": log.get("failure_reason")
                    }
                    logs.append(transformed_log)
            else:
                # Anonymous access attempt
                transformed_log = {
                    "timestamp": log.get("timestamp"),
                    "member_name": "Unknown",
                    "card_number": log.get("card_number"),
                    "access_granted": log.get("access_granted", False),
                    "access_type": log.get("access_type", "unknown"),
                    "failure_reason": log.get("failure_reason")
                }
                logs.append(transformed_log)
        
        return {"logs": logs, "count": len(logs)}
    except Exception as e:
        logger.error(f"Access logs error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/attendance-report")
async def get_attendance_report(current_user=Depends(get_current_user)):
    """Get detailed attendance report"""
    try:
        today = datetime.now().date()
        
        # Today's successful access logs
        today_logs = supabase_admin.table("access_logs").select("*").eq(
            "access_granted", True
        ).gte("timestamp", today.isoformat()).execute()
        
        # Week statistics
        week_ago = (datetime.now() - timedelta(days=7)).date()
        week_logs = supabase_admin.table("access_logs").select("id, member_id").eq(
            "access_granted", True
        ).gte("timestamp", week_ago.isoformat()).execute()
        
        # Unique visitors today
        unique_today = len(set([log["member_id"] for log in today_logs.data or [] if log.get("member_id")]))
        
        # Unique visitors this week
        unique_week = len(set([log["member_id"] for log in week_logs.data or [] if log.get("member_id")]))
        
        return {
            "today": {
                "total_visits": len(today_logs.data or []),
                "unique_visitors": unique_today,
                "visits": today_logs.data or []
            },
            "this_week": {
                "total_visits": len(week_logs.data or []),
                "unique_visitors": unique_week
            },
            "report_generated": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Attendance report error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ========================================
# LEGACY ENDPOINTS (Flask-style for compatibility)
# ========================================

@app.post("/add_member")
async def legacy_add_member(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    join_date: str = Form(...),
    end_date: str = Form(...)
):
    """Legacy Flask-style add member endpoint"""
    try:
        member_data = {
            'full_name': name,
            'email': email.strip().lower(),
            'phone': phone,
            'subscription_start': join_date,
            'subscription_end': end_date,
            'membership_type': 'monthly',  # Default
            'is_active': True,
            'owner_email': 'legacy@gym.com',  # Default for legacy
            'created_at': datetime.now().isoformat()
        }

        # Validate dates
        join_date_dt = datetime.strptime(join_date, "%Y-%m-%d")
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
        if end_date_dt < join_date_dt:
            request.session['messages'] = [{'category': 'error', 'message': 'Expiry date cannot be before join date'}]
            return RedirectResponse(url=url_for(request, 'index'), status_code=303)

        # Check for existing member
        existing = supabase_admin.table('members').select('email').eq('email', member_data['email']).execute()
        if existing.data:
            request.session['messages'] = [{'category': 'error', 'message': 'Email already exists'}]
            return RedirectResponse(url=url_for(request, 'index'), status_code=303)

        # Insert member
        response = supabase_admin.table('members').insert(member_data).execute()
        if response.error:
            raise Exception(response.error.message)

        request.session['messages'] = [{'category': 'success', 'message': 'Member added successfully!'}]
        return RedirectResponse(url=url_for(request, 'index'), status_code=303)

    except Exception as e:
        error_msg = str(e)
        if '23505' in error_msg:
            msg = 'Email already registered'
        else:
            msg = f'Error adding member: {error_msg}'
        request.session['messages'] = [{'category': 'error', 'message': msg}]
        return RedirectResponse(url=url_for(request, 'index'), status_code=303)

@app.get("/delete_member/{member_id}", name="delete_member")
async def legacy_delete_member(request: Request, member_id: int):
    """Legacy Flask-style delete member endpoint"""
    try:
        # Get member info first
        member_result = supabase_admin.table('members').select('*').eq('id', member_id).execute()
        if member_result.data:
            member = member_result.data[0]
            # Release card if assigned
            if member.get('card_id'):
                supabase_admin.table('card_inventory').update({
                    'status': CARD_STATUS_AVAILABLE,
                    'assigned_to_member_id': None,
                    'assigned_date': None
                }).eq('card_number', member['card_id']).execute()
        
        # Delete member
        supabase_admin.table('members').delete().eq('id', member_id).execute()
        request.session['messages'] = [{'category': 'success', 'message': 'Member deleted!'}]
    except Exception as e:
        request.session['messages'] = [{'category': 'error', 'message': f'Delete error: {str(e)}'}]
    return RedirectResponse(url=url_for(request, 'index'), status_code=303)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
