// ANSI color helpers. Bold/bright codes are used heavily to evoke a stock-screen feel.

export const RESET = '\x1b[0m';
export const BOLD = '\x1b[1m';
export const DIM = '\x1b[2m';

export const FG = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
};

export const wrap = (codes, text) => `${codes}${text}${RESET}`;
export const bold = (text, color = '') => wrap(`${BOLD}${color}`, text);
export const dim = (text) => wrap(DIM, text);

// Visible-character length, ignoring ANSI escape sequences.
export const visibleLength = (s) => s.replace(/\x1b\[[0-9;]*m/g, '').length;
