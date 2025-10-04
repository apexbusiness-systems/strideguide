#!/usr/bin/env node
const fs = require("fs"), path = require("path");
const banned = [/lorem\s?ipsum/i, /asdf|qwer|zxcv/i, /bread(ing|rng)|frangol(en|e)/i, /(\b[A-Za-z]{2,}\b)\s+\1/i];
function scan(dir){ for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
  const p=path.join(dir,e.name);
  if(e.isDirectory()) scan(p);
  else if(/\.(ts|tsx|js|jsx|json|md)$/i.test(e.name)) {
    const txt=fs.readFileSync(p,"utf8");
    for (const rx of banned) if (rx.test(txt)) { console.error(`Content-lint failed in ${p} for ${rx}`); process.exitCode=1; }
  }
}}
scan(path.resolve(__dirname,"..","src")); scan(path.resolve(__dirname,".."));
