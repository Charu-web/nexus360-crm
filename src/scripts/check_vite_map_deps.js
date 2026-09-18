const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const mapIdx = code.indexOf('__vite__mapDeps');
console.log('__vite__mapDeps in index-CMn9DqNx.js:', mapIdx !== -1);
if (mapIdx !== -1) {
  console.log('Snippet around __vite__mapDeps:');
  console.log(code.substring(mapIdx - 50, mapIdx + 500));
}
