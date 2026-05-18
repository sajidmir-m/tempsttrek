import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'node_modules/html2pdf.js/dist/html2pdf.bundle.min.js');
const destDir = path.join(root, 'public/vendor');
const dest = path.join(destDir, 'html2pdf.bundle.min.js');

if (!fs.existsSync(src)) {
  console.warn('[copy-html2pdf-vendor] html2pdf.js not installed, skipping');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('[copy-html2pdf-vendor] copied to public/vendor/html2pdf.bundle.min.js');
