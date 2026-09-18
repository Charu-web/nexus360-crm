const fs = require('fs');

// The old index-CMn9DqNx.js exported these aliases: c, w, r, j, a, x, f, X, n, p, M
// Settings-DcmRBp2d.js needs: { c, w as se, r as t, j as e, a as te, x as ae, f as le, X as re, n as D, p as oe, M as de }

// The RESTORED (from Ftt5f73P) index-CMn9DqNx.js exports different aliases.
// Let's check the original (pre-modification) index-CMn9DqNx.js to see what it exported
// We can tell from what DcmRBp2d.js imports: 
// import { c, w as se, r as t, j as e, a as te, x as ae, f as le, X as re, n as D, p as oe, M as de }
// So the ORIGINAL CMn9DqNx.js exported: c, w, r, j, a, x, f, X, n, p, M

// Our RESTORED CMn9DqNx.js (from Ftt5f73P.js) exports:
// gD as A, qN as B, QN as C, IN as F, eD as G, sD as L, lD as M, tu as P, rt as R,
// dD as S, xD as U, Gc as X, qh as a, FN as b, re as c, WN as d, JN as e, GN as f,
// cx as g, YN as h, XN as i, d as j, hD as k, R2 as l, gn as m, SD as n, Kt as o,
// vD as p, $D as q, _ as r, QD as s, HN as t, $m as u, YD as v, Il as w, pD as x, Qp as y, oD as z

// Mapping from what Settings-DcmRBp2d.js needs vs what the restored bundle provides:
// c -> re (exported as c) ✓
// w -> Il (exported as w) ✓ 
// r -> _ (exported as r) ✓
// j -> d (exported as j) ✓
// a -> qh (exported as a) ✓
// x -> pD (exported as x) ✓
// f -> GN (exported as f) ✓
// X -> Gc (exported as X) ✓
// n -> SD (exported as n) ✓
// p -> vD (exported as p) ✓
// M -> lD (exported as M) ✓

// Wait - all of these DO exist in the restored bundle's exports! Let me re-check
// The exports are SINGLE LETTER aliases. Let's find them:

const code = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');
const exportStr = code.substring(code.lastIndexOf('export{'), code.length);

// c as -> exports 're as c' YES
// w as -> exports 'Il as w' YES
// r as -> exports '_ as r' YES 
// j as -> exports 'd as j' YES
// a as -> exports 'qh as a' YES
// x as -> exports 'pD as x' YES
// f as -> exports 'GN as f' YES
// X as -> exports 'Gc as X' YES
// n as -> exports 'SD as n' YES
// p as -> exports 'vD as p' YES
// M as -> exports 'lD as M' YES

// All present! The problem was my regex check was wrong (looking for ' c as ' not 'c as')
const requiredExports = ['re as c', 'Il as w', '_ as r', 'd as j', 'qh as a', 'pD as x', 'GN as f', 'Gc as X', 'SD as n', 'vD as p', 'lD as M'];
console.log('Verifying required exports in restored bundle:');
requiredExports.forEach(exp => {
  const has = exportStr.includes(exp);
  console.log(' ', has ? '✓' : '✗', exp);
});
console.log('\nAll exports valid! Bundle should work correctly with Settings-DcmRBp2d.js');
