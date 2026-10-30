// marks the step whose area on the screenshot is nearest the middle of the screen
document.querySelectorAll(".sx").forEach((sx) => {
  const tall = sx.classList.contains("tall");
  const steps = [...sx.querySelectorAll(".sx-s")], groups = [...sx.querySelectorAll(".sx-g")];
  const target = (g) => (tall ? g.querySelector(".sx-r") : steps.find((s) => s.dataset.i === g.dataset.i));
  let cur = "";
  const set = (i) => { if (i === cur) return; cur = i; steps.forEach((s) => s.classList.toggle("on", s.dataset.i === i)); groups.forEach((g) => g.classList.toggle("on", g.dataset.i === i)); };
  const update = () => {
    const mid = innerHeight / 2; let best = null, bd = Infinity, bh = Infinity;
    const rs = groups.map((g) => target(g).getBoundingClientRect());
    groups.forEach((g, k) => {
      // steps side by side (same top and height) share that stretch of scroll, one slice each
      const sib = rs.map((r, j) => j).filter((j) => Math.abs(rs[j].top - rs[k].top) < 8 && Math.abs(rs[j].height - rs[k].height) < 8);
      const h = rs[k].height / sib.length, top = rs[k].top + h * sib.indexOf(k), bot = top + h;
      const d = mid >= top && mid <= bot ? 0 : Math.min(Math.abs(mid - top), Math.abs(mid - bot));
      if (d < bd || (d === bd && rs[k].height < bh)) { bd = d; bh = rs[k].height; best = g; }
    });
    if (best) set(best.dataset.i);
  };
  let t = 0; const tick = () => { cancelAnimationFrame(t); t = requestAnimationFrame(update); };
  addEventListener("scroll", tick, { passive: true }); addEventListener("resize", tick); update();
  groups.forEach((g) => g.querySelector(".sx-m").addEventListener("click", () => target(g).scrollIntoView({ behavior: "smooth", block: "center" })));
});


// embeds that ask for input (p5 prompt) load only once the viewer scrolls to them
document.querySelectorAll(".embed[data-lazy] iframe[data-src]").forEach((f) => {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { f.src = f.dataset.src; io.disconnect(); } }), { threshold: 0.4 });
  io.observe(f);
});
