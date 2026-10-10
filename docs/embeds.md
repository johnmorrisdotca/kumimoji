# Crossword-table embeds

The shared builder covers every observed attribute and native table option, with explicit host-only reasons for saved state, private word overrides, custom CSS-variable palettes and callbacks. It copies all host formats using the package's major version. Setup is in the URL; the embed reads no storage. Keep defaults off in copied code/frames, while the legacy element default remains on.

## Compatibility and state

Language remains the tiles (english/japanese), distinct from lang (interface en/ja). Hand, wild-tile level, bag length, diagonals and seed retain native semantics. Every attribute reflects to a property; native lang already reflects. Daily accepts a validated UTC date/today/off and takes priority over seed. Seed=daily remains a compatible today alias. No rollover timer is added.

Table and saved remain structured getters. NewGame and setGame remain async methods. Options accepts every native table choice, including initial saved state and onError. The native handle adds ready for the initial deal/restore and set for locale/words/palette/keep/controls changes without redealing. Callbacks are read at event time; display, saving/control and locale changes preserve play. Game inputs or a changed initial saved state start a new deal/restore. Stale asynchronous completions cannot announce a disconnected or newer table. Failed word loading gives a visible localized status and a plain error event. The React wrapper forwards the new native fields without leaking them onto the host div.

## Presentation and access

Size is small/medium/large (320/480/640px), with optional pixel width. Theme is device/light/dark; host theme options remain CSS-variable overrides. Label and width restore original host values when removed. Styles remain scoped and work in shadow roots. Native tile keyboard, focus restoration and wild-letter selection are unchanged. Controls=false hides play-action buttons for a host supplying its own actions. Keep enables only manual file downloads/loading, never automatic persistence. The existing local gameplay clock is cleaned up on destroy.

## Events and frames

Kumimoji-change preserves { saved }; finish preserves the deal/play/elapsed detail. Native events now bubble/compose with JSON-safe copies; original callback signatures remain. Kumimoji-load gives seed and day, and kumimoji-error gives a plain message. Frames forward { type, detail }; hosts should verify the sender's origin and frame.

The route validates tile language, hand/rules, booleans, bounded seeds/widths, UTC dates, looks and labels and ignores malformed fields. It has noindex, device colour-scheme, transparent margins and no document scrolling. The native grid retains its deliberate panning and bounded height. Only local package modules are loaded; copied imports use jsDelivr. No hosted service or new timer is added.
