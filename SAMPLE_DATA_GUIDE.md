# 🌱 Sample Data Seeding Guide

## How to Seed Sample Data

### **For Local Development:**
Visit: `http://localhost:3000/api/seed`

### **For Production (Render.com):**
Visit: `https://your-backend-url.onrender.com/api/seed`

---

## 📊 Sample Data Included

### **Organizations (2)**
1. **Acme Manufacturing**
   - Industry: Manufacturing
   - Tier: Professional
   - City: Manila, Philippines

2. **Metro Hospital**
   - Industry: Healthcare
   - Tier: Enterprise
   - City: Quezon City, Philippines

---

### **Users (5)**

| Email | Password | Name | Organization | Role |
|-------|----------|------|--------------|------|
| `superadmin@cmms.com` | `admin123` | Super Admin | - | Super Admin |
| `admin@acme.com` | `admin123` | John Doe | Acme Manufacturing | Admin |
| `tech1@acme.com` | `admin123` | Juan Cruz | Acme Manufacturing | Technician |
| `tech2@acme.com` | `admin123` | Ana Reyes | Acme Manufacturing | Technician |
| `admin@metrohospital.ph` | `admin123` | Maria Santos | Metro Hospital | Admin |

---

### **Locations (3)** - for Acme Manufacturing

1. **Building A - Production Floor**
   - Type: Building
   - Address: 123 Industrial Ave, Manila

2. **Building B - Warehouse**
   - Type: Building
   - Address: 125 Industrial Ave, Manila

3. **Building C - Maintenance Shop**
   - Type: Building
   - Address: 127 Industrial Ave, Manila

---

### **Assets (6)** - for Acme Manufacturing

| Asset # | Name | Category | Status | Location | Criticality |
|---------|------|----------|--------|----------|-------------|
| `PUMP-001` | Hydraulic Pump Unit A | Equipment | Operational | Building A | High |
| `CONV-001` | Conveyor Belt System 1 | Equipment | Operational | Building A | Medium |
| `GEN-001` | Backup Generator | Equipment | Operational | Building B | High |
| `HVAC-001` | HVAC Unit - Floor 2 | Equipment | Maintenance | Building A | Medium |
| `FORK-001` | Forklift #1 | Vehicle | Operational | Building B | Low |
| `CNC-001` | CNC Milling Machine | Equipment | Operational | Building A | High |

**Details:**
- All have manufacturer, model, serial number
- Assigned to locations
- Have descriptions and criticality levels

---

### **Work Orders (6)** - for Acme Manufacturing

| WO # | Title | Asset | Type | Priority | Status | Assigned To |
|------|-------|-------|------|----------|--------|-------------|
| `WO-2025-001` | Hydraulic Pump Oil Change | PUMP-001 | Preventive | Medium | In Progress | Juan Cruz |
| `WO-2025-002` | Conveyor Belt Alignment | CONV-001 | Corrective | High | Open | Ana Reyes |
| `WO-2025-003` | Generator Load Test | GEN-001 | Preventive | Medium | Assigned | Juan Cruz |
| `WO-2025-004` | HVAC Filter Replacement | HVAC-001 | Preventive | Urgent | **Completed** | Ana Reyes |
| `WO-2025-005` | Forklift Battery Check | FORK-001 | Preventive | Low | Open | Unassigned |
| `WO-2025-006` | CNC Machine Calibration | CNC-001 | Preventive | High | Assigned | Juan Cruz |

**Details:**
- All have scheduled dates
- Work orders have different statuses (open, assigned, in_progress, completed)
- WO-004 has actual hours, labor cost, parts cost (completed example)
- Mix of preventive and corrective maintenance

---

## 🎯 Testing Coverage

With this sample data, you can test:

### **Assets Module**
- ✅ View 6 assets in table
- ✅ Filter by status (operational, maintenance)
- ✅ Search by asset number, name, manufacturer
- ✅ Edit existing assets
- ✅ View asset details with location
- ✅ Asset hierarchy (parent-child relationships possible)

### **Work Orders Module**
- ✅ View 6 work orders with different statuses
- ✅ Filter by status (open, assigned, in_progress, completed)
- ✅ Search by WO#, title, asset, assigned user
- ✅ Edit work orders
- ✅ View assigned technicians
- ✅ See completed work order with costs

### **Locations Module**
- ✅ View 3 locations
- ✅ Edit existing locations
- ✅ Delete locations (will fail if assets assigned)
- ✅ Create new locations
- ✅ See assets assigned to each location

### **Users Module**
- ✅ View 3 users (excluding admin)
- ✅ Invite new users
- ✅ See different roles
- ✅ Test user assignment in work orders

### **Dashboard**
- ✅ Real asset and work order data
- ✅ Status distribution charts
- ✅ Recent activity
- ✅ Workload distribution by technician

---

## 🔄 Re-seeding

The seed uses `upsert` so you can run it multiple times:
- First run: Creates all data
- Subsequent runs: Updates existing data (safe)

**Note:** Running the seed will NOT delete existing data you manually created. It only ensures the specific seed records exist.

---

## 📝 Next Steps

1. **Visit seed endpoint:** `http://localhost:3000/api/seed`
2. **Login as admin:** `admin@acme.com` / `admin123`
3. **Test all modules:**
   - Assets page (should see 6 assets)
   - Work Orders page (should see 6 work orders)
   - Locations page (should see 3 locations)
   - Users page (should see 2 technicians)
4. **Try editing, filtering, searching**
5. **Create new records**
6. **Test form resets**

---

## 🚀 Sample Workflows to Test

### **1. Complete a Work Order**
1. Login as `admin@acme.com`
2. Go to Work Orders
3. Find WO-2025-002 (Conveyor Belt Alignment) - Status: Open
4. Edit it
5. Change status to "In Progress"
6. Add actual start time
7. Save
8. Edit again, change to "Completed"
9. Add actual end time, labor cost, parts cost
10. Verify it shows in completed list

### **2. Assign Technician to Work Order**
1. Find WO-2025-005 (Forklift Battery Check) - Unassigned
2. Edit it
3. Assign to "Juan Cruz" or "Ana Reyes"
4. Verify status changes to "Assigned"

### **3. Test Asset Editing**
1. Go to Assets
2. Edit HVAC-001 (currently in maintenance)
3. Change status to "Operational"
4. Change location to "Building B - Warehouse"
5. Save and verify changes

### **4. Generate Work Order from PM**
1. Go to Preventive Maintenance
2. Click "Generate WO" on any schedule
3. Go to Work Orders
4. Verify new WO created with auto-generated number

---

All sample data is ready for comprehensive testing! 🎉

