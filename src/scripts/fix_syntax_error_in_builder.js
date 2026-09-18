const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('Fixing syntax error in CRMBuilderComponent inside index-CMn9DqNx.js...');

const badSnippet = `                  children: "Launch CRM Workspace →"
                })
              }
            }))`;

const goodSnippet = `                  children: "Launch CRM Workspace →"
                })
              ]
            }))`;

if (code.includes(badSnippet)) {
  code = code.replace(badSnippet, goodSnippet);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced bad snippet with good snippet in index-CMn9DqNx.js!');
} else {
  console.log('Bad snippet not found. Searching for similar pattern...');
  const idx = code.indexOf('Launch CRM Workspace');
  if (idx !== -1) {
    console.log(code.substring(idx - 100, idx + 300));
  }
}
