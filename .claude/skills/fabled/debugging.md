# Debugging — Fable-like diagnosis

Core stance: **debugging is hypothesis testing against a live system, not pattern-matching against memory.** The bug is a fact in the code; your job is to corner it with evidence.

## The framework (all modes)

### 1. Reproduce first
- Get a failing case you can run on demand. Exact command, exact input, exact observed output vs expected.
- **Never fix what you can't reproduce.** If reproduction is impossible (prod-only, race), say so explicitly and downgrade all conclusions to "consistent with" — then instrument (logs/assertions) so the next occurrence is diagnosable.
- Shrink the repro while it still fails: smaller input, fewer steps, one component. Every shrink halves the search space.

### 2. Localize by bisection
Split the system and determine which half contains the fault — data in vs data out of each stage, before vs after a commit (`git bisect` when history is relevant), with vs without a config/flag/dependency. Repeat. Aim for a specific function or line *before* forming causal theories.

### 3. One hypothesis at a time
- State it falsifiably: "X is null at line N when the request lacks header H."
- Design the **cheapest discriminating test**: the observation that distinguishes this hypothesis from rivals (a log line, a debugger value, a crafted input, a unit test).
- Observe. **Predicted the result before looking?** Good. Surprised? Your model of the system is wrong somewhere upstream — fix the model before the code.
- Never stack two speculative changes. If a change didn't help, **revert it before trying the next** — dead fixes left in place poison later observations.

### 4. Root cause, not symptom
When you find the broken line, ask "why was it wrong?" until you reach a decision, not just a defect: wrong assumption at a boundary, drifted contract, missing invariant. Fix at that level when it's in scope. Patching the symptom without naming the root cause = say so explicitly in the report.

### 5. Verify the fix like you verified the bug
- Failing repro now passes.
- Related tests still pass (run the suite or nearest scope).
- One-pass check: what *else* did this change affect? (Other callers, other inputs.)
- Report includes: root cause in one sentence, the discriminating evidence, and the regression check performed.

## Evidence hierarchy (trust top-down)

1. Observed behavior in this session (test run, command output, debugger)
2. The code as read, current revision
3. Version-control history (what changed, when)
4. Tests' asserted behavior (tests can be wrong or stale)
5. Docs, comments, commit messages, README
6. Memory of "how these systems usually work" ← hypothesis fuel only, never evidence

When two levels disagree, the higher one wins. **Trust the live system over the docs.**

## Anti-patterns (each has burned a real project)

- **Shotgun debugging**: many simultaneous changes → can't attribute the effect → revert all, restart with one.
- **Error-message literalism**: fixing where the error *surfaced* instead of where the state went wrong. Trace backward to first-bad-state.
- **The convenient suspect**: blaming recently-touched or already-disliked code without discriminating evidence.
- **Fix-by-vibes**: "adding a null check here should fix it" — if you can't say *why* it's null, you haven't found the bug.
- **Heisenbug denial**: it "went away" → it didn't. You changed timing or state. Keep the repro; find it.
- **Repeating a failed probe**: same command failing twice the same way will fail a third time. Change something diagnostic.

## Emergency Debug Mode

For: production down, user blocked, speed over completeness. Explicitly say "Emergency Debug Mode" and:

1. **Stabilize before diagnosing** — if a rollback/revert/feature-flag-off restores service, propose it FIRST. Root cause comes after the bleeding stops.
2. **Triage in 3 questions**: What changed most recently (deploy, config, dependency, data)? What does the error/log actually say (read it fully, don't skim)? Is it everywhere or scoped (one user, one node, one input class)?
3. **Timebox hypotheses** — 2 discriminating checks per hypothesis max, then move to the next candidate.
4. **Preserve evidence** — before restarting/clearing anything, capture logs and state. State-changing "quick tries" that destroy evidence are forbidden unless service restoration demands them.
5. **Guardrails still hold**: no speculative fixes pushed to prod, no claim of "fixed" without observing recovery, destructive actions still need user confirmation.
6. **Debrief after**: once stable, one short paragraph — root cause (or best current theory, labeled as such), what was done, what remains to harden. Schedule the real fix; an emergency patch is not a fix.

## When stuck (2+ dead hypotheses)

Escalation ladder from SKILL.md, debugging-specific ordering:
1. Re-shrink the repro — a smaller failing case usually breaks the tie.
2. List every assumption in the failing path; test the one you're *most sure of* that you never actually checked (that's where long bugs live).
3. Diff against a working state: older commit, different environment, different input that works. What's the minimal delta?
4. Fresh-context subagent: hand it ONLY the repro + observed vs expected. No history, no theories — your accumulated theories may be the contamination.
5. Escalate to the user with: repro, evidence table (hypothesis → test → result), and the specific question or access you need.
