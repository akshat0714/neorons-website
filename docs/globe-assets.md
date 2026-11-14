# Community globe: geography, dependencies and interaction

Prepared November 14, 2026.

## Geography

The globe uses **Natural Earth 1:110 million land geometry**, distributed by `world-atlas` **2.0.2**, derived from Natural Earth 4.1.0. Only land shapes are shown. The map does not draw Indigenous territorial boundaries, rank suicide risk, or represent Neorons deployments. Markers are approximate regional anchors supplied by the community content file.

- World Atlas source and format: https://github.com/topojson/world-atlas
- Original package: https://registry.npmjs.org/world-atlas/-/world-atlas-2.0.2.tgz
- Natural Earth public-domain terms: https://www.naturalearthdata.com/about/terms-of-use/

`land-110m.json` was converted from TopoJSON to GeoJSON offline with `topojson-client` **3.1.0**, then stored in `js/world-land.js` as `window.NeoronsWorldLand`. No map-service requests, tracking or runtime geolocation are used. The static SVG fallback is drawn from the same geometry using the same orthographic projection.

## Runtime libraries

- `d3-array` **3.2.4**: https://registry.npmjs.org/d3-array/-/d3-array-3.2.4.tgz
- `d3-geo` **3.1.1**: https://registry.npmjs.org/d3-geo/-/d3-geo-3.1.1.tgz

Runtime dependencies are self-hosted in `vendor/geo`. Original complete licenses are retained there, and are also appended to the minified scripts so the public upload archive includes the notices. The world-atlas and topojson-client licenses are retained for build provenance; topojson-client is not needed in the browser.

Primary API references:

- Orthographic projection: https://d3js.org/d3-geo/azimuthal#geoOrthographic
- Canvas geographic paths: https://d3js.org/d3-geo/path
- Spherical interpolation and distance: https://d3js.org/d3-geo/math

## Script order

Use deferred scripts in this order: `d3-array.min.js`, `d3-geo.min.js`, `js/world-land.js`, `js/communities-data.js`, `js/community-globe.js`. The community data array contains `id`, `name` and `[longitude, latitude]` coordinates.

## Interaction and accessibility

The first community is initially centred at world scale. Tabs, previous/next buttons and visible globe markers change the selected community. Keyboard arrows, Home and End move through the tab list. The optional closer-look control zooms to the selected geographic context. Horizontal touch dragging rotates the globe while vertical gestures remain available for page scrolling. The canvas has a descriptive label and text navigation provides the full alternative.

The 48-second journey is opt-in, advancing through four 12-second scenes; Play, Pause, Resume and Replay remain directly accessible. It pauses offscreen and when the browser is hidden, and does not resume its tour automatically. Camera travel uses a geodesic rotation with a slight pullback before moving closer.

System reduced-motion preferences, the shared `body.motion-paused` state, and the local Reduce motion control stop animated travel, tour playback and decorative motion. Community selection remains usable instantly. When paused or offscreen, no continuous animation frame loop runs. If D3 or Canvas is unavailable, all text stories and the static world illustration remain visible.

## Verification

`node --check js/community-globe.js` passed. A dependency-free Node VM harness using the actual geographic libraries passed initial enhancement, exactly one RAF loop, community selection, full tour/replay, pause/resume, offscreen suspension, local/system/global reduced motion, keyboard wrap navigation, zoom controls, and missing-library/missing-canvas fallbacks. Parent task performs integrated browser QA.
