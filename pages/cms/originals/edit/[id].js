import OriginalEditor from "../../../../src/cms/OriginalEditor";
import ProtectedRoute from "../../../../src/ProtectedRoutes";

export default function CmsEditOriginalPage() {
  return <ProtectedRoute><OriginalEditor mode="edit" /></ProtectedRoute>;
}
