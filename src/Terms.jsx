import React from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-neutral-300 leading-7">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-white hover:border-[var(--veritas-red)] hover:text-[var(--veritas-red)] transition-colors"
        >
          Back to Homepage
        </Link>

        <h1 className="text-3xl font-bold text-white mb-6">
          Terms & Conditions
        </h1>

        <p className="mb-4">
          By accessing The Veritas website, you agree to these Terms and Conditions.
        </p>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          Usage Rules
        </h2>

        <ul className="list-disc ml-6 space-y-2">
          <li>Accounts are personal and cannot be shared</li>
          <li>No unauthorized copying or redistribution</li>
          <li>No misuse of platform functionality</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          Intellectual Property
        </h2>

        <p>
          All content on this website is owned by The Veritas and protected by law.
        </p>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          Liability
        </h2>

        <p>
          The service is provided "as is". We are not liable for damages arising
          from usage of the site.
        </p>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          Jurisdiction
        </h2>

        <p>
          All disputes are subject to New Delhi, India jurisdiction.
        </p>

      </div>
  );
}
