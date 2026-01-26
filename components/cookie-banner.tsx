"use client";
import React from "react";

export default function CookieBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem("cookie_consent");
      if (!v) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function acceptAll() {
    try { localStorage.setItem("cookie_consent", "accepted"); } catch {}
    setVisible(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <div className="cookie-banner-inner">
        <div className="cookie-banner-text">
          This site uses cookies to enhance your experience.<br />
          By continuing you accept our use of cookies.
        </div>

        <div className="cookie-banner-actions">
          <a className="cookie-banner-links" href="/privacy-en">Manage</a>
          <button className="btn" onClick={() => setVisible(false)}>Dismiss</button>
          <button className="btn btn-primary" onClick={acceptAll}>Accept All</button>
        </div>
      </div>
    </div>
  );
}
