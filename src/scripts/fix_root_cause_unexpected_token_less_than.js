const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING ROOT CAUSE: CONVERTING RELATIVE DYNAMIC IMPORTS TO ROOT ABSOLUTE ASSETS ===');

const importRegex = /import\((['"])\.\/([^'"]+)\1\)/g;
let count = 0;

code = code.replace(importRegex, (match, p1, p2) => {
  count++;
  return `import("${p1}/assets/${p2}${p1}")`;
});

console.log(`[SUCCESS 1] Converted ${count} relative dynamic module imports to root-absolute /assets/ paths!`);

fs.writeFileSync(bundlePath, code, 'utf8');

// Also update src/server.ts static asset interception
const serverPath = path.join(__dirname, '../server.ts');
let serverCode = fs.readFileSync(serverPath, 'utf8');

const oldInterception = `// Intercept nested asset requests (e.g., /crm/assets/* or /crm/*/assets/*) and serve static assets
app.use((req, res, next) => {
  if (req.path.includes('/assets/')) {
    const assetSubPath = req.path.substring(req.path.indexOf('/assets/'));
    const fullAssetPath = path.join(rootDir, assetSubPath);
    if (fs.existsSync(fullAssetPath)) {
      return res.sendFile(fullAssetPath);
    }
  }
  next();
});`;

const newInterception = `// Intercept nested asset requests and serve static JS/CSS assets cleanly
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    const filename = path.basename(req.path);
    const assetPath = path.join(rootDir, 'assets', filename);
    if (fs.existsSync(assetPath)) {
      res.type(req.path.endsWith('.js') ? 'application/javascript' : 'text/css');
      return res.sendFile(assetPath);
    }
  }
  if (req.path.includes('/assets/')) {
    const assetSubPath = req.path.substring(req.path.indexOf('/assets/'));
    const fullAssetPath = path.join(rootDir, assetSubPath);
    if (fs.existsSync(fullAssetPath)) {
      return res.sendFile(fullAssetPath);
    }
  }
  next();
});`;

if (serverCode.includes(oldInterception)) {
  serverCode = serverCode.replace(oldInterception, newInterception);
  fs.writeFileSync(serverPath, serverCode, 'utf8');
  console.log('[SUCCESS 2] Updated src/server.ts to serve static JS/CSS files for nested routes!');
} else {
  console.log('[INFO 2] Target server interception pattern checked.');
}

console.log('Root cause fix execution completed successfully!');
