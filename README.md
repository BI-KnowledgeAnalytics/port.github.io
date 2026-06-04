# Shafiq ur Rehman — Mining Engineer × Power BI Developer

Personal portfolio site for a **Mining Engineer turned Power BI Developer**.
Built and hosted on GitHub Pages.

**Live:** https://bi-knowledgeanalytics.github.io/port.github.io/

## Positioning

> I build production dashboards that turn dispatch, SCADA, LIMS, and ERP
> data into the daily decisions a mine site runs on.

Most BI developers can't tell a haul truck from a hoist. This one can —
and can also write the `VAR/RETURN` that lights up its KPIs.

## Stack

- **Frontend**: Vanilla HTML / CSS / JavaScript — no build step
- **Theme**: Auto light / dark with manual toggle (stored in `localStorage`)
- **Interactivity**: Shift selector + tab switcher on the Production Control
  Tower mockup (pure JS, no framework)
- **Charts**: Hand-rolled SVG (bar, line, donut, table)
- **SEO**: JSON-LD `Person` schema, OG tags, semantic HTML
- **A11y**: Reduced-motion media query, keyboard-friendly buttons, ARIA labels

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, semantic HTML, SEO meta, JSON-LD |
| `styles.css` | Mining palette (copper/iron/coal), tokens, components, animations |
| `script.js`  | Theme toggle, footer year, dashboard renderer, shift/tab interactions, scroll-in animation |

## Sections

1. **Hero** — Mining Engineer × Power BI Developer
2. **About** — Career timeline (B.Eng → Site → Pivot → Today)
3. **Engineering × BI Skills** — 6-card grid: Domain / Data Sources / Modelling / DAX / Power Query / Reporting & DevOps
4. **Mining Dashboards** — 6 production-grade mockups:
   1. **Production Control Tower** ★ interactive (shift + tab switcher)
   2. Fleet Equipment OEE
   3. Drill & Blast Performance
   4. Mineral Processing Plant
   5. SHEC & Safety
   6. Mine Cost & Budget
5. **BI × Mining Playbook** — 6 short technical notes (DAX, modelling, time-intel)
6. **Contact** — Email + GitHub

## Local preview

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

Or just open `index.html` in a browser.

## Deploy

Pushes to `main` are published automatically by GitHub Pages.

## Related repos

- [`mine-bi-playbook`](https://github.com/BI-KnowledgeAnalytics/mine-bi-playbook) —
  full articles behind the short notes in the Playbook section.
