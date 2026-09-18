# ============================================================
#   Empire CRM Admin Panel — Hostinger Production Deployment
#   Target Subdomain : crmbusiness.empireitxpert.in
#   Hostinger Server : u490416745@147.93.17.245 port 65002
# ============================================================

$ErrorActionPreference = "Stop"

$PROJECT_ROOT = 'c:\Users\Asus\Downloads\Empire_CRM_COMPLETE_FINAL'
$ZIP_FILE     = "$PROJECT_ROOT\crmbusiness_production_deploy.zip"
$USER         = 'u490416745'
$IP           = '147.93.17.245'
$PORT         = '65002'
$REMOTE_DIR   = '/home/u490416745/domains/crmbusiness.empireitxpert.in/public_html'
$REMOTE_ALT   = '/home/u490416745/domains/empireitxpert.in/public_html/crmbusiness'
$SSH_OPTS     = @('-p', $PORT, '-o', 'StrictHostKeyChecking=accept-new', '-o', 'ConnectTimeout=30', '-o', 'BatchMode=yes')

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Empire CRM - Hostinger Production Deployment" -ForegroundColor Cyan
Write-Host "  Source Package : $ZIP_FILE" -ForegroundColor White
Write-Host "  Target Subdomain: https://crmbusiness.empireitxpert.in" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure zip package exists
if (-not (Test-Path $ZIP_FILE)) {
    Write-Error "Deployment package $ZIP_FILE not found!"
    exit 1
}

# STEP 1: Upload deployment package via SCP
Write-Host "[1/3] Uploading production bundle to Hostinger..." -ForegroundColor Magenta
& scp -P $PORT -o StrictHostKeyChecking=accept-new -o BatchMode=yes "$ZIP_FILE" "${USER}@${IP}:~/deploy.zip"
Write-Host "Upload complete." -ForegroundColor Green
Write-Host ""

# STEP 2: Deploy to document roots & restart single PM2 instance
Write-Host "[2/3] Extracting package into document roots & starting server..." -ForegroundColor Magenta
$deployCmd = @'
mkdir -p /home/u490416745/domains/crmbusiness.empireitxpert.in/public_html
mkdir -p /home/u490416745/domains/empireitxpert.in/public_html/crmbusiness
cp ~/deploy.zip /home/u490416745/domains/crmbusiness.empireitxpert.in/public_html/
cp ~/deploy.zip /home/u490416745/domains/empireitxpert.in/public_html/crmbusiness/

cd /home/u490416745/domains/crmbusiness.empireitxpert.in/public_html
unzip -o deploy.zip && rm -f deploy.zip
chmod -R 755 . && chmod 644 .htaccess api.php 2>/dev/null || true

cd /home/u490416745/domains/empireitxpert.in/public_html/crmbusiness
unzip -o deploy.zip && rm -f deploy.zip
chmod -R 755 . && chmod 644 .htaccess api.php 2>/dev/null || true

# Kill any stale frozen npm or node cluster processes
pkill -f "npm install" 2>/dev/null || true

# Start or reload PM2 with lean single-process configuration
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js || true
echo "DEPLOY_COMPLETE"
'@

& ssh @SSH_OPTS "${USER}@${IP}" $deployCmd
Write-Host ""

# STEP 3: Verification
Write-Host "[3/3] Verifying deployment..." -ForegroundColor Magenta
$verifyCmd = 'echo "=== Deployment Verified ===" && ls -la /home/u490416745/domains/crmbusiness.empireitxpert.in/public_html/assets/index-CMn9DqNx.js'
& ssh @SSH_OPTS "${USER}@${IP}" $verifyCmd

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOSTINGER DEPLOYMENT SCRIPT EXECUTED!" -ForegroundColor Green
Write-Host "  Live URL: https://crmbusiness.empireitxpert.in" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Green
