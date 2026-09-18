const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('Total lines:', lines.length);
if (lines.length >= 1626) {
  const line1626 = lines[1625];
  console.log('Line 1626 length:', line1626.length);
  const snippet = line1626.substring(Math.max(0, 10605 - 200), Math.min(line1626.length, 10605 + 200));
  console.log('--- SNIPPET AROUND COLUMN 10605 ---');
  console.log(snippet);
} else {
  console.log('Line 1626 does not exist. Total lines is:', lines.length);
}
