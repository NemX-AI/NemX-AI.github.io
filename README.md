# NemX-AI.github.io

Company website, built with Vite + React + Tailwind CSS + three.js.
Initially a replica of [vikod3/handstouch](https://github.com/vikod3/handstouch).

## Development

Requires Node.js >= 22.13.

```bash
npm ci
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages at https://nemx-ai.github.io/.
In the repo settings, set **Pages → Source** to **GitHub Actions** (one-time).
