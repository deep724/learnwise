# LearnWise presentation walkthrough

Run npm.cmd run dev from the workspace or learnwise/, then open the printed Local URL. The server for this repair session is **http://127.0.0.1:5175/**. Use a separate browser profile/context for a fresh demonstration; do not reset someone else's saved data.

1. **Introduce the scope.** A frontend Smart Digital Library & Learning Gap Analyzer for Silver Oak University, with synthetic profiles and local storage. Demo roles are not real authentication.
2. **Enter as Student.** Select Aanya Shah. Show assessed coverage and explain that topic results drive recommendations. Veer Pandya provides an unassessed starting point.
3. **Take the diagnostic.** Open Knowledge Check and select Full DBMS diagnostic: twelve questions, three per topic. Demonstrate Previous/Next and retained answers. Review early and submit: the warning provides a direct link to an unanswered question.
4. **Show recovery.** Answer a question, refresh, choose Resume draft, and continue. For the gap example, answer JOIN questions incorrectly and the other topics correctly using the studied content.
5. **Submit and inspect.** That example yields 9/12 (75%), JOINs 0/3, others 3/3. Show explanations and denominators. Refresh the result to demonstrate its stable URL. Explain that short assessments are preliminary.
6. **Follow the recommendation.** Learning Path → SQL JOINs → Open resource → Mark as studied. Reading changes activity, not proficiency. Explain this concept → Show an example; point out **Demo Assistant — curated explanations** and the SQL example.
7. **Practice and compare.** Select SQL Basics or JOINs and press Start topic quiz. A second practice on the same topic uses a varied set and enables a comparable first/latest change. Diagnostic and practice are not treated as equivalent coverage. View results reopens explanations. Start another topic with an existing draft to show that both drafts remain available.
8. **Switch to Professor.** Show class/topic filters and assessment coverage. Open Aanya Shah and verify the same new JOIN result. The header stays Professor demo while inspecting a learner.
9. **Assign a resource.** Assign Think inside the query. Switch to Student; it appears in From your Professor, Assigned Resources, and notifications for Aanya. Change profiles to demonstrate assignment isolation.
10. **Manage content.** Professor → Resource Management → Add a resource. Supply title, description, lesson content, topic/type/level, and whole-number minutes. Save and preview in the professor workspace. Edit the title, explicitly switch to Student, and find it in the library. Archive, verify exclusion, and restore.
11. **Show boundaries.** While Student is active, visit /faculty/resources. The access message preserves student identity. Use the explicit switcher. Demonstrate mobile drawer closure and desktop sidebar collapse/expand.
12. **Close with limitations.** Data stays in this browser, the assistant is curated, and no backend/security is claimed. Open Reset demo data, then Keep my data to preserve results.

If storage is unavailable, the persistent banner explains session-only changes and the resource form retains input for retry. Do not promise session-only changes survive refresh. The current route/action checklist and verification results are in [docs/QA.md](docs/QA.md).
