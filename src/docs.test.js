// The documents that are made from the source, or that quote it, checked against it.
// Plain JavaScript, so that reading files needs no Node types. `pnpm docs:make` rewrites what is made.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { KumimojiTable } from "./element.ts";
import { kumimojiExported, kumimojiToJSON } from "./export.ts";
import { generateKumimoji } from "./generate.ts";
import { squareAt } from "./grid.ts";
import { deal, draw, placeFromHand } from "./play.ts";
import { KUMIMOJI_STRINGS } from "./strings.ts";
import { loadTileWordsFromModule } from "./tileWordsModule.ts";
import { KUMIMOJI_STYLE } from "./ui/style.ts";
import { KUMIMOJI_VERSION } from "./version.ts";

const readme = readFileSync("README.md", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

/** Every fenced block of the README: its language and its text. */
const blocks = [...readme.matchAll(/^```(\w*)\n([\s\S]*?)^```$/gm)].map((found) => ({ lang: found[1], text: found[2] }));

/** The entries of the package, as a block of the README imports them, and the source each one is. */
const ENTRIES = {
  "@johnmorrisdotca/kumimoji/words": "src/words.ts",
  "@johnmorrisdotca/kumimoji/ui": "src/ui.ts",
  "@johnmorrisdotca/kumimoji": "src/index.ts",
};

/**
 * A block of the README as a module that checks itself: its imports point at the source, and every
 * line ending `// → value` becomes a check that the line comes to that value.
 */
function runnable(text) {
  let out = text;
  for (const [name, file] of Object.entries(ENTRIES)) out = out.replaceAll(`from "${name}"`, `from ${JSON.stringify(pathToFileURL(resolve(file)).href)}`).replaceAll(`import "${name}"`, `import ${JSON.stringify(pathToFileURL(resolve(file)).href)}`);
  const lines = out.split("\n").map((line) => {
    const awaited = /^(\s*)await (.+); \/\/ → (.*)$/.exec(line);
    if (awaited !== null) return `__is((await ${awaited[2]}), (${awaited[3]}), ${JSON.stringify(line.trim())});`;
    const named = /^(\s*)(?:const|let) (\w+) = .*; \/\/ → (.*)$/.exec(line);
    if (named !== null) return `${line}\n__is(${named[2]}, (${named[3]}), ${JSON.stringify(line.trim())});`;
    const said = /^(\s*)(.+); \/\/ → (.*)$/.exec(line);
    if (said !== null) return `__is((${said[2]}), (${said[3]}), ${JSON.stringify(line.trim())});`;
    return line;
  });
  return `import { expect as __expect } from "vitest";\nconst __is = (got, want, what) => __expect(got, what).toEqual(want);\n${lines.join("\n")}\n`;
}

describe("the README's examples", () => {
  it("every block is of a kind a check runs, or is a line for a terminal", () => {
    // ts and json here; html, js, jsx, vue, svelte and typescript (Angular) in scripts/check-frameworks.mjs.
    expect([...new Set(blocks.map((block) => block.lang))].sort()).toEqual(["html", "js", "json", "jsx", "sh", "svelte", "text", "ts", "typescript", "vue"]);
  });

  it("every TypeScript example runs, and every value it states is the value it comes to", async () => {
    const dir = join("node_modules", ".kumimoji-docs");
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const examples = blocks.filter((block) => block.lang === "ts");
    expect(examples.length).toBeGreaterThanOrEqual(9);
    let checks = 0;
    for (const [at, block] of examples.entries()) {
      expect(block.text.startsWith("import "), `example ${at + 1} imports what it uses`).toBe(true);
      // Anything that loads a list reads it from this package's files first, as a script would.
      expect(block.text.startsWith('import "@johnmorrisdotca/kumimoji/words";'), `example ${at + 1} imports the words entry first`).toBe(block.text.includes("loadTileWords("));
      const source = runnable(block.text);
      checks += source.split("__is(").length - 1;
      const file = join(dir, `readme-${at + 1}.ts`);
      writeFileSync(file, source);
      await import(/* @vite-ignore */ `${pathToFileURL(resolve(file)).href}?${Date.now()}`);
    }
    expect(checks).toBeGreaterThanOrEqual(35);
  });

  it("the JSON shown is the JSON written", async () => {
    await loadTileWordsFromModule("english");
    const dealt = generateKumimoji(3, "hard", 44);
    let play = deal(dealt.givens, 3);
    play = placeFromHand(play, 0, squareAt(0, 0));
    play = placeFromHand(play, 1, squareAt(0, 1));
    play = placeFromHand(play, 0, squareAt(0, 2));
    play = placeFromHand(draw(play), 0, squareAt(0, -1));
    const shown = blocks.filter((block) => block.lang === "json");
    expect(shown.length).toBe(1);
    expect(shown[0].text).toBe(kumimojiToJSON({ deal: dealt, play, elapsedMs: 65_000 }));
    // Every field of the export is one the README's JSON shows.
    expect(Object.keys(JSON.parse(shown[0].text))).toEqual(Object.keys(kumimojiExported({ deal: dealt, play, elapsedMs: 0 })));
  });

  it("the install lines name this package", () => {
    expect(readme).toContain(`npm install ${pkg.name}`);
    for (const block of blocks.filter((one) => one.lang !== "sh" && one.lang !== "json")) {
      for (const found of block.text.matchAll(/from "(@johnmorrisdotca\/[^"]+)"/g)) expect(Object.keys(ENTRIES).concat("@johnmorrisdotca/kumimoji/react"), block.text).toContain(found[1]);
    }
  });
});

/** The rows of the table under a heading: each row's cells. */
function table(heading) {
  const from = readme.indexOf(heading);
  if (from < 0) throw new Error(`the README has no “${heading}”`);
  const rows = [];
  for (const line of readme.slice(from).split("\n").slice(heading.startsWith("|") ? 0 : 1)) {
    if (line.startsWith("|")) rows.push(line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim()));
    else if (rows.length > 0) break;
  }
  return rows.slice(2);
}

const codes = (text) => [...text.matchAll(/`([^`]+)`/g)].map((found) => found[1]);

describe("the README's tables", () => {
  it("every variable in the theming table is one the stylesheet defines, and none is left out", () => {
    const listed = table("## Theming").flatMap(([names]) => codes(names));
    const defined = [...new Set([...KUMIMOJI_STYLE.matchAll(/(--km-[\w-]+):/g)].map((found) => found[1]))];
    expect(listed.sort()).toEqual(defined.sort());
  });

  it("the light and dark values in the theming table are the stylesheet's", () => {
    const light = /\.km-root \{([\s\S]*?)display:/.exec(KUMIMOJI_STYLE)[1];
    const dark = /prefers-color-scheme: dark\) \{\s*\.km-root \{([^}]*)\}/.exec(KUMIMOJI_STYLE)[1];
    const value = (css, name) => new RegExp(`${name}: ([^;]+);`).exec(css)?.[1];
    for (const [names, , lightCell, darkCell] of table("## Theming")) {
      const variables = codes(names);
      const lights = codes(lightCell);
      const darks = codes(darkCell);
      variables.forEach((name, at) => {
        if (name === "--km-font") return;
        expect(value(light, name), name).toBe(lights[at]);
        if (darks.length > 0) expect(value(dark, name), `${name} in the dark`).toBe(darks[at]);
        else expect(value(dark, name), `${name} is the same in the dark`).toBeUndefined();
      });
    }
  });

  it("every constant and function the tables name is exported", async () => {
    const kumimoji = await import("./index.ts");
    const ui = await import("./ui.ts");
    for (const heading of ["| Rule | Value | Constant |", "| Limit | Value | Constant |"]) {
      const rows = table(heading);
      expect(rows.length).toBeGreaterThan(4);
      for (const row of rows) for (const name of codes(row[2])) expect(kumimoji[name], name).toBeDefined();
    }
    for (const heading of ["| Move | What it does |", "### Dealing and judging", "### Tiles and grids", "### Playing, and a game kept", "| `startParty(settings, bag, seats)`"]) {
      const rows = heading.startsWith("| `") ? table(heading).concat([[heading.split(" | ")[0].slice(2)]]) : table(heading);
      expect(rows.length, heading).toBeGreaterThan(5);
      for (const [names] of rows) {
        for (const code of codes(names)) expect(kumimoji[code.replace(/\(.*$/, "")], code).toBeDefined();
      }
    }
    expect(table("### The day's seed").length, "the day's seed").toBe(2);
    for (const [names] of table("### The day's seed")) for (const code of codes(names)) expect(kumimoji[code.replace(/\(.*$/, "")], code).toBeDefined();
    for (const name of ["mountKumimoji", "boardModel", "BOARD_MARGIN", "BOARD_LEAST", "KUMIMOJI_STYLE"]) {
      expect(readme, name).toContain(`\`${name}`);
      expect(ui[name], name).toBeDefined();
    }
  });

  it("every export of the main entry is named in the README", async () => {
    const kumimoji = await import("./index.ts");
    for (const name of Object.keys(kumimoji)) expect(readme.includes(`\`${name}`), `${name} is documented in the README`).toBe(true);
  });

  it("every type the README lists is one the package exports", () => {
    const listed = codes(/The types are ([\s\S]*?)\n\n/.exec(readme)[1]);
    expect(listed.length).toBeGreaterThan(30);
    const program = ts.createProgram(["src/index.ts"], { allowImportingTsExtensions: true, noEmit: true, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, skipLibCheck: true });
    const checker = program.getTypeChecker();
    const exported = new Set(checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile("src/index.ts"))).map((symbol) => symbol.name));
    for (const name of listed) expect(exported.has(name), name).toBe(true);
  }, 30000);

  it("the element's attributes are the ones listed", () => {
    // `length` is the attribute for the option `gameLength`.
    expect(table("| Attribute | Default | What it does |").map(([name]) => codes(name)[0])).toEqual(KumimojiTable.observedAttributes);
  });

  it("the table's options and handle are the ones listed", () => {
    const source = readFileSync("src/ui/mount.ts", "utf8");
    const fields = (type) => [...new RegExp(`export type ${type} = \\{([\\s\\S]*?)\\n\\};`).exec(source)[1].matchAll(/^ {2}(\w+)\??:/gm)].map((found) => found[1]);
    expect(table("| Option | Default | What it does |").map(([name]) => codes(name)[0])).toEqual(fields("KumimojiTableOptions"));
    expect(table("| Handle | What it does |").map(([name]) => codes(name)[0].replace(/\(.*$/, ""))).toEqual(fields("KumimojiTableHandle"));
  });

  it("the word lists are the sizes the README says, and the licences are said at the top", async () => {
    const english = await loadTileWordsFromModule("english");
    const japanese = await loadTileWordsFromModule("japanese");
    expect(readme).toContain(`${english.allowed.size.toLocaleString("en-US")} words of 2 to 15 letters`);
    expect(readme).toContain(`${japanese.allowed.size.toLocaleString("en-US")} hiragana readings of 2 to 15 kana`);
    const notice = readFileSync("NOTICE.md", "utf8");
    expect(notice).toContain("110,316 words");
    expect(notice).toContain("163,461 hiragana readings");
    expect(notice).toContain("Copyright 2000-2018 by Kevin Atkinson");
    expect(notice).toContain("Creative Commons Attribution-ShareAlike 4.0");
    // The share-alike terms are said before the first heading a reader scrolls to, not only at the foot.
    const top = readme.slice(0, readme.indexOf("## Play in 30 seconds"));
    expect(top).toContain("CC BY-SA 4.0");
    expect(top).toContain("share-alike");
    expect(top).toContain("NOTICE.md");
    expect(pkg.files).toContain("NOTICE.md");
  }, 30000);
});

describe("the documents made from the source", () => {
  it("docs/strings-ja.md lists every string in both languages", () => {
    const cell = (text) => (text === "" ? "*(nothing)*" : text.replace(/\|/g, "\\|").replace(/^ | $/g, "␠"));
    const rows = Object.keys(KUMIMOJI_STRINGS.en).map((name) => `| \`${name}\` | ${cell(KUMIMOJI_STRINGS.en[name])} | ${cell(KUMIMOJI_STRINGS.ja[name])} |`);
    const made = `# Kumimoji's words, in English and Japanese

Made from \`src/strings.ts\` by \`pnpm docs:make\`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. \`{n}\`, \`{time}\` and the other braces are filled in when
shown. ␠ marks a space at the start or end of a string.

| Name | English | Japanese |
| --- | --- | --- |
${rows.join("\n")}
`;
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });
});

describe("the demo's look", () => {
  // The family's stylesheet is one file, the same byte for byte in every sibling package's demo. It is never edited here:
  // a new one is copied in whole, and this hash with it.
  const FAMILY_CSS = "c1e392564a7fd94d0bb5cfaefb6d4fedfd147fc3e27f3a7afd8d8dac8c94a227";

  it("demo/family.css is the family's, unchanged", () => {
    const css = readFileSync("demo/family.css", "utf8");
    const first = css.indexOf("\n");
    expect(css.slice(0, first)).toBe(`/* sha256 of every line after this one: ${FAMILY_CSS} */`);
    expect(createHash("sha256").update(css.slice(first + 1)).digest("hex")).toBe(FAMILY_CSS);
  });

  it("Kumimoji's own stylesheet leaves the family's colours and type alone", () => {
    const own = readFileSync("demo/kumimoji.css", "utf8");
    for (const name of ["--page", "--ink", "--muted", "--rule", "--surface", "--felt", "--accent", "--font", "--mono"]) expect(own, name).not.toMatch(new RegExp(`${name}\\s*:`));
    expect(own).not.toMatch(/font-family/);
  });
});

describe("the package", () => {
  it("KUMIMOJI_VERSION is package.json's, and the changelog has it", () => {
    expect(KUMIMOJI_VERSION).toBe(pkg.version);
    expect(readFileSync("CHANGELOG.md", "utf8")).toContain(`## [${pkg.version}] - `);
    expect(readme).toContain(`"generator": "kumimoji ${pkg.version}"`);
  });

  it("needs Node 22 or later, and says so only that way", () => {
    expect(pkg.engines.node).toBe(">=22");
    expect(readme).not.toMatch(/Node 20/);
    expect(readFileSync("CONTRIBUTING.md", "utf8")).not.toMatch(/Node 20/);
  });

  it("lists every package of the family, with its kana, as the demo's footer does", () => {
    const template = readFileSync("scripts/family-template.mjs", "utf8");
    const family = [...template.matchAll(/\{ id: "([\w-]+)", name: "(\w+)", kana: "([^"]+)" \}/g)].map((match) => ({ id: match[1], name: match[2], kana: match[3] }));
    expect(family.length).toBeGreaterThanOrEqual(16);
    const block = readme.slice(readme.indexOf("### The family"), readme.indexOf("\n## ", readme.indexOf("### The family")));
    for (const { id, name, kana } of family) expect(block, id).toContain(`- [${name}](https://github.com/johnmorrisdotca/${id}) (${kana}`);
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four"];
    expect(block).toContain(`one of ${words[family.length]} packages`);
    expect([...block.matchAll(/^- \[/gm)]).toHaveLength(family.length);
    expect(template).toContain(`{ id: "kumimoji", name: "Kumimoji", kana: "組み文字" }`);
  });

  it("has the files a visitor looks for: issue templates, a pull request template, a security policy, the notice for the word lists", () => {
    for (const file of [".github/ISSUE_TEMPLATE/report-a-bug.md", ".github/ISSUE_TEMPLATE/suggest-a-feature.md", ".github/ISSUE_TEMPLATE/fix-a-translation.md", ".github/ISSUE_TEMPLATE/add-my-project.md", ".github/ISSUE_TEMPLATE/word-list.md", ".github/ISSUE_TEMPLATE/config.yml", ".github/pull_request_template.md", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "LICENSE", "NOTICE.md"]) expect(existsSync(file), file).toBe(true);
    expect(readme).toContain("issues/new?template=word-list.md");
  });

  it("keeps SECURITY.md and CODE_OF_CONDUCT.md equal to the family's master text (the shared .github repository), a copy of which is kept in scripts/community", () => {
    for (const file of ["SECURITY.md", "CODE_OF_CONDUCT.md"]) expect(readFileSync(file, "utf8"), file).toBe(readFileSync(`scripts/community/${file}`, "utf8"));
  });

  it("its description and keywords are fit for npm", () => {
    expect(pkg.description.length).toBeLessThanOrEqual(250);
    expect(new Set(pkg.keywords).size).toBe(pkg.keywords.length);
    for (const keyword of pkg.keywords) expect(keyword, keyword).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it("exports name built files, by the import condition and a default that require() reads too, and nothing is left to publishConfig", () => {
    for (const [entry, conditions] of Object.entries(pkg.exports)) {
      expect(Object.keys(conditions), entry).toEqual(["types", "import", "default"]);
      for (const file of Object.values(conditions)) expect(file, entry).toMatch(/^\.\/dist\//);
    }
    expect(pkg.publishConfig.exports).toBeUndefined();
    expect(pkg.dependencies).toBeUndefined();
    // The words entry and the loader it registers run when imported: a bundler must not drop them.
    expect(pkg.sideEffects).toEqual(["./dist/words.js", "./dist/tileWordsModule.js", "./dist/element-define.js"]);
  });

  it("every export of every entry has a doc comment", () => {
    const entries = ["src/index.ts", "src/ui.ts", "src/react.tsx", "src/words.ts", "src/element.ts"];
    const program = ts.createProgram(entries, { allowImportingTsExtensions: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, skipLibCheck: true });
    const checker = program.getTypeChecker();
    const bare = [];
    let count = 0;
    for (const entry of entries) {
      for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)))) {
        const real = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
        count += 1;
        if (ts.displayPartsToString(real.getDocumentationComment(checker)).trim() === "") bare.push(`${entry}: ${symbol.name}`);
      }
    }
    expect(count).toBeGreaterThan(180);
    expect(bare).toEqual([]);
  }, 30000);
});
