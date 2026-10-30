// Interactive inline-SVG charts for the Unveiling Biases case study.
// Data and formulas are taken from the live dashboard (rashmibaur-bias-ai.vercel.app).
// Hover tooltips: js/charts.js. Attribute dropdowns: js/charts.js ([data-switch]).
import fs from "node:fs";

const BLUE = "#3e63bf", LIGHT = "#93a8dc", GRID = "#e5e7eb", AXIS = "#64748b";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const tip = (rows) => esc(rows.join("|"));
const text = (x, y, s, o = "") => `<text x="${x}" y="${y}" ${o}>${esc(s)}</text>`;

const EN = {
  Gender: [["Male", .85], ["Female", .8], ["Non-Binary", .75], ["Genderqueer", .7], ["Agender", .65], ["Other", .6]],
  Race: [["White", .82], ["Black", .78], ["Asian", .74], ["Hispanic", .7], ["Indigenous", .66], ["Other", .6]],
  Age: [["Adults", .8], ["Teenagers", .75], ["Children", .7], ["Middle-aged", .68], ["Seniors", .62]],
};
const TREND = [["v1.0", .42], ["v1.1", .48], ["v1.2", .52], ["v1.3", .58], ["v2.0", .65], ["v2.1", .7], ["v2.2", .74], ["v2.3", .78], ["v3.0", .85]];
const PROPORTION = {
  Gender: [["Male", 40], ["Female", 35], ["Non-Binary", 15], ["Genderqueer", 5], ["Agender", 5]],
  Race: [["White", 50], ["Black", 20], ["Asian", 15], ["Hispanic", 10], ["Indigenous", 3], ["Other", 2]],
  Age: [["Adults", 50], ["Middle-aged", 20], ["Teenagers", 15], ["Children", 10], ["Seniors", 5]],
  "Geographical region": [["North America", 40], ["Europe", 30], ["Asia", 20], ["Africa", 5], ["South America", 4], ["Other", 1]],
  "Physical appearance": [["Average", 40], ["Slim", 30], ["Plus-size", 20], ["Athletic", 8], ["Other", 2]],
  Culture: [["Western", 50], ["Eastern", 30], ["Indigenous", 10], ["African", 5], ["Other", 5]],
};
const DATASET = { // counts in the uploaded dataset
  Gender: [["Male", 480], ["Female", 430], ["Non-Binary", 60]],
  Race: [["White", 410], ["Black", 220], ["Asian", 180], ["Hispanic", 120], ["Indigenous", 40], ["Other", 30]],
  Age: [["Adults", 380], ["Teenagers", 210], ["Middle-aged", 150], ["Children", 90], ["Seniors", 70]],
};
const WORDS = JSON.parse(fs.readFileSync(new URL("./bias-words.json", import.meta.url), "utf8"));

// ---------- shared pieces ----------
const select = (name, opts, sel, label) => `<label class="cc-sel"><span>${label}</span><select data-switch="${name}" aria-label="${label}">${opts.map((o) => `<option value="${esc(o)}"${o === sel ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
const panels = (name, map, first) => Object.entries(map).map(([k, v]) => `<div class="cc-panel" data-group="${name}" data-key="${esc(k)}"${k === first ? "" : " hidden"}>${v}</div>`).join("");
const card = (title, sub, controls, body, legend = []) => `<div class="chart-card" data-cc>
  <div class="cc-head"><div><h5>${title}</h5><p class="sub">${sub}</p></div>${controls ? `<div class="cc-ctl">${controls}</div>` : ""}</div>
  <div class="plot">${body}</div>
  ${legend.length ? `<div class="legend">${legend.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join("")}</div>` : ""}
</div>`;
const yTicks = (ticks, y, x0, x1, fmt) => ticks.map((t) => `<line x1="${x0}" x2="${x1}" y1="${y(t)}" y2="${y(t)}" stroke="${GRID}"/>${text(x0 - 8, y(t) + 3.5, fmt(t), `text-anchor="end"`)}`).join("");

// ---------- bar chart ----------
function bars(data, yLabel, xLabel, max = 1, fmt = (v) => v.toFixed(2)) {
  const W = 560, H = 300, L = 54, R = 12, T = 14, B = 56, pw = W - L - R, ph = H - T - B, band = pw / data.length, bw = Math.min(44, band - 16);
  const y = (v) => T + ph - (v / max) * ph;
  const g = data.map(([n, v], i) => {
    const cx = L + band * i + band / 2;
    return `<g class="mark" data-tip="${tip([n, `${yLabel}: ${fmt(v)}`])}"><rect x="${L + band * i}" y="${T}" width="${band}" height="${ph}" fill="transparent"/><path d="M${cx - bw / 2},${y(0)}V${y(v) + 3}a3,3 0 0 1 3,-3h${bw - 6}a3,3 0 0 1 3,3V${y(0)}z" fill="${BLUE}"/>${text(cx, y(v) - 6, fmt(v), `text-anchor="middle" font-size="10" fill="${BLUE}" font-weight="700"`)}${text(cx, H - B + 16, n, `text-anchor="middle"`)}</g>`;
  }).join("");
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1].filter((t) => t <= max + 1e-9);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of ${yLabel} by ${xLabel}">${yTicks(ticks, y, L, W - R, (t) => t)}<line x1="${L}" x2="${L}" y1="${T}" y2="${y(0)}" stroke="${AXIS}"/>${g}${text(L + pw / 2, H - 8, xLabel, `text-anchor="middle" font-weight="700"`)}${text(14, T + ph / 2, yLabel, `text-anchor="middle" font-weight="700" transform="rotate(-90 14 ${T + ph / 2})"`)}</svg>`;
}

// ---------- line chart ----------
function line(points, xLabel, yLabel, fmt = (v) => v.toFixed(2)) {
  const W = 560, H = 250, L = 54, R = 20, T = 14, B = 52, pw = W - L - R, ph = H - T - B, max = 1;
  const x = (i) => L + (i / (points.length - 1)) * pw, y = (v) => T + ph - (v / max) * ph;
  const d = points.map(([, v], i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const dots = points.map(([n, v], i) => `<g class="mark" data-tip="${tip([n, `${yLabel}: ${fmt(v)}`])}"><rect x="${x(i) - pw / points.length / 2}" y="${T}" width="${pw / points.length}" height="${ph}" fill="transparent"/><circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="#fff" stroke="${BLUE}" stroke-width="2.5"/>${text(x(i), H - B + 16, n, `text-anchor="middle"`)}</g>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of ${yLabel} across ${xLabel}">${yTicks([0, .2, .4, .6, .8, 1], y, L, W - R, (t) => t)}<path d="${d}" fill="none" stroke="${BLUE}" stroke-width="2.5"/>${dots}${text(L + pw / 2, H - 8, xLabel, `text-anchor="middle" font-weight="700"`)}${text(14, T + ph / 2, yLabel, `text-anchor="middle" font-weight="700" transform="rotate(-90 14 ${T + ph / 2})"`)}</svg>`;
}

// ---------- heatmap (rows x cols), opacity formula as in the dashboard ----------
function heat(rowAttr, colAttr, valueLabel = "") {
  const rows = EN[rowAttr].map((r) => r[0]), cols = EN[colAttr].map((c) => c[0]);
  const rw = (i) => Math.max(.25, 1 - .15 * i), cw = (j) => Math.max(.3, 1 - .12 * j);
  const W = 560, H = 280, L = 92, T = 8, B = 44, R = 8, cwid = (W - L - R) / cols.length, rh = (H - T - B) / rows.length;
  let g = "";
  rows.forEach((r, i) => cols.forEach((c, j) => {
    const a = rw(i) * cw(j);
    g += `<rect class="mark" x="${L + j * cwid}" y="${T + i * rh}" width="${cwid - 2}" height="${rh - 2}" fill="${BLUE}" fill-opacity="${a.toFixed(3)}" data-tip="${tip([`${r} / ${c}`, `${Math.round(a * 100)}%`])}" tabindex="0"/>`;
  }));
  const rl = rows.map((r, i) => text(L - 8, T + i * rh + rh / 2 + 4, r, `text-anchor="end"`)).join("");
  const cl = cols.map((c, j) => text(L + j * cwid + cwid / 2, H - B + 18, c, `text-anchor="middle"`)).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Heatmap of ${rowAttr} by ${colAttr}">${g}${rl}${cl}${text(14, T + (H - T - B) / 2, rowAttr, `text-anchor="middle" font-weight="700" transform="rotate(-90 14 ${T + (H - T - B) / 2})"`)}${text(L + (W - L - R) / 2, H - 6, colAttr, `text-anchor="middle" font-weight="700"`)}</svg>`;
}

export function diversity() {
  const attrs = ["Gender", "Race", "Age"];
  const barPanels = Object.fromEntries(attrs.map((a) => [a, bars(EN[a], "Diversity index", `Attribute – ${a.toLowerCase()}`)]));
  const heatPanels = {};
  for (const r of attrs) for (const c of attrs) heatPanels[`${r}|${c}`] = heat(r, c);
  const first = "Race|Gender";
  const bar = card("Diversity index", "Score by attribute value. Pick an attribute.", select("div-attr", attrs, "Gender", "Attribute"), panels("div-attr", barPanels, "Gender"));
  const trend = card("Historical trend", "Diversity index across model versions.", "", line(TREND, "Version", "Diversity index"));
  const hm = card("Intersectionality explorer", "Two attributes at once. Darker means a higher share.", `${select("hm-row", attrs, "Race", "Rows")}${select("hm-col", attrs, "Gender", "Columns")}`, panels("hm", heatPanels, first));
  return `<div class="cc-grid">${bar}${trend}${hm}</div>`;
}

// ---------- treemap ----------
function squarify(items, x, y, w, h) {
  const scale = (w * h) / items.reduce((t, i) => t + i[1], 0);
  const nodes0 = items.map((it) => ({ it, a: it[1] * scale })); let nodes = nodes0, out = [];
  while (nodes.length) {
    const side = Math.min(w, h);
    const worst = (r) => { const s = r.reduce((t, n) => t + n.a, 0), mx = Math.max(...r.map((n) => n.a)), mn = Math.min(...r.map((n) => n.a)); return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn)); };
    const row = [nodes[0]]; let i = 1;
    while (i < nodes.length && worst([...row, nodes[i]]) <= worst(row)) row.push(nodes[i++]);
    const thick = row.reduce((t, n) => t + n.a, 0) / side; let off = 0;
    for (const n of row) { const len = n.a / thick; out.push(w >= h ? { it: n.it, x, y: y + off, w: thick, h: len } : { it: n.it, x: x + off, y, w: len, h: thick }); off += len; }
    if (w >= h) { x += thick; w -= thick; } else { y += thick; h -= thick; }
    nodes = nodes.slice(row.length);
  }
  return out;
}
function treemap(attr, data) {
  const sorted = data.slice().sort((a, b) => b[1] - a[1]), W = 560, H = 300, max = sorted[0][1], min = sorted[sorted.length - 1][1];
  const tiles = squarify(sorted, 0, 0, W, H).map(({ it: [n, v], x, y, w, h }) => {
    const t = (v - min) / (max - min || 1), ink = t > 0.45 ? "#fff" : "#1e293b", fill = `color-mix(in srgb, ${BLUE} ${Math.round(30 + t * 70)}%, #fff)`;
    return `<g class="mark" data-tip="${tip([n, `${v}% of the baseline`])}"><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="${fill}"/>${w > 60 && h > 36 ? `${text(x + 10, y + 22, n, `fill="${ink}" font-weight="700"`)}${text(x + 10, y + 38, `${v}%`, `fill="${ink}" fill-opacity=".85"`)}` : ""}</g>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Treemap of ${attr}">${tiles}</svg>`;
}
function grouped(attr) {
  const base = Object.fromEntries(PROPORTION[attr]), ds = DATASET[attr], total = ds.reduce((t, d) => t + d[1], 0);
  const rows = ds.map(([n, c]) => [n, base[n] ?? 0, (c / total) * 100]);
  const W = 560, H = 300, L = 54, R = 12, T = 18, B = 56, pw = W - L - R, ph = H - T - B, band = pw / rows.length, bw = Math.min(26, band / 2 - 6), max = 60, y = (v) => T + ph - (v / max) * ph;
  const g = rows.map(([n, b, d], i) => {
    const cx = L + band * i + band / 2, bar = (v, c, dx) => `<rect x="${cx + dx}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" rx="3" fill="${c}"/>`;
    return `<g class="mark" data-tip="${tip([n, `Baseline: ${b}%`, `Dataset: ${d.toFixed(1)}%`])}"><rect x="${L + band * i}" y="${T}" width="${band}" height="${ph}" fill="transparent"/>${bar(b, LIGHT, -bw - 1)}${bar(d, BLUE, 1)}${text(cx, H - B + 16, n, `text-anchor="middle"`)}</g>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Baseline against dataset share by ${attr}">${yTicks([0, 20, 40, 60], y, L, W - R, (t) => `${t}%`)}<line x1="${L}" x2="${L}" y1="${T}" y2="${y(0)}" stroke="${AXIS}"/>${g}${text(L + pw / 2, H - 8, `Attribute – ${attr.toLowerCase()}`, `text-anchor="middle" font-weight="700"`)}${text(14, T + ph / 2, "Share (%)", `text-anchor="middle" font-weight="700" transform="rotate(-90 14 ${T + ph / 2})"`)}</svg>`;
}
export function parity() {
  const all = Object.keys(PROPORTION), three = ["Gender", "Race", "Age"];
  const tm = card("Find your metric", "Share of each group in the baseline. Pick an attribute.", select("pt", all, "Gender", "Attribute"), panels("pt", Object.fromEntries(all.map((a) => [a, treemap(a, PROPORTION[a])])), "Gender"));
  const gb = card("Compare with data", "Baseline against your dataset, side by side.", select("pg", three, "Gender", "Attribute"), panels("pg", Object.fromEntries(three.map((a) => [a, grouped(a)])), "Gender"), [[LIGHT, "Baseline"], [BLUE, "Dataset"]]);
  return `<div class="cc-pair">${tm}${gb}</div>`;
}

// ---------- calibration ----------
const SERIES = {
  Gender: [["Male", "#2563eb", .7], ["Female", "#38bdf8", .85], ["Non-Binary", "#a855f7", 1.3]],
  Race: [["White", "#2563eb", .75], ["Black", "#7c3aed", .6], ["Asian", "#38bdf8", .9], ["Hispanic", "#ec4899", 1.1]],
  "Race × Gender": [["Black Male", "#7c3aed", .55], ["Black Female", "#38bdf8", .85], ["White Male", "#2563eb", .6], ["White Female", "#ec4899", 1]],
};
function calib(key) {
  const W = 520, H = 320, L = 44, R = 12, T = 12, B = 50, pw = W - L - R, ph = H - T - B, x = (v) => L + v * pw, y = (v) => T + ph - v * ph;
  const ser = SERIES[key], lines = ser.map(([n, c, a]) => {
    const pts = Array.from({ length: 10 }, (_, i) => { const l = (i + 1) / 10; return [l, Math.min(1, Math.pow(l, a))]; });
    const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${x(px).toFixed(1)},${y(py).toFixed(1)}`).join("");
    return `<g><path d="${d}" fill="none" stroke="${c}" stroke-width="2.2"/>${pts.map(([px, py]) => `<circle class="mark dot" cx="${x(px)}" cy="${y(py)}" r="4" fill="${c}" data-tip="${tip([n, `Predicted: ${px.toFixed(1)}`, `Actual: ${py.toFixed(2)}`])}" tabindex="0"/>`).join("")}</g>`;
  }).join("");
  const grid = [0, .2, .4, .6, .8, 1].map((t) => `<line x1="${x(t)}" x2="${x(t)}" y1="${T}" y2="${T + ph}" stroke="${GRID}"/><line x1="${L}" x2="${L + pw}" y1="${y(t)}" y2="${y(t)}" stroke="${GRID}"/>${text(x(t), H - B + 16, t, `text-anchor="middle"`)}${text(L - 8, y(t) + 3.5, t, `text-anchor="end"`)}`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Reliability plot of actual against predicted probability for ${key}">${grid}<line x1="${x(0)}" y1="${y(0)}" x2="${x(1)}" y2="${y(1)}" stroke="#94a3b8" stroke-dasharray="5 5"/>${lines}${text(L + pw / 2, H - 8, "Predicted probability", `text-anchor="middle" font-weight="700"`)}${text(12, T + ph / 2, "Actual probability", `text-anchor="middle" font-weight="700" transform="rotate(-90 12 ${T + ph / 2})"`)}</svg>`;
}
export function calibration() {
  const legend = (k) => `<div class="legend">${SERIES[k].map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("")}</div>`;
  const ks = Object.keys(SERIES), first = ["Gender", "Race"];
  const a = card("By attribute", "Dotted line is perfect calibration. Pick an attribute.", select("ca", first, "Gender", "Attribute"), panels("ca", Object.fromEntries(first.map((k) => [k, calib(k) + legend(k)])), "Gender"));
  const b = card("Intersectionality explorer", "Race and gender combined.", "", calib("Race × Gender") + legend("Race × Gender"));
  return `<div class="cc-pair">${a}${b}</div>`;
}

// ---------- word cloud ----------
const CAT = { Gender: "#2563eb", Race: "#e11d48", Age: "#f97316", "Physical appearance": "#0d9488", "Geographical region": "#a855f7", Culture: "#ca8a04" };
export function wordcloud() {
  const W = 640, H = 500, placed = [];
  const words = WORDS.slice().sort((a, b) => b.s - a.s);
  for (const w of words) {
    const fs = 11 + w.s * 4.4, bw = w.w.length * fs * (w.s >= 4 ? 0.62 : 0.57) + 12, bh = fs * 1.15;
    for (let k = 0; k < 12000; k++) {
      const a = k * 0.22, r = 2.2 * a, cx = W / 2 + Math.cos(a) * r * 1.5, cy = H / 2 + Math.sin(a) * r;
      const x0 = cx - bw / 2, y0 = cy - bh / 2;
      if (x0 < 4 || x0 + bw > W - 4 || y0 < 4 || y0 + bh > H - 4) continue;
      if (placed.some((p) => x0 < p.x + p.bw && x0 + bw > p.x && y0 < p.y + p.bh && y0 + bh > p.y)) continue;
      placed.push({ ...w, x: x0, y: y0, bw, bh, cx, cy, fs }); break;
    }
  }
  const t = placed.map((p) => `<text class="mark wc" x="${p.cx.toFixed(1)}" y="${(p.cy + p.fs * 0.34).toFixed(1)}" text-anchor="middle" font-size="${p.fs.toFixed(1)}" font-weight="${p.s >= 4 ? 700 : 500}" fill="${CAT[p.c]}" data-tip="${tip([p.w, `${p.c}: ${p.t}`])}" tabindex="0">${esc(p.w)}</text>`).join("");
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Word cloud of descriptive words, coloured by attribute category">${t}</svg>`;
  return card("Word cloud", "Size shows how often a word appears. Colour shows which attribute it is tied to.", "", svg, Object.entries(CAT).map(([n, c]) => [c, n]));
}
export function cooccur() {
  const attrs = ["Gender", "Race", "Age"];
  const hp = {}; for (const r of attrs) for (const c of attrs) hp[`${r}|${c}`] = heat(r, c);
  return card("Co-occurrence heatmap", "How often two attributes appear together.", `${select("co-row", attrs, "Race", "Rows")}${select("co-col", attrs, "Gender", "Columns")}`, panels("co", hp, "Race|Gender"));
}
export function words() { return `<div class="cc-pair">${wordcloud()}${cooccur()}</div>`; }


// ---------- counterfactual fairness: image galleries ----------
const CF = JSON.parse(fs.readFileSync(new URL("./cf-photos.json", import.meta.url), "utf8"));
const CFMODE = { model: { title: "Parent holding a child", note: "Images from the prompt, grouped by gender, then by gender and race.", defaults: ["Gender - Female", "Gender - Female > Race - Black"] }, dataset: { title: "Teacher", note: "Images from the dataset for one word, grouped by gender, then by gender and race.", defaults: ["Gender - Female", "Gender - Female > Race - White"] } };
const thumbs = (ids, alt) => ids.map((id, i) => `<img src="/img/bias-ai/cf/${id}.webp" width="120" height="120" loading="lazy" alt="${esc(alt)} ${i + 1}">`).join("");
function cfGallery(mode) {
  const m = CF[mode], cfg = CFMODE[mode];
  const left = Object.entries(m.left), right = Object.entries(m.right);
  const gp = (name, entries, first) => panels(name, Object.fromEntries(entries.map(([k, ids]) => [k, `<div class="cf-grid">${thumbs(ids, k)}</div><p class="cf-n">${ids.length} images</p>`])), first);
  const a = card("Attribute – gender", cfg.note, select(`cfl-${mode}`, left.map((e) => e[0]), left[0][0], "Group"), gp(`cfl-${mode}`, left, left[0][0]));
  const b = card("Intersectionality explorer", "Two attributes at once: gender, then race.", select(`cfr-${mode}`, right.map((e) => e[0]), right[0][0], "Group"), gp(`cfr-${mode}`, right, right[0][0]));
  return `<div class="cc-pair">${a}${b}</div>`;
}
export function counterfactual() {
  const tabs = ["model", "dataset"].map((m, i) => `<button type="button" class="cf-tab${i ? "" : " on"}" data-cf-tab="${m}">${m === "model" ? "Model analysis" : "Dataset analysis"}</button>`).join("");
  const body = ["model", "dataset"].map((m, i) => `<div class="cf-pane" data-cf="${m}"${i ? " hidden" : ""}><p class="cf-ctx"><b>${m === "model" ? "Prompt" : "Word"}:</b> ${CFMODE[m].title}</p>${cfGallery(m)}</div>`).join("");
  return `<div class="cf"><div class="cf-tabs" role="tablist">${tabs}</div>${body}</div>`;
}
export const biasCharts = { diversity, parity, calibration, words, counterfactual };
