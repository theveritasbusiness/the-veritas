import NewShort from "../../../src/cms/NewShort";
import ProtectedRoute from "../../../src/ProtectedRoutes";

export default function CmsNewShortPage() {
  return (
    <ProtectedRoute>
      <NewShort />
    </ProtectedRoute>
  );
}
