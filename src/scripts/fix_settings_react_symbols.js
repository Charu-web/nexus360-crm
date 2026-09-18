const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const file2 = path.join(__dirname, '../../assets/Settings-M1whXnWb.js');

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

function cleanupFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  reactMethods.forEach(method => {
    const regex = new RegExp(`_\\.${method}\\b`, 'g');
    const matches = [...code.matchAll(regex)];
    if (matches.length > 0) {
      code = code.replace(regex, `t.${method}`);
      count += matches.length;
    }
  });
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Cleaned up ${count} React symbol references in ${path.basename(filePath)}`);
}

cleanupFile(file1);
cleanupFile(file2);
