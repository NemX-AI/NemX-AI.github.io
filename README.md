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

## Content and contact

- Add confirmed announcements and papers in `src/site-content.ts`. News supports
  an ISO date (`YYYY-MM-DD`), category, paragraphs, and a source link. Publications
  support a thumbnail, authors, venue, year, a version/status note, and resource links.
  Use the official publication title; a preprint's earlier title can go in `note`.
  Thumbnail provenance is recorded in `public/media/publications/SOURCES.md`.
  Empty lists show a forthcoming message rather than sample research.
- Set `contactEmails` in that file to the team's public mailboxes. The contact form
  validates the visitor's email, purpose, and message, then prepares an email
  draft addressed to both listed contacts. Each address also has its own email
  link. The visitor reviews and sends the draft in their email app. Until a mailbox is
  configured, submission stays disabled. GitHub Pages does not receive or store
  form submissions; direct website delivery would require a separate service.
- Edit the mission and three research directions in `src/SymbiosisSection.tsx`.
- The explanation in `src/SymbiosisDemo.tsx` connects Human and AI with an SVG
  loop. Staggered light trails carry intent and action, with reception rings at
  each end. Its eight-second cycle pauses offscreen, in a hidden tab, or via the
  pause control. Reduced-motion mode shows the static diagram. Animation and
  layout styles live in `src/symbiosis-demo.css`.
- Demo button mappings and video dimensions live in `src/demos.ts`; media is in
  `public/media/demos/` and loads only after a visitor opens a player.

The News, Publications, and Contact pages use `#news`, `#publications`, and
`#contact` links so direct visits, refreshes, and browser history work on GitHub
Pages without server rewrite rules. The homepage retains its section anchors.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages at https://nemx-ai.github.io/.
In the repo settings, set **Pages → Source** to **GitHub Actions** (one-time).
