import NewOriginal from "../../../src/cms/NewOriginal";
import ProtectedRoute from "../../../src/ProtectedRoutes";

export default function CmsNewOriginalPage() {
  return (
    <ProtectedRoute>
      <NewOriginal />
    </ProtectedRoute>
  );
}
