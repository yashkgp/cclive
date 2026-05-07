# Launch checklist for cclive

This file is a personal launch playbook — not user-facing docs. Don't link to it from the README.

## Pre-launch (must be done before posting anywhere)

- [ ] Repo is **public** on GitHub
- [ ] `demo.gif` is committed at repo root (`brew install vhs && vhs demo.tape`)
- [ ] Published to npm: `npm adduser && npm publish --access public`
- [ ] Verify install path works clean: `npx -y cclive@latest` in a fresh shell
- [ ] Smoke test from someone else's machine (or a fresh user) before posting
- [ ] README first 20 lines are punchy: pitch → install line → GIF → preview

## Where to post (in priority order)

### 1. Show HN (highest leverage)

Post **Tuesday or Wednesday, ~9am ET**. Avoid Friday and weekends.

**Title** (keep under 80 chars, no emoji, no exclamation marks — HN penalizes these):

> Show HN: cclive – live stock and sports tickers in your Claude Code prompt

**First comment** (post immediately after submission so the page isn't empty):

> Hey HN — I built this because I kept Cmd-Tabbing out of my editor to check
> NIFTY/IPL during long Claude Code sessions. The status line re-renders on
> every prompt anyway, so why not put it there?
>
> Notes:
> - All the built-in widgets (Yahoo Finance, ESPN scoreboard) are keyless. Cricket
>   is a Cricbuzz scrape — best-effort. PRs welcome there.
> - It never blocks the prompt: file cache + detached background refresh.
> - The rotating « » highlight is the closest you get to a "live" ticker since
>   status lines only update on prompt submit.
>
> Inspired by ccstatusline, which is excellent for dev metrics. cclive is the
> "world outside your editor" complement. Happy to take feedback.

### 2. r/ClaudeAI

**Title**: `Built cclive — live stock + sports tickers in the Claude Code status line`

**Body**: same as the HN comment but trim the ccstatusline line (Reddit doesn't reward references). Add the GIF inline.

### 3. r/commandline

**Title**: `cclive: Bloomberg-style ticker for the Claude Code status line (any Yahoo symbol, ESPN keyless API)`

**Body**: lead with the GIF, then 4 bullet points:
- Any Yahoo Finance symbol (`^NSEI`, `AAPL`, `BTC-USD`)
- NBA / NFL / MLB / NHL / EPL via ESPN's keyless scoreboard API
- Async file cache, never blocks the prompt
- Plain ESM JS, no build step — drop a new widget into `src/widgets/`

### 4. X / Bluesky

```
new tiny tool: cclive

stock tickers + live sports in your @claudeai status line.

NIFTY, AAPL, BTC, NBA, NFL, EPL — all keyless.

bloomberg-style rotating « » highlight, async cache, no blocking.

npx -y cclive@latest

[GIF]
```

Tag @sirmalloc (ccstatusline author) as a courtesy, not a plea.

## Awesome lists (slow trickle, but compounds)

Open one PR per list. The entry should be one line, alphabetized into the
right section. Keep it factual, no marketing language.

### awesome-claude-code

Repo: https://github.com/hesreallyhim/awesome-claude-code

PR title: `Add cclive to status line tools`

Entry (drop into the status-line section):

```markdown
- [cclive](https://github.com/yashkgp/cclive) — Live stock tickers and sports league scores (NBA/NFL/MLB/EPL/cricket) in your status line. No API keys, async cache.
```

## What NOT to do

- Don't post to r/programming. Generic, dies in an hour.
- Don't write a Medium "I built X" article before anyone has used it.
- Don't DM strangers asking for stars. It backfires.
- Don't post to multiple places in the same hour. Stagger by a day so each
  audience finds it fresh.
- Don't spam updates. One launch post per platform. If someone asks a
  question in the thread, answer it — that's the real engagement.

## Metrics worth watching

- HN comments > stars in the first 24h. A 50-comment thread with 80 stars beats
  a silent 200-star spike.
- npm weekly downloads after week 2. Stars are vanity; downloads are use.
- Issues filed in the first month — those people care.
