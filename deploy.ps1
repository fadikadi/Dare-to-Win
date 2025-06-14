# Build and deploy script for GitHub Pages
# This script ensures no conflicts between root index.html and docs/index.html

Write-Host "🚀 Building and deploying Millionaire game..." -ForegroundColor Green

# Step 1: Ensure we have index.html for building
if (-not (Test-Path "index.html")) {
    if (Test-Path "index-temp.html") {
        Write-Host "📄 Restoring index.html from backup..." -ForegroundColor Yellow
        Copy-Item "index-temp.html" "index.html"
    } else {
        Write-Host "❌ Error: No index.html or backup found!" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Build the project
Write-Host "🔨 Building project..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Copy dist to docs (removing old docs first)
Write-Host "📁 Updating docs folder..." -ForegroundColor Blue
Remove-Item -Path "docs" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "dist" -Destination "docs" -Recurse

# Step 4: Remove root index.html to prevent GitHub Pages conflicts
Write-Host "🧹 Removing root index.html to prevent conflicts..." -ForegroundColor Yellow
if (Test-Path "index.html") {
    Move-Item "index.html" "index-temp.html" -Force
}

# Step 5: Commit and push
Write-Host "📤 Committing and pushing to GitHub..." -ForegroundColor Blue
git add docs
git add index-temp.html
git add --intent-to-add . 2>$null
git commit -m "Updated production build - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

Write-Host "✅ Deploy complete! Your game is live at:" -ForegroundColor Green
Write-Host "🌐 https://fadikadi.github.io/Dare-to-Win/" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 Note: GitHub Pages may take 1-2 minutes to update." -ForegroundColor Yellow
