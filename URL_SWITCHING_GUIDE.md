# URL Switching Scripts Guide

This guide explains how to use the URL switching scripts to easily switch between local development and production environments.

## 🎯 Overview

When your backend deployment expires or you need to work locally, these scripts automatically update all hardcoded URLs throughout your frontend codebase.

## 📁 Available Scripts

### 1. **Main Script (Recommended)**
- **File**: `scripts/url-switcher.js`
- **Features**: 
  - Supports local, production, and staging environments
  - Dry-run mode to preview changes
  - Automatic backups
  - Environment file updates
  - Detailed logging

### 2. **Simple Scripts**
- **File**: `scripts/switch-to-local.js` - Switch to local development
- **File**: `scripts/switch-to-production.js` - Switch to production

### 3. **Windows Batch Scripts**
- **File**: `scripts/switch-to-local.bat` - Windows-friendly local switching
- **File**: `scripts/switch-to-production.bat` - Windows-friendly production switching

## 🚀 Quick Start

### For Local Development (Backend Expired)

**Option 1: Using the main script (Recommended)**
```bash
# Switch to local development
node scripts/url-switcher.js local

# Preview changes without applying them
node scripts/url-switcher.js local --dry-run
```

**Option 2: Using simple script**
```bash
node scripts/switch-to-local.js
```

**Option 3: Windows users**
```bash
# Double-click or run:
scripts/switch-to-local.bat
```

### For Production Deployment

**Option 1: Using the main script**
```bash
node scripts/url-switcher.js production
```

**Option 2: Using simple script**
```bash
node scripts/switch-to-production.js
```

**Option 3: Windows users**
```bash
scripts/switch-to-production.bat
```

## 📋 What the Scripts Do

### 1. **File Processing**
- Scans all `.js`, `.jsx`, `.ts`, `.tsx` files in `frontend/src/`
- Replaces hardcoded production URLs with local URLs (or vice versa)
- Updates environment files (`.env.local`, `.env.development`, `.env`)

### 2. **URL Mappings**
- **Production**: `https://autism-support-platform-production.up.railway.app`
- **Local**: `http://localhost:8080`
- **Staging**: `https://autism-support-platform-staging.up.railway.app` (optional)

### 3. **Safety Features**
- **Backups**: Creates timestamped backups before making changes
- **Dry-run mode**: Preview changes without applying them
- **Error handling**: Continues processing even if some files fail
- **Detailed logging**: Shows exactly what was changed

## 🔧 Advanced Usage

### Dry Run Mode
Preview what changes would be made without actually applying them:
```bash
node scripts/url-switcher.js local --dry-run
```

### Staging Environment
If you have a staging environment:
```bash
node scripts/url-switcher.js staging
```

### Custom URLs
To use different URLs, edit the `URLS` object in `scripts/url-switcher.js`:
```javascript
const URLS = {
  production: 'https://your-production-url.com',
  local: 'http://localhost:8080',
  staging: 'https://your-staging-url.com'
};
```

## 📊 Script Output Example

```
🔄 Switching to local URLs...
📝 Replacing: https://autism-support-platform-production.up.railway.app
📝 With: http://localhost:8080

📊 Current Status:
   Frontend API URL: Not set
   Target: local
   Dry Run: No

💾 Backup created: backups/url-switch-2024-01-15T10-30-45-123Z
🔍 Found 45 files to process...

✅ frontend/src/app/dashboard/students/page.tsx (8 replacements)
✅ frontend/src/components/ChatModal.tsx (3 replacements)
✅ frontend/src/app/dashboard/profile/page.tsx (4 replacements)
✅ frontend/src/utils/api.ts (1 replacements)
✅ Updated environment file: frontend/.env.local

🎉 URL switching completed!
📊 Files modified: 5
📊 Total replacements: 16

🚀 Next steps:
1. Start your local backend server: npm run dev (in backend directory)
2. Start your frontend: npm run dev (in frontend directory)
3. Your frontend will now connect to localhost:8080
```

## 🛠️ Manual URL Updates

If you prefer to update URLs manually, here are the key files to check:

### 1. **Main API Configuration**
```typescript
// frontend/src/utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

### 2. **Environment Files**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080

# frontend/.env.development
NEXT_PUBLIC_API_URL=http://localhost:8080

# frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. **Common Files with Hardcoded URLs**
- `frontend/src/app/dashboard/students/page.tsx`
- `frontend/src/app/dashboard/profile/page.tsx`
- `frontend/src/app/dashboard/collaboration/page.tsx`
- `frontend/src/app/dashboard/courses/page.tsx`
- `frontend/src/app/auth/login/page.tsx`
- `frontend/src/app/auth/register/page.tsx`
- `frontend/src/components/ChatModal.tsx`

## 🔍 Troubleshooting

### Script Not Working
1. **Check Node.js**: Ensure Node.js is installed and in your PATH
2. **Check file permissions**: Ensure you have write permissions to the files
3. **Check file paths**: Ensure you're running the script from the project root

### Files Not Being Updated
1. **Check file extensions**: Scripts only process `.js`, `.jsx`, `.ts`, `.tsx` files
2. **Check directory structure**: Ensure files are in `frontend/src/`
3. **Check for errors**: Look for error messages in the console output

### Environment Variables Not Working
1. **Restart your development server** after updating environment files
2. **Check file names**: Ensure environment files are named correctly
3. **Check syntax**: Ensure no syntax errors in environment files

### Backup Issues
1. **Check disk space**: Ensure you have enough space for backups
2. **Check permissions**: Ensure you can write to the backups directory
3. **Manual backup**: You can manually copy the `frontend/src` directory before running scripts

## 🚨 Important Notes

### Before Running Scripts
1. **Commit your changes** to version control
2. **Test in a branch** if you're unsure
3. **Use dry-run mode** to preview changes first

### After Running Scripts
1. **Restart your development server** to pick up environment changes
2. **Test your application** to ensure everything works
3. **Check the backup** if you need to revert changes

### Best Practices
1. **Use the main script** (`url-switcher.js`) for most cases
2. **Use dry-run mode** before applying changes
3. **Keep backups** for safety
4. **Test thoroughly** after switching environments

## 📝 Example Workflow

### When Backend Deployment Expires

1. **Switch to local development**:
   ```bash
   node scripts/url-switcher.js local
   ```

2. **Start local backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start local frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test your application** at `http://localhost:3000`

### When Ready to Deploy

1. **Switch to production**:
   ```bash
   node scripts/url-switcher.js production
   ```

2. **Deploy backend** to Railway

3. **Deploy frontend** to Vercel

4. **Test production deployment**

## 🆘 Getting Help

If you encounter issues:

1. **Check the console output** for error messages
2. **Use dry-run mode** to preview changes
3. **Check the backup** if you need to revert
4. **Review this guide** for troubleshooting steps

The scripts are designed to be safe and informative, so they should provide clear feedback about what they're doing and any issues they encounter. 