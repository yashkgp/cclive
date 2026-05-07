// Cricket widget — Cricbuzz HTML scrape (best-effort).
//
// There is no reliable keyless cricket API. This widget scrapes Cricbuzz's
// live-scores page and pattern-matches a score block. If Cricbuzz changes
// their markup, this will silently fall back to "<LABEL> -" until the
// regex is updated. PRs welcome.

import { FG, BOLD, RESET } from '../ansi.js';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

export const cricketWidget = {
  cacheKey: (c) => `cricket-${(c.filter || 'any').toLowerCase()}`,
  defaultTTL: 300,

  async fetch(config, ctx) {
    const label = config.label || 'CRICKET';
    const filter = config.filter; // optional substring like "IPL"
    const labelStr = `${BOLD}${FG.brightYellow}${label}${RESET}`;
    const fallback = `${labelStr} -`;

    try {
      const html = await ctx.http('https://www.cricbuzz.com/cricket-match/live-scores', {
        headers: { 'User-Agent': UA },
      });

      // Optionally narrow to a substring of the page (e.g., "IPL")
      const region = filter
        ? (() => {
            const idx = html.toUpperCase().indexOf(filter.toUpperCase());
            return idx === -1 ? html : html.slice(idx, idx + 4000);
          })()
        : html;

      const isLive = /\bLIVE\b/i.test(region);
      const dot = isLive
        ? `${BOLD}${FG.brightRed}●${RESET}`
        : `${FG.white}●${RESET}`;

      const cyan = FG.cyan;
      const white = `${BOLD}${FG.brightWhite}`;

      // Pattern: TEAM • score (overs?)  vs  TEAM
      const m = region.match(
        /\b([A-Z]{2,4})\s*[^\w<]{1,3}\s*([0-9]+\/[0-9]+(?:\s*\([^)]{1,20}\))?)[^<]{0,80}?(?:vs\.?|v)\s*([A-Z]{2,4})\b/,
      );
      if (m) {
        return `${labelStr} ${cyan}${m[1]}${RESET} ${white}${m[2].trim()}${RESET} ${dot} ${cyan}${m[3]}${RESET}`;
      }
      // Fallback: any TEAM<sep>score pair near the filter region
      const m2 = region.match(/\b([A-Z]{2,4})\D{1,10}([0-9]+\/[0-9]+)/);
      if (m2) {
        return `${labelStr} ${cyan}${m2[1]}${RESET} ${white}${m2[2]}${RESET} ${dot}`;
      }
      return fallback;
    } catch {
      return fallback;
    }
  },
};
