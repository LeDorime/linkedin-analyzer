@AGENTS.md

# linkedin-analyzer — Project Brief for Claude Code

## What this app does
A web app where a user pastes in their LinkedIn profile content (or uploads a
PDF export of it) and states a goal (e.g. job search, building a personal
brand, sales/networking, recruiting). The app uses AI to analyze the profile
against that goal and returns:
- An overall grade from D to A
- A breakdown of what's working well
- Specific, actionable suggestions for what to improve, section by section
  (headline, about, experience, skills, etc.)

## Important constraint to respect
LinkedIn blocks automated scraping and has no public API for arbitrary
profile data. Do NOT attempt to fetch a profile by URL. Instead:
- Primary input method: user pastes their profile text into structured
  form fields (headline, about/summary, experience bullets, skills).
- Nice-to-have input method: user uploads the PDF LinkedIn generates via
  its own "Save to PDF" export feature; parse text out of that PDF
  server-side and pre-fill the form fields for the user to review/edit.

## Recommended tech stack
- Framework: Next.js 14+ (App Router), TypeScript
- Styling/UI: Tailwind CSS + shadcn/ui (needed for the "clean, professional"
  look requested — don't hand-roll components that shadcn already covers)
- AI: Anthropic API (Claude) for the analysis/grading logic. Keep the API
  key server-side only, called from a Next.js API route / server action —
  never expose it to the client.
- PDF parsing (if implementing the PDF upload path): a server-side PDF
  text-extraction library, run inside an API route.
- Data storage: none required for the MVP — the flow can be fully
  stateless (submit form, get result, done). Do not add a database or
  auth in v1 unless asked. If the user later wants saved history of past
  analyses, that's when Supabase + auth gets introduced — flag it as a
  future step, don't build it preemptively.
- Deployment target: Vercel (pairs naturally with Next.js).

## Suggested project structure
```
linkedin-analyzer/
  app/
    page.tsx                 # main form + results UI
    api/
      analyze/route.ts       # server route calling the Anthropic API
      parse-pdf/route.ts     # optional: PDF upload -> extracted text
  components/
    ProfileForm.tsx
    GradeBadge.tsx
    FeedbackSection.tsx
  lib/
    anthropic.ts             # client setup, prompt construction
    grading.ts                # shared types for grade/feedback shape
  .env.local.example
  .gitignore
  CLAUDE.md
```

## Core build tasks (rough order)
1. Scaffold the Next.js + TypeScript + Tailwind + shadcn project.
2. Build the profile input form (goal selector + structured fields).
3. Build the API route that sends the profile + goal to Claude and
   returns structured JSON: `{ grade, summary, strengths[], improvements[] }`.
   Ask Claude to respond in strict JSON so it's easy to render.
4. Build the results UI: grade badge (D–A), strengths list, improvements
   list, all styled cleanly.
5. Add the PDF upload path (parse PDF -> prefill form) once the core
   paste-and-analyze flow works end to end.
6. Polish: loading states, error handling (e.g. Claude API failures,
   malformed responses), empty states, mobile responsiveness.

## Environment variables
```
ANTHROPIC_API_KEY=
```
Add `.env.local` to `.gitignore`; commit `.env.local.example` with the key
name but no value.

## Git & GitHub workflow (required)
No repo exists yet for this project — set one up as the very first step.

1. `git init` inside the project folder.
2. Create `.gitignore` (Next.js default: `node_modules`, `.next`, `.env.local`,
   etc.) before the first commit.
3. First commit: `chore: initial project scaffold`.
4. Create a new GitHub repo (via `gh repo create` if the GitHub CLI is
   available, otherwise ask the user for a repo URL) and set it as
   `origin`.
5. Push the initial commit to `main`.
6. From then on: **commit after every completed task or feature** —
   not multiple unrelated changes bundled into one commit, and not
   half-finished work. Use conventional commit prefixes:
   - `feat:` new functionality
   - `fix:` bug fixes
   - `refactor:` code change with no behavior change
   - `style:` formatting/UI-only tweaks
   - `docs:` documentation
   - `chore:` tooling/config
7. Push to GitHub after each commit (or at minimum before ending a work
   session) so nothing is left only on the local machine.
8. Never commit `.env.local` or any API key.

## Style notes
- Keep the UI clean and professional — generous whitespace, restrained
  color palette, clear typographic hierarchy. This is a tool people will
  use to evaluate their professional image, so it should look credible.
- Keep AI-facing prompts and response parsing in `lib/`, not scattered
  inline in components — makes the grading logic easy to tune later.
