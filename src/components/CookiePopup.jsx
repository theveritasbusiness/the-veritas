import React, { useState, useEffect } from "react";

export default function CookiePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem("cookiesAccepted", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-neutral-900 border border-neutral-700 p-6 rounded max-w-lg text-center space-y-4">

        <h2 className="text-xl font-bold">We value your privacy</h2>

        <p className="text-sm text-neutral-400">
          We use cookies to enhance your experience, analyze traffic, and
          personalize content. By continuing, you agree to our use of cookies.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={acceptCookies}
            className="bg-red-600 text-black px-4 py-2 rounded font-bold"
          >
            Accept
          </button>

          <a
            href="/privacy"
            className="text-sm underline text-neutral-400 hover:text-white"
          >
            Learn more
          </a>
        </div>

      </div>
    </div>
  );
}