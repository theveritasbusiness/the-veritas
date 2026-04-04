import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "./lib/router";

import Layout from "./components/Layout";
import TheVeritasShowcase from "./TheVeritasShowcase";
import ArticlePage from "./ArticlePage";
import LiveMonitor from "./LiveMonitor";

import EditorLogin from "./cms/EditorLogin";
import EditorDashboard from "./cms/EditorDashboard";
import NewArticle from "./cms/NewArticle";
import EditArticle from "./cms/EditArticle";
import ProtectedRoute from "./ProtectedRoutes";

import Terms from "./Terms";
import Privacy from "./Privacy";

function HashRouteCompat() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const { hash } = window.location;
    if (!hash.startsWith("#/")) return;

    const target = hash.slice(1);
    window.history.replaceState(null, "", target);
    navigate(target, { replace: true });
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <HashRouteCompat />
      <Routes>

        {/* ✅ WITH NAVBAR */}
        <Route element={<Layout />}>
          <Route path="/" element={<TheVeritasShowcase />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/live" element={<LiveMonitor />} />
          <Route path="/trending" element={<LiveMonitor />} />
        </Route>

        {/* ❌ WITHOUT NAVBAR */}
        <Route path="/editors/login" element={<EditorLogin />} />
        <Route
          path="/editors/dashboard"
          element={
            <ProtectedRoute>
              <EditorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms"
          element={
            <ProtectedRoute>
              <EditorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/new"
          element={
            <ProtectedRoute>
              <NewArticle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/edit/:id"
          element={
            <ProtectedRoute>
              <EditArticle />
            </ProtectedRoute>
          }
        />

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

      </Routes>
    </Router>
  );
}

export default App;
