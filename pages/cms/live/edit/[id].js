import LiveArticleEditor from "../../../../src/cms/LiveArticleEditor";
import ProtectedRoute from "../../../../src/ProtectedRoutes";

export default function CmsEditLiveArticlePage() {
  return (
    <ProtectedRoute>
      <LiveArticleEditor mode="edit" />
    </ProtectedRoute>
  );
}
