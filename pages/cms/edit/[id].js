import EditArticle from "../../../src/cms/EditArticle";
import ProtectedRoute from "../../../src/ProtectedRoutes";

export default function CmsEditArticlePage() {
  return (
    <ProtectedRoute>
      <EditArticle />
    </ProtectedRoute>
  );
}
