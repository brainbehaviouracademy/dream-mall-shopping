# Dream Mall '27 — A Money Reality Check

An interactive self-assessment built for **Brain Behaviour Academy**.

Teenagers step into the shoes of their 27-year-old self, "shop" for everything
they imagine buying in a year — gadgets, travel, fashion, food, luxury — and then
hit checkout to face a reality check: the boring essentials they forgot, the
savings they should keep, income tax, and the salary they'd actually need to
afford it all, compared with what a real 27-year-old earns.

It's a single static web page. No build step, no server-side code, no database —
just HTML, CSS and JavaScript.

## Live demo / hosting on GitHub Pages

1. Create a new repository on GitHub (e.g. `dream-mall-27`).
2. Upload **all the files in this folder**, keeping the folder structure intact
   (`index.html` must stay at the top level, with the `css/` and `js/` folders
   beside it).
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder, then **Save**.
6. Wait a minute, then visit the URL GitHub shows you, usually:
   `https://<your-username>.github.io/dream-mall-27/`

That's it — the page is live and shareable.

## Running it locally

Easiest: just double-click `index.html` to open it in any browser.

If your browser blocks the external font for local files, run a tiny local
server from this folder instead:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

## File structure

```
dream-mall-27/
├── index.html        # page structure (the only file you open)
├── css/
│   └── styles.css    # all styling and the responsive / mobile layout
├── js/
│   ├── data.js       # the catalogue: items, prices, icons, essential costs
│   └── app.js        # all the logic: cart, checkout, reality-check maths
├── README.md
├── LICENSE
└── .nojekyll         # tells GitHub Pages to serve the files as-is
```

## Customizing it

- **Change prices, add/remove items, or swap icons:** edit `js/data.js`.
  Each item looks like:
  ```js
  { n:"Latest iPhone", p:130000, u:"each", e:"📱" }
  ```
  - `n` = name, `p` = price (₹), `u` = unit label, `e` = icon (any emoji).
  - Add `mult:12` for monthly costs so they're counted across the whole year.
- **Adjust the "cost of just existing"** (rent, food, bills) in the
  `ESSENTIALS` list near the bottom of `data.js`.
- **Change the savings target** via `SAVINGS_RATE` in `data.js` (e.g. `0.20`).
- **Restyle anything** — colours, fonts, spacing — in `css/styles.css`.
  The colour palette lives in the `:root` block at the very top.

## Note

All prices, salaries and tax figures are rough 2026 estimates meant for
learning and reflection only. They are not financial advice — the tool is a
conversation starter about how money, work and wants fit together. The income
tax figure is a simplified approximation of India's new-regime slabs.

---

Made for Brain Behaviour Academy.
