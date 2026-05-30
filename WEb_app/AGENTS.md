<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 🧠 ThinkCare AI — Agent Handbook

> **Read this entire file before writing a single line of code.**
> This document defines the project architecture, team roles, coding rules, and cross-repo boundaries for all agents (human or AI) working on ThinkCare AI.

---

## 📁 Workspace Layout

The root workspace (`f:\Project file\hp\`) contains **three independent git repositories**:

| Folder | Role | Port | Stack |
|---|---|---|---|
| `WEb_app/` | Next.js Frontend + API Routes | 3000 | TypeScript, Next.js 15, Prisma, PostgreSQL |
| `ThinkCare_SLM/` | SLM Inference Engine | 8002 | Python, FastAPI, Transformers (Qwen2.5 fine-tune) |
| `Hackathon_AI_Model/` | CatBoost Classifier Engine | 8001 | Python, FastAPI, CatBoost |

> **Each folder is its own git repo.** Never `git push` from the root. Always `cd` into the specific subfolder first.

---

## 🏗️ Architecture Overview

```
User Browser
    │
    ▼
WEb_app (Next.js — Port 3000)
    ├── /api/chat          → forwards to SLM (port 8002) + Hackathon AI (port 8001)
    ├── /api/dashboard/insight → calls SLM for personalized insight (port 8002)
    ├── /api/onboarding    → writes to PostgreSQL via Prisma
    └── All other pages    → SSR/CSR via Next.js App Router
          │
          ├── ThinkCare_SLM (FastAPI — Port 8002)
          │       └── POST /chat  — accepts { message, language, user_context }
          │
          └── Hackathon_AI_Model (FastAPI — Port 8001)
                  └── POST /predict — accepts { symptoms[], language }
```

### Key Source Files (WEb_app)

| File | Purpose |
|---|---|
| `src/lib/translations.ts` | **Master bilingual dictionary** (English + Bangla). All UI strings must be added here. |
| `src/lib/contextEngine.ts` | AI feature orchestration; defines `AI_FEATURES` and `ContextEngine` class |
| `src/contexts/LanguageContext.tsx` | React Context that provides `language` state + `setLanguage` to all pages |
| `src/app/api/chat/route.ts` | Chat API route — forwards to both backend engines |
| `src/app/api/dashboard/insight/route.ts` | Dashboard AI insight generation |
| `src/middleware.ts` | Route protection (auth checks), session validation |
| `prisma/schema.prisma` | Database schema (User, Assessment, ChatSession, etc.) |

---

## 🌍 Bilingual System (CRITICAL)

ThinkCare AI fully supports **English (`en`) and Bangla (`bn`)**.

### Rules Every Agent Must Follow

1. **Never hardcode UI text.** All strings go in `src/lib/translations.ts` under the correct section key.
2. Use the `useTranslation()` hook (from `LanguageContext`) to render strings: `t('section.key')`.
3. **Bangla detection regex:** `[\u0980-\u09ff]` — used in API routes to auto-detect user language.
4. API routes must read `language` from the request body and pass it downstream to backend engines.
5. Backend engines (`ai_api.py` in both Python repos) accept a `language` field in the POST body and adjust prompts accordingly.
6. Language preference is persisted in the database on the user record and loaded into `LanguageContext` on session start.

### Adding a New Translation Key

```ts
// In src/lib/translations.ts, inside the correct section:
newKey: { en: "English text here", bn: "বাংলা টেক্সট এখানে" },
```

---

## 👥 Agent Roles & Responsibilities

### 🖥️ Frontend Agent
**Scope:** `WEb_app/src/` — pages, components, hooks, contexts, styles

**Responsibilities:**
- Build and maintain all React pages using the Next.js App Router (`src/app/`)
- Keep all UI strings in `translations.ts`; never hardcode text
- Use `useTranslation()` from `LanguageContext` for every user-facing string
- Maintain responsive design (desktop + mobile variants exist for Dashboard and Chat pages)
- Use Tailwind CSS classes only — no inline style props for layout
- Follow existing component patterns in `src/components/`

**Must NOT:**
- Modify Python backend files
- Change Prisma schema without coordinating with the Backend Agent
- Add new npm packages without checking if a built-in Next.js/React solution exists

---

### 🔧 Backend / API Agent
**Scope:** `WEb_app/src/app/api/`, `WEb_app/prisma/`, database logic

**Responsibilities:**
- Maintain all Next.js API routes (`src/app/api/**`)
- Manage Prisma schema evolution; run `npx prisma migrate dev` for schema changes
- Ensure all API routes validate authentication via `middleware.ts` before processing
- Propagate `language` parameter from frontend through to ML engine calls
- Handle error states gracefully; all API routes must return structured JSON errors

**Must NOT:**
- Modify ML model weights or Python inference code
- Bypass the middleware auth layer

---

### 🤖 ML / SLM Agent
**Scope:** `ThinkCare_SLM/`, `Hackathon_AI_Model/`

**Responsibilities:**
- Maintain and extend `ai_api.py` in both repos
- The SLM endpoint (`POST /chat`) accepts: `{ "message": str, "language": "en"|"bn", "user_context": {} }`
- The CatBoost endpoint (`POST /predict`) accepts: `{ "symptoms": [], "language": "en"|"bn" }`
- Respond in the language specified by the `language` field
- When `language == "bn"`, system prompts and response formatting must use Bangla
- Keep model loading logic in the `lifespan` startup handler (not on first request)
- Log inference stats (latency, device, token count) using the `[INFO]` prefix

**Must NOT:**
- Change API port numbers (SLM = 8002, CatBoost = 8001)
- Remove the `language` parameter from any endpoint
- Modify `WEb_app/` source files

---

### 🗄️ Database / Infrastructure Agent
**Scope:** `WEb_app/prisma/`, PostgreSQL, environment variables

**Responsibilities:**
- Keep `prisma/schema.prisma` as the single source of truth for data models
- Always generate a migration file (`npx prisma migrate dev --name <description>`) for schema changes
- Document all new env vars in `.env.example`
- Manage the `.env` file format — never commit secrets

**Current Key Models:**
- `User` — auth, profile, language preference
- `HealthMetric` — onboarding biometric data (age, sex, height, weight, BP, SpO2, etc.)
- `ChatSession` / `ChatMessage` — persisted chat history
- `Assessment` — disease predictions + confidence scores

---

### 🔒 Security Agent
**Scope:** `src/middleware.ts`, auth routes, session management

**Responsibilities:**
- Maintain route protection rules in `middleware.ts`
- All `/dashboard`, `/chat`, `/profile`, `/settings` routes require authenticated sessions
- Admin routes (`/admin/**`) require `role === "ADMIN"` check
- Sanitize all user inputs before passing to ML engines
- Never log PII (Personally Identifiable Information) in console or server logs

---

### 🧪 QA / Testing Agent
**Scope:** All repos — integration tests, API tests, smoke tests

**Responsibilities:**
- Before any deployment, run `npm run build` in `WEb_app/` — build must pass with zero errors
- Run `npx tsc --noEmit` to check TypeScript types
- Test bilingual flows: send a Bangla message to `/api/chat` and verify the response is in Bangla
- Test both ML backends independently with `curl` or Python `requests` before frontend integration
- Verify mobile-responsive layouts on Dashboard and Chat pages

**Standard Smoke Tests:**
```bash
# 1. TypeScript check
cd "f:\Project file\hp\WEb_app" && npx tsc --noEmit

# 2. Production build
npm run build

# 3. SLM health check (when running on server)
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "আমার জ্বর হচ্ছে", "language": "bn"}'

# 4. CatBoost health check (when running on server)
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "headache"], "language": "en"}'
```

---

## ⚙️ Development Environment

### WEb_app (Next.js)
```bash
cd "f:\Project file\hp\WEb_app"
npm install          # install dependencies
npm run dev          # start dev server (port 3000)
npm run build        # production build (must succeed before git push)
npx tsc --noEmit     # type check only
```

### ThinkCare_SLM
```bash
cd "f:\Project file\hp\ThinkCare_SLM"   # or on Linux server: ~/thinkcare_slm
python3 ai_api.py    # starts FastAPI on port 8002
```

### Hackathon_AI_Model
```bash
cd "f:\Project file\hp\Hackathon_AI_Model"
python3 ai_api.py    # starts FastAPI on port 8001
```

---

## 🔀 Git Workflow

> ⚠️ Each subfolder is an **independent git repo** with its own remotes.

```bash
# Commit WEb_app changes
cd "f:\Project file\hp\WEb_app"
git add -A
git commit -m "feat: your message"
git push

# Commit SLM changes
cd "f:\Project file\hp\ThinkCare_SLM"
git add -A
git commit -m "fix: your message"
git push

# Commit AI Model changes
cd "f:\Project file\hp\Hackathon_AI_Model"
git add -A
git commit -m "chore: your message"
git push
```

**Commit message format:**
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code restructure (no behavior change)
- `chore:` — config, dependency, or tooling change
- `docs:` — documentation only

---

## 🚫 Cross-Repo Constraints

| From \ To | WEb_app | ThinkCare_SLM | Hackathon_AI_Model |
|---|---|---|---|
| **WEb_app** | ✅ owns | HTTP only (port 8002) | HTTP only (port 8001) |
| **ThinkCare_SLM** | ❌ no access | ✅ owns | ❌ no access |
| **Hackathon_AI_Model** | ❌ no access | ❌ no access | ✅ owns |

- Communication between `WEb_app` and the Python engines is **HTTP-only** via Next.js API routes
- The Python engines are **not** imported as modules into Next.js; they are external services
- Never add cross-repo file imports or shared file dependencies

---

## 📋 Quick Reference: Common Pitfalls

| Pitfall | Solution |
|---|---|
| Hardcoded English text in JSX | Move to `translations.ts`, use `t('section.key')` |
| `max_length` deprecation warning in Transformers | Use `max_new_tokens` instead of `max_length` |
| `torch_dtype` deprecation | Use `dtype=` instead of `torch_dtype=` |
| Mistral tokenizer regex warning | Set `fix_mistral_regex=True` when loading |
| HTTP 400 on ML endpoints | Check `Content-Type: application/json` header |
| Prisma client out of sync | Run `npx prisma generate` after schema changes |
| Build fails on missing translation key | Add both `en` and `bn` values to `translations.ts` |
| `Both max_new_tokens and max_length set` | Remove `max_length` from `generate()` call |
| Language not propagating to ML engine | Verify `language` field in request body from `/api/chat/route.ts` |

---

## 🧩 Adding a New Feature — Checklist

- [ ] Add translation keys (`en` + `bn`) to `translations.ts`
- [ ] Create/update API route in `src/app/api/`
- [ ] Update Prisma schema if new data needs to be persisted (`prisma migrate dev`)
- [ ] If ML engine changes needed: update `ai_api.py` in the appropriate repo
- [ ] Ensure `language` parameter flows end-to-end (frontend → API route → ML engine)
- [ ] Test in both English and Bangla
- [ ] Run `npm run build` — zero errors required
- [ ] Commit each repo independently

---

*Last updated by: Antigravity (AI Agent) | ThinkCare AI project*
