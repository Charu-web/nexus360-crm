$ErrorActionPreference = "Stop"
Set-Location 'c:\Users\Asus\Downloads\Empire_CRM_COMPLETE_FINAL'

$files = @(
    '.env',
    '.htaccess',
    'api.php',
    'ecosystem.config.js',
    'index.html',
    'favicon.ico',
    'logo.jpg',
    'empire-logo.jpg',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'assets',
    'dist',
    'prisma',
    'src',
    'migrations',
    'services',
    'supabase'
)

if (Test-Path 'dsacrm_production_deploy.zip') {
    Remove-Item 'dsacrm_production_deploy.zip' -Force
}

Compress-Archive -Path $files -DestinationPath 'dsacrm_production_deploy.zip' -Force
Write-Host "Created dsacrm_production_deploy.zip successfully."
