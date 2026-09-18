const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lines = code.split('\n');
console.log('Line 2643 length:', lines[2642].length);
console.log('Snippet of Line 2643 around character 1000:');
console.log(lines[2642].substring(0, 500));
