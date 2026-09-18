# ============================================================
#   Empire CRM - Universal Deployment Script for Hostinger
# ============================================================

$ErrorActionPreference = "Stop"

$PROJECT_ROOT = 'c:\Users\Asus\Downloads\Empire_CRM_COMPLETE_FINAL'
$ZIP_FILE     = "$PROJECT_ROOT\businesscrm_production_deploy.zip"
$USER         = 'u490416745'
$IP           = '147.93.17.245'
$PORT         = '65002'
$SSH_OPTS     = @('-p', $PORT, '-o', 'StrictHostKeyChecking=accept-new', '-o', 'ConnectTimeout=30', '-o', 'BatchMode=yes')

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Empire CRM - Deploying Latest Version to Hostinger" -ForegroundColor Cyan
Write-Host "  Source Package : $ZIP_FILE" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $ZIP_FILE)) {
    Write-Error "Deployment package $ZIP_FILE not found!"
    exit 1
}

# STEP 1: Upload latest deployment package via SCP
Write-Host "[1/3] Uploading latest production package to Hostinger..." -ForegroundColor Magenta
& scp -P $PORT -o StrictHostKeyChecking=accept-new -o BatchMode=yes "$ZIP_FILE" "${USER}@${IP}:~/deploy_businesscrm.zip"
Write-Host "Upload complete." -ForegroundColor Green
Write-Host ""

# STEP 2: Extract into ALL potential domain roots & main domain root to eliminate old cached versions
Write-Host "[2/3] Extracting package into all server domain roots..." -ForegroundColor Magenta
$deployCmd = @'
export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin

TARGETS=(
  "/home/u490416745/domains/bussniescrm.empireitxpert.in/public_html"
  "/home/u490416745/domains/businesscrm.empireitxpert.in/public_html"
  "/home/u490416745/domains/empireitxpert.in/public_html/businesscrm"
  "/home/u490416745/domains/empireitxpert.in/public_html/busniesscrm"
  "/home/u490416745/domains/empireitxpert.in/public_html/bussniescrm"
  "/home/u490416745/domains/empireitxpert.in/public_html/crmbusiness"
)

for target in "${TARGETS[@]}"; do
  mkdir -p "$target"
  cp ~/deploy_businesscrm.zip "$target/"
  cd "$target"
  rm -rf assets dist index.html favicon.ico logo.jpg empire-logo.jpg api.php .htaccess 2>/dev/null || true
  unzip -o deploy_businesscrm.zip >/dev/null 2>&1
  rm -f deploy_businesscrm.zip
  chmod -R 755 . 2>/dev/null || true
  chmod 644 .htaccess api.php index.html 2>/dev/null || true
done

# Also update assets & index.html in main domain root to prevent old bundle serving
MAIN_ROOT="/home/u490416745/domains/empireitxpert.in/public_html"
cp ~/deploy_businesscrm.zip "$MAIN_ROOT/"
cd "$MAIN_ROOT"
unzip -o deploy_businesscrm.zip assets/* index.html favicon.ico logo.jpg empire-logo.jpg >/dev/null 2>&1
rm -f deploy_businesscrm.zip

# Restart PM2 backend process cleanly
cd /home/u490416745/domains/businesscrm.empireitxpert.in/public_html
npx pm2 delete empire-crm-backend 2>/dev/null || true
npx pm2 start ecosystem.config.js
npx pm2 save

echo "DEPLOYS_UNIFIED_AND_UPDATED"
'@

& ssh @SSH_OPTS "${USER}@${IP}" $deployCmd
Write-Host ""

# STEP 3: Verification
Write-Host "[3/3] Verifying deployment & PM2 process..." -ForegroundColor Magenta
$verifyCmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin; echo "=== Active Processes ===" && npx pm2 list'
& ssh @SSH_OPTS "${USER}@${IP}" $verifyCmd

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ALL SERVER DOMAIN ROOTS UPDATED TO LATEST 1:1 BUILD!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
