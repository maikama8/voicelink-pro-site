# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Multi-page website served by a Node/Express backend using EJS templates.
- Backend handles contact form email via SMTP and provides a Billing section that links to a MagnusBilling portal.
- Frontend styles live under `public/style.css` (migrated from the original static site).

Commands
- Install deps: `npm install`
- Run in dev (auto‑reload): `npm run dev` then open http://localhost:3000
- Start in prod: `npm start`
- Env setup: copy `.env.example` to `.env` and fill SMTP and MagnusBilling values.
- Build: none (no bundler).
- Lint/Tests: none configured.

Key pages and routes
- `GET /` Home (hero + teasers)
- `GET /services`, `GET /pricing`, `GET /about`
- `GET /contact` Contact form; `POST /contact` sends email via SMTP
- `GET /billing` Billing portal link (uses `MB_PORTAL_URL`)

Architecture and structure
- Server: `server.js` (Express), loads `dotenv`, serves `public/`, parses form bodies, renders EJS views from `views/`.
- Views: EJS with shared partials
  - `views/partials/head.ejs` — HTML head, fonts, CSS
  - `views/partials/header.ejs` — sticky header and primary nav
  - `views/partials/footer.ejs` — footer and closing tags
  - `views/pages/*.ejs` — page templates (`index`, `services`, `pricing`, `about`, `contact`, `billing`)
- Styling: `public/style.css` with tokens, utilities, and components (header/hero/sections/cards/bullets/pricing/form/footer). Responsive via CSS Grid and `@media (min-width: 820px)`.
- Email: Nodemailer transporter configured from env; form fields validated server‑side; errors/success surfaced on `contact.ejs`.
- MagnusBilling: `MB_PORTAL_URL` used to link users to the portal; backend includes minimal `/api/mb/*` endpoints with a scaffold client in `utils/mbClient.js` (adjust headers/paths per your MagnusBilling setup).

Configuration (.env)
- `PORT`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO_EMAIL`
- `MB_PORTAL_URL` (portal link shown on /billing)
- Optional for future API integration: `MB_API_BASE_URL`, `MB_API_TOKEN` or `MB_API_KEY`/`MB_API_SECRET`

Notes
- To test MagnusBilling connectivity (after setting env): start the app and GET `/api/mb/ping`. Adjust `utils/mbClient.js` paths/headers to match your MB API.
- If you expand MagnusBilling (e.g., create customers, fetch invoices), add authenticated routes under `/api/mb/*` and update this file with any new flows.
