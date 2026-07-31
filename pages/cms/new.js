import NewArticle from "../../src/cms/NewArticle";
import ProtectedRoute from "../../src/ProtectedRoutes";

export default function CmsNewArticlePage() {
  return (
    <ProtectedRoute>
      <NewArticle />
    </ProtectedRoute>
  );
}
