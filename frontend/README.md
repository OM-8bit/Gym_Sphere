# GymSphere Frontend

A modern React-based gym management system frontend built with Vite for fast development and hot reload.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:8000`

### Installation & Setup

1. **Navigate to frontend directory:**
```terminal
cd frontend
```

2. **Install dependencies:**
```terminal
npm install
```

3. **Start development server:**
```terminal
npm run dev
```

4. **Access the application:**
```
Frontend: http://localhost:3000
Backend API: http://localhost:8000
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx           # Main app layout with navigation
│   └── ProtectedRoute.jsx   # Authentication guard component
├── context/
│   └── AuthContext.jsx      # Global authentication state management
├── pages/
│   ├── Dashboard.jsx        # Main dashboard with statistics
│   ├── Members.jsx          # Member list and management
│   ├── AddMember.jsx        # Add new member form
│   ├── Login.jsx            # User authentication page
│   ├── QRGenerator.jsx      # QR code generation for members
│   ├── Scanner.jsx          # QR code scanning interface
│   ├── AccessLogs.jsx       # Member access history
│   └── Settings.jsx         # Application settings
├── services/
│   └── api.js               # Axios HTTP client with auth interceptors
├── App.jsx                  # Main application component
└── main.jsx                 # Application entry point
```

## 🔧 Configuration

### API Configuration (`src/services/api.js`)
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000',  // Backend API URL
  headers: { 'Content-Type': 'application/json' },
})
```

### Environment Setup
- **Development:** `http://localhost:3000`
- **API Endpoint:** `http://localhost:8000`
- **Hot Reload:** Enabled by default with Vite

## 🔐 Authentication Flow

1. **Login Process:**
   - User enters credentials on `/login`
   - JWT token received from backend
   - Token stored in `localStorage` as `gym_token`
   - User data stored as `gym_user`

2. **Protected Routes:**
   - All routes except `/login` require authentication
   - `ProtectedRoute` component checks for valid token
   - Auto-redirect to login if token missing/invalid

3. **API Integration:**
   - JWT token automatically attached to all requests
   - 401 errors trigger automatic logout and redirect
   - Token managed via Axios interceptors

## 📱 Key Features

### ✅ Working Features
- **User Authentication** (Login/Logout)
- **Member Management** (Add/View/Delete)
- **Dashboard Statistics** (Active members, subscriptions)
- **QR Code Generation** (Member access codes)
- **QR Code Scanning** (Member verification)
- **Access Logs** (Entry/exit history)
- **Responsive Design** (Mobile-friendly)
- **Protected Routes** (Authentication required)

### 📊 Dashboard Features
- Total members count
- Active vs expired subscriptions
- Monthly join statistics
- Quick navigation to all features

### 👥 Member Management
- Add new members with subscription details
- View all members in table format
- Delete members with confirmation
- Member status indicators (Active/Inactive)
- Subscription expiry dates

## 🛠 Development

### Available Scripts
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Development Server
- **URL:** `http://localhost:3000`
- **Hot Reload:** Automatic code changes detection
- **Error Overlay:** Development errors shown in browser
- **Fast Refresh:** React state preserved during updates

## 🔗 API Integration

### HTTP Client Setup
- **Base URL:** Automatically points to backend at `localhost:8000`
- **Authentication:** JWT token auto-attached via interceptors
- **Error Handling:** 401 responses trigger logout
- **CORS:** Configured on backend for `localhost:3000`

### API Endpoints Used
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/register

// Member Management
GET  /api/members
POST /api/members
DELETE /api/members/{id}

// Dashboard
GET /api/dashboard/stats

// QR System
POST /api/qr/generate
POST /api/qr/verify

// Access Logs
GET /api/access/logs
```

## 🎨 UI/UX Features

### Design System
- Clean, modern interface
- Consistent component styling
- Mobile-responsive layout
- Toast notifications for user feedback
- Loading states and error handling

### Navigation
- Sidebar navigation with icons
- Active route highlighting
- Protected route authentication
- Logout functionality

### Forms & Interactions
- Form validation
- Loading indicators
- Success/error messages
- Confirmation dialogs for destructive actions

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.x",
  "react-dom": "^18.x", 
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "react-hot-toast": "^2.x",
  "lucide-react": "^0.x"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.x",
  "vite": "^5.x",
  "eslint": "^8.x"
}
```

## 🚨 Troubleshooting

### Common Issues

**1. "Cannot connect to backend"**
- Ensure backend server is running on `http://localhost:8000`
- Check CORS settings in backend configuration
- Verify API base URL in `src/services/api.js`

**2. "Authentication not working"**
- Clear localStorage: `localStorage.clear()`
- Check JWT token format in browser dev tools
- Verify backend authentication endpoints are working

**3. "Hot reload not working"**
- Restart dev server: `npm run dev`
- Check for TypeScript errors
- Clear browser cache

**4. "Build fails"**
- Run `npm install` to ensure all dependencies
- Check for ESLint errors: `npm run lint`
- Verify all imports are correct

### Development Tips

- **Browser DevTools:** Use for debugging API calls and state
- **React DevTools:** Install browser extension for component inspection
- **Network Tab:** Monitor API requests and responses
- **Console:** Check for JavaScript errors and warnings

## 🔄 Workflow

### For New Developers

1. **Setup:**
   ```bash
   git clone <repository>
   cd frontend
   npm install
   ```

2. **Development:**
   ```bash
   npm run dev
   # Frontend: http://localhost:3000
   ```

3. **Backend Connection:**
   - Ensure backend is running on port 8000
   - Test API connection in browser network tab
   - Check authentication flow works

4. **Code Changes:**
   - Hot reload automatically updates browser
   - Check console for errors
   - Test features after changes

## 📄 File Descriptions

- **`App.jsx`** - Main app component with routing
- **`main.jsx`** - React app entry point and root rendering
- **`Layout.jsx`** - Sidebar navigation and page structure
- **`ProtectedRoute.jsx`** - Authentication wrapper for protected pages
- **`AuthContext.jsx`** - Global user state management
- **`api.js`** - HTTP client with authentication interceptors
- **`vite.config.js`** - Vite build tool configuration
- **`package.json`** - Dependencies and scripts

## 🚀 Production Ready

This frontend is fully configured and ready for development/production:
- ✅ Authentication system working
- ✅ API integration complete
- ✅ All major features implemented
- ✅ Error handling in place
- ✅ Mobile responsive
- ✅ Performance optimized with Vite

---

**Need Help?** Check the browser console for errors and ensure the backend API is running on port 8000.