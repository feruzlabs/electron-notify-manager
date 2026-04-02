import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)); // example/scripts
const exampleRoot = resolve(here, '..'); // example/

const src = resolve(exampleRoot, 'dist-renderer', 'renderer.js');
const dst = resolve(exampleRoot, 'dist', 'renderer.js');

mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);

