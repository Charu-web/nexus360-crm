const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lines = code.split('\n');
console.log('Total lines in index-CMn9DqNx.js:', lines.length);

if (lines.length >= 1882) {
  console.log('Lines 1875 to 1890:');
  for (let i = 1874; i < Math.min(lines.length, 1890); i++) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
} else {
  console.log('Fewer than 1882 lines. Code is minified on fewer lines.');
  // Let's find syntax error using Function constructor or Esprima / Acorn / Node VM
}
