// Live data portraits for the MBTI page: the same encoding as the sketches, drawn from four percentages.
const P = (cx, cy, r, deg) => { const a = (deg * Math.PI) / 180; return [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)]; };
// arc covering `pct` percent of a circle, centred on the right so the gap sits on the left
const arc = (r, pct) => {
  const span = Math.max(4, Math.min(356, (pct / 100) * 360)), a0 = 180 + (360 - span) / 2, a1 = a0 + span;
  const [x0, y0] = P(100, 100, r, a0), [x1, y1] = P(100, 100, r, a1);
  return `M${x0},${y0} A${r},${r} 0 ${span > 180 ? 1 : 0} 1 ${x1},${y1}`;
};
export function portrait({ i, n, t, j }) {
  const half = (side, c) => `<path d="M100,54 A46,46 0 0 ${side} 100,146 Z" fill="${c}"/>`;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Data portrait: introvert ${i}, intuitive ${n}, thinker ${t}, judger ${j}">
    <circle cx="100" cy="100" r="90" fill="none" stroke="#d9545a" stroke-width="17"/>
    <path d="${arc(90, i)}" fill="none" stroke="#f4d5ca" stroke-width="11" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="80" fill="#d6b44a" stroke="#d9545a" stroke-width="2"/>
    <path d="${arc(63, j)}" fill="none" stroke="#6a625b" stroke-width="15" stroke-linecap="round"/>
    ${half(0, "#a29fb2")}${half(1, "#c9a2cb")}
    <circle cx="${100 - 17}" cy="${100 - 18}" r="${((n / 100) * 24).toFixed(1)}" fill="#3d1d9b"/>
    <circle cx="${100 + 17}" cy="${100 + 20}" r="${((t / 100) * 20).toFixed(1)}" fill="#8e2b86"/>
  </svg>`;
}
const card = (v) => `<figure class="mb-pt">${portrait(v)}<figcaption><b>INTJ</b><dl>${[["Introvert", v.i], ["Intuitive", v.n], ["Thinker", v.t], ["Judger", v.j]].map(([k, x]) => `<div><dt>${k}</dt><dd><i style="width:${x}%"></i></dd><dd class="n">${x}</dd></div>`).join("")}</dl></figcaption></figure>`;
export const mbtiPortraits = () => `<div class="mb-pts">${card({ i: 85, n: 91, t: 88, j: 72 })}${card({ i: 68, n: 79, t: 64, j: 88 })}</div>`;
