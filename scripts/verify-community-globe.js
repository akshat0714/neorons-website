/* Run with: node scripts/verify-community-globe.js
 * Exercises the production globe and real D3 geometry in a small DOM harness.
 * Browser visual review remains necessary; this checks interaction state only.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const repo = path.resolve(__dirname, "..");

function harness(options = {}) {
  let sequence = 0;
  let now = 0;
  let intersectionCallback;
  let resizeCallback;
  let mutationCallback;
  let draws = 0;
  const frameQueue = new Map();
  const windowListeners = {};
  const preference = {
    matches: false,
    addEventListener(type, listener) { this.listener = listener; }
  };
  class Element {
    constructor() {
      this.hidden = false;
      this.textContent = "";
      this.disabled = false;
      this.attrs = {};
      this.dataset = {};
      this.listeners = {};
      this.properties = {};
      this.rect = { width: 600, height: 600, top: 0, bottom: 600, left: 0 };
      this.style = { setProperty: (key, value) => { this.properties[key] = value; } };
      const classes = new Set();
      this.classList = {
        add: name => classes.add(name),
        remove: name => classes.delete(name),
        contains: name => classes.has(name),
        toggle(name, value) {
          if (value === undefined) value = !classes.has(name);
          if (value) classes.add(name); else classes.delete(name);
          return value;
        }
      };
    }
    setAttribute(name, value) { this.attrs[name] = value; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    focus() { this.focused = true; }
    click() { if (!this.disabled) this.listeners.click?.({}); }
    getBoundingClientRect() { return this.rect; }
  }
  const names = ["root", "canvas", "wrap", "fallback", "status", "tools", "play", "reduce", "prev", "next", "reset", "zoom", "label", "coords", "body", "panelGroup"];
  const elements = Object.fromEntries(names.map(name => [name, new Element()]));
  const { root, canvas, wrap, fallback, status, tools, play, reduce, prev, next, reset, zoom, label, coords, body, panelGroup } = elements;
  canvas.hidden = true;
  tools.hidden = true;
  const ids = ["inuit", "aboriginal", "maori", "sami"];
  const tabs = ids.map(id => { const tab = new Element(); tab.dataset.region = id; return tab; });
  const panels = ids.map(() => new Element());
  const noop = () => {};
  const context = new Proxy({
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
    measureText: () => ({ width: 40 }),
    clearRect: () => { draws++; }
  }, { get: (target, key) => key in target ? target[key] : noop });
  canvas.getContext = () => options.noCanvas ? null : context;
  canvas.parentElement = wrap;
  canvas.setPointerCapture = noop;
  canvas.hasPointerCapture = () => false;
  canvas.releasePointerCapture = noop;
  const selectors = {
    ".atlas-canvas-wrap": wrap,
    ".atlas-panels": panelGroup,
    "[data-atlas-tour]": play,
    "[data-atlas-motion]": reduce,
    "[data-atlas-zoom]": zoom,
    "[data-atlas-status]": status,
    ".atlas-current-label": label,
    ".atlas-coordinate": coords,
    "[data-atlas-prev]": prev,
    "[data-atlas-next]": next,
    "[data-atlas-reset]": reset,
    ".atlas-fallback": fallback
  };
  root.querySelector = selector => selectors[selector] || null;
  root.querySelectorAll = selector => selector === "[data-region]" ? tabs : [tools, play, reduce, prev, next, reset, zoom];
  const document = {
    body, hidden: false,
    querySelector: selector => selector === "[data-atlas]" ? root : null,
    getElementById: id => id === "community-globe" ? canvas : panels[ids.indexOf(id.replace("region-", ""))],
    addEventListener(type, listener) { this[type] = listener; }
  };
  const environment = {
    console, document,
    MutationObserver: class { constructor(callback) { mutationCallback = callback; } observe() {} },
    requestAnimationFrame: callback => { frameQueue.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: id => frameQueue.delete(id)
  };
  if (!options.noResizeObserver) environment.ResizeObserver = class { constructor(callback) { resizeCallback = callback; } observe() {} };
  if (!options.noIntersectionObserver) environment.IntersectionObserver = class { constructor(callback) { intersectionCallback = callback; } observe() {} };
  environment.window = environment;
  environment.innerHeight = 800;
  environment.devicePixelRatio = 2;
  environment.addEventListener = (type, callback) => { (windowListeners[type] ||= []).push(callback); };
  environment.matchMedia = () => preference;
  vm.createContext(environment);
  const files = ["vendor/geo/d3-array.min.js", "vendor/geo/d3-geo.min.js", "js/world-land.js", "js/communities-data.js"];
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(repo, file), "utf8"), environment, { filename: file });
  if (options.noGeo) delete environment.d3;
  if (options.noLand) delete environment.NeoronsWorldLand;
  vm.runInContext(fs.readFileSync(path.join(repo, "js/community-globe.js"), "utf8"), environment, { filename: "js/community-globe.js" });
  function step(ms = 80) {
    now += ms;
    const callbacks = [...frameQueue.values()];
    frameQueue.clear();
    callbacks.forEach(callback => callback(now));
    assert(frameQueue.size <= 1, "Only one animation loop may be queued, including scene changes");
  }
  function frames(count) { for (let index = 0; index < count; index++) step(); }
  function windowEvent(type) { windowListeners[type]?.forEach(callback => callback()); }
  return {
    ...elements, tabs, panels, preference, document, environment, step, frames,
    visible: value => intersectionCallback?.([{ isIntersecting: value }]),
    resize(width, height, dpr = 2) {
      wrap.rect.width = width; wrap.rect.height = height;
      canvas.rect.width = width; canvas.rect.height = height;
      environment.devicePixelRatio = dpr;
      if (resizeCallback) resizeCallback(); else windowEvent("resize");
    },
    pageHidden(value) { document.hidden = value; document.visibilitychange(); },
    globalMotion(value) {
      body.classList.toggle("motion-paused", value);
      mutationCallback?.();
    },
    systemMotion(value) { preference.matches = value; preference.listener?.(); },
    windowEvent,
    queue: () => frameQueue.size,
    draws: () => draws
  };
}

const h = harness();
assert(h.root.classList.contains("atlas-ready"));
assert.equal(h.panels.filter(panel => !panel.hidden).length, 1);
assert.equal(h.root.dataset.activeRegion, "inuit");
assert.equal(h.canvas.hidden, false);
assert.equal(h.fallback.hidden, true);
assert.equal(h.queue(), 0, "Offscreen initialization does not start a frame loop");
h.visible(true);
assert.equal(h.queue(), 1);
h.tabs[2].click();
assert.equal(h.panels[2].hidden, false);
assert.equal(h.tabs[2].attrs["aria-selected"], "true");
assert.equal(h.tabs.filter(tab => tab.attrs.tabindex === "0").length, 1);
h.frames(30);

// Tour transitions, completion and repeated starts must never fork RAF loops.
h.play.click();
assert.equal(h.root.dataset.activeRegion, "inuit");
h.frames(155);
assert.equal(h.root.dataset.activeRegion, "aboriginal");
const progressBeforeResize = h.root.properties["--tour-progress"];
h.resize(390, 330, 3);
assert.equal(h.canvas.width, 780, "DPR is capped at 2");
assert.equal(h.canvas.height, 660);
assert.equal(h.root.properties["--tour-progress"], progressBeforeResize);
assert.equal(h.play.textContent, "Pause journey");
assert.equal(h.queue(), 1);
h.play.click();
assert.equal(h.play.textContent, "Resume journey");
h.step();
assert.equal(h.queue(), 0);
assert(h.root.classList.contains("atlas-motion-off"));
h.play.click();
h.frames(460);
assert.equal(h.play.textContent, "Replay journey");
assert.equal(h.root.dataset.activeRegion, "sami");
h.step();
assert.equal(h.queue(), 0);
assert.equal(Number(h.root.properties["--tour-progress"]), 1);

// Leaving the viewport or browser tab pauses the journey; it never auto-resumes.
h.play.click();
h.step();
h.visible(false);
assert.equal(h.queue(), 0);
assert.equal(h.play.textContent, "Resume journey");
assert(h.root.classList.contains("atlas-motion-off"));
h.visible(true);
assert.equal(h.play.textContent, "Resume journey");
assert.equal(h.queue(), 1);
h.play.click();
h.pageHidden(true);
assert.equal(h.queue(), 0);
assert.equal(h.play.textContent, "Resume journey");
h.pageHidden(false);
assert.equal(h.play.textContent, "Resume journey");
assert.equal(h.queue(), 1);

// System, site and local preferences compose without a stuck disabled control.
h.reduce.click();
assert(h.play.disabled);
assert.equal(h.queue(), 0);
h.tabs[1].click();
assert.equal(h.panels[1].hidden, false);
assert.equal(h.queue(), 0, "Reduced motion still permits immediate scene selection");
h.globalMotion(true);
assert(h.reduce.disabled);
h.globalMotion(false);
assert.equal(h.reduce.disabled, false);
assert(h.play.disabled, "Local reduction persists when a global pause is removed");
assert.equal(h.reduce.textContent, "Enable motion");
h.reduce.click();
assert.equal(h.play.disabled, false);
h.play.click();
h.globalMotion(true);
assert(h.play.disabled);
assert(h.reduce.disabled);
assert.equal(h.queue(), 0);
h.systemMotion(true);
h.globalMotion(false);
assert(h.play.disabled, "System reduction remains in force after global resume");
h.systemMotion(false);
assert.equal(h.play.disabled, false, "Clearing inherited preferences re-enables the journey");
assert.equal(h.reduce.disabled, false);
assert.equal(h.reduce.textContent, "Reduce motion");
assert.equal(h.play.textContent, "Resume journey", "Resuming site motion does not restart the tour");

// Keyboard, next/previous and zoom controls expose the full pointer experience.
h.tabs[0].listeners.keydown({ key: "ArrowLeft", preventDefault() {} });
assert.equal(h.root.dataset.activeRegion, "sami");
assert(h.tabs[3].focused);
h.next.click();
assert.equal(h.root.dataset.activeRegion, "inuit");
h.prev.click();
assert.equal(h.root.dataset.activeRegion, "sami");
h.zoom.click();
assert.equal(h.zoom.textContent, "Pull back");
h.frames(25);
h.zoom.click();
assert.equal(h.zoom.textContent, "Closer look");
h.reset.click();
assert(h.root.classList.contains("atlas-overview"));
h.frames(25);

// Vertical touch gestures are left to the browser's normal page scrolling.
let prevented = false;
h.canvas.listeners.pointerdown({ button: 0, pointerId: 1, pointerType: "touch", clientX: 120, clientY: 120 });
h.canvas.listeners.pointermove({ pointerId: 1, clientX: 122, clientY: 150, preventDefault() { prevented = true; } });
assert.equal(prevented, false);
assert.equal(h.root.classList.contains("atlas-dragging"), false);
h.canvas.listeners.pointercancel({ type: "pointercancel", pointerId: 1 });
h.zoom.click();
h.frames(25);
h.canvas.listeners.pointerdown({ button: 0, pointerId: 2, pointerType: "touch", clientX: 120, clientY: 120 });
h.canvas.listeners.pointermove({ pointerId: 2, clientX: 160, clientY: 122, preventDefault() { prevented = true; } });
assert(prevented);
assert(h.root.classList.contains("atlas-dragging"));
assert.equal(h.zoom.textContent, "Pull back", "Dragging a zoomed globe preserves the zoom control state");
h.canvas.listeners.pointerup({ type: "pointerup", pointerId: 2, clientX: 160, clientY: 122 });
assert.equal(h.root.classList.contains("atlas-dragging"), false);

// A source link focused just before a scene ends must never be hidden by the timer.
const reading = harness();
reading.visible(true);
reading.play.click();
reading.frames(145);
assert.equal(reading.root.dataset.activeRegion, "inuit");
reading.panelGroup.listeners.focusin({ target: { tagName: "A" } });
assert.equal(reading.play.textContent, "Resume journey");
assert.equal(reading.queue(), 0);
reading.frames(200);
assert.equal(reading.root.dataset.activeRegion, "inuit", "Focused story remains selected beyond its original deadline");
assert.equal(reading.panels[0].hidden, false);
reading.play.click();
reading.frames(10);
assert.equal(reading.root.dataset.activeRegion, "aboriginal", "Explicit resume continues the paused journey");
for (const event of ["pointerenter", "pointerdown", "wheel"]) {
  reading.panelGroup.listeners[event]({});
  assert.equal(reading.play.textContent, "Resume journey");
  assert.equal(reading.queue(), 0);
  reading.frames(155);
  assert.equal(reading.root.dataset.activeRegion, "aboriginal", "Reading interaction pauses scene replacement");
  reading.play.click();
}

for (const option of ["noGeo", "noCanvas", "noLand"]) {
  const fallback = harness({ [option]: true });
  assert.equal(fallback.root.classList.contains("atlas-ready"), false);
  assert.equal(fallback.panels.filter(panel => !panel.hidden).length, 4);
  assert.equal(fallback.canvas.hidden, true);
  assert.equal(fallback.fallback.hidden, false);
  assert.equal(fallback.queue(), 0);
}
const legacy = harness({ noResizeObserver: true, noIntersectionObserver: true });
assert.equal(legacy.queue(), 1);
legacy.resize(320, 330);
assert.equal(legacy.canvas.width, 640);
legacy.root.rect.top = 900;
legacy.root.rect.bottom = 1500;
legacy.windowEvent("scroll");
assert.equal(legacy.queue(), 0);

console.log("PASS: single RAF loop; complete tour/replay; resize and DPR cap; viewport/tab suspension; combined motion preferences; keyboard/step/zoom controls; touch scrolling; focus and reading pause; geographic/canvas and observer fallbacks.");
