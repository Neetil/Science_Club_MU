# Neon Database Migration Guide

## Overview

This guide will help you migrate from your current Neon database to a new one, resetting your network transfer counter to 0 GB. Since you already have a backup/restore feature, this process is straightforward and safe.

**Why migrate?**
- Reset network transfer usage from 3.2 GB to 0 GB
- Start fresh with a clean usage counter
- All your data will be preserved (no data loss)

---

## Prerequisites

- Access to your current Neon database
- Access to your admin panel (`/admin/backup`)
- Admin credentials to export/import data
- Access to Vercel dashboard (if deployed)

---

## Step-by-Step Migration Process

### Step 1: Export Current Data

1. **Go to Admin Panel**
   - Visit your website: `https://your-domain.com/admin/backup`
   - Or locally: `http://localhost:3000/admin/backup`
   - Login with your admin credentials

2. **Export Backup**
   - Click the **"Export Backup"** button
   - A JSON file will download (e.g., `backup-2025-01-15.json`)
   - **Save this file safely** - it contains all your data:
     - Events
     - Gallery Images
     - Team Members
     - Updates/News
     - Statistics
     - Contact Submissions

3. **Verify Export**
   - Open the JSON file to confirm it contains data
   - File should be several MB (depending on your data size)

---

### Step 2: Create New Neon Project

1. **Go to Neon Console**
   - Visit: https://console.neon.tech
   - Login with your Neon account

2. **Create New Project**
   - Click **"Create Project"** button
   - Enter a project name (e.g., "Science-Club-New" or "Science-Club-v2")
   - Select your preferred region (same as current if possible)
   - Click **"Create Project"**

3. **Get Connection String**
   - After project creation, you'll see the connection details
   - Click **"Connection Details"** or **"Connection String"**
   - Copy the **PostgreSQL connection string**
   - It looks like: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require`
   - **Save this connection string** - you'll need it in the next step

---

### Step 3: Update Environment Variables

#### Local Development (.env files)

1. **Update `.env` file**
   ```bash
   # Open .env file in your project root
   # Replace the old DATABASE_URL with the new one:
   
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```

2. **Update `.env.local` file** (if it exists)
   - Same as above, replace `DATABASE_URL` with new connection string

#### Vercel Deployment (if deployed)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Update Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Find `DATABASE_URL`
   - Click **Edit** or **Remove** the old one
   - Click **Add New**
   - Name: `DATABASE_URL`
   - Value: Paste your new Neon connection string
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

---

### Step 4: Run Migrations on New Database

The new database is empty, so we need to create all the tables first.

1. **Open Terminal/PowerShell**
   - Navigate to your project directory:
     ```powershell
     cd "D:\Club Website\Science-Club"
     ```

2. **Run Prisma Migrations**
   ```powershell
   npx prisma migrate deploy
   ```
   
   This will:
   - Connect to your new database
   - Create all tables (Event, GalleryImage, TeamMember, Update, Statistics, ContactSubmission)
   - Apply all migrations

3. **Verify Tables Created**
   ```powershell
   npx prisma studio
   ```
   - This opens a database browser
   - You should see all tables (they'll be empty for now)
   - Close Prisma Studio when done

---

### Step 5: Import Data to New Database

1. **Go to Admin Panel**
   - Visit: `https://your-domain.com/admin/backup` (or localhost)
   - Make sure you're using the new database (check that tables are empty)

2. **Import Backup**
   - Click **"Choose File"** or file input
   - Select the JSON backup file you exported in Step 1
   - Click **"Import Backup"** or **"Restore"** button
   - **Confirm the warning** - this will overwrite all data in the new database

3. **Wait for Import**
   - The import process may take 1-5 minutes depending on data size
   - You'll see a success message when complete
   - The page will show how many records were imported

4. **Verify Data**
   - Check your website:
     - Homepage should show your updates
     - Gallery should show your images
     - Events page should show your events
     - Team page should show your team members
   - Or use Prisma Studio to verify:
     ```powershell
     npx prisma studio
     ```

---

### Step 6: Deploy to Vercel (if applicable)

If your site is deployed on Vercel:

1. **Commit Changes**
   ```powershell
   git add .
   git commit -m "Migrate to new Neon database"
   git push
   ```

2. **Vercel Auto-Deploy**
   - Vercel will automatically detect the push
   - It will use the new `DATABASE_URL` from environment variables
   - Wait for deployment to complete

3. **Verify Production**
   - Visit your production URL
   - Check that all data is present
   - Test admin panel functionality

---

### Step 7: Verify Network Transfer Reset

1. **Check Neon Dashboard**
   - Go to: https://console.neon.tech
   - Select your new project
   - Go to **Dashboard** or **Usage**
   - Network transfer should show **0 GB** or very minimal usage

2. **Monitor Usage**
   - Keep an eye on usage over the next few days
   - With images in Blob Storage, usage should stay very low
   - Only metadata (text data) transfers from database now

---

## Troubleshooting

### Issue: Can't connect to new database

**Solution:**
- Verify `DATABASE_URL` is correct (no extra spaces, quotes, etc.)
- Check that SSL mode is included: `?sslmode=require`
- Ensure the new project is active in Neon console

### Issue: Migration fails

**Solution:**
- Make sure you're connected to the new database (check `.env`)
- Run `npx prisma generate` first
- Then run `npx prisma migrate deploy`

### Issue: Import fails or partial data

**Solution:**
- Check the backup file is valid JSON
- Verify backup file wasn't corrupted during download
- Try exporting again from old database
- Check browser console for error messages

### Issue: Images not loading after migration

**Solution:**
- Images should load from Blob Storage URLs (not database)
- If images are still base64, they'll work but use more transfer
- New uploads will automatically go to Blob Storage

### Issue: Old database still being used

**Solution:**
- Double-check `.env` and `.env.local` files
- Verify Vercel environment variables are updated
- Restart your local dev server: `npm run dev`
- Clear browser cache and cookies

---

## Important Notes

1. **Keep Old Database (Temporarily)**
   - Don't delete the old Neon project immediately
   - Keep it for at least 1-2 weeks as backup
   - Verify everything works on new database first

2. **Backup File Safety**
   - Keep the exported backup file safe
   - Store it in multiple places (local, cloud, etc.)
   - You can use it to restore if anything goes wrong

3. **Network Transfer Going Forward**
   - With images in Blob Storage, database transfer will be minimal
   - Only text/metadata transfers from database
   - Images served from Vercel CDN (doesn't count against Neon)

4. **No Downtime**
   - This migration can be done with zero downtime
   - Export from old database
   - Import to new database
   - Switch connection string
   - Old database can stay active during transition

---

## Quick Checklist

- [ ] Exported backup from old database
- [ ] Created new Neon project
- [ ] Copied new DATABASE_URL
- [ ] Updated `.env` and `.env.local`
- [ ] Updated Vercel environment variables (if deployed)
- [ ] Ran `npx prisma migrate deploy` on new database
- [ ] Imported backup to new database
- [ ] Verified all data is present
- [ ] Tested website functionality
- [ ] Deployed to Vercel (if applicable)
- [ ] Verified network transfer reset to 0 GB
- [ ] Kept old database as backup (for 1-2 weeks)

---

## Expected Results

After migration:
- ✅ Network transfer: **0 GB** (fresh start)
- ✅ All data preserved: Events, Gallery, Team, Updates, etc.
- ✅ Website fully functional
- ✅ Images served from Blob Storage (minimal DB transfer)
- ✅ No data loss

---

## Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all steps were completed correctly
3. Check Neon console for database status
4. Check Vercel logs for deployment errors
5. Use Prisma Studio to inspect database directly

---

**Good luck with your migration!** 🚀

