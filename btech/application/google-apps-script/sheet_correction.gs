/* ============================================================
   MAIN SHEET — Missing Application PDF backfill
   Tab: SHEET_NAME (CRR-btech-applications-2026-27)

   For each row where "Application PDF" is empty:
     • Build application PDF (HTML → PDF, same sections as application-download.js)
     • Upload to that row's Folder Link Drive folder
     • Write the Drive URL into Application PDF

   Trigger:
     • index.php → "Generate Missing PDFs" button (batched web GET)
     • Apps Script editor → runSheetCorrectionFromEditor()

   Remove this file + index.php button after backfill is complete.
   ============================================================ */

const SHEET_CORRECTION_KEY = "crrao-sheet-pdf-correction-2026";
const SHEET_CORRECTION_WEB_BATCH = 3;
const SHEET_CORRECTION_EDITOR_BATCH = 20;

/** Web app GET — ?action=sheetCorrection&key=…&startRow=2&limit=3 */
function handleSheetCorrectionRequest_(e) {
  if ((e.parameter.key || "") !== SHEET_CORRECTION_KEY) {
    return jsonOut_({ status: "error", message: "Unauthorized" });
  }
  try {
    const result = runSheetCorrection_({
      startRow: Math.max(2, parseInt(e.parameter.startRow, 10) || 2),
      limit: Math.max(
        1,
        Math.min(
          10,
          parseInt(e.parameter.limit, 10) || SHEET_CORRECTION_WEB_BATCH,
        ),
      ),
    });
    return jsonOut_(result);
  } catch (err) {
    return jsonOut_({ status: "error", message: String(err) });
  }
}

/** Run from Apps Script editor until log shows nextStartRow: null. */
function runSheetCorrectionFromEditor() {
  const props = PropertiesService.getScriptProperties();
  const startRow = Math.max(
    2,
    parseInt(props.getProperty("sheetPdfNextRow") || "2", 10),
  );
  const result = runSheetCorrection_({
    startRow: startRow,
    limit: SHEET_CORRECTION_EDITOR_BATCH,
  });
  if (result.nextStartRow) {
    props.setProperty("sheetPdfNextRow", String(result.nextStartRow));
  } else {
    props.deleteProperty("sheetPdfNextRow");
  }
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function runSheetCorrection_(opts) {
  const startRow = opts.startRow || 2;
  const limit = opts.limit || SHEET_CORRECTION_WEB_BATCH;

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Tab not found: "' + SHEET_NAME + '"');
  }

  const headerInfo = readSheetHeaders_(sheet);
  const pdfCol = headerInfo.indexByName["Application PDF"];
  if (!pdfCol) {
    throw new Error(
      'Column "Application PDF" not found on tab "' + SHEET_NAME + '".',
    );
  }

  const folderCol = headerInfo.indexByName["Folder Link"];
  const refCol = headerInfo.indexByName["Reference ID"];
  if (!folderCol || !refCol) {
    throw new Error('Required columns "Folder Link" or "Reference ID" missing.');
  }

  const lastRow = sheet.getLastRow();
  const dataWidth = sheet.getLastColumn();
  let processed = 0;
  let skipped = 0;
  const errors = [];
  let rowNum = startRow;
  let nextStartRow = null;

  while (rowNum <= lastRow && processed < limit) {
    const rowValues = sheet.getRange(rowNum, 1, rowNum, dataWidth).getValues()[0];
    const refId = String(rowValues[refCol - 1] || "").trim();
    const existingPdf = String(rowValues[pdfCol - 1] || "").trim();

    if (!refId) {
      rowNum++;
      continue;
    }

    if (existingPdf && /^https?:\/\//i.test(existingPdf)) {
      skipped++;
      rowNum++;
      continue;
    }

    try {
      const record = rowValuesToRecord_(headerInfo.headers, rowValues);
      const folderLink = String(record["Folder Link"] || "").trim();
      if (!folderLink) {
        throw new Error("Missing Folder Link");
      }
      const folder = getFolderFromUrl_(folderLink);
      const pdfUrl = generateUploadApplicationPdf_(record, folder);
      sheet.getRange(rowNum, pdfCol).setValue(pdfUrl);
      processed++;
    } catch (err) {
      errors.push({ row: rowNum, ref: refId, message: String(err) });
    }

    rowNum++;
  }

  if (rowNum <= lastRow) {
    nextStartRow = rowNum;
  }

  return {
    status: "ok",
    sheet: SHEET_NAME,
    startRow: startRow,
    processed: processed,
    skipped: skipped,
    errors: errors,
    nextStartRow: nextStartRow,
    totalRows: lastRow,
  };
}

/* ── Sheet helpers ── */

function readSheetHeaders_(sheet) {
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (h) {
    return String(h || "").trim();
  });
  const indexByName = {};
  headers.forEach(function (h, i) {
    if (h) indexByName[h] = i + 1;
  });
  return { headers: headers, indexByName: indexByName, width: width };
}

function rowValuesToRecord_(headers, rowValues) {
  const record = {};
  headers.forEach(function (h, i) {
    if (!h) return;
    record[h] = rowValues[i] != null ? String(rowValues[i]) : "";
  });
  return record;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/* ── Drive helpers ── */

function extractDriveFileId_(url) {
  if (!url) return "";
  const s = String(url);
  let m = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : "";
}

function extractDriveFolderId_(url) {
  if (!url) return "";
  const s = String(url);
  let m = s.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : "";
}

function getFolderFromUrl_(url) {
  const id = extractDriveFolderId_(url);
  if (!id) throw new Error("Could not parse folder ID from: " + url);
  return DriveApp.getFolderById(id);
}

function driveImageEmbedUrl_(url) {
  const id = extractDriveFileId_(url);
  if (!id) return "";
  try {
    const blob = DriveApp.getFileById(id).getBlob();
    const mime = blob.getContentType() || "image/jpeg";
    if (mime.indexOf("image/") !== 0) return "";
    return "data:" + mime + ";base64," + Utilities.base64Encode(blob.getBytes());
  } catch (e) {
    return "";
  }
}

function uploadPdfToFolder_(folder, blob, filename) {
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

/* ── PDF generation (HTML → PDF, mirrors application-download.js sections) ── */

function generateUploadApplicationPdf_(record, folder) {
  const refId = String(record["Reference ID"] || "Application").trim();
  const name = String(record["Full Name"] || "Applicant").trim();
  const safeName = name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "Applicant";
  const filename = "CRRao-BTech-Application-2026-" + safeName + ".pdf";

  const photoUrl =
    driveImageEmbedUrl_(record["Photo"]) ||
    driveImageEmbedUrl_(record["Signature (Upload)"]);
  const sigUrl =
    driveImageEmbedUrl_(record["Digital Signature"]) ||
    driveImageEmbedUrl_(record["Signature (Upload)"]);

  const html = buildApplicationPdfHtml_(record, refId, photoUrl, sigUrl);
  const blob = HtmlService.createHtmlOutput(html)
    .getAs("application/pdf")
    .setName(filename);

  return uploadPdfToFolder_(folder, blob, filename);
}

function esc_(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function show_(v) {
  const s = String(v == null ? "" : v).trim();
  return s ? esc_(s) : "—";
}

function docStatus_(link) {
  const s = String(link || "").trim();
  return s && /^https?:\/\//i.test(s) ? "Uploaded" : "Not uploaded";
}

function buildSectionTable_(title, rows) {
  let body = "";
  rows.forEach(function (pair) {
    body +=
      "<tr><th>" +
      esc_(pair[0]) +
      "</th><td>" +
      show_(pair[1]) +
      "</td></tr>";
  });
  return (
    '<div class="section"><h2>' +
    esc_(title) +
    '</h2><table class="grid">' +
    body +
    "</table></div>"
  );
}

function buildApplicationPdfHtml_(record, refId, photoDataUri, sigDataUri) {
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const sections = [
    buildSectionTable_("1. Program Preferences (Rank 1 = most preferred)", [
      ["Data Science", record["Pref: Data Science"]],
      ["Computer Science & Engineering", record["Pref: CSE"]],
      ["CSE (AI & Machine Learning)", record["Pref: AI&ML"]],
      ["Computer Science & Applied Mathematics", record["Pref: CS&AM"]],
      ["CSE (Networks)", record["Pref: Networks"]],
    ]),
    buildSectionTable_("2. Personal Details", [
      ["Full Name (as per SSC)", record["Full Name"]],
      ["Father's Name", record["Father's Name"]],
      ["Mother's Name", record["Mother's Name"]],
      ["Date of Birth", record["DOB"]],
      ["Gender", record["Gender"]],
      ["Category", record["Category"]],
      ["Religion", record["Religion"]],
      ["Mother Tongue", record["Mother Tongue"]],
      ["Nationality", record["Nationality"]],
      ["Aadhaar Number", record["Aadhaar Number"]],
      ["Blood Group", record["Blood Group"]],
    ]),
    buildSectionTable_("3. Contact & Address", [
      ["Email", record["Email"]],
      ["Mobile", record["Mobile"]],
      ["Permanent Address", record["Address"]],
      ["City / Town", record["City"]],
      ["State", record["State"]],
      ["PIN Code", record["PIN"]],
      ["Country", record["Country"]],
    ]),
    buildSectionTable_("4. Parent / Guardian Details", [
      ["Parent / Guardian Name", record["Parent Name"]],
      ["Relationship", record["Parent Relation"]],
      ["Parent Mobile", record["Parent Mobile"]],
      ["Parent Email", record["Parent Email"]],
      ["Occupation", record["Parent Occupation"]],
      ["Annual Family Income (Rs.)", record["Family Income"]],
      ["Local Guardian (if any)", record["Local Guardian"]],
    ]),
    buildSectionTable_("5. Academic Record — Class 10 / SSC", [
      ["School / Institution", record["SSC School"]],
      ["Board", record["SSC Board"]],
      ["Year of Passing", record["SSC Year"]],
      ["Percentage / GPA", record["SSC %"]],
    ]),
    buildSectionTable_("6. Academic Record — Class 12 / Intermediate", [
      ["College / School", record["HSC School"]],
      ["Board", record["HSC Board"]],
      ["Year of Passing", record["HSC Year"]],
      ["Overall Percentage / GPA", record["HSC %"]],
      ["Mathematics Marks / %", record["HSC Math"]],
      ["Physics Marks / %", record["HSC Physics"]],
      ["Chemistry Marks / %", record["HSC Chemistry"]],
      ["MPC Group Percentage (%)", record["MPC Group %"]],
    ]),
    buildSectionTable_("7. Entrance Examination Details", [
      ["JEE Main 2026 Percentile", record["JEE Percentile"]],
      ["JEE Application / Roll No.", record["JEE Roll"]],
      ["TS EAPCET 2026 Rank", record["EAPCET Rank"]],
      ["TS EAPCET Hall Ticket No.", record["EAPCET Hall"]],
    ]),
    buildSectionTable_("8. Documents Uploaded", [
      ["Passport Size Photo", docStatus_(record["Photo"])],
      ["Signature", docStatus_(record["Signature (Upload)"]) || docStatus_(record["Digital Signature"])],
      ["JEE Main 2026 Rank Card", docStatus_(record["JEE Rank Card"])],
      ["TS EAPCET 2026 Rank Card", docStatus_(record["EAPCET Rank Card"])],
      ["Class 10 / SSC Certificate", docStatus_(record["SSC Memo"])],
      ["Class 12 / HSC Certificate", docStatus_(record["HSC Memo"])],
      ["Aadhaar Card", docStatus_(record["Aadhaar (Upload)"])],
      ["Application Fee Receipt", docStatus_(record["Payment Receipt"])],
    ]),
  ].join("");

  const photoBlock = photoDataUri
    ? '<img class="photo" src="' + photoDataUri + '" alt="Photo" />'
    : "";
  const sigBlock = sigDataUri
    ? '<img class="signature" src="' + sigDataUri + '" alt="Signature" />'
    : '<span class="sig-missing">Signature not captured</span>';

  return (
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\" />" +
    "<style>" +
    "body{font-family:Arial,sans-serif;font-size:11px;color:#111827;margin:24px;line-height:1.45;}" +
    ".header{border-bottom:2px solid #1a3a6b;padding-bottom:10px;margin-bottom:14px;}" +
    ".org{font-size:13px;font-weight:bold;color:#1a3a6b;margin:0;}" +
    ".sub{font-size:10px;color:#6b7280;margin:4px 0 0;}" +
    ".title{font-size:16px;font-weight:bold;color:#1a3a6b;margin:10px 0 0;}" +
    ".meta{margin:12px 0;padding:10px;background:#f1f5f9;border:1px solid #cbd5e1;}" +
    ".meta td{padding:3px 8px 3px 0;vertical-align:top;}" +
    ".meta th{text-align:left;color:#6b7280;font-weight:600;padding-right:12px;white-space:nowrap;}" +
    ".layout{display:flex;gap:16px;align-items:flex-start;}" +
    ".photo{width:88px;height:110px;object-fit:cover;border:1px solid #cbd5e1;}" +
    ".section{margin-top:14px;page-break-inside:avoid;}" +
    ".section h2{font-size:12px;color:#1a3a6b;margin:0 0 6px;border-bottom:1px solid #cbd5e1;padding-bottom:4px;}" +
    "table.grid{width:100%;border-collapse:collapse;}" +
    "table.grid th,table.grid td{border:1px solid #cbd5e1;padding:5px 7px;text-align:left;vertical-align:top;}" +
    "table.grid th{width:42%;background:#f1f5f9;color:#374151;font-weight:600;}" +
    ".declaration{margin-top:16px;padding:10px;border:1px solid #cbd5e1;background:#fafafa;}" +
    ".signature{max-width:180px;max-height:60px;}" +
    ".sig-missing{font-style:italic;color:#6b7280;font-size:10px;}" +
    ".footer{margin-top:20px;font-size:9px;color:#6b7280;text-align:center;}" +
    "</style></head><body>" +
    '<div class="header">' +
    '<p class="org">CR Rao Advanced Institute of Mathematics, Statistics and Computer Science</p>' +
    '<p class="sub">University of Hyderabad Campus, Hyderabad – 500 046</p>' +
    '<p class="title">B.Tech Online Application 2026-27</p>' +
    "</div>" +
    '<div class="layout">' +
    "<div>" +
    '<table class="meta">' +
    "<tr><th>Reference ID</th><td>" + show_(refId) + "</td></tr>" +
    "<tr><th>Applicant</th><td>" + show_(record["Full Name"]) + "</td></tr>" +
    "<tr><th>Status</th><td>Submitted copy (sheet correction backfill)</td></tr>" +
    "<tr><th>Generated</th><td>" + esc_(generatedAt) + "</td></tr>" +
    "</table></div>" +
    photoBlock +
    "</div>" +
    sections +
    '<div class="declaration">' +
    "<p><strong>Declaration:</strong> I hereby declare that the information furnished in this application is true to the best of my knowledge and belief.</p>" +
    "<p><strong>Signature:</strong></p>" +
    sigBlock +
    "</div>" +
    '<p class="footer">CR Rao AIMSCS — B.Tech Admissions 2026-27</p>' +
    "</body></html>"
  );
}
