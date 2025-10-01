const fs = require('fs');
const path = require('path');

// Configuration
const URLS = {
  production: 'http://localhost:5000',
  local: 'http://localhost:5000',
  staging: 'https://autism-support-platform-staging.up.railway.app' // Optional staging URL
};

// Directories to search
const FRONTEND_DIR = path.join(__dirname, '../frontend/src');
const SCRIPTS_DIR = path.join(__dirname, '.');

// Get command line arguments
const args = process.argv.slice(2);
const target = args[0] || 'local'; // Default to local
const dryRun = args.includes('--dry-run') || args.includes('-d');

if (!URLS[target]) {
  console.error('❌ Invalid target. Available options: local, production, staging');
  console.log('Usage: node scripts/url-switcher.js [local|production|staging] [--dry-run]');
  process.exit(1);
}

// For local target, replace any localhost:8080 with localhost:5000
const fromUrl = target === 'local' ? 'http://localhost:5000' : URLS.local;
const toUrl = URLS[target];

console.log(`🔄 Switching to ${target} URLs...`);
console.log(`📝 Replacing: ${fromUrl}`);
console.log(`📝 With: ${toUrl}`);
if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}
console.log('');

let totalFiles = 0;
let totalReplacements = 0;
let skippedFiles = 0;

// Function to recursively find all files
function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  let files = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(findFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to replace URLs in a file
function replaceUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace the URL
    content = content.replace(new RegExp(fromUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), toUrl);
    
    // If content changed
    if (content !== originalContent) {
      // Count replacements
      const matches = originalContent.match(new RegExp(fromUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
      const replacementCount = matches ? matches.length : 0;
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      console.log(`${dryRun ? '🔍' : '✅'} ${path.relative(process.cwd(), filePath)} (${replacementCount} replacements)`);
      totalReplacements += replacementCount;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    skippedFiles++;
    return false;
  }
}

// Function to update environment files
function updateEnvironmentFiles() {
  const envFiles = [
    path.join(__dirname, '../frontend/.env.local'),
    path.join(__dirname, '../frontend/.env.development'),
    path.join(__dirname, '../frontend/.env')
  ];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      try {
        let content = fs.readFileSync(envFile, 'utf8');
        const originalContent = content;
        
        // Update or add NEXT_PUBLIC_API_URL
        if (content.includes('NEXT_PUBLIC_API_URL=')) {
          content = content.replace(
            /NEXT_PUBLIC_API_URL=.*/g,
            `NEXT_PUBLIC_API_URL=${toUrl}`
          );
        } else {
          content += `\nNEXT_PUBLIC_API_URL=${toUrl}\n`;
        }
        
        if (content !== originalContent) {
          if (!dryRun) {
            fs.writeFileSync(envFile, content, 'utf8');
          }
          console.log(`${dryRun ? '🔍' : '✅'} Updated environment file: ${path.relative(process.cwd(), envFile)}`);
        }
      } catch (error) {
        console.error(`❌ Error updating environment file ${envFile}:`, error.message);
      }
    }
  });
}

// Function to create backup
function createBackup() {
  if (dryRun) return;
  
  const backupDir = path.join(__dirname, '../backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `url-switch-${timestamp}`);
  
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy frontend src directory
    const frontendBackup = path.join(backupPath, 'frontend');
    fs.mkdirSync(frontendBackup, { recursive: true });
    
    // Simple backup - copy the entire src directory
    const copyDir = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const items = fs.readdirSync(src);
      for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyDir(FRONTEND_DIR, path.join(frontendBackup, 'src'));
    console.log(`💾 Backup created: ${path.relative(process.cwd(), backupPath)}`);
    
  } catch (error) {
    console.warn(`⚠️  Could not create backup: ${error.message}`);
  }
}

// Function to show current status
function showCurrentStatus() {
  console.log('📊 Current Status:');
  console.log(`   Frontend API URL: ${process.env.NEXT_PUBLIC_API_URL || 'Not set'}`);
  console.log(`   Target: ${target}`);
  console.log(`   Dry Run: ${dryRun ? 'Yes' : 'No'}`);
  console.log('');
}

// Main execution
try {
  showCurrentStatus();
  
  // Create backup if not dry run
  if (!dryRun) {
    createBackup();
  }
  
  // Find all relevant files
  const frontendFiles = findFiles(FRONTEND_DIR);
  const scriptFiles = findFiles(SCRIPTS_DIR);
  const allFiles = [...frontendFiles, ...scriptFiles];
  
  console.log(`🔍 Found ${allFiles.length} files to process...`);
  console.log('');
  
  // Process each file
  for (const file of allFiles) {
    if (replaceUrlsInFile(file)) {
      totalFiles++;
    }
  }
  
  // Update environment files
  updateEnvironmentFiles();
  
  console.log('');
  console.log('🎉 URL switching completed!');
  console.log(`📊 Files modified: ${totalFiles}`);
  console.log(`📊 Total replacements: ${totalReplacements}`);
  if (skippedFiles > 0) {
    console.log(`⚠️  Files skipped: ${skippedFiles}`);
  }
  console.log('');
  
  if (dryRun) {
    console.log('🔍 This was a dry run. No files were actually modified.');
    console.log('💡 To apply changes, run without --dry-run flag');
  } else {
    console.log('🚀 Next steps:');
    if (target === 'local') {
      console.log('1. Start your local backend server: npm run dev (in backend directory)');
      console.log('2. Start your frontend: npm run dev (in frontend directory)');
      console.log('3. Your frontend will now connect to localhost:8080');
    } else {
      console.log('1. Deploy your backend to Railway or your preferred platform');
      console.log('2. Deploy your frontend to Vercel or your preferred platform');
      console.log(`3. Your frontend will now connect to ${toUrl}`);
    }
  }
  
  console.log('');
  console.log('💡 Available commands:');
  console.log('   node scripts/url-switcher.js local          # Switch to local development');
  console.log('   node scripts/url-switcher.js production     # Switch to production');
  console.log('   node scripts/url-switcher.js local --dry-run # Preview changes without applying');
  
} catch (error) {
  console.error('❌ Error during URL switching:', error.message);
  process.exit(1);
} 