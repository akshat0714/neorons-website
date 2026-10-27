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
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const body = `Name: ${fields.get("name") || ""}\nEmail: ${fields.get("email") || ""}\nOrganisation: ${fields.get("organization") || ""}\n\n${fields.get("message") || ""}`;
      window.location.href = `mailto:neoronsai@gmail.com?subject=${encodeURIComponent("Neorons enquiry")}&body=${encodeURIComponent(body)}`;
      const status = document.getElementById("form-status");
      if (status)
        status.textContent =
          "Your email app will open with a draft. Send it there to contact us, or email neoronsai@gmail.com directly.";
    });
  }
  if (document.body.dataset.page === "index") {
    const routeLegacyHash = () => {
      const hash = window.location.hash;
      if (/^#event-[a-z0-9-]+$/.test(hash))
        window.location.replace(`india.html${hash}`);
      else if (hash === "#events" || hash === "#reach")
        window.location.replace("india.html");
      else if (hash === "#people") window.location.replace("about.html#people");
      else if (hash === "#contact") window.location.replace("contact.html");
    };
    routeLegacyHash();
    window.addEventListener("hashchange", routeLegacyHash);
  }
})();
