/* Accessible, progressively enhanced exploration of access design priorities. */
(function () {
  'use strict';
  var root = document.querySelector('[data-access]');
  if (!root) return;
  var tabs = Array.from(root.querySelectorAll('[data-access-tab]'));
  var panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
  function select(index, focus) {
    tabs.forEach(function (tab, i) {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach(function (panel, i) {
      panel.hidden = i !== index;
      panel.classList.toggle('access-active', i === index);
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(index, false); });
    tab.addEventListener('keydown', function (event) {
      var next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });
  select(0, false);
  root.classList.add("access-ready");
  root.querySelector(".access-menu").hidden = false;
})();
