import OriginalEditor from "../../../src/cms/OriginalEditor";
import ProtectedRoute from "../../../src/ProtectedRoutes";

export default function CmsNewOriginalPage() {
  return <ProtectedRoute><OriginalEditor mode="create" /></ProtectedRoute>;
}
