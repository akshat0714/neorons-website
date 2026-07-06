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
    meta.appendChild(document.createTextNode(" · " + event.date));
    text.appendChild(meta);

    text.appendChild(el("p", "event-blurb", event.blurb));

    var more = el("span", "event-more");
    more.setAttribute("aria-hidden", "true");
    more.appendChild(document.createTextNode("Read more "));
    more.appendChild(el("span", "arrow", "→"));
    text.appendChild(more);

    if (featured) card.appendChild(text);

    card.addEventListener("click", function () {
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
    meta.textContent = event.venue + "  ·  " + event.date;
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
    waBtn.href = "https://wa.me/?text=" + encodeURIComponent(event.title + " \u2014 " + eventUrl);
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
        });
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

  // Interactive wiring; a failure here must not block the reveal system below.
  try {
    initFilters();
    initModal();
    initNav();
    initHeaderScroll();
  } catch (err) {
    if (window.console && console.error) {
      console.error("Neorons: interactive init failed", err);
    }
  }

  initReveal();
  initCountUp();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
