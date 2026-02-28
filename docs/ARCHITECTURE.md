# myWebsite — Architecture Description

## 1. Overview

myWebsite is a full-stack, multi-language web application with public and members-only content, built on **Next.js 16** (App Router) and deployed on **Railway.com**. It provides user registration with email verification, login/logout, and password reset functionality, all served in English and German.

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Homepage │  │ Members  │  │ Auth     │  │ Impr.  │  │
│  │ (public) │  │ (protected)│ │ Pages   │  │ Page   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                  Next.js 16 (App Router)                │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Middleware (next-intl + Auth Protection)        │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌───────────────────────────────┐    │
│  │  Pages &      │  │  API Routes                   │    │
│  │  Layouts      │  │  /api/auth/[...nextauth]      │    │
│  │  (RSC + CSC)  │  │  /api/auth/register           │    │
│  │               │  │  /api/auth/verify-email        │    │
│  │               │  │  /api/auth/forgot-password     │    │
│  │               │  │  /api/auth/reset-password      │    │
│  └──────────────┘  └───────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  NextAuth.js │  │  Prisma ORM  │  │  Resend      │   │
│  │  (Auth)      │  │  (DB Access) │  │  (Email)     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │
          │     ┌───────────▼──────┐    ┌─────▼──────┐
          │     │  PostgreSQL      │    │  Resend    │
          └────►│  (Railway)       │    │  API       │
                └──────────────────┘    └────────────┘
```

---

## 2. Tech Stack

| Layer            | Technology                | Version  | Purpose                              |
|------------------|---------------------------|----------|--------------------------------------|
| Framework        | Next.js (App Router)      | 16.1.x   | Full-stack React framework           |
| Language         | TypeScript                | 5.9.x    | Type-safe JavaScript                 |
| Styling          | Tailwind CSS              | 4.2.x    | Utility-first CSS framework          |
| Authentication   | NextAuth.js (Auth.js v5)  | 5.x beta | Session management, JWT, credentials |
| Database ORM     | Prisma                    | 6.19.x   | Type-safe database access            |
| Database         | PostgreSQL                | —        | Relational database (Railway add-on) |
| Internationalization | next-intl             | 4.8.x    | DE / EN locale routing & translations|
| Email            | Resend                    | 6.9.x    | Transactional email delivery         |
| Validation       | Zod                       | 4.3.x    | Runtime schema validation            |
| Password Hashing | bcryptjs                  | 3.0.x    | Secure password hashing              |
| Hosting          | Railway.com               | —        | Deployment platform (Nixpacks build) |

---

## 3. Directory Structure

```
mywebsite/
├── messages/                    # Translation files
│   ├── en.json                  # English translations
│   └── de.json                  # German translations
├── prisma/
│   └── schema.prisma            # Database schema (User model)
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind CSS import
│   │   ├── layout.tsx           # Root layout (minimal, delegates to locale layout)
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/route.ts    # NextAuth catch-all handler
│   │   │       ├── register/route.ts         # POST: User registration
│   │   │       ├── verify-email/route.ts     # GET:  Email verification
│   │   │       ├── forgot-password/route.ts  # POST: Request password reset
│   │   │       └── reset-password/route.ts   # POST: Reset password with token
│   │   └── [locale]/
│   │       ├── layout.tsx       # Locale-aware layout (header, footer, providers)
│   │       ├── page.tsx         # Homepage (public free content)
│   │       ├── members/
│   │       │   └── page.tsx     # Protected member content
│   │       ├── auth/
│   │       │   ├── login/page.tsx
│   │       │   ├── register/page.tsx
│   │       │   ├── forgot-password/page.tsx
│   │       │   ├── reset-password/page.tsx
│   │       │   └── verify-email/page.tsx
│   │       └── impressum/
│   │           └── page.tsx     # Legal impressum page
│   ├── components/
│   │   ├── Header.tsx           # Navigation bar with auth state & language switcher
│   │   ├── Footer.tsx           # Footer with impressum link
│   │   └── LanguageSwitcher.tsx # DE / EN toggle component
│   ├── i18n/
│   │   ├── routing.ts           # Locale routing config (en, de)
│   │   ├── navigation.ts        # Locale-aware Link, redirect, usePathname, useRouter
│   │   └── request.ts           # Server-side locale resolution & message loading
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── email.ts             # Resend email helpers (verification, password reset)
│   ├── auth.ts                  # NextAuth configuration (Credentials provider, JWT)
│   └── middleware.ts            # Combined i18n routing + auth route protection
├── railway.json                 # Railway deployment config
├── next.config.mjs              # Next.js config with next-intl plugin
├── postcss.config.js            # PostCSS config for Tailwind CSS v4
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
├── .env.example                 # Template for required environment variables
└── .env.local                   # Local environment variables (not committed)
```

---

## 4. Authentication Flow

### 4.1 Registration

```
User fills register form
        │
        ▼
POST /api/auth/register
        │
        ├── Validate input (Zod schema)
        ├── Check for existing email
        ├── Hash password (bcrypt, 12 rounds)
        ├── Generate verification token (crypto.randomBytes)
        ├── Create User in database (emailVerified = false)
        └── Send verification email via Resend
                │
                ▼
User clicks email link
        │
        ▼
GET /api/auth/verify-email?token=xxx
        │
        ├── Look up user by verificationToken
        ├── Set emailVerified = true
        └── Clear verificationToken
```

### 4.2 Login / Logout

```
User fills login form
        │
        ▼
NextAuth signIn("credentials", { email, password })
        │
        ├── Look up user by email
        ├── Check emailVerified === true
        ├── Compare password hash (bcrypt)
        ├── Return user object → JWT token created
        └── Session available via auth() / useSession()

Logout → signOut() clears JWT session
```

### 4.3 Password Reset

```
User enters email on forgot-password page
        │
        ▼
POST /api/auth/forgot-password
        │
        ├── Look up user by email
        ├── Generate resetToken + 1-hour expiry
        └── Send reset email via Resend
                │
                ▼
User clicks email link → /auth/reset-password?token=xxx
        │
        ▼
POST /api/auth/reset-password
        │
        ├── Validate token exists and not expired
        ├── Hash new password
        └── Clear resetToken and resetTokenExpiry
```

---

## 5. Internationalization (i18n)

The app supports **English** (`en`) and **German** (`de`) via `next-intl` with URL-based locale routing:

| Concept | Implementation |
|---------|---------------|
| URL structure | `/{locale}/path` — e.g. `/en/members`, `/de/auth/login` |
| Default locale | `en` (auto-redirect from `/` to `/en`) |
| Translation files | `messages/en.json`, `messages/de.json` |
| Server components | `useTranslations('Namespace')` |
| Client components | `useTranslations('Namespace')` via `<NextIntlClientProvider>` |
| Navigation | Locale-aware `<Link>`, `useRouter`, `redirect` from `@/i18n/navigation` |
| Switching | `<LanguageSwitcher>` component in the header |
| Emails | Locale-aware subjects and HTML content |

### Translation Namespaces

- `Navigation` — Header nav labels
- `HomePage` — Hero section, feature cards
- `MembersPage` — Member content cards
- `Auth.login`, `Auth.register`, `Auth.forgotPassword`, `Auth.resetPassword`, `Auth.verifyEmail` — All auth form strings
- `Impressum` — Legal page content
- `Footer` — Footer text
- `Common` — Shared strings (loading, errors)

---

## 6. Route Protection

The middleware (`src/middleware.ts`) serves two purposes:

1. **Locale routing** — Detects and redirects to the appropriate locale via `next-intl` middleware
2. **Auth protection** — Checks for a valid session on protected paths (`/members`); unauthenticated users are redirected to `/{locale}/auth/login?callbackUrl=...`

```
Incoming Request
      │
      ├── /api/* or /_next/* or static files → Pass through
      │
      ├── /{locale}/members/* → Check auth session
      │       │
      │       ├── Authenticated → Apply i18n middleware → Serve page
      │       └── Not authenticated → Redirect to /{locale}/auth/login
      │
      └── All other paths → Apply i18n middleware → Serve page
```

---

## 7. Database Schema

```prisma
model User {
  id                String    @id @default(cuid())
  name              String?
  email             String    @unique
  passwordHash      String
  emailVerified     Boolean   @default(false)
  verificationToken String?   @unique
  resetToken        String?   @unique
  resetTokenExpiry  DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

Key design decisions:
- **cuid** for IDs — URL-safe, sortable, globally unique
- **emailVerified** flag — Login is blocked until the user clicks the verification link
- **verificationToken** / **resetToken** — Single-use, cleared after consumption
- **resetTokenExpiry** — 1-hour TTL prevents stale reset links

---

## 8. Deployment (Railway)

### Services

| Service | Type | Purpose |
|---------|------|---------|
| mywebsite | Web Service | Next.js application (standalone output) |
| PostgreSQL | Database Add-on | User data storage |

### Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Railway PostgreSQL (auto) | Database connection string |
| `AUTH_SECRET` | Manual (`npx auth secret`) | NextAuth JWT signing key |
| `NEXT_PUBLIC_APP_URL` | Manual | Public URL for email links (e.g. `https://mywebsite.up.railway.app`) |
| `RESEND_API_KEY` | Manual | Resend API key for transactional emails |

### Build & Deploy Pipeline

```
GitHub Push
    │
    ▼
Railway detects push → reads railway.json
    │
    ├── Build: npx prisma generate && npm run build
    ├── Output: standalone Next.js bundle
    └── Start: npm start
```

### `railway.json` Configuration

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 9. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Password storage | bcrypt with 12 salt rounds |
| Session management | JWT-based sessions (NextAuth), `AUTH_SECRET` signing |
| Email enumeration | Forgot-password always returns success regardless of email existence |
| Token security | `crypto.randomBytes(32)` — 256-bit random tokens |
| Token expiry | Reset tokens expire after 1 hour |
| Input validation | Zod schemas on all API routes |
| Route protection | Middleware-level auth check before page render |
| CSRF | NextAuth built-in CSRF protection |

---

## 10. Future Enhancements

- **Custom email domain** — Replace `onboarding@resend.dev` with verified domain for production
- **Rate limiting** — Add API rate limiting on auth routes
- **OAuth providers** — Add Google/GitHub social login alongside credentials
- **Role-based access** — Add user roles (admin, member) for granular permissions
- **Content CMS** — Replace static member content with a headless CMS
- **Database migrations** — Use `prisma migrate` instead of `prisma db push` for production
- **Logging & monitoring** — Add structured logging and error tracking (e.g. Sentry)
- **Unit & E2E tests** — See [Testing Strategy](TESTING.md) for the complete testing approach
