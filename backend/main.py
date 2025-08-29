from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from supabase import create_client
from dotenv import load_dotenv
import qrcode
import io
import base64
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
from passlib.context import CryptContext
import logging

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
    description="Professional Gym Management System with QR Card Assignment"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
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
    card_number: Optional[str] = None  # Now comes from QR scan
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
    phone: Optional[str] = None
    membership_type: Optional[str] = None
    is_active: Optional[bool] = None

# NEW: QR Card Scan Model
class QRCardScanRequest(BaseModel):
    qr_data: str

# Authentication Helper Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
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
    email = verify_token(credentials.credentials)
    return {"email": email}

# Root Endpoint
@app.get("/")
async def root():
    return {
        "message": "GymSphere API running", 
        "version": app.version,
        "features": ["Member Management", "QR Card Assignment", "Barcode Access", "Attendance Tracking"]
    }

# Authentication Endpoints
@app.post("/api/auth/register")
async def register(user: UserCreate):
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

# NEW: QR Card Assignment Endpoints
@app.post("/api/admin/scan-card-qr")
async def scan_card_qr(request: QRCardScanRequest, current_user=Depends(get_current_user)):
    """Scan QR code from physical card to validate and prepare for assignment"""
    try:
        # Extract card number from QR data
        qr_data = request.qr_data.strip()
        
        # Support multiple QR formats:
        # Format 1: "ABC001" (simple card number)
        # Format 2: "gymsphere:ABC001" (prefixed format)
        # Format 3: "https://yourdomain.com/card/ABC001" (URL format)
        
        card_number = None
        
        if ":" in qr_data:
            # Handle prefixed format: "gymsphere:ABC001"
            parts = qr_data.split(":")
            if len(parts) >= 2:
                card_number = parts[-1]  # Get last part as card number
        elif "/" in qr_data:
            # Handle URL format: "https://yourdomain.com/card/ABC001"
            card_number = qr_data.split("/")[-1]
        else:
            # Handle simple format: "ABC001"
            card_number = qr_data
        
        if not card_number:
            raise HTTPException(status_code=400, detail="Invalid QR code format")
        
        # Validate card exists and is available
        card_result = supabase_admin.table("card_inventory").select("*").eq(
            "card_number", card_number
        ).eq("gym_owner_email", current_user["email"]).single().execute()
        
        if not card_result.data:
            return {
                "success": False,
                "message": "❌ Card not found in your inventory",
                "card_number": card_number
            }
        
        card = card_result.data[0]
        
        if card["status"] != CARD_STATUS_AVAILABLE:
            return {
                "success": False,
                "message": f"❌ Card already {card['status']}",
                "card_number": card_number,
                "current_status": card["status"]
            }
        
        # Card is valid and available
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
        raise HTTPException(status_code=400, detail=f"QR scan failed: {str(e)}")

@app.get("/api/admin/validate-card/{card_number}")
async def validate_card_for_assignment(card_number: str, current_user=Depends(get_current_user)):
    """Validate if card is available for assignment (called after QR scan)"""
    try:
        card_result = supabase_admin.table("card_inventory").select("*").eq(
            "card_number", card_number
        ).eq("gym_owner_email", current_user["email"]).single().execute()
        
        if not card_result.data:
            raise HTTPException(status_code=404, detail="Card not found")
        
        card = card_result.data[0]
        
        if card["status"] != CARD_STATUS_AVAILABLE:
            raise HTTPException(status_code=400, detail=f"Card not available. Status: {card['status']}")
        
        return {
            "card_number": card["card_number"],
            "status": card["status"],
            "message": "Card available for assignment",
            "ready_for_assignment": True
        }
        
    except Exception as e:
        logger.error(f"Card validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# NEW: Generate QR codes for card printing
@app.post("/api/admin/generate-card-qr-batch")
async def generate_card_qr_batch(batch: CardBatch, current_user=Depends(get_current_user)):
    """Generate QR codes for physical card printing"""
    try:
        if batch.end - batch.start > 500:
            raise HTTPException(status_code=400, detail="Maximum 500 cards per batch")
        
        qr_codes = []
        
        for i in range(batch.start, batch.end + 1):
            card_number = f"{batch.prefix}{i:03d}"
            
            # Generate QR code containing just the card number
            qr_data = f"gymsphere:{card_number}"
            
            # Create QR code image
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=8,
                border=2,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Convert to base64 for response
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
            "message": f"Generated QR codes for {len(qr_codes)} cards",
            "batch_range": f"{batch.prefix}{batch.start:03d} to {batch.prefix}{batch.end:03d}",
            "qr_codes": qr_codes
        }
        
    except Exception as e:
        logger.error(f"QR batch generation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Card Management Endpoints (Updated)
@app.post("/api/admin/add-card-batch")
async def add_card_batch(batch: CardBatch, current_user=Depends(get_current_user)):
    """Add a batch of cards to inventory"""
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
                "created_at": datetime.now().isoformat()
            })
        
        # Check for duplicate card numbers
        existing_cards = supabase_admin.table("card_inventory").select("card_number").in_(
            "card_number", [card["card_number"] for card in cards]
        ).execute()
        
        if existing_cards.data:
            duplicate_numbers = [card["card_number"] for card in existing_cards.data]
            raise HTTPException(status_code=400, detail=f"Cards already exist: {', '.join(duplicate_numbers[:5])}")
        
        # Insert cards into card_inventory table
        result = supabase_admin.table("card_inventory").insert(cards).execute()
        
        return {
            "message": f"Added {len(cards)} cards to inventory",
            "cards_added": len(cards),
            "range": f"{batch.prefix}{batch.start:03d} to {batch.prefix}{batch.end:03d}",
            "status": "success",
            "next_step": "Generate QR codes for printing using /api/admin/generate-card-qr-batch"
        }
    except Exception as e:
        logger.error(f"Add card batch error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/available-cards")
async def get_available_cards(current_user=Depends(get_current_user)):
    """Get all available cards for this gym owner"""
    try:
        result = supabase_admin.table("card_inventory").select("card_number").eq(
            "gym_owner_email", current_user["email"]
        ).eq("status", CARD_STATUS_AVAILABLE).order("card_number").execute()
        return {"cards": result.data, "count": len(result.data or [])}
    except Exception as e:
        logger.error(f"Get available cards error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/card-inventory")
async def get_card_inventory(current_user=Depends(get_current_user)):
    """Get full card inventory for this gym"""
    try:
        result = supabase_admin.table("card_inventory").select("""
            *,
            members(full_name, email, membership_type)
        """).eq("gym_owner_email", current_user["email"]).order("card_number").execute()
        
        return {"inventory": result.data, "total": len(result.data or [])}
    except Exception as e:
        logger.error(f"Get card inventory error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/admin/card/{card_number}/status")
async def update_card_status(card_number: str, status: str, current_user=Depends(get_current_user)):
    """Update card status (lost, damaged, etc.)"""
    try:
        valid_statuses = [CARD_STATUS_AVAILABLE, CARD_STATUS_ASSIGNED, CARD_STATUS_LOST, CARD_STATUS_DAMAGED]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        result = supabase_admin.table("card_inventory").update({
            "status": status,
            "assigned_at": datetime.now().isoformat() if status == CARD_STATUS_LOST else None
        }).eq("card_number", card_number).eq("gym_owner_email", current_user["email"]).execute()
        
        return {"message": f"Card {card_number} status updated to {status}"}
    except Exception as e:
        logger.error(f"Update card status error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Member Management Endpoints (Updated for QR Assignment)
@app.post("/api/members")
async def add_member(member: MemberCreate, current_user=Depends(get_current_user)):
    """Register member with QR-scanned card assignment"""
    try:
        # Check if member already exists
        exists = supabase_admin.table("members").select("id").eq("email", member.email).eq(
            "owner_email", current_user["email"]
        ).execute()
        if exists.data:
            raise HTTPException(status_code=400, detail="Member with this email already exists.")

        # Validate scanned card if provided
        if member.card_number:
            card_check = supabase_admin.table("card_inventory").select("*").eq(
                "card_number", member.card_number
            ).eq("gym_owner_email", current_user["email"]).single().execute()
            
            if not card_check.data:
                raise HTTPException(status_code=400, detail="Card number not found")
            if card_check.data["status"] != CARD_STATUS_AVAILABLE:
                raise HTTPException(status_code=400, detail=f"Card not available. Status: {card_check.data['status']}")

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

        # Create member data
        member_data = {
            "full_name": member.full_name,
            "email": member.email,
            "phone": member.phone,
            "membership_type": member.membership_type,
            "card_number": member.card_number,
            "subscription_start": start_date.isoformat(),
            "subscription_end": end_date.isoformat(),
            "is_active": True,
            "owner_email": current_user["email"]
        }

        # Insert member into database
        result = supabase_admin.table("members").insert(member_data).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to add member.")

        created_member = result.data[0]

        # INSTANTLY assign scanned card
        if member.card_number:
            supabase_admin.table("card_inventory").update({
                "status": CARD_STATUS_ASSIGNED,
                "assigned_to_member_id": created_member["id"],
                "assigned_at": datetime.now().isoformat()
            }).eq("card_number", member.card_number).execute()

        # Create login credentials if requested
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
                    logger.warning(f"Failed to create auth for {member.email}")
                    
            except Exception as auth_err:
                auth_error = str(auth_err)
                logger.error(f"Auth creation error for {member.email}: {auth_err}")

        return {
            **created_member,
            "login_created": auth_created,
            "default_password": DEFAULT_MEMBER_PASSWORD if auth_created else None,
            "auth_error": auth_error,
            "message": f"✅ Member registered successfully! Card {member.card_number} assigned instantly.",
            "instructions": f"Write '{member.full_name}' on physical card {member.card_number} and give to member."
        }
        
    except Exception as e:
        logger.error(f"Add member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/members")
async def list_members(current_user=Depends(get_current_user)):
    try:
        result = supabase_admin.table("members").select("*").eq(
            "owner_email", current_user["email"]
        ).order("created_at", desc=True).execute()
        return {"members": result.data if result.data else [], "count": len(result.data or [])}
    except Exception as e:
        logger.error(f"List members error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/members/{member_id}")
async def get_member(member_id: int, current_user=Depends(get_current_user)):
    try:
        result = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        return result.data
    except Exception as e:
        logger.error(f"Get member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/members/{member_id}")
async def update_member(member_id: int, member_update: MemberUpdate, current_user=Depends(get_current_user)):
    try:
        existing_member = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).single().execute()
        if not existing_member.data:
            raise HTTPException(status_code=404, detail="Member not found")

        update_data = {k: v for k, v in member_update.dict().items() if v is not None}
        if update_data:
            result = supabase_admin.table("members").update(update_data).eq("id", member_id).execute()
            return {"message": "Member updated successfully", "updated_fields": list(update_data.keys())}
        
        return {"message": "No changes made"}
    except Exception as e:
        logger.error(f"Update member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/members/{id}")
async def delete_member(id: int, current_user=Depends(get_current_user)):
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", id).eq(
            "owner_email", current_user["email"]
        ).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        # Release card back to available status
        if member.get("card_number"):
            supabase_admin.table("card_inventory").update({
                "status": CARD_STATUS_AVAILABLE,
                "assigned_to_member_id": None,
                "assigned_at": None
            }).eq("card_number", member["card_number"]).execute()
        
        # Delete from members table
        supabase_admin.table("members").delete().eq("id", id).execute()
        
        # Delete auth user if exists
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
        
        return {"message": f"Member {member['full_name']} deleted successfully and card {member.get('card_number', 'N/A')} released."}
    except Exception as e:
        logger.error(f"Delete member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Card Access & Verification
@app.post("/api/card/verify")
async def verify_card(request: CardVerifyRequest):
    """Verify card access at gym entrance"""
    try:
        member_result = supabase_admin.table("members").select("*").eq(
            "card_number", request.card_number
        ).single().execute()
        
        if not member_result.data:
            # Log failed access attempt
            log_data = {
                "member_id": None,
                "access_type": "card",
                "access_granted": False,
                "card_number": request.card_number,
                "timestamp": datetime.now().isoformat(),
                "failure_reason": "Invalid card number"
            }
            supabase_admin.table("access_logs").insert(log_data).execute()
            
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
        
        # Log the access attempt
        log_data = {
            "member_id": member["id"],
            "access_type": "card",
            "access_granted": is_active,
            "card_number": request.card_number,
            "timestamp": datetime.now().isoformat(),
            "failure_reason": None if is_active else ("Subscription expired" if not is_subscription_valid else "Member inactive")
        }
        supabase_admin.table("access_logs").insert(log_data).execute()
        
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
        error_log = {
            "member_id": None,
            "access_type": "card",
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

# QR Code System (Backup Access Method)
@app.post("/api/qr/generate")
async def generate_qr(request: QRRequest):
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
                "card_number": member.get("card_number"),
                "subscription_end": member["subscription_end"],
            },
        }
    except Exception as e:
        logger.error(f"QR generation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/qr/verify")
async def verify_qr(request: QRVerifyRequest):
    try:
        parts = request.qr_data.split(":")
        if len(parts) != 4 or parts[0] != "gymsphere":
            raise HTTPException(status_code=400, detail="Invalid QR format")

        member_id = int(parts[1])
        qr_timestamp = int(parts[3])

        current_ts = int(datetime.now().timestamp())
        if current_ts - qr_timestamp > QR_EXPIRY_SECONDS:
            raise HTTPException(status_code=400, detail=f"QR expired (valid for {QR_EXPIRY_SECONDS//60} minutes)")

        member_result = supabase_admin.table("members").select("*").eq("id", member_id).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        member = member_result.data[0]

        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        is_subscription_valid = subscription_end > datetime.now(timezone.utc)
        is_active = is_subscription_valid and member["is_active"]

        # Log the access attempt
        log_data = {
            "member_id": member["id"],
            "access_type": "qr",
            "access_granted": is_active,
            "timestamp": datetime.now().isoformat(),
            "failure_reason": None if is_active else ("Subscription expired" if not is_subscription_valid else "Member inactive")
        }
        supabase_admin.table("access_logs").insert(log_data).execute()

        if is_active:
            return {
                "access_granted": True,
                "member": {
                    "id": member["id"],
                    "name": member["full_name"],
                    "membership_type": member["membership_type"],
                    "card_number": member.get("card_number"),
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
# When gym owner scans QR during registration
@app.post("/api/admin/scan-new-card")
async def scan_new_card(request: QRCardScanRequest, current_user=Depends(get_current_user)):
    qr_data = request.qr_data  # "gymsphere:ABC001"
    card_number = qr_data.split(":")[-1]  # Extract "ABC001"
    
    # Check if card already exists
    existing_card = supabase_admin.table("card_inventory").select("*").eq("card_number", card_number).execute()
    
    if existing_card.data:
        # Card already registered
        if existing_card.data[0]["status"] == "assigned":
            return {"success": False, "message": "Card already assigned"}
        else:
            return {"success": True, "message": "Card available", "card_number": card_number}
    else:
        # NEW CARD - Create entry on first scan
        new_card = {
            "card_number": card_number,
            "status": "available", 
            "gym_owner_email": current_user["email"],
            "created_at": datetime.now().isoformat(),
            "first_scanned_at": datetime.now().isoformat()
        }
        supabase_admin.table("card_inventory").insert(new_card).execute()
        
        return {
            "success": True, 
            "message": f"New card {card_number} activated and ready!", 
            "card_number": card_number,
            "is_new_card": True
        }

# Member Utility Endpoints
@app.post("/api/members/{member_id}/reset-password")
async def reset_member_password(member_id: int, current_user=Depends(get_current_user)):
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).eq(
            "owner_email", current_user["email"]
        ).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        users_result = supabase_admin.auth.admin.list_users()
        if users_result.users:
            for user in users_result.users:
                if user.email == member["email"]:
                    supabase_admin.auth.admin.update_user_by_id(
                        user.id,
                        {"password": DEFAULT_MEMBER_PASSWORD}
                    )
                    return {
                        "message": f"Password reset successfully for {member['full_name']}",
                        "new_password": DEFAULT_MEMBER_PASSWORD,
                        "email": member["email"]
                    }
            
        raise HTTPException(status_code=404, detail="Auth user not found for this member")
            
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/members/{member_id}/credentials")
async def get_member_credentials(member_id: int, current_user=Depends(get_current_user)):
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
            "card_number": member.get("card_number", "Not assigned"),
            "default_password": DEFAULT_MEMBER_PASSWORD,
            "member_portal_url": "http://localhost:5173",
            "instructions": "Share these credentials with the member to access their portal."
        }
            
    except Exception as e:
        logger.error(f"Get credentials error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Analytics & Reporting
@app.get("/api/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    try:
        members_result = supabase_admin.table("members").select("*").eq(
            "owner_email", current_user["email"]
        ).execute()
        members = members_result.data or []

        total_members = len(members)
        now = datetime.now(timezone.utc)

        active_members = sum(
            1 for member in members
            if member["is_active"] and datetime.fromisoformat(member["subscription_end"].replace('Z', '+00:00')) > now
        )

        expired_members = total_members - active_members

        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        joins_this_month = sum(
            1 for member in members
            if datetime.fromisoformat(member["created_at"].replace('Z', '+00:00')) >= start_of_month
        )

        # Card statistics
        cards_result = supabase_admin.table("card_inventory").select("status").eq(
            "gym_owner_email", current_user["email"]
        ).execute()
        cards = cards_result.data or []
        
        total_cards = len(cards)
        available_cards = sum(1 for card in cards if card["status"] == CARD_STATUS_AVAILABLE)
        assigned_cards = sum(1 for card in cards if card["status"] == CARD_STATUS_ASSIGNED)
        lost_damaged_cards = sum(1 for card in cards if card["status"] in [CARD_STATUS_LOST, CARD_STATUS_DAMAGED])

        # Today's access count
        today = datetime.now().date()
        access_today_result = supabase_admin.table("access_logs").select("id").gte(
            "timestamp", today.isoformat()
        ).execute()
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
                "lost_damaged_cards": lost_damaged_cards
            }
        }
    except Exception as e:
        logger.error(f"Dashboard stats error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to fetch dashboard stats")

@app.get("/api/access/logs")
async def get_access_logs(limit: int = 50, current_user=Depends(get_current_user)):
    try:
        result = supabase_admin.table("access_logs").select("""
            *,
            members(full_name, email, card_number, membership_type)
        """).eq("members.owner_email", current_user["email"]).order("created_at", desc=True).limit(limit).execute()
        
        return {"logs": result.data, "count": len(result.data or [])}
    except Exception as e:
        logger.error(f"Access logs error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/attendance-report")
async def get_attendance_report(current_user=Depends(get_current_user)):
    """Get detailed attendance report"""
    try:
        today = datetime.now().date()
        today_logs = supabase_admin.table("access_logs").select("""
            *,
            members(full_name, card_number, membership_type)
        """).eq("access_granted", True).gte("timestamp", today.isoformat()).execute()
        
        week_ago = (datetime.now() - timedelta(days=7)).date()
        week_logs = supabase_admin.table("access_logs").select("id").eq("access_granted", True).gte(
            "timestamp", week_ago.isoformat()
        ).execute()
        
        return {
            "today": {
                "total_visits": len(today_logs.data or []),
                "visits": today_logs.data or []
            },
            "this_week": {
                "total_visits": len(week_logs.data or [])
            }
        }
    except Exception as e:
        logger.error(f"Attendance report error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Health Check
@app.get("/api/health")
async def health_check():
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
