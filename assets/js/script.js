/*!
 * UtilityDock — script.js
 * Shared behaviour: theme toggle, mobile nav, homepage search/filter,
 * clipboard helper, toast notifications. No dependencies.
 */
(function () {
  "use strict";

  /* ---------------- Theme toggle ---------------- */
  function initTheme() {
    var root = document.documentElement;
    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ud-theme", next); } catch (e) {}
      toggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    });
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileNav() {
    var btn = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("main-nav");
    if (!btn || !nav) return;

    btn.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Homepage search + category filter ---------------- */
  function initToolSearch() {
    var input = document.getElementById("tool-search");
    var cards = document.querySelectorAll("[data-tool-card]");
    var pills = document.querySelectorAll("[data-filter-pill]");
    var noResults = document.getElementById("no-results");
    if (!input || !cards.length) return;

    var activeCategory = "all";

    function applyFilter() {
      var term = input.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var name = (card.getAttribute("data-name") || "").toLowerCase();
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        var category = card.getAttribute("data-category") || "";

        var matchesTerm = !term || name.indexOf(term) !== -1 || keywords.indexOf(term) !== -1;
        var matchesCategory = activeCategory === "all" || category === activeCategory;
        var visible = matchesTerm && matchesCategory;

        card.style.display = visible ? "" : "none";
        if (visible) visibleCount++;
      });

      if (noResults) {
        noResults.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    input.addEventListener("input", applyFilter);

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        activeCategory = pill.getAttribute("data-filter-pill") || "all";
        pills.forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        applyFilter();
      });
    });
  }

  /* ---------------- Toast ---------------- */
  var toastTimer = null;
  function showToast(message) {
    var toast = document.querySelector("[data-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("data-toast", "");
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }
  window.UD = window.UD || {};
  window.UD.showToast = showToast;

  /* ---------------- Clipboard helper ---------------- */
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject(new Error("execCommand copy failed"));
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return fallbackCopy(text);
  }
  window.UD.copyText = copyText;

  function initCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetSel = btn.getAttribute("data-copy-target");
        var targetEl = document.querySelector(targetSel);
        if (!targetEl) return;
        var text = "value" in targetEl ? targetEl.value : targetEl.textContent;
        copyText(text)
          .then(function () { showToast("Copied to clipboard"); })
          .catch(function () { showToast("Couldn't copy — please copy manually"); });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initMobileNav();
    initYear();
    initToolSearch();
    initCopyButtons();
  });
})();
