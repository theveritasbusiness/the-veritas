import EditShort from "../../../../src/cms/EditShort";
import ProtectedRoute from "../../../../src/ProtectedRoutes";

export default function CmsEditShortPage() {
  return (
    <ProtectedRoute>
      <EditShort />
    </ProtectedRoute>
  );
}
