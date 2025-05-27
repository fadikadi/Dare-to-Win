# PowerShell script to update default questions.json and milestone.json files
# with uploaded versions from the Downloads folder
#
# Usage: .\update-defaults.ps1 [-Auto] [-Watch]
#
# This script will:
# 1. Look for questions.json and milestone.json in Downloads folder
# 2. Copy them to src\data\ folder to replace defaults
# 3. Create backups of original files
# 4. With -Watch flag, monitor Downloads folder for new files

param(
    [switch]$Help,
    [switch]$Auto,
    [switch]$Watch
)

if ($Help) {
    Write-Host "Update Default Files Script" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script updates your default game files with uploaded versions."
    Write-Host ""
    Write-Host "Usage: .\update-defaults.ps1 [-Auto] [-Watch]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -Auto     Automatically replace files without confirmation"
    Write-Host "  -Watch    Monitor Downloads folder for new files (runs continuously)"
    Write-Host ""
    Write-Host "The script will:"
    Write-Host "1. Look for questions.json and milestone.json in your Downloads folder"
    Write-Host "2. Create backups of your current files"
    Write-Host "3. Replace the defaults with the uploaded versions"
    Write-Host "4. Clean up the Downloads folder"
    exit
}

$downloadsFolder = "$env:USERPROFILE\Downloads"
$dataFolder = "$PSScriptRoot\src\data"

function Create-Backup {
    param([string]$FilePath)
    
    $timestamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
    $backupPath = $FilePath -replace '\.json$', "_backup_$timestamp.json"
    
    if (Test-Path $FilePath) {
        Copy-Item $FilePath $backupPath
        Write-Host "? Backup created: $(Split-Path $backupPath -Leaf)" -ForegroundColor Green
        return $true
    }
    return $false
}

function Update-File {
    param(
        [string]$FileName,
        [string]$DisplayName,
        [switch]$AutoConfirm
    )
    
    $downloadPath = Join-Path $downloadsFolder $FileName
    $targetPath = Join-Path $dataFolder $FileName
    
    if (Test-Path $downloadPath) {
        if (-not $AutoConfirm -and -not $Auto) {
            $response = Read-Host "Replace $DisplayName with the uploaded version? (y/N)"
            if ($response -notmatch '^[Yy]') {
                Write-Host "??  Skipped $DisplayName" -ForegroundColor Yellow
                return $false
            }
        }
        
        # Create backup of original
        Create-Backup $targetPath
        
        # Copy new file
        Copy-Item $downloadPath $targetPath -Force
        Write-Host "? $DisplayName updated successfully!" -ForegroundColor Green
        
        # Remove from downloads to avoid confusion
        Remove-Item $downloadPath
        Write-Host "?? Removed $FileName from Downloads folder" -ForegroundColor Yellow
        
        return $true
    } else {
        Write-Host "? $FileName not found in Downloads folder" -ForegroundColor Red
        return $false
    }
}

# Main execution
if ($Watch) {
    Write-Host "?? Watching Downloads folder for questions.json and milestone.json..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop watching" -ForegroundColor Gray
    Write-Host ""
    
    while ($true) {
        $questionsPath = Join-Path $downloadsFolder "questions.json"
        $milestonePath = Join-Path $downloadsFolder "milestone.json"
        
        if (Test-Path $questionsPath) {
            Write-Host "?? New questions.json detected!" -ForegroundColor Green
            Update-File "questions.json" "Questions file" -AutoConfirm
        }
        
        if (Test-Path $milestonePath) {
            Write-Host "?? New milestone.json detected!" -ForegroundColor Green
            Update-File "milestone.json" "Milestone file" -AutoConfirm
        }
        
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "?? Updating default game files..." -ForegroundColor Cyan
    Write-Host ""
    
    # Ensure data folder exists
    if (!(Test-Path $dataFolder)) {
        New-Item -ItemType Directory -Path $dataFolder -Force | Out-Null
    }
    
    $questionsUpdated = Update-File "questions.json" "Questions file"
    $milestoneUpdated = Update-File "milestone.json" "Milestone file"
    
    # Check for sample files
    $sampleFiles = @(
        @{name="sample-questions.json"; desc="sample questions"},
        @{name="sample-milestone.json"; desc="sample milestone"},
        @{name="custom-milestone.json"; desc="custom milestone"}
    )
    
    foreach ($file in $sampleFiles) {
        $samplePath = Join-Path $downloadsFolder $file.name
        if (Test-Path $samplePath) {
            Write-Host "?? Found $($file.name) in Downloads" -ForegroundColor Blue
            Write-Host "   You can rename it to remove 'sample-' or 'custom-' and run this script again" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor Cyan
    
    if ($questionsUpdated -or $milestoneUpdated) {
        Write-Host "? Update complete! Restart the development server to see changes." -ForegroundColor Green
        Write-Host "?? Tip: Your original files have been backed up with timestamps." -ForegroundColor Yellow
        
        if (-not $Auto) {
            $restart = Read-Host "Would you like to restart the development server now? (y/N)"
            if ($restart -match '^[Yy]') {
                Write-Host "?? Restarting development server..." -ForegroundColor Cyan
                # Kill existing npm/node processes
                Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
                Start-Sleep -Seconds 2
                # Start new dev server
                Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $PSScriptRoot
            }
        }
    } else {
        Write-Host "??  No files to update. Download files from the game first." -ForegroundColor Blue
    }
    
    Write-Host ""
    Write-Host "?? Instructions:" -ForegroundColor Cyan
    Write-Host "1. Upload your files through the game interface"
    Write-Host "2. The files will be downloaded to your Downloads folder"
    Write-Host "3. Run: .\update-defaults.ps1"
    Write-Host "4. Restart the development server"
    Write-Host ""
    Write-Host "?? Pro tip: Use .\update-defaults.ps1 -Watch to automatically detect new files" -ForegroundColor Green
    Write-Host "For help: .\update-defaults.ps1 -Help" -ForegroundColor Gray
}
