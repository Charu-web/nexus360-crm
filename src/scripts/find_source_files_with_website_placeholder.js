const fs = require('fs');
const path = require('path');

function searchDir(dir, matches = []) {
  if (!fs.existsSync(dir)) return matches;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, matches);
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('https://example.com') || content.includes('Company Website') || content.includes('placeholder')) {
        matches.push({ path: fullPath, content });
      }
    }
  }
  return matches;
}

const results = searchDir(path.join(__dirname, '../..'));
console.log('Found matching source files:', results.length);
results.forEach(r => console.log('Matching file:', r.path));
