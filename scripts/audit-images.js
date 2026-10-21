const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.next' || f === '.git') continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) search(full);
    else if (/\.(tsx|ts|jsx|js|css|json)$/.test(f)) {
      const c = fs.readFileSync(full, 'utf8');
      const matches = c.match(/['"]\/(images|assets|mockups|photos)[^'"]*['"]/g);
      if (matches) {
        for (const m of matches) {
          const clean = m.replace(/['"]/g, '');
          const exists = fs.existsSync(path.join('public', clean.replace(/^\//, '')));
          if (!exists) {
            console.log('MISSING reference in ' + full + ' : ' + clean);
          }
        }
      }
    }
  }
}

search('src');
console.log('Static image search complete.');
