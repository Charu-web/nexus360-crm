const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const rOIdx = code.indexOf('function rO(');
if (rOIdx !== -1) {
  const submitBtnIdx = code.indexOf('Sign In', rOIdx);
  if (submitBtnIdx !== -1) {
    console.log(code.substring(submitBtnIdx - 200, submitBtnIdx + 400));
  }
}
