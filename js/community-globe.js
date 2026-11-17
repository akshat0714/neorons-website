/* Neorons community atlas. Geographic context, never a map of service coverage. */
(function () {
  "use strict";

  var root = document.querySelector("[data-atlas]");
  var canvas = document.getElementById("community-globe");
  var geo = window.d3;
  var land = window.NeoronsWorldLand;
  var items = window.NeoronsCommunities;
  if (!root || !canvas || !geo || !geo.geoOrthographic || !land || !Array.isArray(items) || !items.length) return;
  var context;
  try { context = canvas.getContext("2d"); } catch (_) { return; }
  if (!context) return;

  items = items.filter(function (item) {
    return item && typeof item.id === "string" && typeof item.name === "string" &&
      Array.isArray(item.coordinates) && item.coordinates.length === 2 &&
      item.coordinates.every(Number.isFinite) && document.getElementById("region-" + item.id);
  });
  if (!items.length) return;

  var wrap = root.querySelector(".atlas-canvas-wrap") || canvas.parentElement;
  var tabs = Array.from(root.querySelectorAll("[data-region]"));
  var panels = items.map(function (item) { return document.getElementById("region-" + item.id); });
  var panelGroup = root.querySelector(".atlas-panels");
  var play = root.querySelector("[data-atlas-tour]");
  var reduce = root.querySelector("[data-atlas-motion]");
  var zoomButton = root.querySelector("[data-atlas-zoom]");
  var status = root.querySelector("[data-atlas-status]");
  var currentLabel = root.querySelector(".atlas-current-label");
  var coordinateLabel = root.querySelector(".atlas-coordinate");
  var preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var projection = geo.geoOrthographic().clipAngle(90).precision(0.4);
  var path = geo.geoPath(projection, context);
  var graticule = geo.geoGraticule10();
  var sphere = { type: "Sphere" };
  var rotation = [-items[0].coordinates[0], -items[0].coordinates[1], 0];
  var currentZoom = 1;
  var selected = 0;
  var overview = false;
  var closer = false;
  var localReduced = false;
  var decorativePaused = false;
  var visible = false;
  var tourActive = false;
  var tourStarted = false;
  var tourFinished = false;
  var sceneElapsed = 0;
  var sceneDuration = 12000;
  var flight = null;
  var raf = 0;
  var ticking = false;
  var lastTick = 0;
  var lastDraw = 0;
  var pulseTime = 0;
  var width = 600;
  var height = 600;
  var radius = 230;
  var cx = 300;
  var cy = 300;
  var pixelRatio = 1;
  var hitPoints = [];
  var drag = null;

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function ease(value) { return value * value * (3 - 2 * value); }
  function motionAllowed() {
    return !localReduced && !preference.matches && !document.body.classList.contains("motion-paused");
  }
  function canAnimate() { return motionAllowed() && !decorativePaused; }
  function textIfChanged(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }
  function updateControls() {
    var allowed = motionAllowed();
    root.classList.toggle("atlas-motion-off", !canAnimate() || !visible || document.hidden);
    root.classList.toggle("atlas-touring", tourActive);
    root.classList.toggle("atlas-overview", overview);
    root.classList.toggle("atlas-close", closer);
    if (play) {
      play.disabled = !allowed;
      textIfChanged(play, tourActive ? "Pause tour" : tourFinished ? "Replay tour" : tourStarted ? "Resume tour" : "Play tour");
      play.setAttribute("aria-pressed", String(tourActive));
    }
    if (reduce) {
      var inherited = preference.matches || document.body.classList.contains("motion-paused");
      reduce.disabled = inherited;
      reduce.setAttribute("aria-pressed", String(!allowed));
      textIfChanged(reduce, inherited ? "Motion reduced" : localReduced ? "Enable motion" : "Reduce motion");
    }
    if (zoomButton) textIfChanged(zoomButton, closer ? "Zoom out" : "Zoom in");
  }
  function progress() {
    root.style.setProperty("--tour-progress", String(tourFinished ? 1 : (selected + sceneElapsed / sceneDuration) / items.length));
  }
  function coordinateText(coords) {
    return Math.abs(coords[1]).toFixed(1) + "° " + (coords[1] >= 0 ? "N" : "S") + "  /  " +
      Math.abs(coords[0]).toFixed(1) + "° " + (coords[0] >= 0 ? "E" : "W");
  }
  function updateSelection(announce) {
    items.forEach(function (item, index) {
      panels[index].hidden = index !== selected;
      panels[index].classList.toggle("is-active", index === selected);
      panels[index].classList.toggle("atlas-enter", index === selected);
    });
    tabs.forEach(function (tab) {
      var active = tab.dataset.region === items[selected].id;
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
      tab.classList.toggle("is-active", active);
    });
    root.dataset.activeRegion = items[selected].id;
    textIfChanged(currentLabel, items[selected].name);
    textIfChanged(coordinateLabel, coordinateText(items[selected].coordinates));
    canvas.setAttribute("aria-label", "Interactive globe. Selected context: " + items[selected].name + ". Use the community tabs to read language and cultural context.");
    if (announce) textIfChanged(status, items[selected].name + ". Language and cultural context selected.");
    progress();
  }
  function stopTour(manualPause) {
    tourActive = false;
    if (manualPause) {
      decorativePaused = true;
      if (flight) {
        rotation = [-flight.target[0], -flight.target[1], 0];
        currentZoom = flight.zoom;
        flight = null;
      }
    }
    updateControls();
  }
  function resetTour() {
    decorativePaused = false;
    tourActive = false;
    tourStarted = false;
    tourFinished = false;
    sceneElapsed = 0;
    updateControls();
  }
  function flyTo(coordinates, zoom) {
    var start = [-rotation[0], -rotation[1]];
    if (!canAnimate() || !visible) {
      rotation = [-coordinates[0], -coordinates[1], 0];
      currentZoom = zoom;
      flight = null;
      draw();
      return;
    }
    flight = {
      interpolate: geo.geoInterpolate(start, coordinates),
      target: coordinates.slice(),
      fromZoom: currentZoom,
      zoom: zoom,
      elapsed: 0,
      duration: 1700
    };
    schedule();
  }
  function choose(index, fromTour) {
    if (index < 0 || index >= items.length) return;
    if (!fromTour) resetTour();
    selected = index;
    overview = false;
    closer = false;
    sceneElapsed = 0;
    updateSelection(true);
    updateControls();
    flyTo(items[selected].coordinates, 1.14);
    schedule();
  }
  function startTour() {
    if (!motionAllowed()) return;
    decorativePaused = false;
    if (!tourStarted || tourFinished) {
      selected = 0;
      sceneElapsed = 0;
      overview = false;
      closer = false;
      updateSelection(true);
      flyTo(items[selected].coordinates, 1.14);
    }
    tourStarted = true;
    tourFinished = false;
    tourActive = true;
    updateControls();
    schedule();
  }

  function circle(x, y, r) { context.beginPath(); context.arc(x, y, r, 0, Math.PI * 2); }
  function renderGeometry(object, fill, stroke, lineWidth) {
    context.beginPath(); path(object);
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.strokeStyle = stroke; context.lineWidth = lineWidth || 1; context.stroke(); }
  }
  function draw() {
    if (!width || !height) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    var r = radius * currentZoom;
    projection.translate([cx, cy]).scale(r).rotate(rotation);

    // A quiet atmospheric edge and globe shadow add depth without WebGL.
    var halo = context.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.14);
    halo.addColorStop(0, "rgba(154,201,175,.17)");
    halo.addColorStop(0.5, "rgba(97,159,138,.05)");
    halo.addColorStop(1, "rgba(97,159,138,0)");
    circle(cx, cy, r * 1.14); context.fillStyle = halo; context.fill();
    circle(cx, cy, r * 1.045); context.strokeStyle = "rgba(178,208,183,.13)"; context.lineWidth = 0.65; context.stroke();

    var sea = context.createRadialGradient(cx - r * 0.38, cy - r * 0.45, r * 0.08, cx, cy, r * 1.15);
    sea.addColorStop(0, "#407c68"); sea.addColorStop(0.48, "#28594b"); sea.addColorStop(1, "#0d2c26");
    renderGeometry(sphere, sea, "rgba(199,223,195,.45)", 0.8);
    renderGeometry(graticule, null, "rgba(185,214,189,.18)", 0.65);

    var earth = context.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    earth.addColorStop(0, "#d2dbb2"); earth.addColorStop(0.55, "#a9c29c"); earth.addColorStop(1, "#779b7d");
    renderGeometry(land, earth, "rgba(225,230,196,.55)", 0.5);
    var shade = context.createRadialGradient(cx - r * 0.4, cy - r * 0.5, r * 0.05, cx + r * 0.2, cy + r * 0.15, r * 1.18);
    shade.addColorStop(0, "rgba(9,34,28,0)"); shade.addColorStop(0.55, "rgba(9,34,28,0)");
    shade.addColorStop(0.85, "rgba(6,27,24,.25)"); shade.addColorStop(1, "rgba(4,19,17,.7)");
    renderGeometry(sphere, shade);

    hitPoints = [];
    var centre = projection.invert([cx, cy]);
    items.forEach(function (item, index) {
      if (geo.geoDistance(centre, item.coordinates) > Math.PI / 2 - 0.018) return;
      var point = projection(item.coordinates);
      if (!point || point[0] < 5 || point[0] > width - 5 || point[1] < 5 || point[1] > height - 5) return;
      var active = index === selected;
      // Marker sizes describe selection only, never a risk rate or population size.
      var wave = canAnimate() && active ? (Math.sin(pulseTime / 950) + 1) / 2 : 0;
      circle(point[0], point[1], 12 + wave * 5);
      context.strokeStyle = active ? "rgba(241,211,131," + (0.5 - wave * 0.2) + ")" : "rgba(244,226,180,.38)";
      context.lineWidth = 1; context.stroke();
      circle(point[0], point[1], 5); context.fillStyle = "#f3d58c"; context.fill();
      circle(point[0], point[1], 2); context.fillStyle = "#fff6d5"; context.fill();
      hitPoints.push({ x: point[0], y: point[1], index: index });
      if (active && !overview) {
        var shortLabels = { inuit: "NUNAVUT", aboriginal: "AUSTRALIA", maori: "AOTEAROA", sami: "SÁPMI" };
        var label = item.mapLabel || shortLabels[item.id] || item.name.toUpperCase();
        context.font = "600 10px Arial, sans-serif";
        var textWidth = context.measureText(label).width;
        var labelX = clamp(point[0] + 24, 14, width - textWidth - 27);
        var labelY = clamp(point[1] - 4, 30, height - 20);
        context.beginPath(); context.moveTo(point[0] + 10, point[1]); context.lineTo(labelX - 5, labelY - 3);
        context.strokeStyle = "rgba(243,213,140,.65)"; context.stroke();
        context.fillStyle = "rgba(13,37,31,.87)";
        context.fillRect(labelX - 7, labelY - 16, textWidth + 14, 24);
        context.fillStyle = "#fff6dc"; context.fillText(label, labelX, labelY);
      }
    });
  }
  function needsFrames() {
    return visible && !document.hidden && (Boolean(flight) || tourActive || canAnimate());
  }
  function schedule() {
    if (!raf && !ticking && needsFrames()) { lastTick = 0; raf = requestAnimationFrame(frame); }
  }
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) { lastTick = 0; return; }
    ticking = true;
    var delta = lastTick ? Math.min(now - lastTick, 80) : 0;
    lastTick = now;
    if (tourActive) {
      sceneElapsed += delta;
      if (sceneElapsed >= sceneDuration) {
        if (selected < items.length - 1) choose(selected + 1, true);
        else { tourActive = false; tourFinished = true; sceneElapsed = sceneDuration; decorativePaused = true; updateControls(); }
      }
      progress();
    }
    if (flight) {
      flight.elapsed += delta;
      var t = clamp(flight.elapsed / flight.duration, 0, 1);
      var p = flight.interpolate(ease(t));
      rotation = [-p[0], -p[1], 0];
      var pullback = Math.min(flight.fromZoom, 0.91);
      currentZoom = t < 0.4
        ? flight.fromZoom + (pullback - flight.fromZoom) * ease(t / 0.4)
        : pullback + (flight.zoom - pullback) * ease((t - 0.4) / 0.6);
      if (t === 1) { currentZoom = flight.zoom; flight = null; }
    } else if (overview && canAnimate() && !drag) {
      rotation[0] = (rotation[0] + delta * 0.0013) % 360;
    }
    if (canAnimate()) pulseTime += delta;
    if (now - lastDraw >= 30 || !needsFrames()) { draw(); lastDraw = now; }
    ticking = false;
    if (needsFrames() && !raf) raf = requestAnimationFrame(frame);
  }
  function resize() {
    var rect = wrap.getBoundingClientRect();
    if (!rect.width) return;
    width = rect.width; height = rect.height || rect.width;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio);
    radius = Math.min(width * 0.425, height * 0.415);
    cx = width / 2; cy = height / 2;
    draw(); schedule();
  }
  function syncMotion() {
    if (!motionAllowed()) {
      stopTour(false);
      if (flight) { rotation = [-flight.target[0], -flight.target[1], 0]; currentZoom = flight.zoom; flight = null; }
    }
    updateControls(); draw();
    if (needsFrames()) schedule();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  function setVisible(value) {
    visible = value;
    updateControls();
    if (!visible) {
      if (tourActive) stopTour(false);
      if (raf) cancelAnimationFrame(raf);
      raf = 0; lastTick = 0;
    } else { draw(); schedule(); }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var index = items.findIndex(function (item) { return item.id === tab.dataset.region; });
      choose(index, false);
    });
    tab.addEventListener("keydown", function (event) {
      var current = tabs.indexOf(tab), next = current;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault(); tabs[next].focus(); tabs[next].click();
    });
  });
  // Optional deep links select a community while retaining the native atlas anchor.
  document.querySelectorAll("[data-story-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      var index = items.findIndex(function (item) { return item.id === link.dataset.storyLink; });
      if (index !== -1) choose(index, false);
    });
  });
  if (play) play.addEventListener("click", function () {
    if (tourActive) { stopTour(true); draw(); }
    else startTour();
  });
  if (reduce) reduce.addEventListener("click", function () { localReduced = !localReduced; syncMotion(); });
  // Reading a community summary or its sources takes priority over the timed tour.
  // Never hide a focused link, or restart merely because the reader moves away.
  if (panelGroup) {
    var pauseForReading = function () {
      if (!tourActive) return;
      stopTour(true);
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      draw();
    };
    panelGroup.addEventListener("focusin", pauseForReading);
    panelGroup.addEventListener("pointerenter", pauseForReading);
    panelGroup.addEventListener("pointerdown", pauseForReading);
    panelGroup.addEventListener("wheel", pauseForReading, { passive: true });
  }
  var next = root.querySelector("[data-atlas-next]");
  var previous = root.querySelector("[data-atlas-prev]");
  var reset = root.querySelector("[data-atlas-reset]");
  if (next) next.addEventListener("click", function () { choose((selected + 1) % items.length, false); });
  if (previous) previous.addEventListener("click", function () { choose((selected + items.length - 1) % items.length, false); });
  if (reset) reset.addEventListener("click", function () {
    resetTour(); overview = true; closer = false; updateControls();
    textIfChanged(status, "World view. Select a community to read its language and cultural context.");
    flyTo([-35, 20], 1);
  });
  if (zoomButton) zoomButton.addEventListener("click", function () {
    resetTour(); overview = false; closer = !closer; updateControls();
    flyTo(items[selected].coordinates, closer ? 1.7 : 1.14);
  });

  canvas.style.touchAction = "pan-y";
  canvas.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, rotation: rotation.slice(), moved: false, vertical: false, touch: event.pointerType === "touch" };
  });
  canvas.addEventListener("pointermove", function (event) {
    if (!drag || drag.id !== event.pointerId) return;
    var dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (drag.touch && !drag.moved && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.vertical = true; return; }
    if (drag.vertical) return;
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true; resetTour(); flight = null; overview = false;
      try { canvas.setPointerCapture(event.pointerId); } catch (_) { /* Pointer may have ended. */ }
      root.classList.add("atlas-dragging"); updateControls();
    }
    if (drag.moved) {
      event.preventDefault();
      rotation = [drag.rotation[0] + dx * 0.25, clamp(drag.rotation[1] - dy * 0.25, -85, 85), 0];
      draw();
    }
  });
  function releasePointer(event) {
    if (!drag || drag.id !== event.pointerId) return;
    var wasClick = !drag.moved && !drag.vertical && event.type === "pointerup";
    drag = null; root.classList.remove("atlas-dragging");
    try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch (_) { /* No capture. */ }
    if (wasClick) {
      var rect = canvas.getBoundingClientRect();
      var x = (event.clientX - rect.left) * width / rect.width;
      var y = (event.clientY - rect.top) * height / rect.height;
      var found = hitPoints.find(function (point) { return Math.hypot(point.x - x, point.y - y) < 23; });
      if (found) choose(found.index, false);
    }
    schedule();
  }
  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);
  canvas.addEventListener("pointerleave", function (event) { if (drag && !drag.moved) releasePointer(event); });

  // Enhance only after geographic rendering and DOM prerequisites are available.
  canvas.hidden = false;
  var fallback = root.querySelector(".atlas-fallback");
  if (fallback) fallback.hidden = true;
  root.classList.add("atlas-ready");
  root.querySelectorAll(".atlas-tools,[data-atlas-tour],[data-atlas-motion],[data-atlas-next],[data-atlas-prev],[data-atlas-reset],[data-atlas-zoom]").forEach(function (element) { element.hidden = false; });
  updateSelection(false); updateControls(); resize();
  preference.addEventListener("change", syncMotion);
  new MutationObserver(syncMotion).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", function () {
    updateControls();
    if (document.hidden) { if (tourActive) stopTour(false); if (raf) cancelAnimationFrame(raf); raf = 0; }
    else schedule();
  });
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(wrap);
  else window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { setVisible(entries[0].isIntersecting); }, { threshold: 0.02 }).observe(root);
  } else {
    var checkViewport = function () { var rect = root.getBoundingClientRect(); setVisible(rect.bottom > 0 && rect.top < window.innerHeight); };
    window.addEventListener("scroll", checkViewport, { passive: true });
    window.addEventListener("resize", checkViewport); checkViewport();
  }
})();
