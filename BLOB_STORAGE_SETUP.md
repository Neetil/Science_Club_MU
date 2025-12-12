# Vercel Blob Storage Setup & Migration Guide

## 🎯 What Was Done

### 1. **Immediate Optimizations**
- ✅ Added pagination to gallery API (loads 20 images at a time)
- ✅ Improved caching headers (10 min cache, 20 min revalidate)
- ✅ Updated frontend to handle paginated responses

### 2. **Vercel Blob Storage Integration**
- ✅ Installed `@vercel/blob` package
- ✅ Created blob utility functions (`src/lib/blob-utils.ts`)
- ✅ Updated Prisma schema to store image URLs
- ✅ Modified admin gallery upload to use Blob Storage
- ✅ Updated gallery page to prefer URLs over base64
- ✅ Created migration script and admin page

---

## 📋 What You Need to Do

### Step 1: Set Up Vercel Blob Storage

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Enable Blob Storage**
   - Go to **Settings** → **Storage**
   - Click **Create Database** → Select **Blob**
   - This will create a Blob store for your project

3. **Get Your Blob Token** (if needed)
   - Vercel automatically provides the token via environment variables
   - The `@vercel/blob` package uses `BLOB_READ_WRITE_TOKEN` automatically
   - No manual configuration needed! 🎉

### Step 2: Run Database Migration

You need to add the new URL fields to your database:

```bash
npx prisma migrate dev --name add_image_urls
```

This will:
- Add `srcUrl`, `thumbnailUrl`, and `mediumUrl` fields to `GalleryImage` table
- Keep existing `src`, `thumbnail`, `medium` fields (for backward compatibility)

### Step 3: Deploy to Vercel

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add Vercel Blob Storage for image optimization"
   git push
   ```

2. **Vercel will automatically:**
   - Run the database migration
   - Deploy your changes
   - Set up Blob Storage environment variables

### Step 4: Migrate Existing Images

1. **Go to Admin Panel**
   - Visit: `/admin/migrate-images`
   - Or click "Migrate Images" in the admin sidebar

2. **Check Migration Status**
   - See how many images need migration
   - View progress percentage

3. **Run Migration**
   - Click "Migrate [X] Images" button
   - Wait for completion (may take a few minutes)
   - All existing base64 images will be uploaded to Blob Storage

---

## 📊 Expected Results

### Before Migration:
- **Gallery Page Load**: ~68 MB (all images as base64 from database)
- **Monthly Transfer (100 visitors)**: ~6.8 GB ❌ (exceeds 5 GB limit)

### After Migration:
- **Gallery Page Load**: ~2 MB (metadata from database + images from CDN)
- **Monthly Transfer (100 visitors)**: ~200 MB ✅ (well under 5 GB limit)
- **Savings**: 97% reduction in database transfer!

---

## 🔍 How It Works

### New Image Upload Flow:
1. User uploads image in admin panel
2. Image is compressed client-side (thumbnail, medium, full)
3. All sizes uploaded to Vercel Blob Storage
4. URLs stored in database (not base64)
5. Frontend loads images from CDN

### Existing Images:
- Migration script uploads base64 images to Blob Storage
- Updates database with URLs
- Frontend automatically uses URLs when available
- Falls back to base64 for images not yet migrated

---

## ⚠️ Important Notes

1. **Backward Compatibility**: Old base64 images still work during migration
2. **No Data Loss**: Original images are kept until migration completes
3. **Automatic**: New uploads automatically use Blob Storage
4. **Free Tier**: Vercel Blob Storage free tier includes:
   - 5 GB storage
   - 100 GB bandwidth/month
   - Perfect for your needs!

---

## 🐛 Troubleshooting

### Migration Fails:
- Check Vercel Blob Storage is enabled
- Verify `BLOB_READ_WRITE_TOKEN` is set (automatic in Vercel)
- Check browser console for errors

### Images Not Loading:
- Ensure migration completed successfully
- Check that URLs are stored in database
- Verify Blob Storage is accessible

### Still Using Too Much Transfer:
- Make sure all images are migrated
- Check that new uploads use Blob Storage
- Verify frontend is using URLs (not base64)

---

## ✅ Verification

After migration, verify:
1. ✅ All images load correctly on gallery page
2. ✅ New uploads work in admin panel
3. ✅ Images load from `*.public.blob.vercel-storage.com` URLs
4. ✅ Database transfer reduced significantly

---

## 🎉 Benefits

- **97% reduction** in database network transfer
- **Faster load times** (CDN edge caching)
- **Automatic optimization** (Vercel handles it)
- **Stays within free tiers** (no upgrade needed)
- **Better user experience** (faster, more reliable)

---

## 📝 Next Steps (Optional)

After migration is complete, you can:
1. Remove base64 fields from schema (after confirming all images migrated)
2. Add image compression before upload
3. Implement progressive image loading
4. Add image lazy loading for better performance

---

**Need Help?** Check the migration status page at `/admin/migrate-images` for detailed information.

