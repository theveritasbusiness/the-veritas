import LiveArticleEditor from "../../../src/cms/LiveArticleEditor";
import ProtectedRoute from "../../../src/ProtectedRoutes";

export default function CmsNewLiveArticlePage() {
  return (
    <ProtectedRoute>
      <LiveArticleEditor mode="create" />
    </ProtectedRoute>
  );
}
