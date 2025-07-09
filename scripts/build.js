import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '..', 'index.js');
const destDir = join(__dirname, '..', 'dist');

await mkdir(destDir, { recursive: true });
await copyFile(src, join(destDir, 'index.js'));

console.log('📦  Arquivo copiado para dist/');