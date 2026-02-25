import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TheVeritasShowcase from "./TheVeritasShowcase";
import ArticlePage from "./ArticlePage";
import EditorLogin from "./cms/EditorLogin";
import EditorDashboard from "./cms/EditorDashboard";
import NewArticle from "./cms/NewArticle";
import ProtectedRoute from "./ProtectedRoutes";
import EditArticle from "./cms/EditArticle";
import CookiePopup from "./components/CookiePopup";
import Privacy from "./Privacy";
import Terms from "./Terms";
import CookieConsent from "./components/CookieConsent";

export default function App() {
  return (
    <Router>
      <CookiePopup />
      <CookieConsent />

      <Routes>
        <Route path="/" element={<TheVeritasShowcase />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/login" element={<EditorLogin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

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
      </Routes>
    </Router>
  );
}