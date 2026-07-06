# Token budgeting — efficiency doctrine

Goal: Fable-grade discipline — not capability — at Sonnet-session prices. Tokens are spent in three places — context gathering, iteration/rework, and communication. Rework is the most expensive and is bought down by *discipline*, not by reading less. Never save tokens by skipping verification; save them everywhere else.

## Doctrine

### 1. Gather only what constrains the task
- Start with structure, not content: directory listing, file names, `grep` for the symbols involved. Build a mental map before opening anything.
- Read files you will change, plus the minimal set that constrains the change (direct callers, the interface being implemented, one exemplar of the pattern to imitate).
- Targeted reads: line ranges around the match, not whole files. Expand only when the excerpt is genuinely ambiguous.
- Resist completionism: you do not need to understand the whole codebase to change one corner of it correctly. You need the corner and its edges.

### 2. Never pay twice
- **No redundant re-reads.** Your working note carries what you learned; if you're about to re-read, first ask what specific fact you need — often it's already in the note. Exception: re-reading the needed line range before an edit, after context truncation or a long gap, is *required*, not waste — the rule targets re-reading content you still reliably hold.
- No re-deriving: decisions made earlier in the session are made. Re-open a decision only on new evidence, and say what the evidence is.
- Batch independent tool calls in one round (parallel reads/greps) instead of serial single calls — fewer round-trips, less narration between them.

### 3. The working note is the cache
Maintained per `thinking-style.md`. It exists so that neither you nor a successor session ever re-pays for orientation. Update on state change; before any long operation (big refactor, long test run, large search), refresh it — if output floods the context or the session truncates, the note is the recovery point.

### 4. Communicate selectively
- Don't quote file contents back; reference `path:line`.
- Don't narrate tool calls ("Now I will open…"). One line per meaningful *finding*, not per action.
- Reports: selectivity over compression — fewer points, full sentences.

### 5. Match spend to risk (the mode dial)
| Signal | Spend |
|---|---|
| Reversible, small blast radius, checks exist | Lite: minimal plan, verify, ship |
| Hard to reverse, wide blast radius, or no safety net | Full Rigor: alternatives, role review, rubrics |
| In between | Lite + one targeted extra: a refutation pass or a Skeptic role pass |

Being wrong is the most expensive thing a session can do: a wrong assumption discovered late costs more than every full-file read combined. So the ONE place to overspend in Lite Mode is **verifying load-bearing assumptions early**.

### 6. Subagents cost real money
One model simulating review roles costs a fraction of spawning real agents. Spawn real subagents only per the criteria in `multi-agent-review.md` §Simulated vs. real (fresh-context verification, genuinely parallel searches, context-flooding volume). Give subagents *narrow* briefs and ask for *conclusions*, not transcripts.

## Where the spend belongs, by task shape

Relative emphasis, not percentages (you can't measure per-phase spend mid-session — use the signals below as the actual self-check):

| Task | Most spend belongs in | Least |
|---|---|---|
| Small fix | Execute + verify | Planning |
| Feature | Execute, with real orient + verify shares | Reporting |
| Debug | Repro + localize (orient), then verify | Planning |
| Architecture | Orient (constraints) + plan (options) | Execution (none) |

Signals you're overspending: re-reading a file a second time; a plan longer than the diff will be; narrating actions; reading "for background" without a named question.
Signals you're underspending (worse): editing unread files; "should work"; no named verification; assumptions unlogged.

## Low-token session protocol (Sonnet/Haiku, tight budget)

1. Lite Mode, stated up front.
2. Orient from the working note / handoff doc first if one exists — that's what it's for.
3. One batched clarifying question round max; otherwise proceed on logged assumptions.
4. Smallest diff that meets acceptance; no drive-by improvements at all.
5. Verification is NOT cut — but prefer the fastest sufficient rung (targeted test run over full suite when the risk profile allows; say which you ran).
6. If the task exceeds the session (context or capability), stop cleanly at a stage boundary and write the handoff block (`handoff.md` §session) rather than degrading quality to finish.
