# Multi-agent review — roles for one model (or several)

Fable-quality output survives adversarial review. This file defines seven roles that provide that review. **Default: one model simulates the roles sequentially** — a role is a stance plus a question list, not a separate process. Spawn real subagents only per the criteria at the bottom.

## The roles

Each role has a stance, key questions, and a required one-block output. When simulating, adopt one role at a time, fully — the value comes from *changing stance*, not from headers.

### Architect
**Stance:** guardian of structure and long-term cost.
**Asks:** Does this fit the codebase's existing patterns or introduce a rival one? Right layer for this logic? Does the dependency direction still make sense? Is any abstraction here paying rent (a second real use), or speculative? What does maintenance look like in 18 months?
**Output:** `ARCHITECT: fit=<ok|concern> — <one-line verdict>; concerns: <each with file:line>; decisions needing recording: <list|none>`

### Implementer
**Stance:** the person who has to actually build/have built it; owns feasibility and clarity.
**Asks:** Is every step of the plan concretely doable with what exists? What's ambiguous enough that two engineers would build it differently? What did the plan forget (migrations, config, wiring, error paths)?
**Output:** `IMPLEMENTER: feasible=<yes|blockers> — gaps: <list>; ambiguities needing a decision: <list|none>`

### Skeptic
**Stance:** assume the work is wrong; your job is to demonstrate it. The most valuable role — never skip it.
**Asks:** What input breaks this? Which caller wasn't checked? What's the failure scenario for each "should be fine"? Which verified claim actually lacks a tool result? What would a hostile reviewer's first objection be? Is the *easy answer* here actually correct, or just easy?
**Output:** `SKEPTIC: attacks tried: <list>; survived: <yes/no per attack>; strongest remaining doubt: <one sentence>`
Rule: the Skeptic must produce at least one *concrete* attack (a specific input, sequence, or state — not "edge cases might exist"). If every attack fails, say so; that's a real result.

### Test/Validation Lead
**Stance:** nothing is true until demonstrated.
**Asks:** What rung of the verification ladder did each claim reach (`verification-checklist.md`)? Which acceptance criterion has no check? Do the new tests fail on regression, or just pass vacuously? What's the cheapest missing check worth adding?
**Output:** the `VERIFIED / NOT VERIFIED / ASSUMPTIONS OPEN` block from `verification-checklist.md`.

### Refactorer
**Stance:** simplicity enforcer — in BOTH directions.
**Asks:** What here can be deleted with no behavior change? Is anything abstracted before the rule of three? Conversely: is anything duplicated a third time and now worth extracting? Are names truthful? Could a mid-level engineer follow this?
**Output:** `REFACTORER: delete: <list|none>; simplify: <list|none>; extract: <list|none>; verdict: <ship|simplify-first>`
Rule: proposals must stay inside the task's fence — flag out-of-scope cleanups for the report, don't do them.

### Documentation Lead
**Stance:** advocate for the reader who arrives in six months.
**Asks:** Which docs did this change make stale? Are the decisions recorded where this project records decisions? Does the final report re-ground a reader who saw none of the work? Is anything *over*-documented (narration comments to delete)?
**Output:** `DOCS: stale-now-fixed: <list>; decisions recorded at: <where|missing>; report readable cold: <yes|fix>`

### Cost/Token Controller
**Stance:** auditor of spend vs. risk.
**Asks:** Did the mode match the risk? Any re-reads or re-derivations? Is the review overhead itself proportionate (a Skeptic pass on a typo fix is waste)? What should the *next* session not pay for again — and is that in the working note/handoff?
**Output:** `COST: mode=<right|over|under>; waste noticed: <list|none>; carried forward in note: <yes|gaps>`

## Review configurations

| Situation | Roles to run |
|---|---|
| Lite Mode, behavior change | Skeptic + Test Lead (fold into one pass; ~10 lines total) |
| Full Rigor, feature/refactor | All seven, sequentially, after EXECUTE |
| Plan review (before building) | Architect + Implementer + Skeptic on the *plan* |
| Emergency debug | Skeptic only, on the *diagnosis* before the fix ships |
| Handoff | Docs Lead + Test Lead + Cost Controller on the handoff package |

Order when running several: Skeptic and Test Lead first (correctness gates everything), then Architect/Refactorer (shape), then Docs, then Cost. Stop and fix on any blocker before continuing the sequence — reviewing known-broken work wastes every later role.

## Simulated vs. real subagents

Simulate (default) — costs one pass, catches most issues, keeps context.

Spawn REAL subagents when:
- **Contaminated context risk**: you've been deep in the work for a long session; your assumptions may be the bug. Fresh-context verifier gets ONLY the spec + diff (+ repro for bugs), no history. Fresh eyes genuinely outperform self-critique here — this is the highest-value real-agent use.
- **High-stakes gate**: hard-to-reverse change about to ship; one independent Skeptic + one Test Lead as separate agents, verdicts compared.
- **Volume**: review would flood your context (huge diff, long logs) — delegate per-area, collect conclusions only.

Subagent briefs must be narrow and self-contained: role, stance, the exact artifact to review, the output block format above, and "return the block only." Never forward your whole history — that re-imports the contamination you're paying to escape.

## Honesty rule for simulated roles

Simulated review tempts theater: seven headers, zero findings, rubber stamp. Guard: **a review pass that finds nothing must say what it *tried*** (which attacks, which traces, which checks). "Skeptic: tried empty input, concurrent write, stale cache path — all handled" is a real result. "Skeptic: LGTM" is not a review.
