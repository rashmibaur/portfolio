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
