# Implementation playbook — execution discipline

For the EXECUTE phase, and the whole of **No-Fluff Execution Mode**.

## Pre-change checklist (30 seconds, every change)

1. Have I **read** the file I'm about to edit — current version, not memory of it?
2. Do I know who **calls/imports** this? (grep the symbol if not)
3. What's the **verification** for this specific change? (named before editing)
4. Is this change **in the plan / in scope**? If not: scope creep (drop it) or plan gap (fix plan visibly first).
5. Is it **reversible**? If not (migration, delete, force-push, prod config): stop, confirm evidence supports it, get user confirmation unless already authorized.

## Small safe changes

- One logical change per edit burst; verify before the next.
- Prefer the change that **cannot** break existing callers (add a parameter with a default, add a new function) over one that might — *when it doesn't cost clarity*. Don't contort the design for compatibility nobody needs: if you can just change the code and fix the callers, do that.
- Keep a mental (or working-note) **revert plan**: if this step is wrong, what do I undo? Small diffs make this trivial; that is most of their value.
- After each verified step, update the working note's DONE/NEXT lines.

## Writing the code

- **Imitate the neighbors.** Match the file's existing style, naming, idiom, error handling, and comment density — even where your own taste differs. Consistency is a feature; a second convention is a bug.
- Comments only for constraints code can't express ("must run before X because Y"). Never narrate the next line, never explain why your change is correct — that goes in the report, not the source.
- Handle errors at boundaries; trust internals. No defensive checks against states the type system or call graph already excludes.
- No TODO you don't either resolve or surface in the report.

## Tests

- **Test-first** when: the logic is tricky (parsing, math, state machines), you're fixing a bug (write the failing test that captures it — it's your repro AND your regression guard), or the spec is expressed as examples.
- **Test-after** is fine for: glue, wiring, straightforward CRUD.
- **No new tests needed** for: pure config, comment/doc changes — say so rather than padding.
- A new test must fail if the behavior regresses. Run it against broken code at least once when practical (the bug-fix case gives you this for free).
- Match the project's existing test patterns and helpers; don't import a new test style.

## Build/check cadence

- Run the fastest relevant check after each logical change: typecheck/lint in seconds beats a test suite in minutes — but the suite runs before "done."
- **A red check stops the line.** Don't stack more changes on a failing state; fix or revert first.
- If checks don't exist, the minimum is: run the code once on a realistic input and read the output. If even that is impossible, the report must say "verified by re-reading only."

## Commit hygiene (when committing is part of the task)

- One logical change per commit; message says *what* and *why*, imperative mood, no narration of process.
- Never commit: secrets, commented-out code, debug prints, unrelated formatting churn (`git diff` review before every commit — read your own diff the way `architecture-review.md` reads a stranger's).
- Don't commit/push/open PRs unless the task calls for it.

## No-Fluff Execution Mode

For: an approved plan exists (from the user, a prior session, or a design doc), and the job is *doing it*.

Rules of engagement:
1. Restate the plan in ≤3 lines and confirm the verification method exists. That's the entire preamble.
2. Execute steps in order. **No re-litigating the plan's decisions** — the deciding already happened.
3. Narrate minimally: one line per completed step ("Step 2 done — tests pass"), nothing per tool call.
4. Deviate only when reality contradicts the plan (API doesn't exist, test reveals wrong assumption). Then stop, state the contradiction in 2 lines, propose the minimal amendment, and either proceed (if the fix is obvious and in-spirit) or ask (if it changes the design).
5. All validation requirements from SKILL.md still apply — no-fluff refers to *communication*, never to verification.
6. Report per SKILL.md: outcome, evidence, deviations from plan (each one flagged).
