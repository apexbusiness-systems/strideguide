// @stride/content-lint v1 — forbid placeholder gibberish
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const forbid = ['breading', 'frangolen', 'aslibation', 'esalding', 'achooar', 'corats', 'elrscic'];
const textExts = ['.md', '.html', '.tsx', '.ts', '.jsx', '.js', '.json', '.txt', '.svg'];
const binExts = ['.png', '.jpg', '.jpeg', '.webp'];
let bad = [];

function checkText(p) {
  const s = fs.readFileSync(p, 'utf8').toLowerCase();
  for (const w of forbid) {
    if (s.includes(w)) bad.push(p + ' :: ' + w);
  }
}

function checkBin(p) {
  // Basic OCR-bypass: filename heuristic + sidecar ban
  const base = path.basename(p).toLowerCase();
  for (const w of forbid) {
    if (base.includes(w)) bad.push(p + ' :: ' + w);
  }
}

function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else {
      const ext = path.extname(p).toLowerCase();
      if (textExts.includes(ext)) checkText(p);
      else if (binExts.includes(ext)) checkBin(p);
    }
  }
}

walk(path.join(ROOT, 'public'));
walk(path.join(ROOT, 'src'));

if (bad.length) {
  console.error('❌ Forbidden placeholder content detected:\n' + bad.join('\n'));
  process.exit(1);
} else {
  console.log('✅ Content lint passed — no placeholder gibberish found.');
}
