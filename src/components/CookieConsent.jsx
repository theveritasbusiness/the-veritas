import React, { useState, useEffect } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookieAccepted");
    if (!accepted) setShow(true);
  }, []);

  function acceptCookies() {
    localStorage.setItem("cookieAccepted", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-6 rounded max-w-md text-center space-y-4">

        <h2 className="text-xl font-bold text-white">
          We use cookies 🍪
        </h2>

        <p className="text-neutral-400 text-sm">
          We use cookies to improve your experience. By continuing, you accept our policy.
        </p>

        <button
          onClick={acceptCookies}
          className="bg-red-600 text-black px-6 py-2 rounded"
        >
          Accept
        </button>

      </div>
    </div>
  );
}