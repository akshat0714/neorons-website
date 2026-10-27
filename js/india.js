/* Progressive enhancement for the statically rendered India programme archive. */
(function () {
  "use strict";

  var toolbar = document.getElementById("archive-filters");
  if (!toolbar) return;

  var controls = Array.from(toolbar.querySelectorAll("[data-filter]"));
  var records = Array.from(document.querySelectorAll(".archive-event"));
  var count = document.getElementById("archive-count");

  function showCategory(category) {
    var shown = [];
    records.forEach(function (record) {
      var visible = category === "all" || record.dataset.category === category;
      record.hidden = !visible;
      if (visible) shown.push(record);
    });
    controls.forEach(function (control) {
      var active = control.dataset.filter === category;
      control.setAttribute("aria-pressed", String(active));
      control.classList.toggle("is-active", active);
    });
    var planned = shown.filter(function (record) {
      return record.dataset.status === "planned";
    }).length;
    count.textContent =
      shown.length +
      " programmes: " +
      (shown.length - planned) +
      " completed, " +
      planned +
      " originally planned.";
  }

  controls.forEach(function (control) {
    control.addEventListener("click", function () {
      showCategory(control.dataset.filter);
    });
  });

  function revealLinkedRecord() {
    var hash = window.location.hash;
    if (!hash.startsWith("#event-")) return;
    var record = records.find(function (item) {
      return "#" + item.id === hash;
    });
    if (!record) return;
    if (record.hidden) showCategory("all");
    var details = record.querySelector("details");
    if (details) details.open = true;
    record.scrollIntoView({ block: "start" });
  }

  toolbar.hidden = false;
  window.addEventListener("hashchange", revealLinkedRecord);
  revealLinkedRecord();
})();
