const fs = require('fs');
const curr = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// The login component rO looks fine. Let's check if there's an issue with:
// 1. The 'li' function (useNavigate)
// 2. Check what 'ip' is (useForm)  
// 3. Check what 'sp' is (zodResolver)
// 4. Check aO (loginSchema)

// Actually, let me approach this differently.
// The user says the entire page is blank - including the login page!
// If the spinner shows but then becomes blank, that's one thing
// But if it's immediately blank on ANY route including /login, 
// then the problem is either:
// 1. The bundle fails to execute at all (parse/syntax error in the browser)
// 2. createRoot fails
// 3. The ErrorBoundary itself crashes

// Let me check: is the CSS file still valid?
const cssExists = fs.existsSync('assets/index-Bq8bJDgt.css');
console.log('CSS file exists:', cssExists);
if (cssExists) {
  const css = fs.readFileSync('assets/index-Bq8bJDgt.css', 'utf8');
  console.log('CSS file size:', css.length);
  // Check if there's anything that hides #root
  const rootHideIdx = css.indexOf('#root');
  if (rootHideIdx !== -1) {
    console.log('#root in CSS:', css.substring(rootHideIdx, rootHideIdx + 200));
  }
}

// Check the StoragePage-A.js which is referenced
const storageExists = fs.existsSync('assets/StoragePage-A.js');
console.log('StoragePage-A.js exists:', storageExists);

// Check if StoragePage references from index are correct
// storage_lazy=rt.lazy(()=>import("./StoragePage-A.js"))
const storageRef = curr.indexOf('StoragePage-A.js');
console.log('StoragePage-A.js reference in bundle:', storageRef !== -1);
