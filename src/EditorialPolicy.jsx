import React from "react";
import LegalDocumentPage from "./components/LegalDocumentPage";
import { editorialPolicyDocument } from "./content/officialLegalDocuments";

export default function EditorialPolicy() {
  return (
    <LegalDocumentPage
      title="Editorial Policy"
      description="The Veritas Code of Editorial Policy."
      path="/editorial-policy"
      document={editorialPolicyDocument}
    />
  );
}
