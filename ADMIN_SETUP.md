# Admin System Setup

## Overview

The Autism Support Platform implements a single-admin system where only one admin account can exist on the platform. The admin must be a Specialist Educator with full administrative privileges.

## Admin Account Creation

### Method 1: Web Interface
1. Navigate to `/auth/admin-register` in your browser
2. Fill in the admin details:
   - Full Name
   - Email address
   - Password
   - Specialization (optional)
3. Click "Create Admin Account"
4. The system will automatically set the role to "Specialist Educator" and enable admin privileges

### Method 2: Script (Recommended for Initial Setup)
1. Navigate to the backend directory: `cd backend`
2. Run the admin creation script:
   ```bash
   node scripts/create-admin.js
   ```
3. The script will create an admin account with these default credentials:
   - Email: `admin@autismsupport.com`
   - Password: `admin123456`
4. **Important**: Change the password immediately after first login

## Admin Features

### Admin Dashboard (`/dashboard/admin`)
- **User Management**: View all platform users
- **User Statistics**: See total users, professionals, parents, and admin count
- **User Actions**: Delete non-admin users
- **Access Control**: Only accessible to admin users

### Admin Privileges
- View all platform users
- Delete non-admin users
- Access admin-specific dashboard
- Full platform administration capabilities

## Security Features

### Database Constraints
- Unique index on `isAdmin` field ensures only one admin can exist
- Admin accounts cannot be deleted through the web interface
- Only Specialist Educators can be assigned admin privileges

### Permission Checks
- All admin routes require `isAdmin: true` in the JWT token
- Frontend checks for admin status before showing admin features
- Backend validates admin permissions on all admin endpoints

## User Roles

The platform supports these user roles:
- `child_psychiatrist` - Child Psychiatrist
- `specialist_educator` - Specialist Educator (can be admin)
- `occupational_therapist` - Occupational Therapist
- `psychologist` - Psychologist
- `school_support_assistant` - School Support Assistant
- `speech_therapist` - Speech Therapist
- `parent` - Parent/Guide
- `ministry_staff` - Ministry Staff

## API Endpoints

### Admin-Only Endpoints
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete user (admin only, cannot delete admin)

### Regular User Endpoints
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (self or admin)
- `POST /api/users/:id/avatar` - Upload avatar (self or admin)

## Frontend Integration

### Admin Indicators
- Admin badge displayed in dashboard header
- Admin dashboard card prominently displayed
- Admin registration link on login page

### Access Control
- Admin dashboard only visible to admin users
- Automatic redirect for non-admin users trying to access admin pages
- Clear error messages for unauthorized access

## Troubleshooting

### "Admin account already exists" Error
- Only one admin account can exist
- Use the existing admin account or contact the current admin
- Check the database for existing admin users

### Permission Denied Errors
- Ensure the user has `isAdmin: true` in their JWT token
- Check that the user's role is `specialist_educator`
- Verify the database has the correct admin flag set

### Database Issues
- Ensure the unique index on `isAdmin` field is properly created
- Check MongoDB connection and permissions
- Verify the User model schema is up to date

## Best Practices

1. **Change Default Password**: Always change the default admin password
2. **Secure Access**: Use strong passwords and secure connections
3. **Regular Backups**: Backup admin account information
4. **Monitor Access**: Regularly check admin dashboard for suspicious activity
5. **Documentation**: Keep admin credentials in a secure location

## Support

For admin-related issues:
1. Check the application logs for error messages
2. Verify database connectivity and permissions
3. Ensure all required environment variables are set
4. Contact the development team for technical support 