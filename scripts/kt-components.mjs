// Kinetrack component library as live HTML/SVG. Icons are the real Figma vectors; measurements follow the Figma specs.
import fs from "node:fs";
const ICONS = JSON.parse(fs.readFileSync(new URL("./kt-icons.json", import.meta.url), "utf8"));
const L = "#ffff33", S5 = "#64748b", S6 = "#475569", S7 = "#334155", S3 = "#cbd5e1", S2 = "#e2e8f0", INK = "#1e293b";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export const icon = (size, name, px = size) => {
  const parts = (ICONS[size] || {})[name] || [];
  const body = parts.map(([x, y, paths, rule]) => `<g transform="translate(${x} ${y})">${paths.map((p) => `<path d="${p}" fill-rule="${rule === "EVENODD" ? "evenodd" : "nonzero"}"/>`).join("")}</g>`).join("");
  const flip = name === "forward" ? ' style="transform:scaleX(-1)"' : "";
  return `<svg class="ki" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}" fill="currentColor" aria-hidden="true"${flip}>${body}</svg>`;
};

const specs = (rows) => `<dl class="kc-sp">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
const state = (label, html) => `<div class="kc-st">${html}<small>${label}</small></div>`;
const card = (title, body, sp, cls = "") => `<div class="kc-c ${cls}"><h4>${title}</h4><div class="kc-demo">${body}</div>${sp ? specs(sp) : ""}</div>`;
const group = (title, inner) => `<div class="kc-g"><h3><span>&#10022;</span>${title}</h3><div class="kc-grid">${inner}</div></div>`;

// ---------- icons ----------
const label = (n) => ({ skatebrd: "skateboard", skayes: "skates", setings: "settings", skate: "skates" }[n] || n);
const iconSet = (size, px) => `<ul class="kc-ic">${Object.keys(ICONS[size]).map((n) => `<li title="${label(n)}">${icon(size, n, px)}<small>${label(n)}</small></li>`).join("")}</ul>`;
const icons = group("Icons", card("24 &times; 24 px", iconSet("24", 28), null, "wide") + card("16 &times; 16 px", iconSet("16", 22), null) + card("12 &times; 12 px", iconSet("12", 18), null));

// ---------- buttons ----------
const btn = (cls) => `<span class="kb ${cls}">Button CTA</span>`;
const buttons = group("Buttons",
  card("Primary button", state("Default", btn("p")) + state("Pressed", btn("p press")), [["Width", "108, max 312"], ["Background", "#FFFF33"], ["Radius", "8"], ["Padding", "10 / 16"], ["Item spacing", "8"], ["Text", "#1E293B, title S"]]) +
  card("Secondary button", state("Default", btn("s")) + state("Pressed", btn("s press")), [["Background", "#E2E8F0"], ["Radius", "8"], ["Padding", "10 / 16"], ["Text", "#1E293B, title S"]]) +
  card("Primary text button", state("Default", btn("pt")) + state("Pressed", btn("pt press")), [["Text", "#FFFF33"], ["Pressed", "slate fill"]]) +
  card("Secondary text button", state("Default", btn("st")) + state("Pressed", btn("st press")), [["Text", "#E2E8F0"], ["Pressed", "slate fill"]]) +
  card("Caution text button", state("Default", btn("ct")) + state("Pressed", btn("ct press")), [["Text", "red"], ["Pressed", "dark red fill"]]) +
  card("Icon button &middot; 44 &times; 44", state("Default", `<span class="kb ib">${icon("24", "back")}</span>`) + state("Pressed", `<span class="kb ib press">${icon("24", "back")}</span>`), [["Background", "#475569"], ["Radius", "100"], ["Padding", "10"], ["Icon", "back, 24 &times; 24"]]) +
  card("Social login button", state("Default", `<span class="kb sl"><b class="g">G</b>Sign in with Google</span>`) + state("Pressed", `<span class="kb sl press"><b class="g">G</b>Sign in with Google</span>`), [["Height", "40"], ["Width", "213, max 312"], ["Border", "1 #CBD5E1"], ["Radius", "8"], ["Padding", "24"], ["Item spacing", "8"], ["Text", "#E2E8F0, label L"]]) +
  card("Navigation button", state("Default", `<span class="kn2">${icon("24", "cross")}<em>label</em></span>`) + state("Pressed", `<span class="kn2 press">${icon("24", "cross")}<em>label</em></span>`), [["Fill (pressed)", "#FEFF00 at 10%"], ["Radius", "32"], ["Padding", "2 / 8"], ["Item spacing", "10"], ["Label", "#FFFF33, label small"]]) +
  card("Side navigation button", state("Default", `<span class="sn">${icon("16", "setings")}<em>label</em>${icon("16", "forward")}</span>`) + state("Pressed", `<span class="sn press">${icon("16", "setings")}<em>label</em>${icon("16", "forward")}</span>`), [["Width", "288"], ["Background", "#475569, blur 16"], ["Radius", "8"], ["Padding", "8 / 16"], ["Item spacing", "43"], ["Label", "#F1F5F9, title medium"]], "wide") +
  card("FAB", state("Add", `<span class="fab">${icon("24", "add")}</span>`) + state("Sync", `<span class="fab">${icon("24", "sync")}</span>`), [["Size", "40 &times; 40"], ["Background", "#FFFF99"], ["Radius", "32"], ["Icon", "24 &times; 24"]]));

// ---------- selection ----------
const seg = (on) => `<span class="sg">${["text1", "text2", "text3"].map((t, i) => `<b class="${i === on ? "on" : ""}">${t}</b>`).join("")}</span>`;
const sc = (on) => `<span class="sc"><i class="${on === 0 ? "on" : ""}">${icon("16", "back")}</i><b>Today</b><i class="${on === 2 ? "on" : ""}">${icon("16", "forward")}</i></span>`;
const selection = group("Selection & navigation",
  card("Segmented button", `<div class="kc-col">${seg(0)}${seg(1)}${seg(2)}</div>`, [["Segments", "3, equal width"], ["Selected", "slate fill"], ["Border", "#CBD5E1"]]) +
  card("Segmented control button", `<div class="kc-col">${sc(1)}${sc(2)}${sc(0)}</div>`, [["Height", "32"], ["Width", "248"], ["Radius", "4"], ["Border", "1 #CBD5E1"], ["Arrow frames", "32 &times; 32, icon 16"], ["Label", "#E2E8F0, title S"]]) +
  card("Radio button", state("Default", `<span class="rb"></span>`) + state("Pressed", `<span class="rb on"></span>`), [["Height / width", "20"], ["Selected", "filled centre"]]) +
  card("Checkbox", state("Checked", `<span class="cb on">${icon("24", "tick", 12)}</span>`) + state("Unchecked", `<span class="cb"></span>`), [["Size", "16 &times; 16"], ["Border", "2 #CBD5E1"], ["Radius", "4"], ["Tick", "12 &times; 12"]]));

// ---------- inputs ----------
const field = (lab, cls, val, extra = "") => `<label class="fi ${cls}"><small>${lab}</small><span>${val}${extra}</span></label>`;
const eye = (off) => `<i class="eye">${off ? "&#9677;" : "&#9673;"}</i>`;
const stepper = (cls, v) => `<label class="fi ${cls}"><small>label</small><span class="num"><b>${v}</b><i>&minus;</i><i>+</i></span></label>`;
const dd = (cls, open) => `<div class="ddw"><label class="fi ${cls}"><small>Text</small><span>filler text<i class="chev">${open ? "&#8963;" : "&#8964;"}</i></span></label>${open ? `<ul class="ddm"><li>item1</li><li class="on">filler text</li><li>item3</li><li>item4</li><li>item5</li></ul>` : ""}</div>`;
const inputs = group("Inputs",
  card("Text input", state("Default", field("Text", "", "<em>filler text</em>")) + state("Active", field("Text", "act", "<u></u>")) + state("Filled", field("Text", "", "filler text")), [["Width", "312"], ["Background", "#334155"], ["Border", "1 #CBD5E1, radius 8"], ["Shadow", "xs"], ["Label", "#CBD5E1, label M"], ["Text", "#E2E8F0, label M"], ["Padding", "10 / 14"], ["Item spacing", "8"]], "wide") +
  card("Password input", state("Default", field("Password", "", "<em>Enter your password</em>")) + state("Active", field("Password", "act", "<u></u>")) + state("Filled", field("Password", "", "&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;", eye(0))) + state("Shown", field("Password", "", "*asd123", eye(1))), [["Based on", "text input, plus a show / hide icon"]], "wide") +
  card("Dropdown", state("Default", dd("", 0)) + state("Active", dd("act", 1)) + state("Filled", dd("", 0)), [["Based on", "text input, plus a chevron and an open item list"]], "wide") +
  card("Count / number input", state("Default", stepper("", 1)) + state("Active", stepper("act", 1)) + state("Filled", stepper("", 1)), [["Based on", "text input, plus minus and plus steppers"]], "wide"));

// ---------- lists, popups, cards ----------
const act = (ic, a, b, m) => `<div class="al"><div class="al-h">${icon("16", ic)}<span><b>${a}</b><i>${b}</i></span><em>${m[0]} &rsaquo;</em></div><p>${m[1]}</p></div>`;
const stat = (ic, t, v, when) => `<div class="al st"><div class="al-h">${icon("12", ic)}<span><b>${t}</b></span><em>${when} &rsaquo;</em></div><p>${v}</p></div>`;
const bars = (rows) => rows.map(([ic, w]) => `<div class="bl">${icon("16", ic)}<i style="width:${w}%"></i></div>`).join("");
const list = group("Lists",
  card("Activity list", `<div class="kc-col">${act("run", "Running", "Free run", ["Today", "2km &bull; 30min &bull; 2km/hr"])}${act("skate", "Skating", "Track skate", ["Yesterday", "5km &bull; 2hr &bull; 5km/hr"])}${act("cycle", "Cycling", "Free cycling", ["30/12/22", "10km &bull; 2hr &bull; 10km/hr"])}${act("jog", "Jogging", "Track jogging", ["25/12/22", "5km &bull; 2hr &bull; 2km/hr"])}</div>`, null) +
  card("Summary cards", `<div class="kc-col">${stat("distance", "Distance", "4 kms", "Today")}${stat("time", "Duration", "30 mins", "Today")}${stat("speed", "Average speed", "1 km/hr", "Today")}<div class="al st"><div class="al-h">${icon("12", "step")}<span><b>Activity</b></span><em>This week &rsaquo;</em></div>${bars([["cycle", 88], ["run", 64], ["jog", 36], ["skate", 22], ["skate", 5]])}</div></div>`, null));
const popups = group("Pop-ups & cards",
  card("Pop-ups", `<div class="kc-row"><div class="pu"><span class="sp">${icon("24", "sync", 34)}</span><b>0%</b><i></i></div><div class="pu pr"><b>Pairing<br>SmartGlove</b><span class="ring"></span><em>Searching</em><small>Make sure your smart glove is turned on</small></div></div>`, [["Fill", "slate #475569"], ["Accent", "lime"]]) +
  card("Cards", `<div class="kc-row"><div class="al big"><small>Skating</small><b>01/01/24 - 07/01/24</b>${[["Distance - 20kms", 78], ["Max. speed - 3km/hr", 86], ["Avg. speed - 2.4km/hr", 70], ["Duration - 20hr", 78]].map(([t, w]) => `<p>${t}</p><i style="width:${w}%"></i>`).join("")}</div><div class="al st"><div class="al-h">${icon("12", "step")}<span><b>Activity</b></span><em>This week &rsaquo;</em></div>${bars([["cycle", 88], ["run", 64], ["jog", 36], ["skate", 22], ["skate", 5]])}</div></div>`, null));

// ---------- charts ----------
const rnd = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const tabs = (on) => `<span class="sg t">${["Y", "M", "W"].map((t, i) => `<b class="${i === on ? "on" : ""}">${t}</b>`).join("")}</span>`;
const barChart = (on, n, labels, seed) => {
  const r = rnd(seed), W = 220, H = 120, bw = W / n, v = Array.from({ length: n }, () => 20 + r() * 80);
  const rects = v.map((h, i) => `<rect x="${(i * bw + bw * 0.2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${(bw * 0.6).toFixed(1)}" height="${h.toFixed(1)}" fill="${i === n - 1 ? L : "#cbd5e1"}"/>`).join("");
  return `<div class="ch">${tabs(on)}<p><b>03/01/24</b><em>Export data &rsaquo;</em></p><p class="av">Average - 2.6hr</p><svg viewBox="0 0 ${W + 24} ${H + 18}"><text x="0" y="14" class="ax">06</text><text x="0" y="${H / 2 + 6}" class="ax">03</text><g transform="translate(24 4)">${rects}<line x1="0" x2="${W}" y1="${H * 0.45}" y2="${H * 0.45}" stroke="${L}" stroke-dasharray="4 3"/></g>${labels.map((t, i) => `<text x="${24 + (i + 0.5) * (W / labels.length)}" y="${H + 16}" class="ax" text-anchor="middle">${t}</text>`).join("")}</svg></div>`;
};
const lineChart = (on, n, labels, seed, series) => {
  const r = rnd(seed), W = 220, H = 120, cols = ["#93c5fd", "#fde68a", "#93c5fd", "#fde68a", "#93c5fd"];
  const lines = Array.from({ length: series }, (_, s) => { let y = 30 + r() * 60; const pts = Array.from({ length: n }, (_, i) => { y = Math.max(8, Math.min(H - 8, y + (r() - 0.5) * (n > 12 ? 14 : 40))); return `${(i * W / (n - 1)).toFixed(1)},${(H - y).toFixed(1)}`; }); return `<polyline points="${pts.join(" ")}" fill="none" stroke="${series === 1 ? L : cols[s]}" stroke-width="1.6"/>`; }).join("");
  const leg = series > 1 ? `<div class="lg">${["Cycling", "Skating", "Running", "Jogging", "Skateboarding"].map((t, i) => `<span><i style="border-color:${cols[i]}"></i>${t}</span>`).join("")}</div>` : `<div class="lg c">${["Average speed", "Average duration", "Total distance"].map((t, i) => `<span><i class="cbx ${i === 0 ? "on" : ""}"></i>${t}</span>`).join("")}</div>`;
  return `<div class="ch">${tabs(on)}${series > 1 ? `<p><b>03/01/24</b><em>Export data &rsaquo;</em></p>` : ""}${leg}<svg viewBox="0 0 ${W + 24} ${H + 18}"><text x="0" y="14" class="ax">04</text><text x="0" y="${H / 2 + 6}" class="ax">02</text><g transform="translate(24 4)">${lines}</g>${labels.map((t, i) => `<text x="${24 + (i + 0.5) * (W / labels.length)}" y="${H + 16}" class="ax" text-anchor="middle">${t}</text>`).join("")}</svg></div>`;
};
const W7 = ["28", "29", "30", "31", "01", "02", "03"], M3 = ["04", "19", "03"], Y12 = "F M A M J J A S O N D J".split(" ");
const charts = group("Charts",
  card("Duration &middot; bar chart", `<div class="kc-row3">${barChart(2, 7, W7, 3)}${barChart(1, 30, M3, 5)}${barChart(0, 12, Y12, 9)}</div>`, [["Toggle", "Y / M / W"], ["Current period", "lime bar"], ["Average", "dashed lime line"], ["Action", "Export data"]], "wide") +
  card("Activity &middot; line chart", `<div class="kc-row3">${lineChart(2, 7, W7, 4, 5)}${lineChart(1, 30, M3, 6, 5)}${lineChart(0, 12, Y12, 8, 5)}</div>`, [["Series", "cycling, skating, running, jogging, skateboarding"], ["Colours", "blue and sand, lime for the single series"]], "wide") +
  card("Free activity &middot; line chart", `<div class="kc-row3">${lineChart(2, 7, W7, 2, 1)}${lineChart(1, 30, M3, 7, 1)}${lineChart(0, 12, Y12, 11, 1)}</div>`, [["Measures", "average speed, average duration, total distance (checkbox)"]], "wide"));

export const ktComponents = () => `<div class="kc">${icons}${buttons}${selection}${inputs}${list}${popups}${charts}</div>`;
