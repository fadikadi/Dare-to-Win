// build-for-platform.mjs - Script to handle platform-specific builds
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get platform from command arguments
const platform = process.argv[2] || 'default';

console.log(`🏗️ Building for platform: ${platform}`);

// Set correct index.html template based on platform
let indexTemplate = 'index.html';
let buildMode = platform;

switch (platform) {
  case 'github':
    indexTemplate = 'index-github.html';
    break;
  case 'vercel':
    indexTemplate = 'index-vercel.html';
    break;
  case 'netlify':
    indexTemplate = 'index-netlify.html';
    break;
  default:
    console.log('⚠️ Using default index.html');
    buildMode = '';
    break;
}

// Copy the correct template to index.html
if (indexTemplate !== 'index.html') {
  console.log(`📝 Copying ${indexTemplate} to index.html`);
  fs.copyFileSync(indexTemplate, 'index.html');
}

// Run the build command
console.log(`🚀 Running build with mode: ${buildMode || 'default'}`);
try {
  const buildCommand = buildMode ? `vite build --mode ${buildMode}` : 'vite build';
  execSync(buildCommand, { stdio: 'inherit' });
  console.log('✅ Build completed successfully');

  // Special handling for GitHub Pages
  if (platform === 'github') {
    console.log('📦 Copying build to docs folder for GitHub Pages');
    
    // Remove existing docs folder
    if (fs.existsSync('docs')) {
      fs.rmSync('docs', { recursive: true, force: true });
    }
    
    // Create docs directory
    fs.mkdirSync('docs', { recursive: true });
    
    // Copy dist contents to docs
    const copyRecursive = (src, dest) => {
      const exists = fs.existsSync(src);
      if (exists) {
        const stats = fs.statSync(src);
        if (stats.isDirectory()) {
          fs.mkdirSync(dest, { recursive: true });
          fs.readdirSync(src).forEach(childItemName => {
            copyRecursive(
              path.join(src, childItemName),
              path.join(dest, childItemName)
            );
          });
        } else {
          fs.copyFileSync(src, dest);
        }
      }
    };
    
    copyRecursive('dist', 'docs');
    console.log('✅ Copied build to docs folder');
  }

} catch (error) {
  console.error(`❌ Build failed: ${error.message}`);
  process.exit(1);
}
