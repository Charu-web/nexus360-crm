# ============================================================
#   Empire CRM Admin Panel — Hostinger Production Deployment
#   Target Subdomain : dsacrm.empireitxpert.in
#   Hostinger Server : u490416745@147.93.17.245 port 65002
# ============================================================

$ErrorActionPreference = "Stop"

$PROJECT_ROOT = 'c:\Users\Asus\Downloads\Empire_CRM_COMPLETE_FINAL'
$ZIP_FILE     = "$PROJECT_ROOT\dsacrm_production_deploy.zip"
$USER         = 'u490416745'
$IP           = '147.93.17.245'
$PORT         = '65002'
$SSH_OPTS     = @('-p', $PORT, '-o', 'StrictHostKeyChecking=accept-new', '-o', 'ConnectTimeout=30', '-o', 'BatchMode=yes')

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Empire CRM - Deploying to dsacrm.empireitxpert.in" -ForegroundColor Cyan
Write-Host "  Source Package : $ZIP_FILE" -ForegroundColor White
Write-Host "  Target Subdomain: https://dsacrm.empireitxpert.in" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure zip package exists
if (-not (Test-Path $ZIP_FILE)) {
    Write-Error "Deployment package $ZIP_FILE not found!"
    exit 1
}

# STEP 1: Upload deployment package via SCP
Write-Host "[1/3] Uploading production bundle to Hostinger..." -ForegroundColor Magenta
& scp -P $PORT -o StrictHostKeyChecking=accept-new -o BatchMode=yes "$ZIP_FILE" "${USER}@${IP}:~/deploy_dsacrm.zip"
Write-Host "Upload complete." -ForegroundColor Green
Write-Host ""

# STEP 2: Extract and setup remote target directories
Write-Host "[2/3] Extracting package into document roots & starting server..." -ForegroundColor Magenta
$deployCmd = @'
export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin

mkdir -p /home/u490416745/domains/dsacrm.empireitxpert.in/public_html
mkdir -p /home/u490416745/domains/empireitxpert.in/public_html/dsacrm

cp ~/deploy_dsacrm.zip /home/u490416745/domains/dsacrm.empireitxpert.in/public_html/
cp ~/deploy_dsacrm.zip /home/u490416745/domains/empireitxpert.in/public_html/dsacrm/

cd /home/u490416745/domains/dsacrm.empireitxpert.in/public_html
unzip -o deploy_dsacrm.zip && rm -f deploy_dsacrm.zip
if [ ! -d node_modules ]; then
  cp -r /home/u490416745/domains/bussniescrm.empireitxpert.in/public_html/node_modules . 2>/dev/null || npm install --production
fi
chmod -R 755 . && chmod 644 .htaccess api.php 2>/dev/null || true

cd /home/u490416745/domains/empireitxpert.in/public_html/dsacrm
unzip -o deploy_dsacrm.zip && rm -f deploy_dsacrm.zip
if [ ! -d node_modules ]; then
  cp -r /home/u490416745/domains/bussniescrm.empireitxpert.in/public_html/node_modules . 2>/dev/null || true
fi
chmod -R 755 . && chmod 644 .htaccess api.php 2>/dev/null || true

# Start or reload PM2 process from dsacrm public_html
cd /home/u490416745/domains/dsacrm.empireitxpert.in/public_html
npx pm2 delete empire-crm-backend 2>/dev/null || true
npx pm2 start ecosystem.config.js
npx pm2 save

echo "DEPLOY_COMPLETE"
'@

& ssh @SSH_OPTS "${USER}@${IP}" $deployCmd
Write-Host ""

# STEP 3: Verification
Write-Host "[3/3] Verifying deployment..." -ForegroundColor Magenta
$verifyCmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin; echo "=== Deployment Verified ===" && ls -la /home/u490416745/domains/dsacrm.empireitxpert.in/public_html/assets && npx pm2 list'
& ssh @SSH_OPTS "${USER}@${IP}" $verifyCmd

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOSTINGER DEPLOYMENT EXECUTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  Live URL: https://dsacrm.empireitxpert.in" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Green
