# LearnWise functionality audit and verification

> Historical audit from the existing project, retained for context. The current repair findings, route/action matrix, and verification evidence are in [docs/QA.md](docs/QA.md). Use that document for the current handoff.

Verified 24 September 2026 against the actual React/TypeScript/Vite application. Tests used isolated Microsoft Edge browser contexts and did not reset the user's normal browser storage. No applicable AGENTS.md was found in the workspace. Existing dependencies and page organization were retained.

## Findings and repairs

| Finding | Root cause | Repair |
| --- | --- | --- |
| URLs silently changed roles | Layout inferred and wrote role from pathname in an effect | Explicit session entry and role switching; guarded outlets show wrong-role access messages without changing identity |
| Professor previews, search, and shortcuts entered student routes | Shared links and header search hard-coded /student destinations | Professor previews at /faculty/resources/:resourceId; role-aware search, sidebar shortcut, revision-lesson shortcut, notifications, and empty history |
| Professor profile controls implied the inspected student was the active identity | Shared profile selector and student-specific notification filtering | Independent Professor demo identity; learner selection appears only in Student; professor notifications open the assigned learner |
| Refresh/navigation lost unfinished answers and completed result context | Quiz draft and result existed only in component state | Persisted per-student drafts with Resume/Discard; stable result URLs and Review answers history links |
| Submission had no explicit duplicate protection | Every handler call generated a fresh attempt ID | Stable draft/attempt ID, synchronous submission guard, atomic duplicate check, semantic form submission |
| Save success could be announced before persistence failed | Toast was set immediately; localStorage write happened in a later effect | Commit in-memory state, attempt persistence, then report success or session-only feedback; persistent storage banner and accurate footer |
| Unassessed/developing prerequisites could be bypassed in recommendations | Only assessed prerequisites below 60% were considered | Walk prerequisite chain; review earliest unassessed/below-80% prerequisite; choose beginner/revision resources from its own result |
| Inconsistent score constants | Several charts/counts hard-coded thresholds | Score comparisons and chart reference line use the shared thresholds object |
| Small controls and crowded mobile chart labels | Numerous 9–11px labels; long four-topic axis labels | Readable labels, 44px primary/icon controls, short chart axis labels plus full text/denominator summaries, focusable scrollable tables, scrollable sidebar |
| No dedicated assignment workspace | Assignments only appeared on dashboard/bell | Added Assigned Resources with per-student status and historical archived-resource access |

The original four browser tests passed before repairs. The ordinary mouse-submit and resource-save paths were **not reproduced as broken** in that baseline. The confirmed defects were role transitions and missing submission/persistence safeguards and recovery. The old tests explicitly relied on URL-driven role switching and did not cover these failures. Assertions were retained and expanded around the intended explicit-role behavior.

## Route and action checklist

All entries below passed their relevant browser checks. Every workspace route also rendered at 1440×1000, 820×1000, and 390×844 without document-level horizontal overflow. Tables intentionally scroll within their own regions.

| Route | Actions and outcomes checked |
| --- | --- |
| / | Student/profile selection, Professor entry, honest demo label, fresh and migrated saved state |
| /student/dashboard | Diagnostic navigation, latest results, recommendations, bookmarks, studied activity, correct student assignments |
| /student/library | Search, combined topic/type/level/time filters, bookmark add/remove and reload, empty search and clear filters, created/edited/restored resource visibility, archive exclusion |
| /student/library/:resourceId | Lesson/SQL rendering, studied state, assistant context, invalid resource, historical archive labeling |
| /student/quiz | Diagnostic 12/3-per-topic and practice 5; answer retention, Previous/Next/question navigation, review, unanswered validation and direct navigation, mouse and Enter submission, duplicate submission, precise results/explanations, draft refresh/resume, clean varied retake, persistent result URL and invalid result |
| /student/learning-path | Topic-specific counts, recommended lesson, practice destination, prerequisite order, unassessed state; resource study does not change proficiency |
| /student/assistant | Visible curated label, resource and quiz-answer context, typed Enter input, blank-input disabled state, example and practice follow-ups, New conversation |
| /student/progress | Retained history, review links, updated topic result, studied resources, comparable five-question practice improvement, no-history state |
| /student/assignments | Correct recipient only, empty state, resource opening, studied/assigned state |
| /faculty/dashboard | Class and topic filters, coverage and averages, heatmap drill-down, suggested lesson preview retains Professor |
| /faculty/students | Learner list, links, profile isolation, independent professor identity |
| /faculty/students/:studentId | Same student's new result visible, assignment submit and keyboard submit, recipient verification, notification drill-down, invalid student, empty history |
| /faculty/resources | Create, validation, keyboard save, edit, search, preview, archive confirmation, restore, catalog synchronization, Escape closes dialog |
| /faculty/resources/:resourceId | Professor layout on preview/refresh/Back/Forward, student activity controls absent, route to student assignment and management |
| Shared shell and fallback | Wrong-role URLs, explicit switches, mobile drawer and Escape, desktop collapse/expand, profile change closes stale modal, role-aware search and notifications, reset cancel/confirm, not-found route |

## Exact final checks

- **npm.cmd run build:** passed strict TypeScript compilation and Vite production build; 2,257 modules transformed.
- **npm.cmd test:** **20/20 passed**. Diagnostic/practice selection, scoring boundaries, varied questions, latest topic results, comparable coverage, prerequisites including transitive/unassessed prerequisites, archived resources, study/proficiency separation, class averages, migration, malformed records/drafts, score recomputation, and curated assistant behavior.
- **npm.cmd run test:e2e:** **13/13 passed**, approximately 2.5 minutes. The original student→professor→assignment and resource lifecycle journeys plus eight repair regressions, automated accessibility, and the responsive route sweep.
- **Accessibility:** axe WCAG 2 A/AA and 2.1 AA scans passed on welcome and all 13 workspace routes, an active quiz, and the mobile navigation dialog. Keyboard workflows include actual Enter submissions, Escape, focus restoration, native radio controls, and modal/profile flows. Automated scans are not a complete manual assistive-technology certification.
- **Responsive:** 39 workspace route/viewport combinations passed; desktop/mobile welcome also captured. Screenshots under artifacts/review-*.png were inspected for layout; mobile chart-label crowding and history-link spacing were corrected and recaptured.
- **Failure states:** unanswered quizzes, repeated submission, invalid resource form, empty search, no history, invalid IDs, malformed JSON, migration from existing version-one data, reset cancellation, and injected localStorage quota failure passed.
- **Console:** no page exceptions or application console errors in the monitored repair journeys and complete responsive route sweep; the main journey also checks page exceptions.
- **Startup:** from both outer workspace and learnwise/: npm run dev, npm start, npm.cmd run dev, npm.cmd start all passed. Every instance rendered welcome and entered the student dashboard in an isolated browser. Windows START-LEARNWISE.cmd also passed. Its auto-open was suppressed using Vite's BROWSER=none during testing to avoid touching the normal browser. No Windows policy was changed. Detailed results: [artifacts/startup-check.json](artifacts/startup-check.json).

The main development server is **http://localhost:5173/**. Test startup instances correctly fell back to **http://localhost:5174/** while 5173 was occupied; only those test-created process trees were stopped.

The managed execution sandbox initially prevented esbuild from traversing the project path. Running the local dev/build/browser commands outside that sandbox resolved the tool-environment restriction. This was not an application startup defect.

## Remaining scope limits

No known blocker remains in the tested core workflows. Verification used installed Edge, not a Safari/Firefox matrix or real mobile hardware. Frontend guards are not real security. Storage is local to the browser, concurrent-tab writes are last-save-wins, chat history is temporary, SQL is not executed, and the assistant is curated. No backend or real authentication was added.
