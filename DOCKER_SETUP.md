# 🐳 Docker Setup Guide for Gym Sphere

> A complete beginner-friendly guide to set up and run Gym Sphere using Docker on Windows

## 📋 Table of Contents
1. [What is Docker?](#what-is-docker)
2. [Prerequisites](#prerequisites)
3. [Docker Installation](#docker-installation)
4. [Project Setup](#project-setup)
5. [Running the Application](#running-the-application)
6. [Daily Usage](#daily-usage)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 🤔 What is Docker?

Docker is a platform that packages your application and all its dependencies into containers. Think of it as a "virtual box" that contains everything needed to run your app - no matter what computer you're using!

**Benefits for this project:**
- ✅ No need to install Python, Node.js, or other dependencies manually
- ✅ Same environment for everyone (works on any Windows machine)
- ✅ Easy to start/stop the entire application
- ✅ Isolated from your system (won't mess up other projects)

---

## 📋 Prerequisites

Before we start, make sure you have:
- Windows 10/11 (64-bit)
- At least 4GB RAM (8GB recommended)
- Admin access to your computer
- Internet connection for downloads

---

## 🔧 Docker Installation

### Step 1: Check Your System
Open PowerShell as Administrator and run:
```powershell
# Check Windows version
winver

# Check if virtualization is enabled
systeminfo | findstr /i virtualization
```

### Step 2: Download Docker Desktop
1. Visit: https://docs.docker.com/desktop/install/windows/
2. Click **"Docker Desktop for Windows"**
3. Download `Docker Desktop Installer.exe`

### Step 3: Install Docker Desktop
1. **Right-click** on the installer → **Run as Administrator**
2. Follow the installation wizard:
   - ✅ **Enable WSL 2 Features** (recommended)
   - ✅ **Add shortcut to desktop**
3. **Restart your computer** when prompted

### Step 4: Start Docker Desktop
1. Open **Docker Desktop** from Start Menu
2. Wait for the whale icon 🐳 to appear in your system tray
3. The icon should be **blue/green** (not gray)

### Step 5: Verify Installation
Open PowerShell and run:
```powershell
docker --version
docker-compose --version
```
You should see version numbers if everything is installed correctly.

---

## 🏗️ Project Setup

### Step 1: Navigate to Project
```powershell
cd C:\Users\Hp\Desktop\Gym_Sphere
```

### Step 2: Create Environment File
```powershell
# Go to docker directory
cd docker

# Create environment file
New-Item -ItemType File -Name ".env"
```

### Step 3: Configure Environment Variables
Open the `.env` file in notepad and add your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SECRET_KEY=your-secret-key-here
```

> **💡 Tip:** Get these values from your Supabase project dashboard

---

## 🚀 Running the Application

### First Time Setup (takes 5-10 minutes)
```powershell
# Make sure you're in the docker directory
cd C:\Users\Hp\Desktop\Gym_Sphere\docker

# Build all services (first time only)
docker-compose build

# Start the application
docker-compose up
```

### What happens during build:
- Downloads Python and Node.js environments
- Installs all backend dependencies (FastAPI, etc.)
- Installs all frontend dependencies (React, Vite, etc.)
- Builds the production-ready frontend
- Sets up the database connections

### Access Your Application
Once you see these messages:
```
gymsphere-backend  | INFO: Uvicorn running on http://0.0.0.0:8000
gymsphere-frontend | ready for start up
```

Open your browser and visit:
- **Frontend (Main App)**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📅 Daily Usage

### Start the Application
```powershell
cd C:\Users\Hp\Desktop\Gym_Sphere\docker
docker-compose up -d
```
> The `-d` flag runs it in the background

### Stop the Application
```powershell
docker-compose down
```

### View Logs (if something goes wrong)
```powershell
docker-compose logs -f
```

### Restart After Code Changes
```powershell
docker-compose up --build
```

---

## 🛠️ Troubleshooting

### Problem: Docker Desktop won't start
**Solution:**
```powershell
# Enable required Windows features
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

# Restart computer
shutdown /r /t 0
```

### Problem: Port already in use
**Error:** `Port 8000 is already allocated`

**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :8000
netstat -ano | findstr :3001

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

### Problem: Build fails or containers crash
**Solution:**
```powershell
# Stop everything
docker-compose down

# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Problem: Can't access the website
**Checklist:**
- [ ] Docker Desktop is running (blue/green whale icon)
- [ ] Both containers are running: `docker ps`
- [ ] No firewall blocking ports 3001 and 8000
- [ ] Try http://localhost:3001 (not https)

---

## ❓ FAQ

### Q: Do I need to install Python or Node.js separately?
**A:** No! Docker handles all dependencies automatically.

### Q: How much disk space does this use?
**A:** About 2-3GB for Docker images and containers.

### Q: Can I run this alongside my regular development setup?
**A:** Yes! Docker isolates everything, so it won't interfere with other projects.

### Q: What if I want to make code changes?
**A:** Just edit your files normally. For backend changes, the container will auto-reload. For frontend changes, run `docker-compose up --build`.

### Q: How do I update to the latest version?
**A:**
```powershell
git pull origin master
cd docker
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Q: How do I completely remove Docker and start over?
**A:**
```powershell
# Remove all containers and images
docker system prune -a

# Uninstall Docker Desktop from Windows Settings
```

---

## 🎯 Quick Reference

### Essential Commands
```powershell
# Start application
cd C:\Users\Hp\Desktop\Gym_Sphere\docker
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build

# Check running containers
docker ps

# Emergency: stop everything
docker stop $(docker ps -q)
```

### Application URLs
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:8000  
- **API Docs**: http://localhost:8000/docs

---

## 🎉 Success Checklist

After following this guide, you should be able to:
- [ ] See Docker Desktop running (whale icon in system tray)
- [ ] Access the Gym Sphere frontend at http://localhost:3001
- [ ] Login/register new accounts
- [ ] Add, edit, and delete gym members
- [ ] See API documentation at http://localhost:8000/docs
- [ ] Start and stop the application with simple commands

---

## 🆘 Need Help?

If you're still having issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Make sure Docker Desktop is running
3. Try the "emergency reset" commands
4. Check that your `.env` file has the correct Supabase credentials

**Happy Dockerizing! 🐳✨**
