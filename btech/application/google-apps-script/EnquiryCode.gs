/* ============================================================
   CR Rao AIMSCS — Enquiry / Contact Form Backend
   Google Apps Script that receives enquiry submissions from
   contact.php and the homepage popup on index.php, and appends
   each row to a Google Sheet.
   ============================================================

   ▸ HOW TO DEPLOY (one-time, ~5 minutes)
   ─────────────────────────────────────────────────────────────
   1. In Google Drive, create a folder e.g. "Enquiry Form Submissions".
   2. Inside that folder, create a Google Sheet named
      "Enquiry Form Submissions" (or any name you prefer).
   3. Open the Sheet → copy its ID from the URL:
        https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   4. Go to https://script.google.com → "New project".
   5. Replace the default Code.gs with THIS FILE's contents.
   6. Update SHEET_ID below with the ID from step 3.
   7. Save (Cmd/Ctrl+S), name the project e.g. "CRR Enquiry Form".
   8. Click "Deploy" → "New deployment" → gear icon → "Web app".
        - Description   : "Enquiry Form Endpoint"
        - Execute as    : "Me (your@email)"
        - Who has access: "Anyone"          ← MUST be "Anyone", not "Only myself"
      Click "Deploy" and authorise when prompted.
   9. Verify: open the /exec URL in a browser — you should see:
        {"status":"ok","message":"CR Rao AIMSCS enquiry endpoint is live."}
      If you see a Google sign-in page instead, the access setting is wrong.
  10. Copy the Web-app URL and paste it into /js/enquiry-form.js as GOOGLE_SCRIPT_URL.

   ▸ What happens at runtime
   ─────────────────────────────────────────────────────────────
   • Each submission becomes one row in the "Enquiries" tab.
   • Source column records "Contact Page" or "Homepage Popup".
   • Optional admin email notification (toggle below).

   ============================================================ */

/* ────────────  CONFIG  ──────────── */
const SHEET_ID = "1fITeLYxQAU-xpVMqslSBj7UZvY3n4MtL-oYv-SV5ovs";
const SHEET_NAME = "Enquiry Form Applications";
const SEND_ADMIN_EMAIL = true;
const ADMIN_NOTIFY_EMAIL = "btechadmissions.crr@gmail.com";
/* ─────────────────────────────────── */

const ENQUIRY_HEADER_ROW = [
  "Reference ID",
  "Submitted At",
  "Source",
  "Name",
  "Email",
  "Mobile",
  "Message",
];

/** Browser GET — health check. */
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      message: "CR Rao AIMSCS enquiry endpoint is live.",
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/** Receive enquiry POST. */
function doPost(e) {
  try {
    const payload = JSON.parse(e.parameter.payload || "{}");
    const refId = payload.reference_id || "ENQ-" + Date.now();
    const submittedAt = payload.submitted_at || new Date().toISOString();

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(ENQUIRY_HEADER_ROW);
      sheet.setFrozenRows(1);
      sheet
        .getRange(1, 1, 1, ENQUIRY_HEADER_ROW.length)
        .setFontWeight("bold")
        .setBackground("#1a3a6b")
        .setFontColor("#ffffff");
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(ENQUIRY_HEADER_ROW);
      sheet.setFrozenRows(1);
    }

    const row = [
      refId,
      submittedAt,
      payload.source || "",
      payload.name || "",
      payload.email || "",
      payload.mobile || "",
      payload.comments || payload.message || "",
    ];
    sheet.appendRow(row);

    if (SEND_ADMIN_EMAIL && ADMIN_NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: ADMIN_NOTIFY_EMAIL,
          subject: `New Enquiry — ${payload.name || refId}`,
          htmlBody: buildEnquiryEmailHtml(payload, refId, submittedAt),
          name: "CR Rao AIMSCS Website",
        });
      } catch (mailErr) {
        console.error("Admin email failed:", mailErr);
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "ok",
        reference_id: refId,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function buildEnquiryEmailHtml(p, refId, submittedAt) {
  const safe = (s) =>
    (s == null ? "" : String(s))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
    <div style="background:#1a3a6b;color:#fff;padding:1.25rem;border-radius:8px 8px 0 0;">
      <h2 style="margin:0;font-size:18px;">New Website Enquiry</h2>
      <p style="margin:0.4rem 0 0;font-size:13px;opacity:.85;">Reference: ${safe(refId)}</p>
    </div>
    <div style="padding:1.25rem;background:#f8f9fc;border:1px solid #e8eaf0;border-top:none;border-radius:0 0 8px 8px;">
      <p><strong>Submitted:</strong> ${safe(submittedAt)}</p>
      <p><strong>Source:</strong> ${safe(p.source)}</p>
      <p><strong>Name:</strong> ${safe(p.name)}</p>
      <p><strong>Email:</strong> ${safe(p.email)}</p>
      <p><strong>Mobile:</strong> ${safe(p.mobile)}</p>
      <p><strong>Message:</strong><br>${safe(p.comments || p.message).replace(/\n/g, "<br>")}</p>
    </div>
  </div>`;
}
