// ESPN scoreboard widget — keyless JSON, covers NBA, NFL, MLB, NHL, EPL etc.
//
// API shape:
//   https://site.api.espn.com/apis/site/v2/sports/<sport>/<league>/scoreboard
//
// Examples (sport / league):
//   soccer       / eng.1   → English Premier League
//   soccer       / esp.1   → La Liga
//   basketball   / nba     → NBA
//   football     / nfl     → NFL
//   baseball     / mlb     → MLB
//   hockey       / nhl     → NHL
//
// We pick the most "interesting" event from the response in this priority:
//   1. live game (status.type.state == "in")
//   2. most recent final (state == "post")
//   3. next upcoming (state == "pre")

import { FG, BOLD, RESET } from '../ansi.js';

const LABEL_COLORS = {
  EPL: FG.brightMagenta,
  NBA: FG.brightYellow,
  NFL: FG.brightYellow,
  MLB: FG.brightYellow,
  NHL: FG.brightCyan,
};

const pickEvent = (events) => {
  if (!Array.isArray(events) || events.length === 0) return null;
  const live = events.find((e) => e?.competitions?.[0]?.status?.type?.state === 'in');
  if (live) return { event: live, state: 'in' };
  const post = events
    .filter((e) => e?.competitions?.[0]?.status?.type?.state === 'post')
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  if (post) return { event: post, state: 'post' };
  const pre = events
    .filter((e) => e?.competitions?.[0]?.status?.type?.state === 'pre')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (pre) return { event: pre, state: 'pre' };
  return { event: events[0], state: events[0]?.competitions?.[0]?.status?.type?.state };
};

export const espnWidget = {
  cacheKey: (c) => `espn-${c.sport}-${c.league}`,
  defaultTTL: 300,

  async fetch(config, ctx) {
    const { sport, league } = config;
    const label = config.label || league.toUpperCase();
    const labelColor = LABEL_COLORS[label] || FG.brightCyan;
    const labelStr = `${BOLD}${labelColor}${label}${RESET}`;
    const fallback = `${labelStr} -`;

    if (!sport || !league) return fallback;

    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
      const body = await ctx.http(url);
      const data = JSON.parse(body);
      const picked = pickEvent(data?.events);
      if (!picked) return fallback;

      const comp = picked.event.competitions[0];
      const competitors = comp.competitors || [];
      const home = competitors.find((c) => c.homeAway === 'home') || competitors[0];
      const away = competitors.find((c) => c.homeAway === 'away') || competitors[1];
      if (!home || !away) return fallback;

      const a = away.team?.abbreviation || away.team?.shortDisplayName || '?';
      const h = home.team?.abbreviation || home.team?.shortDisplayName || '?';
      const aS = away.score ?? '0';
      const hS = home.score ?? '0';

      const liveDot =
        picked.state === 'in'
          ? `${BOLD}${FG.brightRed}●${RESET}`
          : picked.state === 'post'
          ? `${FG.white}●${RESET}`
          : `${FG.white}○${RESET}`;

      const cyan = FG.cyan;
      const white = `${BOLD}${FG.brightWhite}`;
      return `${labelStr} ${cyan}${a}${RESET} ${white}${aS}-${hS}${RESET} ${liveDot} ${cyan}${h}${RESET}`;
    } catch {
      return fallback;
    }
  },
};
