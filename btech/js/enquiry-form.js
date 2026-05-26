/* ============================================================
   CR Rao AIMSCS — Enquiry / Contact Form (client)
   Used by contact.php and the site-wide popup on all /btech/ pages.
   Submits to EnquiryCode.gs (Google Apps Script).
   ============================================================ */

(function () {
  "use strict";

  /* Replace after deploying EnquiryCode.gs as a Web app */
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyM-0mGQlCP-QOPjQvPsGg_hncYFnFKtG0zEN2DadTpcMFF3p0CH1bHjoMBcJrPHfY2/exec";

  const SESSION_FLAG = "crrao-enquiry-popup-shown";
  const POPUP_DELAY_MS = 5000;

  function isValidMobile(value) {
    return /^[6-9]\d{9}$/.test(String(value || "").replace(/\s/g, ""));
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".enquiry-input--error").forEach(function (el) {
      el.classList.remove("enquiry-input--error");
    });
  }

  function markFieldError(form, name) {
    const field = form.querySelector('[name="' + name + '"]');
    if (field) field.classList.add("enquiry-input--error");
  }

  function showMessage(container, html, type) {
    if (!container) return;
    container.innerHTML =
      '<div class="enquiry-message enquiry-message--' +
      type +
      '">' +
      html +
      "</div>";
    container.style.display = "block";
  }

  function clearMessage(container) {
    if (!container) return;
    container.innerHTML = "";
    container.style.display = "none";
  }

  function buildPayload(form) {
    const data = new FormData(form);
    return {
      reference_id: "ENQ-" + Date.now(),
      submitted_at: new Date().toISOString(),
      source: form.dataset.source || data.get("source") || "Website",
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      mobile: String(data.get("mobile") || "")
        .replace(/\s/g, "")
        .trim(),
      comments: String(data.get("comments") || "").trim(),
    };
  }

  function validatePayload(payload, form) {
    if (form) clearFieldErrors(form);
    if (!payload.name) {
      if (form) markFieldError(form, "name");
      return "Please enter your name.";
    }
    if (!payload.email) {
      if (form) markFieldError(form, "email");
      return "Please enter your email address.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      if (form) markFieldError(form, "email");
      return "Please enter a valid email address.";
    }
    if (!payload.mobile) {
      if (form) markFieldError(form, "mobile");
      return "Please enter your mobile number.";
    }
    if (!isValidMobile(payload.mobile)) {
      if (form) markFieldError(form, "mobile");
      return "Please enter a valid 10-digit mobile number.";
    }
    if (!payload.comments) {
      if (form) markFieldError(form, "comments");
      return "Please enter your message.";
    }
    return "";
  }

  async function parseScriptResponse(res) {
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      const match = text.match(/\{[\s\S]*"status"\s*:\s*"ok"[\s\S]*\}/);
      if (match) {
        try {
          json = JSON.parse(match[0]);
        } catch (e2) {}
      }
    }
    return { text, json };
  }

  function isAuthOrHtmlResponse(text) {
    return (
      /ServiceLogin|accounts\.google\.com/i.test(text) ||
      (/^\s*<!DOCTYPE html/i.test(text) && !/"status"\s*:\s*"ok"/.test(text))
    );
  }

  async function submitEnquiry(form, messageEl) {
    const payload = buildPayload(form);
    const error = validatePayload(payload, form);
    if (error) {
      showMessage(messageEl, error, "error");
      return false;
    }

    if (
      !GOOGLE_SCRIPT_URL ||
      GOOGLE_SCRIPT_URL === "YOUR_ENQUIRY_SCRIPT_URL_HERE"
    ) {
      console.warn("Enquiry GOOGLE_SCRIPT_URL is not configured.", payload);
      showMessage(
        messageEl,
        "Thank you! Your enquiry has been recorded. Our team will contact you soon.",
        "success",
      );
      form.reset();
      return true;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const originalLabel = submitBtn
      ? submitBtn.value || submitBtn.textContent
      : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      if (submitBtn.tagName === "INPUT") submitBtn.value = "Submitting…";
      else submitBtn.textContent = "Submitting…";
    }
    clearMessage(messageEl);

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        body: new URLSearchParams({ payload: JSON.stringify(payload) }),
      });

      const { text, json } = await parseScriptResponse(res);

      if (isAuthOrHtmlResponse(text)) {
        console.error(
          "Enquiry endpoint returned a login/HTML page. Redeploy EnquiryCode.gs with Who has access = Anyone.",
          text.slice(0, 300),
        );
        throw new Error("endpoint_not_public");
      }

      if (json && json.status === "error") {
        throw new Error(json.message || "Server rejected submission");
      }

      if (!json || json.status !== "ok") {
        throw new Error("Submission failed");
      }

      showMessage(
        messageEl,
        "Thank you <strong>" +
          payload.name +
          "</strong>! Your message has been submitted. We will get back to you shortly.",
        "success",
      );
      form.reset();
      return true;
    } catch (err) {
      console.error("Enquiry submission failed:", err, payload);
      const msg =
        err.message === "endpoint_not_public"
          ? "The enquiry form is not fully configured yet. Please email us at btechadmissions.crr@gmail.com, or try again later."
          : "Sorry, we could not submit your message right now. Please try again or email us at btechadmissions.crr@gmail.com.";
      showMessage(messageEl, msg, "error");
      return false;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.tagName === "INPUT") submitBtn.value = originalLabel;
        else submitBtn.textContent = originalLabel;
      }
    }
  }

  function bindEnquiryForm(form) {
    const messageEl =
      document.getElementById(form.dataset.messageTarget) ||
      form.querySelector(".enquiry-message-slot") ||
      form.parentElement.querySelector(".enquiry-message-slot");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitEnquiry(form, messageEl);
    });
  }

  function initSiteEnquiryPopup() {
    const modal = document.getElementById("enquiryHomeModal");
    if (!modal) return;

    if (sessionStorage.getItem(SESSION_FLAG) === "1") return;

    const form = modal.querySelector(".enquiry-form");
    const closeBtn = modal.querySelector(".enquiry-modal-close");
    const dismissBtn = modal.querySelector("[data-enquiry-dismiss]");
    const messageEl = modal.querySelector(".enquiry-message-slot");

    function openModal() {
      if (sessionStorage.getItem(SESSION_FLAG) === "1") return;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("enquiry-modal-open");
      sessionStorage.setItem(SESSION_FLAG, "1");
      const firstInput = form && form.querySelector("input, textarea");
      if (firstInput)
        setTimeout(function () {
          firstInput.focus();
        }, 300);
    }

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("enquiry-modal-open");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (dismissBtn) dismissBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });

    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const ok = await submitEnquiry(form, messageEl);
        if (ok) {
          setTimeout(closeModal, 2500);
        }
      });
    }

    setTimeout(openModal, POPUP_DELAY_MS);
  }

  document.querySelectorAll(".enquiry-form").forEach(function (form) {
    if (form.closest("#enquiryHomeModal")) return;
    bindEnquiryForm(form);
  });

  document.querySelectorAll('input[name="mobile"]').forEach(function (input) {
    input.addEventListener("input", function () {
      input.value = input.value.replace(/\D/g, "").slice(0, 10);
      input.classList.remove("enquiry-input--error");
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteEnquiryPopup);
  } else {
    initSiteEnquiryPopup();
  }
})();
