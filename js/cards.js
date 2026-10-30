// plays each homepage card video while it is on screen (Framer's own trigger was not starting the self-hosted files)
const vids = () => [...document.querySelectorAll("video[muted]")];
const io = new IntersectionObserver((es) => es.forEach((e) => {
  const v = e.target;
  if (e.isIntersecting) { v.muted = true; v.play().catch(() => {}); } else v.pause();
}), { threshold: 0.35 });
const seen = new WeakSet();
const scan = () => vids().forEach((v) => { if (!seen.has(v)) { seen.add(v); io.observe(v); } });
scan();
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });

// ---- homepage cards: category + industry as primary tags, niche tags as secondary, filter chips, two placeholder cards ----
const META = {
  "bias-ai": ["Enterprise AI & Model Governance", "AI Infrastructure & Governance", ["MLOps", "Explainable AI (XAI)", "Fairness Metrics Auditing"], ["ai"]],
  "metro": ["Prescriptive Decision SaaS", "Retail & Fashion Tech", ["Demand Forecasting", "Trend Intelligence", "Merchandising Analytics"], ["ai"]],
  "shell": ["Predictive Analytics BI", "Energy & Industrial B2B", ["Churn Prediction", "Prescriptive Account Retention", "B2B Operational Analytics"], ["ai", "bi"]],
  "kenvue": ["Data-Dense Enterprise SaaS", "Supply Chain & Logistics", ["High-Density Data Grids", "Table Builders", "Logistics Planning"], ["ai"]],
  "women-in-politics": ["Editorial Information Design", "Civic Tech & Public Policy", ["Data Storytelling", "Data Journalism", "Gender Representation"], ["civic"]],
  "fx-story": ["Scrollytelling & Internal BI", "Enterprise People Analytics", ["Executive Storytelling", "Workforce Utilization", "Interactive Narrative"], ["bi"]],
  "electoral-bonds": ["Investigative Data Story", "Civic Tech & FinTech", ["Campaign Finance", "Political Transparency", "Network Graph Visualization"], ["civic"]],
  "climate-vulnerability": ["Geospatial Data Visualization", "ClimateTech & Sustainability", ["ESG Analytics", "Climate Risk Mapping", "Geospatial Analysis"], ["civic"]],
  "bosch": ["Marketing Intelligence Dashboard", "Automotive & Mobility", ["B2B Marketing Analytics", "Performance Marketing BI", "Regional Lead Tracking"], ["bi"]],
  "kinetrack": ["Connected IoT Ecosystem", "Connected Health & IoT", ["Wearable UX", "Motion Sensor Telemetry", "Hardware-Software Sync"], ["iot"]],
  "mbti": ["Generative Art & Creative Tech", "Creative Tech & Digital Arts", ["Generative Design", "Creative Coding", "Algorithmic Art"], ["iot"]],
  "kapsy-ai": ["Multi-Platform Product (Web & Mobile)", "EdTech & Creator Economy", ["Asynchronous Video Feedback", "Dual-Sided Marketplace", "Automated Class Ops"], ["ai"], "AI platform for asynchronous coaching & practice"],
  "philips": ["Predictive Health Operations", "HealthTech & MedTech", ["Hospital Asset Management", "Root Cause Analytics", "Predictive Maintenance"], ["ai", "bi"], "Predictive operations dashboard for medical devices"],
};
const GROUPS = [["all", "All"], ["ai", "Enterprise AI & SaaS"], ["bi", "Business Intelligence (BI)"], ["civic", "Data Storytelling & Civic Tech"], ["iot", "Creative Tech & IoT"]];
const css = document.createElement("style");
css.textContent = `a[href^="./"] [data-framer-name="Metro Media Holder"]{padding:0!important;border-radius:18px!important;overflow:hidden!important;background:transparent!important}a[href$="./kapsy-ai"] [data-framer-name="Metro Media Holder"],a[href$="./philips"] [data-framer-name="Metro Media Holder"]{background:#f3f3f1!important;position:relative}.rb-soon{visibility:visible!important;z-index:2;position:absolute;inset:0;display:grid;place-items:center;font:500 16px/1 "Instrument Sans",sans-serif;letter-spacing:.04em;color:rgba(17,17,17,.45)}a[href^="./"] [data-framer-name="Metro Media Holder"] .ticker-item *{border-radius:0!important}a[href^="./"] [data-framer-name="Metro Media Holder"]>div{border-radius:0!important}a[href^="./"] video{object-fit:cover!important;object-position:50% 50%!important;background:transparent!important}a[href$="./smart-bulb"]{display:none!important}.rb-tags{display:flex;flex-wrap:wrap;gap:8px}.rb-tags span{padding:5px 10px;border-radius:99px;border:1px solid rgba(17,17,17,.25);font:12px/1 Numans,sans-serif;color:rgba(17,17,17,.66);white-space:nowrap}.rb-sub{font:600 17px/1.3 "Instrument Sans",sans-serif;color:#6f6f6f;margin:-2px 0 4px}a[href^="./"] [data-framer-name="Metro Work One Liner"] p{--framer-font-size:15px!important;font-size:15px!important;line-height:1.4!important}
.rb-chips{display:flex;flex-wrap:wrap;gap:10px}.rb-chips button{padding:10px 18px;border-radius:99px;border:1px solid rgba(17,17,17,.35);background:transparent;font:500 15px/1 "Instrument Sans",sans-serif;color:#111;cursor:pointer;transition:background .2s,color .2s}.rb-chips button:hover{background:rgba(17,17,17,.08)}.rb-chips button.on{background:#fff;color:#111;border-color:#fff}`;
document.head.appendChild(css);

const cardOf = (slug) => document.querySelector(`a[href$="./${slug}"], a[href$="/${slug}"], a[data-slug="${slug}"]`);
const grid = () => document.querySelector("a[href$='./bias-ai']")?.parentElement;

function decorate(a, slug) {
  if (a.dataset.rb) return;
  const m = META[slug]; if (!m) return;
  const holder = a.querySelector("[data-framer-name='Metro Work Tags']"); if (!holder) return;
  a.dataset.rb = "1"; a.dataset.groups = m[3].join(" ");
  a.dataset.oldh = holder.getBoundingClientRect().height;
  holder.style.display = "none";
  const t = document.createElement("div"); t.className = "rb-tags";
  m[2].forEach((x) => { const s = document.createElement("span"); s.textContent = x; t.appendChild(s); });
  holder.after(t);
  const title = a.querySelector("[data-framer-name='Metro Work Title']");   // category and industry read as a subheading under the title
  if (title) { const sub = document.createElement("div"); sub.className = "rb-sub"; sub.textContent = `${m[0]} \u00b7 ${m[1]}`; title.after(sub); }
}

const DESC = {"kapsy-ai": "Connecting learners and coaches through craft-specific mobile practice labs and automated class management tools to close the feedback loop between sessions.", "philips": "Consolidating multi-stream machine telemetry and AI-driven root-cause analytics into a proactive operational workspace for hospital equipment managers."};

// homepage layout: rows of [slug, columns]; all rows are three columns wide
const LAYOUT = [
  [["bias-ai", 2], ["metro", 1]],
  [["kenvue", 1], ["kapsy-ai", 2]],
  [["philips", 1], ["shell", 1], ["bosch", 1]],
  [["fx-story", 1], ["climate-vulnerability", 1], ["women-in-politics", 1]],
  [["electoral-bonds", 1], ["kinetrack", 1], ["mbti", 1]],
];

// video shapes (width / height), so each card's media box matches its video and nothing is cropped
const ASPECT = { "bias-ai": 1440 / 892, "metro": 1440 / 698, "kenvue": 1440 / 966, "fx-story": 1440 / 1068, "electoral-bonds": 1440 / 1092, "climate-vulnerability": 1440 / 660, "kinetrack": 1440 / 870, "mbti": 960 / 434 };

// image-slider cards (a Framer ticker): find the media box and the strip that scrolls inside it
function slider(a) {
  const u = a.querySelector("ul.ticker, ul"), holder = a.querySelector("[data-framer-name='Metro Media Holder']");
  if (!u || !holder || a.querySelector("video")) return null;
  if (!holder.dataset.h0) holder.dataset.h0 = Math.round(holder.getBoundingClientRect().height);
  return { holder, t: u.parentElement, h0: +holder.dataset.h0 };
}

function need(a, step, gap) {   // rows a card needs for its natural content (video at its own shape)
  const slug = (a.getAttribute("href") || "").replace("./", ""), v = a.querySelector("video");
  if (v && ASPECT[slug]) {
    const holder = v.closest("[data-framer-name='Metro Media Holder']"), cont = v.parentElement;
    holder.style.cssText += ";width:100%;height:auto;flex:none;display:flex;align-items:stretch;min-height:0";
    cont.style.cssText += `;width:100%;height:auto;flex:none;aspect-ratio:${ASPECT[slug]}`;
  }
  const sl = slider(a);
  if (sl) { sl.holder.style.cssText += `;flex:none;height:${sl.h0}px;min-height:0`; sl.t.style.transform = ""; }
  a.style.height = "auto"; a.style.alignSelf = "start"; a.style.gridRow = "auto";
  const h = a.getBoundingClientRect().height;
  a.style.height = ""; a.style.alignSelf = "";
  return Math.ceil((h + gap) / step);
}

function fit() {
  const g = grid(); if (!g) return;
  const gap = 10, step = 2;   // 2px rows with no row gap, so a card's height follows its content closely; the 10px gap is added to each card's span
  if (!g.dataset.rowh) { g.dataset.rowh = 1; g.style.gridTemplateRows = "none"; g.style.gridAutoRows = step + "px"; g.style.rowGap = "0px"; }
  g.style.gridAutoFlow = "row";
  let start = 1, idx = 0;
  const BONUS = [-50, 0, 50, 0, 0];   // extra rows (2px each) per layout row; row 1 is 100px shorter and row 3 is 100px taller
  LAYOUT.forEach((row, ri) => {
    const cards = row.map(([slug, w]) => [cardOf(slug), w]).filter(([a]) => a && a.style.display !== "none");
    const n = Math.max(0, ...cards.map(([a]) => need(a, step, gap))) + BONUS[ri];   // the row is as tall as its tallest card, so the whole grid stays a rectangle
    let col = 1;
    cards.forEach(([a, w]) => {
      a.style.order = idx++; a.style.gridColumn = `${col} / span ${w}`; col += w;
      a.style.gridRow = `${start} / span ${n}`; a.style.height = `${n * step - gap}px`;   // minus the gap, so cards do not touch the row below
      const v = a.querySelector("video"), holder = v && v.closest("[data-framer-name='Metro Media Holder']");
      if (v && ASPECT[(a.getAttribute("href") || "").replace("./", "")]) {   // media takes whatever height the row gives it, the video sits whole inside
        holder.style.flex = "1 1 0"; holder.style.minHeight = "0";
        v.parentElement.style.aspectRatio = "auto"; v.parentElement.style.height = "100%";
      }
    });
    start += n;
  });
  // image sliders: scale the strip so its height fills the media box, cropping the sides
  LAYOUT.flat().forEach(([slug]) => {
    const a = cardOf(slug), sl = a && slider(a); if (!sl) return;
    sl.holder.style.flex = "1 1 0"; sl.holder.style.height = ""; sl.holder.style.minHeight = "0";
    requestAnimationFrame(() => {
      const hh = sl.holder.clientHeight, ww = sl.holder.clientWidth, h0 = Math.round(sl.t.getBoundingClientRect().height / (parseFloat((sl.t.style.transform.match(/scale\(([\d.]+)\)/) || [0, 1])[1]) || 1)) || 101, k = hh / h0;
      Object.assign(sl.t.style, { width: ww + "px",   // the strip stays as wide as the box, so its looping copies still cover the part that is visible
         height: h0 + "px", transformOrigin: "0 0", transform: `scale(${k})`, alignSelf: "flex-start", flex: "none" });
    });
  });
  // Biases in AI: the bottom of its video is blank, so when the box is shorter than the video only that bottom part is cropped
  const bv = cardOf("bias-ai") && cardOf("bias-ai").querySelector("video");
  if (bv) bv.style.setProperty("object-position", "50% 0%", "important");
}

function grow() {   // Framer fixes the heights around the grid; let them follow the (now taller) cards
  let e = grid(); e.style.height = "auto";
  while ((e = e.parentElement) && e !== document.body && getComputedStyle(e).position !== "static") e.style.height = "auto";
}

function init() {
  const g = grid(); if (!g || !cardOf("smart-bulb")) return false;
  // placeholder cards: clone the plain lorem card, then give it its own title/link
  [["kapsy-ai", "AI platform for asynchronous coaching & practice"], ["philips", "Predictive operations dashboard for medical devices"]].forEach(([slug, title]) => {
    if (cardOf(slug)) return;
    const c = cardOf("smart-bulb").cloneNode(true);
    c.dataset.slug = slug; delete c.dataset.rb;
    c.setAttribute("href", `./${slug}`);
    c.querySelector("h3").textContent = title;
    c.querySelector("[data-framer-name='Metro Work One Liner'] p").textContent = DESC[slug];
    c.querySelectorAll(".rb-tags, .rb-sub").forEach((n) => n.remove());
    const h = c.querySelector("[data-framer-name='Metro Work Tags']");
    if (h) h.style.display = slug === "github-writing" ? "none" : "";
    if (slug === "github-writing") { c.removeAttribute("href"); c.style.pointerEvents = "none"; c.style.cursor = "default"; }   // no page behind it yet
    const mh = c.querySelector("[data-framer-name='Metro Media Holder']"); if (mh) { const t = document.createElement("div"); t.className = "rb-soon"; t.textContent = "Coming soon"; mh.appendChild(t); }
    g.appendChild(c);
  });
  Object.keys(META).forEach((slug) => { const a = cardOf(slug); if (a) decorate(a, slug); });
  const align = () => fit();
  align(); grow(); setTimeout(() => { align(); grow(); }, 600); addEventListener("resize", () => setTimeout(align, 150));
  return true;
}
let tries = 0; const iv = setInterval(() => { if (init() || ++tries > 80) clearInterval(iv); }, 150);

// footer social icons, bottom right
(function socials() {
  const SOCIAL = [
    ["LinkedIn", "https://www.linkedin.com/in/rashmibaur", "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"],
    ["GitHub", "https://github.com/rashmibaur", "M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3"],
  ];
  const st = document.createElement("style");
  st.textContent = ".rb-social{position:absolute;right:56px;top:50%;transform:translateY(-50%);display:flex;gap:14px}.rb-social a{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(17,17,17,.2);color:#756d6d;transition:background .2s,color .2s,border-color .2s}.rb-social a:hover{background:#111;color:#fff;border-color:#111}.rb-social svg{width:18px;height:18px;fill:currentColor}@media(max-width:700px){.rb-social{right:20px}}";
  document.head.appendChild(st);
  let n = 0;
  const iv = setInterval(() => {
    const foot = document.querySelector(".framer-15z5uop");
    if (foot && !foot.querySelector(".rb-social")) {
      if (getComputedStyle(foot).position === "static") foot.style.position = "relative";
      const d = document.createElement("div"); d.className = "rb-social";
      d.innerHTML = SOCIAL.map(([l, u, path]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${l}" title="${l}"><svg viewBox="0 0 24 24"><path d="${path}"/></svg></a>`).join("");
      foot.appendChild(d);
    }
    if ((foot && foot.querySelector(".rb-social")) || ++n > 60) clearInterval(iv);
  }, 200);
})();
