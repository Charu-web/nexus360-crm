const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const topbarIdx = code.indexOf('Create Your Own CRM Platform');
console.log('TopBar button index in index-CMn9DqNx.js:', topbarIdx);
if (topbarIdx !== -1) {
  console.log('Snippet around TopBar button (500 chars before & after):');
  console.log(code.substring(topbarIdx - 300, topbarIdx + 500));
}
