/**
 * B.Tech 2026-27 — Application Download (student & office copy).
 *
 * Generates a multi-page A4 PDF directly with jsPDF (no DOM capture).
 * Output is sharp, selectable, free of overflow/alignment issues and is
 * usable both for the student's records and for our admissions office.
 *
 * Triggers:
 *   - #downloadApplicationBtn         (Step 9, before declaration)
 *   - #downloadApplicationSuccessBtn  (Success step, after submission)
 *
 * Dependency: html2pdf.bundle.min.js (already loaded on the page) ships
 * jsPDF at window.jspdf.jsPDF.
 */
(function () {
  "use strict";

  /* ---------- design tokens (mm + hex) ---------- */
  const PRIMARY = "#1a3a6b";
  const TEXT = "#111827";
  const MUTED = "#6b7280";
  const BORDER = "#cbd5e1";
  const LABEL_BG = "#f1f5f9";
  const WHITE = "#ffffff";

  const PAGE = { w: 210, h: 297 };
  const MARGIN = { top: 16, right: 14, bottom: 16, left: 14 };
  const CONTENT_W = PAGE.w - MARGIN.left - MARGIN.right;
  const COL_LABEL_W = 92;
  const COL_VALUE_W = CONTENT_W - COL_LABEL_W;
  const HEADER_HEIGHT = 22;
  const FOOTER_RESERVE = 12;
  const Y_LIMIT = PAGE.h - MARGIN.bottom - FOOTER_RESERVE;

  /* ---------- DOM hooks ---------- */
  const SNAPSHOT_KEY = "crrao-application-submit";
  const form = document.getElementById("applyForm");
  const downloadBtn = document.getElementById("downloadApplicationBtn");
  const successDownloadBtn = document.getElementById(
    "downloadApplicationSuccessBtn",
  );

  let snapshotSource = null;
  try {
    snapshotSource = JSON.parse(
      sessionStorage.getItem(SNAPSHOT_KEY) || "null",
    );
  } catch (e) {
    snapshotSource = null;
  }

  const hasForm = !!form;
  const hasSnapshot = !!snapshotSource;
  if (!hasForm && !hasSnapshot) return;
  if (hasForm && !downloadBtn && !successDownloadBtn && !hasSnapshot) return;
  if (!hasForm && hasSnapshot && !successDownloadBtn) return;

  /* ---------- form readers ---------- */
  function getField(name) {
    if (snapshotSource?.fields && name in snapshotSource.fields) {
      return String(snapshotSource.fields[name] ?? "").trim();
    }
    if (!form) return "";
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return "";
    if (el.type === "radio") {
      return form.querySelector(`[name="${name}"]:checked`)?.value || "";
    }
    if (el.type === "checkbox") return el.checked ? "Yes" : "No";
    return (el.value || "").trim();
  }

  function show(v) {
    const s = String(v ?? "").trim();
    return s ? s : "—";
  }

  function fileNameOf(name) {
    if (snapshotSource?.fileNames?.[name]) {
      return snapshotSource.fileNames[name];
    }
    if (!form) return "Not uploaded";
    const f = form.querySelector(`[name="${name}"]`)?.files?.[0];
    return f ? f.name : "Not uploaded";
  }

  function readImageAsDataUrl(inputName) {
    if (snapshotSource?.images?.[inputName]) {
      return Promise.resolve(snapshotSource.images[inputName]);
    }
    if (!form) return Promise.resolve(null);
    return new Promise((resolve) => {
      const f = form.querySelector(`[name="${inputName}"]`)?.files?.[0];
      if (!f || !f.type.startsWith("image/")) return resolve(null);
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(f);
    });
  }

  /** Load a data URL into an Image to read its natural pixel size. Resolves
      to { w, h } or null. Used to preserve aspect ratio in the PDF. */
  function getImageNaturalSize(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl) return resolve(null);
      const img = new Image();
      img.onload = () =>
        resolve({
          w: img.naturalWidth || img.width || 0,
          h: img.naturalHeight || img.height || 0,
        });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  }

  /** Returns { dataUrl, w, h } or null. The natural pixel size is used
      later to embed the signature without horizontal/vertical stretching. */
  async function getSignatureDataUrl() {
    if (snapshotSource?.signature?.dataUrl) {
      const size = await getImageNaturalSize(snapshotSource.signature.dataUrl);
      return {
        dataUrl: snapshotSource.signature.dataUrl,
        w: size?.w || 0,
        h: size?.h || 0,
      };
    }
    if (!form) return null;
    /* 1) Prefer the hidden field populated by the signature pad on each stroke. */
    const hidden = document.getElementById("signature_data");
    if (hidden?.value?.startsWith("data:")) {
      const size = await getImageNaturalSize(hidden.value);
      return { dataUrl: hidden.value, w: size?.w || 0, h: size?.h || 0 };
    }

    /* 2) Fall back to reading the canvas directly — but only if it isn't blank. */
    const canvas = document.getElementById("sigCanvas");
    if (canvas) {
      try {
        const blank = document.createElement("canvas");
        blank.width = canvas.width;
        blank.height = canvas.height;
        if (canvas.toDataURL() !== blank.toDataURL()) {
          return {
            dataUrl: canvas.toDataURL("image/png"),
            w: canvas.width,
            h: canvas.height,
          };
        }
      } catch (e) {
        /* fall through to upload fallback */
      }
    }

    /* 3) Final fallback: a scanned signature uploaded in Step 8. */
    const upload = await readImageAsDataUrl("upload_signature");
    if (!upload) return null;
    const size = await getImageNaturalSize(upload);
    return { dataUrl: upload, w: size?.w || 0, h: size?.h || 0 };
  }

  function safeFilename(name) {
    return (
      (name || "Applicant")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 40) || "Applicant"
    );
  }

  /* ---------- data shape ---------- */
  async function collectData(referenceId, statusLabel) {
    const photo = await readImageAsDataUrl("upload_photo");
    const signature = await getSignatureDataUrl();

    return {
      meta: {
        org: "CR Rao Advanced Institute of Mathematics, Statistics and Computer Science",
        sub: "University of Hyderabad Campus, Hyderabad – 500 046",
        title: "B.Tech Online Application 2026-27",
        referenceId: referenceId || "Draft (not yet submitted)",
        status: statusLabel || "Draft copy (before submission)",
        generatedAt: new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        applicantName: show(getField("full_name")),
      },
      sections: [
        {
          title: "1. Program Preferences (Rank 1 = most preferred)",
          rows: [
            ["Data Science", getField("pref_ds")],
            ["Computer Science & Engineering", getField("pref_cse")],
            ["CSE (AI & Machine Learning)", getField("pref_aiml")],
            ["Computer Science & Applied Mathematics", getField("pref_csam")],
            ["CSE (Networks)", getField("pref_net")],
          ],
        },
        {
          title: "2. Personal Details",
          rows: [
            ["Full Name (as per SSC)", getField("full_name")],
            ["Father's Name", getField("father_name")],
            ["Mother's Name", getField("mother_name")],
            ["Date of Birth", getField("dob")],
            ["Gender", getField("gender")],
            ["Category", getField("category")],
            ["Religion", getField("religion")],
            ["Mother Tongue", getField("mother_tongue")],
            ["Nationality", getField("nationality")],
            ["Aadhaar Number", getField("aadhaar")],
            ["Blood Group", getField("blood_group")],
          ],
        },
        {
          title: "3. Contact & Address",
          rows: [
            ["Email", getField("email")],
            ["Mobile", getField("mobile")],
            ["Permanent Address", getField("address")],
            ["City / Town", getField("city")],
            ["State", getField("state")],
            ["PIN Code", getField("pin")],
            ["Country", getField("country")],
          ],
        },
        {
          title: "4. Parent / Guardian Details",
          rows: [
            ["Parent / Guardian Name", getField("parent_name")],
            ["Relationship", getField("parent_relation")],
            ["Parent Mobile", getField("parent_mobile")],
            ["Parent Email", getField("parent_email")],
            ["Occupation", getField("parent_occupation")],
            ["Annual Family Income (Rs.)", getField("family_income")],
            ["Local Guardian (if any)", getField("local_guardian")],
          ],
        },
        {
          title: "5. Academic Record — Class 10 / SSC",
          rows: [
            ["School / Institution", getField("ssc_school")],
            ["Board", getField("ssc_board")],
            ["Year of Passing", getField("ssc_year")],
            ["Percentage / GPA", getField("ssc_pct")],
          ],
        },
        {
          title: "6. Academic Record — Class 12 / Intermediate",
          rows: [
            ["College / School", getField("hsc_school")],
            ["Board", getField("hsc_board")],
            ["Year of Passing", getField("hsc_year")],
            ["Overall Percentage / GPA", getField("hsc_pct")],
            ["Mathematics Marks / %", getField("hsc_math")],
            ["Physics Marks / %", getField("hsc_physics")],
            ["Chemistry Marks / %", getField("hsc_chemistry")],
            ["MPC Group Percentage (%)", getField("hsc_mpc_pct")],
          ],
        },
        {
          title: "7. Entrance Examination Details",
          rows: [
            ["JEE Main 2026 Percentile", getField("jee_percentile")],
            ["JEE Application / Roll No.", getField("jee_roll")],
            ["TS EAPCET 2026 Rank", getField("eapcet_rank")],
            ["TS EAPCET Hall Ticket No.", getField("eapcet_hall")],
          ],
        },
        {
          title: "8. Documents Uploaded",
          rows: [
            ["Passport Size Photo", fileNameOf("upload_photo")],
            ["Signature", fileNameOf("upload_signature")],
            ["JEE Main 2026 Rank Card", fileNameOf("upload_jee")],
            ["TS EAPCET 2026 Rank Card", fileNameOf("upload_ts-eapcet")],
            ["Class 10 / SSC Certificate", fileNameOf("upload_ssc")],
            ["Class 12 / HSC Certificate", fileNameOf("upload_hsc")],
            ["Aadhaar Card", fileNameOf("upload_aadhaar")],
            ["Application Fee Receipt", fileNameOf("upload_payment_receipt")],
          ],
        },
      ],
      images: { photo, signature },
    };
  }

  /* ---------- jsPDF helpers ---------- */
  function getJsPDFConstructor() {
    return window.jspdf?.jsPDF || window.jsPDF || null;
  }

  /* Wait briefly in case the deferred jsPDF script is still loading. */
  function waitForJsPDF(timeoutMs = 4000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        const ctor = getJsPDFConstructor();
        if (ctor) return resolve(ctor);
        if (Date.now() - start > timeoutMs) return resolve(null);
        setTimeout(tick, 100);
      };
      tick();
    });
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }
  const setFill = (doc, hex) => doc.setFillColor(...hexToRgb(hex));
  const setText = (doc, hex) => doc.setTextColor(...hexToRgb(hex));
  const setDraw = (doc, hex) => doc.setDrawColor(...hexToRgb(hex));

  /* ---------- chrome (header, footer) ---------- */
  function drawHeader(doc, meta) {
    const x = MARGIN.left;
    const top = MARGIN.top;

    setText(doc, PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    const orgLines = doc.splitTextToSize(meta.org, CONTENT_W - 36);
    doc.text(orgLines, x, top + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(doc, MUTED);
    doc.text(meta.sub, x, top + 4 + orgLines.length * 4 + 0.5);

    setText(doc, PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.text(meta.title, x, top + HEADER_HEIGHT - 6);

    setDraw(doc, PRIMARY);
    doc.setLineWidth(0.6);
    doc.line(
      x,
      top + HEADER_HEIGHT - 2,
      PAGE.w - MARGIN.right,
      top + HEADER_HEIGHT - 2,
    );

    return top + HEADER_HEIGHT + 2;
  }

  function drawFooter(doc, pageNum, totalPages) {
    const y = PAGE.h - MARGIN.bottom + 6;
    setDraw(doc, BORDER);
    doc.setLineWidth(0.2);
    doc.line(MARGIN.left, y - 5, PAGE.w - MARGIN.right, y - 5);

    setText(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Computer-generated copy — CR Rao AIMSCS B.Tech Admissions 2026-27",
      MARGIN.left,
      y - 1,
    );
    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE.w - MARGIN.right, y - 1, {
      align: "right",
    });
  }

  /* ---------- layout primitives ---------- */
  function newContext(doc, meta) {
    return { doc, meta, page: 1, y: drawHeader(doc, meta) };
  }

  function ensureSpace(ctx, needed) {
    if (ctx.y + needed > Y_LIMIT) {
      ctx.doc.addPage();
      ctx.page += 1;
      /* Subsequent pages skip the institute heading — start from the top margin. */
      ctx.y = MARGIN.top;
    }
  }

  function drawPhoto(ctx, dataUrl) {
    if (!dataUrl) return;
    const { doc } = ctx;
    const w = 28;
    const h = 34;
    const x = PAGE.w - MARGIN.right - w;
    const y = MARGIN.top - 2;
    setDraw(doc, BORDER);
    doc.setLineWidth(0.3);
    doc.rect(x - 0.5, y - 0.5, w + 1, h + 1, "S");
    const fmt = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
    try {
      doc.addImage(dataUrl, fmt, x, y, w, h, undefined, "FAST");
    } catch (e) {
      try {
        doc.addImage(
          dataUrl,
          fmt === "JPEG" ? "PNG" : "JPEG",
          x,
          y,
          w,
          h,
          undefined,
          "FAST",
        );
      } catch (e2) {
        /* ignore — photo is optional in PDF */
      }
    }
  }

  function drawMetaBox(ctx) {
    const { doc } = ctx;
    const rowH = 7;
    const halfW = CONTENT_W / 2;
    const lblW = 32;
    const valW = halfW - lblW;

    const cells = [
      [
        ["Reference ID", ctx.meta.referenceId],
        ["Status", ctx.meta.status],
      ],
      [["Generated on", ctx.meta.generatedAt], null],
    ];

    ensureSpace(ctx, rowH * cells.length + 4);

    cells.forEach((pair) => {
      pair.forEach((cell, i) => {
        const x = MARGIN.left + i * halfW;
        if (!cell) {
          setFill(doc, WHITE);
          setDraw(doc, BORDER);
          doc.setLineWidth(0.2);
          doc.rect(x, ctx.y, halfW, rowH, "FD");
          return;
        }
        const [lbl, val] = cell;
        setFill(doc, LABEL_BG);
        setDraw(doc, BORDER);
        doc.setLineWidth(0.2);
        doc.rect(x, ctx.y, lblW, rowH, "FD");
        setText(doc, TEXT);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(lbl, x + 2, ctx.y + 4.6);

        setFill(doc, WHITE);
        doc.rect(x + lblW, ctx.y, valW, rowH, "FD");
        doc.setFont("helvetica", "normal");
        const txt = doc.splitTextToSize(String(val || ""), valW - 4);
        doc.text(txt[0] || "", x + lblW + 2, ctx.y + 4.6);
      });
      ctx.y += rowH;
    });
    ctx.y += 4;
  }

  function drawSectionHeader(ctx, title) {
    ensureSpace(ctx, 12);
    const { doc } = ctx;
    setText(doc, PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(title, MARGIN.left, ctx.y + 4.5);
    setDraw(doc, PRIMARY);
    doc.setLineWidth(0.3);
    doc.line(MARGIN.left, ctx.y + 6.5, PAGE.w - MARGIN.right, ctx.y + 6.5);
    ctx.y += 9;
  }

  function drawRow(ctx, label, value) {
    const { doc } = ctx;
    doc.setFontSize(9.2);

    /* Labels render in BOLD — measure them in bold too so wrapping is exact. */
    doc.setFont("helvetica", "bold");
    const labelLines = doc.splitTextToSize(label, COL_LABEL_W - 4);
    doc.setFont("helvetica", "normal");
    const valueLines = doc.splitTextToSize(value, COL_VALUE_W - 4);

    const lineH = 4.4;
    const rowH = Math.max(labelLines.length, valueLines.length) * lineH + 3;

    ensureSpace(ctx, rowH);

    const y = ctx.y;
    setDraw(doc, BORDER);
    doc.setLineWidth(0.2);

    setFill(doc, LABEL_BG);
    doc.rect(MARGIN.left, y, COL_LABEL_W, rowH, "FD");
    setFill(doc, WHITE);
    doc.rect(MARGIN.left + COL_LABEL_W, y, COL_VALUE_W, rowH, "FD");

    setText(doc, TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(labelLines, MARGIN.left + 2, y + 4.8);
    doc.setFont("helvetica", "normal");
    doc.text(valueLines, MARGIN.left + COL_LABEL_W + 2, y + 4.8);

    ctx.y += rowH;
  }

  function drawSection(ctx, section) {
    drawSectionHeader(ctx, section.title);
    section.rows.forEach(([label, value]) => drawRow(ctx, label, show(value)));
    ctx.y += 3;
  }

  function drawDeclaration(ctx, signature) {
    drawSectionHeader(ctx, "9. Declaration");
    const { doc } = ctx;

    const text =
      "I hereby declare that the information furnished in this application is true to the best of my knowledge and belief. I understand that any false information may lead to cancellation of my admission. I agree to abide by the rules and regulations of CR Rao AIMSCS.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    const declH = lines.length * 4.4 + 4;
    const sigBoxH = 30;

    ensureSpace(ctx, declH + sigBoxH + 6);

    setText(doc, TEXT);
    doc.text(lines, MARGIN.left, ctx.y + 4);
    ctx.y += declH;

    const blockY = ctx.y + 2;
    const sigBoxW = 72;
    const sigX = PAGE.w - MARGIN.right - sigBoxW;

    setText(doc, MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Applicant Name", MARGIN.left, blockY + 4);
    setText(doc, TEXT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(ctx.meta.applicantName, MARGIN.left, blockY + 9.5);
    setDraw(doc, BORDER);
    doc.setLineWidth(0.2);
    doc.line(MARGIN.left, blockY + 11, MARGIN.left + 95, blockY + 11);

    setText(doc, MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Date", MARGIN.left, blockY + 17);
    setText(doc, TEXT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(ctx.meta.generatedAt, MARGIN.left, blockY + 22.5);

    setText(doc, MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Signature", sigX, blockY + 4);
    setDraw(doc, BORDER);
    doc.setLineWidth(0.2);
    doc.rect(sigX, blockY + 5.5, sigBoxW, sigBoxH - 2, "S");

    if (signature?.dataUrl) {
      /* Fit the signature inside the box while preserving its native aspect
         ratio so it doesn't get stretched horizontally or vertically.
         Center it within the available area. */
      const maxW = sigBoxW - 4;
      const maxH = sigBoxH - 5;
      let imgW = maxW;
      let imgH = maxH;
      if (signature.w > 0 && signature.h > 0) {
        const srcAspect = signature.w / signature.h;
        const boxAspect = maxW / maxH;
        if (srcAspect > boxAspect) {
          imgW = maxW;
          imgH = maxW / srcAspect;
        } else {
          imgH = maxH;
          imgW = maxH * srcAspect;
        }
      }
      const imgX = sigX + 2 + (maxW - imgW) / 2;
      const imgY = blockY + 7 + (maxH - imgH) / 2;

      /* Canvas drawings are PNG; uploaded scans may be JPG/JPEG. Detect
         from the data-URL prefix and retry with the alternate format if
         jsPDF rejects the first guess. */
      const sigFmt = signature.dataUrl.startsWith("data:image/png")
        ? "PNG"
        : "JPEG";
      try {
        doc.addImage(
          signature.dataUrl,
          sigFmt,
          imgX,
          imgY,
          imgW,
          imgH,
          undefined,
          "FAST",
        );
      } catch (e) {
        try {
          doc.addImage(
            signature.dataUrl,
            sigFmt === "PNG" ? "JPEG" : "PNG",
            imgX,
            imgY,
            imgW,
            imgH,
            undefined,
            "FAST",
          );
        } catch (e2) {
          /* signature is optional in PDF */
        }
      }
    } else {
      setText(doc, MUTED);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.text("Signature not captured", sigX + sigBoxW / 2, blockY + 16, {
        align: "center",
      });
    }

    ctx.y = blockY + sigBoxH + 6;
  }

  function paintAllFooters(doc) {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      drawFooter(doc, i, total);
    }
  }

  /* ---------- public flow ---------- */
  async function buildApplicationPdf(referenceId, statusLabel) {
    const JsPDFCtor = await waitForJsPDF();
    if (!JsPDFCtor) {
      throw new Error(
        "PDF engine is still loading. Please wait a moment and try again — your uploaded files will be preserved.",
      );
    }

    const data = await collectData(referenceId, statusLabel);

    const doc = new JsPDFCtor({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    doc.setProperties({
      title: "B.Tech Application 2026-27",
      subject: "CR Rao AIMSCS — B.Tech Admission Application",
      creator: "CR Rao AIMSCS",
      author: data.meta.applicantName,
    });

    const ctx = newContext(doc, data.meta);
    if (data.images.photo) drawPhoto(ctx, data.images.photo);
    drawMetaBox(ctx);
    data.sections.forEach((s) => drawSection(ctx, s));
    drawDeclaration(ctx, data.images.signature);
    paintAllFooters(doc);

    const filename = `CRRao-BTech-Application-2026-${safeFilename(
      getField("full_name"),
    )}.pdf`;
    return { doc, filename };
  }

  async function downloadPdf(referenceId, statusLabel, triggerBtn) {
    const originalText = triggerBtn?.innerHTML;
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.innerHTML = "Preparing PDF…";
    }

    try {
      const { doc, filename } = await buildApplicationPdf(
        referenceId,
        statusLabel,
      );
      doc.save(filename);
    } catch (err) {
      console.error("[application-download]", err);
      alert(
        err?.message ||
          "Could not generate the PDF. Please try again or contact admissions.",
      );
    } finally {
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = originalText;
      }
    }
  }

  /** Used by application.js on submit — returns base64 PDF for Drive upload. */
  window.CRRaoApplicationPdf = {
    async getBase64ForSubmit(referenceId) {
      const { doc, filename } = await buildApplicationPdf(
        referenceId,
        "Submitted copy",
      );
      const dataUri = doc.output("datauristring");
      return {
        name: filename,
        type: "application/pdf",
        data: dataUri.split(",")[1],
      };
    },
  };

  downloadBtn?.addEventListener("click", () => {
    downloadPdf("", "Draft copy (before submission)", downloadBtn);
  });

  successDownloadBtn?.addEventListener("click", () => {
    if (!hasForm && !hasSnapshot) {
      alert(
        "Your application PDF is available only in this browser session right after submission. " +
          "Please check your email for the confirmation copy, or contact admissions at btechadmissions.crr@gmail.com.",
      );
      return;
    }
    const ref =
      document.getElementById("refId")?.textContent?.trim() ||
      snapshotSource?.reference_id ||
      "Submitted application";
    downloadPdf(ref, "Submitted copy", successDownloadBtn);
  });
})();
