# Voicelink Pro Website

Multi‑page marketing site for VoIP services with a Node/Express backend, EJS templates, SMTP contact form, and MagnusBilling integration points.

## Features
- Multi‑page UI: Home, Services, Pricing, About, Contact, Billing
- Contact form: server‑side validation and email delivery via SMTP (Nodemailer)
- MagnusBilling: Billing page linking to portal, minimal `/api/mb/*` endpoints scaffolded
- Simple stack: Express + EJS, static assets in `public/`, no bundler

## Tech Stack
- Runtime: Node.js
- Server: Express
- Views: EJS templates with shared partials
- Email: Nodemailer (SMTP)

## Getting Started

### 1) Install dependencies
```
npm install
```

### 2) Configure environment
Copy `.env.example` to `.env` and fill in values.

Required (server):
- `PORT` — defaults to 3000 if omitted

SMTP (email sending):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` (`true`/`false`)
- `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM` — display sender, e.g. "Voicelink Pro <no-reply@example.com>"
- `CONTACT_TO_EMAIL` — where contact submissions are delivered

MagnusBilling (link + API):
- `MB_PORTAL_URL` — user‑facing billing portal URL (shown on /billing)
- `MB_API_BASE_URL` — API base URL (change here if the API base changes)
- Provide either `MB_API_TOKEN` or `MB_API_KEY`/`MB_API_SECRET` depending on your MB setup

Example (edit with your real values):
```
PORT=3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="Voicelink Pro <no-reply@example.com>"
CONTACT_TO_EMAIL=you@example.com

MB_PORTAL_URL=https://billing.example.com
MB_API_BASE_URL=http://192.99.144.167/mbilling
MB_API_KEY=... # or use MB_API_TOKEN
MB_API_SECRET=...
```

### 3) Run the app
- Development (auto‑reload):
```
npm run dev
```
- Production:
```
npm start
```
Open http://localhost:3000

## Application Structure
```
server.js                 # Express app, routes, contact handler, MB API routes
views/
  partials/
    head.ejs              # <head>, fonts, stylesheet
    header.ejs            # Top nav
    footer.ejs            # Footer and closing tags
  pages/
    index.ejs             # Home
    services.ejs          # Services
    pricing.ejs           # Pricing
    about.ejs             # About
    contact.ejs           # Contact (form)
    billing.ejs           # Billing portal link (uses MB_PORTAL_URL)
public/
  style.css               # Styles migrated from original static site
utils/
  mbClient.js             # MagnusBilling HTTP client scaffold (axios)
.env.example              # Template for environment variables
WARP.md                   # Warp operator guide (commands, architecture)
```

## Routes
Pages
- `GET /` — Home
- `GET /services` — Services
- `GET /pricing` — Pricing
- `GET /about` — About
- `GET /contact` — Contact form
- `POST /contact` — Submits form, sends email via SMTP
- `GET /billing` — Billing portal link (from `MB_PORTAL_URL`)

MagnusBilling API (scaffold)
- `GET /api/mb/ping` — Connectivity test (adjust path in `utils/mbClient.js` per your MB API)
- `GET /api/mb/customers` — Example passthrough to list customers (adjust for real paths/params)

Contact form submit example:
```
curl -X POST http://localhost:3000/contact \
  -d "name=Jane Doe" \
  -d "email=jane@example.com" \
  -d "company=Acme" \
  -d "message=Hello!"
```

MagnusBilling connectivity example:
```
# Start the app after setting MB_API_* env vars
curl http://localhost:3000/api/mb/ping
```

## MagnusBilling Notes
- The client in `utils/mbClient.js` is a scaffold. Update `authHeaders()` and endpoint paths to match your MagnusBilling deployment or wrapper requirements.
- If you prefer token auth, set `MB_API_TOKEN` and adapt headers accordingly.
- Add additional endpoints under `/api/mb/*` (e.g., create customer, invoices) as needed.

## Deployment
- Ensure all env vars from `.env.example` are configured in your platform.
- Behind a reverse proxy, set `PORT` appropriately. No build step is required.

## Troubleshooting
- Contact email fails: verify SMTP host/port, credentials, and that `CONTACT_TO_EMAIL` is set.
- `/api/mb/*` returns 503: ensure `MB_API_BASE_URL` and keys are set in `.env` and the app was restarted.
- CORS: endpoints are same‑origin for the site; add CORS middleware if calling from external origins.

## Scripts
- `npm run dev` — Start with nodemon
- `npm start` — Start server

## License
Private/unlicensed (update if you plan to distribute).
