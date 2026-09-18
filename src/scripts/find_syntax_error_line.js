const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lines = code.split('\n');

try {
  lines.forEach((line, idx) => {
    try {
      new Function(line);
    } catch (e) {
      if (e.message.includes('Unexpected token') || e.message.includes('SyntaxError')) {
        console.log(`Line ${idx + 1} Error:`, e.message);
        console.log(line.substring(0, 200));
      }
    }
  });
} catch (err) {}
