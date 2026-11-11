// The showcase kit (src/components/showcase) must stay product-agnostic so it
// can move into a shared package unchanged: only React and sibling files.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'components', 'showcase');
const allowed = (spec) => spec === 'react' || spec.startsWith('./');

let failed = false;
for (const file of fs.readdirSync(dir)) {
  if (!/\.(tsx?|css)$/.test(file)) continue;
  const source = fs.readFileSync(path.join(dir, file), 'utf8');
  const specs = [
    ...source.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g),
    ...source.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
    ...source.matchAll(/@import\s+['"]([^'"]+)['"]/g),
  ].map((m) => m[1]);
  for (const spec of specs) {
    if (!allowed(spec)) {
      console.error(`showcase boundary: ${file} imports "${spec}"`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log('showcase boundary: ok');
