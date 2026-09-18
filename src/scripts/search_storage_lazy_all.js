const fs = require('fs');
const path = require('path');

console.log('=== SEARCHING ENTIRE CODEBASE FOR storage_lazy / storageLazy ===');

function searchDir(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        count += searchDir(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html')) {
      const code = fs.readFileSync(fullPath, 'utf8');
      if (code.includes('storage_lazy') || code.includes('storageLazy')) {
        console.log(`FOUND IN FILE: ${fullPath}`);
        count++;
      }
    }
  });
  return count;
}

const rootDir = path.join(__dirname, '../..');
const matches = searchDir(rootDir);

console.log(`Search complete. Total files containing storage_lazy/storageLazy: ${matches}`);
