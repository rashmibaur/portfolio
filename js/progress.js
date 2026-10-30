// Left progress rail: one dot per <main> section (named by its h2), a line that fills as you scroll, click a dot to jump.
(() => {
  const secs = [...document.querySelectorAll("main > section")].filter((s) => s.querySelector("h2"));
  if (secs.length < 3) return;
  const rail = document.createElement("nav");
  rail.className = "prog";
  rail.setAttribute("aria-label", "Case study progress");
  rail.innerHTML = `<div class="prog-line"><i></i></div>` + secs.map((s, i) => `<a href="#" data-i="${i}" style="--p:${(i / (secs.length - 1)) * 100}%"><span>${s.querySelector("h2").textContent}</span></a>`).join("");
  document.body.appendChild(rail);
  const fill = rail.querySelector(".prog-line i");
  const dots = [...rail.querySelectorAll("a")];
  rail.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    secs[+a.dataset.i].scrollIntoView({ block: "start" });
  });
  let tick = false;
  const update = () => {
    tick = false;
    const probe = innerHeight * 0.35;
    let i = 0;
    secs.forEach((s, k) => { if (s.getBoundingClientRect().top <= probe) i = k; });
    const r = secs[i].getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (probe - r.top) / Math.max(1, r.height)));
    const done = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const ratio = done ? 1 : Math.min(1, (i + frac) / (secs.length - 1));
    fill.style.height = ratio * 100 + "%";
    dots.forEach((d, k) => { d.classList.toggle("on", k === i); d.classList.toggle("done", k < i || done); });
  };
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  update();
})();
