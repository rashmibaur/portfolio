// Live versions of the churnXpand chart set (Shell case study). Values follow the Figma slide; hover tooltips come from js/charts.js.
const C = { cy: "#0097bb", blue: "#5b86bd", blue2: "#3363a0", ltblue: "#89cfdc", green: "#00873c", lgreen: "#339d69", orange: "#eb8705", red: "#e44a4d", lime: "#bfd70f", purple: "#ba95be", brown: "#743410", grey: "#b8b8b8", grid: "#e5e7eb", axis: "#64748b" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const tip = (rows) => esc(rows.join("|"));
const T = (x, y, s, o = "") => `<text x="${x}" y="${y}" ${o}>${esc(s)}</text>`;

const card = (title, sub, body, { legend = [], flat = false, cls = "" } = {}) => `<div class="chart-card sg ${cls}" data-cc><h5>${title}</h5>${sub ? `<p class="sub">${sub}</p>` : ""}${legend.length ? `<div class="legend top">${legend.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join("")}</div>` : ""}<div class="plot${flat ? " flat" : ""}">${body}</div></div>`;

// axes shared by the bar and line charts
const grid = (x, y, L, W, R, ticks, fmt = (t) => t) => ticks.map((t) => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${C.grid}"/>${T(L - 8, y(t) + 3.5, fmt(t), 'text-anchor="end"')}`).join("");
const axisTitles = (L, W, R, T0, ph, H, xl, yl) => `${T(L + (W - L - R) / 2, H - 8, xl, 'text-anchor="middle" font-weight="700"')}${T(12, T0 + ph / 2, yl, `text-anchor="middle" font-weight="700" transform="rotate(-90 12 ${T0 + ph / 2})"`)}`;
const MONTHS6 = ["02", "04", "06", "08", "10", "12"];

function bars(cats, series, { yMax, ticks, yl, stacked = false, W = 520, H = 280, overlay = false }) {
  const L = 48, R = 10, T0 = 10, B = 50, pw = W - L - R, ph = H - T0 - B, band = pw / cats.length, y = (v) => T0 + ph - (v / yMax) * ph;
  const n = series.length, bw = stacked ? 40 : Math.min(26, (band - 14) / n);
  const g = cats.map((c, i) => {
    const cx = L + band * i + band / 2; let acc = 0, out = "";
    const rows = [`Month ${c}`];
    series.forEach((s, k) => {
      const v = s.v[i]; rows.push(`${s.n}: ${v}`);
      if (stacked) { out += `<rect x="${cx - bw / 2}" y="${y(acc + v)}" width="${bw}" height="${y(acc) - y(acc + v)}" fill="${s.c}"/>`; acc += v; }
      else if (overlay && s.over) { out += `<rect x="${cx + 1}" y="${y(s.v[i])}" width="${bw}" height="${y(0) - y(s.v[i])}" fill="${s.c}"/>`; }
      else out += `<rect x="${cx + (k - n / 2) * (bw + 1) + (overlay ? 0 : 0)}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" fill="${s.c}"/>`;
    });
    return `<g class="mark" data-tip="${tip(rows)}"><rect x="${L + band * i}" y="${T0}" width="${band}" height="${ph}" fill="transparent"/>${out}${T(cx, H - B + 17, c, 'text-anchor="middle"')}</g>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${yl} by month">${grid(null, y, L, W, R, ticks)}<line x1="${L}" x2="${L}" y1="${T0}" y2="${y(0)}" stroke="${C.axis}"/>${g}${axisTitles(L, W, R, T0, ph, H, "Months", yl)}</svg>`;
}

// ---------- 1. KPI cards ----------
export function kpiModel() {
  return `<div class="kp-row">
    <div class="kp"><h6>Model confidence score</h6><p>Correct / total opportunities past 6M</p><b class="g">70%</b><span class="g">70/100</span></div>
    <div class="kp"><h6>Recall value</h6><p>Actual &amp; predicted volume saved &amp; lost, past 6M</p><div class="kv">Recall value: <b class="g">0.83</b></div><div class="kv sm">Actual saved: <b class="g">100L</b><i></i>Actual loss: <b class="r">100L</b><i></i>Predicted: <b class="r">240L</b></div></div>
  </div>`;
}
export function kpiImpact() {
  const blk = (name, u) => `<div class="ki"><small>${name}</small><div class="ki-1"><b class="o">100${u}</b><span>Predicted lost</span></div><div class="ki-2"><div><b class="r">100${u}</b><span>Actual lost</span></div><div><b class="g">100${u}</b><span>Actual saved</span></div></div></div>`;
  return `<div class="kp wide"><h6>Actual &amp; predicted volume &amp; margins</h6><p>Volume &amp; margin, actual &amp; predicted, saved &amp; lost</p><div class="ki-row">${blk("Volume", "L")}${blk("Margin", "k")}</div></div>`;
}

// ---------- 2. portfolio ----------
export function treemapDelco() {
  const W = 420, H = 250, lw = W * 0.78, th = H * (100 / 140);
  const r = (x, y, w, h, f, n, v, ink = "#1e293b") => `<g class="mark" data-tip="${tip([n, `${v}`])}"><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="${f}"/>${T(x + 8, y + 18, n, `fill="${ink}" font-size="11"`)}${T(x + 8, y + h - 10, v, `fill="${ink}" font-size="11"`)}</g>`;
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Treemap of DELCO volume by country">${r(0, 0, lw, th, "#6a8cb5", "Germany", "100L")}${r(lw, 0, W - lw, th, "#89cfdc", "UK", "30L")}${r(0, th, lw, H - th, "#fbe3c0", "France", "40L")}${r(lw, th, W - lw, H - th, "#ba95be", "Others", "10L")}</svg>`;
  return card("DELCO volume distribution", "Distribution at portfolio level on the basis of volume of 3-6M", svg);
}
export function tableTop() {
  const rows = Array.from({ length: 5 }, () => "<tr><td>ID-12345</td><td>Legal entity</td><td>100k</td><td>100L</td></tr>").join("");
  return card("Top customers", "Top customers within portfolio on the basis of margin &amp; volume", `<table class="pbi"><thead><tr><th>ID</th><th>Legal entity</th><th>Margin</th><th>Volume</th></tr></thead><tbody>${rows}</tbody></table>`, { flat: true });
}
export function ribbon() {
  const W = 640, H = 330, L = 50, R = 12, T0 = 10, B = 52, pw = W - L - R, ph = H - T0 - B, max = 500, y = (v) => T0 + ph - (v / max) * ph;
  const ev = [140, 170, 200, 225, 235, 235, 235, 255, 265, 340, 340, 370], ga = [100, 85, 70, 55, 60, 50, 50, 50, 45, 40, 40, 30], cn = [70, 75, 65, 70, 60, 55, 55, 60, 50, 45, 35, 30], lp = [90, 60, 60, 50, 55, 55, 50, 45, 45, 40, 35, 30], ot = [40, 40, 40, 40, 40, 40, 40, 40, 40, 30, 25, 20];
  const S = [["EV", C.green, ev], ["Gasoline", C.cy, ga], ["CNG", C.orange, cn], ["LPG", C.brown, lp], ["others", C.grey, ot]];
  const x = (i) => L + (i + 0.5) * (pw / 12), band = pw / 12;
  let acc = new Array(12).fill(0), areas = "", cols = "";
  S.forEach(([n, c, v]) => {
    const top = v.map((q, i) => acc[i] + q), up = top.map((t, i) => `${i ? "L" : "M"}${x(i)},${y(t)}`).join(""), dn = acc.map((t, i) => `L${x(11 - i)},${y(acc[11 - i])}`).join("");
    areas += `<path d="${up}${dn}Z" fill="${c}" fill-opacity=".28"/>`; acc = top;
  });
  for (let i = 0; i < 12; i++) {
    let a = 0, col = ""; const rows = [`Month ${String(i + 1).padStart(2, "0")}`];
    S.forEach(([n, c, v]) => { col += `<rect x="${x(i) - 11}" y="${y(a + v[i])}" width="22" height="${y(a) - y(a + v[i])}" fill="${c}"/>`; a += v[i]; rows.push(`${n}: ${v[i]}`); });
    cols += `<g class="mark" data-tip="${tip(rows)}"><rect x="${L + band * i}" y="${T0}" width="${band}" height="${ph}" fill="transparent"/>${col}${T(x(i), H - B + 17, String(i + 1).padStart(2, "0"), 'text-anchor="middle"')}</g>`;
  }
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ribbon chart of volume by fuel type across 12 months">${grid(null, y, L, W, R, [100, 200, 300, 400, 500])}${areas}${cols}${axisTitles(L, W, R, T0, ph, H, "Months", "Volume")}</svg>`;
  return card("Decarbonisation journey", "Change in fuel type at portfolio level over past 12M", svg, { legend: S.map(([n, c]) => [c, n]) });
}

// ---------- 3. campaigns ----------
export function campaignTable() {
  const grp = (i) => `<tr class="grp"><td></td><td><b>CPA name</b></td><td><span class="bar b" style="width:96%"></span><em>600L</em></td><td><span class="bar l" style="width:96%"></span><em>400k</em></td></tr>` + [1, 2].map(() => `<tr><td>12345</td><td>LE name</td><td><span class="bar b" style="width:60%"></span><em>600L</em></td><td><span class="bar l" style="width:60%"></span><em>400k</em></td></tr>`).join("");
  return card("All customers", "All customers volume &amp; margin in last 6M", `<table class="pbi cmp"><thead><tr><th>ID</th><th>Legal entity</th><th>Volume (past 6M)</th><th>Margin (past 6M)</th></tr></thead><tbody>${[0, 1, 2, 3].map(grp).join("")}<tr class="tot"><td></td><td>Total</td><td>12345L</td><td>12345k</td></tr></tbody></table>`, { flat: true });
}
export function campaignLine() {
  const W = 420, H = 270, L = 48, R = 12, T0 = 10, B = 50, pw = W - L - R, ph = H - T0 - B, y = (v) => T0 + ph - ((v - 100) / 400) * ph, x = (i) => L + 12 + (i / 5) * (pw - 24);
  const d = [400, 325, 345, 310, 308, 308], path = d.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join("");
  const pts = d.map((v, i) => `<g class="mark" data-tip="${tip([`Month ${i + 1}`, `Margin: ${v}`])}"><rect x="${x(i) - 22}" y="${T0}" width="44" height="${ph}" fill="transparent"/><circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="#fff" stroke="${C.blue2}" stroke-width="2.5"/>${T(x(i), H - B + 17, i + 1, 'text-anchor="middle"')}</g>`).join("");
  return card("Campaign performance by margin", "Margin reversal by month", `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of margin by month">${grid(null, y, L, W, R, [100, 200, 300, 400, 500])}<path d="${path}" fill="none" stroke="${C.blue2}" stroke-width="2.5"/>${pts}${axisTitles(L, W, R, T0, ph, H, "Months", "Margin")}</svg>`);
}
function flow(nodes, links, W, H) {
  const bar = (n) => `<g class="mark" data-tip="${tip([n.l, `Volume: ${n.v}`])}"><rect x="${n.x}" y="${n.y}" width="64" height="8" fill="${n.c}"/><rect x="${n.x + 64}" y="${n.y}" width="12" height="8" fill="${C.grey}"/>${T(n.x, n.y + 20, n.l, 'font-size="9.5"')}${T(n.x, n.y + 31, n.v, 'font-size="9.5"')}</g>`;
  const ln = links.map(([a, b]) => { const A = nodes[a], B = nodes[b], x0 = A.x + 76, y0 = A.y + 4, x1 = B.x, y1 = B.y + 4, mx = (x0 + x1) / 2; return `<path d="M${x0},${y0}C${mx},${y0} ${mx},${y1} ${x1},${y1}" fill="none" stroke="#9aa3b5" stroke-width="1"/>`; }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tree chart of campaign volume reversal">${ln}${nodes.map(bar).join("")}</svg>`;
}
export function treeEmail() {
  const n = [{ l: "Churn customers", v: 60, c: C.blue, x: 4, y: 40 }, { l: "Email sent", v: 60, c: C.green, x: 190, y: 8 }, { l: "Email not received", v: 60, c: C.red, x: 190, y: 120 }, { l: "Email received", v: 60, c: C.green, x: 345, y: 8 }, { l: "Email bounced", v: 60, c: C.red, x: 345, y: 62 }, { l: "Email not found", v: 60, c: C.red, x: 345, y: 120 }, { l: "No email consent", v: 60, c: C.red, x: 345, y: 174 }];
  return card("Campaign email details", "Churn customers received campaign emails", flow(n, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], 450, 215));
}
export function treeReversal() {
  const row = (i, label, cs) => [{ l: `Cycle ${i}`, v: 60, c: C.blue, x: 4 + i * 62, y: 6 + i * 62 }, ...cs.map((c, k) => ({ l: ["Active", "Click", "Open"][k], v: 60, c, x: 108 + i * 62 + k * 92, y: 6 + i * 62 }))];
  const n = [...row(0, "", [C.green, C.green, C.green]), ...row(1, "", [C.green, C.green, C.red]), ...row(2, "", [C.green, C.orange, C.green]), ...row(3, "", [C.green, C.orange, C.green])];
  const links = []; for (let i = 0; i < 4; i++) { if (i < 3) links.push([i * 4, (i + 1) * 4]); for (let k = 0; k < 3; k++) links.push([i * 4 + k, i * 4 + k + 1].map((v) => v)); }
  return card("Campaign performance by volume reversal", "Based on volume reversal at different stages for emails sent", flow(n, links, 660, 255), { legend: [[C.red, "40-60%"], [C.orange, "60-80%"], [C.green, ">80%"]] });
}

// ---------- 4. customer detail ----------
export function textCard() {
  const L = [["Previously flagged", "60 days", "o"], ["Org. health", "100k"], ["LOB", "Fleet"], ["Banding", "Silver"], ["Credit rating", "A"], ["Base location", "Germany"], ["Status", "Active", "g"], ["Industry", "Agriculture"], ["Accounts", "25"], ["Active cards", "25"]];
  const R = [["Fee invoiced in last 12M", "100k"], ["Customer satisfaction index", "8", "g"], ["Shell / total transactions", "100/150", "g"], ["Delayed payment", "60 days", "o"], ["Days since last fee transaction", "60 days", "o"], ["Days since last engagement", "60 days", "o"]];
  return card("Legal entity name <span class=\"id\">ID12345</span>", "", `<div class="tc"><ul>${L.map(([k, v, c]) => `<li>${k}: <b class="${c || ""}">${v}</b></li>`).join("")}</ul><ul>${R.map(([k, v, c]) => `<li>${k}:<b class="${c || ""}">${v}</b></li>`).join("")}</ul></div>`, { flat: true });
}
export function stackedMargin() {
  return card("Product margin", "Margin on products past 12M", bars(MONTHS6, [{ n: "EV", c: C.green, v: [55, 55, 50, 85, 50, 75] }, { n: "Conventional fuel", c: C.blue, v: [50, 50, 50, 50, 100, 70] }, { n: "Lubricants", c: C.ltblue, v: [55, 55, 50, 50, 50, 65] }, { n: "Retail", c: C.purple, v: [55, 55, 45, 50, 60, 70] }], { yMax: 300, ticks: [100, 200, 300], yl: "Revenue", stacked: true, W: 420, H: 290 }), { legend: [[C.green, "EV"], [C.blue, "Conventional fuel"], [C.ltblue, "Lubricants"], [C.purple, "Retail"]] });
}
export function groupedCards() {
  return card("Card transactions", "Transacted vs active cards", bars(MONTHS6, [{ n: "Active cards", c: C.cy, v: [47, 43, 45, 44, 46, 42] }, { n: "Transacted cards", c: C.green, v: [44, 42, 44, 44, 44, 42] }], { yMax: 50, ticks: [10, 20, 30, 40, 50], yl: "Cards", W: 330, H: 290 }), { legend: [[C.cy, "Active cards"], [C.green, "Transacted cards"]] });
}

// ---------- 5. at risk ----------
export function riskTable() {
  const cols = [C.red, C.red, C.red, C.red, C.orange, C.orange, C.orange, "#f5cd00", "#f5cd00"];
  const sp = (c) => `<svg class="sp" viewBox="0 0 60 16" aria-hidden="true"><path d="M1,8 C10,4 16,10 24,8 S40,6 58,9" fill="none" stroke="${c}" stroke-width="1.4"/></svg>`;
  const rows = cols.map((c, i) => `<tr${i === 0 ? ' class="hl"' : ""}><td>12345</td><td>Legal entity name</td><td>${sp(C.blue)}<em>600L</em></td><td>${sp(C.lgreen)}<em>600L</em></td><td><span class="bar" style="background:${c};width:46%"></span><em>400L</em></td></tr>`).join("");
  return card("Customers at the risk of churn", "Predicted top customers basis of volume decline", `<div class="rk-leg">Coloring based on predicted volume drop <span><i style="background:#f5cd00"></i>40-60%</span><span><i style="background:${C.orange}"></i>60-80%</span><span><i style="background:${C.red}"></i>&gt;80%</span></div><table class="pbi rk"><thead><tr><th>ID</th><th>Legal entity</th><th>Conventional fuel (past 12M)</th><th>EV (past 12M)</th><th>Volume drop (3M)</th></tr></thead><tbody>${rows}<tr class="tot"><td></td><td>Total</td><td>12345L</td><td>12345L</td><td>12345L</td></tr></tbody></table>`, { flat: true });
}
export function keyInfluencer() {
  const items = [["Credit rating is less than C", "6x"], ["Last transaction was more than 15 days", "5x"], ["Last dispute was less than 5 days", "4x"]];
  const W = 300, H = 210, L = 38, R = 6, T0 = 8, B = 36, pw = W - L - R, ph = H - T0 - B, y = (v) => T0 + ph - ((v - 100) / 400) * ph, band = pw / 6, v = [440, 440, 440, 320, 285, 255], col = [C.lime, C.lime, C.lime, C.cy, C.cy, C.cy];
  const b = v.map((q, i) => `<g class="mark" data-tip="${tip([`Month ${MONTHS6[i]}`, `Volume: ${q}`])}"><rect x="${L + band * i + 8}" y="${y(q)}" width="${band - 16}" height="${y(100) - y(q)}" fill="${col[i]}"/>${T(L + band * i + band / 2, H - B + 16, MONTHS6[i], 'text-anchor="middle"')}</g>`).join("");
  const chart = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Churn volume by month">${[100, 200, 300, 400, 500].map((t) => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${C.grid}"/>${T(L - 6, y(t) + 3.5, t, 'text-anchor="end"')}`).join("")}${b}${T(L + pw / 2, H - 6, "Months", 'text-anchor="middle" font-weight="700"')}</svg>`;
  return card("Legal entity at the risk of churn", "Key influences of churn at customer level on the basis of volume decline of 3-6M", `<div class="ki-tabs"><span class="on">Key influences</span><span>Top segments</span></div><p class="ki-q">When is churn more likely to be <span class="sel">High</span></p><div class="ki-body"><div class="ki-l"><div class="ki-h"><span>When...</span><span>...the likelihood of churn increases by</span></div>${items.map(([t, m]) => `<div class="ki-r"><span>${t}</span><i></i><b>${m}</b></div>`).join("")}</div><div class="ki-c"><p>Churn is more likely to be high when credit rating is less than 12</p>${chart}</div></div>`, { flat: true });
}

// ---------- 6. impact ----------
function impactBars(title, sub, yl) {
  const ov = [360, 380, 345, 342, 350, 360], red = [338, 358, 330, 333, 340, 350], gr = [305, 328, 318, 278, 240, 282];
  const W = 380, H = 280, L = 46, R = 8, T0 = 10, B = 50, pw = W - L - R, ph = H - T0 - B, band = pw / 6, y = (v) => T0 + ph - ((v - 100) / 300) * ph, bw = 15, base = y(100);
  const g = MONTHS6.map((m, i) => { const cx = L + band * i + band / 2;
    return `<g class="mark" data-tip="${tip([`Month ${m}`, `Lost predicted: ${ov[i]}`, `Lost actual: ${red[i]}`, `Saved actual: ${gr[i]}`])}"><rect x="${L + band * i}" y="${T0}" width="${band}" height="${ph}" fill="transparent"/><rect x="${cx - bw - 1}" y="${y(ov[i])}" width="${bw}" height="${base - y(ov[i])}" fill="${C.orange}"/><rect x="${cx + 1}" y="${y(red[i])}" width="${bw}" height="${base - y(red[i])}" fill="${C.red}"/><rect x="${cx + 1}" y="${y(gr[i])}" width="${bw}" height="${base - y(gr[i])}" fill="${C.green}"/>${T(cx, H - B + 17, m, 'text-anchor="middle"')}</g>`; }).join("");
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${title} by month">${[100, 200, 300, 400].map((t) => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${C.grid}"/>${T(L - 8, y(t) + 3.5, t, 'text-anchor="end"')}`).join("")}${g}${axisTitles(L, W, R, T0, ph, H, "Months", yl)}</svg>`;
  return card(title, sub, svg, { legend: [[C.green, "Saved actual"], [C.red, "Lost actual"], [C.orange, "Lost predicted"]] });
}
export function impactPair() { return `<div class="vz-two">${impactBars("Volumes", "Predicted lost &amp; actual saved &amp; lost volumes", "Volume")}${impactBars("Margins", "Predicted lost &amp; actual saved &amp; lost margins", "Margin")}</div>`; }

// ---------- the whole section ----------
const need = (n, text, items) => `<div class="vz"><div class="vz-need"><span>${String(n).padStart(2, "0")}</span><small>User need</small><p>${text}</p></div><div class="vz-items">${items.join("")}</div></div>`;
const item = (name, body, desc, cls = "") => `<figure class="vz-i ${cls}"><h4>${name}</h4>${body}<figcaption>${desc}</figcaption></figure>`;
export function shellViz() {
  return `<div class="vzs">
${need(1, "Need metric to show how much the user can rely on the model to take decisions", [item("Card KPI", kpiModel(), "Cards give the score and the numbers behind it at a glance.")])}
${need(2, "Wants to see how their overall portfolio is performing", [item("Box plot", treemapDelco(), "Distribution across categories correlates to visual space in the chart, with labels &amp; metric."), item("Table", tableTop(), "Shows top customer names, margin &amp; transacted volumes in ascending order."), item("Ribbon chart", ribbon(), "Visually shows the increase in EV &amp; decrease in others by changes across months.", "span")])}
${need(3, "Wants to see how the ongoing campaigns are performing", [item("Table", campaignTable(), "Names &amp; volume, margin recovered at each campaign according to recency."), item("Line chart", campaignLine(), "Performance visualised by line across duration."), item("Tree chart", treeEmail(), "Visualising volume reversals at each stage, step by step, using tree structure &amp; visual hierarchy."), item("Tree chart", treeReversal(), "Visualising volume reversal at each stage, step by step, using tree structure &amp; visual hierarchy.", "span")])}
${need(4, "Wants to see details at individual customer level", [item("Text card", textCard(), "Text based card to highlight important information about the customer.", "span"), item("Stacked bar chart", stackedMargin(), "Stacked bar chart to show changes in distribution across time."), item("Grouped bar chart", groupedCards(), "Grouped bar charts to compare data across categories across time.")])}
${need(5, "Needs to know who are the customers at risk of churn most, to take immediate actions", [item("Table", riskTable(), "Customers displayed in ascending order of risk, in an easy-to-read minimal format to display important information at a glance.", "span"), item("Key influencer card", keyInfluencer(), "Text based reasons &amp; their impact on volume drop by a multiplication factor.", "span")])}
${need(6, "Needs to see how taking actions have brought positive impact", [item("Card KPI", kpiImpact(), "Cards for easy to read absolute numbers."), item("Grouped bar chart", impactPair(), "Grouped bar chart to compare categories across months.", "span")])}
</div>`;
}
