const fs = require('fs');
const path = require('path');

function searchProject(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === 'assets' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchProject(fullPath, results);
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('https://example.com') || content.includes('placeholder')) {
        results.push({ path: fullPath, content });
      }
    }
  }
  return results;
}

const matches = searchProject(path.join(__dirname, '../..'));
console.log('=== FORENSIC SEARCH RESULTS ===');
console.log('Found matching files:', matches.length);
matches.forEach(m => console.log('Matching Source File:', m.path));
