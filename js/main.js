/* Progressive enhancements: the website remains readable without JavaScript. */
(() => {
  "use strict";
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  const closeMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };
  if (toggle && menu) {
    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-nav")) closeMenu();
    });
    window
      .matchMedia("(min-width: 961px)")
      .addEventListener("change", closeMenu);
  }
  // Decorative motion has a single control and follows the system preference.
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const control = document.querySelector(".motion-toggle");
  const hero = document.querySelector(".home-hero");
  const movingPanels = [...document.querySelectorAll(".feature-panel")];
  let paused = false;
  try {
    paused = localStorage.getItem("neorons-motion-paused") === "true";
  } catch {
    /* Storage is optional. */
  }
  const motionAllowed = () => !paused && !preference.matches;
  const resetMotion = () => {
    if (hero) {
      hero.style.setProperty("--hero-progress", "0");
      hero.style.setProperty("--pointer-x", "0");
      hero.style.setProperty("--pointer-y", "0");
    }
    movingPanels.forEach((panel) =>
      panel.style.setProperty("--panel-progress", "0"),
    );
  };
  const syncMotion = () => {
    document.body.classList.toggle("motion-paused", !motionAllowed());
    document.documentElement.style.scrollBehavior = motionAllowed()
      ? ""
      : "auto";
    if (control) {
      control.hidden = preference.matches;
      control.setAttribute("aria-pressed", String(paused));
      control.querySelector(".motion-label").textContent = paused
        ? "Resume motion"
        : "Pause motion";
      control.querySelector(".motion-icon").textContent = paused ? "▷" : "Ⅱ";
    }
    if (!motionAllowed()) resetMotion();
  };
  syncMotion();
  preference.addEventListener("change", syncMotion);
  control?.addEventListener("click", () => {
    paused = !paused;
    try {
      localStorage.setItem("neorons-motion-paused", String(paused));
    } catch {
      /* Storage is optional. */
    }
    syncMotion();
  });
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("awaiting-reveal");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      revealObserver.observe(element);
      if (
        element.getBoundingClientRect().top > window.innerHeight &&
        motionAllowed()
      ) {
        element.classList.add("awaiting-reveal");
      }
    });
    const activityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.classList.toggle("is-in-view", entry.isIntersecting),
        );
      },
      { threshold: 0 },
    );
    document
      .querySelectorAll(".phone-stage, .join-section")
      .forEach((element) => activityObserver.observe(element));
    document.body.classList.add("motion-ready");
  }
  document
    .querySelectorAll(".voice-wave i")
    .forEach((bar, index) => bar.style.setProperty("--i", index));
  let framePending = false;
  const updateScroll = () => {
    framePending = false;
    if (!motionAllowed()) return;
    if (hero) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0)
        hero.style.setProperty(
          "--hero-progress",
          String(Math.min(1, Math.max(0, -rect.top / rect.height))),
        );
    }
    movingPanels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress =
          (window.innerHeight / 2 - (rect.top + rect.height / 2)) /
          window.innerHeight;
        panel.style.setProperty("--panel-progress", String(progress));
      }
    });
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!framePending && motionAllowed()) {
        framePending = true;
        window.requestAnimationFrame(updateScroll);
      }
    },
    { passive: true },
  );
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (min-width: 961px)",
  );
  hero?.addEventListener(
    "pointermove",
    (event) => {
      if (!motionAllowed() || !finePointer.matches) return;
      const bounds = hero.getBoundingClientRect();
      hero.style.setProperty(
        "--pointer-x",
        ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3),
      );
      hero.style.setProperty(
        "--pointer-y",
        ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3),
      );
    },
    { passive: true },
  );
  hero?.addEventListener("pointerleave", resetMotion);
  if (document.body.dataset.page === "index") {
    const routeLegacyHash = () => {
      const hash = window.location.hash;
      if (/^#event-[a-z0-9-]+$/.test(hash))
        window.location.replace(`india.html${hash}`);
      else if (hash === "#events" || hash === "#reach")
        window.location.replace("india.html");
      else if (hash === "#mission") window.location.replace("about.html");
      else if (hash === "#programmes") window.location.replace("programs.html");
      else if (hash === "#impact") window.location.replace("impact.html");
      else if (hash === "#people") window.location.replace("about.html#people");
      else if (hash === "#contact") window.location.replace("contact.html");
    };
    routeLegacyHash();
    window.addEventListener("hashchange", routeLegacyHash);
  }
})();
