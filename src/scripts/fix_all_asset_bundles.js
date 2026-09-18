const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../../assets');
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

const reactMethods = [
  'createContext', 'useContext', 'useLayoutEffect', 'createElement',
  'Fragment', 'Component', 'Children', 'isValidElement', 'forwardRef',
  'useDebugValue', 'useId', 'useInsertionEffect', 'cloneElement',
  'lazy', 'Suspense', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef'
];

console.log('Auditing and fixing all JS files in assets directory...');

let totalFixes = 0;
files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  let fileFixes = 0;

  // Determine React object variable in file: index-CMn9DqNx.js uses 'rt', Settings uses 't', others use 't' or 'React'
  let reactVar = 't';
  if (file.startsWith('index-')) reactVar = 'rt';

  reactMethods.forEach(method => {
    const regex = new RegExp(`_\\.${method}\\b`, 'g');
    const matches = [...code.matchAll(regex)];
    if (matches.length > 0) {
      code = code.replace(regex, `${reactVar}.${method}`);
      fileFixes += matches.length;
    }
  });

  if (fileFixes > 0) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`  - Fixed ${fileFixes} references in ${file}`);
    totalFixes += fileFixes;
  }
});

console.log(`Assets audit complete. Total fixes across all chunks: ${totalFixes}`);
