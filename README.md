# Physics & Astronomy Club Website

A modern, full-featured website for the Physics & Astronomy Club at Medicaps University, built with Next.js, TypeScript, and Prisma.

![Homepage Screenshot](./screenshot.png)

## 🚀 Features

- **Public Pages**: Home, About, Events, Gallery, Team, Contact
- **Admin Panel**: Complete CMS for managing content
- **Image Management**: Cloudflare R2 integration for optimized image delivery via CDN
- **Backup & Restore**: Full database backup/restore functionality
- **SEO Optimized**: Meta tags, sitemap, robots.txt, structured data
- **Responsive Design**: Mobile-first, modern UI with animations
- **Toast Notifications**: User-friendly feedback system
- **Loading Skeletons**: Better perceived performance

## 📋 Prerequisites

- Node.js 18+ (or Bun)
- PostgreSQL database (Neon recommended)
- Cloudflare account (for R2 storage)
- Vercel account (for deployment)

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Science-Club
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Admin Credentials
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-secure-password"

# Base URL (for SEO)
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com" # Optional, auto-generated if not provided
R2_PUBLIC_URL="https://cdn.yourdomain.com" # Optional: Custom domain for public access
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin panel pages
│   │   ├── api/          # API routes
│   │   └── [pages]/      # Public pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   └── middleware.ts     # Auth middleware
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## 🔐 Admin Access

1. Go to `/admin/login`
2. Enter your admin credentials (set in `.env`)
3. Access the admin dashboard at `/admin`

**Admin Features:**
- Dashboard with statistics
- Manage Events
- Manage Gallery Images
- Manage Team Members
- Manage Updates/News
- View Contact Submissions
- Manage Statistics
- Backup & Restore Database

## 🖼️ Image Management

### Cloudflare R2 Setup

Cloudflare R2 is an S3-compatible object storage service with zero egress fees, perfect for serving images via CDN.

#### Step 1: Create R2 Bucket

1. **Sign in to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Navigate to **R2** → **Create bucket**
   - Enter a bucket name (e.g., `club-images`)
   - Select a location (closest to your users)
   - Click **Create bucket**

#### Step 2: Create API Token

1. **Go to R2 API Tokens**
   - Navigate to **R2** → **Manage R2 API Tokens**
   - Click **Create API token**
   - Enter a token name (e.g., `club-website-token`)
   - Select **Admin Read & Write** permissions
   - Click **Create API Token**
   - **Save the credentials**:
     - Account ID
     - Access Key ID
     - Secret Access Key

#### Step 3: Configure Public Access (Optional but Recommended)

1. **Create Custom Domain** (Recommended for better performance)
   - Go to your bucket → **Settings** → **Public Access**
   - Click **Connect Domain**
   - Enter a subdomain (e.g., `cdn.yourdomain.com`)
   - Follow DNS setup instructions
   - Add this domain to `R2_PUBLIC_URL` in `.env`

   **OR** use R2's public URL format:
   - Go to **Settings** → **Public Access** → Enable **Public Access**
   - Note: You'll get URLs like `https://pub-{accountId}.r2.dev/{bucket}/{key}`

#### Step 4: Set Environment Variables

Add these to your `.env` file:

```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="club-images"
R2_PUBLIC_URL="https://cdn.yourdomain.com" # Optional: Your custom domain
```

#### Step 5: Deploy

When deploying to Vercel, add the same environment variables in:
- Vercel Dashboard → Your Project → Settings → Environment Variables

#### How It Works

- **Upload Images**: Images uploaded through admin panel automatically go to R2
- **Multiple Sizes**: Thumbnail, medium, and full sizes are generated and uploaded
- **CDN Delivery**: Images served via Cloudflare's global CDN
- **Zero Egress Fees**: No charges for bandwidth/downloads
- **Database**: Only URLs stored in database (not base64)

### Processing Old Backups

If you have old backup files with base64 images:

```bash
node scripts/process-backup.js "path/to/backup.json"
```

This removes base64 data and creates a smaller backup file.

## 💾 Backup & Restore

### Export Backup

1. Go to `/admin/backup`
2. Click "Export Backup"
3. Download JSON file with all data

### Restore Backup

1. Go to `/admin/backup`
2. Select backup JSON file
3. Click "Restore Backup"
4. Confirm overwrite

**Note**: Large backups (>4.5MB) with base64 images need to be processed first using the script above.

## 🗄️ Database Migration (Neon)

To migrate to a new Neon database (reset network transfer):

1. **Export Current Data**
   - Go to `/admin/backup` → Export Backup

2. **Create New Neon Project**
   - Visit https://console.neon.tech
   - Create new project
   - Copy new `DATABASE_URL`

3. **Update Environment Variables**
   - Update `.env` with new `DATABASE_URL`
   - Update Vercel environment variables

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Import Data**
   - Go to `/admin/backup` → Restore Backup
   - Upload exported JSON file

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push
   ```

2. **Connect to Vercel**
   - Import your GitHub repository
   - Vercel auto-detects Next.js
   - Add environment variables in Vercel dashboard

3. **Build Configuration**
   - Build command: `prisma migrate deploy && prisma generate && next build`
   - Already configured in `package.json`

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_BASE_URL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL` (optional: custom domain)

## 🔄 Migrating from Vercel Blob to Cloudflare R2

If you have existing images in Vercel Blob Storage, you can migrate them to Cloudflare R2 with one click:

1. **Go to Admin Panel** → **Migrate to R2**
2. **Review the migration status** - See how many images need migration
3. **Click "Start Migration"** - This will:
   - Download all images from Vercel Blob Storage
   - Upload them to Cloudflare R2
   - Update database URLs automatically
   - Preserve all image metadata

**Note**: After migration, you can safely remove Vercel Blob Storage from your Vercel project. The migration tool will handle everything automatically.

## 📊 Network Transfer Optimization

The website uses Cloudflare R2 for images to minimize database transfer:
- Images served from Cloudflare CDN (doesn't count against Neon limit)
- Zero egress fees (unlimited free bandwidth)
- Only metadata stored in database
- Automatic image optimization
- Multiple image sizes (thumbnail, medium, full)
- Global CDN for fast image delivery worldwide

## 🛠️ Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build
npm start                # Start production server

# Database
npx prisma studio        # Open database browser
npx prisma migrate dev   # Create new migration
npx prisma migrate deploy # Apply migrations

# Utilities
node scripts/process-backup.js <file>  # Process old backup files
```

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Storage**: Cloudflare R2
- **Deployment**: Vercel

## 📝 Important Notes

- **Admin Credentials**: Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
- **Database**: Uses Neon PostgreSQL (free tier: 5 GB storage, 5 GB network transfer/month)
- **Images**: Stored in Cloudflare R2 (10 GB free storage, unlimited egress/bandwidth)
- **Backups**: Exclude base64 images to keep file size small
- **Security**: Rate limiting on login (3 attempts per 5 minutes)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in `.env`
- Check Neon project is active
- Ensure SSL mode is included: `?sslmode=require`

### Images Not Loading
- Verify Cloudflare R2 credentials are set correctly
- Check `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` in environment variables
- Ensure R2 bucket has public access enabled
- Check if `R2_PUBLIC_URL` is correctly set (if using custom domain)
- Ensure images have URLs in database

### Backup Too Large
- Use `scripts/process-backup.js` to remove base64 images
- New backups automatically exclude base64

### Build Errors
- Run `npx prisma generate` before building
- Check all environment variables are set
- Verify database migrations are up to date

## 📄 License

This project is private and proprietary.

## 👨‍💻 Development

Developed by [Neetil](https://neetil.in)

---

For questions or issues, check the admin panel or review the codebase documentation.
