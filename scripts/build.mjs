// Builds <slug>/index.html for every project that has content/<slug>.html.
// In a content file, <img data-src="03" data-crop="x,y,w,h" alt="..."> points at src-img/<slug>/03.png
// and becomes a cropped, resized WebP in img/<slug>/.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { charts as metroCharts } from "./charts.mjs";
import { biasCharts } from "./bias-charts.mjs";
import { shellViz } from "./shell-charts.mjs";
import { mbtiPortraits } from "./mbti-viz.mjs";
import { ktComponents } from "./kt-components.mjs";
const charts = { ...metroCharts, ...biasCharts, shellViz, mbtiPortraits, ktComponents };

const root = path.resolve(import.meta.dirname, "..");
const projects = JSON.parse(fs.readFileSync(path.join(root, "content/projects.json"), "utf8"));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function findSource(slug, name) {
  const dir = path.join(root, "src-img", slug);
  const file = fs.readdirSync(dir).find((f) => f.replace(/\.[^.]+$/, "") === name);
  if (!file) throw new Error(`missing src-img/${slug}/${name}`);
  return path.join(dir, file);
}

// makes the near-white background that touches the image edge transparent (inner whites stay)
async function knockOutWhite(img) {
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info, seen = new Uint8Array(w * h), stack = [];
  const white = (i) => data[i * 4] > 244 && data[i * 4 + 1] > 244 && data[i * 4 + 2] > 244;
  const push = (x, y) => { const i = y * w + x; if (!seen[i] && white(i)) { seen[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i - x) / w;
    data[i * 4 + 3] = 0;
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function processImages(slug, html) {
  const tags = [...html.matchAll(/<img\b[^>]*data-src="([^"]+)"[^>]*>/g)];
  for (const [tag, name] of tags) {
    const sc = +(tag.match(/data-sc="([\d.]+)"/)?.[1] || 1);
    const crop = tag.match(/data-crop="(\d+),(\d+),(\d+),(\d+)"/)?.slice(1).map((v) => Math.round(Number(v) * sc));
    const q = +(tag.match(/data-q="(\d+)"/)?.[1] || 82);
    const trim = / data-trim/.test(tag);
    const alpha = / data-alpha/.test(tag);
    const wide = +(tag.match(/data-w="(\d+)"/)?.[1] || 1600);
    const out = `img/${slug}/${name}${crop ? "_" + crop.join("_") : ""}${wide !== 1600 ? "_w" + wide : ""}${trim ? "_t" : ""}${alpha ? "_a" : ""}${q !== 82 ? "_q" + q : ""}.webp`;
    const outPath = path.join(root, out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    let img = sharp(findSource(slug, name));
    if (trim) img = sharp(await img.trim({ background: "#ffffff", threshold: 14 }).toBuffer());
    if (crop) img = img.extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] });
    if (alpha) img = sharp(await knockOutWhite(img));
    const buf = await img.resize({ width: wide, withoutEnlargement: true }).webp({ quality: q, alphaQuality: 100 }).toBuffer({ resolveWithObject: true });
    fs.writeFileSync(outPath, buf.data);
    let fixed = tag
      .replace(/ data-src="[^"]*"/, "")
      .replace(/ data-crop="[^"]*"/, "")
      .replace(/ data-w="[^"]*"/, "")
      .replace(" data-trim", "")
      .replace(" data-alpha", "")
      .replace(/ data-sc="[^"]*"/, "")
      .replace(/ data-q="[^"]*"/, "")
      .replace("<img", `<img src="/${out}" width="${buf.info.width}" height="${buf.info.height}" loading="lazy" decoding="async"`);
    if (/ data-open/.test(tag)) fixed = `<a class="zoom" href="/${out}" target="_blank" rel="noopener" title="Open full size">${fixed.replace(" data-open", "")}</a>`;
    html = html.replace(tag, fixed);
  }
  return html;
}

function page(p, body, next) {
  const meta = Object.entries(p.meta).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
  const impact = p.impact ? `<div class="impact">${p.impact.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join("")}</div>${p.impact_note ? `<p class="impact-note">${esc(p.impact_note)}</p>` : ""}` : "";
  // hero media: the same video the homepage card plays, or an auto-advancing slider of the card's images; otherwise a blank slot to fill later
  const m = p.media;
  const video = m?.video
    ? `<div class="hero-media"${m.ar ? ` style="aspect-ratio:${m.ar}"` : ""}><video src="${m.video}"${m.poster ? ` poster="${m.poster}"` : ""} autoplay muted loop playsinline preload="metadata" aria-label="${esc(p.title)} preview"></video></div>`
    : m?.slides
      ? `<div class="hero-media slider" data-slider role="img" aria-label="${esc(p.title)} preview">${m.slides.map((s, i) => `<img src="${s}" alt=""${i ? ` loading="lazy"` : ""}${i ? "" : ` class="on"`}>`).join("")}</div>
<script>(()=>{const s=document.querySelector("[data-slider]");if(!s||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const i=[...s.children];let n=0;setInterval(()=>{i[n].classList.remove("on");n=(n+1)%i.length;i[n].classList.add("on")},3500)})()</script>`
      : p.video ? `<div class="video-slot" aria-hidden="true"></div>` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.title)} · Rashmi Baur</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@300;400;500;600;800&family=Open+Sans:wght@400;700&family=Manrope:wght@300;800&family=Poppins:wght@400&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap" rel="stylesheet">
<link rel="icon" href="/f/sites/icons/default-favicon-light.v1.png">
<link rel="stylesheet" href="/css/case.css?v=${Date.now()}">
<script src="/js/charts.js?v=${Date.now()}" defer></script>
<script src="/js/steps.js?v=${Date.now()}" defer></script>${p.progress ? `
<script src="/js/progress.js?v=${Date.now()}" defer></script>` : ""}
<style>:root{--accent:${p.accent};--tint:${p.tint};${p.dark ? `--dark:${p.dark};` : ""}}</style>
</head>
<body${p.progress ? " data-progress" : ""}>
<header class="bar">
  <nav><a href="/">Home</a><i></i><a href="/#selected-works">Projects</a></nav>
  <span class="crumb">/Project/ ${esc(p.title)}</span>
</header>
<main>
  <section class="hero">
    <div class="wrap">
      <ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <h1>${esc(p.title)}</h1>
      <p class="lede">${esc(p.desc)}</p>
      ${meta ? `<dl class="meta">${meta}</dl>` : ""}
      ${impact}
    </div>
  </section>
  <div class="wrap">${video}</div>
${body}
</main>
<footer class="foot">
  <div class="wrap">
    <a class="next" href="/${next.slug}"><span>Next project</span><b>${esc(next.title)}</b></a>
    <p><a href="mailto:rashmibaur@gmail.com">rashmibaur@gmail.com</a> · +91-9955973213</p>
  </div>
</footer>
</body>
</html>
`;
}

// short clip for a section: media/<slug>/<name>.mp4 if it exists, otherwise a blank box to fill later
function clip(slug, name) {
  const f = ["mp4", "webm"].find((e) => fs.existsSync(path.join(root, "media", slug, `${name}.${e}`)));
  return f
    ? `<video class="fx-clip" src="/media/${slug}/${name}.${f}" autoplay muted loop playsinline preload="metadata"></video>`
    : `<div class="fx-clip" role="img" aria-label="Short clip of this chart, to be added"></div>`;
}

let built = 0;
for (const [i, p] of projects.entries()) {
  const src = path.join(root, "content", `${p.slug}.html`);
  if (!fs.existsSync(src)) { console.log(`skip ${p.slug} (no content yet)`); continue; }
  const body = await processImages(p.slug, fs.readFileSync(src, "utf8").replace(/<!--chart:(\w+)-->/g, (_, n) => charts[n]()).replace(/<!--clip:([\w-]+)-->/g, (_, n) => clip(p.slug, n)));
  const next = projects[(i + 1) % projects.length];
  fs.mkdirSync(path.join(root, p.slug), { recursive: true });
  fs.writeFileSync(path.join(root, p.slug, "index.html"), page(p, body, next));
  built++;
  console.log(`built ${p.slug}`);
}
console.log(`${built}/${projects.length} pages`);
