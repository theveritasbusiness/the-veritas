import EditorDashboard from "../../src/cms/EditorDashboard";
import ProtectedRoute from "../../src/ProtectedRoutes";

export default function EditorDashboardPage() {
  return (
    <ProtectedRoute>
      <EditorDashboard />
    </ProtectedRoute>
  );
}
