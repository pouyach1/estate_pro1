/**
 * Fail fast with an actionable message when server/node_modules is missing.
 * Does not load dotenv/express — only verifies they can be resolved.
 */
const path = require('path');
const fs = require('fs');

const required = ['dotenv', 'express', 'mongoose', 'cors', 'jsonwebtoken', 'bcryptjs', 'multer'];
const serverRoot = __dirname;
const missing = [];

for (const name of required) {
  try {
    require.resolve(name, { paths: [serverRoot] });
  } catch {
    missing.push(name);
  }
}

const distIndex = path.join(serverRoot, '..', 'dist', 'index.html');
const distMissing = !fs.existsSync(distIndex);

if (missing.length || distMissing) {
  console.error('Production startup prerequisites failed:');
  if (missing.length) {
    console.error(`  - Missing server packages: ${missing.join(', ')}`);
    console.error('  - Fix: from repo root run:  npm install --prefix server');
    console.error('  - Or set Parspack Install command to:');
    console.error('      npm install && npm install --prefix server');
  }
  if (distMissing) {
    console.error('  - Missing frontend build: dist/index.html');
    console.error('  - Fix: from repo root run:  npm run build');
  }
  process.exit(1);
}
