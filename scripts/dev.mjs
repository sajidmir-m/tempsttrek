/**
 * Forces the process cwd to the Next.js app root so PostCSS/Turbopack resolve
 * tailwindcss from this project's node_modules (fixes "Can't resolve tailwindcss"
 * when the shell cwd is accidentally the parent folder e.g. Desktop).
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

if (!existsSync(join(root, 'node_modules', 'tailwindcss'))) {
  console.error('[dev] tailwindcss not found. Run: npm install');
  console.error('[dev] cwd is:', root);
  process.exit(1);
}

process.chdir(root);

const proc = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  cwd: root,
  env: process.env,
});

proc.on('exit', (code) => process.exit(code ?? 0));
