const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== ENHANCING LOGIN PAGE WITH CLEAR "CREATE YOUR CRM" BUTTON ===');

const oldLinkStr = 'children:["New on our platform?"," ",d.jsx(Os,{to:"/signup",className:"crm-create-account-link",id:"crm-create-account-link",children:"Create an account"})]';
const newLinkStr = 'children:["New to Empire CRM?"," ",d.jsx(Os,{to:"/register",className:"crm-create-account-link font-bold text-indigo-600 hover:text-indigo-500",id:"crm-create-account-link",children:"Create Your CRM →"})]';

if (code.includes(oldLinkStr)) {
  code = code.replace(oldLinkStr, newLinkStr);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Enhanced Login page with prominent "Create Your CRM →" button/link!');
} else {
  console.log('oldLinkStr not found in bundle.');
}
