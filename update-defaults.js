#!/usr/bin/env node

/**
 * Utility script to update default questions.json and milestone.json files
 * with uploaded versions from the Downloads folder
 * 
 * Usage:
 * node update-defaults.js
 * 
 * This script will:
 * 1. Look for questions.json and milestone.json in common download locations
 * 2. Copy them to src/data/ folder to replace defaults
 * 3. Create backups of original files
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const downloadsFolder = path.join(os.homedir(), 'Downloads');
const dataFolder = path.join(__dirname, 'src', 'data');

function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = filePath.replace('.json', `_backup_${timestamp}.json`);
  
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backup created: ${path.basename(backupPath)}`);
    return true;
  }
  return false;
}

function updateFile(fileName, displayName) {
  const downloadPath = path.join(downloadsFolder, fileName);
  const targetPath = path.join(dataFolder, fileName);
  
  if (fs.existsSync(downloadPath)) {
    // Create backup of original
    createBackup(targetPath);
    
    // Copy new file
    fs.copyFileSync(downloadPath, targetPath);
    console.log(`✅ ${displayName} updated successfully!`);
    
    // Remove from downloads to avoid confusion
    fs.unlinkSync(downloadPath);
    console.log(`📁 Removed ${fileName} from Downloads folder`);
    
    return true;
  } else {
    console.log(`❌ ${fileName} not found in Downloads folder`);
    return false;
  }
}

function main() {
  console.log('🚀 Updating default game files...\n');
  
  // Ensure data folder exists
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }
  
  let questionsUpdated = updateFile('questions.json', 'Questions file');
  let milestoneUpdated = updateFile('milestone.json', 'Milestone file');
  
  // Also check for sample files that might have been downloaded
  const sampleQuestionsPath = path.join(downloadsFolder, 'sample-questions.json');
  const sampleMilestonePath = path.join(downloadsFolder, 'sample-milestone.json');
  const customMilestonePath = path.join(downloadsFolder, 'custom-milestone.json');
  
  if (fs.existsSync(sampleQuestionsPath)) {
    console.log(`📋 Found sample-questions.json in Downloads`);
    console.log(`   You can rename it to questions.json and run this script again`);
  }
  
  if (fs.existsSync(sampleMilestonePath)) {
    console.log(`📋 Found sample-milestone.json in Downloads`);
    console.log(`   You can rename it to milestone.json and run this script again`);
  }
  
  if (fs.existsSync(customMilestonePath)) {
    console.log(`📋 Found custom-milestone.json in Downloads`);
    console.log(`   You can rename it to milestone.json and run this script again`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (questionsUpdated || milestoneUpdated) {
    console.log('✨ Update complete! Restart the development server to see changes.');
    console.log('💡 Tip: Your original files have been backed up with timestamps.');
  } else {
    console.log('ℹ️  No files to update. Download files from the game first.');
  }
  
  console.log('\n📖 Instructions:');
  console.log('1. Upload your files through the game interface');
  console.log('2. The files will be downloaded to your Downloads folder');
  console.log('3. Run: node update-defaults.js');
  console.log('4. Restart the development server');
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, createBackup };
