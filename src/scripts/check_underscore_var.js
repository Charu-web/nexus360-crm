const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const regex = /(?:var|let|const|,)\s*_\s*=\s*/g;
let match;
while ((match = regex.exec(code)) !== null) {
  console.log('Match for _ = at index:', match.index);
  console.log(code.substring(match.index, match.index + 200));
}
