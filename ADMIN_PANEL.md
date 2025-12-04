# Admin Panel Documentation

## Overview
The admin panel provides a comprehensive content management system for the Physics & Astronomy Club website.

## Access
- **URL**: `/admin`
- **Login Page**: `/admin/login`
- **Default Credentials** (change these in production!):
  - Username: `admin` (set via `ADMIN_USERNAME` env variable)
  - Password: `admin123` (set via `ADMIN_PASSWORD` env variable)

## Features

### 1. Dashboard (`/admin`)
- Overview of all content
- Quick statistics
- Quick action links

### 2. Events Management (`/admin/events`)
- Create, edit, and delete events
- Set event details (title, description, date, time, location, category)
- Publish/unpublish events
- Upload event images

### 3. Gallery Management (`/admin/gallery`)
- Add images with URL
- Organize by categories (Team, Astronomy Night, Outreach Visits, Observations, Events, Workshops)
- Edit image details (title, category, description)
- Delete images

### 4. Team Management (`/admin/team`)
- Add team members
- Categorize as Executive, Coordinator, or Mentor
- Set roles and descriptions
- Reorder members
- Upload member photos

### 5. Updates/News Management (`/admin/updates`)
- Create news updates
- Set short and full descriptions
- Publish/unpublish updates
- Manage update dates

### 6. Contact Submissions (`/admin/contact`)
- View all contact form submissions
- Mark as read/unread
- Reply via email
- Delete submissions
- Filter unread messages

### 7. Statistics Management (`/admin/statistics`)
- Update club statistics displayed on homepage
- Events conducted count
- Active members count
- Outreach trips count

## Data Storage

All data is stored in JSON files in the `/data` directory:
- `events.json` - Events data
- `gallery.json` - Gallery images
- `team.json` - Team members
- `updates.json` - News updates
- `statistics.json` - Club statistics
- `contact-submissions.json` - Contact form submissions

**Note**: On Vercel (production), the file system is read-only. For production use, consider migrating to a database (PostgreSQL, MongoDB, or Supabase).

## Security

- Authentication is session-based using HTTP-only cookies
- All admin routes are protected by middleware
- Credentials should be set via environment variables in production

## Environment Variables

Create a `.env.local` file:

```env
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

## Production Recommendations

1. **Use a Database**: Replace JSON file storage with a proper database
2. **Strong Passwords**: Use complex passwords for admin accounts
3. **HTTPS**: Ensure HTTPS is enabled
4. **Rate Limiting**: Add rate limiting to login attempts
5. **2FA**: Consider adding two-factor authentication
6. **Audit Logs**: Log all admin actions for security

## API Endpoints

All admin API endpoints require authentication:

- `POST /api/admin/login` - Login
- `POST /api/admin/logout` - Logout
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events` - Update event
- `DELETE /api/admin/events?id={id}` - Delete event

Similar endpoints exist for:
- `/api/admin/gallery`
- `/api/admin/team`
- `/api/admin/updates`
- `/api/admin/contact`
- `/api/admin/statistics`

