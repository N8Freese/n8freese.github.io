# Verification checklist & quality rubrics

## The verification ladder

Always run the strongest rung available; report which rung you reached.

| Rung | Check | Claim it earns |
|---|---|---|
| 5 | Automated tests covering the change, passing | "Verified by tests: <names/scope>" |
| 4 | Build/compile + typecheck clean | "Builds clean; behavior verified by <rung ≤3>" |
| 3 | Manual invocation with realistic input, output inspected | "Manually verified: ran <cmd>, observed <result>" |
| 2 | Static analysis / lint clean | supporting evidence only, never sufficient alone |
| 1 | Careful re-read of the diff | "Verified by re-reading only" — say exactly this |

Rules:
- Rung 1 alone on a behavior change is a **flag**, not a pass. Offer the user the missing harness ("no tests exist for this area; want a smoke test?").
- Report failures verbatim (paste the relevant output), never paraphrased into softness.
- A check you *meant* to run but didn't = not run. The report says so.

## Done-check (before saying "done" — Full Rigor & Handoff; Lite's shorter equivalent lives in SKILL.md §Verify/§Validation)

- [ ] Acceptance criteria from the plan: each one demonstrably met (point at evidence).
- [ ] Strongest available verification rung executed, results recorded.
- [ ] Refutation pass done (attack your own diff — `architecture-review.md` §own-diff).
- [ ] Assumption ledger: no unverified assumption with a large blast radius left silently open.
- [ ] Diff review: no debug prints, secrets, commented-out code, stray files, unrelated churn.
- [ ] Docs that this change made stale are updated (and only those).
- [ ] Working note / decision log current — the next session could resume from it.
- [ ] Final report: outcome first, evidence named, unverified items listed, out-of-scope findings listed.

Any unchecked box → either fix it or state it explicitly in the report. Silence about a gap is the failure; the gap itself often isn't.

## Quality rubrics

Score 1–5 in Full Rigor Mode (and for handoffs). Anything ≤2 must be fixed or explicitly accepted by the user.

**Correctness** — 5: verified on happy path + edge cases + error paths, by tests or observed runs. 3: happy path verified; edges reasoned about only. 1: unverified or known-broken edge.

**Architectural fit** — 5: indistinguishable from the codebase's best existing work; uses established patterns. 3: works but introduces a mild second-way-of-doing-it. 1: fights the grain; new rival convention or dependency without a recorded decision.

**Maintainability** — 5: a mid-level engineer changes it safely without archaeology; names truthful; complexity proportional. 3: understandable with effort. 1: clever, tangled, or misleading names/comments.

**Test coverage** — 5: tricky logic + bug fixes covered by tests that fail on regression. 3: happy path tested. 1: no tests where they were feasible, or tests without meaningful assertions.

**Security/safety** — 5: boundaries validated, injections impossible-by-construction, no secrets, authZ checked. 3: no boundary touched by this diff. 1: any Pass-2 finding from `architecture-review.md` open.

**User intent alignment** — 5: delivers what was actually asked, at asked scope; ambiguities surfaced, not guessed. 3: minor scope drift, disclosed. 1: solved an adjacent problem or silently redefined the task.

**Token/cost efficiency** — 5: mode matched risk; no redundant re-reads (re-reading before an edit after truncation is required, not waste); targeted context gathering. 3: some waste (full reads where grep sufficed). 1: re-derived known facts, re-read content still in hand, Full Rigor on a trivial task.

**Documentation quality** — 5: decisions recorded where the project keeps them; stale docs fixed; report is a clean re-grounding. 3: report good, no durable record. 1: undocumented decisions, or docs now lie about behavior.

## Verification report block (paste-ready)

```
VERIFIED:
- <check run> → <result>          (rung N)
NOT VERIFIED:
- <what> — <why not> — <how the user can verify>
ASSUMPTIONS STILL OPEN:
- <assumption> — risk if wrong: <impact>
```
Include this block (with real content or "none") in every Full Rigor and Handoff report. (Lite's one-sentence equivalent is defined in SKILL.md §Report.)
