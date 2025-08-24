# GymSphere Backend

FastAPI backend with Supabase integration for GymSphere gym management system.

## 🚀 Setup

1. Install dependencies:
pip install -r requirements.txt

text

2. Configure environment:
cp .env.example .env

Edit .env with your Supabase credentials
text

3. Run server:
python main.py

text

## 🔧 Environment Variables

Create `.env` file with:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
SECRET_KEY=your_jwt_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

text

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **Supabase** - Backend-as-a-service (Auth + Database)
- **PostgreSQL** - Database via Supabase
- **JWT** - Token-based authentication
- **QRCode** - QR code generation
- **Uvicorn** - ASGI server

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Members
- `GET /api/members` - Get all members for current user
- `POST /api/members` - Create new member
- `DELETE /api/members/{id}` - Delete member

### Access Control
- `POST /api/access/qr/generate` - Generate QR code for member
- `POST /api/access/qr/verify` - Verify QR code access
- `POST /api/access/card/verify` - Verify card access
- `GET /api/access/logs` - Get access logs

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 📊 Database Schema

### user_profiles
- `id` (SERIAL) - Primary key
- `user_id` (UUID) - References auth.users
- `email` (TEXT) - User email
- `full_name` (TEXT) - User full name
- `gym_name` (TEXT) - Gym name
- `created_at` (TIMESTAMP) - Creation timestamp

### members
- `id` (SERIAL) - Primary key
- `full_name` (TEXT) - Member name
- `email` (TEXT) - Member email
- `phone` (TEXT) - Phone number
- `card_id` (TEXT) - Physical card ID
- `membership_type` (TEXT) - monthly/yearly
- `subscription_start` (TIMESTAMP) - Start date
- `subscription_end` (TIMESTAMP) - End date
- `is_active` (BOOLEAN) - Active status
- `owner_email` (TEXT) - Gym owner email

### access_logs
- `id` (SERIAL) - Primary key
- `member_id` (INTEGER) - References members
- `access_type` (TEXT) - qr/card
- `access_granted` (BOOLEAN) - Access status
- `created_at` (TIMESTAMP) - Log timestamp

## 🔐 Authentication

- JWT tokens for API authentication
- Supabase Auth for user management
- Row Level Security (RLS) for data isolation

## 🎯 Features

- **QR Code Generation** - Time-limited QR codes for gym access
- **Card System** - Physical card-based entry
- **Access Logging** - Track all gym entries
- **Member Management** - CRUD operations for gym members
- **Dashboard Stats** - Real-time analytics

## 📚 Documentation

Full API documentation available at: http://localhost:8000/docs

## 🧪 Development

Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

text

## 🚀 Deployment

Install dependencies
pip install -r requirements.txt

Set environment variables
export SUPABASE_URL=your_url
export SUPABASE_ANON_KEY=your_key

... other env vars
Run production server
uvicorn main:app --host 0.0.0.0 --port 8000

text

## 🤝 Contributing

- Follow FastAPI best practices
- Use type hints for all functions
- Add proper error handling
- Document new endpoints
- Test with Postman/curl