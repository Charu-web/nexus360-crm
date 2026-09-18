const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const createRootIdx = code.indexOf('createRoot');
console.log('createRoot found in index-CMn9DqNx.js:', createRootIdx !== -1);
if (createRootIdx !== -1) {
  console.log('Code around createRoot:');
  console.log(code.substring(createRootIdx - 100, createRootIdx + 400));
}
