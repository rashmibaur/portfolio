// Hover tooltip + dimming for the inline SVG charts. Any [data-tip] element: "title|line|line".
(() => {
  const tip = document.createElement("div");
  tip.className = "chart-tip";
  tip.hidden = true;
  document.body.appendChild(tip);
  const show = (el, x, y) => {
    const [title, ...lines] = el.dataset.tip.split("|");
    tip.innerHTML = `<b>${title}</b>${lines.map((l) => `<span>${l}</span>`).join("")}`;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(x + 14, innerWidth - r.width - 8) + "px";
    tip.style.top = Math.max(8, y - r.height - 10) + "px";
  };
  const hide = (svg) => { tip.hidden = true; svg?.classList.remove("hover"); svg?.querySelectorAll(".on").forEach((e) => e.classList.remove("on")); };
  document.addEventListener("mousemove", (e) => {
    const el = e.target.closest?.(".chart-card [data-tip]");
    const svg = el?.closest("svg");
    document.querySelectorAll(".chart-card svg.hover").forEach((s) => s !== svg && hide(s));
    if (!el) return void (tip.hidden = true);
    svg.classList.add("hover");
    svg.querySelectorAll(".on").forEach((n) => n !== el && n.classList.remove("on"));
    el.classList.add("on");
    show(el, e.clientX, e.clientY);
  });
  document.addEventListener("mouseleave", () => hide(), true);
  document.addEventListener("focusin", (e) => { const el = e.target.closest?.(".chart-card [data-tip]"); if (el) { const r = el.getBoundingClientRect(); el.closest("svg").classList.add("hover"); el.classList.add("on"); show(el, r.left + r.width / 2, r.top); } });
  document.addEventListener("focusout", (e) => hide(e.target.closest?.("svg")));

  // Attribute dropdowns: show the panel that matches the selection.
  document.addEventListener("change", (e) => {
    const sel = e.target.closest?.("select[data-switch]");
    if (!sel) return;
    const card = sel.closest("[data-cc]");
    const name = sel.dataset.switch, pair = name.match(/^(.*)-(row|col)$/);
    let group = name, key = sel.value;
    if (pair) { group = pair[1]; key = card.querySelector(`select[data-switch="${group}-row"]`).value + "|" + card.querySelector(`select[data-switch="${group}-col"]`).value; }
    card.querySelectorAll(`.cc-panel[data-group="${group}"]`).forEach((p) => { p.hidden = p.dataset.key !== key; });
  });

  // Model / dataset tabs for the counterfactual galleries.
  document.addEventListener("click", (e) => {
    const t = e.target.closest?.("[data-cf-tab]");
    if (!t) return;
    const root = t.closest(".cf");
    root.querySelectorAll("[data-cf-tab]").forEach((b) => b.classList.toggle("on", b === t));
    root.querySelectorAll("[data-cf]").forEach((p) => { p.hidden = p.dataset.cf !== t.dataset.cfTab; });
  });
})();
