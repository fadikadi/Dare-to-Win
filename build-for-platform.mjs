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
      // Fix asset paths in index.html for GitHub Pages
    console.log('🔧 Fixing asset paths in index.html for GitHub Pages');
    const indexPath = path.join('docs', 'index.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Replace incorrect asset paths - ensure they have the base path
      indexContent = indexContent.replace(/src="\/assets\//g, 'src="/Dare-to-Win/assets/');
      indexContent = indexContent.replace(/href="\/assets\//g, 'href="/Dare-to-Win/assets/');
      
      // Save the fixed index.html
      fs.writeFileSync(indexPath, indexContent);
      console.log('✅ Fixed asset paths in index.html');
    } else {
      console.log('⚠️ index.html not found in docs folder');
    }
    
    // Ensure icons directory exists and favicon is copied
    console.log('🔧 Copying favicon and other custom assets');
    const docsIconsDir = path.join('docs', 'icons');
    if (!fs.existsSync(docsIconsDir)) {
      fs.mkdirSync(docsIconsDir, { recursive: true });
    }
    
    // Copy favicon if it exists
    const faviconSrc = path.join('public', 'icons', 'favicon.svg');
    const faviconDest = path.join('docs', 'icons', 'favicon.svg');
    if (fs.existsSync(faviconSrc)) {
      fs.copyFileSync(faviconSrc, faviconDest);
      console.log('✅ Copied favicon to docs/icons');
    } else {
      console.log('⚠️ favicon.svg not found in public/icons');
    }
    
    console.log('✅ Copied build to docs folder');
  }

} catch (error) {
  console.error(`❌ Build failed: ${error.message}`);
  process.exit(1);
}
