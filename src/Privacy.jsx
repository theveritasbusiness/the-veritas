import React from "react";
import Layout from "./components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-10 text-neutral-300 leading-7">

        <h1 className="text-3xl font-bold text-white mb-6">
          Privacy Policy
        </h1>

        <p className="mb-4">
          THE VERITAS PRIVATE LIMITED ("The Veritas", "we", "our") is committed
          to protecting your privacy and ensuring transparency in how your data
          is used.
        </p>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          Information We Collect
        </h2>

        <ul className="list-disc ml-6 space-y-2">
          <li>Name, email, phone number, preferences</li>
          <li>Device data, IP address, browser info</li>
          <li>Usage data like clicks, scrolls, activity</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          How We Use Data
        </h2>

        <ul className="list-disc ml-6 space-y-2">
          <li>Improve user experience</li>
          <li>Personalize content</li>
          <li>Communicate updates and offers</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          Cookies
        </h2>

        <p>
          We use cookies to enhance your experience, analyze traffic, and
          personalize content. You can control cookie preferences via your
          browser.
        </p>

        <h2 className="text-xl font-semibold text-white mt-6 mb-2">
          Your Rights
        </h2>

        <ul className="list-disc ml-6 space-y-2">
          <li>Request access to your data</li>
          <li>Request correction or deletion</li>
          <li>Restrict or object to processing</li>
        </ul>

        <p className="mt-6">
          For any queries, contact: queries@theveritas.in
        </p>

      </div>
    </Layout>
  );
}