import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("editorToken");

  if (!token) {
    return <Navigate to="/editors/login" replace />;
  }

  return children;
}