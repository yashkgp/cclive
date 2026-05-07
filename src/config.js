// Config loader. Reads JSON from one of:
//   $CCLIVE_CONFIG (explicit override)
//   $CLAUDE_CONFIG_DIR/cclive/config.json
//   $XDG_CONFIG_HOME/cclive/config.json
//   ~/.config/cclive/config.json
// Falls back to a sensible default if none exists.

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const DEFAULT_CONFIG = {
  rotate: true,
  cacheTTL: 300,
  fetchTimeoutMs: 2000,
  separator: '  ',
  widgets: [
    { type: 'git' },
    { type: 'stock', symbol: '^NSEI', label: 'NIFTY' },
    { type: 'espn', sport: 'soccer', league: 'eng.1', label: 'EPL' },
    { type: 'espn', sport: 'basketball', league: 'nba', label: 'NBA' },
    { type: 'cricket', label: 'IPL', filter: 'IPL' },
  ],
};

const candidatePaths = () => {
  const paths = [];
  if (process.env.CCLIVE_CONFIG) paths.push(process.env.CCLIVE_CONFIG);
  if (process.env.CLAUDE_CONFIG_DIR) {
    paths.push(join(process.env.CLAUDE_CONFIG_DIR, 'cclive', 'config.json'));
  }
  if (process.env.XDG_CONFIG_HOME) {
    paths.push(join(process.env.XDG_CONFIG_HOME, 'cclive', 'config.json'));
  }
  paths.push(join(homedir(), '.config', 'cclive', 'config.json'));
  return paths;
};

export const loadConfig = () => {
  for (const p of candidatePaths()) {
    if (existsSync(p)) {
      try {
        const raw = JSON.parse(readFileSync(p, 'utf8'));
        return { ...DEFAULT_CONFIG, ...raw };
      } catch (e) {
        process.stderr.write(`cclive: failed to parse ${p}: ${e.message}\n`);
      }
    }
  }
  return DEFAULT_CONFIG;
};
