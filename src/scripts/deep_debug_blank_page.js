const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== PHASE 2: DEEP DEBUGGING BUNDLE EXECUTION ===');

// Setup a mock browser window environment
const listeners = {};
const mockWindow = {
  location: { pathname: '/', href: 'http://localhost:5000/', search: '', hash: '' },
  localStorage: {
    getItem: (k) => null,
    setItem: (k, v) => {},
    removeItem: (k) => {}
  },
  document: {
    getElementById: (id) => ({ addEventListener: () => {}, appendChild: () => {} }),
    querySelector: () => null,
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} }
  },
  addEventListener: (event, fn) => { listeners[event] = fn; },
  removeEventListener: () => {},
  dispatchEvent: (evt) => {},
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

const sandbox = {
  window: mockWindow,
  document: mockWindow.document,
  localStorage: mockWindow.localStorage,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Event: function(type) { this.type = type; },
  CustomEvent: function(type, detail) { this.type = type; this.detail = detail; }
};

sandbox.globalThis = sandbox;
sandbox.self = sandbox;

try {
  const context = vm.createContext(sandbox);
  // Execute the bundle code in the simulated browser environment
  vm.runInContext(code, context);
  console.log('[PHASE 2 RESULT] Bundle script executed without throwing synchronous top-level errors!');
} catch (err) {
  console.error('[FIRST FATAL ERROR FOUND]:', err.message);
  console.error('Stack:', err.stack ? err.stack.substring(0, 500) : 'No stack');
}
