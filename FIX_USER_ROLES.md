# 🔧 Fix: Add Roles to Existing Users

## Problem
The error "User role not found" occurs because your existing `admin@acme.com` user was created **before** we added role support, so they don't have a `roleId` in the database.

## ✅ Solution

### Run the Seed Endpoint to Update Users

The seed has been updated to **add roles to existing users** using the `update` parameter in `upsert`.

**Access this URL in your browser:**
```
http://localhost:3001/api/seed
```

This will:
- ✅ Update `admin@acme.com` → role: `admin`
- ✅ Update `manager@acme.com` → role: `manager`  
- ✅ Update `tech1@acme.com` → role: `technician`
- ✅ Update `viewer@acme.com` → role: `viewer`
- ✅ Update `admin@metrohospital.ph` → role: `admin`

### After Running Seed

1. **Logout** from the app
2. **Login again** with `admin@acme.com` / `admin123`
3. The new JWT token will now include the `roleId`
4. Dashboard should load without errors! ✅

---

## What Changed in the Seed

**Before:**
```typescript
await this.prisma.user.upsert({
  where: { email: 'admin@acme.com' },
  update: {}, // Did nothing to existing users
  create: { ... }
});
```

**After:**
```typescript
await this.prisma.user.upsert({
  where: { email: 'admin@acme.com' },
  update: { roleId: 'admin' }, // ✅ Now updates existing users
  create: { roleId: 'admin', ... }
});
```

---

## ✅ After This Fix

All test accounts will have roles:
- `admin@acme.com` → Admin
- `manager@acme.com` → Manager
- `tech1@acme.com` → Technician
- `viewer@acme.com` → Viewer

**Go to:** http://localhost:3001/api/seed

Then logout and login again! 🚀

