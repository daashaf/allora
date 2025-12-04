import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { ReactComponent as InfinityLogo } from "./assets/infinity-logo.svg";
import AppRoutes from "./routes/AppRoutes";
import { auth } from "./firebase";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const finish = () => setIsLoading(false);
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }
    const fallback = window.setTimeout(finish, 1000);
    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(fallback);
    };
  }, []);

  // Clear any existing auth session on app start so the app opens logged out.
  useEffect(() => {
    if (!auth) return;
    signOut(auth).catch(() => {});
  }, []);

  return (
    <>
      {isLoading && (
        <div className="app-loader" role="status" aria-live="polite">
          <div className="app-loader-card">
            <InfinityLogo className="app-loader-logo" focusable="false" />
            <p className="app-loader-text">Loading Allora</p>
          </div>
        </div>
      )}
      <AppRoutes />
    </>
  );
}
