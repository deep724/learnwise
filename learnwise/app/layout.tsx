import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useDemo } from "../lib/store";
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const { state, storageAvailable } = useDemo();
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname, state.role, state.profileId]);
  if (!state.sessionActive) return <Navigate to="/" replace />;
  const wrongRole =
    (pathname.startsWith("/faculty/") && state.role !== "faculty") ||
    (pathname.startsWith("/student/") && state.role !== "student");
  return (
    <div className={`app-shell ${collapsed ? "sidebar-small" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="app-body" inert={open}>
        <Header
          key={state.role + state.profileId}
          onMenu={() => setOpen(true)}
        />
        <main id="main-content" className="main-content">
          {!storageAvailable && (
            <p className="storage-notice" role="status">
              Storage unavailable. Changes are session-only and will be lost on
              refresh.
            </p>
          )}
          {wrongRole ? (
            <div className="card empty-state">
              <h1>This page belongs to another workspace</h1>
              <p>
                You are using the{" "}
                {state.role === "faculty" ? "Professor" : "Student"} demo. Use
                the explicit role switch in navigation to change workspaces.
              </p>
              <Link className="btn btn-primary" to={`/${state.role}/dashboard`}>
                Return to my workspace
              </Link>
            </div>
          ) : (
            <Outlet key={state.role + state.profileId} />
          )}
        </main>
        <footer className="app-footer">
          <span>LearnWise · Silver Oak University.</span>
          <span>
            <i /> Demo workspace ·{" "}
            {storageAvailable
              ? "Saved in this browser"
              : "Session-only changes"}
          </span>
        </footer>
      </div>
    </div>
  );
}
