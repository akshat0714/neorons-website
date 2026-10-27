/* All campus entries are available without JavaScript. */
(function () {
  "use strict";
  var gallery = document.getElementById("campus-gallery");
  if (!gallery) return;
  var controls = gallery.querySelector(".campus-tools");
  var search = document.getElementById("campus-search");
  var buttons = Array.from(gallery.querySelectorAll("[data-campus-filter]"));
  var cards = Array.from(gallery.querySelectorAll(".campus-entry"));
  var count = document.getElementById("campus-count");
  var more = document.getElementById("campus-more");
  var empty = document.getElementById("campus-empty");
  var family = "all";
  var limit = 9;
  var pageSize = 9;
  var matching = cards;

  function normalise(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function update() {
    var words = normalise(search.value).split(/\s+/).filter(Boolean);
    matching = cards.filter(function (card) {
      var text = normalise(card.dataset.search);
      return (
        (family === "all" || card.dataset.family === family) &&
        words.every(function (word) {
          return text.includes(word);
        })
      );
    });
    cards.forEach(function (card) {
      var position = matching.indexOf(card);
      card.hidden = position === -1 || position >= limit;
    });
    buttons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.campusFilter === family),
      );
    });
    var visible = Math.min(limit, matching.length);
    count.textContent = matching.length
      ? "Showing " +
        visible +
        " of " +
        matching.length +
        (family === "all" ? " campuses" : " " + family + " campuses") +
        (search.value.trim() ? " matching your search." : ".")
      : "No campuses match your search.";
    more.hidden = visible >= matching.length;
    more.textContent =
      "Show " +
      Math.min(pageSize, matching.length - visible) +
      " more campuses ↓";
    empty.hidden = matching.length !== 0;
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      family = button.dataset.campusFilter;
      limit = pageSize;
      update();
    });
  });
  search.addEventListener("input", function () {
    limit = pageSize;
    update();
  });
  more.addEventListener("click", function () {
    var firstNew = matching[limit];
    limit += pageSize;
    update();
    if (firstNew) firstNew.querySelector("h3 a").focus({ preventScroll: true });
  });
  gallery
    .querySelector("[data-campus-reset]")
    .addEventListener("click", function () {
      family = "all";
      search.value = "";
      limit = pageSize;
      update();
      search.focus();
    });

  function revealLinkedCampus() {
    var target = cards.find(function (card) {
      return "#" + card.id === window.location.hash;
    });
    if (!target) return;
    family = "all";
    search.value = "";
    limit = Math.ceil((cards.indexOf(target) + 1) / pageSize) * pageSize;
    update();
    target.scrollIntoView({ block: "start" });
  }
  controls.hidden = false;
  update();
  window.addEventListener("hashchange", revealLinkedCampus);
  revealLinkedCampus();
})();
