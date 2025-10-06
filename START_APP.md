# Start CMMS Application - Unified Launch

## 🚀 3 Ways to Run Both Backend & Frontend Together

### Option 1: Double-Click Batch File (Windows - Easiest!)

**Just double-click:** `start.bat`

- Opens 2 terminal windows automatically
- Backend starts on port 3000
- Frontend starts on port 3002
- Opens browser automatically after 5 seconds
- To stop: Close both terminal windows

---

### Option 2: NPM Script (Cross-Platform)

**First time setup:**
```bash
npm install
```

**Then run:**
```bash
npm start
```

This runs both servers in the same terminal with colored output:
- 🔵 Blue = Backend
- 🟣 Purple = Frontend

**To stop:** Press `Ctrl+C`

---

### Option 3: Bash Script (Linux/Mac/Git Bash)

**Make executable (first time only):**
```bash
chmod +x start.sh
```

**Then run:**
```bash
./start.sh
```

**To stop:** Press `Ctrl+C`

---

## What Happens When You Start

1. ✅ Backend starts on http://localhost:3000
2. ✅ Frontend starts on http://localhost:3002
3. ✅ Browser opens to http://localhost:3002
4. ✅ You see the login page

---

## Test Login Credentials

**Superadmin:**
- Email: `superadmin@cmms.com`
- Password: `admin123`

**Acme Manufacturing Admin:**
- Email: `admin@acme.com`
- Password: `admin123`

**Metro Hospital Admin:**
- Email: `admin@metrohospital.ph`
- Password: `admin123`

---

## ⚠️ Important: Fix SSR Bug First

Before the dashboard works, you need to apply the AuthContext fix.

**File:** `frontend/contexts/AuthContext.tsx`

**Find this code (around line 34):**
```tsx
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    // ...
```

**Replace with:**
```tsx
useEffect(() => {
  const checkAuth = async () => {
    // Add this check first:
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // ... rest of code
```

**Full fix is in:** `BUGS_FOUND.md`

---

## Troubleshooting

### Port Already in Use

**Check what's using the ports:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3002

# Kill process
taskkill /F /PID <process_id>
```

### Backend Won't Start

**Check database connection:**
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### Frontend Build Errors

**Clear cache and reinstall:**
```bash
cd frontend
rm -rf node_modules .next
npm install
```

### Concurrently Not Installed

**If npm start fails:**
```bash
npm install concurrently --save-dev
```

---

## Alternative: Run Separately

If you prefer separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## After Starting

1. ✅ App opens at http://localhost:3002
2. ✅ Click "Login"
3. ✅ Use test credentials above
4. ✅ Access dashboard and all 26 pages

**Enjoy your CMMS application!** 🎉
