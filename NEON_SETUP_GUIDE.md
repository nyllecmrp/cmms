# Neon PostgreSQL Setup Guide

Complete step-by-step guide to set up Neon database for your CMMS application.

---

## What is Neon?

Neon is a serverless PostgreSQL database that's perfect for modern applications:
- ✅ **Free tier**: 0.5 GB storage, 10 branches
- ✅ **Auto-scaling**: Scales to zero when not in use
- ✅ **Fast**: Built on modern PostgreSQL
- ✅ **Easy**: No server management needed

---

## Step 1: Create Neon Account

1. **Go to Neon Website**
   - Open https://neon.tech in your browser

2. **Sign Up**
   - Click "Sign Up" button (top right)
   - Choose one of these options:
     - **Sign up with GitHub** (recommended - faster)
     - **Sign up with Google**
     - **Sign up with Email**

3. **Verify Email** (if using email signup)
   - Check your email inbox
   - Click the verification link
   - Return to Neon dashboard

---

## Step 2: Create Your First Project

1. **You'll see "Create your first project" page**

2. **Fill in Project Details:**
   - **Project Name**: `cmms-production` (or any name you want)
   - **Database Name**: Leave as `neondb` (default)
   - **Region**: Choose closest to your users:
     - **Singapore** (for Asia-Pacific)
     - **US East (Ohio)** (for Americas)
     - **Europe (Frankfurt)** (for Europe)
   - **PostgreSQL Version**: Leave as latest (16)

3. **Click "Create Project"**
   - Neon will create your database in 5-10 seconds

---

## Step 3: Get Your Connection String

After project creation, you'll see the "Connection Details" page:

### Method 1: Copy from Dashboard

1. **Look for "Connection string" section**

2. **You'll see a dropdown with options:**
   - Select **"Pooled connection"** (recommended for Render)

3. **Click the copy icon** next to the connection string

4. **Your connection string looks like this:**
   ```
   postgresql://neondb_owner:AbCdEf123XyZ@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

5. **Save it somewhere safe** (you'll need it for Render deployment)

### Method 2: Find It Later

If you closed the page, you can always find it:

1. Go to https://console.neon.tech
2. Click on your project name
3. Click "Dashboard" in left sidebar
4. Scroll to "Connection Details"
5. Copy the connection string

---

## Step 4: Understand Your Connection String

Your connection string has these parts:

```
postgresql://neondb_owner:AbCdEf123XyZ@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Breaking it down:
- `postgresql://` - Database type
- `neondb_owner` - Database username
- `AbCdEf123XyZ` - Your password (auto-generated)
- `ep-cool-sound-123456.us-east-2.aws.neon.tech` - Database host
- `neondb` - Database name
- `?sslmode=require` - Use secure connection

**IMPORTANT:** Never share this publicly - it has your password!

---

## Step 5: Test Your Database (Optional)

You can test the connection locally before deploying:

1. **Update your local `.env` file:**
   ```bash
   # backend/.env
   DATABASE_URL="postgresql://neondb_owner:AbCdEf123XyZ@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

3. **Seed the database:**
   ```bash
   npm run prisma:seed
   ```

4. **Start backend:**
   ```bash
   npm run start:dev
   ```

If everything works locally, it will work on Render!

---

## Step 6: Configure IP Allowlist (Usually Not Needed)

Neon's free tier allows connections from anywhere by default. But if you need to restrict:

1. Go to your project in Neon console
2. Click "Settings" in left sidebar
3. Click "IP Allow"
4. By default it shows "No restrictions" ✅
5. Leave it as-is for Render (Render uses dynamic IPs)

---

## Step 7: Monitor Your Database

### Check Database Usage:

1. Go to https://console.neon.tech
2. Click your project
3. Click "Dashboard"
4. You'll see:
   - **Storage Used**: How much data you're storing
   - **Compute Time**: How long database was active
   - **Data Transfer**: Network usage
   - **Active Time**: When database was running

### Free Tier Limits:

- **Storage**: 0.5 GB (500 MB)
- **Compute**: Unlimited (but scales to zero)
- **Projects**: 1 project
- **Branches**: 10 branches

---

## Step 8: Neon Dashboard Features

### Useful Tabs:

1. **Dashboard**
   - Overview of your database
   - Connection details
   - Usage metrics

2. **Tables**
   - View your database tables (after migration)
   - Browse data
   - Run SQL queries

3. **SQL Editor**
   - Run custom SQL queries
   - Useful for debugging
   - Can view/edit data directly

4. **Branches**
   - Create database branches (like Git branches)
   - Test changes without affecting production

5. **Monitoring**
   - View connection logs
   - Query performance
   - Storage usage over time

6. **Settings**
   - Reset password
   - Delete project
   - Configure backups

---

## Common Questions

### Q: How do I reset my database password?

1. Go to your project in Neon console
2. Click "Settings" → "General"
3. Click "Reset password"
4. Copy the new connection string

### Q: Can I use this for production?

Yes! Neon free tier is suitable for:
- ✅ Testing with colleagues
- ✅ Small production apps (< 500 MB data)
- ✅ MVP/prototype applications

For larger production apps, consider:
- **Neon Pro**: $19/month (3 GB storage, better performance)
- **Neon Scale**: $69/month (10 GB storage, priority support)

### Q: Will my database sleep like Render?

Yes! Neon scales to zero after 5 minutes of inactivity (free tier).
- First query after sleep takes ~1-2 seconds to wake up
- Subsequent queries are instant
- No cold start for the database itself (only connection)

### Q: How do I backup my data?

**Free Tier:**
- Neon keeps automated backups for 7 days
- You can't download them directly
- Use `pg_dump` manually:
  ```bash
  pg_dump "YOUR_CONNECTION_STRING" > backup.sql
  ```

**Paid Tier:**
- Point-in-time recovery
- Downloadable backups
- Custom retention periods

### Q: Can I connect with database tools?

Yes! Use any PostgreSQL client:

**Tools you can use:**
- **pgAdmin** (GUI tool)
- **DBeaver** (Multi-database tool)
- **TablePlus** (Mac/Windows GUI)
- **psql** (Command line)
- **Prisma Studio** (Run `npx prisma studio`)

Just use your Neon connection string!

### Q: What if I exceed free tier limits?

- **Storage > 0.5 GB**: You'll get a warning, then read-only mode
- **Solution**: Upgrade to paid tier or clean up data
- **Note**: They won't charge you without confirmation

---

## Troubleshooting

### Error: "connection refused"

**Cause**: Wrong connection string or database not active

**Fix:**
1. Verify connection string is correct
2. Check project status in Neon console
3. Ensure `?sslmode=require` is at the end

### Error: "password authentication failed"

**Cause**: Wrong password in connection string

**Fix:**
1. Go to Neon console
2. Copy fresh connection string
3. Password might have been reset

### Error: "too many connections"

**Cause**: Free tier limits concurrent connections

**Fix:**
1. Use pooled connection string
2. Close unused connections
3. Add connection pooling in your app

### Slow queries

**Cause**: Database is waking from sleep

**Fix:**
- This is normal on free tier (1-2 second first query)
- Upgrade to paid tier for always-on database
- Consider connection pooling

---

## Next Steps

Now that you have your Neon database ready:

1. ✅ You have your connection string
2. ✅ Database is active and ready
3. ➡️ **Go to [DEPLOYMENT.md](DEPLOYMENT.md)** to deploy on Render
4. ➡️ Use your connection string for `DATABASE_URL` environment variable

---

## Need Help?

- **Neon Docs**: https://neon.tech/docs
- **Neon Discord**: https://discord.gg/neon
- **Support**: support@neon.tech

**Your Neon database is ready! 🎉**

Next: Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to Render.
