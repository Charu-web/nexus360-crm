const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== SIMULATING BROWSER MOUNT OF INDEX BUNDLE ===');

const rootDiv = {
  nodeType: 1,
  tagName: 'DIV',
  id: 'root',
  children: [],
  style: {},
  getAttribute: () => null,
  setAttribute: () => {},
  appendChild: function(child) { this.children.push(child); return child; },
  removeChild: function(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

const documentHead = {
  nodeType: 1,
  tagName: 'HEAD',
  children: [],
  appendChild: function(c) { this.children.push(c); return c; },
  querySelector: () => null,
  querySelectorAll: () => []
};

const documentBody = {
  nodeType: 1,
  tagName: 'BODY',
  children: [rootDiv],
  appendChild: function(c) { this.children.push(c); return c; },
  querySelector: () => null,
  querySelectorAll: () => []
};

const mockDocument = {
  nodeType: 9,
  documentElement: { setAttribute: () => {}, classList: { add: () => {}, remove: () => {} } },
  head: documentHead,
  body: documentBody,
  getElementById: (id) => id === 'root' ? rootDiv : null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => ({
    nodeType: 1,
    tagName: tag.toUpperCase(),
    children: [],
    style: {},
    setAttribute: () => {},
    appendChild: function(c) { this.children.push(c); return c; },
    addEventListener: () => {},
    removeEventListener: () => {},
    relList: { supports: () => false }
  }),
  createTextNode: (text) => ({ nodeType: 3, textContent: text })
};

const mockWindow = {
  location: { pathname: '/dashboard', href: 'http://localhost:3000/dashboard', search: '', hash: '' },
  localStorage: {
    getItem: (k) => k === 'accessToken' ? 'mock-valid-token' : null,
    setItem: (k, v) => {},
    removeItem: (k) => {}
  },
  document: mockDocument,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  queueMicrotask: (fn) => setTimeout(fn, 0),
  addEventListener: () => {},
  removeEventListener: () => {}
};

function MockMutationObserver() {
  this.observe = () => {};
  this.disconnect = () => {};
}

const sandbox = {
  window: mockWindow,
  document: mockDocument,
  localStorage: mockWindow.localStorage,
  MutationObserver: MockMutationObserver,
  queueMicrotask: (fn) => setTimeout(fn, 0),
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  URL: URL,
  Event: function(type) { this.type = type; },
  CustomEvent: function(type, detail) { this.type = type; this.detail = detail; }
};

sandbox.globalThis = sandbox;
sandbox.self = sandbox;

try {
  let runCode = code.replace(/export\s*\{[^}]*\};?/g, '');
  runCode = runCode.replace(/import\.meta\.url/g, '"http://localhost:3000/assets/index-CMn9DqNx.js"');

  const context = vm.createContext(sandbox);
  vm.runInContext(runCode, context);
  console.log('[MOUNT SUCCESS] Bundle code executed synchronously without throwing top-level errors!');
  console.log('Root div children count:', rootDiv.children.length);
} catch (err) {
  console.error('[SIMULATED BROWSER MOUNT CRASH]:', err.message);
  console.error('Stack:', err.stack ? err.stack.substring(0, 800) : 'No stack');
}
