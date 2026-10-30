// Framer's router would try to render its own copy of each case study, so send project links to the local pages instead.
const slugs = ["bias-ai","metro","shell","kenvue","women-in-politics","fx-story","electoral-bonds","climate-vulnerability","farming-futures","bosch","kinetrack","mbti","smart-bulb"];
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest("a[href]");
  if (!a) return;
  const u = new URL(a.href, location.href);
  const slug = u.pathname.replace(/^\/|\/$/g, "");
  if (u.origin === location.origin && slugs.includes(slug)) {
    e.preventDefault();
    e.stopImmediatePropagation();
    location.assign(`/${slug}/`);
  }
}, true);
