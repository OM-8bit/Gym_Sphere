from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import qrcode
import io
import base64
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import jwt
from passlib.context import CryptContext
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not all([SUPABASE_URL, SUPABASE_ANON_KEY]):
    raise ValueError("Missing Supabase configuration. Please check your .env file.")

# Create two clients - one for auth, one for admin operations
supabase_auth = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else supabase_auth

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="GymSphere API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    card_id: Optional[str] = None

class QRRequest(BaseModel):
    member_id: int

class QRVerifyRequest(BaseModel):
    qr_data: str

class CardVerifyRequest(BaseModel):
    card_id: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    email = verify_token(token)
    return {"email": email}

@app.get("/")
async def root():
    return {"message": "GymSphere API with Supabase", "version": "1.0.0"}

@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    try:
        # Include user data in metadata for the trigger
        auth_response = supabase_auth.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                    "gym_name": user_data.gym_name
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed")
        
        # With the trigger, profile is created automatically
        return {
            "message": "User registered successfully", 
            "user_id": auth_response.user.id
        }
        
    except Exception as e:
        error_msg = str(e).lower()
        logger.error(f"Registration error: {str(e)}")
        
        if "user already registered" in error_msg or "already exists" in error_msg:
            raise HTTPException(status_code=409, detail="Email already registered")
        else:
            raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    try:
        auth_response = supabase_auth.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if auth_response.user and auth_response.session:
            # Check if email is confirmed
            if not auth_response.user.email_confirmed_at:
                # Email not confirmed yet
                raise HTTPException(
                    status_code=403, 
                    detail="Please check your email and click the confirmation link before logging in."
                )
            
            # Email is confirmed, proceed with login
            profile_result = supabase_admin.table("user_profiles").select("*").eq("user_id", auth_response.user.id).execute()
            
            if profile_result.data:
                profile = profile_result.data[0]
                access_token = create_access_token(data={"sub": credentials.email})
                
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
            else:
                raise HTTPException(status_code=400, detail="User profile not found")
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "email not confirmed" in error_msg:
            raise HTTPException(
                status_code=403, 
                detail="Please confirm your email before logging in. Check your inbox for the confirmation link."
            )
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/members")
async def create_member(member_data: MemberCreate, current_user: dict = Depends(get_current_user)):
    try:
        existing_member = supabase_admin.table("members").select("id").eq("email", member_data.email).execute()
        if existing_member.data:
            raise HTTPException(status_code=400, detail="Member with this email already exists")
        
        start_date = datetime.now()
        if member_data.membership_type == "monthly":
            end_date = start_date + timedelta(days=30)
        elif member_data.membership_type == "yearly":
            end_date = start_date + timedelta(days=365)
        else:
            raise HTTPException(status_code=400, detail="Invalid membership type")
        
        member_info = {
            "full_name": member_data.full_name,
            "email": member_data.email,
            "phone": member_data.phone,
            "card_id": member_data.card_id,
            "membership_type": member_data.membership_type,
            "subscription_start": start_date.isoformat(),
            "subscription_end": end_date.isoformat(),
            "is_active": True,
            "owner_email": current_user["email"]
        }
        
        result = supabase_admin.table("members").insert(member_info).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create member")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/members")
async def get_members(current_user: dict = Depends(get_current_user)):
    try:
        result = supabase_admin.table("members").select("*").eq("owner_email", current_user["email"]).execute()
        return result.data
    except Exception as e:
        logger.error(f"Get members error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/members/{member_id}")
async def delete_member(member_id: int, current_user: dict = Depends(get_current_user)):
    try:
        existing_member = supabase_admin.table("members").select("id").eq("id", member_id).eq("owner_email", current_user["email"]).execute()
        
        if not existing_member.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        supabase_admin.table("members").delete().eq("id", member_id).execute()
        return {"message": "Member deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete member error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/access/qr/generate")
async def generate_qr_code(request: QRRequest):
    try:
        member_result = supabase_admin.table("members").select("*").eq("id", request.member_id).execute()
        
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace('Z', '+00:00'))
        if subscription_end < datetime.now():
            raise HTTPException(status_code=403, detail="Member subscription has expired")
        
        current_timestamp = int(datetime.now().timestamp())
        qr_data = f"gymsphere:{member['id']}:{member['email']}:{current_timestamp}"
        
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "qr_code": f"data:image/png;base64,{img_str}",
            "qr_data": qr_data,
            "member": {
                "id": member["id"],
                "name": member["full_name"],
                "subscription_end": member["subscription_end"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generate QR error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/access/qr/verify")
async def verify_qr_access(request: QRVerifyRequest):
    try:
        parts = request.qr_data.split(":")
        if len(parts) != 4 or parts[0] != "gymsphere":
            raise HTTPException(status_code=400, detail="Invalid QR code format")
        
        member_id = int(parts[1])
        qr_timestamp = int(parts)
        
        current_timestamp = int(datetime.now().timestamp())
        if current_timestamp - qr_timestamp > 300:
            raise HTTPException(status_code=400, detail="QR code has expired")
        
        member_result = supabase_admin.table("members").select("*").eq("id", member_id).execute()
        
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member = member_result.data[0]
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace('Z', '+00:00'))
        access_granted = subscription_end > datetime.now() and member["is_active"]
        
        log_data = {
            "member_id": member["id"],
            "access_type": "qr",
            "access_granted": access_granted
        }
        supabase_admin.table("access_logs").insert(log_data).execute()
        
        if not access_granted:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "access_granted": True,
            "member": {
                "id": member["id"],
                "name": member["full_name"],
                "membership_type": member["membership_type"]
            },
            "message": "Access granted"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify QR error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/access/card/verify")
async def verify_card_access(request: CardVerifyRequest):
    try:
        member_result = supabase_admin.table("members").select("*").eq("card_id", request.card_id).execute()
        
        if not member_result.data:
            raise HTTPException(status_code=404, detail="Card not found")
        
        member = member_result.data[0]
        subscription_end = datetime.fromisoformat(member["subscription_end"].replace('Z', '+00:00'))
        access_granted = subscription_end > datetime.now() and member["is_active"]
        
        log_data = {
            "member_id": member["id"],
            "access_type": "card",
            "access_granted": access_granted
        }
        supabase_admin.table("access_logs").insert(log_data).execute()
        
        if not access_granted:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "access_granted": True,
            "member": {
                "id": member["id"],
                "name": member["full_name"],
                "membership_type": member["membership_type"]
            },
            "message": "Access granted"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify card error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/access/logs")
async def get_access_logs():
    try:
        result = supabase_admin.table("access_logs").select("*, members(full_name, email)").order("created_at", desc=True).limit(100).execute()
        return result.data
    except Exception as e:
        logger.error(f"Get access logs error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    try:
        members_result = supabase_admin.table("members").select("*").eq("owner_email", current_user["email"]).execute()
        members = members_result.data
        
        total_members = len(members)
        active_members = sum(1 for m in members if m["is_active"] and datetime.fromisoformat(m["subscription_end"].replace('Z', '+00:00')) > datetime.now())
        expired_members = total_members - active_members
        
        start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_joins = sum(1 for m in members if datetime.fromisoformat(m["created_at"].replace('Z', '+00:00')) >= start_of_month)
        
        return {
            "total_members": total_members,
            "active_members": active_members,
            "expired_members": expired_members,
            "this_month_joins": this_month_joins,
            "weekly_access_count": 0
        }
        
    except Exception as e:
        logger.error(f"Get dashboard stats error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
