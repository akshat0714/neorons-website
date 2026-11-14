/* Progressive enhancement: every law remains readable without JavaScript. */
(function () {
  "use strict";
  var filters = document.querySelector(".rights-filters");
  var entries = Array.from(document.querySelectorAll(".law-entry"));
  var status = document.querySelector("[data-law-status]");
  if (!filters || !entries.length) return;
  var buttons = Array.from(filters.querySelectorAll("[data-law-filter]"));

  function filter(theme, announce) {
    var count = 0;
    entries.forEach(function (entry) {
      var matches = theme === "all" || entry.dataset.lawThemes.split(" ").indexOf(theme) !== -1;
      entry.hidden = !matches;
      if (matches) count++;
    });
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.lawFilter === theme));
    });
    if (announce && status) status.textContent = count + " rights frameworks shown.";
  }
  function openLaw(id) {
    var entry = document.getElementById("law-" + id);
    if (!entry || entries.indexOf(entry) === -1) return;
    if (entry.hidden) filter("all", false);
    entry.open = true;
  }
  buttons.forEach(function (button) {
    button.addEventListener("click", function () { filter(button.dataset.lawFilter, true); });
  });
  document.querySelectorAll("[data-open-law]").forEach(function (link) {
    link.addEventListener("click", function () {
      openLaw(link.dataset.openLaw);
      var summary = document.querySelector("#law-" + link.dataset.openLaw + " summary");
      if (summary) summary.focus({ preventScroll: true });
    });
  });
  function readHash() {
    if (window.location.hash.indexOf("#law-") === 0) openLaw(window.location.hash.slice(5));
  }
  window.addEventListener("hashchange", readHash);
  readHash();
  filters.hidden = false;
})();
