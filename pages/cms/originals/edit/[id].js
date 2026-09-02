import EditOriginal from "../../../../src/cms/EditOriginal";
import ProtectedRoute from "../../../../src/ProtectedRoutes";

export default function CmsEditOriginalPage() {
  return (
    <ProtectedRoute>
      <EditOriginal />
    </ProtectedRoute>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
