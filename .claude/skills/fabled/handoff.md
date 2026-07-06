# Handoff — Retiring Fellow Mode

Purpose: leave a project in a state where a cheaper session (or a junior engineer) can debug, extend, validate, and eventually advance it **without you** — at the standard you hold today. The test of a handoff is not what you wrote; it's what the successor can *do* on day one without asking anyone.

## When to run it

- Explicitly asked ("hand this off", "prepare this for Sonnet", "retiring fellow mode").
- End of an expensive session whose knowledge would otherwise evaporate.
- A project is moving to smaller-model maintenance.

## The successor test

Write everything against these five checks. Each maps to a deliverable below.
1. Can they **run** it? (build, test, deploy — exact commands, verified)
2. Can they **navigate** it? (where things live, in 20 lines)
3. Can they **change** it safely? (conventions, danger zones, verification path)
4. Do they know **why** it's shaped this way? (decisions + rejected alternatives)
5. Do they know **what's next and what's rotten**? (roadmap + honest debt list)

## Procedure

### 1. Verify the ground truth first
Before writing a word: run the build, the tests, the app. **A handoff describing a broken state as working is worse than no handoff.** Whatever is broken gets fixed (if in scope) or documented as broken with symptoms.

### 2. Write the handoff package
Prefer the project's existing doc locations (CLAUDE.md, README, docs/). Create `docs/HANDOFF.md` only for what has no home. Contents, mapped to the five checks:

- **Runbook** (check 1): exact commands for setup/build/test/run/deploy, each one *executed by you now*, with expected output noted. Include the environment gotchas you hit.
- **Map** (check 2): ≤20 lines. Top-level areas → what lives there → the 5–10 files that matter most and why. Not a file listing — a tour.
- **Change guide** (check 3): the project's conventions (pattern to imitate for a new endpoint/component/module, with one exemplar file named), the verification path ("before any PR: run X, Y"), and **danger zones** — the places where naive edits break distant things, each with *why*.
- **Decision record** (check 4): the load-bearing decisions — context, choice, rejected alternatives, consequences. Include decisions that live only in your head/session; that's the knowledge that dies at retirement.
- **State of the union** (check 5): what's done and verified; what's in flight (+ exact next step for each); known debt/bugs *honestly* — including the parts you're not proud of and the failure you expect first ("the cache layer will be the first thing to fall over under load, because…").
- **Lessons file** (durable memory): one lesson per entry, one-line summary first — corrections learned, approaches confirmed, dead ends (so no one re-explores them). Don't duplicate what the repo already records; delete notes that proved wrong.

### 3. Calibrate for a smaller model
The successor may be a Sonnet-class session in Lite Mode. Therefore:
- **Explicit over implied**: name files by path; give commands verbatim; never say "the usual way."
- **Recipes for the recurring tasks**: the 3–5 most likely next tasks, each as a short numbered recipe (files to touch, pattern to copy, checks to run).
- **Fences**: state what a cheap session should NOT attempt alone (e.g. "schema migrations: escalate to a human or Full Rigor mode") — knowing where the edge is *is* the senior knowledge.
- Point the successor at this skill: "run /fabled lite by default; /fabled full for anything in the danger zones."

### 4. Review the package
Run Docs Lead + Test Lead + Cost Controller (`multi-agent-review.md`). The core question: *could a session with zero shared context execute the runbook and the first recipe?* Best check when affordable: a fresh-context subagent given only the package, asked to (a) say how it would do recipe #1 and (b) list what's missing. Fix what it stumbles on.

### 5. Leave it better than you found it
Retirement standard: stale docs corrected (don't let the handoff coexist with docs that lie), working note converted into durable records, scratch files cleaned up, and anything reusable promoted into the project's skills/docs so the knowledge compounds instead of evaporating.

## Session-sized handoff (the lightweight variant)

When a single session ends mid-task (context limit, budget, end of day), write this block — 10 lines, not a document:

```
HANDOFF
TASK: <one sentence + acceptance criteria>
STATE: <done + verified / done + UNverified / in progress>
NEXT: <the single next action, concretely>
KEY FILES: <paths + one clause each>
DECISIONS: <made so far, one line each>
OPEN: <unverified assumptions, pending questions>
GOTCHAS: <anything that cost you >10 minutes>
VERIFY WITH: <exact commands>
```

The successor session starts by reading this block INSTEAD of re-orienting from scratch — that's the token saving that pays for writing it.
