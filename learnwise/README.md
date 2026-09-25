# LearnWise

**Smart Digital Library & Learning Gap Analyzer** — a frontend university project for Silver Oak University. Synthetic profiles, original DBMS resources, assessments, recommendations, and professor insights. This is an independent student prototype, not an official university service.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm. From this folder or the outer workspace:

```powershell
npm.cmd install
npm.cmd run dev
# Alternatively:
npm.cmd start
```

Open the Local URL printed by Vite, normally **http://127.0.0.1:5173/**. The current presentation server is **http://127.0.0.1:5175/**. An occupied default port automatically selects another; use `npm.cmd run dev -- --port 5175 --strictPort` to demand a specific port and receive a clear conflict error. The outer START-LEARNWISE.cmd launcher starts the same app and opens the browser; it accepts `--port 5175 --strictPort` too. Command Prompt supports `npm run dev` and `npm start`. PowerShell users can avoid npm.ps1 policy issues with npm.cmd, without changing Windows policy. Servers bind to loopback by default.

Choose **Explore as Student** or **Explore as Professor**. Direct workspace links require a demo session. Wrong-role links show an access message; use the role switcher to change roles explicitly. The /faculty prefix remains for compatibility; visible labels use Professor. Resource previews retain professor navigation and never mark student activity.

```powershell
npm.cmd run build       # TypeScript and production bundle
npm.cmd run typecheck   # Standalone TypeScript check, including tests
npm.cmd test            # Learning logic and persistence tests
npm.cmd run test:e2e    # Browser journeys, failures, accessibility, responsive routes
npm.cmd run test:startup # Windows startup matrix, isolated ports 5200–5208
npm.cmd run preview     # Serve production build
npm.cmd run format      # Format source
```

Playwright uses installed Microsoft Edge. Set PLAYWRIGHT_CHANNEL=chrome for installed Chrome, or chromium after installing Playwright Chromium. Tests use new contexts and their own strict-port server on 5186, preserving personal browser data and refusing stale server reuse. Screenshots and the JSON browser report are under artifacts/; failure traces are under test-results/. See [docs/QA.md](docs/QA.md) for the current audit and [PRESENTATION.md](PRESENTATION.md) for the demo.

## Stack and structure

React 19, TypeScript, Vite, React Router, Tailwind CSS 4/custom CSS, Lucide, Recharts. The app/.../page.tsx organization is preserved; this is **not Next.js**. Fonts and learning content are local. No backend, paid service, API key, or external AI service is required.

- main.tsx: routes, including professor previews and student assignments.
- app/layout.tsx: explicit session/role guards and responsive workspace.
- components/layout/: role-aware sidebar, search, identity, notifications, profile selection, reset.
- app/student/: dashboard, library/reader, quiz/results, learning path, assistant, progress, assignments.
- app/faculty/: class overview, student insights/assignments, resource management.
- lib/store.tsx: immediate state updates and accurate persistence feedback.
- lib/storage.ts: validation, version-one migration, seeding, score recomputation.
- lib/quiz.ts: centralized thresholds, selection, scoring, comparable attempts.
- lib/recommendations.ts and lib/faculty.ts: prerequisites and calculated statistics.
- data/: four topics, twelve resources, thirty-two explained questions, twelve synthetic profiles, curated responses.
- lib/learning.test.ts and tests/: logic, persistence, interaction, accessibility, responsive verification.

## Assessment and learning rules

Diagnostics contain **12 questions, three per topic**. Practices contain **five questions**, with rotated follow-up sets. Answers survive Previous/Next and review navigation. Submission requires all answers and guards against duplicate attempts. Results explain every answer, show topic denominators, and update dashboard, progress, recommendations, and professor insights.

| Topic score | Interpretation                | Recommendation                             |
| ----------- | ----------------------------- | ------------------------------------------ |
| Below 60%   | Needs support                 | Beginner lesson and practice               |
| 60–79%      | Developing                    | Worked example/revision and quiz           |
| 80%+        | Proficient in this assessment | Eligible next topic or continued practice  |
| No result   | Not assessed                  | Establish a starting point with assessment |

Scores are correct / total × 100, rounded to whole percentages. The latest assessment covering each topic supplies its result. Overall scores do not determine topic weaknesses. lib/quiz.ts holds shared thresholds. These are prototype rules, not validated measures of ability.

Prerequisites: **SQL Basics → SQL JOINs → Subqueries**, and **SQL Basics → Normalization** separately. Unassessed or below-proficiency prerequisites are reviewed first, including prerequisites further back in the chain. Resources never change assessed proficiency. Archived resources leave recommendations and the active library while remaining readable from history and existing assignments.

Professor averages exclude unassessed values and show coverage. Each student/topic contributes one latest assessed score. Improvement compares only five-question practices on the same topic; variation in difficulty remains a limitation.

## Persistence and demo access

The learnwise-demo-v1 localStorage key stores shared records, selected profile/role, an explicit session flag, and drafts keyed by student and assessment (for example student-1:basics). Valid older version-one saves and their single-student drafts migrate without losing records or answers. First entry requires an explicit role choice. Invalid data produces a recovery notification and preserves the unreadable original under learnwise-demo-recovery before saving fresh state. If backup storage fails, the original is not overwritten. Submitted scores are recomputed from answers on load.

Students have separate attempts, bookmarks, studied activity, assignments, and drafts. **Resume selected assessment** recovers the selected quiz; other unfinished assessments have named Resume and Discard actions. Starting SQL Basics never removes or blocks an unfinished JOINs quiz. Results use stable ?attempt=... URLs and reopen through **View results** in history. Other students cannot open those result URLs. Chat transcripts are temporary and reset with profile changes.

Updates persist before success messages appear. Storage failure keeps the change in memory, with both a message and persistent banner explaining **session-only** changes. The resource editor stays open with entered content intact so Save resource can be retried; the stable ID prevents duplicate saves. Refresh loses session-only changes. Reset requires confirmation and restores synthetic seeds, clearing drafts; cancel preserves records. Reset affects the current browser origin only. The recovery copy is retained for manual recovery.

## Presentation walkthroughs

**Student:** Enter as Student, use Aanya Shah for a seeded history or choose Veer Pandya in the profile menu for an unassessed profile. Open Knowledge Check → Start diagnostic → answer → Review answers → Submit assessment. Inspect topic scores and explanations, follow Learning Path to a lesson, mark it studied, and ask the Demo Assistant for an example. Complete a five-question topic quiz, then open My Progress and View results. Two practices on the same topic enable a first/latest comparison.

**Professor:** Explicitly Switch to Professor, filter the Class Overview, and open the same student's details. Assign an active resource, switch back to Student, and verify it in Assigned Resources. In Resource Management, create a lesson with a title, description, content and 1–240 whole-number minutes. Preview it in the professor workspace, edit it, archive with confirmation, and restore it. The student catalog updates immediately. Professor demo identity remains separate from the student being inspected. All twelve profiles and seeded records are synthetic.

Data is shared only among same-origin browser tabs. Storage events refresh learning records without changing another open tab's role/profile. Simultaneous writes remain last-save-wins; this demo is intended for a single presenter. There is no real authentication, authorization, academic grading, server, or network synchronization. Frontend guards provide navigation consistency, not security.

**Demo Assistant — curated explanations** remains visible. The assistant supports four DBMS topics and contextual follow-ups; it is not live AI. SQL examples are educational text, not an execution engine. Other subjects are marked coming soon.

Production hosting must route unknown application paths to index.html for deep links. A future real deployment needs server authentication/authorization, validated scoring, a data API, and privacy controls before storing real student records.
