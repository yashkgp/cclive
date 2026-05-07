# cclive

> Stock tickers and live sports scores in your Claude Code prompt. No API keys.

```sh
npx -y cclive@latest    # in your ~/.claude/settings.json statusLine.command
```

![demo](./demo.gif)

```
➜  myproject  git:(main)   NIFTY 22,150 ▲ (+0.52%)   « EPL ARS 2-1 ● LIV »   NBA LAL 110-104 ● BOS   IPL MI 180/4 ● CSK
```

The active widget is highlighted with `« »` and rotates one slot to the right each prompt render — a Bloomberg-style ticker that advances as you work. Inspired by [ccstatusline](https://github.com/sirmalloc/ccstatusline) (which focuses on dev metrics); cclive focuses on the world outside your editor.

## Features

- **Stocks**: any Yahoo Finance symbol — indices (`^NSEI`, `^GSPC`), equities (`AAPL`), crypto (`BTC-USD`).
- **Sports**: NBA, NFL, MLB, NHL, EPL/La Liga (and any other league ESPN's keyless scoreboard API covers), plus a best-effort cricket widget.
- **No API keys required** for any built-in widget.
- **Async, non-blocking**: 5-min file cache + detached background refresh. Your prompt never waits on the network.
- **Configurable**: pick the widgets you want, in the order you want, in a single JSON file.
- **Hackable**: plain ESM JavaScript, no build step. Drop a new widget into `src/widgets/` and register it.

## Install

Requires Node 18+.

### One-off (recommended)

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx -y cclive@latest"
  }
}
```

### From source

```sh
git clone https://github.com/yashjain/cclive.git
cd cclive
npm link
```

then in `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "cclive"
  }
}
```

## Configure

cclive reads its config from the first of these that exists:

1. `$CCLIVE_CONFIG` (explicit path)
2. `$CLAUDE_CONFIG_DIR/cclive/config.json`
3. `$XDG_CONFIG_HOME/cclive/config.json`
4. `~/.config/cclive/config.json`

If none exist, a sensible default is used (NIFTY, EPL, NBA, IPL).

### Example

```json
{
  "rotate": true,
  "cacheTTL": 300,
  "fetchTimeoutMs": 2000,
  "separator": "  ",
  "widgets": [
    { "type": "git" },
    { "type": "stock", "symbol": "^NSEI", "label": "NIFTY" },
    { "type": "stock", "symbol": "AAPL" },
    { "type": "espn", "sport": "soccer", "league": "eng.1", "label": "EPL" },
    { "type": "espn", "sport": "basketball", "league": "nba", "label": "NBA" },
    { "type": "espn", "sport": "football", "league": "nfl", "label": "NFL" },
    { "type": "cricket", "label": "IPL", "filter": "IPL" }
  ]
}
```

### Top-level keys

| Key              | Default | Notes                                                        |
|------------------|---------|--------------------------------------------------------------|
| `rotate`         | `true`  | Cycle the bold-bracketed highlight across async widgets.     |
| `cacheTTL`       | `300`   | Default cache lifetime in seconds.                           |
| `fetchTimeoutMs` | `2000`  | Hard timeout per HTTP fetch.                                 |
| `separator`      | `"  "`  | Inserted between widgets in the rendered line.               |
| `widgets`        | (list)  | Ordered list of widget configurations.                       |

### Built-in widgets

#### `git`

Robbyrussell-style segment: green arrow, cyan dir, blue `git:(branch)`, yellow `✗` if dirty. No params, no network.

#### `stock`

```json
{ "type": "stock", "symbol": "^NSEI", "label": "NIFTY" }
```

| Param    | Required | Notes                                                       |
|----------|----------|-------------------------------------------------------------|
| `symbol` | yes      | Yahoo Finance symbol.                                       |
| `label`  | no       | Display label. Defaults to symbol with leading `^` stripped.|
| `ttl`    | no       | Per-widget cache TTL override.                              |

Common symbols: `^NSEI` (NIFTY 50), `^BSESN` (Sensex), `^GSPC` (S&P 500), `^DJI` (Dow), `^FTSE`, `AAPL`, `NVDA`, `BTC-USD`, `ETH-USD`.

#### `espn`

```json
{ "type": "espn", "sport": "basketball", "league": "nba", "label": "NBA" }
```

| Param    | Required | Notes                                                       |
|----------|----------|-------------------------------------------------------------|
| `sport`  | yes      | `soccer`, `basketball`, `football`, `baseball`, `hockey`.   |
| `league` | yes      | `eng.1`, `esp.1`, `nba`, `nfl`, `mlb`, `nhl`, etc.          |
| `label`  | no       | Display label. Defaults to uppercase league code.           |
| `ttl`    | no       | Per-widget cache TTL override.                              |

The widget shows the most "interesting" event in this priority: live > most recent final > next upcoming. Live games show a red `●`, finals a white `●`, upcoming a hollow `○`.

#### `cricket`

```json
{ "type": "cricket", "label": "IPL", "filter": "IPL" }
```

| Param    | Required | Notes                                                       |
|----------|----------|-------------------------------------------------------------|
| `filter` | no       | Substring of the page to narrow the score search to (e.g. "IPL", "Asia Cup"). |
| `label`  | no       | Display label. Defaults to `CRICKET`.                       |

Note: this is a best-effort scrape of cricbuzz.com. Markup changes will silently break it until the regex is updated. Help wanted.

## Add your own widget

Copy `src/widgets/stock.js` as a template. The contract:

```js
export const myWidget = {
  // Stable cache file key. Should encode the params so different configs
  // don't share a cache file.
  cacheKey: (config) => `mywidget-${config.foo}`,

  // Default seconds before cache is considered stale.
  defaultTTL: 300,

  // Return a fully-rendered ANSI string. On any error, return a graceful
  // fallback like "MY -" so the status line never breaks.
  async fetch(config, ctx) {
    const body = await ctx.http('https://example.com/api');
    return `MY ${body}`;
  },
};
```

Then register it in `src/widgets/index.js`:

```js
import { myWidget } from './my.js';

export const REGISTRY = {
  ...,
  my: myWidget,
};
```

Reference it in your config as `{ "type": "my", "foo": "bar" }`.

## Caveats

- **Status lines re-render on prompt submit, not continuously.** The rotating highlight gives the *feel* of a live ticker, but data only refreshes when the cache TTL elapses and you submit a prompt.
- **Cricket scraping is fragile.** Cricbuzz can change markup at any time. The widget falls back to `<LABEL> -` when it can't parse.
- **Live indicators are heuristics.** A red `●` means "we think this is live"; not guaranteed.
- **Rate limits.** Yahoo Finance and ESPN's keyless endpoints are generous but not unlimited. The default 5-min TTL keeps you well within sane usage. Lower it at your own risk.

## Roadmap

- v0.2: dynamic loading of user widgets from `~/.config/cclive/widgets/*.js`.
- v0.2: optional Ink-based interactive `cclive init` to scaffold a config.
- v0.3: weather widget, RSS headlines widget, currency widget.
- Pluggable color themes.

## License

MIT
