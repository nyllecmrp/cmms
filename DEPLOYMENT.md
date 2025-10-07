# Deployment Guide - CMMS Application

This guide will help you deploy the CMMS application to Render with Neon PostgreSQL.

## Prerequisites

- GitHub account (already done ✅)
- Neon account (https://neon.tech) - Free tier available
- Render account (https://render.com) - Free tier available

---

## Step 1: Setup Neon PostgreSQL Database

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up with GitHub or email
   - Create a new project

2. **Get Database Connection String**
   - In your Neon dashboard, click on your project
   - Go to "Connection Details"
   - Copy the connection string (it looks like this):
   ```
   postgresql://neondb_owner:your-password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   - **Save this connection string** - you'll need it for Render

---

## Step 2: Deploy to Render

### Option A: Using render.yaml (Automatic - Recommended)

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `nyllecmrp/cmms`
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables**

   **For Backend Service (cmms-backend):**
   - `DATABASE_URL`: Paste your Neon connection string
   - `JWT_SECRET`: Will auto-generate (or set your own)
   - `PORT`: 3001 (already set)
   - `NODE_ENV`: production (already set)

   **For Frontend Service (cmms-frontend):**
   - `NEXT_PUBLIC_API_URL`: Your backend URL (will be `https://cmms-backend.onrender.com`)
   - `NODE_ENV`: production (already set)

4. **Deploy**
   - Click "Apply"
   - Render will build and deploy both services
   - **First deployment takes 5-10 minutes**

### Option B: Manual Deployment

If you prefer to deploy manually:

#### Deploy Backend:
1. New + → Web Service
2. Connect repository: `nyllecmrp/cmms`
3. Configure:
   - **Name**: cmms-backend
   - **Region**: Singapore
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
   - **Plan**: Free
4. Add environment variables (same as above)
5. Create Web Service

#### Deploy Frontend:
1. New + → Web Service
2. Connect repository: `nyllecmrp/cmms`
3. Configure:
   - **Name**: cmms-frontend
   - **Region**: Singapore
   - **Branch**: main
   - **Root Directory**: frontend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free
4. Add environment variables (same as above)
5. Create Web Service

---

## Step 3: Initialize Database

After the backend deploys successfully:

1. **Check Backend Logs**
   - Go to your backend service in Render
   - Click "Logs"
   - You should see "Prisma migrate deploy" running
   - This creates all tables automatically

2. **Seed Database (Optional)**
   - Go to "Shell" tab in backend service
   - Run: `npm run prisma:seed`
   - This creates the superadmin and test data

   Or manually connect and run seed:
   ```bash
   cd backend
   npx prisma db seed
   ```

---

## Step 4: Access Your Application

After deployment completes:

- **Frontend URL**: `https://cmms-frontend.onrender.com`
- **Backend API**: `https://cmms-backend.onrender.com`

**Default Login:**
- Email: `superadmin@cmms.com`
- Password: `admin123`

---

## Step 5: Update Frontend API URL

After backend is deployed, update the frontend environment variable:

1. Go to cmms-frontend service in Render
2. Environment → Edit
3. Update `NEXT_PUBLIC_API_URL` to your actual backend URL
4. Save → Render will redeploy automatically

---

## Important Notes

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- Limited to 750 hours/month per service
- Database: 0.5 GB storage on Neon free tier

### Production Recommendations:
- Use paid tier for always-on services ($7/month each)
- Set up custom domain
- Enable automatic deploys on push to main branch
- Add monitoring and alerts
- Use separate Neon projects for staging/production

### Database Migrations:

When you update the Prisma schema:

1. **Local Development:**
   ```bash
   cd backend
   npx prisma migrate dev --name your_migration_name
   git add . && git commit -m "Add migration" && git push
   ```

2. **Render Deployment:**
   - Render automatically runs `npx prisma migrate deploy` on startup
   - Migrations apply automatically from `prisma/migrations/` folder

---

## Troubleshooting

### Backend won't start:
- Check DATABASE_URL is correct
- Check logs for Prisma errors
- Verify Neon database is active

### Frontend can't connect to backend:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running (green status)
- Check backend logs for errors

### Database connection errors:
- Verify Neon project is active (not suspended)
- Check connection string has `?sslmode=require`
- Verify IP allowlist in Neon (should be "Allow all")

### Slow first load:
- This is normal on free tier (cold start)
- Consider upgrading to paid tier for production

---

## Monitoring

- **Render Dashboard**: View logs, metrics, deployments
- **Neon Dashboard**: View database usage, queries
- **Health Checks**: Render pings `/` endpoint every 5 minutes

---

## Updating Your App

Push to GitHub and Render auto-deploys:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically:
1. Pull latest code
2. Run build commands
3. Run migrations
4. Deploy new version
5. Zero-downtime deployment

---

## Cost Estimate

**Free Tier (Current):**
- Neon: Free (0.5 GB)
- Render Backend: Free (750 hrs/month)
- Render Frontend: Free (750 hrs/month)
- **Total: $0/month**

**Production Tier:**
- Neon Pro: $19/month (3 GB)
- Render Backend: $7/month (always-on)
- Render Frontend: $7/month (always-on)
- **Total: $33/month**

---

## Need Help?

- Render Docs: https://render.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs

**Your deployment is ready! 🚀**
