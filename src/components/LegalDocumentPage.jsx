import React from "react";
import { Link } from "../lib/router";
import Seo from "./Seo";

function Chevron() {
  return (
    <svg
      className="h-5 w-5 text-neutral-500 transition-transform duration-200 group-open:rotate-180"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LegalDocumentPage({
  title,
  description,
  path,
  intro,
  sections,
}) {
  return (
    <>
      <Seo title={title} description={description} path={path} />
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="flex justify-end">
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--veritas-red)] hover:text-[var(--veritas-red)]"
            >
              Back to Homepage
            </Link>
          </div>

          <div className="mx-auto mt-4 max-w-3xl text-center">
            <img
              src="/Logo_Edit_4.png"
              alt="The Veritas"
              className="mx-auto w-full max-w-[560px] object-contain"
            />
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <h1 className="font-serif text-4xl font-bold leading-tight text-[var(--veritas-red)] sm:text-5xl">
              {title}
            </h1>

            <div className="mt-6 space-y-5 font-serif text-xl leading-10 text-neutral-100 max-sm:text-lg max-sm:leading-9">
              {intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 divide-y divide-white/10 border-y border-white/10 bg-neutral-950/80 backdrop-blur-sm">
              {sections.map((section, index) => (
                <details
                  key={section.title}
                  className="group"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-1 py-6 font-serif text-2xl leading-tight text-white marker:content-none max-sm:text-xl">
                    <span>{section.title}</span>
                    <Chevron />
                  </summary>
                  <div className="pb-7 pr-10 text-base leading-8 text-neutral-300 max-sm:pr-0">
                    <div className="space-y-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
