// This script prepares the package.json for Vercel deployment
// It's used when you want to manually build and deploy to Vercel

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Backup original package.json to restore later
const backupPath = path.join(__dirname, 'package.json.backup');
fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Backed up original package.json to package.json.backup');

// Modify the build script to use proper base path for Vercel
packageJson.scripts.build = 'vite build';

// Write the modified package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json for Vercel deployment');

console.log('To deploy to Vercel:');
console.log('1. Commit these changes to Git');
console.log('2. Push to your GitHub repository');
console.log('3. Visit your Vercel dashboard and import the project');
console.log('   - Vercel will use the configuration from vercel.json');
console.log('');
console.log('To restore the original package.json:');
console.log('npm run restore:config');

// Add a restore script to package.json to restore the original config
packageJson.scripts['restore:config'] = 'node -e "require(\'fs\').copyFileSync(\'package.json.backup\', \'package.json\'); console.log(\'✅ Restored original package.json\')"';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
