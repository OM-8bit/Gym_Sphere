# GymSphere Frontend

React frontend for GymSphere gym management system.

## 🚀 Setup

1. Install dependencies:
npm install

text

2. Configure environment:
cp .env.example .env

Update VITE_API_URL if needed
text

3. Start development server:
npm run dev

text

## ✨ Features

- 🔐 **Authentication** - Login/Register with form validation
- 👥 **Member Management** - Add, view, edit, delete members
- 📊 **Dashboard** - Real-time statistics and analytics
- 📱 **QR Generator** - Generate QR codes for member access
- 🔍 **Scanner** - Verify QR codes and card access
- 📋 **Access Logs** - View all gym entry/exit logs
- ⚙️ **Settings** - User profile management
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **React 18** - Component framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library
- **Vite** - Build tool

## 📁 Project Structure

frontend/
├── src/
│ ├── components/ # Reusable components
│ ├── context/ # React context providers
│ ├── pages/ # Page components
│ ├── services/ # API client
│ ├── styles/ # CSS styles
│ ├── App.jsx # Main app component
│ └── main.jsx # Entry point
├── public/
├── package.json
└── vite.config.js

text

## 🔧 Environment Variables

Create `.env` file:
VITE_API_URL=http://localhost:8000

text

## 📦 Available Scripts

npm run dev # Start development server
npm run build # Build for production
npm run preview # Preview production build
npm run lint # Lint code

text

## 🎨 Styling

- Custom CSS with CSS variables
- Responsive design with flexbox/grid
- No external CSS frameworks (clean and lightweight)

## 🔌 API Integration

All API calls go through `src/services/api.js`:
- Automatic JWT token handling
- 401 error interception
- Request/response logging

## 🧪 Development

1. Backend must be running on port 8000
2. Frontend runs on port 3000
3. Hot reload enabled for development

## 🚀 Deployment

npm run build

Deploy dist/ folder to your hosting service
text

## 🤝 Contributing

- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Add proper error handling