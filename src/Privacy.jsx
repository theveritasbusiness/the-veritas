import React from "react";
import LegalDocumentPage from "./components/LegalDocumentPage";
import { privacyIntro, privacySections } from "./content/legalContent";

export default function Privacy() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      description="Read how The Veritas collects, uses, stores, and protects personal information across its website, subscriptions, and digital services."
      path="/privacy"
      intro={privacyIntro}
      sections={privacySections}
    />
  );
}
