# Frontend Context - GymSphere

**Last Updated:** August 20, 2025  
**Status:** Fully Setup and Working

## Setup Summary
- **Framework:** React + Vite  
- **Development Server:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Dependencies:** All npm packages installed successfully

## Project Structure
```
src/
├── components/
│   ├── Layout.jsx (Main app layout)
│   └── ProtectedRoute.jsx (Auth guard)
├── context/
│   └── AuthContext.jsx (User authentication state)
├── pages/
│   ├── Dashboard.jsx (Main dashboard with stats)
│   ├── Members.jsx (Member list and management)
│   ├── AddMember.jsx (Add new member form)
│   ├── Login.jsx (User login form)
│   ├── QRGenerator.jsx (QR code generation)
│   ├── Scanner.jsx (QR code scanning)
│   ├── AccessLogs.jsx (Access history)
│   └── Settings.jsx (App settings)
├── services/
│   └── api.js (Axios HTTP client with auth)
├── App.jsx (Main app component)
└── main.jsx (App entry point)
```

## Key Features Working
- User Login/Registration
- Member Management (Add/View/Delete) 
- Dashboard Statistics
- QR Code Generation
- Access Control
- Protected Routes
- JWT Token Management
- API Error Handling

## API Integration (services/api.js)
- Base URL: http://localhost:8000
- JWT token auto-attached from localStorage
- 401 error handling with auto-redirect to login
- CORS configured for development

## Authentication Flow
1. Login → JWT token stored in localStorage
2. Token attached to all API requests via interceptor  
3. Protected routes check authentication status
4. Auto-logout on 401 errors

## Start Frontend
```bash
cd frontend
npm run dev
```
Access at: http://localhost:3000

## Configuration
- Vite config setup for development
- Package.json with all required dependencies
- Hot reload enabled for development
