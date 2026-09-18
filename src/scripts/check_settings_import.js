const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const content = fs.readFileSync(indexPath, 'utf8');

const matches = content.match(/import\("\.\/Settings-[^"]+"\)/g);
console.log('Settings imports found in index-CMn9DqNx.js:', matches);
