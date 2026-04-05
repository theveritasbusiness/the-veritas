import React from "react";
import LegalDocumentPage from "./components/LegalDocumentPage";
import { termsIntro, termsSections } from "./content/legalContent";

export default function Terms() {
  return (
    <LegalDocumentPage
      title="Terms of Use"
      description="Read the Terms of Use and governing conditions for access to The Veritas website, subscriptions, content, and digital services."
      path="/terms"
      intro={termsIntro}
      sections={termsSections}
    />
  );
}
