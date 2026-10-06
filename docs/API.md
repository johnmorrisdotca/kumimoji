# The API in full

The long tables of exports from [Kumimoji's README](../README.md#api), moved here to keep the README under the length npm shows. Every export is also in the [API reference](https://johnmorrisdotca.github.io/kumimoji/api.html), made from the source.

## Dealing and judging

| Export | What it does |
| --- | --- |
| `generateKumimoji(hand, level, seed, options?)` | A game dealt from a seed: the bag, and one grid that finishes it |
| `judgeWithWords(tiles, words, rules?)` | What is wrong with a grid: the tiles in runs that are not words, the tiles apart, and whether it is sound |
| `judgeGrid(tiles, isWord, readable?, rules?)` | The same against any test of a word |
| `runsOf(tiles, rules?)`, `groupsOf(tiles, links?)` | Every run the grid is read by; the tiles in groups that touch |
| `checkKumimoji(size, givens, answer, options?)` | Whether a grid finishes a game: the one check a server runs |
| `kumimojiPoints(givens, elapsedMs)` | A finished game's points |
| `readWilds(tiles, words, rules?)`, `WILD_SEARCH_MOST` | A grid with each wild that has no letter read as the one that makes its runs words, or `null`; and how far it looks before giving up |
| `wordsInHand(hand, words)`, `handSpelling(play, word)` | Help: the words a hand spells, and the hand arranged as one |
| `crossingFit`, `diagonalsRead` | Where a word may be laid crossing a tile, and the diagonal runs a new tile would make, for a generator or a computer player |
| `seededRandom(seed)`, `shuffled(items, random)` | The seeded random a deal is drawn from |

## Tiles and grids

| Export | What it does |
| --- | --- |
| `squareAt(row, col)`, `placeOf(square)` | A square's key, and back |
| `encodeGrid(tiles)`, `decodeGrid(code)`, `boundsOf(tiles)` | A grid as a string, and back; the rows and columns it stands within |
| `lettersOf(letters)`, `sameLetters(a, b)` | How many of each tile, and whether two tallies match |
| `tileFace(tile)`, `tileDescription(tile)`, `kanaTileCode(kana, wild?)` | What a tile shows; what a screen reader says; a kana's tile |
| `tileKana(kana)`, `BASE_KANA`, `CORNER_FORMS`, `formsOfTile(kana)` | The tile a kana is played with, the 45 tiles, and the forms each plays as |
| `familyKeyOf(language)` | Which tile of the set a code is, without the word list |
| `loadTileWords`, `tileWords`, `tileWordsReady` | The word list: fetched, handed back, asked after |
| `unpackTileWords`, `unpackLength`, `tileWordsFrom`, `readTileWordsWith` | How a list is read from its packed data, for the loader |
| `mixShown(language)`, `lengthRows(hand?)`, `LENGTHS`, `TRY_IT` | A set and the lengths of game as a page shows them |

## Playing, and a game kept

The moves are in [Playing](#playing) above. With them:

| Export | What it does |
| --- | --- |
| `tilesLeft(play)` | How many tiles are still in the bag |
| `encodeTileProgress(play)`, `readTileProgress(code)`, `decodeTileProgress(code, bag, language?)` | A game half way as one string; its shape read; and opened again on its own bag |
| `kumimojiToJSON(saved)`, `kumimojiFromJSON(text)`, `kumimojiExported(saved)` | A game as JSON, and back, or `null` |
| `kumimojiToText(saved, strings?)`, `gridToText(tiles, language?)`, `kumimojiClock(ms)` | A game, a grid and a time as text |
| `KUMIMOJI_EXPORT_FORMAT`, `KUMIMOJI_VERSION` | The JSON's format number, and this package's version |
| `KUMIMOJI_STRINGS`, `kumimojiStrings(locale, own?)`, `kumimojiSay(line, values)` | The table's words in English and Japanese |

## A table of players

| Export | What it does |
| --- | --- |
| `startParty(settings, bag, seats)` | A table dealt: two to eight seats, each a name or `{ name, computer }` |
| `seatPlay(game)`, `withSeatPlay(game, play)` | The player to move's hand and table as a `TilePlay`, and the game with it put back |
| `endTurn(game, verdict, handSpells)`, `doneRefused(…)` | End the turn; why Done is refused, if it is |
| `drawAll(game)`, `mayDrawAll(game, verdict)` | Everyone draws together |
| `resign(game)`, `mayResign(game)` | Give up the game |
| `joinParty(game, seat)`, `joinRefused(game)`, `leaveParty(game, at)`, `leaveRefused(game, at)` | Joining and leaving a game under way |
| `isOver(game)`, `winnersOf(game)`, `goesOut(game, verdict)`, `isLastTurn(game)`, `lastStanding(game)` | How the game stands and ends |
| `mayTradeThisTurn(game)`, `mustTradeFirst(game, handSpells)`, `laidThisTurn(game)`, `handCanSpell(hand, words)` | What this turn may and must do |
| `nameOf(game, at)`, `tidyName(name)`, `computerName(players)`, `isComputer(game, at)` | Names, and whether a seat is a computer's |
| `stillIn(game)`, `nextIn(game, from)`, `partyTilesLeft(game)`, `tilesHeldBy(game, at)`, `tableTally(tiles)` | Who is in, whose turn is next, and the tiles |
| `partyTilesNeeded`, `partyFits`, `partyLength`, `partyPlayersAsked` | Whether a bag is big enough for a table, for a set-up screen |
| `passViewStart(game)`, `stepView(game, from, by)` | Whose table a shared screen shows |
| `encodeParty(game)`, `decodeParty(code, familyKey?)`, `readSettings(value)`, `holdsItsBag(game, familyKey)`, `isPartyFor` | A table kept as text, read back and checked, and matched to the set-up it was dealt for |
| `afterComputerTurn(game, words)`, `planComputerTurn(game, words)`, `COMPUTER_STEPS_MOST` | A computer seat's turn, whole or step by step |
| `bestLaying(play, words, rules?)`, `tradeChoice(hand, words)`, `judgeTiles(tiles, words, rules?)` | What the computer would lay, and trade |

## Looking at the table

A table with no edges is looked at through a view, which the package keeps
apart from the game: `tableArea`, `fitView`, `fittedMost`, `zoomView`,
`panView`, `keepInReach`, `overflows`, `squareUnder`, `edgePan` and the
numbers in `TABLE`. A player may turn the table a quarter at a time with every
tile kept upright: `nextTurn`, `turnPlace`, `unturnPlace`, `turnArea`,
`turnView`, `typingWay` and `arrowStep`.

The types are `TilePlay`, `Tiles`, `GridVerdict`, `GridRules`, `Run`,
`RunLine`, `Bounds`, `Square`, `CrossingFit`, `KumimojiDeal`,
`KumimojiOptions`, `KumimojiCheck`, `KumimojiLevel`, `KumimojiLength`,
`KumimojiLanguage`, `TileWords`, `TileFaceOf`, `PartyGame`, `PartySettings`,
`PartyPlayer`, `PartySeat`, `PartyEnding`, `JoinRefusal`, `LeaveRefusal`,
`ComputerStep`, `ComputerSaid`, `KumimojiSaved`, `KumimojiExported`, `KumimojiStrings`,
`KumimojiLocale`, `Random`, `Turn`, `Area`, `View`, `MixTile`, `MixShown` and
`LengthRow`.

## The table

`mountKumimoji(element, options?)` from `@johnmorrisdotca/kumimoji/ui` deals
and plays a whole game alone in the element, and returns a handle.

| Option | Default | What it does |
| --- | --- | --- |
| `language` | `"english"` | The language of the tiles: `"english"` or `"japanese"` |
| `hand` | `7` | The opening hand: 3, 7 or 11 tiles |
| `level` | `"medium"` | Wild tiles: `"easy"` the most, `"medium"` some, `"hard"` none |
| `gameLength` | `"short"` | `"short"`, `"medium"`, or `"full"`, all 144 tiles |
| `diagonals` | `false` | Every diagonal run of three or more must be a word too |
| `seed` | a new one each game | The seed the bag is dealt from |
| `onFinish` | | Called when the last tile is laid and every run is a word, with the time it took |
| `onChange` | | Called after every change, with the game as it would be saved |
| `locale` | the page's `lang` | The language of the table's words: `"en"` or `"ja"` |
| `strings` | | Words of your own, laid over the locale's |
| `theme` | | CSS variables set on the table itself |
| `keep` | `true` | Whether the table offers saving and loading |

| Handle | What it does |
| --- | --- |
| `play()` | The game as it stands, or `null` while it is being dealt |
| `saved()` | The game as it would be saved, or `null` while it is being dealt |
| `newGame(options?)` | A new game; any of the first six options may change |
| `setGame(saved)` | Put a game on the table: one read back by `kumimojiFromJSON` |
| `setLocale(locale, strings?)` | Change the language of the table's words |
| `destroy()` | Take the table off the page and stop its clock |

To play it: tap a tile in your hand and then a square to lay it; tap a tile on
the table and then a square to move it, or tap it again to take it back. A
wild is given its letter before it is laid. To draw a board yourself, the same
entry has `boardModel(tiles, verdict, glyphOf?)`, which works out the squares
to draw and how each tile stands, with `BOARD_MARGIN` and `BOARD_LEAST`, and
`KUMIMOJI_STYLE`, the table's stylesheet as a string.

## The element

`<kumimoji-table>` is `mountKumimoji` as a tag: `@johnmorrisdotca/kumimoji/element/define`
defines it, and `@johnmorrisdotca/kumimoji/element` holds the class alone. Each
attribute is read again when it changes, and a change to any but `lang` deals a
new game. A table the rules do not offer (a hand of 5, say) draws nothing.

| Attribute | Default | What it does |
| --- | --- | --- |
| `language` | `english` | The tiles: `english` or `japanese` kana |
| `hand` | `7` | The opening hand: 3, 7 or 11 |
| `level` | `medium` | Wild tiles: `easy` the most, `medium` some, `hard` none |
| `length` | `short` | `short`, `medium` or `full`, all 144 tiles |
| `diagonals` | off | `on` to read every diagonal run of three or more too |
| `seed` | a new one each game | A whole number to deal from, or `daily` for the day's seed |
| `lang` | the page's | The language of the table's words: `en` or `ja` |
| `keep` | on | `off` leaves saving and loading out |

It fires `kumimoji-change` after every change to the game, with the game as it
would be saved as `event.detail.saved`, and `kumimoji-finish` when the last
tile is laid and every run is a word, with the deal, the play and the time it
took as `event.detail`; both bubble. It has `saved` (the game as it would be
saved), `table` (the handle `mountKumimoji` returns), `newGame(options?)` and
`setGame(saved)`. To style it, set the table's variables on `kumimoji-table
.km-root`: see [Theming](#theming).
