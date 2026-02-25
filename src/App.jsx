import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import TheVeritasShowcase from "./TheVeritasShowcase";
import ArticlePage from "./ArticlePage";
import Privacy from "./Privacy";
import Terms from "./Terms";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TheVeritasShowcase />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
      </Routes>
    </Router>
  );
}