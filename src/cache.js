// File-backed cache with TTL + async refresh.
//
// The status line is invoked synchronously on every prompt render. We never
// want to block the prompt on a network fetch, so the pattern is always:
//
//   1. read the cache file (possibly stale)
//   2. if stale, kick off a detached background refresh
//   3. return the cached value immediately
//
// The next prompt render will see the freshened cache.

import { readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawn } from 'node:child_process';

const CACHE_DIR = process.env.CCLIVE_CACHE_DIR || '/tmp';

export const cachePath = (key) => `${CACHE_DIR}/cclive-${key}`;

export const isStale = (file, ttlSeconds) => {
  try {
    const mtime = statSync(file).mtimeMs / 1000;
    return Date.now() / 1000 - mtime >= ttlSeconds;
  } catch {
    return true; // missing == stale
  }
};

export const readCache = (file, fallback = '') => {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return fallback;
  }
};

export const writeCache = (file, value) => {
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, value);
  } catch {
    // best-effort; cache failures should never break the status line
  }
};

// Spawn a detached child process to refresh the cache for next render.
// We re-invoke this same script with --refresh <widget-index> so the child
// loads only the one widget it needs, fetches, and writes the cache file.
export const scheduleRefresh = (scriptPath, widgetIndex) => {
  const child = spawn(process.execPath, [scriptPath, '--refresh', String(widgetIndex)], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });
  child.unref();
};
