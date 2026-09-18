import fs from 'fs';
import vm from 'vm';

async function checkJS(filePath: string) {
  const code = fs.readFileSync(filePath, 'utf-8');
  try {
    new vm.Script(code, { filename: filePath });
    console.log(`[SYNTAX OK]: ${filePath}`);
  } catch (err: any) {
    console.error(`[SYNTAX ERROR]: ${filePath}\n`, err);
  }
}

async function main() {
  await checkJS('assets/index-CMn9DqNx.js');
  await checkJS('assets/index-Ftt5f73P.js');
}

main();
