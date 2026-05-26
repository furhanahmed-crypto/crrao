/* ============================================================
   CR Rao AIMSCS — B.Tech 2026-27 Application Form
   Multi-step • localStorage autosave • signature pad • file uploads
   • Submits to a Google Apps Script web app endpoint that writes
     to a Google Sheet (and saves uploaded files to a Drive folder).
   ============================================================ */

"use strict";

(function () {
  /* ──────────────────────────────────────────────────────────
        CONFIGURATION
        Replace GOOGLE_SCRIPT_URL with the deployed Apps Script
        web-app URL. (See apps-script.gs for the backend code.)
        ────────────────────────────────────────────────────────── */
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwVcqYwAXj63-1WfgsnS7On7E4NCe76n91BBvSvBLEsnKMMasE-dNTJ3CN_YhfVqjl15g/exec";
  const STORAGE_KEY = "crrao-btech-application-2026";
  const TOTAL_STEPS = 9;

  const form = document.getElementById("applyForm");
  if (!form || form.dataset.applyInit === "1") return;
  form.dataset.applyInit = "1";

  /* ── Element refs ── */
  const steps = form.querySelectorAll(".apply-step");
  const stepList = document.getElementById("stepList");
  const progressBar = document.getElementById("progressBar");
  const reviewBox = document.getElementById("reviewSummary");
  const submitBtn = document.getElementById("submitBtn");
  const refIdEl = document.getElementById("refId");
  const successStep = document.getElementById("successStep");

  let currentStep = 1;

  /* Hook the signature pad's resize function so we can call it
        when step 9 becomes visible (canvas is 0×0 while hidden). */
  let resizeSignaturePad = () => {};

  /* ──────────────────────────────────────────────────────────
        STEP NAVIGATION
        ────────────────────────────────────────────────────────── */
  const STEP_NAMES = [
    "Pre-Application Checklist",
    "Course Preference",
    "Personal Details",
    "Contact & Address",
    "Parent / Guardian",
    "Academic Records",
    "Entrance Exams",
    "Document Uploads",
    "Review & Confirm",
  ];

  function showStep(n) {
    currentStep = n;
    steps.forEach((s) => s.classList.toggle("active", +s.dataset.step === n));

    if (stepList) {
      stepList.querySelectorAll("li").forEach((li) => {
        const num = +li.dataset.step;
        li.classList.toggle("active", num === n);
        li.classList.toggle("completed", num < n);
        li.style.setProperty("--step-num", `"${num}"`);
      });
    }

    const pct = Math.min(100, ((n - 1) / (TOTAL_STEPS - 1)) * 100);
    if (progressBar) progressBar.style.width = pct + "%";

    /* Mobile compact indicator */
    const simCurrent = document.getElementById("simCurrent");
    const simName = document.getElementById("simName");
    const simFill = document.getElementById("simBarFill");
    if (simCurrent) simCurrent.textContent = n;
    if (simName) simName.textContent = STEP_NAMES[n - 1] || "";
    if (simFill) simFill.style.width = pct + "%";

    /* Step 9 contains the signature pad — its canvas was hidden
          at script init (display:none), so its measured size was 0×0.
          Re-size now that it's visible, on the next paint. */
    if (n === 9)
      requestAnimationFrame(() => requestAnimationFrame(resizeSignaturePad));

    window.scrollTo({
      top: document.querySelector(".apply-shell").offsetTop - 80,
      behavior: "smooth",
    });
  }

  const ADMISSION_YEAR = 2026;

  function numInRange(val, min, max) {
    const n = parseFloat(val);
    return Number.isFinite(n) && n >= min && n <= max;
  }

  function yearInRange(val, min, max) {
    const y = parseInt(val, 10);
    return Number.isFinite(y) && y >= min && y <= max;
  }

  /** First number in text (e.g. "92%", "9.8 CGPA"); null if none. */
  function pctFromText(val) {
    const m = String(val)
      .replace(/,/g, "")
      .match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  }

  function isPercentOk(val, allowStatusText) {
    const t = val.trim();
    if (!t) return true;
    if (allowStatusText && /awaiting|pending|result/i.test(t)) return true;
    const n = pctFromText(t);
    if (n === null) return allowStatusText;
    return n >= 0 && n <= 100;
  }

  function validateStep(stepNum) {
    const stepEl = form.querySelector(`.apply-step[data-step="${stepNum}"]`);
    if (!stepEl) return true;

    let valid = true;

    /* Required text inputs / selects / textarea */
    stepEl
      .querySelectorAll("input[required], select[required], textarea[required]")
      .forEach((el) => {
        if (el.type === "file") {
          if (!el.files || !el.files.length) {
            markError(el, "Please upload a file.");
            valid = false;
          } else clearError(el);
          return;
        }
        if (el.type === "radio") {
          const group = stepEl.querySelectorAll(`input[name="${el.name}"]`);
          const checked = Array.from(group).some((r) => r.checked);
          if (!checked) {
            valid = false;
            markRadioGroupError(group);
          }
          return;
        }
        if (el.type === "checkbox") {
          if (!el.checked) {
            valid = false;
            markError(el, "Please confirm.");
          } else clearError(el);
          return;
        }
        const v = el.value.trim();
        if (!v) {
          markError(el, "This field is required.");
          valid = false;
          return;
        }

        if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          markError(el, "Enter a valid email.");
          valid = false;
          return;
        }
        if (el.type === "tel" && !/^[6-9]\d{9}$/.test(v.replace(/\s/g, ""))) {
          markError(el, "Enter a valid 10-digit Indian mobile.");
          valid = false;
          return;
        }
        if (el.id === "f-aadhaar") {
          const digits = v.replace(/\s/g, "");
          if (!/^\d{12}$/.test(digits)) {
            markError(el, "Enter a 12-digit Aadhaar.");
            valid = false;
            return;
          }
        }
        if (el.id === "f-pin") {
          if (!/^\d{6}$/.test(v)) {
            markError(el, "Enter a valid 6-digit PIN.");
            valid = false;
            return;
          }
        }
        if (el.name === "ssc_year") {
          if (!yearInRange(v, 2000, ADMISSION_YEAR)) {
            markError(
              el,
              `Enter a valid year between 2000 and ${ADMISSION_YEAR}.`,
            );
            valid = false;
            return;
          }
        }
        if (el.name === "hsc_year") {
          if (!yearInRange(v, 2020, ADMISSION_YEAR + 1)) {
            markError(
              el,
              `Enter a valid year between 2020 and ${ADMISSION_YEAR + 1}.`,
            );
            valid = false;
            return;
          }
          const sscY = parseInt(
            form.querySelector('[name="ssc_year"]')?.value,
            10,
          );
          if (Number.isFinite(sscY) && parseInt(v, 10) < sscY) {
            markError(el, "Class 12 year cannot be before Class 10 year.");
            valid = false;
            return;
          }
        }
        if (el.name === "ssc_pct") {
          if (!isPercentOk(v, false)) {
            markError(el, "Percentage must be between 0 and 100.");
            valid = false;
            return;
          }
        }
        if (el.name === "hsc_pct") {
          if (!isPercentOk(v, true)) {
            markError(el, "Enter 0–100%, or a status such as Awaiting Result.");
            valid = false;
            return;
          }
        }
        if (
          el.name === "hsc_math" ||
          el.name === "hsc_physics" ||
          el.name === "hsc_chemistry" ||
          el.name === "hsc_mpc_pct"
        ) {
          if (!numInRange(v, 0, 100)) {
            markError(el, "Enter a value between 0 and 100.");
            valid = false;
            return;
          }
        }
        clearError(el);
      });

    /* Step 2: ensure at least one preference is set with rank 1, and ranks are unique among selected */
    if (stepNum === 2) {
      const selects = Array.from(stepEl.querySelectorAll(".pref-select"));
      const picked = selects.map((s) => s.value).filter((v) => v && v !== "0");
      if (!selects.some((s) => s.value === "1")) {
        valid = false;
        alert("Please assign rank 1 to your most preferred program.");
      }
      const dup = picked.length !== new Set(picked).size;
      if (dup) {
        valid = false;
        alert("Each rank can be used only once across the five programs.");
      }
    }

    /* Step 7: at least one of JEE percentile or EAPCET rank required */
    if (stepNum === 7) {
      const jeeEl = stepEl.querySelector('[name="jee_percentile"]');
      const eapEl = stepEl.querySelector('[name="eapcet_rank"]');
      const jee = jeeEl?.value.trim() || "";
      const eap = eapEl?.value.trim() || "";
      if (!jee && !eap) {
        valid = false;
        alert(
          "Please enter at least one of JEE Main 2026 percentile or TS EAPCET 2026 rank.",
        );
      }
      if (jee && !numInRange(jee, 0, 100)) {
        markError(jeeEl, "Percentile must be between 0 and 100.");
        valid = false;
      } else if (jee) clearError(jeeEl);
      if (eap) {
        const rank = parseInt(eap, 10);
        if (!Number.isFinite(rank) || rank < 1) {
          markError(eapEl, "Enter a valid rank (1 or higher).");
          valid = false;
        } else clearError(eapEl);
      }
    }

    /* Step 8: at least one rank card file must be uploaded */
    if (stepNum === 8) {
      const rankInputs = ["upload_jee", "upload_ts-eapcet"];
      const hasRankCard = rankInputs.some((name) => {
        const el = form.querySelector(`[name="${name}"]`);
        return el && el.files && el.files.length > 0;
      });
      const errEl = document.getElementById("rankCardError");
      if (!hasRankCard) {
        valid = false;
        if (errEl) errEl.style.display = "block";
      } else {
        if (errEl) errEl.style.display = "none";
      }
    }

    /* Step 9: signature & declaration */
    if (stepNum === 9) {
      const decl = document.getElementById("declaration");
      if (!decl.checked) {
        valid = false;
        markError(decl, "Please accept the declaration.");
      }
      /* Accept either the canvas pad drawing OR a scanned signature uploaded in step 7 */
      const padData = document.getElementById("signature_data").value;
      const sigFile = form.querySelector('[name="upload_signature"]');
      const hasUploadedSig =
        sigFile && sigFile.files && sigFile.files.length > 0;
      if (!padData && !hasUploadedSig) {
        valid = false;
        alert(
          "Please sign in the signature box above (or upload a scanned signature in Step 7).",
        );
      }
    }

    return valid;
  }

  function markError(el, msg) {
    el.classList.add("error");
    let err = el.parentElement.querySelector(".form-error");
    if (!err) {
      err = document.createElement("span");
      err.className = "form-error";
      err.style.cssText =
        "font-size:0.75rem;color:#dc2626;margin-top:4px;display:block;";
      el.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }
  function clearError(el) {
    el.classList.remove("error");
    el.parentElement.querySelector(".form-error")?.remove();
  }
  function markRadioGroupError(group) {
    const parent = group[0]?.closest(".form-group");
    if (!parent) return;
    let err = parent.querySelector(".form-error");
    if (!err) {
      err = document.createElement("span");
      err.className = "form-error";
      err.style.cssText =
        "font-size:0.75rem;color:#dc2626;margin-top:4px;display:block;";
      parent.appendChild(err);
    }
    err.textContent = "Please make a selection.";
  }

  /* Next / Back — delegated; validate the step that owns the button */
  form.addEventListener("click", (e) => {
    const nextBtn = e.target.closest("[data-next]");
    if (nextBtn) {
      const stepSection = nextBtn.closest(".apply-step");
      const fromStep = stepSection
        ? parseInt(stepSection.dataset.step, 10)
        : currentStep;
      if (!Number.isFinite(fromStep)) return;
      if (!validateStep(fromStep)) return;
      if (fromStep === 8) buildReviewSummary();
      showStep(Math.min(TOTAL_STEPS, fromStep + 1));
      saveDraft();
      return;
    }

    const prevBtn = e.target.closest("[data-prev]");
    if (prevBtn && !prevBtn.disabled) {
      const stepSection = prevBtn.closest(".apply-step");
      const fromStep = stepSection
        ? parseInt(stepSection.dataset.step, 10)
        : currentStep;
      if (!Number.isFinite(fromStep)) return;
      showStep(Math.max(1, fromStep - 1));
    }
  });

  /* Click on rail to jump to completed step */
  stepList?.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
      const target = +li.dataset.step;
      if (target < currentStep) showStep(target);
    });
  });

  /* ──────────────────────────────────────────────────────────
        FILE UPLOAD UI
        ────────────────────────────────────────────────────────── */
  form.querySelectorAll('.file-upload input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => {
      const wrap = input.closest(".file-upload");
      const label = wrap.querySelector(".file-upload-label");
      const nameEl = wrap.querySelector(".file-upload-name");
      const file = input.files?.[0];
      if (!file) {
        label.classList.remove("has-file");
        if (nameEl) nameEl.textContent = "";
        return;
      }
      const MAX = 5 * 1024 * 1024;
      if (file.size > MAX) {
        alert(
          `File "${file.name}" is larger than 5 MB. Please compress and re-upload.`,
        );
        input.value = "";
        return;
      }
      label.classList.add("has-file");
      if (nameEl)
        nameEl.textContent =
          "✓ " + file.name + " (" + Math.round(file.size / 1024) + " KB)";
      clearError(input);
    });
  });

  /* ──────────────────────────────────────────────────────────
        AUTOSAVE (text fields only — file inputs cannot be restored)
        ────────────────────────────────────────────────────────── */
  function saveDraft() {
    try {
      const data = {};
      form.querySelectorAll("input, select, textarea").forEach((el) => {
        if (el.type === "file" || !el.name) return;
        if (el.type === "radio") {
          if (el.checked) data[el.name] = el.value;
          return;
        }
        if (el.type === "checkbox") {
          data[el.name] = el.checked;
          return;
        }
        data[el.name] = el.value;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* ignore quota errors */
    }
  }
  function restoreDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.keys(data).forEach((name) => {
        const els = form.querySelectorAll(`[name="${name}"]`);
        if (!els.length) return;
        if (els[0].type === "radio") {
          els.forEach((r) => {
            if (r.value === data[name]) r.checked = true;
          });
        } else if (els[0].type === "checkbox") {
          els[0].checked = !!data[name];
        } else {
          els[0].value = data[name];
        }
      });
    } catch (e) {}
  }
  restoreDraft();
  form.addEventListener("input", () => saveDraft());
  form.addEventListener("change", () => saveDraft());

  /* ──────────────────────────────────────────────────────────
        DEV SHORTCUT: Deep-link to a specific step
        Usage: apply.html?step=6  or  apply.html#step6
        (Does not change validation rules; it only changes the starting view.)
        ────────────────────────────────────────────────────────── */
  function getDeepLinkedStep() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("step");
      let n = raw ? parseInt(raw, 10) : NaN;

      if (!Number.isFinite(n)) {
        const h = (window.location.hash || "").trim();
        const m = h.match(/(?:^#|#.*)(?:step=?)(\d+)/i) || h.match(/#(\d+)/);
        if (m) n = parseInt(m[1], 10);
      }

      if (!Number.isFinite(n)) return null;
      if (n < 1 || n > TOTAL_STEPS) return null;
      return n;
    } catch (e) {
      return null;
    }
  }

  const deepStep = getDeepLinkedStep();
  if (deepStep && deepStep !== 1) showStep(deepStep);
  else if (stepList) {
    stepList.querySelectorAll("li").forEach((li) => {
      li.style.setProperty("--step-num", `"${li.dataset.step}"`);
    });
  }

  /* ──────────────────────────────────────────────────────────
        REVIEW SUMMARY (built before step 9 shown)
        ────────────────────────────────────────────────────────── */
  function buildReviewSummary() {
    const v = (name) => form.querySelector(`[name="${name}"]`)?.value || "—";
    const radioV = (name) =>
      form.querySelector(`[name="${name}"]:checked`)?.value || "—";

    const blocks = [
      {
        title: "Course Preference",
        step: 1,
        items: [
          ["Data Science", v("pref_ds")],
          ["CSE (Core)", v("pref_cse")],
          ["AI & ML", v("pref_aiml")],
          ["CS & AM", v("pref_csam")],
          ["Networks", v("pref_net")],
        ],
      },
      {
        title: "Personal Details",
        step: 2,
        items: [
          ["Full Name", v("full_name")],
          ["Father", v("father_name")],
          ["Mother", v("mother_name")],
          ["DOB", v("dob")],
          ["Gender", radioV("gender")],
          ["Category", v("category")],
          ["Religion", v("religion")],
          ["Aadhaar", v("aadhaar")],
          ["Nationality", v("nationality")],
        ],
      },
      {
        title: "Contact",
        step: 3,
        items: [
          ["Email", v("email")],
          ["Mobile", v("mobile")],
          ["Address", v("address")],
          ["City", v("city")],
          ["State", v("state")],
          ["PIN", v("pin")],
        ],
      },
      {
        title: "Parent / Guardian",
        step: 4,
        items: [
          ["Name", v("parent_name")],
          ["Relationship", v("parent_relation")],
          ["Mobile", v("parent_mobile")],
          ["Email", v("parent_email")],
          ["Occupation", v("parent_occupation")],
          ["Family Income", v("family_income")],
        ],
      },
      {
        title: "Academic Records",
        step: 5,
        items: [
          ["SSC School", v("ssc_school")],
          ["SSC Board / Year", v("ssc_board") + " / " + v("ssc_year")],
          ["SSC %", v("ssc_pct")],
          ["HSC School", v("hsc_school")],
          ["HSC Board / Year", v("hsc_board") + " / " + v("hsc_year")],
          ["HSC %", v("hsc_pct")],
          ["Maths Marks", v("hsc_math")],
          ["Physics Marks", v("hsc_physics")],
          ["Chemistry Marks", v("hsc_chemistry")],
          ["MPC Group %", v("hsc_mpc_pct")],
        ],
      },
      {
        title: "Entrance Exams",
        step: 6,
        items: [
          ["JEE Main Percentile", v("jee_percentile")],
          ["JEE Roll No.", v("jee_roll")],
          ["TS EAPCET Rank", v("eapcet_rank")],
          ["TS EAPCET Hall Ticket", v("eapcet_hall")],
        ],
      },
      {
        title: "Documents",
        step: 8,
        items: [
          ["photo", "Passport Size Photo"],
          ["signature", "Signature"],
          ["jee", "JEE Main 2026 Rank Card"],
          ["ts-eapcet", "TS EAPCET 2026 Rank Card"],
          ["ssc", "Class 10 Marksheet"],
          ["hsc", "Class 12 Marksheet"],
          ["aadhaar", "Aadhaar Card"],
          ["payment_receipt", "Fee Payment Receipt"],
        ].map(([k, label]) => {
          const f = form.querySelector(`[name="upload_${k}"]`)?.files?.[0];
          return [label, f ? "✓ " + f.name : "— not uploaded —"];
        }),
      },
    ];

    reviewBox.innerHTML = blocks
      .map(
        (b) => `
         <div class="review-block">
           <div class="review-block-head">
             <h4>${b.title}</h4>
             <button type="button" class="review-edit" data-jump="${b.step}">Edit</button>
           </div>
           <dl class="review-list">
             ${b.items.map(([k, val]) => `<dt>${k}</dt><dd>${escapeHtml(val || "—")}</dd>`).join("")}
           </dl>
         </div>
       `,
      )
      .join("");

    reviewBox.querySelectorAll("[data-jump]").forEach((b) => {
      b.addEventListener("click", () => showStep(+b.dataset.jump));
    });
  }
  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  /* ──────────────────────────────────────────────────────────
        SIGNATURE PAD (canvas)
        ────────────────────────────────────────────────────────── */
  const sigCanvas = document.getElementById("sigCanvas");
  const sigData = document.getElementById("signature_data");
  const sigClear = document.getElementById("sigClear");
  const sigStatus = document.getElementById("sigStatus");

  if (sigCanvas) {
    const ctx = sigCanvas.getContext("2d");
    let drawing = false,
      hasInk = false;
    let lastW = 0,
      lastH = 0;

    function applyCtxStyle() {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0d1b2a";
    }

    function doResize() {
      const ratio = window.devicePixelRatio || 1;
      const rect = sigCanvas.getBoundingClientRect();
      // If the canvas is hidden (display:none on parent), skip — we'll
      // re-call this when the step becomes visible.
      if (rect.width === 0 || rect.height === 0) return;

      const w = rect.width * ratio;
      const h = rect.height * ratio;
      if (w === lastW && h === lastH) {
        applyCtxStyle();
        return;
      }

      // Preserve any existing ink across the resize
      let png = null;
      if (lastW > 0 && lastH > 0) {
        try {
          png = sigCanvas.toDataURL("image/png");
        } catch (e) {}
      }

      sigCanvas.width = w;
      sigCanvas.height = h;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any prior scale
      ctx.scale(ratio, ratio);
      applyCtxStyle();
      lastW = w;
      lastH = h;

      if (png) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = png;
      }
    }

    /* Expose to outer scope so showStep(9) can re-trigger sizing */
    resizeSignaturePad = doResize;

    /* Try once now (if step 9 is somehow visible), then on resize. */
    doResize();
    window.addEventListener("resize", doResize);

    function getPos(e) {
      const rect = sigCanvas.getBoundingClientRect();
      const t =
        (e.touches && e.touches[0]) ||
        (e.changedTouches && e.changedTouches[0]) ||
        e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    function start(e) {
      doResize(); // ensure dimensions are current
      drawing = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      e.preventDefault();
    }
    function move(e) {
      if (!drawing) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      hasInk = true;
      e.preventDefault();
    }
    function end() {
      if (!drawing) return;
      drawing = false;
      if (hasInk) {
        try {
          sigData.value = sigCanvas.toDataURL("image/png");
        } catch (e) {}
        sigStatus.textContent = "✓ Signature captured";
        sigStatus.style.color = "var(--clr-success)";
      }
    }

    sigCanvas.addEventListener("mousedown", start);
    sigCanvas.addEventListener("mousemove", move);
    sigCanvas.addEventListener("mouseup", end);
    sigCanvas.addEventListener("mouseleave", end);
    sigCanvas.addEventListener("touchstart", start, { passive: false });
    sigCanvas.addEventListener("touchmove", move, { passive: false });
    sigCanvas.addEventListener("touchend", end);
    sigCanvas.addEventListener("touchcancel", end);

    sigClear.addEventListener("click", () => {
      ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
      hasInk = false;
      sigData.value = "";
      sigStatus.textContent = "Sign in the box above";
      sigStatus.style.color = "";
    });
  }

  /* ──────────────────────────────────────────────────────────
        SUBMIT — convert files to base64 and POST to Apps Script
        ────────────────────────────────────────────────────────── */
  let submitInProgress = false;

  const submitNotice = document.createElement("div");
  submitNotice.id = "submitNotice";
  submitNotice.className = "submit-notice";
  submitNotice.setAttribute("role", "alert");
  submitNotice.setAttribute("aria-live", "assertive");
  submitNotice.setAttribute("aria-hidden", "true");
  submitNotice.innerHTML = `
       <div class="submit-notice-inner">
         <span class="submit-notice-icon" aria-hidden="true">
           <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round">
             <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
           </svg>
         </span>
         <div class="submit-notice-text">
           <strong>Submitting your application</strong>
           <p>Please do not refresh or leave this page. Uploading documents and saving your application may take up to 30 seconds.</p>
         </div>
       </div>`;
  document.body.appendChild(submitNotice);

  function showSubmitNotice() {
    submitInProgress = true;
    submitNotice.classList.add("open");
    submitNotice.setAttribute("aria-hidden", "false");
  }

  function hideSubmitNotice() {
    submitInProgress = false;
    submitNotice.classList.remove("open");
    submitNotice.setAttribute("aria-hidden", "true");
  }

  window.addEventListener("beforeunload", (e) => {
    if (!submitInProgress) return;
    e.preventDefault();
    e.returnValue = "";
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: String(reader.result).split(",")[1], // strip "data:...base64,"
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function generateRefId() {
    const ts = Date.now().toString(36).toUpperCase().slice(-4);
    const r = Math.floor(Math.random() * 36 ** 3)
      .toString(36)
      .toUpperCase()
      .padStart(3, "0");
    return "CRR-2026-" + ts + r;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(9)) return;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Submitting…";
    showSubmitNotice();

    const refId = generateRefId();

    /* 1. Build text payload from form fields (sanitize all text values) */
    const payload = {
      reference_id: refId,
      submitted_at: new Date().toISOString(),
    };
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      if (!el.name || el.type === "file") return;
      if (el.type === "radio") {
        if (el.checked) payload[el.name] = sanitizeText(el.value);
        return;
      }
      if (el.type === "checkbox") {
        payload[el.name] = el.checked ? "Yes" : "No";
        return;
      }
      payload[el.name] =
        el.type === "number" ? el.value : sanitizeText(el.value);
    });

    /* 2. Encode all uploaded files + signature */
    const fileFields = [
      "upload_photo",
      "upload_signature",
      "upload_jee",
      "upload_ts-eapcet",
      "upload_ssc",
      "upload_hsc",
      "upload_aadhaar",
      "upload_payment_receipt",
    ];
    payload.files = {};
    for (const name of fileFields) {
      const input = form.querySelector(`[name="${name}"]`);
      const f = input?.files?.[0];
      if (f) {
        try {
          payload.files[name] = await fileToBase64(f);
        } catch (err) {
          console.error(err);
        }
      }
    }
    /* signature pad data */
    if (payload.signature_data && payload.signature_data.startsWith("data:")) {
      payload.files.digital_signature = {
        name: `signature-${refId}.png`,
        type: "image/png",
        data: payload.signature_data.split(",")[1],
      };
      delete payload.signature_data;
    }

    /* Generated application PDF — saved to Drive and linked in the Sheet */
    if (window.CRRaoApplicationPdf?.getBase64ForSubmit) {
      try {
        payload.files.upload_application_pdf =
          await window.CRRaoApplicationPdf.getBase64ForSubmit(refId);
      } catch (pdfErr) {
        console.warn(
          "Application PDF could not be generated for upload:",
          pdfErr,
        );
      }
    }

    /* 3. POST to Apps Script.
          Use form-urlencoded (no preflight) to avoid CORS issues. */
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: new URLSearchParams({ payload: JSON.stringify(payload) }),
      });
      let ok = res.ok;
      let responseData = null;
      try {
        responseData = await res.json();
        if (responseData && responseData.status) {
          ok = responseData.status === "ok";
        }
      } catch (e) {}
      if (!ok) {
        throw new Error(
          (responseData && responseData.message) || "Submission failed",
        );
      }
      console.info("Application saved:", responseData);
    } catch (err) {
      console.error("Apps Script POST failed. Payload:", payload, err);
      hideSubmitNotice();
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit Application";
      alert(
        "We could not save your application to the server. Please try again or email btechadmissions.crr@gmail.com with your details.\n\n" +
          (err && err.message ? err.message : "Network error"),
      );
      return;
    } finally {
      hideSubmitNotice();
    }

    /* 4. Show success */
    refIdEl.textContent = refId;
    steps.forEach((s) => s.classList.remove("active"));
    successStep.classList.add("active");

    if (stepList) {
      stepList
        .querySelectorAll("li")
        .forEach((li) => li.classList.add("completed"));
    }
    if (progressBar) progressBar.style.width = "100%";

    /* 5. Clear the saved draft (the user has submitted) */
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    window.scrollTo({
      top: document.querySelector(".apply-shell").offsetTop - 80,
      behavior: "smooth",
    });
  });

  /* ──────────────────────────────────────────────────────────
        PRE-APPLY NOTICE DIALOG
        ────────────────────────────────────────────────────────── */
  // const preApplyNotice = document.getElementById("preApplyNotice");
  // if (preApplyNotice) {
  //   const closeButtons = preApplyNotice.querySelectorAll("[data-close-notice]");
  //   const closeNotice = () => {
  //     preApplyNotice.classList.remove("open");
  //     preApplyNotice.setAttribute("aria-hidden", "true");
  //     document.body.style.overflow = "";
  //   };
  //   const openNotice = () => {
  //     preApplyNotice.classList.add("open");
  //     preApplyNotice.setAttribute("aria-hidden", "false");
  //     document.body.style.overflow = "hidden";
  //   };

  //   closeButtons.forEach((btn) => btn.addEventListener("click", closeNotice));
  //   preApplyNotice.addEventListener("click", (e) => {
  //     if (e.target === preApplyNotice) closeNotice();
  //   });
  //   document.addEventListener("keydown", (e) => {
  //     if (e.key === "Escape" && preApplyNotice.classList.contains("open")) {
  //       closeNotice();
  //     }
  //   });

  //   setTimeout(openNotice, 150);
  // }

  /* ──────────────────────────────────────────────────────────
        INPUT SANITIZATION
        Strip HTML tags and dangerous characters from text fields
        on blur (live) and again before payload is submitted.
        ────────────────────────────────────────────────────────── */
  function sanitizeText(val) {
    return val
      .replace(/<[^>]*>/g, "") // strip HTML/script tags
      .replace(/[<>"'`]/g, "") // remove remaining angle-brackets & quotes
      .replace(/javascript:/gi, "") // block js: URIs
      .replace(/on\w+\s*=/gi, "") // strip inline event attributes
      .trim();
  }

  const TEXT_TYPES = new Set([
    "text",
    "email",
    "tel",
    "number",
    "search",
    "url",
    "",
  ]);
  form.querySelectorAll("input, textarea").forEach((el) => {
    if (!TEXT_TYPES.has(el.type)) return;
    el.addEventListener("blur", () => {
      if (el.type !== "email" && el.type !== "number") {
        el.value = sanitizeText(el.value);
      }
    });
  });

  /* Also sanitize the name fields specifically on input to give real-time feedback */
  const NAME_FIELDS = ["f-name", "f-fname", "f-mname", "f-pname"];
  NAME_FIELDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      /* Remove digits and angle-bracket sequences immediately */
      el.value = el.value.replace(/[0-9<>]/g, "");
    });
  });

  /* Aadhaar formatter (4-4-4 grouping) */
  const aadhaar = document.getElementById("f-aadhaar");
  aadhaar?.addEventListener("input", () => {
    const v = aadhaar.value.replace(/\D/g, "").slice(0, 12);
    aadhaar.value = v.replace(/(\d{4})(\d{0,4})(\d{0,4}).*/, (m, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  });
})();
