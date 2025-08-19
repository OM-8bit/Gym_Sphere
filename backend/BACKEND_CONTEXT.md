# Backend Context - GymSphere

**Last Updated:** August 20, 2025  
**Status:** Fully Setup and Working  
**Python Version:** 3.12.7  
**Virtual Environment:** `venv-ak27` (activated and working)

## Initial Setup Process

### 1. Virtual Environment Creation
- Created using: `python -m venv gym_env` (later switched to `venv-ak27`)
- Activation: `.\venv-ak27\Scripts\Activate.ps1` (PowerShell syntax)
- Issue encountered: PowerShell `&&` syntax doesn't work, used `;` instead

### 2. Package Installation Journey
Started with original requirements.txt but encountered multiple dependency conflicts.

## Critical Issues Fixed

### Issue #1: Pydantic Version Conflict ❌ → ✅
**Problem:** 
```
ERROR: Cannot install -r requirements.txt (line 1), pydantic==2.5.0 and supabase because these package versions have conflicting dependencies.

The conflict is caused by:
    The user requested pydantic==2.5.0
    fastapi 0.104.1 depends on pydantic!=1.8, !=1.8.1, !=2.0.0, !=2.0.1, !=2.1.0, <3.0.0 and >=1.7.4
    postgrest 1.1.1 depends on pydantic<3.0 and >=1.9
    realtime 2.7.0 depends on pydantic<3.0.0 and >=2.11.7
```

**Root Cause:** Supabase's `realtime 2.7.0` requires `pydantic>=2.11.7`, but requirements.txt specified `pydantic==2.5.0`

**Solution:** Changed `pydantic==2.5.0` → `pydantic>=2.11.7`

### Issue #2: WebSockets Version Conflict ❌ → ✅
**Problem:**
```
ERROR: Cannot install supabase, uvicorn[standard]==0.24.0 and websockets==10.4 because these package versions have conflicting dependencies.

The conflict is caused by:
    The user requested websockets==10.4
    uvicorn[standard] 0.24.0 depends on websockets>=10.4; extra == "standard"
    realtime 2.7.0 depends on websockets<16 and >=11
```

**Root Cause:** Version range conflict between uvicorn (≥10.4) and realtime (≥11,<16)

**Solution:** Changed `websockets==10.4` → `websockets>=11,<16`

### Issue #3: PyJWT Version Conflict ❌ → ✅
**Problem:**
```
ERROR: Cannot install PyJWT==2.8.0 and supabase because these package versions have conflicting dependencies.

The conflict is caused by:
    The user requested PyJWT==2.8.0
    supabase-auth 2.12.3 depends on pyjwt<3.0.0 and >=2.10.1
```

**Root Cause:** Supabase-auth requires newer PyJWT version than specified

**Solution:** Changed `PyJWT==2.8.0` → `PyJWT>=2.10.1,<3.0.0`

### Issue #4: Missing Email Validator ❌ → ✅
**Problem:**
```python
Traceback (most recent call last):
  File "C:\Users\Hp\Desktop\Gym_Sphere\backend\venv-ak27\Lib\site-packages\pydantic\networks.py", line 946, in import_email_validator 
    import email_validator
ModuleNotFoundError: No module named 'email_validator'

ImportError: email-validator is not installed, run `pip install pydantic[email]`
```

**Root Cause:** Using `EmailStr` in Pydantic models requires `email-validator` package

**Solution:** Installed `email-validator` package separately

### Issue #5: Email Case Sensitivity Bug ❌ → ✅ (CRITICAL FIX)
**Problem:**
- User login with friend's credentials showed 0 members
- Database had 2 members but API returned empty array
- JWT token email: `"bom21062004@gmail.com"` (lowercase)
- Database owner_email: `"BOM21062004@gmail.com"` (uppercase)

**Root Cause Analysis:**
```python
# Debug output showed the mismatch:
{
  "token_email": "bom21062004@gmail.com",
  "all_members_in_db": [
    {"owner_email": "BOM21062004@gmail.com"},  # Uppercase
    {"owner_email": "BOM21062004@gmail.com"},  # Uppercase
  ],
  "members_for_current_user": 0  # No matches due to case sensitivity
}
```

**Technical Details:**
- Supabase `.eq()` performs exact case-sensitive matching
- `"bom" != "BOM"` resulted in no matches
- Occurred because different parts of auth system handled email case differently

**Solution Applied:**
Changed all email-based database queries from case-sensitive to case-insensitive:

```python
# BEFORE (Case-sensitive) ❌
.eq("owner_email", current_user["email"])

# AFTER (Case-insensitive) ✅  
.ilike("owner_email", current_user["email"])
```

**Endpoints Fixed:**
1. `GET /api/members` - List members for current user
2. `POST /api/members` - Check existing member before adding
3. `DELETE /api/members/{id}` - Verify ownership before deletion
4. `GET /api/dashboard/stats` - Filter members for statistics

## Final Working Dependencies (requirements.txt)
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
supabase==2.18.1
python-dotenv==1.0.0
qrcode==7.4.2
Pillow==10.1.0
python-multipart==0.0.6
PyJWT>=2.10.1,<3.0.0      # Fixed version conflict
passlib[bcrypt]==1.7.4
pydantic>=2.11.7           # Fixed version conflict  
websockets>=11,<16         # Fixed version conflict
email-validator            # Added missing dependency
```

## Environment Variables Configuration (.env)
```bash
SUPABASE_URL="https://rfvbyzumbdmofkcyywoj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SECRET_KEY="7B74ECA4E63B531D79D82C1DA8356"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="30"
```

## Database Schema & Access Patterns

### Tables Used:
1. **user_profiles** - User account information
2. **members** - Gym member records with `owner_email` for multi-tenancy
3. **access_logs** - Member access history

### Key Database Operations:
- **Case-insensitive filtering:** All `owner_email` comparisons use `.ilike()`
- **Multi-tenant data:** Members filtered by authenticated user's email
- **JWT authentication:** Token contains user email for data filtering

## API Endpoints (FastAPI)

### Authentication
- `POST /api/auth/register` - User registration with Supabase Auth
- `POST /api/auth/login` - User login, returns JWT token

### Member Management  
- `GET /api/members` - List members (case-insensitive owner_email filter)
- `POST /api/members` - Add new member (sets owner_email from JWT)
- `DELETE /api/members/{id}` - Delete member (ownership verification)

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Member statistics (filtered by owner)
- `GET /api/access/logs` - Access history

### QR Code System
- `POST /api/qr/generate` - Generate member QR code
- `POST /api/qr/verify` - Verify QR code access

### Debug (Temporary)
- `GET /api/debug/check-members` - Debug endpoint used to identify email case issue

## Server Configuration
- **Host:** 0.0.0.0 (accessible from all interfaces)
- **Port:** 8000
- **CORS:** Enabled for localhost:3000, localhost:5173
- **Hot Reload:** Enabled with `--reload` flag

## Start Commands
```bash
# Navigate to backend directory
cd "c:\Users\Hp\Desktop\Gym_Sphere\backend"

# Activate virtual environment (PowerShell)
.\venv-ak27\Scripts\Activate.ps1

# Start FastAPI server with hot reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Testing & Verification
- ✅ Server starts without errors
- ✅ Database connectivity working
- ✅ JWT authentication functional
- ✅ Email case-sensitivity issue resolved
- ✅ All API endpoints responding correctly
- ✅ CORS configured for frontend communication

## Security Features Implemented
- JWT-based authentication
- Bcrypt password hashing
- Row-level security through owner_email filtering
- CORS protection
- Token expiration (30 minutes)

## Next Maintenance Tasks
- [ ] Remove debug endpoint `/api/debug/check-members`
- [ ] Consider normalizing all emails to lowercase on registration
- [ ] Add email validation on registration
- [ ] Implement refresh token mechanism
- [ ] Add rate limiting for API endpoints

---
**Critical Success:** Email case sensitivity bug was the main blocker preventing users from seeing their data. The fix using `.ilike()` for case-insensitive matching resolved the issue completely.
