import React from "react";
import LegalDocumentPage from "./components/LegalDocumentPage";
import { termsDocument } from "./content/officialLegalDocuments";

export default function Terms() {
  return (
    <LegalDocumentPage
      title="Terms & Conditions"
      description="Read the Terms of Use and governing conditions for access to The Veritas website, subscriptions, content, and digital services."
      path="/terms"
      document={termsDocument}
    />
  );
}
