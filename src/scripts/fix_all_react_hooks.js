const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const settingsFile1 = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const settingsFile2 = path.join(__dirname, '../../assets/Settings-M1whXnWb.js');

function fixIndexFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace _.useState -> rt.useState, _.useEffect -> rt.useEffect
  code = code.replace(/_\.useState/g, 'rt.useState');
  code = code.replace(/_\.useEffect/g, 'rt.useEffect');
  code = code.replace(/_\.useMemo/g, 'rt.useMemo');
  code = code.replace(/_\.useCallback/g, 'rt.useCallback');
  code = code.replace(/_\.useRef/g, 'rt.useRef');

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Fixed React hooks in index file:', path.basename(filePath));
}

function fixSettingsFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace _.useState -> t.useState, _.useEffect -> t.useEffect
  code = code.replace(/_\.useState/g, 't.useState');
  code = code.replace(/_\.useEffect/g, 't.useEffect');
  code = code.replace(/_\.useMemo/g, 't.useMemo');
  code = code.replace(/_\.useCallback/g, 't.useCallback');
  code = code.replace(/_\.useRef/g, 't.useRef');

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Fixed React hooks in settings file:', path.basename(filePath));
}

fixIndexFile(indexFile);
fixSettingsFile(settingsFile1);
fixSettingsFile(settingsFile2);

console.log('React hooks fix script completed successfully!');
