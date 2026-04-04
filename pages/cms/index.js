import EditorDashboard from "../../src/cms/EditorDashboard";
import ProtectedRoute from "../../src/ProtectedRoutes";

export default function CmsDashboardPage() {
  return (
    <ProtectedRoute>
      <EditorDashboard />
    </ProtectedRoute>
  );
}
