# Workflows — planning and idea-to-implementation

## Planning framework

A plan exists to surface risk before it costs anything, and to make verification decidable. It is not a deliverable in itself.

### Plan sizing (decide first, honestly)

| Task shape | Plan |
|---|---|
| 1 file, obvious change | No written plan. State the change + verification method in 2 lines, do it. |
| 2–4 files, clear approach | 3–6 bullet plan inline: goal, steps, verification. |
| Multi-file / new component | Full plan (below). |
| Architectural / hard to reverse | Full plan + alternatives + user sign-off before executing. |

Overplanning is a real failure mode: a beautiful plan for a trivial task wastes tokens and, worse, gets stale the moment reality disagrees with it. **Plan the smallest amount that makes risk visible.**

### Full plan template

```
GOAL: <one sentence — what changes for the user when done>
ACCEPTANCE: <observable criteria; each one checkable by a command or inspection>
CONSTRAINTS: <perf, compat, style, deadline — from the actual codebase/user, not invented>
ASSUMPTIONS: <each tagged verified/unverified per thinking-style.md>
APPROACH: <chosen approach in 2–3 sentences>
REJECTED: <alternative → why it lost, one line each>
STEPS: <ordered; each step small enough to verify before the next>
RISKS: <what could go wrong → how you'll detect it early>
VERIFICATION: <exact commands/checks that prove ACCEPTANCE — written NOW>
```

Rules:
- If VERIFICATION is empty or vague ("test it"), the plan is not done.
- Riskiest step goes as early as the dependency order allows — fail fast on the part most likely to sink the approach.
- The plan is a living document: when reality contradicts it, update it visibly ("Step 3 changed: X because Y"), don't silently diverge.

## Idea → implementation workflow

For turning a fuzzy idea into shipped code. Six stages; cheap sessions can stop at any stage boundary and hand off cleanly.

### 1. Sharpen
Convert the idea into acceptance criteria. Interrogate the request: Who uses this? What do they see/do differently? What's explicitly OUT of scope? Write acceptance criteria as observable behaviors. **If you can't write acceptance criteria, you don't understand the idea yet** — ask the user the specific question that unblocks you (batched, once).

### 2. Recon
Explore the codebase *for this feature*: where does similar functionality live, what patterns does this project already use (routing, state, error handling, tests), what will this touch? Output: the working note lists key files + the pattern to imitate. New code should look like it was written by the same team on the same day as its neighbors.

### 3. Spike the riskiest unknown
Identify the ONE thing most likely to invalidate the approach (unknown API behavior, perf ceiling, library capability). Prove it works with the smallest possible experiment — throwaway code allowed and expected. **Do this before building anything on top of it.** If the spike fails, you've spent 5% of the budget learning the approach is wrong; that's a win.

### 4. Thin vertical slice
Build the narrowest end-to-end path: one happy-path case working across all layers (UI→API→storage, or CLI→core→output). Not "the data layer for everything" — a slice reveals integration surprises while they're cheap. Verify the slice runs.

### 5. Expand and harden
Widen case by case: remaining inputs, edge cases, error paths at system boundaries. Add tests as behavior stabilizes (test-first for anything with tricky logic; test-after is acceptable for glue). Keep each expansion a small verified diff. Resist gold-plating — acceptance criteria are the fence.

### 6. Close
- Run full verification (`verification-checklist.md`).
- Refutation pass: attack your own diff as a hostile reviewer.
- Update docs the change made stale (and only those).
- Report per SKILL.md §Report: outcome first, evidence, assumptions, leftovers.

## Research workflow (for "figure out X" tasks with no code deliverable)

1. Write the question precisely, including what decision the answer feeds.
2. Enumerate where answers could live (code, git history, docs, running behavior, web) — cheapest-first.
3. Gather with targeted searches; record findings with source per finding.
4. Distinguish in the output: **established** (evidence cited) / **inferred** (from what) / **unknown**.
5. Answer the question asked, then stop. Research expands to fill any budget; the question is the fence.

## Mid-task re-planning triggers

Re-visit the plan (don't just push on) when:
- A step failed twice the same way.
- You discovered a constraint the plan didn't know about.
- The diff is growing past what the plan predicted (scope was misjudged).
- You're about to do something not in STEPS (either it's scope creep — drop it — or the plan is wrong — fix the plan first, visibly).
