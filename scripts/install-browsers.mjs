/**
 * Best-effort Playwright Chromium install for the post-build prerender step.
 * Never fails the production build: if browsers cannot be installed here,
 * scripts/prerender.mjs will detect it and skip snapshots gracefully.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'node_modules', 'playwright', 'cli.js');

try {
  execFileSync(process.execPath, [cli, 'install', 'chromium'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT: '120000' },
  });
} catch (err) {
  console.warn(
    `[prerender] Chromium install failed (${err instanceof Error ? err.message : err}). ` +
      'Prerender will be skipped and the SPA shell deployed instead.',
  );
  process.exit(0);
}
