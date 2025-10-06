# How to Run the CMMS Application

## Quick Start

### 1. Start Backend Server
```bash
cd backend
npm run start:dev
```
- Backend runs on: http://localhost:3000
- API endpoint: http://localhost:3000/api

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
- Frontend runs on: http://localhost:3002
- Main app: http://localhost:3002

## Test Credentials

**Superadmin:**
- Email: superadmin@cmms.com
- Password: admin123

**Acme Corp Admin:**
- Email: admin@acme.com
- Password: admin123

**Hospital Admin:**
- Email: admin@metrohospital.ph
- Password: admin123

## Important Note ⚠️

**There is a critical SSR bug that needs to be fixed before the dashboard works properly.**

### The Bug:
File: `frontend/contexts/AuthContext.tsx` (line 34)

The `localStorage` is being accessed during server-side rendering, causing errors on `/dashboard` and `/dashboard/users` pages.

### The Fix:
Replace the `useEffect` in `AuthContext.tsx` (lines 33-54) with:

```tsx
// Check if user is already logged in on mount
useEffect(() => {
  const checkAuth = async () => {
    // Check if running in browser (not SSR)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Parse stored user data
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Optionally verify token is still valid by fetching profile
        try {
          const profile = await api.getProfile();
          setUser(profile as User);
        } catch (error) {
          // Token might be invalid, but keep stored user for now
          console.warn('Token verification failed, using stored user');
        }
      } catch (error) {
        // JSON parse failed or other error, clear storage
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  };

  checkAuth();
}, []);
```

### Steps to Apply Fix:
1. Stop both dev servers
2. Open `frontend/contexts/AuthContext.tsx`
3. Replace the `useEffect` hook (lines 33-54) with the code above
4. Save the file
5. Restart both servers

## After Fix - How to Use

### 1. Access the App
Go to: http://localhost:3002

### 2. Login
- Click "Login" button
- Use one of the test credentials above
- You'll be redirected to:
  - `/dashboard` for regular users
  - `/superadmin` for superadmin

### 3. Navigate Dashboard
The app has 26+ pages including:
- Dashboard home
- Assets (CRUD with API)
- Work Orders (CRUD with API)
- Settings (API integrated)
- Users (API integrated)
- Reports
- 9 paid module pages (Preventive Maintenance, Predictive, Mobile, etc.)
- Modules marketplace
- SuperAdmin pages

### 4. Test Features
- ✅ View and manage assets
- ✅ Create work orders
- ✅ Invite users
- ✅ Update settings
- ✅ Request module trials
- ✅ View module pricing

## Architecture

**Backend (NestJS):**
- Port: 3000
- Database: PostgreSQL with Prisma
- Features: JWT auth, RBAC, Module licensing

**Frontend (Next.js 15):**
- Port: 3002
- Framework: React 19 with App Router
- Styling: Tailwind CSS
- State: Context API

## Documentation

- `BUGS_FOUND.md` - Detailed bug report
- `TESTING_SUMMARY.md` - Full testing results
- `PRODUCTION_POLISH_GUIDE.md` - Polish components guide
- `INTEGRATION_COMPLETE.md` - API integration status

## Troubleshooting

**Dashboard shows 500 error:**
- Apply the AuthContext fix above

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <process_id>

netstat -ano | findstr :3002
taskkill /F /PID <process_id>
```

**Database connection error:**
- Check PostgreSQL is running
- Verify `.env` file in backend/
- Run `npx prisma migrate dev`

**Module installation issues:**
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules .next
npm install
```
