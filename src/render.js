// Render layer.
//
// Composes synchronous widgets (like git) with async cache-backed widgets
// (stocks, leagues), and applies the rotating-ticker highlight if enabled.
//
// Active widget: wrapped in bold-white « » brackets.
// Inactive widgets: dimmed via \x1b[2m so the highlighted one pops.

import { resolve } from './widgets/index.js';
import { cachePath, isStale, readCache, writeCache, scheduleRefresh } from './cache.js';
import { BOLD, DIM, FG, RESET } from './ansi.js';
import { readFileSync } from 'node:fs';

const TICK_FILE = `${process.env.CCLIVE_CACHE_DIR || '/tmp'}/cclive-tick`;

const advanceTick = (modulo) => {
  let t = 0;
  try {
    const v = parseInt(readFileSync(TICK_FILE, 'utf8'), 10);
    if (Number.isFinite(v)) t = v;
  } catch {}
  t = (t + 1) | 0;
  writeCache(TICK_FILE, String(t));
  return modulo > 0 ? (t - 1) % modulo : 0;
};

const frameActive = (text) =>
  `${BOLD}${FG.brightWhite}«${RESET} ${text} ${BOLD}${FG.brightWhite}»${RESET}`;
const frameInactive = (text) => `${DIM}${text}${RESET}`;

export const renderStatusLine = async (config, ctx, scriptPath) => {
  const widgets = config.widgets || [];

  // Network/async widgets get an active-index pool for rotation.
  const asyncIndices = widgets
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => !resolve(w.type)?.isSync);
  const activeIdx = config.rotate && asyncIndices.length > 0
    ? asyncIndices[advanceTick(asyncIndices.length) % asyncIndices.length].i
    : -1;

  const segments = await Promise.all(
    widgets.map(async (w, i) => {
      const widget = resolve(w.type);
      if (!widget) return `${FG.red}?${w.type}?${RESET}`;

      if (widget.isSync) {
        return widget.render(w, ctx);
      }

      const key = widget.cacheKey(w);
      const file = cachePath(key);
      const ttl = w.ttl ?? config.cacheTTL ?? widget.defaultTTL;

      if (isStale(file, ttl)) {
        scheduleRefresh(scriptPath, i);
      }

      const cached = readCache(file, '');
      const content = cached || (await widget.fetch(w, ctx));
      if (!cached) writeCache(file, content);

      if (config.rotate && asyncIndices.length > 0) {
        return i === activeIdx ? frameActive(content) : frameInactive(content);
      }
      return content;
    }),
  );

  const sep = config.separator ?? '  ';
  return segments.filter(Boolean).join(sep);
};

// Refresh-mode entrypoint: fetch one widget by index and write its cache.
export const refreshOne = async (config, ctx, index) => {
  const w = config.widgets?.[index];
  if (!w) return;
  const widget = resolve(w.type);
  if (!widget || widget.isSync) return;
  try {
    const content = await widget.fetch(w, ctx);
    writeCache(cachePath(widget.cacheKey(w)), content);
  } catch {
    // best-effort
  }
};
