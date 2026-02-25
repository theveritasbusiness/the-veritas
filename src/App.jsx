import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import TheVeritasShowcase from "./TheVeritasShowcase";
import ArticlePage from "./ArticlePage";
import Privacy from "./Privacy";
import Terms from "./Terms";

export default function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<TheVeritasShowcase />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}