const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING UNESCAPED NEWLINES IN ERROR BOUNDARY STRING ===');

const badStr = 'children:errStack+"\n\nReact Component Stack:\n"+compStack';
const goodStr = 'children:errStack+"\\n\\nReact Component Stack:\\n"+compStack';

if (code.includes(badStr)) {
  code = code.replace(badStr, goodStr);
  console.log('[SUCCESS 1] Replaced literal newlines with escaped \\n\\n in ErrorBoundary string!');
} else {
  // Let's replace any unescaped string pattern
  code = code.replace(/errStack\+\"\n\nReact Component Stack:\n\"\+compStack/g, 'errStack+"\\\\n\\\\nReact Component Stack:\\\\n"+compStack');
}

fs.writeFileSync(bundlePath, code, 'utf8');

try {
  new vm.Script(code);
  console.log('====================================================');
  console.log(' [PASS] Node VM successfully compiled index-CMn9DqNx.js with 0 SYNTAX ERRORS!');
  console.log('====================================================');
} catch (err) {
  console.error('[FAIL] Syntax error still remains:', err.message);
}
