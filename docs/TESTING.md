# myWebsite — Testing Strategy

This document describes the testing approach, tooling, and coverage goals for the myWebsite project.

---

## 1. Testing Pyramid

```text
        ┌──────────┐
        │   E2E    │  ← Playwright (browser-based full flows)
        │ (fewer)  │
        ├──────────┤
        │Component │  ← @testing-library/react (render + interact)
        │ (medium) │
        ├──────────┤
        │  Unit    │  ← Vitest (API routes, utilities, middleware)
        │ (many)   │
        └──────────┘
```

The project follows the classic testing pyramid: a broad base of fast unit tests, a middle layer of component tests, and a small number of slower but high-confidence E2E tests.

---

## 2. Tooling

| Tool | Purpose | Config File |
| ---- | ------- | ----------- |
| **Vitest** | Unit & component test runner | `vitest.config.ts` |
| **@testing-library/react** | Component rendering & interaction | — |
| **@testing-library/jest-dom** | Custom DOM matchers (`.toBeInTheDocument()`) | `src/__tests__/setup.ts` |
| **@vitejs/plugin-react** | JSX/TSX transform for Vitest | `vitest.config.ts` |
| **Playwright** | E2E browser testing (Chromium + Firefox) | `playwright.config.ts` |

---

## 3. Test Structure

```text
mywebsite/
├── src/__tests__/                  # Unit & component tests (Vitest)
│   ├── setup.ts                    # Global mocks (next/navigation, next-intl, next-auth)
│   ├── api/
│   │   ├── register.test.ts        # User registration API
│   │   ├── verify-email.test.ts    # Email verification API
│   │   ├── forgot-password.test.ts # Password reset request API
│   │   └── reset-password.test.ts  # Password reset execution API
│   ├── components/
│   │   ├── Header.test.tsx         # Header nav, auth state, mobile menu
│   │   ├── Footer.test.tsx         # Footer content and links
│   │   └── LanguageSwitcher.test.tsx # Locale toggle behavior
│   ├── lib/
│   │   └── email.test.ts           # Resend email utility
│   └── middleware.test.ts          # Route protection and locale extraction
├── e2e/                            # End-to-end tests (Playwright)
│   ├── homepage.spec.ts            # Homepage rendering and content
│   ├── navigation.spec.ts          # Page navigation flows
│   ├── language.spec.ts            # Language switching (EN ↔ DE)
│   ├── auth.spec.ts                # Auth forms, protection, login flow
│   └── impressum.spec.ts           # Impressum legal page
├── vitest.config.ts                # Vitest configuration
└── playwright.config.ts            # Playwright configuration
```

---

## 4. Unit Tests

### 4.1 API Route Tests

Each API route (`register`, `verify-email`, `forgot-password`, `reset-password`) is tested with mocked dependencies:

- **Prisma** — mocked via `vi.mock('@/lib/prisma')` to avoid database access
- **bcrypt** — mocked to control password comparison results
- **Resend email** — mocked to verify email sending without network calls
- **Next.js Request/Response** — uses native `Request` objects and validates `NextResponse` output

| Test File | Tests | What's Covered |
|-----------|-------|----------------|
| `register.test.ts` | 6 | Validation errors, duplicate email (409), successful registration (201), default locale |
| `verify-email.test.ts` | 3 | Missing token (400), invalid token (400), successful verification (200) |
| `forgot-password.test.ts` | 4 | Invalid email, enumeration prevention (always 200), token generation, default locale |
| `reset-password.test.ts` | 5 | Missing fields, short password, invalid token, expired token, success |

### 4.2 Middleware Tests

Tests for the middleware helper functions that determine which paths are protected and extract locale from URLs:

| Test File | Tests | What's Covered |
|-----------|-------|----------------|
| `middleware.test.ts` | 11 | `isProtectedPath` (members pages), `getLocaleFromPath` (locale extraction) |

### 4.3 Email Utility Tests

Tests for the Resend email helper functions with mocked Resend client:

| Test File | Tests | What's Covered |
|-----------|-------|----------------|
| `email.test.ts` | 7 | English/German subjects, verification/reset URLs, locale handling |

---

## 5. Component Tests

Component tests render React components in a jsdom environment using `@testing-library/react` and verify output and interactions.

**Mocking Strategy:**
- `next-intl` — `useTranslations()` returns a function that maps keys to readable strings
- `next-auth/react` — `useSession()` returns configurable auth state
- `@/i18n/navigation` — `Link` renders as plain `<a>` tags, `useRouter` returns mock methods

| Test File | Tests | What's Covered |
|-----------|-------|----------------|
| `Header.test.tsx` | 10 | Brand rendering, nav links, auth state (login/logout), user name display, mobile menu toggle |
| `Footer.test.tsx` | 7 | Brand, description, nav links, Impressum link, copyright year, section headings |
| `LanguageSwitcher.test.tsx` | 5 | Locale buttons, active state highlighting, `router.replace` on click |

---

## 6. End-to-End Tests (Playwright)

E2E tests run in real browsers against the dev server. Playwright auto-starts the server via the `webServer` config.

**Browsers:** Chromium, Firefox

| Test File | Tests | What's Covered |
|-----------|-------|----------------|
| `homepage.spec.ts` | 4 | Page load, redirect to `/en`, header nav, footer, feature cards |
| `navigation.spec.ts` | 6 | Impressum, login, register navigation; cross-links between auth pages |
| `language.spec.ts` | 4 | EN→DE switch, DE→EN switch, German content, page preservation on switch |
| `auth.spec.ts` | 7 | Members redirect to login, login form validation, register form, forgot password |
| `impressum.spec.ts` | 3 | EN and DE impressum pages, legal content presence |

---

## 7. Running Tests

### Unit & Component Tests (Vitest)

```bash
# Run in watch mode (interactive development)
npm test

# Run once (CI-friendly)
npm run test:unit

# Run with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npx playwright test --ui

# Run a specific test file
npx playwright test e2e/homepage.spec.ts
```

---

## 8. Coverage Goals

| Layer | Current | Target |
|-------|---------|--------|
| API routes | ✅ All 4 routes covered | 100% of API routes |
| Middleware | ✅ Helper functions covered | Route protection logic |
| Email utility | ✅ Both functions covered | All email templates |
| Components | ✅ All 3 components covered | All interactive components |
| E2E critical paths | ✅ Auth, navigation, i18n | All user-facing journeys |

**Overall goal:** Maintain unit test coverage above **80%** for the `src/` directory, with all critical auth flows covered by E2E tests.

---

## 9. CI Integration

For CI/CD pipelines (e.g. GitHub Actions, Railway), use these commands:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Run unit tests
  run: npm run test:unit

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test report
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

### Key CI Considerations

- Vitest runs without any external services (all dependencies mocked)
- Playwright needs a running dev server (auto-started via `webServer` config)
- E2E tests against auth forms that call real API routes will need a test database
- Set `CI=true` environment variable to enable Playwright retries and single-worker mode

---

## 10. Adding New Tests

### Adding a Unit Test

1. Create a file in `src/__tests__/` matching the source file's path
2. Mock external dependencies (`vi.mock(...)`)
3. Use `describe` / `it` / `expect` from Vitest
4. Run `npm test` to verify

### Adding a Component Test

1. Create a `.test.tsx` file in `src/__tests__/components/`
2. Import `render` and `screen` from `@testing-library/react`
3. Mock i18n and auth hooks as needed (see existing component tests)
4. Use `screen.getByText()`, `fireEvent.click()`, etc. for interaction

### Adding an E2E Test

1. Create a `.spec.ts` file in `e2e/`
2. Use `test` and `expect` from `@playwright/test`
3. Navigate with `page.goto()`, interact with `page.click()` / `page.fill()`
4. Assert with `expect(page).toHaveURL()`, `expect(locator).toBeVisible()`
