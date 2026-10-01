// Proves the claim in the README: the packed package works in React, Vue, Svelte, Angular and a
// plain page, with nothing for the consumer to configure. The code it builds is the README's own:
// each example under "Use it in your project" is lifted from the page as it is written, so what a
// reader copies is what was proved. It packs the package, makes a small project for each in a
// scratch folder, installs the tarball and each framework's own tools there (never here: the
// package has no dependencies), and builds it. With KUMIMOJI_BROWSER=1 it
// also opens each built page in Chromium and WebKit and lays a tile by tapping.
//
//   pnpm build && KUMIMOJI_BROWSER=1 node scripts/check-frameworks.mjs [scratch folder]
//
// Run it before a release that names a framework. It needs the network and a few minutes.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import process from "node:process";

const root = resolve(process.argv[2] ?? mkdtempSync(join(tmpdir(), "kumimoji-frameworks-")));
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const run = (cwd, command, args) => execFileSync(command, args, { cwd, stdio: "pipe", shell: process.platform === "win32", env: { ...process.env, NG_CLI_ANALYTICS: "false" } }).toString();
const write = (dir, files) => {
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), typeof text === "string" ? text : JSON.stringify(text, null, 2));
  }
};

run(process.cwd(), "npm", ["pack", "--ignore-scripts", "--pack-destination", root]);
const tarball = join(root, readdirSync(root).find((name) => name.endsWith(".tgz")));
const kumimoji = `file:${tarball}`;
const page = (script) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>kumimoji</title></head><body><div id="app"></div>${script}</body></html>`;
// The README's examples, by the heading each stands under.
const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
function example(heading, lang) {
  const from = readme.indexOf(heading);
  const found = from < 0 ? null : new RegExp("^```" + lang + "\\n([\\s\\S]*?)^```$", "m").exec(readme.slice(from));
  if (found === null) throw new Error(`the README has no ${lang} example under “${heading}”`);
  return found[1];
}
// A page with no bundler imports the published files by their path.
const unbundled = (code) =>
  code
    .replaceAll('"@johnmorrisdotca/kumimoji/ui"', '"./kumimoji/dist/ui.js"')
    .replaceAll('"@johnmorrisdotca/kumimoji"', '"./kumimoji/dist/index.js"')
    .replaceAll("https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kumimoji@1/dist/element-define.js", "./kumimoji/dist/element-define.js");

const projects = {
  // The table in a component's mount hook, which is all any framework needs.
  vue: {
    out: "dist",
    files: {
      "package.json": { name: "check-vue", private: true, type: "module", dependencies: { "@johnmorrisdotca/kumimoji": kumimoji, vue: "^3.5.0" }, devDependencies: { vite: "^7.0.0", "@vitejs/plugin-vue": "^6.0.0" } },
      "vite.config.js": `import vue from "@vitejs/plugin-vue";\nexport default { base: "./", plugins: [vue()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.js"></script>`),
      "src/main.js": `import { createApp } from "vue";\nimport App from "./App.vue";\ncreateApp(App).mount("#app");\n`,
      "src/App.vue": example("### 5. Vue", "vue"),
    },
  },
  svelte: {
    out: "dist",
    files: {
      "package.json": { name: "check-svelte", private: true, type: "module", dependencies: { "@johnmorrisdotca/kumimoji": kumimoji, svelte: "^5.0.0" }, devDependencies: { vite: "^7.0.0", "@sveltejs/vite-plugin-svelte": "^6.0.0" } },
      "vite.config.js": `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { base: "./", plugins: [svelte()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.js"></script>`),
      "src/main.js": `import { mount } from "svelte";\nimport App from "./App.svelte";\nmount(App, { target: document.getElementById("app") });\n`,
      "src/App.svelte": example("### 6. Svelte", "svelte"),
    },
  },
  angular: {
    out: "dist/check-angular/browser",
    files: {
      "package.json": {
        name: "check-angular",
        private: true,
        dependencies: { "@johnmorrisdotca/kumimoji": kumimoji, "@angular/common": "^20.0.0", "@angular/compiler": "^20.0.0", "@angular/core": "^20.0.0", "@angular/platform-browser": "^20.0.0", rxjs: "^7.8.0", tslib: "^2.8.0" },
        devDependencies: { "@angular/build": "^20.0.0", "@angular/cli": "^20.0.0", "@angular/compiler-cli": "^20.0.0", typescript: "~5.8.0" },
      },
      "angular.json": {
        version: 1,
        projects: {
          "check-angular": {
            projectType: "application",
            root: "",
            sourceRoot: "src",
            architect: { build: { builder: "@angular/build:application", options: { outputPath: "dist/check-angular", index: "src/index.html", browser: "src/main.ts", tsConfig: "tsconfig.json", baseHref: "./" }, configurations: { production: {} }, defaultConfiguration: "production" } },
          },
        },
      },
      "tsconfig.json": { compilerOptions: { target: "ES2022", module: "ES2022", moduleResolution: "bundler", strict: true, experimentalDecorators: true, skipLibCheck: true, lib: ["ES2022", "dom"] }, files: ["src/main.ts"] },
      "src/index.html": page(`<app-root></app-root>`),
      "src/main.ts": example("### 7. Angular", "typescript"),
    },
  },
  // The table as a component, and the grid alone under a board of the page's own.
  react: {
    out: "dist",
    board: true,
    files: {
      "package.json": { name: "check-react", private: true, type: "module", dependencies: { "@johnmorrisdotca/kumimoji": kumimoji, react: "^19.0.0", "react-dom": "^19.0.0" }, devDependencies: { vite: "^7.0.0", "@vitejs/plugin-react": "^5.0.0" } },
      "vite.config.js": `import react from "@vitejs/plugin-react";\nexport default { base: "./", plugins: [react()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.jsx"></script>`),
      "src/App.jsx": example("### 4. React", "jsx"),
      "src/Board.jsx": example("### The React components", "jsx"),
      "src/main.jsx": `import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { Board } from "./Board.jsx";

createRoot(document.getElementById("app")).render(
  <>
    <App />
    <div id="board"><Board /></div>
  </>,
);
`,
    },
  },
  // No framework and no bundler: a script tag and the files as they are published.
  plain: {
    out: ".",
    build: (dir) => {
      run(dir, "npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts"]);
      cpSync(join(dir, "node_modules/@johnmorrisdotca/kumimoji"), join(dir, "kumimoji"), { recursive: true, dereference: true });
      rmSync(join(dir, "node_modules"), { recursive: true, force: true });
    },
    also: ["quick.html", "themed.html", "tag.html"],
    files: {
      "package.json": { name: "check-plain", private: true, dependencies: { "@johnmorrisdotca/kumimoji": kumimoji } },
      "index.html": page(unbundled(example("### 2. The table, in plain HTML", "html"))),
      // The two other examples that mount a table: the one in "Play in 30 seconds", and the themed one.
      "quick.html": page(`<div id="table"></div><script type="module">${unbundled(example("## Play in 30 seconds", "js"))}</script>`),
      "themed.html": page(`<div id="table"></div><script type="module">${unbundled(example("## Theming", "js"))}</script>`),
      // The tag, as the README writes it: two tables on one page, with no script of the page's own.
      "tag.html": page(unbundled(example("### 3. As a tag", "html"))),
    },
  },
};

const only = process.env.KUMIMOJI_FRAMEWORKS?.split(",");
const built = [];
for (const [name, project] of Object.entries(projects)) {
  if (only !== undefined && !only.includes(name)) continue;
  const dir = join(root, name);
  write(dir, project.files);
  const started = Date.now();
  try {
    if (project.build !== undefined) project.build(dir);
    else {
      run(dir, "npm", ["install", "--no-audit", "--no-fund"]);
      run(dir, "npx", name === "angular" ? ["ng", "build"] : ["vite", "build"]);
    }
    if (!existsSync(join(dir, project.out, "index.html"))) throw new Error(`no index.html in ${project.out}`);
    built.push([name, join(dir, project.out), project]);
    console.log(`built   ${name.padEnd(8)} in ${Math.round((Date.now() - started) / 1000)} s`);
  } catch (error) {
    console.log(`FAILED  ${name}: ${String(error.stderr ?? error.stdout ?? error.message).split("\n").slice(-12).join("\n")}`);
    process.exitCode = 1;
  }
}

// Open each built page in a browser and play: the table has to mount, fetch its word list as a file
// of its own, deal a hand, and a tap on a tile and then on a square has to lay it and hand the game back.
if (process.env.KUMIMOJI_BROWSER !== undefined) {
  const { chromium, webkit } = createRequire(import.meta.url)(process.env.KUMIMOJI_BROWSER === "1" ? "@playwright/test" : process.env.KUMIMOJI_BROWSER);
  const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json" };
  const ROOT = '[data-testid="km-root"]';
  for (const [engine, launcher] of [["chromium", chromium], ["webkit", webkit]]) {
    const browser = await launcher.launch();
    for (const [name, out, project] of built) {
      const context = await browser.newContext({ viewport: { width: 390, height: 800 } });
      const tab = await context.newPage();
      const errors = [];
      const fetched = [];
      tab.on("pageerror", (error) => errors.push(String(error)));
      await tab.route("http://check.test/**", (route) => {
        let file = join(out, decodeURIComponent(new URL(route.request().url()).pathname));
        if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
        if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
        fetched.push(statSync(file).size);
        return route.fulfill({ body: readFileSync(file), contentType: types[extname(file)] ?? "application/octet-stream" });
      });
      await tab.goto("http://check.test/");
      await tab.waitForSelector(`${ROOT}[data-state="playing"]`, { timeout: 60000 });
      await tab.waitForFunction(() => document.getElementById("left").textContent === "7", null, { timeout: 5000 });
      // A tile that is not a wild, which would ask for its letter first; then the first empty square.
      await tab.locator(`${ROOT} [data-hand]:not([data-tile="*"])`).first().click();
      await tab.locator(`${ROOT} .km-square:not(.km-tile)`).first().click();
      await tab.waitForFunction(() => document.getElementById("left").textContent === "6", null, { timeout: 5000 });
      const laid = await tab.locator(`${ROOT} .km-board .km-tile`).count();
      // The word list came as a file of its own, the largest the page fetched: the English list is about 600 kB.
      const largest = Math.max(...fetched);
      const notes = [];
      // The grid alone, where a project draws one beside the table: a press on an empty square lays a tile there.
      if (project.board === true) {
        await tab.waitForSelector("#board [data-square]");
        await tab.locator("#board [data-square]").first().click();
        const drawn = await tab.locator("#board [data-square]").evaluateAll((squares) => squares.filter((square) => square.textContent !== "").length);
        notes.push(`KumimojiBoard drew ${drawn} tile after a press`);
        if (drawn !== 1) errors.push("the board did not lay a tile");
      }
      // The pages that only mount a table: it has to come up, and wear what it was given.
      for (const other of project.also ?? []) {
        await tab.goto(`http://check.test/${other}`);
        await tab.waitForSelector(`${ROOT}[data-state="playing"]`, { timeout: 60000 });
        const felt = await tab.locator(ROOT).first().evaluate((el) => el.style.getPropertyValue("--km-felt"));
        notes.push(`${other} dealt${felt === "" ? "" : ` on a table of ${felt}`}`);
        if (other === "themed.html" && felt !== "#23405a") errors.push("the theme was not set on the table");
        if (other === "tag.html") {
          await tab.waitForFunction(() => document.querySelectorAll('kumimoji-table [data-testid="km-root"][data-state="playing"]').length === 2, null, { timeout: 60000 });
          const kana = await tab.locator("kumimoji-table.km-japanese, kumimoji-table .km-japanese").count();
          if (kana !== 1) errors.push(`the tags dealt ${kana} tables of kana, not one`);
        }
      }
      const ok = errors.length === 0 && laid === 1 && largest > 500_000 && fetched.length >= 2;
      console.log(`${ok ? "played " : "FAILED "} ${name.padEnd(8)} in ${engine}: a hand of 7 dealt, a tap laid ${laid} tile and the game was handed back; the word list came as a file of its own (${Math.round(largest / 1000)} kB of ${fetched.length} files)${notes.map((note) => `; ${note}`).join("")}${errors.length > 0 ? ` ${errors.join("; ")}` : ""}`);
      if (!ok) process.exitCode = 1;
      await context.close();
    }
    await browser.close();
  }
}
console.log(`scratch projects are in ${root}`);
