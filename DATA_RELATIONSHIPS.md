# Data Relationships & Sample Data

## ✅ YES - Data is Fully Connected!

The seed data creates a complete ecosystem where **superadmin can activate/deactivate modules** and **organizations see real connected data**.

---

## Sample Organizations & Users

### 1. **Acme Manufacturing** (Professional Tier)
- **Org ID:** `org-test-1`
- **Industry:** Manufacturing
- **Tier:** Professional
- **Max Users:** 25
- **Admin Account:**
  - Email: `admin@acme.com`
  - Password: `admin123`
  - Name: John Doe

### 2. **Metro Hospital** (Enterprise Tier)
- **Org ID:** `org-test-2`
- **Industry:** Healthcare
- **Tier:** Enterprise
- **Max Users:** 100
- **Admin Account:**
  - Email: `admin@metrohospital.ph`
  - Password: `admin123`
  - Name: Maria Santos

### 3. **Superadmin**
- **Email:** `superadmin@cmms.com`
- **Password:** `admin123`
- **Name:** Super Admin
- **Can:** Manage all organizations and modules

---

## Module Licenses (Already Active)

### Acme Manufacturing Has:
✅ **4 Active Modules** (activated by superadmin):
1. `preventive_maintenance` - Standard tier
2. `inventory_management` - Standard tier
3. `scheduling_planning` - Standard tier
4. `document_management` - Standard tier

**Expires:** 2026-12-31

### Metro Hospital Has:
✅ **6 Active Modules** (activated by superadmin):
1. `preventive_maintenance` - Advanced tier
2. `calibration_management` - Advanced tier
3. `safety_compliance` - Advanced tier
4. `document_management` - Advanced tier
5. `audit_quality` - Premium tier
6. `advanced_analytics` - Advanced tier

**Expires:** 2026-12-31

---

## Sample Assets (Connected to Organizations)

### Acme Manufacturing Assets:
**PUMP-001 - Hydraulic Pump Unit A**
- Asset Number: `PUMP-001`
- Manufacturer: Bosch Rexroth
- Model: A10VSO
- Serial: BR-2023-12345
- Status: Operational
- Criticality: High
- Cost: ₱450,000
- Created by: John Doe (admin@acme.com)

### Metro Hospital Assets:
**MED-CT-001 - CT Scanner**
- Asset Number: `MED-CT-001`
- Name: CT Scanner - Radiology
- Manufacturer: Siemens Healthineers
- Model: SOMATOM Definition AS+
- Serial: SH-CT-2022-789
- Status: Operational
- Criticality: Critical
- Cost: ₱25,000,000
- Warranty: Until 2027-06-01
- Created by: Maria Santos (admin@metrohospital.ph)

---

## Sample Work Orders (Linked to Assets)

### Acme Manufacturing Work Order:
**WO-2025-001 - Monthly PM**
- Title: Monthly PM - Hydraulic Pump
- Type: Preventive
- Priority: Medium
- Status: Open
- **Linked Asset:** PUMP-001
- Scheduled: 2025-10-05
- Estimated: 2 hours
- Created by: John Doe

### Metro Hospital Work Order:
**WO-2025-H001 - CT Scanner Calibration**
- Title: CT Scanner Calibration
- Type: Preventive
- Priority: High
- Status: Open
- **Linked Asset:** MED-CT-001
- Scheduled: 2025-10-10
- Estimated: 4 hours
- Created by: Maria Santos

---

## How Superadmin Controls Modules

The superadmin can **activate/deactivate modules** for any organization using these APIs:

### 1. **Activate a Module**
```http
POST /api/module-licensing/activate
{
  "organizationId": "org-test-1",
  "moduleCode": "predictive_maintenance",
  "activatedById": "superadmin-user-id",
  "expiresAt": "2026-12-31"
}
```

### 2. **Deactivate a Module**
```http
DELETE /api/module-licensing/deactivate
{
  "organizationId": "org-test-1",
  "moduleCode": "inventory_management",
  "deactivatedById": "superadmin-user-id"
}
```

### 3. **Activate Entire Tier**
```http
POST /api/module-licensing/activate-tier
{
  "organizationId": "org-test-1",
  "tier": "enterprise",
  "activatedById": "superadmin-user-id",
  "expiresAt": "2026-12-31"
}
```

### 4. **Check Module Access**
```http
GET /api/module-licensing/organization/{orgId}/module/{moduleCode}/access
```

Returns:
```json
{
  "hasAccess": true,
  "moduleCode": "preventive_maintenance"
}
```

### 5. **Get All Modules for Organization**
```http
GET /api/module-licensing/organization/{orgId}/modules
```

Returns all modules with their licensing status (active/inactive/trial).

---

## What Happens When Superadmin Changes Modules?

### Scenario 1: Superadmin Activates Module
1. Superadmin logs in → `/superadmin`
2. Views organizations → sees Acme Manufacturing
3. Activates `predictive_maintenance` module
4. **Result:**
   - Module license created in database
   - `activatedById` = superadmin's user ID
   - Acme admin can now access the module
   - Module shows as "Active" in Acme's dashboard

### Scenario 2: Superadmin Deactivates Module
1. Superadmin deactivates `inventory_management` for Acme
2. **Result:**
   - License status changed to `inactive`
   - `deactivatedById` = superadmin's user ID
   - Acme admin sees 🔒 lock icon on module
   - Acme admin can request trial/upgrade

### Scenario 3: Organization Requests Trial
1. Acme admin clicks locked module
2. Requests 30-day trial
3. Creates `ModuleRequest` record
4. **Superadmin sees:**
   - Request in `/superadmin/requests`
   - Can approve/reject
   - If approved → automatically activates module for 30 days

---

## Data Flow Examples

### Example 1: Login as Acme Admin
```
1. Login: admin@acme.com / admin123
2. Redirect to: /dashboard
3. Sidebar shows:
   - ✅ Preventive Maintenance (has access)
   - ✅ Inventory (has access)
   - ✅ Scheduling (has access)
   - ✅ Documents (has access)
   - 🔒 Predictive Maintenance (locked)
   - 🔒 Calibration (locked)
4. Assets page shows: PUMP-001
5. Work Orders page shows: WO-2025-001
6. All data is organization-specific
```

### Example 2: Login as Hospital Admin
```
1. Login: admin@metrohospital.ph / admin123
2. Redirect to: /dashboard
3. Sidebar shows:
   - ✅ Preventive Maintenance (has access)
   - ✅ Calibration (has access)
   - ✅ Safety (has access)
   - ✅ Documents (has access)
   - ✅ Audit & Quality (has access)
   - ✅ Advanced Analytics (has access)
   - 🔒 Other modules (locked)
4. Assets page shows: MED-CT-001 (CT Scanner)
5. Work Orders page shows: WO-2025-H001
6. Different data from Acme
```

### Example 3: Login as Superadmin
```
1. Login: superadmin@cmms.com / admin123
2. Redirect to: /superadmin
3. Dashboard shows:
   - Total organizations: 2
   - Total users: 3
   - Active modules: 10
   - Module requests: 0
4. Can view/edit all organizations
5. Can activate/deactivate any module
6. Can see all license expirations
7. Can approve/reject trial requests
```

---

## Database Relationships

```
Organization (org-test-1: Acme Manufacturing)
├── Users (admin@acme.com)
├── Assets (PUMP-001)
├── Work Orders (WO-2025-001) → links to Asset
├── Module Licenses
│   ├── preventive_maintenance (active)
│   ├── inventory_management (active)
│   ├── scheduling_planning (active)
│   └── document_management (active)
└── Module Requests (when user requests trial)

Organization (org-test-2: Metro Hospital)
├── Users (admin@metrohospital.ph)
├── Assets (MED-CT-001)
├── Work Orders (WO-2025-H001) → links to Asset
├── Module Licenses
│   ├── preventive_maintenance (active)
│   ├── calibration_management (active)
│   ├── safety_compliance (active)
│   ├── document_management (active)
│   ├── audit_quality (active)
│   └── advanced_analytics (active)
└── Module Requests (when user requests trial)

Superadmin User (superadmin@cmms.com)
├── Can manage ALL organizations
├── Created module licenses (activatedById = superadmin.id)
├── Can deactivate licenses (deactivatedById = superadmin.id)
└── Can approve module requests
```

---

## Testing the Relationships

### Test 1: View Connected Data
1. Login as `admin@acme.com`
2. Go to Assets → See PUMP-001
3. Go to Work Orders → See WO-2025-001 linked to PUMP-001
4. Go to Modules → See 4 active modules

### Test 2: Module Access Control
1. Login as `admin@acme.com`
2. Click "Predictive Maintenance" (locked 🔒)
3. Modal appears: "Request Trial" or "Upgrade"
4. Click "Request Trial" → Creates request in database
5. Login as `superadmin@cmms.com`
6. Go to `/superadmin/requests` → See Acme's trial request
7. Approve request → Module activates for 30 days
8. Login back as `admin@acme.com`
9. "Predictive Maintenance" now accessible ✅

### Test 3: Superadmin Deactivate Module
1. Login as `superadmin@cmms.com`
2. Go to Organizations → Click Acme
3. Find "inventory_management" module
4. Click "Deactivate"
5. Module status → inactive
6. Login as `admin@acme.com`
7. "Inventory" now shows 🔒 (locked)

---

## Summary

### ✅ What's Already Connected:

1. **Users → Organizations** ✅
   - Each user belongs to one organization
   - Superadmin has no organization (isSuperAdmin = true)

2. **Assets → Organizations** ✅
   - Each asset belongs to one organization
   - Created by users in that organization

3. **Work Orders → Assets** ✅
   - Work orders linked to specific assets
   - Work orders belong to same organization as asset

4. **Module Licenses → Organizations** ✅
   - Each license belongs to one organization
   - Tracks which modules are active/inactive
   - Records who activated (superadmin) and when expires

5. **Module Requests → Organizations** ✅
   - Users can request trials for locked modules
   - Superadmin can see and approve requests
   - Approval auto-activates module

### ✅ What Works:

- ✅ Superadmin can activate/deactivate modules
- ✅ Organizations only see their own data
- ✅ Module access control based on licenses
- ✅ Trial request workflow
- ✅ License expiration tracking
- ✅ Multi-tier support (Standard/Professional/Enterprise)
- ✅ Usage tracking per module
- ✅ All relationships properly connected

**The data is production-ready!** 🎉
