---
title: Grids, runs and views
section: explanation
order: 7
description: Learn grids, runs and views.
---

## Read a connected crossword

Tiles is a map of square names to internal codes. runsOf reads across/down runs; diagonal rules additionally read diagonal runs of sufficient length. groupsOf checks connectivity. GridVerdict has sound, misspelt, apart and notWords, so a host can explain separate word and connectivity problems.

## Rotation belongs to presentation

Turn is 0 through 3. turnPlace/unturnPlace transform coordinates, while typingWay/arrowStep keep keyboard movement aligned with the visible table. Area bounds and View pixel translation/tile size support fit, zoom, pan and keeping the table in reach. None of these functions adjudicates a word or draws a tile.

## Preserve encodings

Grid strings trim occupied bounds, encode empty gaps and escape non-English tiles. Progress strings retain bag consumption and hand/table ownership. Use native encoders and decoders instead of mapping visible glyphs into stored tile codes. An empty grid is valid empty progress, not a solved game. [Solo play](play-a-crossword.md) and [saving](save-and-embed.md) show the boundaries.
