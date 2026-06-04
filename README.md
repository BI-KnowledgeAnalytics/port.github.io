# Shafiq ur Rehman — Portfolio

Personal portfolio site hosted on GitHub Pages.

**Live:** https://bi-knowledgeanalytics.github.io/port.github.io

## Stack

- Vanilla HTML / CSS / JavaScript — no build step
- Auto light/dark theme with manual toggle (stored in `localStorage`)
- Live GitHub repo stats via the REST API

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure & content |
| `styles.css` | Theme tokens, layout, components |
| `script.js`  | Theme toggle, footer year, GitHub API fetch |

## Edit content

- **Name / title / bio** → `index.html`
- **Colors / spacing** → CSS variables at the top of `styles.css`
- **Featured repo** → `REPO` constant at the top of `script.js`

## Local preview

Open `index.html` in a browser, or serve locally:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Pushes to `main` are published automatically by GitHub Pages.
