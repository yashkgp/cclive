// Widget contract.
//
// Each widget is an object with shape:
//
//   {
//     // Stable string id used for cache file naming. Should be unique
//     // per (widget-type, params) combination — usually derive from params.
//     cacheKey(widgetConfig): string,
//
//     // Default TTL in seconds. The user-level cacheTTL overrides this
//     // when set in the top-level config.
//     defaultTTL: number,
//
//     // Async fetch — returns a fully-rendered ANSI string for this widget.
//     // It's responsible for its own colors and formatting. If anything
//     // fails, return a graceful fallback string (e.g. "EPL -").
//     fetch(widgetConfig, ctx): Promise<string>,
//   }
//
// `ctx` carries shared utilities: { fetchTimeoutMs, http(url) -> Promise<string> }.
//
// Adding a custom widget:
//   1. Drop a .js file into ~/.config/cclive/widgets/ exporting the contract above.
//   2. Reference it by file path in your config:
//        { "type": "custom", "module": "~/.config/cclive/widgets/foo.js", "..." }
//   (Custom-module loading is on the v0.2 roadmap; for now, fork and add to src/widgets/.)

export const widgetShape = {};
