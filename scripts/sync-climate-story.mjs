// Copies the climate story (github.com/rashmibaur/climate-vulnerability-story) into this site so it renders inline on /climate-vulnerability/.
// Usage: node scripts/sync-climate-story.mjs "<path to the story folder>"   then   npm run build
// - assets and data go to climate-story/ (absolute paths, so the page works with or without a trailing slash)
// - the story's CSS is scoped under #climate-story so it can't restyle the rest of the page
// - the story's body markup and inline scripts become content/climate-vulnerability.html
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import prefixer from "postcss-prefix-selector";

const src = path.resolve(process.argv[2] || "");
if (!fs.existsSync(path.join(src, "index.html"))) throw new Error("pass the story folder, e.g. node scripts/sync-climate-story.mjs ../story");
const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "climate-story");
const BASE = "/climate-story/";

const data = ["aggregated region.csv", "data_countries.json", "data_regions.json", "expenditure countries.csv", "income wise expenditure.csv", "nd gain matrix new.csv", "ratification country marker.csv", "ratification totals.csv", "social protection countries.csv", "social protection totals.csv", "vulnerability countries.csv"];
const pngs = ["5.1", "6.1", "6.5", "6.6", "poverty_loop", "resilient_recovery"];

fs.rmSync(out, { recursive: true, force: true });
for (const d of ["css", "js", "assets/icons", "assets/png"]) fs.mkdirSync(path.join(out, d), { recursive: true });
for (const f of data) fs.copyFileSync(path.join(src, f), path.join(out, f));
fs.copyFileSync(path.join(src, "js/app.js"), path.join(out, "js/app.js"));
for (const f of fs.readdirSync(path.join(src, "assets/icons"))) fs.copyFileSync(path.join(src, "assets/icons", f), path.join(out, "assets/icons", f));
for (const n of pngs) fs.copyFileSync(path.join(src, "assets/png", `${n}.png`), path.join(out, "assets/png", `${n}.png`));

const css = ["css/styles.css", "css/newspaper.css"].map((f) => fs.readFileSync(path.join(src, f), "utf8")).join("\n");
const scoped = await postcss([prefixer({
  prefix: "#climate-story",
  transform: (prefix, sel, prefixed) => (/^(html|body|:root)(?![\w-])/.test(sel) ? sel.replace(/^(html|body|:root)/, prefix) : prefixed),
})]).process(css, { from: undefined });
// the portfolio's case.css h1 rules (max-width, colour) would otherwise leak into the story title
fs.writeFileSync(path.join(out, "css/story.css"), scoped.css + "\n#climate-story h1 { max-width: none; }\n");

const html = fs.readFileSync(path.join(src, "index.html"), "utf8");
const head = html.slice(0, html.indexOf("</head>"));
const fonts = head.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
const libs = [...head.matchAll(/<script src="https:[^>]*><\/script>/g)].map((m) => m[0]);
let body = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
body = body
  .replace(/(src|href)="(?:js|assets)\//g, (_, a) => `${a}="${BASE}${_.includes("js/") ? "js/" : "assets/"}`)
  .replace(/(["'`(])assets\//g, `$1${BASE}assets/`)
  .replace(/fetch\((['"`])(?!https?:|\/)/g, `fetch($1${BASE}`);
const left = [...body.matchAll(/(?:fetch\(|src=|href=)['"`](?!https?:|\/|#|mailto)[^'"`]+['"`]/g)].map((m) => m[0]);
if (left.length) console.warn("relative paths left:", left);

fs.writeFileSync(path.join(root, "content/climate-vulnerability.html"),
  `${fonts}\n<link rel="stylesheet" href="${BASE}css/story.css?v=${Date.now()}">\n${libs.join("\n")}\n<div id="climate-story">${body}</div>\n`);
console.log("synced", data.length, "data files,", pngs.length, "images");
