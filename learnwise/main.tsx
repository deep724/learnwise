import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { DemoProvider, useDemo } from "./lib/store";
import Layout from "./app/layout";
import Welcome from "./app/page";
import Dashboard from "./app/student/dashboard/page";
import Library from "./app/student/library/page";
import Resource from "./app/student/library/[resourceId]/page";
import Quiz from "./app/student/quiz/page";
import LearningPath from "./app/student/learning-path/page";
import Assistant from "./app/student/assistant/page";
import Progress from "./app/student/progress/page";
import Faculty from "./app/faculty/dashboard/page";
import Student from "./app/faculty/students/[studentId]/page";
import ResourceManagement from "./app/faculty/resources/page";
import Assignments from "./app/student/assignments/page";
import Toast from "./components/ui/Toast";
import "./app/globals.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
function ContextualQuiz() {
  const { state } = useDemo();
  const { search } = useLocation();
  return <Quiz key={state.profileId + search} />;
}
function ContextualAssistant() {
  const { state } = useDemo();
  const { search } = useLocation();
  return <Assistant key={state.profileId + search} />;
}
function ContextualLibrary() {
  const { search } = useLocation();
  return <Library key={search} />;
}
function ManagedResources() {
  const { search } = useLocation();
  return <ResourceManagement key={search} />;
}
function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route element={<Layout />}>
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/student/library" element={<ContextualLibrary />} />
            <Route path="/student/library/:resourceId" element={<Resource />} />
            <Route path="/student/quiz" element={<ContextualQuiz />} />
            <Route path="/student/learning-path" element={<LearningPath />} />
            <Route
              path="/student/assistant"
              element={<ContextualAssistant />}
            />
            <Route path="/student/progress" element={<Progress />} />
            <Route path="/faculty/dashboard" element={<Faculty />} />
            <Route
              path="/faculty/students"
              element={<Faculty studentsOnly />}
            />
            <Route
              path="/faculty/students"
              element={<Faculty studentsOnly />}
            />
            <Route path="/faculty/students/:studentId" element={<Student />} />
            <Route
              path="/faculty/resources/:resourceId"
              element={<Resource />}
            />
            <Route path="/student/assignments" element={<Assignments />} />
            <Route path="/faculty/resources" element={<ManagedResources />} />
            <Route
              path="*"
              element={
                <div className="empty-state card">
                  <h1>This path is still unexplored.</h1>
                  <p>Let’s take you back to familiar ground.</p>
                  <Link className="btn btn-primary" to="/">
                    Back to LearnWise
                  </Link>
                </div>
              }
            />
          </Route>
        </Routes>
        <Toast />
      </BrowserRouter>
    </DemoProvider>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
