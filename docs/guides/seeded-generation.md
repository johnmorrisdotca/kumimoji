---
title: Seeded generation and proof
section: explanation
order: 8
description: Learn seeded generation and proof.
---

## Build a solution before dealing

Blindly drawing a bag could produce letters nobody can finish. generateKumimoji first builds an accepted crossword with native crossingFit rules, then shuffles its physical tiles into the bag. The solution is a proof of existence; gameplay accepts other valid layouts of the same physical tiles.

## Keep all settings

Reproducibility includes seed, hand size, difficulty, length, language, double-set choice and diagonals. The daily seed uses UTC YYYYMMDD. A historic shared puzzle should keep a numeric seed and all settings. Loading a different dictionary or changing the generator can change what a seed deals.

## Failure is explicit

Generation can throw if its bounded attempts cannot lay the requested bag; await words first and report an error rather than treating missing data as success. The root does not use a clock or Math.random. Computer choices, UI elapsed time and transport are separate from seeded bag construction. See [migration](upgrading.md) and [the native deal](api:KumimojiDeal).
