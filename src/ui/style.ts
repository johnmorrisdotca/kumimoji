/**
 * The table's own styles, scoped to `.km-root`, every colour and size a CSS
 * variable so a page can wear it in its own colours (set them on the element
 * or any ancestor, or pass them as `theme`). Light and dark follow the
 * reader's system. Everything to be tapped is at least 44px.
 */
export const KUMIMOJI_STYLE = `
.km-root {
  --km-square: 44px; --km-felt: #2f5d4a; --km-grid-line: rgba(255,255,255,.12); --km-tile: #f3e6c8; --km-tile-ink: #2a2118;
  --km-wild: #f6d27a; --km-wrong: #d9534f; --km-held: #ffcf3f; --km-ink: #1f2320; --km-panel: #f7f3ea;
  --km-line: rgba(20,20,20,.35); --km-accent: #2f5d4a; --km-accent-ink: #fff;
  --km-radius: 12px; --km-font: system-ui, -apple-system, "Segoe UI", sans-serif;
  display: grid; gap: 10px; min-width: 0; color: var(--km-ink); font-family: var(--km-font); font-size: 15px;
}
@media (prefers-color-scheme: dark) {
  .km-root { --km-felt: #1e3a2f; --km-ink: #ece8dc; --km-panel: #1d201e; --km-line: rgba(255,255,255,.25); --km-accent: #6fb08f; --km-accent-ink: #10150f; }
}
.km-root > * { min-width: 0; }
.km-status { margin: 0; min-height: 1.4em; font-variant-numeric: tabular-nums; }
.km-board { background: var(--km-felt); border-radius: var(--km-radius); padding: 10px; overflow: auto; max-height: 70vh; }
.km-grid { display: grid; gap: 2px; width: max-content; margin: 0 auto; }
.km-square { width: var(--km-square); height: var(--km-square); border: 0; border-radius: 5px; background: var(--km-grid-line); padding: 0; cursor: pointer; touch-action: manipulation; }
.km-tile { display: grid; place-items: center; width: var(--km-square); height: var(--km-square); border-radius: 6px; border: 0; padding: 0;
  background: var(--km-tile); color: var(--km-tile-ink); font: 700 calc(var(--km-square) * .55)/1 var(--km-font); text-transform: uppercase;
  box-shadow: 0 2px 0 rgba(0,0,0,.35); cursor: pointer; touch-action: manipulation; }
.km-japanese .km-tile { font-size: calc(var(--km-square) * .52); text-transform: none; }
.km-wild { background: var(--km-wild); }
.km-misspelt { box-shadow: 0 0 0 3px var(--km-wrong) inset, 0 2px 0 rgba(0,0,0,.35); }
.km-apart { opacity: .6; }
.km-held { outline: 3px solid var(--km-held); outline-offset: 1px; }
.km-square:focus-visible, .km-button:focus-visible, .km-keep-title:focus-visible { outline: 3px solid var(--km-held); outline-offset: 2px; }
.km-notes { margin: 0; min-height: 1.4em; font-size: 14px; opacity: .8; overflow-wrap: anywhere; }
.km-hand { display: flex; flex-wrap: wrap; gap: 6px; min-height: calc(var(--km-square) + 16px); align-items: center; padding: 8px; border-radius: 10px; background: var(--km-panel); }
.km-empty { opacity: .6; font-size: 14px; }
.km-picker { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.km-picker:empty { display: none; }
.km-picker-title { width: 100%; font-size: 14px; }
.km-picker .km-button { padding: 0 8px; text-transform: uppercase; }
.km-japanese .km-picker .km-button { text-transform: none; }
.km-controls { display: flex; flex-wrap: wrap; gap: 8px; }
.km-button { font: inherit; min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--km-line); background: var(--km-panel); color: var(--km-ink); cursor: pointer; touch-action: manipulation; }
.km-button:disabled { opacity: .45; cursor: default; }
.km-primary { background: var(--km-accent); color: var(--km-accent-ink); border-color: transparent; }
.km-keep { border-radius: 10px; background: var(--km-panel); padding: 0 10px; }
.km-keep[open] { padding-bottom: 10px; }
.km-keep-title { min-height: 44px; display: flex; align-items: center; font-weight: 600; cursor: pointer; }
.km-note { margin: 8px 0 0; min-height: 1.4em; font-size: 13px; }
`;
