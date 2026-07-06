# Invocation guide & example prompts

## How to invoke

In any Claude Code session where this skill is installed (`.claude/skills/fabled/` in the project, or `~/.claude/skills/fabled/` globally):

- **Explicit:** type `/fabled <task>` or say "use the fabled skill".
- **With a mode:** `/fabled full: <task>` · `lite:` · `debug:` · `exec:` · `handoff:` — or in words ("use /fabled in emergency debug mode").
- **Implicit:** Claude Code auto-invokes skills whose description matches the task; naming it is more reliable, especially on smaller models.
- **Session default:** add to the project's CLAUDE.md:
  `For all non-trivial work in this repo, apply the fabled skill (.claude/skills/fabled). Default Lite Mode; Full Rigor for multi-file or hard-to-reverse changes.`

## Recommended defaults

| You're running | Recommendation |
|---|---|
| Sonnet, day-to-day | `/fabled lite` as the standing default (CLAUDE.md line above) |
| Opus, complex work | `/fabled full` for features/architecture; plain `/fabled` otherwise |
| Any model, prod incident | `/fabled debug: <symptom>` |
| Any model, approved plan in hand | `/fabled exec: <pointer to plan>` |
| Expensive session ending | `/fabled handoff` |

## Example prompts

### Debugging
```
/fabled debug: Checkout intermittently returns 500 since yesterday's deploy.
Error in logs: "TypeError: cannot read 'total' of undefined" in cart.js.
Repro: unknown — happens for ~2% of checkouts. Start from the evidence, not a guess.
```
Emergency variant:
```
/fabled debug (emergency): prod is down after the 14:02 deploy. Stabilize first,
root-cause second. You may propose a rollback before diagnosing.
```

### Building a feature
```
/fabled full: Add CSV export to the reports page. Users need to download the
currently-filtered rows. Out of scope: scheduling, other formats. Sharpen this
into acceptance criteria first, recon the existing download/util patterns, spike
anything risky, then build a thin slice before expanding.
```

### Reviewing code
```
/fabled full: Review the diff on this branch against main. Run all review passes
(correctness, security, fit, maintainability) and the role-based review. Findings
ranked by severity, each with file:line and a concrete failure scenario. Verify
the top findings by running the case where possible. Assessment only — no fixes.
```

### Planning architecture
```
/fabled full: We need background jobs (email, thumbnails; maybe more later).
Frame the decision, pull constraints from THIS codebase (deps, deploy setup, scale),
give 2–3 real options with costs and 18-month failure modes, recommend one, and
write the decision record. Don't build anything yet.
```

### Reducing token usage
```
/fabled lite: Work through issues #12, #14, #15. Low-token protocol: orient from
CLAUDE.md and the handoff note, no full-file reads where grep suffices, no re-reads,
smallest diffs that pass acceptance, one batched question round max. Verification
is not skipped — pick the fastest sufficient rung and name it.
```

### Handing the project to a smaller model
```
/fabled handoff: This is your last expensive session on this repo; future work is
Sonnet in Lite Mode. Verify the ground truth (build/tests/run), then produce the
full handoff package: runbook, map, change guide with danger zones, decision
record, honest state-of-the-union, lessons file, and recipes for the 5 likeliest
next tasks. Review it against the successor test before finishing.
```

### Escalating a stuck problem
```
/fabled: You've made two failed attempts at the flaky test in auth.spec.ts.
Stop iterating. Re-orient: list what you KNOW vs ASSUMED with evidence for each,
shrink the repro, then test your most-confident unchecked assumption. If still
stuck, spawn one fresh-context subagent with only the repro — no history.
```

## What good looks like (miniature transcript)

```
Mode: Lite. Goal: null-crash fix in parseDate when input lacks a timezone.

PLAN
- Assumption: only formatTimestamp calls parseDate [verified: grep — 1 call site]
- Fix at parse boundary, not caller; add regression test; run date tests.
- Verify: npm test -- date

Wrote failing test (reproduces crash) → fixed parseDate → tests: 12 passed.
Refutation pass: tried empty string, non-ISO garbage — both handled; offset-only
input "+02:00" returns null by design — confirmed acceptable per existing docs.

DONE — parseDate no longer crashes on timezone-less input.
Changed: src/dates.ts:41-49, tests/date.test.ts (+1 test).
Verified: npm test -- date → 12 passed (includes new regression test).
Not verified: none. Out of scope, noticed: formatTimestamp swallows parse
errors silently (tests/date.test.ts:88) — flagging, not fixing.
```
Note the shape: mode stated, assumption verified before relying on it, verification
named before coding, refutation pass with concrete attacks, outcome-first report,
out-of-scope finding flagged rather than fixed.
