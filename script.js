(function () {
  "use strict";

  // ---------- Footer year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Theme toggle ----------
  var STORAGE_KEY = "portfolio-theme";
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var icon = toggle ? toggle.querySelector(".theme-icon") : null;

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
      if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
    } else {
      root.removeAttribute("data-theme");
      if (icon) icon.textContent = "◐";
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") || "auto";
  }

  function cycleTheme() {
    var next = currentTheme() === "dark" ? "light" : currentTheme() === "light" ? "auto" : "dark";
    if (next === "auto") {
      localStorage.removeItem(STORAGE_KEY);
      applyTheme("auto");
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    }
  }

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") applyTheme(saved);
    else applyTheme("auto");
  } catch (_) {
    applyTheme("auto");
  }

  if (toggle) toggle.addEventListener("click", cycleTheme);

  // ---------- Featured project live stats (GitHub API) ----------
  var REPO = "BI-KnowledgeAnalytics/powerbi-theme-cli";
  var linkEl = document.getElementById("project-link");
  var ctaEl = document.getElementById("project-cta");
  var statsEl = document.getElementById("project-stats");
  var url = "https://github.com/" + REPO;

  if (linkEl) linkEl.href = url;
  if (ctaEl) ctaEl.href = url;

  fetch("https://api.github.com/repos/" + REPO)
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !statsEl) return;
      var stars = statsEl.querySelector('[data-key="stars"]');
      var forks = statsEl.querySelector('[data-key="forks"]');
      var lang = statsEl.querySelector('[data-key="lang"]');
      if (stars) stars.textContent = "⭐ " + (data.stargazers_count || 0);
      if (forks) forks.textContent = "⑂ " + (data.forks_count || 0);
      if (lang && data.language) lang.textContent = data.language;
    })
    .catch(function () { /* silent fail — keep placeholder */ });
})();
