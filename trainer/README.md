# Math Statistics Exam Trainer

A focused exam-training platform for Mathematical Statistics.

## Features

- Questions grouped by **topic category**, not by exam date.
- 8 categories:
  - Standardization
  - Poisson process (with Binomial, discrete and continuous distinctions)
  - Law of Total Probability and Bayes' Rule
  - Combinatorics
  - Two-sided confidence intervals
  - The Central Limit Theorem
  - Hypothesis tests
  - Maximum Likelihood Estimation
- Full step-by-step worked solutions with:
  - formulas first
  - variable definitions
  - substitution and simplification
  - final conclusion
- Category filtering by difficulty and formula/topic.
- Practice mode:
  - random by category or mixed
  - timed mode
  - reveal after attempt
  - self-rating (`understood`, `almost`, `need review`)
- Progress tracking with local persistence:
  - completed questions
  - flagged-for-review questions
  - self-ratings
- Optional AI Tutor panel (ChatGPT) for step-by-step help.

## Run locally

From this folder:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Optional: enable AI Tutor (ChatGPT)

Create `trainer/.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Then restart dev server (`npm run dev`).

Notes:
- API key is created in OpenAI Platform: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- AI Tutor runs through `/api/ai-tutor` and needs local/server runtime (not pure static hosting).

## Public deployment (GitHub Pages)

This app is configured for static export and auto-deploy through:

- [`/.github/workflows/deploy-pages.yml`](/Users/nicolas_stpierre/Documents/Math statistic 2026/.github/workflows/deploy-pages.yml)
- Public URL target: [https://stni25xr.github.io/math-statistic-2026/](https://stni25xr.github.io/math-statistic-2026/)

`NEXT_BASE_PATH` is set in the workflow to `/math-statistic-2026` so links work on Pages.
`NEXT_STATIC_EXPORT=1` is used in Pages workflow.

Important:
- GitHub Pages is static-only. The AI Tutor backend route (`/api/ai-tutor`) does not run there.

## Web deployment with AI Tutor enabled

To have AI Tutor available on the web, deploy this Next.js app to a server runtime (for example Vercel).

### Vercel quick setup

1. Import the GitHub repo in Vercel.
2. Set Root Directory to `trainer`.
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, e.g. `gpt-4.1-mini`)
4. Deploy.

This runtime will serve `/api/ai-tutor`, so AI Tutor works publicly.

## Project structure

```text
app/
  page.tsx                        # Home dashboard
  categories/[slug]/page.tsx      # Category page
  questions/[id]/page.tsx         # Full question view
  practice/page.tsx               # Practice mode
  api/ai-tutor/route.ts           # AI tutor backend
components/
  category-card.tsx
  formula-box.tsx
  question-card.tsx
  step-by-step-solution.tsx
  common-mistake-alert.tsx
  exam-shortcut-tip.tsx
  progress-tracker.tsx
  daily-plan-card.tsx
  topic-filter-bar.tsx
  quiz-mode-panel.tsx
  practice-panel.tsx
  question-view-client.tsx
  category-page-client.tsx
lib/
  types.ts                        # Typed data model
  study-data.ts                   # Categories, questions, crash plan
  progress.ts                     # Local progress model helpers
```

## How to add more questions

1. Open `lib/study-data.ts`.
2. Add a new object to `studyQuestions` using the required shape:
   - `id`
   - `category`
   - `subcategory`
   - `sourceExam`
   - `originalProblemNumber`
   - `title`
   - `question`
   - `formulasNeeded`
   - `whyMethodApplies`
   - `steps[]`
   - `finalAnswer`
   - `difficulty`
   - `tags[]`
   - `commonMistake`
   - `examShortcut`
   - `memorizeThis`
   - `patternHint`
3. Keep the question in the best-fit category even if it touches multiple topics.
4. If useful, set `crossReferenceCategory`.

## Source basis

Content is regrouped from the uploaded materials in repository root (exam PDFs + formula sheet), then rewritten into clean training format with method-first explanations.
