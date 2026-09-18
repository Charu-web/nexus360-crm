const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lines = code.split('\n');
console.log('Total lines:', lines.length);

for (let i = 0; i < lines.length; i += 50) {
  const chunk = lines.slice(0, i + 50).join('\n');
  try {
    new vm.Script(chunk);
  } catch (e) {
    if (e.message.includes('Unexpected string')) {
      console.log(`Syntax Error 'Unexpected string' appeared when adding lines ${i + 1} to ${i + 50}`);
      console.log('Error message:', e.message);
      break;
    }
  }
}
