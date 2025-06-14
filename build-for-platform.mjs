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
      // Ensure icons directory exists and favicons are copied
    console.log('🔧 Copying favicons and other custom assets');
    const docsIconsDir = path.join('docs', 'icons');
    if (!fs.existsSync(docsIconsDir)) {
      fs.mkdirSync(docsIconsDir, { recursive: true });
    }
    
    // List of favicon files to copy
    const faviconFiles = [
      'favicon.svg',
      'favicon.ico',
      'favicon-16x16.png',
      'favicon-32x32.png',
      'apple-touch-icon.png'
    ];
    
    // Copy all favicon files
    let faviconsFound = 0;
    for (const file of faviconFiles) {
      const srcPath = path.join('public', 'icons', file);
      const destPath = path.join('docs', 'icons', file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        faviconsFound++;
      } else {
        console.log(`⚠️ ${file} not found in public/icons`);
      }
    }
    
    console.log(`✅ Copied ${faviconsFound} favicon files to docs/icons`);
      // Also copy sounds and other assets from public if they exist
    const publicAssetsDir = path.join('public', 'assets');
    if (fs.existsSync(publicAssetsDir)) {
      const docsAssetsDir = path.join('docs', 'assets');
      copyRecursive(publicAssetsDir, docsAssetsDir);
      console.log('✅ Copied additional assets from public/assets');
    }
    
    // Copy manifest file with GitHub Pages specific paths
    console.log('🔧 Creating GitHub Pages specific manifest.json');
    const manifestData = {
      name: "Dare to Win - Millionaire Game",
      short_name: "Dare to Win",
      description: "A bilingual (English/Arabic) Who Wants to Be a Millionaire? game with Islamic knowledge questions.",
      start_url: "/Dare-to-Win/",
      display: "standalone",
      background_color: "#1a1aff",
      theme_color: "#1a1aff",
      icons: [
        {
          src: "/Dare-to-Win/icons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png"
        },
        {
          src: "/Dare-to-Win/icons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png"
        },
        {
          src: "/Dare-to-Win/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png"
        }
      ]
    };
    
    fs.writeFileSync(
      path.join('docs', 'manifest.json'), 
      JSON.stringify(manifestData, null, 2)
    );
    console.log('✅ Created GitHub Pages specific manifest.json');
    
    console.log('✅ Copied build to docs folder');
  }

} catch (error) {
  console.error(`❌ Build failed: ${error.message}`);
  process.exit(1);
}
