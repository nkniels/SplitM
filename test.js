const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const document = { 
  addEventListener: () => {}, 
  getElementById: (id) => ({ 
    style: {}, 
    addEventListener: () => {}, 
    value: 'mock', 
    textContent: '' 
  }), 
  querySelector: () => ({ style: {}, addEventListener: () => {} }), 
  createElement: () => ({ classList: { add: ()=>{}, remove: ()=>{} }, appendChild: () => {}, remove: () => {}, setAttribute: ()=>{}, textContent: '' }) 
};
const window = { 
  addEventListener: () => {}, 
  location: { origin: 'mock', pathname: 'mock', search: '' }, 
  Telegram: {} 
};
const localStorage = { getItem: () => null, setItem: () => {} };
const navigator = { onLine: true };
const Intl = { NumberFormat: class { format() { return ''; } } };
const setTimeout = (fn) => {
  console.log('setTimeout triggered');
  try { fn(); } catch(e) { console.error('timeout crash', e); }
};
const clearTimeout = () => {};
const firebase = { initializeApp: () => {}, firestore: () => {}, auth: () => {} };

global.document = document;
global.window = window;
global.localStorage = localStorage;
global.navigator = navigator;
global.Intl = Intl;
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;
global.firebase = firebase;

try {
  eval(code);
  console.log('File evaluated successfully!');
  app.init();
  console.log('Init success!');
  app.addMember();
  console.log('addMember success!');
} catch (e) {
  console.error('CRASH:', e);
}
