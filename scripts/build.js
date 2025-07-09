const { mkdirSync, copyFileSync } = require('node:fs');
const { join } = require('node:path');

mkdirSync('dist', { recursive: true });
copyFileSync(join(__dirname, '..', 'index.js'), join('dist', 'index.js'));
console.log('📦  Arquivo copiado para dist/');