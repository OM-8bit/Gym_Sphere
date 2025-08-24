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


# Env vars
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


if not (SUPABASE_URL and SUPABASE_ANON_KEY):
    raise ValueError("Missing Supabase configuration.")


# Clients
supabase_auth = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else supabase_auth


SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


# Default password for new members
DEFAULT_MEMBER_PASSWORD = "ABC1234"


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


app = FastAPI(title="GymSphere API", version="1.0")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    gym_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# UPDATED: Added card_number field for card system
class MemberCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    membership_type: str
    card_number: Optional[str] = None  # CHANGED: card_id -> card_number
    create_login: Optional[bool] = True


# NEW: Card system models
class CardBatch(BaseModel):
    start: int
    end: int
    prefix: str


class CardVerifyRequest(BaseModel):
    card_number: str  # CHANGED: card_id -> card_number


class QRRequest(BaseModel):
    member_id: int


class QRVerifyRequest(BaseModel):
    qr_data: str


# Auth helpers
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


@app.get("/")
async def root():
    return {"message": "GymSphere API running", "version": app.version}


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

        return {"message": "Registration successful. Please confirm your email.", "user_id": auth_response.user.id}
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


# NEW: Card Management Endpoints
@app.post("/api/admin/add-card-batch")
async def add_card_batch(batch: CardBatch, current_user=Depends(get_current_user)):
    """Add a batch of cards to inventory"""
    try:
        cards = []
        for i in range(batch.start, batch.end + 1):
            card_number = f"{batch.prefix}{i:03d}"
            cards.append({
                "card_number": card_number,
                "status": "available",
                "gym_owner_email": current_user["email"],
                "created_at": datetime.now().isoformat()
            })
        
        # Insert cards into card_inventory table
        result = supabase_admin.table("card_inventory").insert(cards).execute()
        
        return {
            "message": f"Added {len(cards)} cards to inventory",
            "cards_added": len(cards),
            "range": f"{batch.prefix}{batch.start:03d} to {batch.prefix}{batch.end:03d}"
        }
    except Exception as e:
        logger.error(f"Add card batch error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/admin/available-cards")
async def get_available_cards(current_user=Depends(get_current_user)):
    """Get all available cards for this gym owner"""
    try:
        result = supabase_admin.table("card_inventory").select("card_number").eq("gym_owner_email", current_user["email"]).eq("status", "available").execute()
        return result.data
    except Exception as e:
        logger.error(f"Get available cards error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/admin/card-inventory")
async def get_card_inventory(current_user=Depends(get_current_user)):
    """Get full card inventory for this gym"""
    try:
        result = supabase_admin.table("card_inventory").select("""
            *,
            members(full_name, email)
        """).eq("gym_owner_email", current_user["email"]).execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Get card inventory error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# UPDATED: Member creation with card assignment
@app.post("/api/members")
async def add_member(member: MemberCreate, current_user=Depends(get_current_user)):
    try:
        # Check if member already exists
        exists = supabase_admin.table("members").select("id").eq("email", member.email).eq("owner_email", current_user["email"]).execute()
        if exists.data:
            raise HTTPException(status_code=400, detail="Member with this email already exists.")

        # NEW: Check if card is available if provided
        if member.card_number:
            card_check = supabase_admin.table("card_inventory").select("*").eq("card_number", member.card_number).eq("gym_owner_email", current_user["email"]).single().execute()
            if not card_check.data:
                raise HTTPException(status_code=400, detail="Card number not found")
            if card_check.data["status"] != "available":
                raise HTTPException(status_code=400, detail="Card not available")

        # Calculate subscription dates
        start_date = datetime.now()
        if member.membership_type == "monthly":
            end_date = start_date + timedelta(days=30)
        elif member.membership_type == "yearly":
            end_date = start_date + timedelta(days=365)
        else:
            raise HTTPException(status_code=400, detail="Invalid membership type.")

        # UPDATED: Create member data with card_number
        member_data = {
            "full_name": member.full_name,
            "email": member.email,
            "phone": member.phone,
            "membership_type": member.membership_type,
            "card_number": member.card_number,  # CHANGED: card_id -> card_number
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

        # NEW: Update card status to assigned if card was provided
        if member.card_number:
            supabase_admin.table("card_inventory").update({
                "status": "assigned",
                "assigned_to_member_id": created_member["id"],
                "assigned_date": datetime.now().isoformat()
            }).eq("card_number", member.card_number).execute()

        # Create login credentials if requested
        auth_created = False
        auth_error = None
        
        if member.create_login:
            try:
                # Create user account with default password
                auth_response = supabase_admin.auth.admin.create_user({
                    "email": member.email,
                    "password": DEFAULT_MEMBER_PASSWORD,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": member.full_name,
                        "membership_type": member.membership_type,
                        "card_number": member.card_number,  # NEW: Include card number
                        "is_gym_member": True
                    }
                })
                
                if auth_response.user:
                    auth_created = True
                    logger.info(f"Login credentials created for {member.email} with password: {DEFAULT_MEMBER_PASSWORD}")
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
            "message": f"Member added successfully{'! Card ' + member.card_number + ' assigned.' if member.card_number else ''} {'Login credentials created with password: ' + DEFAULT_MEMBER_PASSWORD if auth_created else ' Login creation failed.'}"
        }
        
    except Exception as e:
        logger.error(f"Add member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# NEW: Card verification endpoint for gym entrance
@app.post("/api/card/verify")
async def verify_card(request: CardVerifyRequest):
    """Verify card access at gym entrance"""
    try:
        # Find member by card number
        member_result = supabase_admin.table("members").select("*").eq("card_number", request.card_number).single().execute()
        
        if not member_result.data:
            return {
                "access_granted": False,
                "message": "❌ Invalid Card",
                "member_name": "Unknown"
            }
            
        member = member_result.data[0]
        
        # Check subscription status
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        is_active = subscription_end > datetime.now() and member["is_active"]
        
        # Log the access attempt
        log_data = {
            "member_id": member["id"],
            "access_type": "card",
            "access_granted": is_active,
            "card_number": request.card_number,
            "timestamp": datetime.now().isoformat()
        }
        supabase_admin.table("access_logs").insert(log_data).execute()
        
        if is_active:
            return {
                "access_granted": True,
                "message": f"✅ Welcome {member['full_name']}!",
                "member_name": member["full_name"],
                "membership_type": member["membership_type"],
                "subscription_end": member["subscription_end"]
            }
        else:
            return {
                "access_granted": False,
                "message": f"❌ Subscription Expired",
                "member_name": member["full_name"],
                "subscription_end": member["subscription_end"]
            }
            
    except Exception as e:
        logger.error(f"Card verify error: {str(e)}")
        return {
            "access_granted": False,
            "message": "❌ System Error",
            "member_name": "Unknown"
        }


@app.get("/api/members")
async def list_members(current_user=Depends(get_current_user)):
    try:
        result = supabase_admin.table("members").select("*").eq("owner_email", current_user["email"]).execute()
        return result.data if result.data else []
    except Exception as e:
        logger.error(f"List members error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/members/{id}")
async def delete_member(id: int, current_user=Depends(get_current_user)):
    try:
        # Get member details first
        member_result = supabase_admin.table("members").select("*").eq("id", id).eq("owner_email", current_user["email"]).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        # NEW: Release card back to available status
        if member.get("card_number"):
            supabase_admin.table("card_inventory").update({
                "status": "available",
                "assigned_to_member_id": None,
                "assigned_date": None
            }).eq("card_number", member["card_number"]).execute()
        
        # Delete from members table
        supabase_admin.table("members").delete().eq("id", id).execute()
        
        # Optionally delete the auth user as well
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
        
        return {"message": "Member deleted successfully and card released."}
    except Exception as e:
        logger.error(f"Delete member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/members/{member_id}/reset-password")
async def reset_member_password(member_id: int, current_user=Depends(get_current_user)):
    try:
        # Get member details
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).eq("owner_email", current_user["email"]).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        # Find the auth user and reset password
        users_result = supabase_admin.auth.admin.list_users()
        if users_result.users:
            for user in users_result.users:
                if user.email == member["email"]:
                    # Update user password
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
        # Get member details
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).eq("owner_email", current_user["email"]).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        return {
            "member_name": member["full_name"],
            "email": member["email"],
            "card_number": member.get("card_number", "Not assigned"),  # NEW: Include card number
            "default_password": DEFAULT_MEMBER_PASSWORD,
            "member_portal_url": "http://localhost:5173",
            "instructions": "Share these credentials with the member to access their portal."
        }
            
    except Exception as e:
        logger.error(f"Get credentials error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/qr/generate")
async def generate_qr(request: QRRequest):
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", request.member_id).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")

        member = member_result.data[0]
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        if subscription_end < datetime.now():
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
            "member": {
                "id": member["id"],
                "name": member["full_name"],
                "card_number": member.get("card_number"),  # NEW: Include card number
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
        qr_timestamp = int(parts)

        current_ts = int(datetime.now().timestamp())
        if current_ts - qr_timestamp > 300:
            raise HTTPException(status_code=400, detail="QR expired")

        member_result = supabase_admin.table("members").select("*").eq("id", member_id).execute()
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        member = member_result.data[0]

        subscription_end = datetime.fromisoformat(member["subscription_end"].replace("Z", "+00:00"))
        if subscription_end < datetime.now() or not member["is_active"]:
            raise HTTPException(status_code=403, detail="Access denied")

        log_data = {
            "member_id": member["id"],
            "access_type": "qr",
            "access_granted": True,
        }
        supabase_admin.table("access_logs").insert(log_data).execute()

        return {
            "access_granted": True,
            "member": {
                "id": member["id"],
                "name": member["full_name"],
                "membership_type": member["membership_type"],
                "card_number": member.get("card_number"),  # NEW: Include card number
            },
            "message": "Access granted",
        }
    except Exception as e:
        logger.error(f"QR verify error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    try:
        members_result = supabase_admin.table("members").select("*").eq("owner_email", current_user["email"]).execute()
        members = members_result.data or []

        total_members = len(members)
        now = datetime.now(timezone.utc)

        active_members = sum(
            1
            for member in members
            if member["is_active"] and datetime.fromisoformat(member["subscription_end"].replace('Z', '+00:00')) > now
        )

        expired_members = total_members - active_members

        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        joins_this_month = sum(
            1
            for member in members
            if datetime.fromisoformat(member["created_at"].replace('Z', '+00:00')) >= start_of_month
        )

        # NEW: Card statistics
        cards_result = supabase_admin.table("card_inventory").select("status").eq("gym_owner_email", current_user["email"]).execute()
        cards = cards_result.data or []
        
        total_cards = len(cards)
        available_cards = sum(1 for card in cards if card["status"] == "available")
        assigned_cards = sum(1 for card in cards if card["status"] == "assigned")

        return {
            "total_members": total_members,
            "active_members": active_members,
            "expired_members": expired_members,
            "joins_this_month": joins_this_month,
            "weekly_access_count": 0,
            # NEW: Card stats
            "total_cards": total_cards,
            "available_cards": available_cards,
            "assigned_cards": assigned_cards
        }
    except Exception as e:
        logger.error(f"Dashboard stats error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to fetch dashboard stats")

@app.get("/api/access/logs")
async def get_access_logs():
    try:
        result = supabase_admin.table("access_logs").select("*, members(full_name, email, card_number)").order("created_at", desc=True).limit(100).execute()
        return result.data
    except Exception as e:
        logger.error(f"Access logs error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
