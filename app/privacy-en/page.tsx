import React from "react";

export default function PrivacyPage() {
  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "32px auto" }}>
      <h1>Privacy & Cookies</h1>
      <p>
        This website respects your privacy. We use cookies to improve your browsing
        experience. By accepting the cookie banner you allow us to store a small token
        in your browser to remember your preference.
      </p>

      <h2>Cookies used</h2>
      <ul>
        <li>Essential cookies: required for site navigation and core functionality.</li>
        <li>Analytics cookies: used to collect anonymized usage data.</li>
      </ul>

      <h2>Manage preferences</h2>
      <p>
        You can clear cookie preferences through your browser settings or use the
        "Manage" link in the cookie banner to view policy details.
      </p>
    </main>
  );
}
