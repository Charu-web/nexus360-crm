const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== PINPOINTING UNEXPECTED STRING SYNTAX ERROR ===');

// Binary search or chunk search to locate exact character position of syntax error
let min = 0;
let max = code.length;

function checkSyntax(snippet) {
  try {
    // Append dummy closing braces/statements if needed or wrap in function
    new vm.Script(`function dummyWrapper(){ ${snippet} }`);
    return true;
  } catch (e) {
    if (e.message.includes('Unexpected string')) {
      return 'UNEXPECTED_STRING';
    }
    return 'OTHER_SYNTAX';
  }
}

// Let's test lines/chunks
const parts = code.split('\n');
console.log('Total line parts:', parts.length);

for (let i = 0; i < parts.length; i++) {
  try {
    new vm.Script(parts[i]);
  } catch (err) {
    if (err.message.includes('Unexpected string')) {
      console.log(`[FOUND ON LINE ${i + 1}]:`, err.message);
      console.log(parts[i].substring(0, 300));
    }
  }
}
