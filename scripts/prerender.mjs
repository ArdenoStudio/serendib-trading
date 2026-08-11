/**
 * Post-build prerender for key marketing routes.
 * Starts Vite preview, snapshots HTML with Playwright, writes static files so
 * crawlers and first paint receive real content for / and /inventory.
 */
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const PORT = 4391;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  { path: '/', out: path.join(distDir, 'index.html') },
  { path: '/inventory', out: path.join(distDir, 'inventory', 'index.html') },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok || res.status === 404) return;
    } catch {
      // retry
    }
    await wait(250);
  }
  throw new Error(`Preview server did not start at ${url}`);
}

function startPreview() {
  const logPath = path.join(root, 'prerender-preview.log');
  const log = createWriteStream(logPath, { flags: 'w' });
  // Invoke vite through node so this works on Windows, macOS, and Linux
  // without relying on npx/cmd wrappers.
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
      shell: false,
    },
  );
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  return child;
}

async function snapshotRoute(browser, route) {
  const page = await browser.newPage();
  await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 60_000 });
  // Wait for the h1 (and its animated ancestors) to actually be visible so the
  // snapshot never captures the hero mid-fade (opacity 0) or the loader state.
  try {
    await page.waitForFunction(
      () => {
        const el = document.querySelector('h1');
        if (!el) return false;
        let node = el;
        for (let i = 0; i < 5 && node; i += 1) {
          const opacity = parseFloat(getComputedStyle(node).opacity);
          if (Number.isFinite(opacity) && opacity < 0.01) return false;
          node = node.parentElement;
        }
        return true;
      },
      { timeout: 20_000 },
    );
  } catch {
    // Continue with whatever HTML we have.
  }
  // Let lazy chunks + inventory fetch settle when Supabase is configured.
  await page.waitForTimeout(800);

  let html = await page.content();
  // Ensure crawlers see a non-empty body snapshot and keep relative asset paths.
  if (!html.includes('<!DOCTYPE html>') && !html.includes('<!doctype html>')) {
    html = `<!DOCTYPE html>${html}`;
  }

  await mkdir(path.dirname(route.out), { recursive: true });
  await writeFile(route.out, html, 'utf8');
  await page.close();
  console.log(`prerendered ${route.path} -> ${path.relative(root, route.out)}`);
}

async function main() {
  const shell = path.join(distDir, 'index.html');
  try {
    await readFile(shell, 'utf8');
  } catch {
    throw new Error('dist/index.html missing. Run vite build before prerender.');
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.warn(
      `[prerender] Skipping snapshots (Chromium unavailable): ${err instanceof Error ? err.message : err}`,
    );
    console.warn('[prerender] Deploy will use the SPA shell. Install Playwright browsers locally for prerender.');
    return;
  }

  const preview = startPreview();
  try {
    await waitForServer(BASE);
    for (const route of ROUTES) {
      await snapshotRoute(browser, route);
    }
  } finally {
    await browser.close().catch(() => undefined);
    preview.kill('SIGTERM');
    try {
      preview.kill('SIGKILL');
    } catch {
      // already exited
    }
  }
}

main().catch((err) => {
  console.error(err);
  // Never fail the production build solely because prerender could not run.
  console.warn('[prerender] Continuing without prerendered HTML.');
  process.exit(0);
});
