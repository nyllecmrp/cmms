# CMMS Testing Guide

**Quick Start**: Both servers should already be running!
- Backend: http://localhost:3000/api ✅
- Frontend: http://localhost:3002 ✅

---

## 🧪 Test Scenarios

### Scenario 1: New User Onboarding (5 minutes)

1. **Open Login Page**
   ```
   http://localhost:3002/login
   ```

2. **Login as Acme Admin**
   - Email: `admin@acme.com`
   - Password: `admin123`
   - Expected: Redirects to dashboard

3. **Explore Dashboard**
   - See stats (may show 0 initially)
   - View Quick Actions section
   - See module discovery banner

4. **Create Your First Asset**
   - Click "Assets" in sidebar
   - Click "+ Add New Asset"
   - Fill in:
     - Asset Tag: `PUMP-001`
     - Name: `Hydraulic Pump Unit A`
     - Category: `Equipment`
     - Location: `Production Floor`
     - Status: `Operational`
   - Click "Save"
   - See asset in the list

5. **Create a Work Order**
   - Click "Work Orders" in sidebar
   - Click "+ Create Work Order"
   - Fill in:
     - Title: `Monthly PM - Hydraulic Pump`
     - Priority: `Medium`
     - Status: `Open`
     - Link to asset: Select "PUMP-001"
   - Click "Save"
   - See work order in list

6. **Try a Locked Module**
   - Click "Preventive Maintenance" in sidebar
   - See upgrade modal appear
   - Click "Request 30-Day Trial"
   - See confirmation

7. **Logout**
   - Click "Logout" at bottom of sidebar

---

### Scenario 2: Superadmin Module Management (5 minutes)

1. **Login as Superadmin**
   ```
   Email: superadmin@cmms.com
   Password: admin123
   ```
   Expected: Redirects to superadmin dashboard

2. **View Organizations**
   - See list of 2 organizations
   - Acme Manufacturing (Professional)
   - Metro Hospital (Enterprise)
   - See stats: users, modules, revenue

3. **Manage Modules for Acme**
   - Click "Manage Modules" on Acme Manufacturing
   - See module list with active/inactive status
   - Find "Predictive Maintenance" (should be inactive)

4. **Activate a Module**
   - Click "Activate" on Predictive Maintenance
   - Confirm activation
   - See status change to "Active"
   - Set expiration date (optional)

5. **View Module Requests**
   - Go back to superadmin dashboard
   - Click "Module Requests" card
   - See pending trial requests from regular users
   - Can approve/deny requests

6. **Logout**

---

### Scenario 3: Module Discovery (3 minutes)

1. **Login as Hospital Admin**
   ```
   Email: admin@metrohospital.ph
   Password: admin123
   ```

2. **Browse Available Modules**
   - Click "Modules" in sidebar
   - See 7+ available modules
   - Each shows:
     - Name and description
     - Tier (Professional/Enterprise/etc)
     - Price (₱2,499 - ₱9,999/month)
     - Key features
     - Benefits

3. **Request a Trial**
   - Click "Start Free Trial" on "Inventory Management"
   - Modal opens
   - Select "30-Day Free Trial"
   - Add justification (optional): "Need to track medical supplies"
   - Click "Submit Request"
   - See success message

4. **Request a Purchase**
   - Click "Request Purchase" on "Calibration Management"
   - Modal opens
   - Select "Purchase"
   - Add justification: "Required for lab equipment compliance"
   - Click "Submit Request"

---

### Scenario 4: Complete CRUD Operations (10 minutes)

#### Assets
1. **Create** multiple assets
   - Equipment: Pump, Generator, CT Scanner
   - Vehicles: Forklift, Ambulance
   - Facilities: HVAC Unit, Elevator

2. **Search** for assets
   - Use search box
   - Try filtering by category
   - Try filtering by status

3. **Edit** an asset
   - Click "Edit" on any asset
   - Change location
   - Change status to "Maintenance"
   - Save

4. **Delete** an asset
   - Click "Delete" on an asset
   - Confirm deletion
   - See it removed from list

#### Work Orders
1. **Create** work orders for different scenarios
   - Emergency repair (High priority)
   - Routine maintenance (Medium priority)
   - Inspection (Low priority)

2. **Filter** work orders
   - Try "All Status" filter
   - Switch to "Open" only
   - Switch to "Completed"

3. **Edit** a work order
   - Change status to "In Progress"
   - Assign to a technician
   - Set due date

4. **Delete** a work order
   - Remove completed work order
   - Confirm

---

### Scenario 5: API Testing (5 minutes)

Use curl or Postman to test the backend directly:

#### 1. Login (Get JWT Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"admin123"}'
```

Expected response:
```json
{
  "user": {
    "id": "xxx",
    "email": "admin@acme.com",
    "firstName": "John",
    "lastName": "Doe",
    "organizationId": "org-test-1",
    "isSuperAdmin": false
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Get Organization Modules
```bash
curl http://localhost:3000/api/module-licensing/organization/org-test-1/modules
```

#### 3. Check Module Access
```bash
curl http://localhost:3000/api/module-licensing/organization/org-test-1/module/preventive_maintenance/access
```

#### 4. Get Assets (with auth token)
```bash
curl http://localhost:3000/api/assets?organizationId=org-test-1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Verification Checklist

### Authentication
- [ ] Can login with test credentials
- [ ] Token stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Logout clears token
- [ ] Superadmin redirects to /superadmin
- [ ] Regular user redirects to /dashboard
- [ ] Invalid credentials show error

### Dashboard
- [ ] Stats load correctly
- [ ] Quick actions work
- [ ] Module discovery banner shows
- [ ] Navigation sidebar works
- [ ] User info displays at bottom
- [ ] Logout button works

### Assets
- [ ] List shows all assets
- [ ] Create form opens
- [ ] Can create new asset
- [ ] Asset appears in list
- [ ] Can edit asset
- [ ] Can delete asset
- [ ] Search works
- [ ] Filters work
- [ ] Stats cards update

### Work Orders
- [ ] List shows all work orders
- [ ] Create form opens
- [ ] Can create new WO
- [ ] WO appears in list
- [ ] Can edit WO
- [ ] Can delete WO
- [ ] Status filter works
- [ ] Quick stats update

### Modules
- [ ] All 7+ modules display
- [ ] Pricing shows correctly
- [ ] Trial request modal opens
- [ ] Can submit trial request
- [ ] Purchase request modal opens
- [ ] Can submit purchase request
- [ ] Success message shows

### Locked Modules
- [ ] Locked modules show lock icon
- [ ] Clicking opens modal
- [ ] Modal shows module info
- [ ] "Request Trial" button works
- [ ] "Upgrade" button navigates

### Superadmin
- [ ] Organizations list loads
- [ ] Stats show correctly
- [ ] Can click "Manage Modules"
- [ ] Module list loads
- [ ] Can activate module
- [ ] Can deactivate module
- [ ] Module requests page works
- [ ] Quick action cards work

---

## 🐛 Common Issues & Solutions

### Issue: Frontend won't start
**Solution**: Port 3001 may be in use. Frontend should auto-select 3002.

### Issue: Backend API 404
**Solution**: Make sure you're using `/api` prefix: `http://localhost:3000/api/auth/login`

### Issue: "No assets found"
**Solution**: Database is empty. Create assets using the UI first.

### Issue: Can't login
**Solution**:
1. Check backend is running on port 3000
2. Verify email/password are correct (see credentials above)
3. Check browser console for errors

### Issue: Module activation not working
**Solution**: Make sure you're logged in as superadmin (superadmin@cmms.com)

### Issue: Stats show 0
**Solution**: This is normal for a fresh database. Create assets and work orders to see stats.

---

## 📊 Expected Database State After Testing

After running all test scenarios, you should have:

- **Organizations**: 2 (Acme, Metro Hospital)
- **Users**: 3 (superadmin, acme admin, hospital admin)
- **Assets**: 5-10 (depending on how many you created)
- **Work Orders**: 3-5
- **Module Licenses**: 4-6 active modules
- **Module Requests**: 2-3 pending requests

---

## 🔍 Debugging Tips

### Check Backend Logs
The backend terminal shows all API requests:
```
[Nest] 47000  - GET /api/assets 200
[Nest] 47000  - POST /api/auth/login 200
```

### Check Frontend Console
Open browser DevTools (F12) → Console to see:
- API errors
- Authentication state
- Network requests

### Check Network Tab
DevTools → Network to see:
- API request/response
- Status codes
- Response payloads

### Check LocalStorage
DevTools → Application → LocalStorage → http://localhost:3002
- Should see `token` and `user` keys
- Token should be a long JWT string

---

## 🎯 Success Criteria

Your testing is successful if you can:

✅ Login with all 3 test accounts
✅ Create assets and work orders
✅ See real-time stats update
✅ Request module trials
✅ Activate modules as superadmin
✅ See locked modules and upgrade prompts
✅ Navigate entire app without errors
✅ Logout and login again

---

## 📝 Test Report Template

Use this to document your testing:

```
## Test Session Report

**Date**: ___________
**Tester**: ___________
**Duration**: ___________

### Scenarios Tested
- [ ] Scenario 1: New User Onboarding
- [ ] Scenario 2: Superadmin Management
- [ ] Scenario 3: Module Discovery
- [ ] Scenario 4: CRUD Operations
- [ ] Scenario 5: API Testing

### Issues Found
1.
2.
3.

### Features Working Well
1.
2.
3.

### Suggested Improvements
1.
2.
3.

### Overall Rating: ___/10
```

---

**Happy Testing! 🎉**

If you find any bugs or have questions, check the BUILD_COMPLETE.md file for more details.
