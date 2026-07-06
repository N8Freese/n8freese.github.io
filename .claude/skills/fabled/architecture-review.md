# Architecture decisions & code review

## Part 1 — Architecture framework

An architecture task is a *decision* task. The output is a decision with its reasoning preserved, not an essay.

### 1. Frame the decision
- State it as a choice: "How should X be structured, given Y?"
- Classify reversibility: **reversible** (an interface you can swap later) → decide fast, cheapest good option. **Hard to reverse** (data model, public API, wire protocol, framework choice) → full treatment below + user sign-off.
- State the time horizon honestly. Designing for scale/requirements nobody has asked for is overengineering with a diagram.

### 2. Constraints from reality, not memory
Before any opinion, collect from the actual project: current patterns (what does this codebase already do for similar problems?), scale (real numbers — requests, rows, team size), operational reality (who deploys/monitors this?), and existing dependencies (prefer what's already installed and understood). A design that fights the codebase's grain fails in maintenance even when it's abstractly better.

### 3. Options — 2 or 3, real ones
For each: sketch (3–5 lines), what it optimizes for, what it costs (complexity, deps, migration, learning curve), and its failure mode (how does this go wrong in 18 months?). No strawmen — if you can't argue an option seriously, it isn't an option; find a real second one or say the decision is forced.

### 4. Recommend and record
- Recommend ONE, with the deciding factor named ("chosen for lowest operational cost; we accept the slower cold path").
- Record the decision where the project keeps decisions (ADR file, docs/, or a dated note): context → decision → alternatives rejected + why → consequences accepted. Five sentences beat zero; the audience is a maintainer two years out asking "why is it like this?"

### Architecture smells to flag (in any mode)
- Abstraction with one implementation and no concrete second use in sight.
- Config/flag for something that never varies.
- Layer that only forwards calls.
- New dependency duplicating something stdlib/existing deps do adequately.
- "Flexible" design whose flexibility no acceptance criterion needs.

## Part 2 — Code review framework

Review in severity order. A later pass never overrides an earlier one (elegant-but-wrong loses to ugly-but-right).

### Pass 1 — Correctness (the only mandatory pass in Lite Mode)
- Trace the data: for each changed path, follow a concrete input through it. Where could it be null/empty/huge/duplicated/out of order?
- Check the boundaries: off-by-one, first/last iteration, empty collection, zero, negative, unicode, timezone.
- Check the callers: does every caller of a changed function still hold up? (grep, don't assume).
- Check concurrency where shared state is touched: what interleaving breaks this?
- Error paths: what happens when the fallible thing fails? Swallowed errors are findings.

### Pass 2 — Security & safety (mandatory when the diff touches a boundary)
Applies at system boundaries: user input, external APIs, file paths, subprocess/shell, SQL, HTML rendering, auth, secrets.
- Injection: any string from outside reaching an interpreter (SQL, shell, HTML, regex, path)?
- AuthZ: does the code check *permission*, not just *authentication*?
- Secrets: none in code, logs, error messages, or committed files.
- Unsafe deserialization, SSRF-able fetches, path traversal on user-supplied names.

### Pass 3 — Architectural fit
- Does this follow the project's existing patterns, or introduce a rival convention? (A second way of doing X is a cost even when it's a better way — flag it as a decision, not a drive-by.)
- Right layer? Business logic in the view, IO in the domain core, etc.
- Dependency direction still sane?

### Pass 4 — Maintainability
- Names say what things are; functions do what their names claim.
- Duplication that will drift (rule of three before abstracting).
- Comments state the *why* that code can't show — and nothing else.
- Tests exist for the tricky logic and actually assert behavior (a test with no meaningful assertion is a finding).

### Reporting findings
- Rank by severity: **[blocker]** wrong behavior/security, **[should-fix]** will cause problems soon, **[consider]** improvement, **[nit]** style.
- Every finding: `file:line`, one-sentence defect statement, and a **concrete failure scenario** ("with an empty cart, total is NaN and checkout 500s"). **A finding without a failure scenario is an opinion** — either construct the scenario or downgrade to [consider].
- Verify top findings before reporting when possible (run the case, write the failing test). Findings you verified: mark "confirmed". Findings from reading alone: mark "plausible".
- Say what's good, once and briefly, if it's load-bearing ("the retry wrapper is exactly right — reuse it in the other client too").

### Reviewing your own diff (the refutation pass)
Same passes, plus stance: **assume there is a bug and find it.** Read the diff as the person who will be paged when it breaks. Run the Skeptic question list (`multi-agent-review.md` §Skeptic) against your own diff, plus the self-review-only question: what did I change my mind about halfway through? — that seam is where inconsistencies live.
