// Git segment — robbyrussell-style: green arrow + cyan dir + blue git:(branch).
// Synchronous (no network), so we don't bother caching.

import { execSync } from 'node:child_process';
import { basename } from 'node:path';
import { FG, BOLD, RESET, bold } from '../ansi.js';

const sh = (cmd, cwd) => {
  try {
    return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
};

export const gitWidget = {
  cacheKey: () => 'git',
  defaultTTL: 0,
  isSync: true,

  render(_config, ctx) {
    const cwd = ctx.cwd;
    const dir = basename(cwd);
    const dirPart = `${BOLD}${FG.green}➜${RESET} ${FG.cyan}${dir}${RESET}`;

    const inRepo = sh('git rev-parse --git-dir', cwd);
    if (!inRepo) return dirPart;

    const branch =
      sh('git symbolic-ref --short HEAD', cwd) || sh('git rev-parse --short HEAD', cwd);
    if (!branch) return dirPart;

    const dirty = sh('git diff-index --quiet HEAD --; echo $?', cwd) === '1';
    const branchPart = dirty
      ? `${BOLD}${FG.blue}git:(${FG.red}${branch}${FG.blue}) ${FG.yellow}✗${RESET}`
      : `${BOLD}${FG.blue}git:(${FG.red}${branch}${FG.blue})${RESET}`;

    return `${dirPart} ${branchPart}`;
  },
};
