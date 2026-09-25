# LearnWise functional audit — 24 September 2026

The application source is `learnwise/`, a React/TypeScript/Vite npm workspace. The presentation server for this repair session is `http://127.0.0.1:5175/`. Browser tests start their own strict-port server on `5186`, with `reuseExistingServer: false`; they cannot silently test an old server. Playwright launches Microsoft Edge with isolated contexts. No personal browser storage was cleared.

## Reproduced causes

- Selecting **SQL Basics · Topic practice** and pressing **Let's find your starting point** failed when `crypto.randomUUID` was unavailable. Both that action and **Add a resource** threw `crypto.randomUUID is not a function`. The browser reproduction explicitly disables that API, modeling its absence on non-secure HTTP origins. IDs now fall back to `crypto.getRandomValues`.
- An unfinished JOINs quiz disabled the start control even when SQL Basics was selected. The old storage model held one draft per student. Drafts now use student + assessment keys; compatible old drafts migrate with their answers intact. The selected assessment can start or resume, while other drafts remain available.
- Fresh-session valid submission worked before this repair; the originally reported submit failure was not independently reproduced. Incomplete submission correctly reported missing answers. Submission now has separate domain validation and idempotent recording, with browser coverage for keyboard submit, double-click, repeated submit events, refreshed results and retakes.
- A storage exception applied a resource in memory but closed its editor. The editor now retains recoverable input and explains how to retry. Invalid fields have individual messages and focus moves to the first invalid field.
- Clicking empty padding inside a dialog could dismiss it because its click handler treated any dialog-target click as a backdrop click. Only clicks outside the dialog bounds now dismiss it; focus returns to the trigger.
- Unreadable saved data previously got replaced by seeds on mount. Recovery now preserves the original under `learnwise-demo-recovery` before saving fresh state. If the backup fails, the original is not overwritten.
- The old browser harness reused a server on a common port. The test harness now refuses occupied ports and always starts this checkout.

## Route and action matrix

Verification references: **J** `tests/journey.spec.ts`; **R** `tests/repairs.spec.ts`; **C** `tests/current-regressions.spec.ts`; **E** `tests/edge-cases.spec.ts`; **A** `tests/accessibility.spec.ts`; **V** `tests/visual.spec.ts`; **U** `lib/*.test.ts`; **S** `scripts/verify-startup.mjs`. A route render alone is not counted as a tested save or interaction.

| Screen | Action | Expected outcome | Verification | Status |
| --- | --- | --- | --- | --- |
| `/` | Enter Student / Professor | Explicit session and correct workspace | J, R | Passed |
| Header | Select another student | Identity and records change; menu closes | J, R | Passed |
| Shared navigation | Switch role | Correct navigation, identity and landing screen | J, R | Passed |
| Shared navigation | Visit opposite-role URL | Explanatory screen; stored role unchanged | R | Passed |
| Shared navigation | Direct URL without session | Return to welcome | R | Passed |
| Shared navigation | Back, Forward and refresh | Stable role and expected route | R | Passed |
| Sidebar | Collapse / expand | Navigation remains accessible | R | Passed |
| Mobile sidebar | Open, follow link, switch role, Escape | Drawer closes, background is usable, focus returns | J, R, A | Passed |
| Header | Search and Enter | Search opens catalog for current role | R; student catalog uses same handler | Passed |
| Header | Notifications | Only student's assignments or professor class assignments | J, R | Passed |
| Header / sidebar | Welcome link | Welcome screen reachable | J, R; link inspection | Passed |
| Student dashboard | Start assessment / open learning path | Quiz selection or calculated recommendations | J | Passed |
| Student dashboard | View result, activity, bookmarks and assignments | Derived from active student's stored records | J, R, U | Passed |
| `/student/library` | Search / combine four filters | Matching active resources only | J, R, C | Passed |
| Library | Bookmark / bookmarked-only / clear filters | Persistent profile-specific selection and useful empty state | J, R | Passed |
| Library | Open custom or edited resource | Latest stored title and lesson | J, C | Passed |
| Resource details | Mark studied | Activity saved once; proficiency unchanged | J, E, U | Pending final E run |
| Resource details | Explain concept / topic quiz | Curated topic context or correct five-question quiz | J, R | Passed |
| Resource details | Missing / archived ID | Clear missing state or labeled historical access | R, E | Pending final E run |
| Knowledge Check | Select SQL Basics and start | First of five SQL Basics questions immediately | C | Passed |
| Knowledge Check | Start diagnostic | Twelve questions, three per topic | J, U | Passed |
| Knowledge Check | Start with another topic's draft | New assessment starts; other draft remains | C | Passed |
| Knowledge Check | Resume / discard selected or other draft | Correct student's assessment restored or removed | C, R; discard handler inspection | Passed |
| Quiz | Answer, Previous, Next, question index | Selections survive navigation | J, R | Passed |
| Quiz | Review / edit answers | All questions and unanswered markers available | J, R | Passed |
| Quiz | Submit incomplete / go to first unanswered | Clear error; navigation to missing answer | J, R | Passed |
| Quiz | Valid submit / Enter / double-click / repeated events | Exactly one saved attempt; matching draft removed | J, R, C, U | Passed |
| Results | Refresh / answer explanations / assistant link | Persistent result for active student with question-level feedback | J, R, C | Passed |
| Results | Try another quiz | Clean next attempt with varied question set | R | Label update awaiting recheck |
| Results | Invalid or another student's attempt | Result unavailable for active profile | R | Passed |
| Learning Path | Open recommendation / practice | Threshold and prerequisite-based next step | J, U | Passed |
| Assistant | Suggested prompts / typing / follow-ups / reset | Curated topic responses; conversation clears | J, R, U | Passed |
| Assistant | Unsupported prompt | Honest unsupported-response message | U | Passed |
| My Progress | History / View results / comparable improvement | Correct dates, counts and practice-only comparison | J, R, U | Label update awaiting recheck |
| Professor overview | Class and topic filters | Recalculated coverage, averages and heatmap | R, U | Passed |
| Professor overview | Suggested lesson / student drill-down | Professor layout and selected student's details | J, R | Passed |
| Student Insights | Inspect student | Professor identity stays separate | R | Passed |
| Student details | Assign active resource twice | One assignment, correct student only | J, R, E | Pending final E run |
| Student details | Read studied / archived assignment | Status derives from selected student's activity | E | Pending final E run |
| Resource Management | Add / validate / save / preview | Inline errors or one persistent resource | J, R, C | Passed |
| Resource Management | Edit / search | Existing ID updated; new content searchable | J, R | Passed |
| Resource Management | Archive / cancel / restore | Confirmation; catalog/recommendations exclude archived records | J, E, U | Pending final E run |
| Resource editor | Storage fails then recovers | Input retained; retry saves one record | C | Passed |
| Resource editor | SQL and multiline content | Readable content and code block | C | Passed |
| Resource editor | Tab trap / Escape / padding click | Focus contained and restored; input survives padding click | E | Pending final E run |
| Reset dialog | Cancel | Saved records preserved | J | Passed |
| Reset dialog | Confirm | Synthetic seeds restored and welcome shown | J, U | Passed |
| Persistence | Existing version-one data / old draft | Compatible edits, attempts and answers migrate | R, E, U | Pending final E run |
| Persistence | Malformed data / unavailable storage | Honest recovery and session-only feedback; original retained | R, E, U | Pending final E run |
| All 13 workspace routes | Desktop 1440, tablet 820, mobile 390 | No page overflow or rendering errors; actual screenshots | V | In progress |
| Welcome + all workspace routes | Automated WCAG A/AA | No axe violations in tested states | A | Passed |
| Mobile quiz | Touch start, answer, review, submit, refresh | Working five-question journey | E | Pending final E run |
| Enlarged layout | 720 CSS pixels at 2x scale | 200% equivalent reflow without page overflow | E | Pending final E run |
| Startup | Both folders and launcher | Correct source served; no unrelated server reused | S | 9 passed |

## Verification record

- Initial baseline: 3 targeted browser journeys passed in the existing code.
- Targeted reproductions: 2 tests failed before fixes, including two captured `randomUUID` exceptions and the disabled SQL Basics start button.
- After fixes: 7 targeted browser tests passed; 25 unit tests passed; TypeScript + production build passed before the final test additions.
- Final full-suite, extra interaction, screenshot review and type/build outcomes will be recorded below after completion.

## Boundaries

Browser tests use real Microsoft Edge through Playwright. No connected native/browser-control surface was available. The enlarged-layout check simulates 200% reflow using half-size CSS viewport and 2x device scale; native browser zoom controls are not verified. Automated axe checks do not replace a screen-reader audit. Simultaneous multi-tab edits remain last-save-wins. Data is browser-local, roles are freely selectable demo boundaries, SQL is displayed rather than executed, and assistant responses are curated. No backend, real authentication, cross-device synchronization or publication was added.
