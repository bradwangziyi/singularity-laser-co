# 1_git_push.ps1 - commit and push all local changes to GitHub
Set-Location $PSScriptRoot

# Make sure this folder is a git repo
if (-not (Test-Path ".git")) {
    Write-Host "This folder is not a git repo yet. Do the one-time setup first (git init, remote add, first push)." -ForegroundColor Red
    exit 1
}

# Stop if there's nothing to commit
if (-not (git status --porcelain)) {
    Write-Host "Nothing to commit. Everything is up to date." -ForegroundColor Yellow
    exit
}

# Show what's about to be committed
git status --short

# Ask for a commit message (Enter = timestamped default)
$msg = Read-Host "Commit message (press Enter for default)"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "Update site " + (Get-Date -Format "yyyy-MM-dd HH:mm")
}

git add .
git commit -m $msg
if ($LASTEXITCODE -ne 0) { Write-Host "Commit failed." -ForegroundColor Red; exit 1 }

# Pick up anything on GitHub you don't have yet, then push (never forces)
git pull --rebase origin main
if ($LASTEXITCODE -ne 0) { Write-Host "Pull had a problem. Fix it before pushing." -ForegroundColor Red; exit 1 }

git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Pushed to GitHub." -ForegroundColor Green
} else {
    Write-Host "Push failed." -ForegroundColor Red
}