# 🏋️ GymSphere - Complete Gym Management System

Modern gym management platform with member management, QR-based access control, and real-time analytics.

## ✨ Features

- 🔐 **Authentication** - Secure login/registration with Supabase Auth
- 👥 **Member Management** - Add, edit, delete gym members
- 📱 **QR Code Access** - Generate QR codes for gym entry
- 🔍 **Access Scanner** - Verify member access via QR/Card
- 📊 **Dashboard Analytics** - Member stats and insights
- 🎫 **Card System** - Physical card-based access control
- 📋 **Access Logs** - Track all gym entries and exits

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

gymsphere/
├── backend/ # FastAPI backend
├── frontend/ # React frontend
├── docs/ # Documentation

text

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