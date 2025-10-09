# 🚀 Production Database Seeding Instructions

## ✅ Changes Made

Added **secret key protection** to the seed endpoint to prevent unauthorized access.

---

## 📝 Steps to Seed Production Database on Render

### **Step 1: Set Environment Variable (Optional but Recommended)**

1. Go to Render Dashboard → **cmms-backend** service
2. Click **"Environment"** tab
3. Add new environment variable:
   - **Key:** `SEED_SECRET`
   - **Value:** `your-custom-secret-key-here` (make it hard to guess!)
4. Click **"Save Changes"**
5. Render will **redeploy** your backend (wait ~3-5 minutes)

**If you skip this step:** The default secret will be `my-secret-seed-key-2025`

---

### **Step 2: Trigger the Seed**

Visit this URL in your browser (replace with your actual backend URL and secret):

```
https://your-backend-url.onrender.com/api/seed?secret=your-custom-secret-key-here
```

**Example:**
```
https://cmms-backend-abc123.onrender.com/api/seed?secret=my-secret-seed-key-2025
```

---

### **Step 3: Verify Success**

You should see a JSON response like:

```json
{
  "success": true,
  "message": "✅ Database seeded successfully with comprehensive test data!",
  "data": {
    "organizations": 2,
    "users": 5,
    "locations": 3,
    "assets": 6,
    "workOrders": 6
  },
  "credentials": {
    "superadmin": "superadmin@cmms.com / admin123",
    "acme": "admin@acme.com / admin123",
    "hospital": "admin@metrohospital.ph / admin123",
    "technician1": "tech1@acme.com / admin123",
    "technician2": "tech2@acme.com / admin123"
  }
}
```

---

### **Step 4: Test the Production App**

1. Go to your frontend URL: `https://your-frontend-url.onrender.com`
2. Login with: `admin@acme.com` / `admin123`
3. Navigate to:
   - **Assets** → Should see 6 assets
   - **Work Orders** → Should see 6 work orders
   - **Locations** → Should see 3 locations
   - **Users** → Should see 2 technicians

---

## 🔒 Security

### **Without Secret Key:**
```
https://your-backend-url.onrender.com/api/seed
```
Response:
```json
{
  "success": false,
  "message": "❌ Unauthorized. Provide ?secret=YOUR_SECRET_KEY"
}
```

### **With Correct Secret Key:**
```
https://your-backend-url.onrender.com/api/seed?secret=your-custom-secret-key-here
```
Response: ✅ Seeds the database

---

## 📊 What Gets Seeded

### **Organizations (2)**
- Acme Manufacturing (Professional tier)
- Metro Hospital (Enterprise tier)

### **Users (5)**
- 1 Superadmin
- 2 Company Admins
- 2 Technicians

### **Locations (3)**
- Building A - Production Floor
- Building B - Warehouse
- Building C - Maintenance Shop

### **Assets (6)**
- Hydraulic Pump (PUMP-001)
- Conveyor Belt (CONV-001)
- Backup Generator (GEN-001)
- HVAC Unit (HVAC-001)
- Forklift (FORK-001)
- CNC Machine (CNC-001)

### **Work Orders (6)**
- Mix of statuses: Open, Assigned, In Progress, Completed
- Assigned to technicians
- Linked to assets

---

## ⚠️ Important Notes

1. **Safe to run multiple times:** Uses `upsert` - won't duplicate data
2. **Won't delete existing data:** Only ensures seed records exist
3. **Password for all users:** `admin123` (change after first login!)
4. **Keep secret key private:** Don't share publicly

---

## 🔄 Alternative: Disable After First Use

After seeding, you can **remove the seed endpoint** entirely:

1. Comment out or delete the `@Get('seed')` method in `backend/src/app.controller.ts`
2. Commit and push
3. Render will redeploy without the seed endpoint

This is the most secure approach for production!

---

## 🆘 Troubleshooting

### **"Unauthorized" error**
- Check your secret key matches the `SEED_SECRET` env var
- Default is `my-secret-seed-key-2025` if not set

### **"Database seeded successfully" but no data visible**
- Make sure you're logging in to the correct organization (`admin@acme.com`)
- Check that backend is using the correct `DATABASE_URL`

### **Seed takes too long / times out**
- Normal on free tier Render - can take 30-60 seconds
- Refresh the page if it times out, data may still be created

---

Ready to seed production! 🌱

