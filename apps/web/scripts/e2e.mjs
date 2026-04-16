import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3101';
const cwd = fileURLToPath(new URL('..', import.meta.url));
const shouldSpawnServer = !process.env.E2E_BASE_URL;
const server = shouldSpawnServer
  ? process.platform === 'win32'
    ? spawn(
        process.env.ComSpec ?? 'cmd.exe',
        ['/d', '/s', '/c', 'npx next start --hostname 127.0.0.1 --port 3101'],
        {
          cwd,
          shell: false,
          stdio: ['ignore', 'pipe', 'pipe']
        }
      )
    : spawn('npx', ['next', 'start', '--hostname', '127.0.0.1', '--port', '3101'], {
        cwd,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe']
      })
  : null;

const teardown = () => {
  if (!server || server.killed) {
    return;
  }

  if (!server.killed) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  }
};

process.on('exit', teardown);
process.on('SIGINT', () => {
  teardown();
  process.exit(1);
});

let ready = false;
for (let attempt = 0; attempt < 30; attempt += 1) {
  try {
    const response = await fetch(`${baseUrl}/`);
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {}
  await delay(1000);
}

assert.ok(ready, 'Next production server did not become ready in time.');

try {
  const landing = await fetch(`${baseUrl}/`);
  const landingHtml = await landing.text();
  assert.equal(landing.status, 200, 'Landing page should return HTTP 200.');
  assert.match(
    landingHtml,
    /A digital home for students building Tanzania's future together\./,
    'Landing page should contain the product headline.'
  );
  assert.match(landingHtml, /Sign in/, 'Landing page should expose the sign-in CTA.');

  const manifestResponse = await fetch(`${baseUrl}/manifest.webmanifest`);
  assert.equal(manifestResponse.status, 200, 'Manifest should return HTTP 200.');
  const manifest = await manifestResponse.json();
  assert.equal(
    manifest.name,
    'SSE Academic Collaboration Platform',
    'Manifest should expose the application name.'
  );

  console.log('E2E smoke passed.');
} finally {
  teardown();
}
