# deploy-all.ps1 - Script to build and deploy to multiple platforms
param (
    [switch]$github,
    [switch]$vercel,
    [switch]$netlify,
    [switch]$all
)

# Function to show usage instructions
function Show-Usage {
    Write-Host "Usage: .\deploy-all.ps1 [-github] [-vercel] [-netlify] [-all]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -github    Build and deploy to GitHub Pages"
    Write-Host "  -vercel    Build and prepare for Vercel deployment"
    Write-Host "  -netlify   Build and prepare for Netlify deployment"
    Write-Host "  -all       Build and deploy to all platforms"
    Write-Host ""
    Write-Host "Example: .\deploy-all.ps1 -github -vercel"
}

# If no options are provided, show usage
if (-not ($github -or $vercel -or $netlify -or $all)) {
    Show-Usage
    exit
}

# Deploy to all platforms if -all is specified
if ($all) {
    $github = $true
    $vercel = $true
    $netlify = $true
}

# Track deployment status
$deploymentStatus = @{}

# Deploy to GitHub Pages
if ($github) {
    Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Green
    
    try {
        # Build for GitHub Pages
        npm run build:github
        
        # Check if the build was successful
        if (Test-Path -Path "docs" -PathType Container) {
            # Commit and push changes to GitHub
            git add docs
            git commit -m "Update GitHub Pages deployment"
            git push origin main
            
            Write-Host "✅ Successfully deployed to GitHub Pages" -ForegroundColor Green
            $deploymentStatus["GitHub Pages"] = "✅ Success"
        } else {
            Write-Host "❌ Failed to build for GitHub Pages - docs folder not found" -ForegroundColor Red
            $deploymentStatus["GitHub Pages"] = "❌ Failed: Build error"
        }
    } catch {
        Write-Host "❌ Error deploying to GitHub Pages: $_" -ForegroundColor Red
        $deploymentStatus["GitHub Pages"] = "❌ Failed: $_"
    }
}

# Deploy to Vercel
if ($vercel) {
    Write-Host "🚀 Preparing for Vercel deployment..." -ForegroundColor Green
    
    try {
        # Prepare and build for Vercel
        npm run build:vercel
        
        # Check if the build was successful
        if (Test-Path -Path "dist" -PathType Container) {
            # Commit and push changes to GitHub
            git add vercel.json index-vercel.html
            git commit -m "Update Vercel configuration"
            git push origin main
            
            Write-Host "✅ Successfully prepared for Vercel deployment" -ForegroundColor Green
            Write-Host "   Vercel will automatically build and deploy from your GitHub repo" -ForegroundColor Cyan
            $deploymentStatus["Vercel"] = "✅ Prepared (auto-deploys from GitHub)"
        } else {
            Write-Host "❌ Failed to build for Vercel - dist folder not found" -ForegroundColor Red
            $deploymentStatus["Vercel"] = "❌ Failed: Build error"
        }
    } catch {
        Write-Host "❌ Error preparing for Vercel deployment: $_" -ForegroundColor Red
        $deploymentStatus["Vercel"] = "❌ Failed: $_"
    }
}

# Deploy to Netlify
if ($netlify) {
    Write-Host "🚀 Preparing for Netlify deployment..." -ForegroundColor Green
    
    try {
        # Prepare and build for Netlify
        npm run build:netlify
        
        # Check if the build was successful
        if (Test-Path -Path "dist" -PathType Container) {
            # Commit and push changes to GitHub
            git add netlify.toml index-netlify.html
            git commit -m "Update Netlify configuration"
            git push origin main
            
            Write-Host "✅ Successfully prepared for Netlify deployment" -ForegroundColor Green
            Write-Host "   Netlify will automatically build and deploy from your GitHub repo" -ForegroundColor Cyan
            $deploymentStatus["Netlify"] = "✅ Prepared (auto-deploys from GitHub)"
        } else {
            Write-Host "❌ Failed to build for Netlify - dist folder not found" -ForegroundColor Red
            $deploymentStatus["Netlify"] = "❌ Failed: Build error"
        }
    } catch {
        Write-Host "❌ Error preparing for Netlify deployment: $_" -ForegroundColor Red
        $deploymentStatus["Netlify"] = "❌ Failed: $_"
    }
}

# Show deployment status summary
Write-Host "`n📊 Deployment Status Summary:" -ForegroundColor Cyan
foreach ($platform in $deploymentStatus.Keys) {
    Write-Host "   $platform : $($deploymentStatus[$platform])"
}

# Run the MIME type verification if all deployments were attempted
if ($all) {
    Write-Host "`n🔍 Verifying MIME types across all deployments..." -ForegroundColor Cyan
    try {
        npm run verify:mime
    } catch {
        Write-Host "❌ Error running MIME type verification: $_" -ForegroundColor Red
    }
}

Write-Host "`n✨ Deployment process complete!" -ForegroundColor Green
