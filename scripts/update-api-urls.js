const fs = require('fs');
const path = require('path');

// Configuration
const OLD_API_URL = 'http://localhost:5000';
const NEW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.railway.app';

// Files to update (relative to frontend directory)
const filesToUpdate = [
  'src/app/auth/login/page.tsx',
  'src/app/auth/register/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/students/page.tsx',
  'src/app/dashboard/doctors/page.tsx',
  'src/app/dashboard/activities/page.tsx',
  'src/app/dashboard/collaboration/page.tsx',
  'src/app/dashboard/collaboration-requests/page.tsx',
  'src/app/dashboard/courses/page.tsx',
  'src/app/dashboard/course-builder/page.tsx',
  'src/app/dashboard/chat/page.tsx',
  'src/app/dashboard/notifications/page.tsx',
  'src/app/dashboard/admin/page.tsx',
  'src/app/dashboard/admin/course-access/page.tsx',
  'src/components/NotificationBadge.tsx'
];

function updateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', 'frontend', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Replace hardcoded localhost URLs
    content = content.replace(
      new RegExp(OLD_API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      NEW_API_URL
    );

    // Replace axios calls that don't use environment variables
    content = content.replace(
      /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]http:\/\/localhost:5000/g,
      `axios.$1(\`\${process.env.NEXT_PUBLIC_API_URL}`
    );

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Updating API URLs for production deployment...\n');
  console.log(`Old API URL: ${OLD_API_URL}`);
  console.log(`New API URL: ${NEW_API_URL}\n`);

  let updatedCount = 0;
  let totalFiles = filesToUpdate.length;

  filesToUpdate.forEach(file => {
    if (updateFile(file)) {
      updatedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`- Files processed: ${totalFiles}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files unchanged: ${totalFiles - updatedCount}`);

  if (updatedCount > 0) {
    console.log(`\n✅ Successfully updated ${updatedCount} files!`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review the changes in the updated files`);
    console.log(`2. Test the application locally`);
    console.log(`3. Commit and push your changes`);
    console.log(`4. Deploy to Vercel`);
  } else {
    console.log(`\nℹ️  No files needed updating.`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateFile, filesToUpdate }; 