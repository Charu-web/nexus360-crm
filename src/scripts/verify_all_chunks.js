const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const assetsDir = path.join(__dirname, '../../assets');

const code = fs.readFileSync(bundlePath, 'utf8');

// Extract all import("./...") references
const matches = [...code.matchAll(/import\("\.\/([^"]+)"\)/g)];
const chunkFiles = matches.map(m => m[1]);

console.log('Total lazy-loaded chunk references found in index-CMn9DqNx.js:', chunkFiles.length);

let missingCount = 0;
chunkFiles.forEach(file => {
  const filePath = path.join(assetsDir, file);
  const exists = fs.existsSync(filePath);
  if (!exists) {
    console.error('MISSING CHUNK FILE:', file);
    missingCount++;
  }
});

if (missingCount === 0) {
  console.log('[SUCCESS] All 100% of referenced chunk files exist in assets/ directory!');
} else {
  console.error(`[ERROR] Found ${missingCount} missing chunk files!`);
}
