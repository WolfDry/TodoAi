# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server at http://localhost:3000
npm run build    # Production build
```

No test runner is configured. TypeScript is checked by `react-scripts` at build/start time.

## Environment Variables

Copy `.env.exemple` to `.env` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Architecture

Split-pane React app (Create React App + TypeScript). Left pane is a todo manager; right pane is an FullCalendar week view.

**Data flow:**
- `App.tsx` owns `events` state and passes an `onScheduled` callback down to `TodoPanel`
- `TodoPanel` is the master component: loads all data from Supabase on mount, owns all CRUD logic
- `CalendarPanel` is display-only — it just renders whatever events it receives as props

**State management:** React hooks only (`useState`, `useEffect`, `useRef`). No global state library. All mutable state lives in `TodoPanel` and is passed down via props.

**Backend:** Supabase (PostgreSQL). Tables: `category`, `task`, `subtask` with foreign keys and cascade deletes. Client singleton is at `src/utils/supabase.ts`.

**Types:** `src/types/todo.types.ts` (`Category`, `Task`, `Subtask`, `Priority`) and `src/types/calendar.types.ts` (`CalendarEvent`).

**Styling:** Per-component CSS files in `src/styles/`. Uses CSS custom properties and OKLCH color space for category colors.
