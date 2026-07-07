/**
 * Neorons — site behaviour.
 * Renders event cards and the district grid from js/events.js, and drives the
 * filters, event-detail modal, mobile navigation, and motion design (hero
 * entrance, staggered scroll reveals, stat count-ups) — all respecting
 * prefers-reduced-motion.
 */
(function () {
  "use strict";

  // Motion gate: the reveal CSS only hides content under html.js, and this is
  // the script that reveals it — so the class is set here, not in the HTML.
  // If this file fails to load, the site renders fully visible, unanimated.
  document.documentElement.classList.add("js");

  // Hero image error handler (moved from inline onerror for CSP compliance).
  var heroImg = document.querySelector(".hero-media img");
  if (heroImg) {
    heroImg.addEventListener("error", function () {
      heroImg.parentElement.style.display = "none";
    });
  }

  var eventGrid = document.getElementById("event-grid");
  var districtGrid = document.getElementById("district-grid");
  var modal = document.getElementById("event-modal");
  var modalContent = document.getElementById("modal-content");
  var lastFocusedElement = null;
  var currentEventId = null;

  // Live query so a preference change mid-session is respected.
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function reducedMotion() {
    return motionQuery.matches;
  }

  /* ---------------------------------------------------------------------- */
  /* Rendering                                                               */
  /* ---------------------------------------------------------------------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeImage(event, className, eager) {
    if (!event.image) return null;
    var figure = el("figure", className);
    var img = document.createElement("img");
    img.src = event.image;
    img.alt = event.imageAlt || "";
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    // Hide the frame gracefully until a real photo exists at this path.
    img.addEventListener("error", function () {
      figure.style.display = "none";
    });
    figure.appendChild(img);
    return figure;
  }

  /** Wrap Hindi/Sanskrit words in <span lang="hi"> for correct pronunciation. */
  var hindiWords = ["Jigyasa", "Disha", "Shakti"];
  function wrapHindiWords(text) {
    var result = text;
    hindiWords.forEach(function (word) {
      result = result.replace(new RegExp("(" + word + ")", "g"),
        '<span lang="hi">$1</span>');
    });
    return result;
  }

  function renderEventCard(event) {
    var pillar = NEORONS_PILLARS[event.pillar] || { label: "", className: "" };
    var featured = !!event.featured;

    // The card is an <article>; its accessible control is a real <button>
    // holding just the title. Clicks anywhere on the card still open the modal.
    var card = el(
      "article",
      "event-card " + pillar.className + (featured ? " is-featured" : "")
    );
    card.setAttribute("data-pillar", event.pillar);
    card.setAttribute("data-event-id", event.id);

    if (event.status === "upcoming") {
      card.classList.add("is-upcoming");
    }

    var figure = makeImage(event, "event-figure", featured);
    if (figure) card.appendChild(figure);

    // Featured cards lay text out beside the image; regular cards stack.
    var text = featured ? el("div", "event-text") : card;

    if (featured) {
      text.appendChild(el("span", "featured-flag", "Featured event"));
    }

    text.appendChild(el("p", "event-tag", pillar.label));

    var title = el("h3", "event-title");
    var titleButton = el("button", "event-link");
    titleButton.innerHTML = wrapHindiWords(event.title.replace(/</g, "&lt;"));
    titleButton.type = "button";
    titleButton.setAttribute("aria-haspopup", "dialog");
    title.appendChild(titleButton);
    text.appendChild(title);

    var meta = el("p", "event-meta");
    var district = el(
      "span",
      "event-district",
      event.district + " district, " + event.state
    );
    meta.appendChild(district);
    meta.appendChild(document.createTextNode(" · " + (event.dates || event.date)));
    text.appendChild(meta);

    text.appendChild(el("p", "event-blurb", event.blurb));

    var more = el("span", "event-more");
    more.setAttribute("aria-hidden", "true");
    more.appendChild(document.createTextNode("See it on the map "));
    more.appendChild(el("span", "arrow", "→"));
    text.appendChild(more);

    if (featured) card.appendChild(text);

    // The title button opens the full story dialog; clicking anywhere else
    // on the card flies to the event's location on the India map.
    card.addEventListener("click", function (clickEvent) {
      if (clickEvent.target.closest && clickEvent.target.closest(".event-link")) return;
      locateOnMap(event, titleButton);
    });
    titleButton.addEventListener("click", function () {
      openModal(event, titleButton);
    });

    return card;
  }

  function renderEvents() {
    if (!eventGrid) return;
    // Featured event first, keeping data order otherwise.
    var ordered = NEORONS_EVENTS.slice().sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
    ordered.forEach(function (event) {
      eventGrid.appendChild(renderEventCard(event));
    });
  }

  function renderDistricts() {
    if (!districtGrid) return;
    var byDistrict = {};
    NEORONS_EVENTS.forEach(function (event) {
      var key = event.district + "|" + event.state;
      if (!byDistrict[key]) {
        byDistrict[key] = { district: event.district, state: event.state, events: [] };
      }
      byDistrict[key].events.push(event.title);
    });

    Object.keys(byDistrict).forEach(function (key) {
      var entry = byDistrict[key];
      var item = el("li", "district-card");
      item.appendChild(el("span", "district-name", entry.district));
      item.appendChild(el("span", "district-state", entry.state));
      item.appendChild(
        el(
          "span",
          "district-count",
          entry.events.length + (entry.events.length === 1 ? " event" : " events")
        )
      );
      districtGrid.appendChild(item);
    });
  }

  function renderTeam() {
    var grid = document.getElementById("team-grid");
    if (!grid || typeof NEORONS_TEAM === "undefined") return;

    NEORONS_TEAM.forEach(function (member) {
      var card = el("article", "team-card reveal");
      var avatar = el("div", "team-avatar");
      if (member.image) {
        var img = document.createElement("img");
        img.src = member.image;
        img.alt = member.name;
        img.width = 120;
        img.height = 120;
        img.loading = "lazy";
        avatar.appendChild(img);
      } else {
        // Placeholder initial
        avatar.appendChild(el("span", "team-initial", member.name.charAt(0)));
      }
      card.appendChild(avatar);
      card.appendChild(el("h3", "team-name", member.name));
      card.appendChild(el("p", "team-role", member.role));
      card.appendChild(el("p", "team-bio", member.bio));
      grid.appendChild(card);
    });
  }

  function renderTestimonials() {
    var grid = document.getElementById("voices-grid");
    if (!grid || typeof NEORONS_TESTIMONIALS === "undefined") return;

    NEORONS_TESTIMONIALS.forEach(function (item) {
      var card = el("article", "voice-card reveal");
      var blockquote = document.createElement("blockquote");
      blockquote.className = "voice-quote";
      blockquote.appendChild(el("p", null, "\u201C" + item.quote + "\u201D"));
      var cite = document.createElement("cite");
      cite.className = "voice-cite";
      cite.appendChild(el("span", "voice-name", item.name));
      cite.appendChild(document.createTextNode(" \u00B7 "));
      cite.appendChild(el("span", "voice-context", item.context));
      blockquote.appendChild(cite);
      card.appendChild(blockquote);
      card.appendChild(el("span", "voice-event", item.event));
      grid.appendChild(card);
    });
  }

  function renderTimeline() {
    var container = document.querySelector(".events .section-head");
    if (!container) return;

    var pastEvents = NEORONS_EVENTS.filter(function (e) {
      return e.status !== "upcoming";
    });
    // Sort by date (simple month-year parse)
    var monthOrder = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
    };
    pastEvents.sort(function (a, b) {
      var aMonth = a.date.split(" ")[0];
      var bMonth = b.date.split(" ")[0];
      var aYear = parseInt(a.date.split(" ")[1], 10) || 2025;
      var bYear = parseInt(b.date.split(" ")[1], 10) || 2025;
      if (aYear !== bYear) return aYear - bYear;
      return (monthOrder[aMonth] || 0) - (monthOrder[bMonth] || 0);
    });

    var timeline = el("div", "event-timeline reveal");
    timeline.setAttribute("aria-label", "Event timeline");
    var track = el("div", "timeline-track");

    pastEvents.forEach(function (event) {
      var pillar = NEORONS_PILLARS[event.pillar] || { className: "" };
      var dot = el("button", "timeline-dot " + pillar.className);
      dot.type = "button";
      dot.setAttribute("aria-label", event.title + ", " + event.date);
      var label = el("span", "timeline-label");
      label.appendChild(el("span", "timeline-date", event.date.split(" ")[0].substring(0, 3) + " " + (event.date.split(" ")[1] || "")));
      label.appendChild(el("span", "timeline-title", event.title));
      dot.appendChild(label);
      dot.addEventListener("click", function () {
        openModal(event, dot);
      });
      track.appendChild(dot);
    });

    timeline.appendChild(track);
    container.parentNode.insertBefore(timeline, container.nextSibling);
  }

  /* ---------------------------------------------------------------------- */
  /* Filters                                                                 */
  /* ---------------------------------------------------------------------- */

  function initFilters() {
    var buttons = document.querySelectorAll(".filter-btn");

    // Compute counts per pillar (excluding upcoming)
    var counts = { all: 0 };
    NEORONS_EVENTS.forEach(function (e) {
      if (e.status === "upcoming") return;
      counts.all += 1;
      counts[e.pillar] = (counts[e.pillar] || 0) + 1;
    });

    // Show counts on buttons
    buttons.forEach(function (btn) {
      var f = btn.getAttribute("data-filter");
      var count = counts[f] || 0;
      if (count) btn.textContent = btn.textContent + " (" + count + ")";
    });

    // Aria-live region for screen readers
    var liveRegion = el("div", "sr-only");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("role", "status");
    var filterGroup = document.querySelector(".event-filters");
    if (filterGroup) filterGroup.parentNode.insertBefore(liveRegion, filterGroup.nextSibling);

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("is-active")) return;
        buttons.forEach(function (other) {
          var active = other === btn;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", active ? "true" : "false");
        });
        var filter = btn.getAttribute("data-filter");
        var enteringIndex = 0;
        var showing = 0;
        var total = 0;
        document.querySelectorAll(".event-card").forEach(function (card) {
          if (card.classList.contains("is-upcoming")) return;
          total += 1;
          var match = filter === "all" || card.getAttribute("data-pillar") === filter;
          var wasHidden = card.classList.contains("is-hidden");
          card.classList.toggle("is-hidden", !match);
          if (match) showing += 1;
          if (match && wasHidden && !reducedMotion()) {
            card.style.animationDelay = Math.min(enteringIndex * 45, 360) + "ms";
            card.classList.add("is-filtering");
            card.addEventListener("animationend", function handle(animEvent) {
              if (animEvent.animationName !== "card-in") return;
              card.classList.remove("is-filtering");
              card.style.animationDelay = "";
              card.removeEventListener("animationend", handle);
            });
            enteringIndex += 1;
          }
        });
        // Announce to screen readers
        liveRegion.textContent = "Showing " + showing + " of " + total + " events";
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Modal                                                                   */
  /* ---------------------------------------------------------------------- */

  function buildModalContent(event) {
    var pillar = NEORONS_PILLARS[event.pillar] || { label: "", className: "" };
    currentEventId = event.id;
    modalContent.innerHTML = "";

    var figureEl = makeImage(event, "modal-figure", true);
    if (figureEl) {
      if (event.credit && event.credit.creator) {
        var caption = document.createElement("figcaption");
        if (event.credit.url) {
          var creditLink = el("a", null, "Photo: " + event.credit.creator + " (" + event.credit.license + ")");
          creditLink.href = event.credit.url;
          creditLink.target = "_blank";
          creditLink.rel = "noopener";
          caption.appendChild(creditLink);
        } else {
          caption.textContent = "Photo: " + event.credit.creator + " (" + event.credit.license + ")";
        }
        figureEl.appendChild(caption);
      }
      modalContent.appendChild(figureEl);
    }

    // Gallery thumbnails
    if (event.gallery && event.gallery.length) {
      var gallery = el("div", "modal-gallery");
      event.gallery.forEach(function (photo) {
        var thumb = document.createElement("button");
        thumb.className = "gallery-thumb";
        thumb.type = "button";
        var thumbImg = document.createElement("img");
        thumbImg.src = photo.src;
        thumbImg.alt = photo.alt || "";
        thumbImg.width = 80;
        thumbImg.height = 54;
        thumbImg.loading = "lazy";
        thumb.appendChild(thumbImg);
        thumb.addEventListener("click", function () {
          var mainImg = modalContent.querySelector(".modal-figure img");
          if (mainImg) mainImg.src = photo.src;
        });
        gallery.appendChild(thumb);
      });
      modalContent.appendChild(gallery);
    }

    var header = el("div", "modal-header " + pillar.className);
    header.appendChild(el("p", "event-tag", pillar.label));
    var title = el("h2", "modal-title");
    title.innerHTML = wrapHindiWords(event.title.replace(/</g, "&lt;"));
    title.id = "modal-title";
    header.appendChild(title);

    var meta = el("p", "modal-meta");
    meta.textContent = event.venue + "  ·  " + (event.dates || event.date);
    header.appendChild(meta);
    modalContent.appendChild(header);

    var body = el("div", "modal-body");

    if (event.figures && event.figures.length) {
      var figures = el("div", "modal-figures");
      event.figures.forEach(function (figure) {
        var chip = el("div", "figure-chip");
        chip.appendChild(el("span", "figure-number", figure.number));
        chip.appendChild(el("span", "figure-label", figure.label));
        figures.appendChild(chip);
      });
      body.appendChild(figures);
    }

    if (event.description && event.description.length) {
      event.description.forEach(function (paragraph) {
        body.appendChild(el("p", "modal-paragraph", paragraph));
      });
    }

    if (event.highlights && event.highlights.length) {
      body.appendChild(el("h3", "modal-subhead", "Highlights"));
      var list = el("ul", "modal-highlights");
      event.highlights.forEach(function (highlight) {
        list.appendChild(el("li", null, highlight));
      });
      body.appendChild(list);
    }

    // Partners (proof layer)
    if (event.partners && event.partners.length) {
      var partnerLine = el("p", "modal-partners");
      partnerLine.appendChild(el("strong", null, "In partnership with: "));
      partnerLine.appendChild(document.createTextNode(event.partners.join(" \u00B7 ")));
      body.appendChild(partnerLine);
    }

    // Outcomes (not just outputs)
    if (event.outcomes && event.outcomes.length) {
      body.appendChild(el("h3", "modal-subhead", "Outcomes"));
      var outcomeList = el("ul", "modal-highlights");
      event.outcomes.forEach(function (outcome) {
        outcomeList.appendChild(el("li", null, outcome));
      });
      body.appendChild(outcomeList);
    }

    // Reflection ("What we learned")
    if (event.reflection) {
      body.appendChild(el("h3", "modal-subhead", "What we learned"));
      body.appendChild(el("p", "modal-paragraph modal-reflection", event.reflection));
    }

    // Safe-messaging: events that touch mental health always carry helpline info.
    if (event.wellbeingNote) {
      body.appendChild(
        el(
          "p",
          "modal-helpline",
          "If you or someone you know is struggling, free and confidential support " +
            "is available 24×7 across India through Tele-MANAS: 14416."
        )
      );
    }

    // Share row
    var shareRow = el("div", "modal-share");
    var eventUrl = window.location.origin + window.location.pathname + "#event-" + event.id;

    // WhatsApp
    var waBtn = el("a", "share-btn share-whatsapp", "WhatsApp");
    waBtn.href = "https://wa.me/?text=" + encodeURIComponent(event.title + ": " + eventUrl);
    waBtn.target = "_blank";
    waBtn.rel = "noopener";
    shareRow.appendChild(waBtn);

    // Copy link
    var copyBtn = el("button", "share-btn share-copy", "Copy link");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(eventUrl).then(function () {
          copyBtn.textContent = "Copied!";
          window.setTimeout(function () { copyBtn.textContent = "Copy link"; }, 2000);
        }).catch(function () { /* clipboard permission denied — silent fallback */ });
      }
    });
    shareRow.appendChild(copyBtn);

    // Native share (mobile)
    if (navigator.share) {
      var nativeBtn = el("button", "share-btn share-native", "Share\u2026");
      nativeBtn.type = "button";
      nativeBtn.addEventListener("click", function () {
        navigator.share({ title: event.title, url: eventUrl });
      });
      shareRow.appendChild(nativeBtn);
    }

    body.appendChild(shareRow);

    body.appendChild(buildModalNav(event));

    modalContent.appendChild(body);
  }

  /** Previous/next event navigation at the bottom of the modal. */
  function buildModalNav(event) {
    var nav = el("nav", "modal-nav");
    nav.setAttribute("aria-label", "More events");
    var index = NEORONS_EVENTS.indexOf(event);
    var total = NEORONS_EVENTS.length;
    var prev = NEORONS_EVENTS[(index - 1 + total) % total];
    var next = NEORONS_EVENTS[(index + 1) % total];

    [
      { target: prev, label: "Previous event", cls: "", arrow: "← ", arrowFirst: true },
      { target: next, label: "Next event", cls: " is-next", arrow: " →", arrowFirst: false },
    ].forEach(function (item) {
      var btn = el("button", "modal-nav-btn" + item.cls);
      btn.type = "button";
      btn.appendChild(el("span", "modal-nav-label", item.label));
      // Keep raw arrow glyphs out of the accessible name.
      var arrow = el("span", null, item.arrow);
      arrow.setAttribute("aria-hidden", "true");
      if (item.arrowFirst) btn.appendChild(arrow);
      btn.appendChild(document.createTextNode(item.target.title));
      if (!item.arrowFirst) btn.appendChild(arrow);
      btn.addEventListener("click", function () {
        switchModalEvent(item.target);
      });
      nav.appendChild(btn);
    });

    return nav;
  }

  function switchModalEvent(event) {
    var swap = function () {
      buildModalContent(event);
      modalContent.scrollTop = 0;
      if (history.replaceState) {
        history.replaceState(null, "", "#event-" + event.id);
      }
      // Focus the new title so screen readers announce the new event.
      var title = document.getElementById("modal-title");
      if (title) {
        title.tabIndex = -1;
        title.focus();
      }
      // Keep focus restore pointing at the card that matches the open event,
      // but only if that card is visible under the current filter.
      var card = document.querySelector('[data-event-id="' + event.id + '"]');
      if (card && !card.classList.contains("is-hidden")) {
        lastFocusedElement = card.querySelector(".event-link");
      }
    };

    if (reducedMotion()) {
      swap();
      return;
    }
    // Brief crossfade between events.
    modalContent.style.opacity = "0";
    window.setTimeout(function () {
      swap();
      modalContent.style.opacity = "";
    }, 130);
  }

  var lockedScrollY = 0;

  function openModal(event, triggerElement) {
    if (!modal.hidden || modal.classList.contains("is-closing")) return;
    lastFocusedElement = triggerElement || document.activeElement;
    buildModalContent(event);
    // Scroll lock that also holds on iOS Safari: fix the body in place at the
    // current offset, then restore the offset on close.
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = -lockedScrollY + "px";
    document.body.classList.add("modal-open");
    modal.hidden = false;
    // Move focus into the dialog after it becomes visible.
    window.requestAnimationFrame(function () {
      modal.querySelector(".modal-close").focus();
    });
    if (history.replaceState) {
      history.replaceState(null, "", "#event-" + event.id);
    }
  }

  function closeModal() {
    if (modal.hidden || modal.classList.contains("is-closing")) return;

    var finalize = function () {
      modal.classList.remove("is-closing");
      modal.hidden = true;
      currentEventId = null;
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
      window.scrollTo({ top: lockedScrollY, left: 0, behavior: "instant" });
      if (history.replaceState) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      // Restore focus, falling back to a visible control when the original
      // trigger has been hidden by an active filter.
      if (lastFocusedElement && lastFocusedElement.offsetParent !== null) {
        lastFocusedElement.focus();
      } else {
        var fallback = document.querySelector(".filter-btn.is-active");
        if (fallback) fallback.focus();
      }
      lastFocusedElement = null;
    };

    if (reducedMotion()) {
      finalize();
      return;
    }
    // Quick exit animation (styles.css panel-out/backdrop-out, 0.2s).
    modal.classList.add("is-closing");
    window.setTimeout(finalize, 210);
  }

  function initModal() {
    modal.addEventListener("click", function (clickEvent) {
      if (clickEvent.target.hasAttribute("data-close-modal")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (keyEvent) {
      if (modal.hidden) return;
      if (keyEvent.key === "Escape") {
        closeModal();
        return;
      }
      // Arrow-key navigation between events
      if (keyEvent.key === "ArrowLeft" || keyEvent.key === "ArrowRight") {
        var navBtn = modal.querySelector(
          keyEvent.key === "ArrowLeft" ? ".modal-nav-btn:not(.is-next)" : ".modal-nav-btn.is-next"
        );
        if (navBtn) navBtn.click();
      }
      // Simple focus trap: keep Tab cycling within the dialog.
      if (keyEvent.key === "Tab") {
        var focusable = modal.querySelectorAll(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (!modal.contains(document.activeElement)) {
          keyEvent.preventDefault();
          first.focus();
        } else if (keyEvent.shiftKey && document.activeElement === first) {
          keyEvent.preventDefault();
          last.focus();
        } else if (!keyEvent.shiftKey && document.activeElement === last) {
          keyEvent.preventDefault();
          first.focus();
        }
      }
    });
  }

  /** Open an event from a #event-<id> URL, on page load or same-page navigation. */
  function openFromHash() {
    if (typeof NEORONS_EVENTS === "undefined") return;
    var match = window.location.hash.match(/^#event-(.+)$/);
    if (!match) return;
    var found = NEORONS_EVENTS.filter(function (event) {
      return event.id === match[1];
    })[0];
    if (!found) return;
    if (!modal.hidden) {
      // Dialog already open: switch content instead of ignoring the URL.
      if (found.id !== currentEventId) switchModalEvent(found);
      return;
    }
    var trigger = document.querySelector(
      '[data-event-id="' + found.id + '"] .event-link'
    );
    openModal(found, trigger);
  }

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                              */
  /* ---------------------------------------------------------------------- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.addEventListener("click", function (clickEvent) {
      if (clickEvent.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /** Shadow + compact header once the page is scrolled. */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------- */
  /* Scroll-driven motion: progress bar, hero parallax, back-to-top          */
  /* ---------------------------------------------------------------------- */

  function initScrollEffects() {
    // Reading progress bar (injected so it never exists without JS).
    var progress = el("div", "scroll-progress");
    progress.setAttribute("aria-hidden", "true");
    var progressBar = el("span");
    progress.appendChild(progressBar);
    document.body.appendChild(progress);

    // Back-to-top button.
    var backTop = el("button", "back-to-top", "↑");
    backTop.type = "button";
    backTop.setAttribute("aria-label", "Back to top");
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0 });
      var target = document.querySelector(".skip-link") || document.body;
      if (target.focus) target.focus();
    });
    document.body.appendChild(backTop);

    // Hero parallax targets (absent on subpages).
    var heroSection = document.querySelector(".hero");
    var heroMedia = document.querySelector(".hero-media");
    var heroInner = document.querySelector(".hero-inner");

    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || 0;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;

      progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      backTop.classList.toggle("is-visible", y > 600);

      // Parallax: background drifts slower than the page; foreground eases
      // away slightly. Transform-only, and skipped under reduced motion or
      // once the hero has left the viewport.
      if (heroSection && !reducedMotion()) {
        var heroHeight = heroSection.offsetHeight;
        if (y <= heroHeight) {
          if (heroMedia) heroMedia.style.transform = "translateY(" + y * 0.22 + "px)";
          if (heroInner) {
            heroInner.style.transform = "translateY(" + y * 0.1 + "px)";
            heroInner.style.opacity = String(Math.max(1 - y / (heroHeight * 0.9), 0));
          }
        }
      } else if (heroMedia || heroInner) {
        if (heroMedia) heroMedia.style.transform = "";
        if (heroInner) {
          heroInner.style.transform = "";
          heroInner.style.opacity = "";
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /** Highlight the nav link for the section currently on screen. */
  function initScrollSpy() {
    var links = document.querySelectorAll('.nav-menu a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    var linkFor = {};
    var sections = [];
    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section && id !== "top") {
        linkFor[id] = link;
        sections.push(section);
      }
    });
    if (!sections.length) return;

    var currentId = null;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) currentId = entry.target.id;
        });
        links.forEach(function (link) {
          var active = linkFor[currentId] === link;
          link.classList.toggle("is-current", active);
          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      // A shallow band just below the header decides which section is current.
      { rootMargin: "-15% 0px -70% 0px" }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Motion: scroll reveals + count-ups                                      */
  /* ---------------------------------------------------------------------- */

  function initReveal() {
    var targets = document.querySelectorAll(
      ".reveal, .pillar, .event-card, .district-card, .impact-item"
    );
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(function (target) {
        target.classList.add("was-revealed");
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        // Stagger the elements that enter together in one batch.
        var batch = entries.filter(function (entry) {
          return entry.isIntersecting;
        });
        batch.forEach(function (entry, i) {
          var target = entry.target;
          target.style.setProperty("--reveal-delay", Math.min(i * 70, 420) + "ms");
          target.classList.add("is-revealed");
          target.addEventListener("animationend", function handle(animEvent) {
            if (animEvent.animationName !== "reveal-in") return;
            // Settle into a plain visible state so later display toggles
            // (filters) never replay the entrance, and the stagger delay
            // cannot leak into hover transitions.
            target.classList.add("was-revealed");
            target.classList.remove("is-revealed");
            target.style.removeProperty("--reveal-delay");
            target.removeEventListener("animationend", handle);
          });
          observer.unobserve(target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );
    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  /** Animate stat/impact numbers from 0 when they scroll into view. */
  function initCountUp() {
    var numbers = document.querySelectorAll("[data-count]");
    if (!numbers.length) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) return;

    // Zero the numbers before first paint so they read "not counted yet"
    // instead of flashing the final value and rewinding.
    numbers.forEach(function (node) {
      var suffix = node.getAttribute("data-suffix") || "";
      node.textContent = "0" + suffix;
    });

    function animate(node) {
      var target = parseInt(node.getAttribute("data-count"), 10);
      var suffix = node.getAttribute("data-suffix") || "";
      if (isNaN(target)) return;
      var duration = 1400;
      var start = null;

      function frame(now) {
        if (start === null) start = now;
        var progress = Math.min((now - start) / duration, 1);
        // easeOutExpo — fast start, gentle landing.
        var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        var value = Math.round(target * eased);
        node.textContent = value.toLocaleString("en-IN") + suffix;
        if (progress < 1) window.requestAnimationFrame(frame);
      }

      window.requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    numbers.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Interactive India map                                                   */
  /* ---------------------------------------------------------------------- */

  var mapApi = null; // set by initMap; used by locateOnMap and the map list

  /** Fly to an event's marker on the map, scrolling the map into view first. */
  function locateOnMap(event, trigger) {
    if (!mapApi || !event.coords) {
      // Map unavailable: fall back to the full story dialog.
      openModal(event, trigger || null);
      return;
    }
    var host = document.getElementById("india-map");
    host.scrollIntoView({
      behavior: reducedMotion() ? "auto" : "smooth",
      block: "center",
    });
    window.setTimeout(function () {
      mapApi.select(event, true);
    }, reducedMotion() ? 0 : 450);
  }

  function initMap() {
    var host = document.getElementById("india-map");
    if (!host || typeof NEORONS_INDIA_MAP === "undefined") return;

    var svgNS = "http://www.w3.org/2000/svg";
    var vbParts = NEORONS_INDIA_MAP.viewBox.split(/\s+/).map(Number);
    var full = { x: vbParts[0], y: vbParts[1], w: vbParts[2], h: vbParts[3] };
    var bounds = NEORONS_INDIA_MAP.bounds;

    function project(lat, lon) {
      return {
        x: full.x + ((lon - bounds.west) / (bounds.east - bounds.west)) * full.w,
        y: full.y + ((bounds.north - lat) / (bounds.north - bounds.south)) * full.h,
      };
    }

    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", NEORONS_INDIA_MAP.viewBox);
    svg.setAttribute("class", "india-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Map of India showing where Neorons events took place");

    var outline = document.createElementNS(svgNS, "g");
    outline.setAttribute("class", "map-outline");
    NEORONS_INDIA_MAP.paths.forEach(function (d) {
      var path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      outline.appendChild(path);
    });
    svg.appendChild(outline);

    // Markers
    var markerLayer = document.createElementNS(svgNS, "g");
    var markerFor = {};
    var dotRadius = full.w * 0.011;
    var placed = NEORONS_EVENTS.filter(function (event) {
      return event.coords;
    });
    placed.forEach(function (event, i) {
      var p = project(event.coords.lat, event.coords.lon);
      var g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "map-marker");
      g.setAttribute("transform", "translate(" + p.x + " " + p.y + ")");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute(
        "aria-label",
        event.title + ", " + event.district + " district, " + event.state
      );
      g.style.setProperty("--marker-delay", i * 90 + "ms");

      var pulse = document.createElementNS(svgNS, "circle");
      pulse.setAttribute("class", "marker-pulse");
      pulse.setAttribute("r", dotRadius);
      g.appendChild(pulse);

      var dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("class", "marker-dot");
      dot.setAttribute("r", dotRadius);
      g.appendChild(dot);

      g.addEventListener("click", function (clickEvent) {
        clickEvent.stopPropagation();
        select(event, true);
      });
      g.addEventListener("keydown", function (keyEvent) {
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          select(event, true);
        }
      });

      markerFor[event.id] = g;
      markerLayer.appendChild(g);
    });
    svg.appendChild(markerLayer);
    host.appendChild(svg);

    // Zoom controls
    var controls = el("div", "map-controls");
    [
      { label: "+", title: "Zoom in", fn: function () { zoomBy(0.6); } },
      { label: "−", title: "Zoom out", fn: function () { zoomBy(1 / 0.6); } },
      { label: "⌂", title: "Reset view", fn: reset },
    ].forEach(function (item) {
      var btn = el("button", "map-btn", item.label);
      btn.type = "button";
      btn.setAttribute("aria-label", item.title);
      btn.addEventListener("click", item.fn);
      controls.appendChild(btn);
    });
    host.appendChild(controls);

    // Popover (docked info card)
    var popover = el("aside", "map-popover");
    popover.setAttribute("aria-live", "polite");
    host.appendChild(popover);

    function hidePopover() {
      popover.classList.remove("is-open");
      Object.keys(markerFor).forEach(function (id) {
        markerFor[id].classList.remove("is-active");
      });
    }

    function showPopover(event) {
      var pillar = NEORONS_PILLARS[event.pillar] || { label: "" };
      popover.innerHTML = "";

      var close = el("button", "popover-close", "×");
      close.type = "button";
      close.setAttribute("aria-label", "Close location details");
      close.addEventListener("click", hidePopover);
      popover.appendChild(close);

      popover.appendChild(el("p", "event-tag", pillar.label));
      popover.appendChild(el("h3", null, event.title));
      popover.appendChild(
        el("p", "popover-meta", event.venue + " · " + (event.dates || event.date))
      );
      popover.appendChild(el("p", "popover-blurb", event.blurb));

      var actions = el("div", "popover-actions");
      var read = el("button", "popover-read", "Read the full story →");
      read.type = "button";
      read.addEventListener("click", function () {
        openModal(event, read);
      });
      actions.appendChild(read);
      popover.appendChild(actions);

      popover.classList.add("is-open");
    }

    // ViewBox state + animated fly-to
    var view = { x: full.x, y: full.y, w: full.w, h: full.h };
    var flightToken = 0;

    function applyView() {
      svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
    }

    function clampView(v) {
      var minW = full.w * 0.08;
      v.w = Math.max(minW, Math.min(v.w, full.w));
      v.h = v.w * (full.h / full.w);
      var slack = 0.15;
      v.x = Math.max(full.x - full.w * slack, Math.min(v.x, full.x + full.w * (1 + slack) - v.w));
      v.y = Math.max(full.y - full.h * slack, Math.min(v.y, full.y + full.h * (1 + slack) - v.h));
      return v;
    }

    function flyTo(target, duration) {
      target = clampView(target);
      flightToken += 1;
      var token = flightToken;
      if (reducedMotion() || !duration) {
        view = target;
        applyView();
        return;
      }
      var from = { x: view.x, y: view.y, w: view.w, h: view.h };
      var start = null;
      var started = false;
      function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
      function frame(now) {
        if (token !== flightToken) return;
        started = true;
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        var k = ease(t);
        view = {
          x: from.x + (target.x - from.x) * k,
          y: from.y + (target.y - from.y) * k,
          w: from.w + (target.w - from.w) * k,
          h: from.h + (target.h - from.h) * k,
        };
        applyView();
        if (t < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
      // rAF can be throttled in embedded webviews: land instantly rather
      // than not at all.
      window.setTimeout(function () {
        if (!started && token === flightToken) {
          view = target;
          applyView();
        }
      }, 150);
    }

    function zoomBy(factor, cx, cy) {
      var w = view.w * factor;
      var h = view.h * factor;
      var fx = cx === undefined ? view.x + view.w / 2 : cx;
      var fy = cy === undefined ? view.y + view.h / 2 : cy;
      flyTo(
        {
          x: fx - (fx - view.x) * (w / view.w) * (factor === 1 ? 1 : 1),
          y: fy - (fy - view.y) * (h / view.h),
          w: w,
          h: h,
        },
        420
      );
    }

    function reset() {
      hidePopover();
      flyTo({ x: full.x, y: full.y, w: full.w, h: full.h }, 650);
    }

    function select(event, fly) {
      hidePopover();
      var marker = markerFor[event.id];
      if (marker) marker.classList.add("is-active");
      showPopover(event);
      if (fly && event.coords) {
        var p = project(event.coords.lat, event.coords.lon);
        var w = full.w * 0.24;
        var h = w * (full.h / full.w);
        flyTo({ x: p.x - w / 2, y: p.y - h * 0.45, w: w, h: h }, 850);
      }
    }

    // Drag to pan
    var pan = null;
    svg.addEventListener("pointerdown", function (downEvent) {
      if (downEvent.target.closest && downEvent.target.closest(".map-marker")) return;
      pan = {
        px: downEvent.clientX,
        py: downEvent.clientY,
        vx: view.x,
        vy: view.y,
        moved: false,
      };
      svg.classList.add("is-panning");
      if (svg.setPointerCapture) svg.setPointerCapture(downEvent.pointerId);
    });
    svg.addEventListener("pointermove", function (moveEvent) {
      if (!pan) return;
      var rect = svg.getBoundingClientRect();
      var dx = ((moveEvent.clientX - pan.px) / rect.width) * view.w;
      var dy = ((moveEvent.clientY - pan.py) / rect.height) * view.h;
      if (Math.abs(moveEvent.clientX - pan.px) + Math.abs(moveEvent.clientY - pan.py) > 4) {
        pan.moved = true;
      }
      flightToken += 1; // cancel any active flight
      view = clampView({ x: pan.vx - dx, y: pan.vy - dy, w: view.w, h: view.h });
      applyView();
    });
    function endPan(upEvent) {
      if (!pan) return;
      var moved = pan.moved;
      pan = null;
      svg.classList.remove("is-panning");
      // A clean background click (no drag) dismisses the popover.
      if (!moved && upEvent.type === "pointerup") hidePopover();
    }
    svg.addEventListener("pointerup", endPan);
    svg.addEventListener("pointercancel", endPan);

    // Double-click zooms toward the pointer.
    svg.addEventListener("dblclick", function (dblEvent) {
      var rect = svg.getBoundingClientRect();
      var cx = view.x + ((dblEvent.clientX - rect.left) / rect.width) * view.w;
      var cy = view.y + ((dblEvent.clientY - rect.top) / rect.height) * view.h;
      zoomBy(0.5, cx, cy);
    });

    // Draw-on-scroll: the outline traces itself, then markers pop in.
    function startDraw() {
      if (reducedMotion()) {
        host.classList.add("is-drawn", "markers-live");
        return;
      }
      var paths = outline.querySelectorAll("path");
      paths.forEach(function (path) {
        var len = path.getTotalLength();
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
      });
      host.classList.add("is-drawing");
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          host.classList.add("is-drawn");
        });
      });
      window.setTimeout(function () {
        host.classList.add("markers-live");
      }, 1300);
      // Fallback for rAF-throttled contexts.
      window.setTimeout(function () {
        host.classList.add("is-drawn", "markers-live");
      }, 2600);
    }

    if ("IntersectionObserver" in window && !reducedMotion()) {
      var drawObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              startDraw();
              drawObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      drawObserver.observe(host);
    } else {
      startDraw();
    }

    mapApi = { select: select, reset: reset };
  }

  /** Location list beside the map; each entry flies to its marker. */
  function renderMapList() {
    var list = document.getElementById("map-list");
    if (!list) return;
    NEORONS_EVENTS.filter(function (event) {
      return event.coords;
    }).forEach(function (event) {
      var item = el("li");
      var btn = el("button", "map-list-btn");
      btn.type = "button";
      btn.appendChild(el("span", "map-list-title", event.title));
      btn.appendChild(
        el(
          "span",
          "map-list-place",
          event.district + " district, " + event.state + " · " + (event.dates || event.date)
        )
      );
      btn.addEventListener("click", function () {
        if (mapApi) {
          mapApi.select(event, true);
        } else {
          openModal(event, btn);
        }
      });
      item.appendChild(btn);
      list.appendChild(item);
    });
  }

  /** Map attribution alongside the photo credits. */
  function renderMapCredit() {
    var target = document.getElementById("photo-credits");
    if (!target || typeof NEORONS_INDIA_MAP === "undefined") return;
    var credit = NEORONS_INDIA_MAP.credit;
    if (!credit || !credit.creator) return;
    if (target.textContent) target.appendChild(document.createTextNode(" · "));
    target.appendChild(document.createTextNode("Map: "));
    var text = credit.creator + " (" + credit.license + ")";
    if (credit.url) {
      var link = el("a", null, text);
      link.href = credit.url;
      link.target = "_blank";
      link.rel = "noopener";
      target.appendChild(link);
    } else {
      target.appendChild(document.createTextNode(text));
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Photo credits (footer)                                                  */
  /* ---------------------------------------------------------------------- */

  function renderPhotoCredits() {
    var target = document.getElementById("photo-credits");
    if (!target) return;
    var credits = [];
    if (typeof NEORONS_HERO_CREDIT !== "undefined" && NEORONS_HERO_CREDIT && NEORONS_HERO_CREDIT.creator) {
      credits.push(NEORONS_HERO_CREDIT);
    }
    NEORONS_EVENTS.forEach(function (event) {
      if (event.credit && event.credit.creator) credits.push(event.credit);
    });
    if (!credits.length) return;
    var seen = {};
    target.appendChild(document.createTextNode("Photography: "));
    var first = true;
    credits.forEach(function (credit) {
      var key = credit.creator + "|" + credit.license;
      if (seen[key]) return;
      seen[key] = true;
      if (!first) target.appendChild(document.createTextNode(" · "));
      first = false;
      var text = credit.creator + " (" + credit.license + ")";
      if (credit.url) {
        var link = el("a", null, text);
        link.href = credit.url;
        link.target = "_blank";
        link.rel = "noopener";
        target.appendChild(link);
      } else {
        target.appendChild(document.createTextNode(text));
      }
    });
  }

  function injectStructuredData() {
    // Organization
    var org = {
      "@context": "https://schema.org",
      "@type": "NGO",
      "name": "Neorons",
      "url": window.location.origin,
      "description": "A social-impact organization advancing science, technology, and inclusion for young people across India.",
      "foundingDate": "2025",
      "areaServed": { "@type": "Country", "name": "India" },
    };
    var orgScript = document.createElement("script");
    orgScript.type = "application/ld+json";
    orgScript.textContent = JSON.stringify(org);
    document.head.appendChild(orgScript);

    // Events
    var events = NEORONS_EVENTS.filter(function (e) { return e.status !== "upcoming"; }).map(function (e) {
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": e.title,
        "description": e.blurb,
        "startDate": e.date,
        "location": {
          "@type": "Place",
          "name": e.venue,
          "address": { "@type": "PostalAddress", "addressLocality": e.district, "addressRegion": e.state, "addressCountry": "IN" },
        },
        "organizer": { "@type": "Organization", "name": "Neorons" },
      };
    });
    var eventsScript = document.createElement("script");
    eventsScript.type = "application/ld+json";
    eventsScript.textContent = JSON.stringify(events);
    document.head.appendChild(eventsScript);
  }

  /* ---------------------------------------------------------------------- */

  // Hero entrance + Ken Burns settle. Scheduled FIRST so no later failure can
  // leave the hero hidden. Double-rAF waits for the first frame; the timeout
  // covers environments that throttle rAF (background tabs, embedded webviews).
  function markLoaded() {
    document.body.classList.add("is-loaded");
  }
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(markLoaded);
  });
  window.setTimeout(markLoaded, 600);

  // Data-dependent rendering degrades to an empty grid — never a hidden page.
  // Each renderer is independent — one failure must not block the others.
  try { renderEvents(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderEvents failed", err);
  }
  try { renderDistricts(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderDistricts failed", err);
  }
  try { renderPhotoCredits(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderPhotoCredits failed", err);
  }
  try { initMap(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: initMap failed", err);
  }
  try { renderMapList(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderMapList failed", err);
  }
  try { renderMapCredit(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderMapCredit failed", err);
  }
  try { renderTeam(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderTeam failed", err);
  }
  try { renderTestimonials(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderTestimonials failed", err);
  }
  try { renderTimeline(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: renderTimeline failed", err);
  }
  try { injectStructuredData(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: structured data failed", err);
  }

  // Interactive wiring — each must run independently so one failure cannot
  // take down navigation or scroll on subpages.
  try { initFilters(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: initFilters failed", err);
  }
  try { initModal(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: initModal failed", err);
  }
  try { initNav(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: initNav failed", err);
  }
  try { initHeaderScroll(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: initHeaderScroll failed", err);
  }
  try { initScrollEffects(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: initScrollEffects failed", err);
  }
  try { initScrollSpy(); } catch (err) {
    if (window.console && console.error) console.error("Neorons: initScrollSpy failed", err);
  }

  initReveal();
  initCountUp();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
