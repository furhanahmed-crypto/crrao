/**
 * Application submitted thank-you page — show reference ID from URL / session.
 */
(function () {
  "use strict";

  const SNAPSHOT_KEY = "crrao-application-submit";
  const refEl = document.getElementById("refId");

  const params = new URLSearchParams(window.location.search);
  const refFromUrl = (params.get("ref") || "").trim();

  let snapshot = null;
  try {
    snapshot = JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) || "null");
  } catch (e) {
    snapshot = null;
  }

  const refId =
    refFromUrl || (snapshot && snapshot.reference_id) || "CRR-2026-XXXXXX";

  if (refEl) refEl.textContent = refId;
})();
