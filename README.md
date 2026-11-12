# AYURVEDA∞ — Complete AI-Powered BAMS Academic Ecosystem

Full-stack Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + RLS + Storage), and Google Gemini (`@google/genai`) platform built for Bachelor of Ayurvedic Medicine and Surgery (BAMS) students in India.

## Architecture Overview
- **Frontend (`src/app`, `src/components`)**: Next.js App Router with Dark (`#080E0C` / `#27C68B` / `#D6B66F`) and Light theme tokens, collapsible desktop sidebar, 5-tab mobile bottom navigation (`Home`, `Learn`, `Practice`, `AI Tutor`, `Library`), `Cmd/Ctrl+K` global search, and offline-first PWA (`public/manifest.json`, `public/sw.js`).
- **Domain Engines (`src/lib/engines`)**:
  - `fsrs.ts`: FSRS spaced-repetition scheduler for active recall.
  - `exam-engine.ts`: One-tap mock exam generator & server-authoritative scoring with negative marking and improvement plans.
  - `pyq-analytics.ts`: Concept-cluster recurrence & year-wise trend analyzer.
- **AI Layer (`src/lib/ai/gemini.ts`, `src/app/api/ai/generate/route.ts`)**: Server-side `@google/genai` integration supporting streaming, structured JSON (`mcq`, `mindmap`), multimodal image/PDF doubt solving, rate limiting, and token usage logging.
- **Database (`supabase/migrations`)**: Normalized 40+ table PostgreSQL schema (`001_initial_schema.sql`), strict Row Level Security (`002_rls_policies.sql`), and NCISM 2021-22+ & Legacy CCIM curriculum seed (`003_seed_curriculum.sql`).

## Local Setup & Production Deployment
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment variables**:
   Copy `.env.example` to `.env.local` and set:
   - `GEMINI_API_KEY` (Google AI Studio) & `GEMINI_MODEL=gemini-2.5-flash`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. **Apply Supabase migrations**:
   Run `supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql`, and `003_seed_curriculum.sql` in your Supabase SQL Editor (or via `supabase db push`).
4. **Run tests & production build**:
   ```bash
   npm test
   npm run typecheck
   npm run build
   ```
5. **Deploy to Vercel**:
   Push to GitHub, import into Vercel, add the environment variables above, and deploy.
