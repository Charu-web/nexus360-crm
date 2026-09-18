const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const mapIdx = code.indexOf('m.f=[');
console.log('m.f=[ at index:', mapIdx);

const endIdx = code.indexOf(']))', mapIdx);
const arrStr = code.substring(mapIdx + 4, endIdx + 1);

console.log('Snippet of m.f array:');
console.log(arrStr.substring(0, 500));

try {
  const arr = JSON.parse(arrStr);
  console.log('Total files in __vite__mapDeps:', arr.length);
  console.log('Index 24:', arr[24]);
  console.log('Index 19:', arr[19]);
  console.log('Index 1:', arr[1]);
  console.log('Index 10:', arr[10]);
} catch (e) {
  console.error('JSON parse error for arrStr:', e.message);
}
