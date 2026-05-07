#!/usr/bin/env node
// cclive — Claude Code status line for live external data.
//
// Invoked by Claude Code on every prompt render. Reads stdin (Claude Code
// passes a JSON blob with workspace info), loads config, renders a one-line
// ANSI string to stdout.
//
// Two modes:
//   default  — render the status line synchronously, kicking off background
//              refreshes for any stale widgets.
//   --refresh <i>  — invoked by the parent in detached mode to refresh widget
//                   index <i> and write its cache.

import { loadConfig } from './config.js';
import { renderStatusLine, refreshOne } from './render.js';

const readStdin = () =>
  new Promise((resolve) => {
    let buf = '';
    if (process.stdin.isTTY) return resolve('');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (buf += c));
    process.stdin.on('end', () => resolve(buf));
    // Don't hang forever if Claude Code didn't pipe anything.
    setTimeout(() => resolve(buf), 200);
  });

const buildHttp = (timeoutMs) => async (url, opts = {}) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
};

const main = async () => {
  const config = loadConfig();
  const stdin = await readStdin();
  let cwd = process.cwd();
  try {
    const parsed = stdin ? JSON.parse(stdin) : null;
    cwd = parsed?.workspace?.current_dir || cwd;
  } catch {}

  const ctx = {
    cwd,
    fetchTimeoutMs: config.fetchTimeoutMs ?? 2000,
    http: buildHttp(config.fetchTimeoutMs ?? 2000),
  };

  const refreshFlag = process.argv.indexOf('--refresh');
  if (refreshFlag !== -1) {
    const i = parseInt(process.argv[refreshFlag + 1], 10);
    if (Number.isFinite(i)) await refreshOne(config, ctx, i);
    return;
  }

  const scriptPath = new URL(import.meta.url).pathname;
  const line = await renderStatusLine(config, ctx, scriptPath);
  process.stdout.write(line + '\n');
};

main().catch((e) => {
  process.stderr.write(`cclive: ${e.message}\n`);
  process.exit(0); // exit 0 so Claude Code doesn't show an error in the status line
});
