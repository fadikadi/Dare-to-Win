param (
    [string]$target = "github"
)

Write-Host "Building for target: $target"

switch ($target) {
    "github" {
        # Build for GitHub Pages
        Write-Host "Building for GitHub Pages..."
        npm run build -- --mode github
        
        # GitHub Pages requires the output to be in /docs
        Write-Host "Copying to docs folder..."
        Remove-Item -Path docs -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -Path dist/* -Destination docs -Recurse -Force
    }
    "vercel" {
        # Vercel builds will be handled by Vercel's platform
        Write-Host "For Vercel deployment, just push your changes to GitHub."
        Write-Host "Vercel will build automatically using your vercel.json configuration."
    }
    "netlify" {
        # Netlify builds will be handled by Netlify's platform
        Write-Host "For Netlify deployment, just push your changes to GitHub."
        Write-Host "Netlify will build automatically using your netlify.toml configuration."
    }
    default {
        Write-Host "Unknown target: $target"
        Write-Host "Valid targets are: github, vercel, netlify"
    }
}