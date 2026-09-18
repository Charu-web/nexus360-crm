const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

const reactMethods = [
  'createContext',
  'useContext',
  'useLayoutEffect',
  'createElement',
  'Fragment',
  'Component',
  'Children',
  'isValidElement',
  'forwardRef',
  'useDebugValue',
  'useId',
  'useInsertionEffect',
  'cloneElement',
  'lazy',
  'Suspense',
  'useState',
  'useEffect',
  'useMemo',
  'useCallback',
  'useRef'
];

let totalReplacements = 0;
reactMethods.forEach(method => {
  const regex = new RegExp(`_\\.${method}\\b`, 'g');
  const matches = [...code.matchAll(regex)];
  if (matches.length > 0) {
    code = code.replace(regex, `rt.${method}`);
    totalReplacements += matches.length;
    console.log(`Replaced _.${method} -> rt.${method} (${matches.length} times)`);
  }
});

fs.writeFileSync(bundlePath, code, 'utf8');
console.log(`[SUCCESS] Completed React symbol cleanup with ${totalReplacements} replacements!`);
