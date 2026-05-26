/* ============================================================
   CR Rao AIMSCS — B.Tech 2026-27 Application Backend
   Google Apps Script that receives form submissions, writes a
   row to a Google Sheet, and saves uploaded files into a Drive
   folder per applicant.
   ============================================================

   ▸ HOW TO DEPLOY (one-time, ~5 minutes)
   ─────────────────────────────────────────────────────────────
   1. Go to https://script.google.com → "New project".
   2. Replace the default Code.gs with THIS FILE's contents.
   3. Update the two CONFIG values below:
        SHEET_ID    – Google Sheet ID (the long string between
                      /d/ and /edit in the Sheet URL).
        DRIVE_FOLDER_ID – ID of a Drive folder where uploaded
                      files will be stored (open the folder, copy
                      the ID from the URL).
   4. Save (Cmd/Ctrl+S), name the project e.g. "B.Tech Application".
   5. Click "Deploy" → "New deployment" → gear ▸ "Web app".
        - Description : "B.Tech 2026-27 Application Endpoint"
        - Execute as  : "Me (your@email)"
        - Who has access : "Anyone"
      Click "Deploy", authorise the scopes when prompted.
   6. Copy the Web-app URL it gives you (looks like
      https://script.google.com/macros/s/AKfy…/exec ).
   7. Open  /js/application.js  and replace the value of
      GOOGLE_SCRIPT_URL with that URL.  Done.

   ▸ What happens at runtime
   ─────────────────────────────────────────────────────────────
   • Each submission becomes one row in the "Applications" tab.
   • Each applicant's uploaded documents are saved to a sub-folder
     named  <REFERENCE_ID> – <FullName>  inside DRIVE_FOLDER_ID.
   • The Sheet stores Drive-file links so admin can click through.
   • The script also emails the candidate a confirmation if their
     email is provided (toggle SEND_CONFIRMATION_EMAIL below).

   ============================================================ */

/* ────────────  CONFIG  ──────────── */
const SHEET_ID = "1UBUaQQZAMqkaqnk7aixHMDN5YELhLIZZP4e4L1WoerE";
const DRIVE_FOLDER_ID = "1SC5lMaZs0aR5QOIPvGTWcHyB6MyMJXna";
const SHEET_NAME = "CRR Applications";
const SHORTLIST_SHEET_NAME = "60-percent-or-above";
const SHORTLIST_MPC_THRESHOLD = 60;
const SEND_CONFIRMATION_EMAIL = true;
const ADMIN_NOTIFY_EMAIL = "btechadmissions.crr@gmail.com"; // btechadmissions@crraoaimscs.res.in
/** Bump when deploying — check via the web-app URL in a browser. */
const APP_SCRIPT_VERSION = "2026.05.26-mpc-shortlist";
/* ─────────────────────────────────── */

/** Browser GET — used as a health check. */
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      message: "CR Rao AIMSCS application endpoint is live.",
      version: APP_SCRIPT_VERSION,
      header_columns: HEADER_ROW.length,
      has_mpc_group_pct: HEADER_ROW.indexOf("MPC Group %") !== -1,
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/** Receive the application POST. */
function doPost(e) {
  try {
    const payload = JSON.parse(e.parameter.payload || "{}");
    const refId = payload.reference_id || "CRR-2026-" + Date.now();

    /* 1. Make a per-applicant folder in Drive */
    const root = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const subFolderName = `${refId} – ${payload.full_name || "Unknown"}`;
    const folder = root.createFolder(subFolderName);
    folder.setDescription(
      `Applicant: ${payload.full_name || ""} | Email: ${payload.email || ""} | Mobile: ${payload.mobile || ""}`,
    );

    /* 2. Save uploaded files; collect URLs */
    const fileLinks = {};
    const files = payload.files || {};
    Object.keys(files).forEach((key) => {
      const f = files[key];
      if (!f || !f.data) return;
      const blob = Utilities.newBlob(
        Utilities.base64Decode(f.data),
        f.type || "application/octet-stream",
        f.name || key + ".bin",
      );
      const driveFile = folder.createFile(blob);
      // Make link visible to anyone with the URL (so admin can share quickly)
      driveFile.setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW,
      );
      fileLinks[key] = driveFile.getUrl();
    });

    /* 3. Append a row to the Sheet */
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = getOrCreateSheet_(ss, SHEET_NAME);

    const row = HEADER_ROW.map((col) => {
      switch (col) {
        case "Reference ID":
          return refId;
        case "Submitted At":
          return payload.submitted_at || new Date().toISOString();
        case "Folder Link":
          return folder.getUrl();
        case "Photo":
          return fileLinks.upload_photo || "";
        case "Signature (Upload)":
          return fileLinks.upload_signature || "";
        case "Digital Signature":
          return fileLinks.digital_signature || "";
        case "JEE Rank Card":
          return fileLinks.upload_jee || "";
        case "EAPCET Rank Card":
          return fileLinks["upload_ts-eapcet"] || fileLinks.upload_eapcet || "";
        case "SSC Memo":
          return fileLinks.upload_ssc || "";
        case "HSC Memo":
          return fileLinks.upload_hsc || "";
        case "Aadhaar (Upload)":
          return fileLinks.upload_aadhaar || "";
        case "Payment Receipt":
          return fileLinks.upload_payment_receipt || "";
        default: {
          const key = COLUMN_TO_FIELD[col];
          return key ? payload[key] || "" : "";
        }
      }
    });
    sheet.appendRow(row);

    /* 3b. If the applicant's MPC group % >= threshold, mirror the row
       into the shortlist tab with identical columns. */
    const mpcNum = parseMpcPct_(payload.hsc_mpc_pct);
    if (mpcNum !== null && mpcNum >= SHORTLIST_MPC_THRESHOLD) {
      try {
        const shortlistSheet = getOrCreateSheet_(ss, SHORTLIST_SHEET_NAME);
        shortlistSheet.appendRow(row);
      } catch (shortlistErr) {
        // Non-fatal — log but don't block the submission.
        console.error("Shortlist append failed:", shortlistErr);
      }
    }

    /* 4. Optional confirmation email to applicant */
    if (SEND_CONFIRMATION_EMAIL && payload.email) {
      try {
        MailApp.sendEmail({
          to: payload.email,
          cc: ADMIN_NOTIFY_EMAIL,
          subject: `B.Tech 2026-27 Application Received — ${refId}`,
          htmlBody: buildEmailHtml(payload, refId, folder.getUrl()),
          name: "CR Rao AIMSCS Admissions",
        });
      } catch (mailErr) {
        // Non-fatal — log but don't block the submission.
        console.error("Email send failed:", mailErr);
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "ok",
        reference_id: refId,
        folder: folder.getUrl(),
        version: APP_SCRIPT_VERSION,
        hsc_mpc_pct_received: payload.hsc_mpc_pct || "",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/* ────────────  SHEET LAYOUT  ────────────
   Edit HEADER_ROW or COLUMN_TO_FIELD if you want different
   columns / order. Field names match the form's `name=""`. */
const HEADER_ROW = [
  "Reference ID",
  "Submitted At",
  "Folder Link",
  "Pref: Data Science",
  "Pref: CSE",
  "Pref: AI&ML",
  "Pref: CS&AM",
  "Pref: Networks",
  "Full Name",
  "Father's Name",
  "Mother's Name",
  "DOB",
  "Gender",
  "Category",
  "Religion",
  "Mother Tongue",
  "Nationality",
  "Aadhaar Number",
  "Blood Group",
  "Email",
  "Mobile",
  "Address",
  "City",
  "State",
  "PIN",
  "Country",
  "Parent Name",
  "Parent Relation",
  "Parent Mobile",
  "Parent Email",
  "Parent Occupation",
  "Family Income",
  "Local Guardian",
  "SSC School",
  "SSC Board",
  "SSC Year",
  "SSC %",
  "HSC School",
  "HSC Board",
  "HSC Year",
  "HSC %",
  "HSC Math",
  "HSC Physics",
  "HSC Chemistry",
  "MPC Group %",
  "JEE Percentile",
  "JEE Roll",
  "EAPCET Rank",
  "EAPCET Hall",
  "Payment Amount",
  "Payment Method",
  "Payment Reference",
  "Payment Receipt",
  "Declaration",
  "Photo",
  "Signature (Upload)",
  "Digital Signature",
  "JEE Rank Card",
  "EAPCET Rank Card",
  "SSC Memo",
  "HSC Memo",
  "Aadhaar (Upload)",
];

const COLUMN_TO_FIELD = {
  "Pref: Data Science": "pref_ds",
  "Pref: CSE": "pref_cse",
  "Pref: AI&ML": "pref_aiml",
  "Pref: CS&AM": "pref_csam",
  "Pref: Networks": "pref_net",
  "Full Name": "full_name",
  "Father's Name": "father_name",
  "Mother's Name": "mother_name",
  DOB: "dob",
  Gender: "gender",
  Category: "category",
  Religion: "religion",
  "Mother Tongue": "mother_tongue",
  Nationality: "nationality",
  "Aadhaar Number": "aadhaar",
  "Blood Group": "blood_group",
  Email: "email",
  Mobile: "mobile",
  Address: "address",
  City: "city",
  State: "state",
  PIN: "pin",
  Country: "country",
  "Parent Name": "parent_name",
  "Parent Relation": "parent_relation",
  "Parent Mobile": "parent_mobile",
  "Parent Email": "parent_email",
  "Parent Occupation": "parent_occupation",
  "Family Income": "family_income",
  "Local Guardian": "local_guardian",
  "SSC School": "ssc_school",
  "SSC Board": "ssc_board",
  "SSC Year": "ssc_year",
  "SSC %": "ssc_pct",
  "HSC School": "hsc_school",
  "HSC Board": "hsc_board",
  "HSC Year": "hsc_year",
  "HSC %": "hsc_pct",
  "HSC Math": "hsc_math",
  "HSC Physics": "hsc_physics",
  "HSC Chemistry": "hsc_chemistry",
  "MPC Group %": "hsc_mpc_pct",
  "JEE Percentile": "jee_percentile",
  "JEE Roll": "jee_roll",
  "EAPCET Rank": "eapcet_rank",
  "EAPCET Hall": "eapcet_hall",
  "Payment Amount": "payment_amount",
  "Payment Method": "payment_mode",
  "Payment Reference": "payment_reference",
  Declaration: "declaration",
};

/** Columns inserted into older sheets when missing (order matters). */
const HEADER_INSERTIONS = [{ label: "MPC Group %", after: "HSC Chemistry" }];

/** Ensure row 1 matches HEADER_ROW and insert any missing academic columns. */
function syncHeaderRow_(sheet) {
  const width = HEADER_ROW.length;
  let lastCol = Math.max(sheet.getLastColumn(), 1);

  if (sheet.getLastRow() < 1) {
    sheet.insertRowBefore(1);
  }

  let existing = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) {
      return String(v || "").trim();
    });

  HEADER_INSERTIONS.forEach(function (item) {
    if (existing.indexOf(item.label) !== -1) return;
    const anchorIdx = existing.indexOf(item.after);
    if (anchorIdx === -1) return;
    sheet.insertColumnAfter(anchorIdx + 1);
    existing.splice(anchorIdx + 1, 0, item.label);
    lastCol = sheet.getLastColumn();
  });

  if (sheet.getMaxColumns() < width) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      width - sheet.getMaxColumns(),
    );
  }

  sheet.getRange(1, 1, 1, width).setValues([HEADER_ROW]);
  sheet.setFrozenRows(1);
  sheet
    .getRange(1, 1, 1, width)
    .setFontWeight("bold")
    .setBackground("#1a3a6b")
    .setFontColor("#ffffff");
}

/** Get a tab by name (create it if missing), sync its header row, and
    normalize any legacy duplicate "Aadhaar" headers. */
function getOrCreateSheet_(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  syncHeaderRow_(sheet);

  // Legacy sheets used duplicate "Aadhaar" headers (number + upload).
  // Normalize labels so the sheet stays readable going forward.
  try {
    const headerRange = sheet.getRange(1, 1, 1, HEADER_ROW.length);
    const headerValues = headerRange.getValues()[0];
    const aadhaarIdx = [];
    headerValues.forEach(function (v, idx) {
      if (String(v).trim() === "Aadhaar") aadhaarIdx.push(idx);
    });
    if (aadhaarIdx.length >= 2) {
      headerValues[aadhaarIdx[0]] = "Aadhaar Number";
      headerValues[aadhaarIdx[1]] = "Aadhaar (Upload)";
      headerRange.setValues([headerValues]);
    }
  } catch (hdrErr) {
    console.error("Header normalize failed:", hdrErr);
  }
  return sheet;
}

/** Extract a numeric MPC % from arbitrary user input.
    Accepts "85", "85%", "85.50", "  85.5 % ", etc. Returns null when no
    parseable number is present so we don't accidentally shortlist blanks. */
function parseMpcPct_(val) {
  if (val == null) return null;
  const s = String(val).replace(/,/g, "").trim();
  if (!s) return null;
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

/* ────────────  EMAIL TEMPLATE  ──────────── */
function buildEmailHtml(p, refId, folderUrl) {
  const safe = (s) => (s == null ? "" : String(s));
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
    <div style="background:#1a3a6b;color:#fff;padding:1.25rem;border-radius:8px 8px 0 0;">
      <h2 style="margin:0;font-size:20px;">CR Rao AIMSCS — B.Tech 2026-27</h2>
      <p style="margin:0.4rem 0 0;font-size:13px;opacity:.85;">Application received successfully</p>
    </div>
    <div style="padding:1.25rem;background:#f8f9fc;border:1px solid #e8eaf0;border-top:none;border-radius:0 0 8px 8px;">
      <p>Hello ${safe(p.full_name) || "Applicant"},</p>
      <p>Thank you for applying to the 4-Year B.Tech program at CR Rao AIMSCS. Your application has been received and will be reviewed by our admissions cell within 24 working hours.</p>
      <p style="background:#0d1b2a;color:#fff;padding:0.65rem 1rem;border-radius:6px;font-family:'Courier New',monospace;letter-spacing:2px;font-weight:bold;display:inline-block;">
        Reference ID: ${refId}
      </p>
      <p style="font-size:14px;">Please save this reference ID — you'll need it for any future communication.</p>
      <p style="margin-top:1rem;font-size:14px;">If you face any technical issue, please email
        <a href="mailto:${ADMIN_NOTIFY_EMAIL}" style="color:#e8740c;">${ADMIN_NOTIFY_EMAIL}</a>
        or call <strong>+91&nbsp;7331&nbsp;155&nbsp;319</strong>.
      </p>
      <p style="margin-top:1.5rem;font-size:12px;color:#6b7280;">
        Regards,<br>Admissions Office<br>
        CR Rao AIMSCS — University of Hyderabad Campus<br>
        Hyderabad, Telangana – 500046
      </p>
    </div>
  </div>`;
}
