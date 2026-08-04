# Project: Agent Management Hub — Batch Test & Root Cause Inspector

**Team 18** | Track: AI-Powered Product Builds | Hackathon: July 29, 2026
**Hard deadline: 2-min recording submitted by 3:00 PM.**

---

## What we're building

A **Test Console + Root Cause Inspector** for an Agent Configuration Platform. Users run a batch of test questions against their configured AI agent *before deployment*, see pass/fail at a glance, and click any failure to get an **automatically attributed root cause** (knowledge gap / instruction conflict / tool error) plus an inline fix suggestion.

**Demo domain:** Medical Aesthetics Clinic — a "Med-Spa Consultation Agent" answering patient questions about Botox, liposuction, dermal fillers, laser hair removal, chemical peels, microneedling, skincare, and pre/post-procedure care.

**Differentiator vs. Intercom's Fin Batch Test:** Fin makes you manually rate answers and manually pick a root cause. We auto-attribute the root cause AND show instruction-level traceability (which configured rules were followed vs. violated) — something no competitor offers.

**One-line positioning:** "Fin's Batch Test, but with auto root cause attribution and instruction-level traceability."

---

## Tech stack

- **React 18 + TypeScript + Vite**, living in `Hackthon_Batch_Testing/`.
- UI components come from the Keystone design system (`@byted-keystone/react`, `@fe-infra/keystone-icons-react`). Prefer a Keystone component over a hand-rolled one.
- Styling is plain CSS in a single `src/app.css` — no CSS-in-JS, no Tailwind.
- Data is mock data in `src/data.ts`, typed and imported at build time. No JSON fetching, no network calls.

Run it with:

```bash
cd Hackthon_Batch_Testing && npm install && npm run dev
```

Dev server is on port 5173. `npm run build` typechecks (`tsc --noEmit`) then builds.

**Do not add another framework, state library, CSS framework, or bundler** on top of this. If you think you need a library, ask the team first.

---

## Project structure

```
Hackthon_Batch_Testing/
  index.html                        — Vite entry
  vite.config.ts / tsconfig.json    — build config
  src/main.tsx                      — React root
  src/App.tsx                       — state, wiring, modal + evaluation flow
  src/app.css                       — all styles
  src/data.ts                       — types + mock question bank
  src/components/
    TopBar.tsx                      — agent name / version header
    IconRail.tsx, FinSidebar.tsx    — left navigation chrome
    TestConsole.tsx                 — question list, filters, run evaluation
    EvaluatePanel.tsx               — Root Cause Inspector (right panel)
    AddQuestionModals.tsx           — generate / add-manually / coming-soon modals
```

`node_modules/` and `dist/` are gitignored — do not commit build output.

---

## The data contract (DO NOT CHANGE WITHOUT TEAM AGREEMENT)

The contract is the TypeScript types in `src/data.ts` — they are the source of truth, not this file. Current shape:

```ts
type EvalStatus = 'pass' | 'knowledge_gap' | 'failure';
type ReviewVerdict = 'agree' | 'disagree';

interface TestQuestion {
  id: string;
  category: Category;          // one of CATEGORIES in data.ts
  question: string;
  status: EvalStatus | null;   // null until "Run evaluation"
  review: ReviewVerdict | null;// null until the reviewer weighs in
  answer: string;              // supports **bold** and emoji
  content: AnswerSource[];     // "Content (n)" group
  guidance: AnswerSource[];    // "Guidance (n)" group — cited rules only
  rootCause?: RootCause;       // present for knowledge_gap / failure
  instructions?: InstructionTrace[]; // rule-by-rule trace; section hidden when absent
  fixSuggestion?: FixSuggestion;     // section hidden when absent
  searchEvidence?: string;     // shown in Sources when nothing was retrieved
}

interface AnswerSource   { kind: 'content' | 'guidance'; title: string; meta: string }
interface RootCause      { label: string; detail: string }
interface InstructionTrace { rule: string; status: 'followed' | 'violated'; detail: string }
interface FixSuggestion  { action: string; detail: string }
```

**Field rules:**
- `status` is `'pass' | 'knowledge_gap' | 'failure'`, or `null` before evaluation runs.
- `instructions[].status` is `'followed'` or `'violated'` only.
- Optional fields (`rootCause`, `instructions`, `fixSuggestion`) are authored only for the story scenarios; the Inspector hides those sections when absent.
- Empty `content` / `guidance` means nothing was retrieved — the Inspector falls back to `searchEvidence`.

---

## UI layout

- **Left chrome:** `IconRail` + `FinSidebar` navigation.
- **Top bar:** agent name + version label.
- **Summary strip:** appears once evaluation has run — three chips: Pass (green), Knowledge gap (orange), Failure (red), each with a count.
- **Left panel (Test Console):** question table (checkbox / Question / Answer status / Result), an "Add questions" dropdown, and the **Run evaluation** button.
- **Right panel (Root Cause Inspector):** sections rendered per question —
  1. **Answer** — agent response
  2. **Instructions** — each rule with green check (followed) or red cross (violated) + why
  3. **Sources** — Content / Guidance groups, or search evidence when nothing was retrieved
  4. **Fix Suggestion** — root cause label + recommended action

**Color semantics (use consistently everywhere):**
| Meaning | Color |
|---|---|
| Pass / rule followed | green |
| Knowledge gap | orange |
| Failure / rule violated | red |

---

## Team ownership

| Role | Owns | Files |
|---|---|---|
| **R1 — Test Console** | Filter tabs, question list w/ status icons + root cause tags, run evaluation | `src/components/TestConsole.tsx` |
| **R2 — Inspector** | Collapsible sections, check/cross rendering, fix suggestion card | `src/components/EvaluatePanel.tsx` |
| **R3 — Data & Demo** | Question bank + scenario authoring, demo script, dry runs | `src/data.ts` |
| **R4 — Integrator** | App shell, state wiring, click-to-inspect flow, modals, bug fixes | `src/App.tsx`, `src/components/AddQuestionModals.tsx` |
| **R5 — QA & Polish** | Cross-browser check, visual consistency pass, recording setup, backup demo device | `src/app.css` (coordinate w/ R1+R2) |

**Note:** `src/app.css` is shared by every panel, so coordinate before large edits there.

---

## Conventions

- Panels are presentational React components taking props. App-level state lives in `src/App.tsx`; panels don't own it.
- Commit messages: short, present tense ("add summary badges", not "added summary badges").
- Branch naming: `r1/console`, `r2/inspector`, `r3/data`, `r4/shell`, `r5/polish`.
- CSS: use CSS custom properties for the status colors, defined once in `src/app.css`. Never hardcode hex values in TSX.

---

## Do NOT

- Do not make real LLM API calls. **Everything is mock data.** No network dependency during the demo.
- Do not change the data contract unilaterally.
- Do not edit another role's file.
- Do not push directly to `main` — push your branch, R4 merges.
- Do not commit `node_modules/` or `dist/` — both are gitignored.
- Do not add another framework, state library, or bundler.
- Do not add features not in the demo script. Polish what's in the script instead.

---

## Demo scenarios (these are the deliverable — everything serves these)

1. **Baseline** — Pass 4/6. Click "Is Botox painful? I'm scared of needles." → all green checks, sources cited. Establishes the agent mostly works.
2. **Knowledge Gap** — Click "Can I get liposuction if I'm taking blood thinners?" → Sources: none, with evidence "search returned 0 results from 142 documents" → auto-attributed **Knowledge Gap** → fix: create a medication contraindications KB article.
3. **Instruction Conflict (the "aha")** — Click "I want to book a liposuction appointment for next Tuesday..." → three red crosses (booked without consultation, promised results, omitted risks) → auto-attributed **Instruction Conflict** → fix: merge the conflicting rules.

If time runs short, **Scenario 3 is the one that must be flawless.** It's the moment the demo lands.

---

## Schedule checkpoints

| Time | Checkpoint |
|---|---|
| 10:30 AM | Data contract locked, stack confirmed, roles assigned |
| 11:40 AM | R1 + R2 hand components to R4 |
| 12:00 PM | Integrated click-through flow works end to end |
| 1:45 PM | Full demo run-through, start recording |
| 2:30 PM | Recording done, buffer begins |
| 3:00 PM | **Submitted** |

---

## Demo device rules

- One designated laptop, decided before lunch.
- Clean browser window: no notifications, no bookmarks bar, no extra tabs.
- Screen recording software tested before 12:00 PM.
- R5 keeps a second machine with a working copy as backup.
