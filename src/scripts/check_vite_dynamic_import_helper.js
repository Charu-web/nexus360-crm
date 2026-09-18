const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const zeIdx = code.indexOf('function Ze(');
console.log('function Ze() found:', zeIdx !== -1);
if (zeIdx !== -1) {
  console.log(code.substring(zeIdx - 50, zeIdx + 800));
} else {
  const zeConst = code.indexOf('Ze=');
  console.log('Ze= found:', zeConst !== -1);
  if (zeConst !== -1) {
    console.log(code.substring(zeConst - 50, zeConst + 800));
  }
}
