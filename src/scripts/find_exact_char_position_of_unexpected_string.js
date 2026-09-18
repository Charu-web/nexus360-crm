const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FINDING EXACT CHARACTER POSITION OF UNEXPECTED STRING ===');

let low = 0;
let high = code.length;
let lastFail = -1;

while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  const snippet = code.substring(0, mid);
  try {
    new vm.Script(snippet);
    low = mid + 1;
  } catch (e) {
    if (e.message.includes('Unexpected string')) {
      lastFail = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
}

console.log('Earliest position triggering "Unexpected string":', lastFail);
if (lastFail !== -1) {
  console.log('Snippet around failure:');
  console.log(code.substring(Math.max(0, lastFail - 150), Math.min(code.length, lastFail + 150)));
}
