/* Open optional sections when visitors follow an existing deep link. */
(function () {
  "use strict";
  var phone = document.getElementById("phone-service");
  if (!phone) return;
  function openLinkedSection() {
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return; }
    var target = id && document.getElementById(id);
    if (target && target.closest("details")) {
      var section = target.closest("details");
      while (section) {
        section.open = true;
        section = section.parentElement && section.parentElement.closest("details");
      }
      requestAnimationFrame(function () { target.scrollIntoView({ block: "start", behavior: "instant" }); });
    }
  }
  phone.addEventListener("toggle", function () {
    if (phone.open) window.dispatchEvent(new Event("resize"));
  });
  window.addEventListener("hashchange", openLinkedSection);
  openLinkedSection();
})();
