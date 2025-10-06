# 🔧 CMMS - Computerized Maintenance Management System

A modern, full-stack CMMS application with advanced module licensing, built with NestJS, Next.js 15, and TypeScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)

## ✨ Features

- 🏢 **Multi-tenant Architecture** - Support for multiple organizations with isolated data
- 🔐 **Role-Based Access Control** - Admin, Manager, Technician, and Viewer roles
- 📦 **Module Licensing System** - Dynamic feature activation with trials and expirations
- 🎯 **Asset Management** - Track equipment, facilities, and resources
- 📋 **Work Order Management** - Create, assign, and track maintenance tasks
- 👥 **User Management** - Invite users, manage permissions, and track activity
- 📊 **Superadmin Dashboard** - Analytics, billing, usage tracking, and license management
- 🧪 **End-to-End Testing** - Comprehensive Playwright test suite
- 🎨 **Modern UI** - Built with Next.js 15, Tailwind CSS, and React 19

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/nylle-mng/cmms.git
cd cmms

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Default Credentials

**Superadmin:**
- Email: `superadmin@cmms.com`
- Password: `admin123`

**Company Admin (Acme Manufacturing):**
- Email: `admin@acme.com`
- Password: `admin123`

**Hospital Admin (Metro Hospital):**
- Email: `admin@metrohospital.ph`
- Password: `admin123`

## 📁 Project Structure

```
cmms/
├── backend/              # NestJS backend API
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── prisma/       # Database service
│   │   └── common/       # Shared utilities
│   └── prisma/           # Database schema and migrations
├── frontend/             # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   └── lib/              # Utilities and API client
├── test/                 # Playwright E2E tests
└── docs/                 # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: Prisma ORM (SQLite dev, PostgreSQL prod)
- **Authentication**: JWT + bcrypt
- **Validation**: class-validator

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS
- **State Management**: React Context API
- **API Client**: Custom fetch wrapper

### Testing
- **E2E Testing**: Playwright
- **Test Coverage**: Login, CRUD operations, module activation

## 📚 Available Scripts

```bash
# Development
npm run dev                  # Start both backend and frontend
npm run start:backend        # Start backend only
npm run start:frontend       # Start frontend only

# Testing
npm test                     # Run Playwright tests
npm run test:ui              # Run tests in UI mode
npm run test:headed          # Run tests with browser visible
npm run test:report          # Show test report

# Installation
npm run install:all          # Install all dependencies
```

## 🔐 Module Licensing

The system includes a sophisticated module licensing framework:

- **Core Modules**: Always available (Assets, Work Orders, Users)
- **Licensed Modules**: Require activation (PM, Inventory, Predictive Maintenance, etc.)
- **Trial System**: 30-day trials for all modules
- **Expiration Management**: Automatic access control based on license dates
- **Superadmin Control**: Activate/deactivate modules per organization

## 📊 Module Categories

- **Asset Management**: Basic asset tracking, advanced features
- **Maintenance**: Preventive, predictive, calibration
- **Inventory**: Parts management, vendor tracking
- **Reporting**: Analytics, custom reports, dashboards
- **Mobile**: Mobile access, field service
- **Enterprise**: API access, multi-location, audit trails

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test test/login.spec.ts

# Run in UI mode (recommended)
npm run test:ui
```

**Test Coverage:**
- ✅ Login flow (superadmin and regular users)
- ✅ Superadmin dashboard navigation
- ✅ Module activation/deactivation
- ✅ Full application crawl (all pages)

## 🚀 Deployment

### Backend Deployment

1. Set up PostgreSQL database
2. Configure environment variables:
   ```
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   PORT=3001
   ```
3. Run migrations: `npx prisma migrate deploy`
4. Build: `npm run build`
5. Start: `npm run start:prod`

### Frontend Deployment

1. Configure environment:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   ```
2. Build: `npm run build`
3. Start: `npm start`

### Recommended Platforms
- **Backend**: Railway, Render, Heroku
- **Frontend**: Vercel, Netlify
- **Database**: Supabase, Railway, Render

## 📖 Documentation

- [API Documentation](BACKEND_API_COMPLETE.md)
- [Module Licensing Framework](CMMS_Module_Licensing_Framework.md)
- [Testing Guide](PLAYWRIGHT_GUIDE.md)
- [Full Stack Status](FULLSTACK_STATUS.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with [Claude Code](https://claude.com/claude-code) - AI-powered development assistant.

---

**Need help?** Open an issue or check the documentation files in the repository.
