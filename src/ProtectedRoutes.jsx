import React from "react";
import { Navigate } from "./lib/router";

function hasValidEditorToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("editorToken");

  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : 0;

    if (!expiresAt || Date.now() >= expiresAt) {
      localStorage.removeItem("editorToken");
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem("editorToken");
    return false;
  }
}

export default function ProtectedRoute({ children }) {
  const isValid = hasValidEditorToken();

  if (isValid === null) {
    return null;
  }

  if (!isValid) {
    return <Navigate to="/editors/login" replace />;
  }

  return children;
}
