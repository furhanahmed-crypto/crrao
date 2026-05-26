/**
 * B.Tech application promo popup — main domain root embed.
 * Shows once per browser session, 5 seconds after page load.
 */
(function () {
  "use strict";

  const SESSION_FLAG = "crrao-btech-app-popup-shown";
  const POPUP_DELAY_MS = 5000;

  const config = window.BtechAppPopupConfig || {};
  const applicationUrl =
    config.applicationUrl || "/btech/application/application-2026.php";

  function initBtechAppPopup() {
    const modal = document.getElementById("btechAppPopup");
    if (!modal) return;
    if (sessionStorage.getItem(SESSION_FLAG) === "1") return;

    const closeBtn = modal.querySelector(".btech-app-popup-close");
    const dismissBtn = modal.querySelector("[data-btech-app-dismiss]");
    const ctaBtn = modal.querySelector(".btech-app-popup-cta");

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("btech-app-popup-open");
    }

    function openModal() {
      if (sessionStorage.getItem(SESSION_FLAG) === "1") return;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("btech-app-popup-open");
      sessionStorage.setItem(SESSION_FLAG, "1");
      if (ctaBtn) ctaBtn.focus();
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (dismissBtn) dismissBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });

    if (ctaBtn) {
      ctaBtn.setAttribute("href", applicationUrl);
      ctaBtn.addEventListener("click", function () {
        sessionStorage.setItem(SESSION_FLAG, "1");
      });
    }

    setTimeout(openModal, POPUP_DELAY_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBtechAppPopup);
  } else {
    initBtechAppPopup();
  }
})();
