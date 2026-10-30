// Inline-SVG charts for the Intelligence tool case study.
// Data comes from the StyleIQ prototype (styleiq-umber.vercel.app); colours from the Figma colour swatches.
// Hover behaviour lives in js/charts.js: any [data-tip] element shows a tooltip and dims its siblings.

const C = { brand: "#f0254c", user: "#616161", pos: "#065f46", neu: "#0ea5e9", neg: "#e4002b", bar: "#4d6c7a", grid: "#e5e7eb", axis: "#64748b" };
const k = (n) => (n >= 1000 ? `${n / 1000}k` : `${n}`);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const tip = (rows) => esc(rows.join("|")); // "title|line|line" split again in the browser

const card = (title, sub, svg, legend = [], hint = "") => `<div class="chart-card">
  <h5>${title}</h5><p class="sub">${sub}</p>${hint ? `<p class="hint">${hint}</p>` : ""}
  <div class="plot">${svg}</div>
  ${legend.length ? `<div class="legend">${legend.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join("")}</div>` : ""}
</div>`;

const text = (x, y, s, o = "") => `<text x="${x}" y="${y}" ${o}>${s}</text>`;
const yGrid = (ticks, y, x0, x1, fmt) => ticks.map((t) => `<line x1="${x0}" x2="${x1}" y1="${y(t)}" y2="${y(t)}" stroke="${C.grid}"/>${text(x0 - 8, y(t) + 3.5, fmt(t), `text-anchor="end"`)}`).join("");

// ---- 1. grouped bars: brand vs user mentions ----
const Q = [["Sneakers", 12e3, 28e3], ["Boots", 8e3, 19e3], ["Sandals", 2e4, 24e3], ["Heels", 22e3, 18e3], ["Loafers", 6e3, 2e4], ["Mules", 4e3, 9e3]];
export function grouped() {
  const W = 640, H = 330, L = 56, R = 12, T = 14, B = 54, max = 40e3, pw = W - L - R, ph = H - T - B;
  const y = (v) => T + ph - (v / max) * ph, band = pw / Q.length, bw = 24;
  const bars = Q.map(([n, b, u], i) => {
    const cx = L + band * i + band / 2;
    const bar = (v, c, dx) => `<path d="M${cx + dx},${y(0)}V${y(v) + 3}a3,3 0 0 1 3,-3h${bw - 6}a3,3 0 0 1 3,3V${y(0)}z" fill="${c}"/>`;
    return `<g class="mark" data-tip="${tip([n, `Brand mentions: ${k(b)}`, `User mentions: ${k(u)}`])}"><rect x="${L + band * i}" y="${T}" width="${band}" height="${ph}" fill="transparent"/>${bar(b, C.brand, -bw)}${bar(u, C.user, 0)}${text(cx, H - B + 16, n, `text-anchor="middle"`)}</g>`;
  }).join("");
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of brand and user mentions by assortment">
    ${yGrid([0, 1e4, 2e4, 3e4, 4e4], y, L, W - R, k)}
    <line x1="${L}" x2="${L}" y1="${T}" y2="${y(0)}" stroke="${C.axis}"/>
    ${bars}${text(L + pw / 2, H - 8, "Assortment", `text-anchor="middle" font-weight="700"`)}${text(14, T + ph / 2, "Mentions", `text-anchor="middle" font-weight="700" transform="rotate(-90 14 ${T + ph / 2})"`)}
  </svg>`;
  return card("Brand vs User activity across assortments", "Comparative social activity by assortment", svg, [[C.brand, "Brand mentions"], [C.user, "User mentions"]]);
}

// ---- 2. stacked bars: sentiment by assortment ----
const S = [["Sneakers", 220, 80, 30], ["Boots", 130, 90, 70], ["Sandals", 190, 100, 50], ["Heels", 110, 130, 80], ["Loafers", 60, 70, 40], ["Mules", 50, 35, 25]];
export function stacked() {
  const W = 640, H = 330, L = 56, R = 12, T = 14, B = 54, max = 40e3, pw = W - L - R, ph = H - T - B, band = pw / S.length, bw = 38;
  const y = (v) => T + ph - (v / max) * ph;
  const bars = S.map(([n, p, u, g], i) => {
    const cx = L + band * i + band / 2;
    let acc = 0;
    const seg = (v, c) => { const h = ((v * 100) / max) * ph, yy = y(acc * 100 + v * 100); acc += v; return `<rect x="${cx - bw / 2}" y="${yy}" width="${bw}" height="${h}" fill="${c}"/>`; };
    return `<g class="mark" data-tip="${tip([n, `Positive: ${k(p * 100)}`, `Neutral: ${k(u * 100)}`, `Negative: ${k(g * 100)}`])}"><rect x="${cx - band / 2}" y="${T}" width="${band}" height="${ph}" fill="transparent"/>${seg(g, C.neg)}${seg(u, C.neu)}${seg(p, C.pos)}${text(cx, H - B + 16, n, `text-anchor="middle"`)}</g>`;
  }).join("");
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Stacked bar chart of sentiment by assortment">
    ${yGrid([0, 1e4, 2e4, 3e4, 4e4], y, L, W - R, k)}<line x1="${L}" x2="${L}" y1="${T}" y2="${y(0)}" stroke="${C.axis}"/>
    ${bars}${text(L + pw / 2, H - 8, "Assortment", `text-anchor="middle" font-weight="700"`)}${text(14, T + ph / 2, "Mentions", `text-anchor="middle" font-weight="700" transform="rotate(-90 14 ${T + ph / 2})"`)}
  </svg>`;
  return card("Sentiment analysis by assortment", "Comparative social activity by assortment", svg, [[C.pos, "Positive"], [C.neu, "Neutral"], [C.neg, "Negative"]]);
}

// ---- 3. scatter: attribute sentiment matrix (colour attributes) ----
const P = [[120, 7.2, 20, "Jet Black", "Positive"], [90, 5.6, 12, "Rose Gold", "Neutral"], [210, 9.5, 18, "Sky Blue", "Positive"], [170, 11.2, 22, "Emerald Green", "Positive"], [130, 6.8, 15, "Sunset Orange", "Neutral"], [250, 8.4, 24, "Lavender Purple", "Positive"], [80, 4.2, 10, "Crimson Red", "Negative"], [190, 10.1, 16, "Ocean Blue", "Positive"], [150, 7, 14, "Nude/Beige", "Neutral"]];
export function scatter() {
  const W = 640, H = 330, L = 56, R = 16, T = 14, B = 54, pw = W - L - R, ph = H - T - B;
  const x = (v) => L + (v / 400) * pw, y = (v) => T + ph - ((v + 5) / 20) * ph, col = { Positive: C.pos, Neutral: C.neu, Negative: C.neg };
  const dots = P.map(([px, py, z, n, s]) => `<circle class="mark dot" cx="${x(px)}" cy="${y(py)}" r="${z * 0.5}" fill="${col[s]}" fill-opacity=".9" data-tip="${tip([`Color : ${n}`, `Eng: ${py}% | Posts: ${px}`, s])}" tabindex="0"/>`).join("");
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of attribute engagement against number of posts">
    ${yGrid([-5, 0, 5, 10, 15], y, L, W - R, (t) => `${t}%`)}
    <line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="${C.axis}" stroke-dasharray="4 4"/>
    ${[0, 100, 200, 300, 400].map((t) => text(x(t), H - B + 16, t, `text-anchor="middle"`)).join("")}
    ${dots}${text(L + pw / 2, H - 8, "Number of Posts", `text-anchor="middle" font-weight="700"`)}${text(14, T + ph / 2, "Engagement (%)", `text-anchor="middle" font-weight="700" transform="rotate(-90 14 ${T + ph / 2})"`)}
  </svg>`;
  return card("Attribute sentiment matrix", "Growth of attributes in terms of posts and engagement", svg, [[C.pos, "Positive"], [C.neu, "Neutral"], [C.neg, "Negative"]], "Hover over a point to see the attribute.");
}

// ---- 4. horizontal bars: trending themes ----
const names = ["Tonal detailing", "Statement sole", "Sleek ankle height", "Subtle hardware", "Textured leather", "Matte noir", "Glossed black"];
const HB = names.map((n, t) => [n, Math.round((54e3 - 1200 * t) * (0.95 + (t % 3) * 0.04))]).sort((a, b) => b[1] - a[1]);
export function hbar() {
  const W = 640, H = 330, L = 128, R = 20, T = 12, B = 46, max = 60e3, pw = W - L - R, ph = H - T - B, band = ph / HB.length;
  const x = (v) => L + (v / max) * pw;
  const rows = HB.map(([n, v], i) => {
    const yy = T + band * i + band / 2;
    return `<g class="mark" data-tip="${tip([n, `Chatter: ${k(Math.round(v / 1000) * 1000)}`])}"><rect x="0" y="${T + band * i}" width="${W}" height="${band}" fill="transparent"/>${text(L - 10, yy + 3.5, n, `text-anchor="end"`)}<path d="M${L},${yy - 7}H${x(v) - 3}a3,3 0 0 1 3,3v8a3,3 0 0 1 -3,3H${L}z" fill="${C.bar}"/></g>`;
  }).join("");
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Horizontal bar chart of trending themes by chatter volume">
    ${[0, 1e4, 2e4, 3e4, 4e4, 5e4, 6e4].map((t) => `<line x1="${x(t)}" x2="${x(t)}" y1="${T}" y2="${T + ph}" stroke="${C.grid}"/>${text(x(t), T + ph + 16, k(t), `text-anchor="middle"`)}`).join("")}
    <line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" stroke="${C.axis}"/>${rows}${text(L + pw / 2, H - 8, "Chatter volume", `text-anchor="middle" font-weight="700"`)}
  </svg>`;
  return card("Trending themes based on attributes", "Growth of attributes in terms of posts and engagement", svg);
}

// ---- 5. treemaps: catalogue spread ----
const ASSORT = [["Sneakers", 380, "24%"], ["Sandals", 320, "20%"], ["Heels", 280, "18%"], ["Boots", 250, "16%"], ["Loafers", 180, "11%"], ["Flip Flops", 120, "8%"]];
const BRANDS = [["Dior", 320, "19%"], ["Gucci", 310, "18%"], ["Prada", 290, "17%"], ["Versace", 260, "15%"], ["Valentino", 220, "13%"], ["Chanel", 200, "12%"], ["John Lobb", 100, "6%"]];
function squarify(items, x, y, w, h) { // items sorted desc; classic squarified treemap
  const scale = (w * h) / items.reduce((t, i) => t + i[1], 0);
  let nodes = items.map((it) => ({ it, a: it[1] * scale })), out = [];
  while (nodes.length) {
    const side = Math.min(w, h);
    const worst = (r) => { const s = r.reduce((t, n) => t + n.a, 0), mx = Math.max(...r.map((n) => n.a)), mn = Math.min(...r.map((n) => n.a)); return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn)); };
    const row = [nodes[0]]; let i = 1;
    while (i < nodes.length && worst([...row, nodes[i]]) <= worst(row)) row.push(nodes[i++]);
    const thick = row.reduce((t, n) => t + n.a, 0) / side; let off = 0;
    for (const n of row) {
      const len = n.a / thick;
      out.push(w >= h ? { it: n.it, x, y: y + off, w: thick, h: len } : { it: n.it, x: x + off, y, w: len, h: thick }); off += len;
    }
    if (w >= h) { x += thick; w -= thick; } else { y += thick; h -= thick; }
    nodes = nodes.slice(row.length);
  }
  return out;
}
function treemap(title, sub, data) {
  const W = 300, H = 300, rects = squarify(data, 0, 0, W, H), max = data[0][1], min = data[data.length - 1][1];
  const g = rects.map(({ it: [n, v, pct], x, y, w, h }) => {
    const t = (v - min) / (max - min || 1), fill = `color-mix(in srgb, ${C.bar} ${Math.round(35 + t * 65)}%, #fff)`, ink = t > 0.45 ? "#fff" : "#1e293b";
    return `<g class="mark" data-tip="${tip([n, `${v} SKUs`, `${pct} of the catalogue`])}"><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="${fill}"/>${w > 62 && h > 40 ? `<text x="${x + 8}" y="${y + 18}" fill="${ink}" font-weight="700">${n}</text><text x="${x + 8}" y="${y + 32}" fill="${ink}" fill-opacity=".85" font-size="10">${v} SKUs</text><text x="${x + 8}" y="${y + 45}" fill="${ink}" fill-opacity=".85" font-size="10">${pct}</text>` : ""}</g>`;
  }).join("");
  return card(title, sub, `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${g}</svg>`, [], "");
}
export function treemaps() {
  return `<div class="chart-pair">${treemap("Assortment spread across catalogues", "Share of SKUs by assortment", ASSORT)}${treemap("Catalogue by brands", "Share of SKUs by brand", BRANDS)}</div>`;
}

export const charts = { grouped, stacked, scatter, hbar, treemaps };
