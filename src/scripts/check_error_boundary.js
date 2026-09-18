const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const ebIndex = code.indexOf('ErrorBoundary');
console.log('ErrorBoundary in index-CMn9DqNx.js:', ebIndex !== -1);
if (ebIndex !== -1) {
  console.log(code.substring(ebIndex - 50, ebIndex + 400));
}
