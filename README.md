# Rashmi Baur portfolio

Local copy of https://rashmibaurportfolio.framer.website/

- `index.html` + `f/` + `js/links.js` — the homepage, self-hosted from the Framer export (animations come from Framer's own runtime in `f/sites/`). `links.js` sends project-card clicks to the local case study pages.
- `content/<slug>.html` — case study body (hand-written HTML). `content/projects.json` — titles, tags, meta, colours.
- `src-img/<slug>/` — original slide images from Framer. `<img data-src="03" data-crop="x,y,w,h">` in a content file is cropped to WebP in `img/` by the build.
- `css/case.css` — shared case study styles.

```
npm install
npm run dev      # builds the case studies, serves on http://localhost:8000
npm run build    # only rebuilds <slug>/index.html and img/
```

Video boxes at the top of each case study are intentionally blank (`video: true` in `projects.json`).
