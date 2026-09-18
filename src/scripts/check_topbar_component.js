const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const edIdx = code.indexOf('function ED(');
console.log('function ED() found at:', edIdx);
if (edIdx !== -1) {
  console.log(code.substring(edIdx, edIdx + 2000));
}
