// Stock widget — Yahoo Finance v8 chart API (keyless).
// Works for any Yahoo symbol: ^NSEI (NIFTY), ^GSPC (S&P 500), AAPL, BTC-USD, etc.

import { FG, BOLD, DIM, RESET, bold } from '../ansi.js';

const fmtNumber = (n) =>
  n >= 100 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(2);

export const stockWidget = {
  cacheKey: (c) => `stock-${(c.symbol || 'unknown').replace(/[^A-Za-z0-9-]/g, '_')}`,
  defaultTTL: 300,

  async fetch(config, ctx) {
    const symbol = config.symbol || '^GSPC';
    const label = config.label || symbol.replace(/^\^/, '');
    const labelStr = `${BOLD}${FG.cyan}${label}${RESET}`;
    const fallback = `${labelStr} -`;

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol,
      )}`;
      const body = await ctx.http(url);
      const data = JSON.parse(body);
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta) return fallback;

      const price = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
      const pct = ((price - prev) / prev) * 100;

      let arrow, color;
      if (pct > 0) {
        arrow = '▲';
        color = `${BOLD}${FG.brightGreen}`;
      } else if (pct < 0) {
        arrow = '▼';
        color = `${BOLD}${FG.brightRed}`;
      } else {
        arrow = '▬';
        color = `${DIM}${FG.white}`;
      }
      const sign = pct >= 0 ? '+' : '';
      return `${labelStr} ${color}${fmtNumber(price)} ${arrow} (${sign}${pct.toFixed(2)}%)${RESET}`;
    } catch {
      return fallback;
    }
  },
};
