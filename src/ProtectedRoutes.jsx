import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("editorToken");

  if (!token) {
  return <Navigate to="/editors/login" />;
}

  return children;
}