# LearnMate Frontend — Extracted from Figma Make

This is the real React/TypeScript project that Figma Make generated from your
`Design_StudyMind_AI_UI.make` file, extracted from its internal Git history.

## What's here
- `src/app/App.tsx` — the whole prototype (landing page + dashboard + charts),
  currently a single ~2,270-line file using **mock/hardcoded data**. No backend
  calls yet — that's the Week 1–2 work in your build roadmap.
- `src/app/components/ui/` — a full shadcn/ui component library (buttons,
  dialogs, forms, tables, sidebar, etc.) already installed and ready to use.
- `src/styles/` — Tailwind v4 setup + your brand theme.
- `src/imports/` — logo and image assets used in the design.
- `guidelines/Guidelines.md` — Figma Make's own design notes, if any were set.

## What I added (Figma Make strips these from exports)
Figma Make's `.gitignore` excludes its own entry-point plumbing
(`__figma__entrypoint__.ts`), so the exported project can't run standalone
on its own. I added the missing pieces so it builds and runs normally:
- `index.html` — the Vite HTML entry point
- `src/main.tsx` — mounts `<App />` into the page
- `tsconfig.json` — TypeScript config with the `@/*` path alias your code uses
- `dev`/`preview` scripts in `package.json`
- `typescript`, `@types/react`, `@types/react-dom` as dev dependencies
- `react`/`react-dom` promoted to direct dependencies (they were only listed
  as optional peer dependencies, which some package managers won't
  auto-install)

I test-installed and test-built this project before sending it to you — it
compiles cleanly with no errors.

## Update: now refactored into a proper component structure

The single 2,270-line `App.tsx` has been split into:

```
src/app/
├── App.tsx                     # Router setup only (react-router v7)
├── router/
│   ├── pageRoutes.ts            # page-name <-> URL path map
│   └── useGoTo.ts               # navigation hook matching the old setPage() API
├── context/
│   └── AppStateContext.tsx      # shared role/darkMode state (was prop-drilled before)
├── lib/
│   ├── constants.ts             # brand color tokens (PRP, IND, DARK, etc.)
│   └── mockData.ts              # all mock arrays (replace with API calls next)
├── components/
│   ├── shared/index.tsx         # Btn, Badge, TypeBadge, StatCard, DonutChart, Field
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── DashboardLayout.tsx  # now uses <Outlet/> instead of a children prop
│   ├── auth/AuthShell.tsx
│   ├── figma/ImageWithFallback.tsx   (unchanged, pre-existing)
│   └── ui/                       (unchanged shadcn/ui library, pre-existing)
└── pages/
    ├── LandingPage.tsx, LoginPage.tsx, RegisterPage.tsx
    ├── DashboardPage.tsx, CoursesPage.tsx, ResourcesPage.tsx
    ├── AITutorPage.tsx, AIRecommendationsPage.tsx
    ├── ProgressPage.tsx, StudyPlanPage.tsx, SkillsPage.tsx, QuizPage.tsx
    ├── ProfilePage.tsx, LecturerPage.tsx, AdminPage.tsx
```

### Real routing, not fake state
The original prototype used `useState("landing")` and manually rendered pages by
string match — no real URLs, no back button, no bookmarking, no deep-linking.
It now uses `react-router` v7 with real routes:

- `/` → Landing, `/login`, `/register`
- `/app/dashboard`, `/app/courses`, `/app/quiz`, etc. — all rendered through a
  shared `DashboardLayout` via `<Outlet />`

**Every existing page component was left internally untouched.** They still call
`setPage("quiz")` exactly as before — a small `useGoTo()` hook now performs a
real `navigate()` under that same function signature, so none of the original
JSX/logic needed to be rewritten to adopt real routing.

### Two real bugs fixed along the way (verified with `tsc --noEmit`)
1. `ResourcesPage.tsx`'s AI Tutor chat state was typed too narrowly (inferred
   only `role: "ai"` from the initial array), which would have thrown a type
   error the moment a user message was added. Fixed with an explicit union type.
2. Missing `src/vite-env.d.ts` (also stripped by Figma Make's export) meant
   TypeScript didn't know how to type `.png` imports. Added it back.

I ran a full `npm install`, `tsc --noEmit`, and `vite build` before packaging
this — it compiles clean with zero errors.

### What's still mock data
Every page in `pages/` still reads from `src/app/lib/mockData.ts`. That's your
next step per the build roadmap: once your Spring Boot backend exists, replace
those imports with real `axios` calls (e.g. `useEffect` + `fetch` on mount, or
TanStack Query, which is already installed).


