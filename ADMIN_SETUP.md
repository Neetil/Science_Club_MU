# Admin Panel Setup Guide

## Setting Up Admin Credentials

To secure your admin panel, you need to set up environment variables with your own credentials.

### Step 1: Update `.env.local` file

Open or create `.env.local` in your project root and add:

```env
ADMIN_USERNAME=your_secure_username_here
ADMIN_PASSWORD=your_secure_password_here
```

**Important Security Tips:**
- Use a strong, unique username (avoid "admin")
- Use a strong password (at least 12 characters)
- Mix uppercase, lowercase, numbers, and special characters
- Never commit `.env.local` to git (it's already in `.gitignore`)

### Step 2: Restart Your Development Server

After updating `.env.local`, restart your Next.js server:

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### Step 3: Set Environment Variables on Vercel (Production)

If you're deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   - `ADMIN_USERNAME` = your username
   - `ADMIN_PASSWORD` = your password
4. Select the environments (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application

### Step 4: Test Your Login

1. Go to `/admin/login`
2. Use your new credentials to log in
3. The default "admin"/"admin123" credentials will no longer work

## Security Notes

- ✅ Default credentials have been removed
- ✅ Environment variables are required
- ✅ Credentials are never exposed in the code
- ✅ `.env.local` is in `.gitignore` and won't be committed

## Troubleshooting

**Issue:** "Invalid credentials" even with correct password
- Make sure `.env.local` exists in the project root
- Check for typos in variable names (must be exactly `ADMIN_USERNAME` and `ADMIN_PASSWORD`)
- Restart your development server after changing `.env.local`

**Issue:** App won't start
- Ensure both `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set in `.env.local`
- Check that there are no extra spaces or quotes around the values

