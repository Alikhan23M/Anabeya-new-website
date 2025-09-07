"use client";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true); // show only once per session
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User choice:", outcome);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <>
      {showPrompt && (
        <div className="fixed top-4 left-4 bg-[#0d0d0d] text-white p-4 rounded-lg shadow-lg z-50">
          <p className="mb-2">✨ Install Anabeya Collection for a better experience!</p>
          <button
            onClick={handleInstallClick}
            className="bg-[#e4b68a] text-black px-4 py-2 rounded-lg"
          >
            Install
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="ml-2 text-gray-300"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
