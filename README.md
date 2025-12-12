# Physics & Astronomy Club Website

A modern, full-featured website for the Physics & Astronomy Club at Medicaps University, built with Next.js, TypeScript, and Prisma.

![Homepage Screenshot](./screenshot.png)

## 🚀 Features

- **Public Pages**: Home, About, Events, Gallery, Team, Contact
- **Admin Panel**: Complete CMS for managing content
- **Image Management**: Vercel Blob Storage integration for optimized image delivery
- **Backup & Restore**: Full database backup/restore functionality
- **SEO Optimized**: Meta tags, sitemap, robots.txt, structured data
- **Responsive Design**: Mobile-first, modern UI with animations
- **Toast Notifications**: User-friendly feedback system
- **Loading Skeletons**: Better perceived performance

## 📋 Prerequisites

- Node.js 18+ (or Bun)
- PostgreSQL database (Neon recommended)
- Vercel account (for deployment and Blob Storage)

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

# Vercel Blob Storage (automatically set in Vercel)
BLOB_READ_WRITE_TOKEN="your-blob-token" # Optional, auto-configured in Vercel
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

### Vercel Blob Storage Setup

1. **Enable Blob Storage in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Storage
   - Click "Create Database" → Select "Blob"
   - Token is automatically configured

2. **Database Migration** (if not done)
   ```bash
   npx prisma migrate deploy
   ```

3. **Upload Images**
   - Images uploaded through admin panel automatically go to Blob Storage
   - Multiple sizes generated: thumbnail, medium, full
   - URLs stored in database (not base64)

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
- `BLOB_READ_WRITE_TOKEN` (auto-configured if Blob Storage enabled)

## 📊 Network Transfer Optimization

The website uses Vercel Blob Storage for images to minimize database transfer:
- Images served from CDN (doesn't count against Neon limit)
- Only metadata stored in database
- Automatic image optimization
- Multiple image sizes (thumbnail, medium, full)

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
- **Storage**: Vercel Blob Storage
- **Deployment**: Vercel

## 📝 Important Notes

- **Admin Credentials**: Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
- **Database**: Uses Neon PostgreSQL (free tier: 5 GB storage, 5 GB network transfer/month)
- **Images**: Stored in Vercel Blob Storage (free tier: 5 GB storage, 100 GB bandwidth/month)
- **Backups**: Exclude base64 images to keep file size small
- **Security**: Rate limiting on login (3 attempts per 5 minutes)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in `.env`
- Check Neon project is active
- Ensure SSL mode is included: `?sslmode=require`

### Images Not Loading
- Verify Vercel Blob Storage is enabled
- Check `BLOB_READ_WRITE_TOKEN` is set (auto in Vercel)
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
