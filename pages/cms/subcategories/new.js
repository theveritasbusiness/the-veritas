import NewSubcategory from "../../../src/cms/NewSubcategory";
import ProtectedRoute from "../../../src/ProtectedRoutes";

export default function CmsNewSubcategoryPage() {
  return (
    <ProtectedRoute>
      <NewSubcategory />
    </ProtectedRoute>
  );
}
