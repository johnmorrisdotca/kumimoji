# The React components: props

From [the README's section on the React components](../README.md#the-react-components), with the props of `KumimojiBoard` and `KumimojiTable`.

| `KumimojiBoard` prop | What it does |
| --- | --- |
| `tiles` | The tiles on the table: `play.tiles` |
| `verdict` | From `judgeWithWords`: rings the runs that are not words and fades the tiles apart |
| `glyphOf` | What to print on a tile: `words.glyphOf` for the language played |
| `onSquare` | Called with a square's key when it is pressed, empty or not |
| `held` | A square to ring, such as the one holding a tile picked up |
| `square` | The side of a square in pixels; 36 by default |
| anything else | Passed to the `<div>` |

`KumimojiTable` takes every option of `mountKumimoji` as a prop, and anything
else for its `<div>`. Options are read when it mounts; give it a new `key` to
start over with different ones.
