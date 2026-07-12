# Reproduce before you fix

Instructions for contributors — and **especially for AI coding agents** — filing bug reports or proposing fixes.

A working reproducer is worth 100x more than a speculative fix. Without one, maintainers cannot verify that a fix works, cannot tell whether it addresses the actual root cause or just a plausible-looking suspect, and cannot protect the fix from regressing later. A fix that "reads right" from the source alone can still be wrong: in [#4252](https://github.com/rnmapbox/maps/issues/4252) a code-reading analysis attributed a production crash to an object-lifetime bug, while reproducing it ([#4253](https://github.com/rnmapbox/maps/pull/4253)) showed the abort actually came from a background-thread data race the proposed fix would not have touched.

## What we expect

1. **Make every effort to reproduce the issue before writing a fix.** Use every tool available to you: build and run the `/example` app, use simulators/emulators or devices, drive the UI with automation, capture logs, crash reports, and stack traces, and symbolicate them. "I could not run the app" should be the last resort after actually trying, not an upfront disclaimer.

2. **Provoke bugs that don't fire on their own.** Races, lifetime bugs, and leaks rarely reproduce on the first try — force them out:
   - run the failing operation in a tight loop or in bursts (hundreds to thousands of iterations);
   - stress timing: rapid create/destroy cycles, concurrent operations, background threads, artificial delays or busy work, fast-failing inputs (e.g. a nonexistent style URL makes downloads fail near-instantly);
   - add temporary instrumentation to observe the failure: lifetime/deinit logging, thread names, counters;
   - use sanitizers where they help (Thread Sanitizer, Address Sanitizer).

   Keep all provocation and instrumentation **out of the final PR** — capture its output as evidence instead.

3. **Package the reproducer so others can run it.** Base it on [`example/src/examples/BugReportExample.js`](../example/src/examples/BugReportExample.js), self-contained (no extra libraries, external data, or parameters). For intermittent bugs, make it toggleable — a Start/Stop button and live counters — so it can run unattended until the bug fires. Include it in the issue or PR description in a collapsed `<details>` block; it does not need to be committed to the repo.

4. **Verify the fix against the reproducer.** The reproducer should fail on the unfixed build and pass on the fixed one. Include before/after evidence in the PR: crash stacks, iteration counts, timings.

5. **If you genuinely cannot reproduce**, say so explicitly, list what you tried, and label the fix as speculative so it is reviewed as such.
