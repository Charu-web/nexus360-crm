const fs = require('fs');
const path = require('path');

const patchPath = path.join(__dirname, 'patch_frontend_bundle.js');
const code = fs.readFileSync(patchPath, 'utf8');

const matches = code.match(/_\.(useState|useEffect|useMemo|useCallback)/g);
console.log('Matches for _.(useState|useEffect...) in patch_frontend_bundle.js:', matches ? matches.length : 0);
