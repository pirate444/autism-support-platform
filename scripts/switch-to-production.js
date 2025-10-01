const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_URL = 'http://localhost:5000';
const PRODUCTION_URL = 'http://localhost:5000';

// Directories to search
const FRONTEND_DIR = path.join(__dirname, '../frontend/src');
const SCRIPTS_DIR = path.join(__dirname, '.');

console.log('🔄 Switching to production URLs...');
console.log(`📝 Replacing: ${LOCAL_URL}`);
console.log(`📝 With: ${PRODUCTION_URL}`);
console.log('');

let totalFiles = 0;
let totalReplacements = 0;

// Function to recursively find all files
function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  let files = [];
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
    
    // Replace the local URL with production URL
    content = content.replace(new RegExp(LOCAL_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), PRODUCTION_URL);
    
    // If content changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      
      // Count replacements
      const matches = originalContent.match(new RegExp(LOCAL_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
      const replacementCount = matches ? matches.length : 0;
      
      console.log(`✅ ${path.relative(process.cwd(), filePath)} (${replacementCount} replacements)`);
      totalReplacements += replacementCount;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to update environment variables
function updateEnvironmentFiles() {
  const envFiles = [
    path.join(__dirname, '../frontend/.env.local'),
    path.join(__dirname, '../frontend/.env.development'),
    path.join(__dirname, '../frontend/.env')
  ];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      let content = fs.readFileSync(envFile, 'utf8');
      const originalContent = content;
      
      // Update or add NEXT_PUBLIC_API_URL
      if (content.includes('NEXT_PUBLIC_API_URL=')) {
        content = content.replace(
          /NEXT_PUBLIC_API_URL=.*/g,
          `NEXT_PUBLIC_API_URL=${PRODUCTION_URL}`
        );
      } else {
        content += `\nNEXT_PUBLIC_API_URL=${PRODUCTION_URL}\n`;
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(envFile, content, 'utf8');
        console.log(`✅ Updated environment file: ${path.relative(process.cwd(), envFile)}`);
      }
    }
  });
}

// Main execution
try {
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
  console.log('🎉 Switching to production URLs completed!');
  console.log(`📊 Files modified: ${totalFiles}`);
  console.log(`📊 Total replacements: ${totalReplacements}`);
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Deploy your backend to Railway or your preferred platform');
  console.log('2. Deploy your frontend to Vercel or your preferred platform');
  console.log('3. Your frontend will now connect to the production backend');
  console.log('');
  console.log('💡 To switch back to local development, run: node scripts/switch-to-local.js');
  
} catch (error) {
  console.error('❌ Error during URL switching:', error.message);
  process.exit(1);
} 