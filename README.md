# myWebsite

---

🤖 **An experiment to find out what AI code generation can accomplish.**

**Here my prompt:**

> Help me to create a new website. It should have a homepage, a members area that requires login, and an impressum page. Users should be able to register, verify their email, log in and out, and reset their password. The site should support both English and German. Use Next.js, Tailwind CSS, Prisma with PostgreSQL, and deploy it to Railway.

**What it created:**

A full-stack membership website with authentication, bilingual content (EN/DE), and a protected members area — built with Next.js and deployed on Railway.

🔗 **Check out the result: [member-websiteghcp-opus-production.up.railway.app](https://member-websiteghcp-opus-production.up.railway.app)**

> 📐 For a deep dive into the system design, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**
> 🧪 For a deep dive into the testing strategy, see **[docs/TESTING.md](docs/TESTING.md)**

---

A full-stack, multi-language web application with public content, protected member area, and complete authentication workflows. Built with Next.js 16 and designed for deployment on Railway.com.

---

## Features

- 🏠 **Homepage** — Public free content with hero section and feature cards
- 🔒 **Members Area** — Protected content, accessible only to registered and verified users
- 🔑 **Authentication** — Login / Logout with secure JWT sessions
- 📝 **Registration** — Sign up with email verification workflow
- 🔄 **Password Reset** — Forgot password flow with token-based reset link via email
- 🌍 **Multi-language** — Full German (DE) and English (EN) support with URL-based routing
- 📄 **Impressum** — Legal page with contact information
- 🎨 **Clean Design** — Professional, responsive UI with Tailwind CSS
- 🧪 **Tested** — Unit, component, and E2E tests with Vitest and Playwright

## Tech Stack

| | Technology | Purpose |
| --- | --- | --- |
| ⚡ | **Next.js 16** (App Router) | Full-stack React framework |
| 🎨 | **Tailwind CSS 4** | Styling |
| 🔐 | **NextAuth.js v5** | Authentication (Credentials, JWT) |
| 🗄️ | **Prisma 6** + PostgreSQL | Database ORM + storage |
| 🌐 | **next-intl** | Internationalization (DE / EN) |
| 📧 | **Resend** | Transactional emails |
| ✅ | **Zod** | Input validation |
| 🚀 | **Railway.com** | Hosting & deployment |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database (local or remote)
- **Resend** account for email delivery ([resend.com](https://resend.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| ---------- | ------------- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Generate with `npx auth secret` |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `RESEND_API_KEY` | Your Resend API key |

### 3. Set Up Database

Push the Prisma schema to your database:

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
| --------- | ------------- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests in watch mode |
| `npm run test:unit` | Run unit tests once (CI) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:coverage` | Run unit tests with coverage |
| `npx prisma studio` | Open database browser |
| `npx prisma db push` | Push schema changes to database |

## Deployment (Railway)

1. **Push** this repository to GitHub
2. **Connect** the GitHub repo in [Railway](https://railway.com)
3. **Add** a PostgreSQL database service
4. **Set** environment variables in Railway dashboard:
   - `DATABASE_URL` — auto-linked from PostgreSQL add-on
   - `AUTH_SECRET` — generate with `npx auth secret`
   - `NEXT_PUBLIC_APP_URL` — your Railway domain (e.g. `https://mywebsite.up.railway.app`)
   - `RESEND_API_KEY` — from your Resend dashboard
5. **Deploy** — Railway auto-builds and deploys on push

The included `railway.json` configures the build and deploy pipeline automatically.

## Project Structure

```text
├── docs/ARCHITECTURE.md     # Detailed architecture description
├── messages/                # Translation files (en.json, de.json)
├── prisma/schema.prisma     # Database schema
├── src/
│   ├── app/
│   │   ├── api/auth/        # Auth API routes (register, verify, reset)
│   │   └── [locale]/        # Locale-routed pages
│   ├── components/          # Header, Footer, LanguageSwitcher
│   ├── i18n/                # Internationalization config
│   ├── lib/                 # Prisma client, email helpers
│   ├── auth.ts              # NextAuth configuration
│   └── middleware.ts        # i18n routing + auth protection
├── railway.json             # Railway deployment config
└── .env.example             # Environment variable template
```

For a complete architectural deep-dive including auth flows, security considerations, and deployment details, see the **[Architecture Description](docs/ARCHITECTURE.md)**.

## Architecture Overview

The application follows a layered architecture with Next.js 16 App Router at its core:

```text
┌──────────────────────────────────┐
│         Client (Browser)         │
│  Homepage │ Members │ Auth │ etc │
└──────────────┬───────────────────┘
               │ HTTPS
┌──────────────▼───────────────────┐
│     Next.js 16 (App Router)      │
│  ┌────────────────────────────┐  │
│  │ Middleware (i18n + Auth)   │  │
│  └────────────────────────────┘  │
│  Pages & Layouts │ API Routes    │
│  NextAuth.js │ Prisma │ Resend   │
└──────┬───────────┬───────┬───────┘
       │           │       │
   PostgreSQL    Resend   JWT
   (Railway)      API    Sessions
```

### Authentication Flow

1. **Register** → validate input (Zod) → hash password (bcrypt) → store user → send verification email (Resend)
2. **Verify** → user clicks email link → token validated → `emailVerified = true`
3. **Login** → verify email confirmed → compare password → issue JWT session
4. **Reset** → generate token with 1h expiry → email link → validate token → update password

### Internationalization

- URL-based routing: `/{locale}/path` (e.g. `/en/members`, `/de/auth/login`)
- Default locale: `en` with auto-redirect from `/`
- Translations in `messages/en.json` and `messages/de.json` with typed namespace keys
- Locale-aware emails (subjects and content in user's language)

### Security

| Concern | Mitigation |
| ------- | ---------- |
| Password storage | bcrypt (12 salt rounds) |
| Sessions | JWT signed with `AUTH_SECRET` |
| Email enumeration | Forgot-password always returns 200 |
| Tokens | `crypto.randomBytes(32)` — 256-bit |
| Token expiry | Reset tokens expire after 1 hour |
| Input validation | Zod schemas on all API routes |
| Route protection | Middleware-level auth check |

For the full architecture description, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Testing

The project uses a testing pyramid approach with **Vitest** for unit/component tests and **Playwright** for E2E tests.

### Test Summary

| Layer | Tool | Files | Tests |
| ----- | ---- | ----- | ----- |
| Unit (API routes) | Vitest | 4 | 18 |
| Unit (middleware) | Vitest | 1 | 11 |
| Unit (email utility) | Vitest | 1 | 7 |
| Component | Vitest + Testing Library | 3 | 22 |
| E2E | Playwright | 5 | 24 |
| **Total** | | **14** | **82** |

### Running Tests

```bash
# Unit & component tests (watch mode)
npm test

# Unit & component tests (single run)
npm run test:unit

# E2E tests (requires dev server or auto-starts it)
npx playwright install   # first time only
npm run test:e2e
```

For the complete testing strategy, coverage goals, CI integration guide, and instructions for adding new tests, see **[docs/TESTING.md](docs/TESTING.md)**.

## License

Private project — All rights reserved.
