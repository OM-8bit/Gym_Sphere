# 🏋️ GymSphere - Professional Gym Management System

Modern gym management platform with dedicated access control, member management, and card inventory integration.

## ✨ Features

- 🔐 **Authentication** - Secure login/registration with JWT tokens
- 👥 **Member Management** - Professional member registration and management
- � **Access Control** - Dedicated gym entry validation system
- 🎫 **Card Integration** - Works with external QR generation applications
- 📊 **Dashboard Analytics** - Real-time member and card statistics
- 📋 **Access Logs** - Comprehensive tracking of gym entries
- � **Responsive Design** - Mobile, tablet, and desktop optimized
- 🔧 **Professional Interface** - Clean, gym-focused user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase Account

### 1. Clone Repository
git clone https://github.com/OM-8bit/gymsphere.git
cd gymspher


text

### 2. Backend Setup
cd backend
pip install -r requirements.txt
Fill in your Supabase credentials in .env
python main.py


text

### 3. Frontend Setup
cd frontend
npm install

text

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router
- Axios
- React Hot Toast
- Lucide Icons

**Backend:**
- FastAPI
- Supabase
- Python JWT
- QRCode Generation
- Uvicorn

**Database:**
- PostgreSQL (via Supabase)
- Row Level Security (RLS)

## 📁 Project Structure

```
gym_sphere/
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components (Dashboard, Members, AccessControl, etc.)
│   │   ├── context/          # Authentication context
│   │   ├── services/         # API integration services
│   │   └── styles/           # CSS styling
│   ├── public/               # Static assets
│   └── package.json
├── backend/                    # FastAPI Backend
│   ├── main.py              # API endpoints and database integration
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile
└── docker/                   # Container orchestration
    └── docker-compose.yml
```

## 📊 Latest Updates

### September 11, 2025 - Access Control System Enhancement
- ✅ **Removed QR Generator Page** - Separated concerns for external QR generation
- ✅ **Renamed Scanner → AccessControl** - Professional gym-focused interface
- ✅ **Fixed SQL Query Bug** - Resolved `created_atascard_created` column issue
- ✅ **Professional Branding** - Updated all references for gym management focus
- ✅ **External QR Integration** - System works with external QR generation apps
- ✅ **Improved Navigation** - Cleaner sidebar and routing structure
- ✅ **Backend Stability** - SQL fixes and container restart capability

### Previous Updates
- Member management system implementation
- Real-time dashboard analytics
- Supabase PostgreSQL integration
- Docker containerization
- Responsive mobile design
- Authentication system with JWT tokens

## 🔧 Environment Setup

### Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

text

### Frontend (.env)
VITE_API_URL=http://localhost:8000


text

## 📚 Documentation

- [Setup Guide](docs/setup.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **[Your Name]** - Full Stack Developer
- **[Frontend Engineer Name]** - Frontend Developer
- **[Other Team Members]** - Roles

## 🆘 Support

For support and questions:
- Create an [Issue](https://github.com/OM-8bit/gymsphere/issues)
- Contact: ombarot.dev@gmail.com

---

Made with ❤️ for modern gym management