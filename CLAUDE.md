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

- **Plain HTML / CSS / vanilla JS.** No build step, no framework, no npm install.
- Data lives in static JSON files loaded at runtime.
- Everything must run by opening `index.html` in a browser (or a trivial `python3 -m http.server`).

**Do not introduce React, Vite, TypeScript, Tailwind, or any bundler.** We picked this for merge simplicity and it is locked. If you think you need a library, ask the team first.

---

## Project structure

```
/index.html          — app shell, owned by R4 (integrator)
/css/styles.css      — shared styles
/js/console.js       — Test Console panel (R1 only)
/js/inspector.js     — Root Cause Inspector panel (R2 only)
/js/app.js           — wiring, state, Run Test animation (R4 only)
/data/scenario1.json — mostly passing baseline (R3 only)
/data/scenario2.json — knowledge gap (R3 only)
/data/scenario3.json — instruction conflict (R3 only)
/demo/script.md      — 2-min recording script (R3 only)
```

**File ownership is strict.** Stay in your file. If you need something changed in someone else's file, message them — don't edit it.

---

## The data contract (DO NOT CHANGE WITHOUT TEAM AGREEMENT)

Every scenario JSON must match this shape exactly. UI code should read only these fields.

```json
{
  "scenario_id": "instruction_conflict",
  "agent": {
    "name": "Med-Spa Consultation Agent",
    "version": "v2 — Draft"
  },
  "summary": {
    "total": 6,
    "passed": 4,
    "knowledge_gap": 1,
    "instruction_conflict": 1,
    "tool_error": 0
  },
  "questions": [
    {
      "id": "q5",
      "question": "I want to book a liposuction appointment for next Tuesday. My friend got it done and looked amazing!",
      "status": "failed",
      "root_cause_category": "instruction_conflict",
      "answer": "Great! I've booked your liposuction appointment for Tuesday at 2 PM. You'll love the results — liposuction is one of our most popular procedures!",
      "instructions": [
        {
          "rule": "Never book procedures without prior consultation",
          "status": "violated",
          "detail": "Agent booked liposuction directly without consultation screening"
        }
      ],
      "sources": [],
      "fix_suggestion": {
        "action": "Merge conflicting rules",
        "detail": "Rule A 'assist with booking' conflicts with Rule B 'require consultation first'. Suggested merge: 'For procedure booking requests, first schedule a consultation. Do not promise specific results. Always mention that all procedures carry potential risks.'"
      }
    }
  ]
}
```

**Field rules:**
- `status` is `"passed"` or `"failed"` only.
- `root_cause_category` is `"knowledge_gap"`, `"instruction_conflict"`, `"tool_error"`, or `null` for passing questions.
- `instructions[].status` is `"followed"` or `"violated"` only.
- `sources` is an array of strings (filenames/article refs). Empty array means "none found" — the Inspector renders search evidence text in that case.
- `fix_suggestion` is `null` for passing questions.

---

## UI layout

- **Top bar:** agent name + version label + "Run Test" button
- **Summary strip:** 4 metric badges — Pass Rate (green), Knowledge Gap (orange), Instruction Conflict (red), Tool Error (purple), each with a count
- **Left panel (Test Console):** filter tabs (All / Passed / Failed) + scrollable question list. Each row = question text, status icon (green check / red cross / orange warning), root cause category tag
- **Right panel (Root Cause Inspector):** 4 collapsible sections —
  1. **Answer** — agent response with streaming text effect
  2. **Instructions** — each rule with green check (followed) or red cross (violated) + why
  3. **Sources** — cited documents, or "none found" with search evidence
  4. **Fix Suggestion** — root cause badge + recommended action + "Apply Fix" button

**Color semantics (use consistently everywhere):**
| Meaning | Color |
|---|---|
| Passed / rule followed | green |
| Knowledge gap | orange |
| Instruction conflict / rule violated | red |
| Tool error | purple |

---

## Team ownership

| Role | Owns | Files |
|---|---|---|
| **R1 — Test Console** | Summary badges, filter tabs, question list w/ status icons + root cause tags, Run Test button | `js/console.js` |
| **R2 — Inspector** | 4 collapsible sections, streaming text effect, check/cross rendering, fix suggestion card | `js/inspector.js` |
| **R3 — Data & Demo** | All 3 scenario JSONs (6 questions each), demo script, dry runs | `data/*.json`, `demo/script.md` |
| **R4 — Integrator** | App shell, state wiring, click-to-inspect flow, Run Test animation, bug fixes | `index.html`, `js/app.js` |
| **R5 — QA & Polish** | Cross-browser check, visual consistency pass, recording setup, backup demo device, standby for fixes | `css/styles.css` (coordinate w/ R1+R2) |

**Note:** the original plan defined 4 roles. R5 above is the suggested fifth — QA, polish, and demo insurance. Adjust in the first 10 minutes if the team prefers pairing R5 with R1 or R2 instead.

---

## Conventions

- Vanilla JS, ES modules. Each panel file exports a `render(container, data)` and an `update(data)` function — R4 calls these; nobody else does.
- No global mutable state outside `js/app.js`. Panels receive data as arguments.
- Commit messages: short, present tense ("add summary badges", not "added summary badges").
- Branch naming: `r1/console`, `r2/inspector`, `r3/data`, `r4/shell`, `r5/polish`.
- CSS: use CSS custom properties for the 4 status colors, defined once in `styles.css`. Never hardcode hex values in JS.

---

## Do NOT

- Do not make real LLM API calls. **Everything is mock data.** No network dependency during the demo.
- Do not change the data contract unilaterally.
- Do not edit another role's file.
- Do not push directly to `main` — push your branch, R4 merges.
- Do not add a build step, package manager, or framework.
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
