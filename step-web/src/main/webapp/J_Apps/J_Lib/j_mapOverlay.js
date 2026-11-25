/******************************************************************************/
/* Draws place markers on top of the map images inside a <j-tabbed-dialog>.

   Each map image describes how latitude / longitude map onto its pixels via
   data- attributes on the <img>, which survive the copying of tab content
   into the dialog's shadow DOM:

     <img src="./images/patriarchs.png" alt="Map of Patriarchs"
          data-map-name="patriarchs"
          data-projection="mercator"
          data-west="24" data-east="50" data-south="26" data-north="40">

   data-projection is one of:

   - "mercator"          The image is Web Mercator, and data-west / east /
                         south / north give its edges in degrees.  Exact
                         if you rendered the image yourself.

   - "equirectangular"   As above, but the image is a plain lat / lon grid.

   - "affine"            For scanned maps which aren't a known projection.
                         data-affine="a,b,c,d,e,f" where
                             x = a*lon + b*lat + c
                             y = d*lon + e*lat + f
                         Use fitAffine (below) to get the six numbers from
                         a handful of places whose pixel positions you know.

   The markers sit in an SVG layer on top of the image.  The layer is
   transparent to the mouse, so dragging the map still works, and it sizes
   itself to the image, so it scrolls with it.  It also follows the image if
   the image is zoomed (see j_tabbedDialog.js): the markers stay where they
   should be, and keep the same size on the screen however far you zoom.

   Places which are already printed on the map image can be made 'live', so
   that they highlight when the mouse is over them and report a click: see
   setHotspots, onHotspotClick and onHotspotHover.

   Note that this is entirely Claude's code, and I have not attempted to
   understand it.

   Claude STEPBible Oct 2026
*/

/******************************************************************************/
const SVG_NS = "http://www.w3.org/2000/svg";



/******************************************************************************/
/* Hot spots (see setHotspots).  A hot spot responds when the pointer is
   within HOTSPOT_RADIUS_PX screen pixels of it, however far the map is
   zoomed.  A press which moves more than CLICK_MOVE_TOLERANCE_PX before it is
   released is a drag of the map, not a click. */

const HOTSPOT_RADIUS_PX = 12;
const CLICK_MOVE_TOLERANCE_PX = 5;



/******************************************************************************/
class _J_MapOverlay
{
    /**********************************************************************/
    _maps = new Map();    // Map name -> { img, scroller, svg, ready, project, zoom, hotspots, ... }
    _hotspotClickListeners = [];
    _hotspotHoverListeners = [];



    /**********************************************************************/
    /* Call once, after the tabbed dialog has been added to the page.
       Picks up every <img data-map-name="..."> inside it. */

    initialise (tabbedDialog)
    {
	const images = tabbedDialog.shadowRoot.querySelectorAll(".j-image-scroller img[data-map-name]");
	images.forEach(img => this._attach(img));
    }



    /**********************************************************************/
    /* Shows markers on the named map.  Each place is

           { id, lat, lon, label?, uncertain?, pulse? }

       By default any markers already on the map are removed first.  If
       reveal is true, the map is scrolled so the first marker shown is in
       the middle of the visible area (the tab needs to be visible for this
       to be meaningful).

       labelAt says where the name of the (first) place goes: "marker" (the
       default) puts it beside the marker, as part of the map; "corner" puts
       it in a box at the top left of the visible area, which stays there,
       at the same size, however the map is scrolled or zoomed.

       Returns (as a promise) the ids of any places which fall outside the
       map, and which therefore weren't drawn. */

    async showPlaces (mapName, places, { replace = true, reveal = false, animate = true, labelAt = "marker" } = {})
    {
	const entry = this._get(mapName);
	await entry.ready;

	// j_tabbedDialog.js keeps a map hidden (data-j-hold) from the moment it is built until
	// the first time places are shown on it, so it is never seen before it is centred.
	const firstTime = entry.scroller.hasAttribute("data-j-hold");

	if (replace)    this.clear(mapName);

	const width = entry.img.naturalWidth;
	const height = entry.img.naturalHeight;
	const offMap = [];
	let firstShown = null;
	let cornerText = null;

	places.forEach(place => {
	    const { x, y } = entry.project(place.lat, place.lon);

	    if (x < 0 || y < 0 || x > width || y > height)
	    {
		offMap.push(place.id);
		return;
	    }

	    entry.svg.appendChild(this._makeMarker(place, x, y, entry.zoom, "marker" === labelAt));
	    if (null === firstShown)
	    {
		firstShown = place.id;
		cornerText = place.label ?? null;
	    }
	});

	if ("corner" === labelAt && null !== cornerText)    this._setCornerLabel(entry, cornerText);

	if (reveal && null !== firstShown)
	{
	    /* If the map's tab isn't showing, the image has no size, so scrolling is meaningless.
	       Remember what to centre on, and do it when the map first gets a size (see the
	       ResizeObserver in _attach). */

	    if (entry.img.clientWidth > 0)    this.reveal(mapName, firstShown, animate && !firstTime);    // The first time, jump: a glide from the top left would be seen.
	    else                              entry.pendingReveal = firstShown;
	}
	else
	    entry.pendingReveal = null;

	entry.scroller.removeAttribute("data-j-hold");

	return offMap;
    }



    /**********************************************************************/
    clear (mapName)
    {
	const entry = this._get(mapName);
	entry.svg.replaceChildren();
	this._setCornerLabel(entry, null);
    }



    /**********************************************************************/
    /* Makes places which are printed on the map image respond to the mouse.
       'hotspots' is a list of

           { id, name, lat, lon, ...anything else you like }

       The extra properties come back to you untouched when the spot is
       clicked.  While the mouse is over a spot (or close to it) the spot is
       ringed and its name is shown.  Clicking it (without dragging) calls
       the functions registered with onHotspotClick; on a touch screen, which
       has no 'over', a tap does the same.

       If several spots are close together, the nearest to the pointer wins,
       and the others are reported as 'nearby'.

       Calling this again replaces the previous list.  Pass [] to remove it.
       Returns (as a promise) the ids of any spots which fall outside the
       map and so were dropped. */

    async setHotspots (mapName, hotspots)
    {
	const entry = this._get(mapName);
	await entry.ready;

	const width = entry.img.naturalWidth;
	const height = entry.img.naturalHeight;
	const offMap = [];

	entry.hotspots = [];
	hotspots.forEach(hotspot => {
	    if (typeof hotspot?.uniqueId !== "string")
	    {
		console.warn(`Hot spots (${mapName}): entry with no uniqueId ignored:`, hotspot);
		return;
	    }

	    if (!hotspot.uniqueId.startsWith("_")) // I use _AMBIGUOUS_ and _UNKNOWN_ for places I want to retain in the data, but for which I have no data.
	    {
		const { x, y } = entry.project(Number(hotspot.lat), Number(hotspot.lon));
		if (!Number.isFinite(x) || !Number.isFinite(y))
		{
		    console.warn(`Hot spots (${mapName}): '${hotspot.uniqueId}' has no usable lat / lon; ignored.`);
		    offMap.push(hotspot.uniqueId);
		}
		else if (x < 0 || y < 0 || x > width || y > height)
		    offMap.push(hotspot.uniqueId);
		else
                    entry.hotspots.push({ ...hotspot, x, y });    // x, y: pixels in the (full size) image.
	    }
	});

	this._setHover(entry, null);
	return offMap;
    }



    /**********************************************************************/
    /* Registers fn to be called when a hot spot is clicked.  It is passed

           { mapName, spot, nearby, x, y }

       where spot is the hot spot (as you supplied it, plus x and y, its
       position in image pixels), nearby is a list of any other spots close
       to the click (nearest first; usually empty), and x and y are where
       the click was, in image pixels. */

    onHotspotClick (fn)
    {
	this._hotspotClickListeners.push(fn);
    }



    /**********************************************************************/
    /* Registers fn to be called as the pointer moves on to, and off, a hot
       spot.  It is passed the same sort of thing as onHotspotClick, or null
       when the pointer is no longer over a spot. */

    onHotspotHover (fn)
    {
	this._hotspotHoverListeners.push(fn);
    }



    /**********************************************************************/
    /* Lets every map be seen, for when no place is going to be shown on it
       (see the data-j-hold note in showPlaces). */

    releaseAll ()
    {
	this._maps.forEach(entry => entry.scroller.removeAttribute("data-j-hold"));
    }



    /**********************************************************************/
    clearAll ()
    {
	this._maps.forEach(entry => { entry.svg.replaceChildren(); this._setCornerLabel(entry, null); });
    }



    /**********************************************************************/
    /* Scrolls the map so that the marker for the given place is in the
       middle of the visible area. */

    reveal (mapName, placeId, animate = true)
    {
	const entry = this._get(mapName);
	const marker = [...entry.svg.children].find(g => g.getAttribute("data-place-id") === String(placeId));
	if (!marker) return;

	const scale = entry.img.naturalWidth > 0 ? entry.img.clientWidth / entry.img.naturalWidth : 1;
	const x = Number(marker.getAttribute("data-x")) * scale;
	const y = Number(marker.getAttribute("data-y")) * scale;

	entry.scroller.scrollTo({
            left: x - entry.scroller.clientWidth / 2,
            top: y - entry.scroller.clientHeight / 2,
            behavior: animate ? "smooth" : "instant"
	});
    }


    /**********************************************************************/
    /* Calibration aid for scanned maps.  Pass in at least three (ideally
       five or more, spread over the map) places where you know both the
       latitude / longitude and where they are in the image:

           [ { lat: 31.78, lon: 35.22, x: 812, y: 604 }, ... ]

       Returns { affine, rmsErrorPixels }.  Paste the affine string into
       data-affine.  The error figure tells you how well the points agree
       with a straight-line fit -- it will be zero for exactly three points,
       which proves nothing, so use more. */

    fitAffine (points)
    {
	if (points.length < 3)    throw new Error("Need at least 3 control points.");

	// Work relative to the mean, which keeps the arithmetic well behaved.
	const n = points.length;
	const lon0 = points.reduce((s, p) => s + p.lon, 0) / n;
	const lat0 = points.reduce((s, p) => s + p.lat, 0) / n;

	const normal = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
	const bx = [0, 0, 0];
	const by = [0, 0, 0];

	points.forEach(p => {
	    const row = [p.lon - lon0, p.lat - lat0, 1];
	    for (let i = 0; i < 3; ++i)
	    {
		for (let j = 0; j < 3; ++j)    normal[i][j] += row[i] * row[j];
		bx[i] += row[i] * p.x;
		by[i] += row[i] * p.y;
	    }
	});

	const [a, b, cx] = this._solve3(normal, bx);
	const [d, e, cy] = this._solve3(normal, by);
	const c = cx - a * lon0 - b * lat0;
	const f = cy - d * lon0 - e * lat0;

	const sumSq = points.reduce((s, p) => {
	    const dx = a * p.lon + b * p.lat + c - p.x;
	    const dy = d * p.lon + e * p.lat + f - p.y;
	    return s + dx * dx + dy * dy;
	}, 0);

	return { affine: [a, b, c, d, e, f].join(","), rmsErrorPixels: Math.sqrt(sumSq / n) };
    }



    /**********************************************************************/
    /* Calibration aid.  After calling this, clicking on the named map
       writes the pixel position of the click (in image pixels) to the
       console.  Click on places whose lat / lon you know, and feed the
       results to fitAffine. */

    logClicks (mapName)
    {
	const img = this._get(mapName).img;

	img.addEventListener("click", event => {
	    const rect = img.getBoundingClientRect();
	    const x = Math.round((event.clientX - rect.left) * img.naturalWidth / rect.width);
	    const y = Math.round((event.clientY - rect.top) * img.naturalHeight / rect.height);
	    console.log(`${mapName}: x: ${x}, y: ${y}`);
	});
    }



    /**********************************************************************/
    _get (mapName)
    {
	const entry = this._maps.get(mapName);
	if (!entry) throw new Error(`No map called '${mapName}' (check data-map-name).`);
	return entry;
    }



    /**********************************************************************/
    _attach (img)
    {
	const scroller = img.closest(".j-image-scroller");
	scroller.style.position = "relative";    // So the SVG is positioned relative to (and scrolls with) the image.

	const svg = this._el("svg", {});
	svg.style.cssText = "position: absolute; left: 0; top: 0; pointer-events: none;";
	scroller.appendChild(svg);

	/* The corner label.  An ordinary element inside the scroller would scroll
	   with the map.  A 'sticky' one doesn't: it stays put at the top left of the
	   visible area.  It is given no width or height, so it doesn't disturb the
	   layout of the image (and it needs a width of 0, not 'auto', or it would be
	   as wide as the whole image and so unable to move sideways).  The box
	   which holds the text hangs off it. */

	const cornerAnchor = document.createElement("div");
	cornerAnchor.style.cssText = "position: sticky; top: 0; left: 0; width: 0; height: 0; z-index: 5; pointer-events: none;";

	const cornerLabel = document.createElement("div");
	cornerLabel.hidden = true;
	cornerLabel.style.cssText =
	    "position: absolute; top: 8px; left: 8px; width: max-content; max-width: min(80vw, 50ch); " +
	    "box-sizing: border-box; padding: 3px 8px; font: 14px sans-serif; " +
	    "color: var(--clr-j-map-overlay-corner-label, #d62828); " +
	    "background: var(--clr-j-map-overlay-corner-label-bg, white); " +
	    "border: 2px solid var(--clr-j-map-overlay-corner-label-border, #d62828);";
	cornerAnchor.appendChild(cornerLabel);
	scroller.prepend(cornerAnchor);

	const mapName = img.dataset.mapName;
	const entry = { img, scroller, svg, cornerLabel, ready: null, project: null, zoom: 1, pendingReveal: null };

	this._attachHotspotHandling(entry);

	this._maps.set(img.dataset.mapName, entry);

	entry.ready = this._whenLoaded(img).then(() => {
	    svg.setAttribute("viewBox", `0 0 ${img.naturalWidth} ${img.naturalHeight}`);
	    entry.project = this._makeProjector(img);

	    // Keep the SVG exactly the size of the image as displayed, so
	    // everything lines up whether the map is scrolled or scaled.
	    //
	    // The markers are drawn in image pixels, so zooming would make them
	    // grow and shrink with the map.  We counter that by scaling each one
	    // by the reciprocal of the zoom, which keeps them the same size on
	    // the screen.
	    new ResizeObserver(() => {
		svg.style.width = `${img.clientWidth}px`;
		svg.style.height = `${img.clientHeight}px`;

		const zoom = img.clientWidth / img.naturalWidth;
		if (!(zoom > 0)) return;    // Image not currently displayed.

		entry.zoom = zoom;
		[...svg.children].forEach(g => g.setAttribute("transform", this._markerTransform(g.dataset.x, g.dataset.y, zoom)));

		if (null != entry.pendingReveal)    // The tab has just become visible.
		{
		    const id = entry.pendingReveal;
		    entry.pendingReveal = null;
		    requestAnimationFrame(() => this.reveal(mapName, id, false));
		}
	    }).observe(img);
	});
	entry.ready.catch(() => {});    // Callers of showPlaces see the error; this just stops a console 'unhandled' report at page load.
    }



    /**********************************************************************/
    _whenLoaded (img)
    {
	if (img.complete && img.naturalWidth > 0)    return Promise.resolve();

	return new Promise((resolve, reject) => {
	    img.addEventListener("load", resolve, { once: true });
	    img.addEventListener("error", () => reject(new Error(`Map image failed to load: ${img.src}`)), { once: true });
	});
    }



    /**********************************************************************/
    /* Returns a function (lat, lon) => { x, y } in image pixels. */

    _makeProjector (img)
    {
	const data = img.dataset;
	const type = data.projection ?? "mercator";

	if ("affine" === type)
	{
	    if (!data.affine)    throw new Error(`Map '${data.mapName}' needs data-affine="a,b,c,d,e,f" on its <img>.`);
	    const [a, b, c, d, e, f] = data.affine.split(",").map(Number);
	    return (lat, lon) => ({ x: a * lon + b * lat + c, y: d * lon + e * lat + f });
	}

	if ("mercator" !== type && "equirectangular" !== type)    throw new Error(`Unknown data-projection '${type}'.`);

	const west = Number(data.west);
	const east = Number(data.east);
	const south = Number(data.south);
	const north = Number(data.north);

	if ([west, east, south, north].some(Number.isNaN) || data.west === undefined || data.east === undefined || data.south === undefined || data.north === undefined)
	    throw new Error(`Map '${data.mapName}' needs data-west, data-east, data-south and data-north (degrees) on its <img>.`);

	const mercatorY = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
	const yOf = "mercator" === type ? mercatorY : lat => lat;
	const yTop = yOf(north);
	const yBottom = yOf(south);

	const width = img.naturalWidth;
	const height = img.naturalHeight;

	return (lat, lon) => ({
	    x: (lon - west) / (east - west) * width,
	    y: (yTop - yOf(lat)) / (yTop - yBottom) * height
	});
    }



    /**********************************************************************/
    _markerTransform (x, y, zoom)
    {
	return `translate(${x} ${y}) scale(${1 / zoom})`;
    }



    /**********************************************************************/
    _makeMarker (place, x, y, zoom, showLabel = true)
    {
	const colour = place.uncertain
	    ? "var(--clr-j-map-overlay-marker-uncertain, #e8a317)"
	    : "var(--clr-j-map-overlay-marker, #d62828)";

	const g = this._el("g", {
	    transform: this._markerTransform(x, y, zoom),
	    "data-place-id": place.id,
	    "data-x": x,
	    "data-y": y
	});

	if (false !== place.pulse)
	{
	    const pulse = this._el("circle", { r: 8, style: `fill: none; stroke: ${colour}; stroke-width: 4;` });
	    pulse.appendChild(this._el("animate", { attributeName: "r", from: 8, to: 26, dur: "1.5s", repeatCount: "indefinite" }));
	    pulse.appendChild(this._el("animate", { attributeName: "opacity", from: 1, to: 0, dur: "1.5s", repeatCount: "indefinite" }));
	    g.appendChild(pulse);
	}

	//g.appendChild(this._el("circle", { r: 6, style: `fill: ${colour}; stroke: white; stroke-width: 2;` }));

	if (place.label && showLabel)
	{
	    const text = this._el("text", {
		x: 11,
		y: 5,
		style: "font: 14px sans-serif; fill: var(--clr-j-map-overlay-label, #222); " +
		       "paint-order: stroke; stroke: white; stroke-width: 3px; stroke-linejoin: round;"
	    });
	    text.textContent = place.label;
	    g.appendChild(text);
	}

	return g;
    }



    /**********************************************************************/
    /* Everything to do with hot spots on the pointer side.  Done once per
       map, whether or not hot spots are ever set.

       The pointer is tracked on the scrolling frame, not on shapes drawn on
       the map: the tabbed dialog captures the pointer for dragging, which
       would stop shapes receiving clicks.  Instead we convert the pointer
       position to image pixels and see which spot, if any, is close. */

    _attachHotspotHandling (entry)
    {
	const { scroller } = entry;

	// The ring and the name.  Ordinary elements inside the frame, positioned
	// in screen pixels from the zoom in force at the time, so they stay the
	// same size however far the map is zoomed.
	entry.ring = document.createElement("div");
	entry.ring.hidden = true;
	entry.ring.style.cssText =
	    "position: absolute; width: 26px; height: 26px; margin: -13px 0 0 -13px; box-sizing: border-box; " +
	    "border: 3px solid blue; border-radius: 50%; " +
	    "background: rgba(255, 255, 255, 0.25); pointer-events: none; z-index: 4;";

	entry.tip = document.createElement("div");
	entry.tip.hidden = true;
	entry.tip.style.cssText =
	    "position: absolute; white-space: nowrap; padding: 1px 7px; font: 13px sans-serif; pointer-events: none; z-index: 6; " +
	    "color: var(--clr-j-map-overlay-hotspot-text, #222); background: var(--clr-j-map-overlay-hotspot-bg, white); " +
	    "border: 1px solid blue; border-radius: 3px;";

	scroller.append(entry.ring, entry.tip);

	entry.hotspots = [];
	entry.hover = null;      // The hit currently highlighted.
	entry.press = null;      // { x, y, moved } for a press in progress.

	scroller.addEventListener("pointerdown", event => {
	    if (entry.press)    entry.press.moved = true;                          // A second finger: a pinch, not a tap.
	    else                entry.press = { x: event.clientX, y: event.clientY, moved: false };
	    this._setHover(entry, null);
	});

	scroller.addEventListener("pointermove", event => {
	    if (entry.press)
	    {
		if (Math.hypot(event.clientX - entry.press.x, event.clientY - entry.press.y) > CLICK_MOVE_TOLERANCE_PX)    entry.press.moved = true;
		return;                                                                 // No highlighting while pressing / dragging.
	    }

	    if ("touch" === event.pointerType)    return;                           // No such thing as 'over' on a touch screen.
	    this._setHover(entry, this._hotspotAt(entry, event.clientX, event.clientY));
	});

	scroller.addEventListener("pointerup", event => {
	    const press = entry.press;
	    entry.press = null;
	    if (!press || press.moved)    return;

	    const hit = this._hotspotAt(entry, event.clientX, event.clientY);
	    if (!hit)    return;

	    this._hotspotClickListeners.forEach(fn => fn({ mapName: entry.img.dataset.mapName, ...hit }));
	});

	scroller.addEventListener("pointercancel", () => { entry.press = null; });
	scroller.addEventListener("pointerleave",  () => this._setHover(entry, null));

	// Scrolling or zooming moves the map from under the pointer.  The next
	// movement of the pointer will find the right spot again.
	scroller.addEventListener("scroll", () => this._setHover(entry, null));
	scroller.addEventListener("wheel",  () => this._setHover(entry, null), { passive: true });
    }



    /**********************************************************************/
    /* The hot spot nearest the given screen position, if any is within
       reach, as { spot, nearby, x, y }; otherwise null. */

    _hotspotAt (entry, clientX, clientY)
    {
	if (0 === entry.hotspots.length)    return null;

	const rect = entry.img.getBoundingClientRect();
	if (!(rect.width > 0))    return null;

	const imagePixelsPerScreenPixel = entry.img.naturalWidth / rect.width;
	const x = (clientX - rect.left) * imagePixelsPerScreenPixel;
	const y = (clientY - rect.top) * imagePixelsPerScreenPixel;
	const reach = HOTSPOT_RADIUS_PX * imagePixelsPerScreenPixel;

	const close = entry.hotspots
	    .map(spot => ({ spot, distance: Math.hypot(spot.x - x, spot.y - y) }))
	    .filter(candidate => candidate.distance <= reach)
	    .sort((a, b) => a.distance - b.distance);

	if (0 === close.length)    return null;
	return { spot: close[0].spot, nearby: close.slice(1).map(c => c.spot), x, y };
    }



    /**********************************************************************/
    /* Highlights the given hit (see _hotspotAt), or removes the highlight. */

    _setHover (entry, hit)
    {
	const previous = entry.hover?.spot;
	entry.hover = hit;

	if (!hit)
	{
	    entry.ring.hidden = true;
	    entry.tip.hidden = true;
	    entry.scroller.style.cursor = "";
	}
	else
	{
	    const scale = entry.img.clientWidth / entry.img.naturalWidth;
	    const x = hit.spot.x * scale;
	    const y = hit.spot.y * scale;

	    entry.ring.style.left = `${x}px`;
	    entry.ring.style.top = `${y}px`;
	    entry.ring.hidden = false;

	    entry.tip.textContent = hit.nearby.length ? `${hit.spot.name}  (+${hit.nearby.length} nearby)` : hit.spot.name;
	    entry.tip.hidden = false;

	    // Above and to the right of the spot, unless that would leave the visible area.
	    const { scroller, tip } = entry;
	    let left = x + 16;
	    let top = y - tip.offsetHeight - 10;
	    if (left + tip.offsetWidth > scroller.scrollLeft + scroller.clientWidth - 4)    left = x - 16 - tip.offsetWidth;
	    if (top < scroller.scrollTop + 4)                                               top = y + 16;
	    tip.style.left = `${Math.max(left, scroller.scrollLeft + 4)}px`;
	    tip.style.top = `${top}px`;

	    scroller.style.cursor = "pointer";
	}

	if (previous !== hit?.spot)
	    this._hotspotHoverListeners.forEach(fn => fn(hit ? { mapName: entry.img.dataset.mapName, ...hit } : null));
    }



    /**********************************************************************/
    /* Sets (or, given null, hides) the label at the top left of the map. */

    _setCornerLabel (entry, text)
    {
	entry.cornerLabel.hidden = (null === text);
	entry.cornerLabel.textContent = text ?? "";
    }



    /**********************************************************************/
    _el (name, attributes)
    {
	const element = document.createElementNS(SVG_NS, name);
	for (const [key, value] of Object.entries(attributes))    element.setAttribute(key, value);
	return element;
    }



    /**********************************************************************/
    /* Solves the 3x3 system matrix . answer = rhs by Gaussian elimination
       with partial pivoting. */

    _solve3 (matrix, rhs)
    {
	const m = matrix.map((row, i) => [...row, rhs[i]]);

	for (let col = 0; col < 3; ++col)
	{
	    let pivot = col;
	    for (let row = col + 1; row < 3; ++row)    if (Math.abs(m[row][col]) > Math.abs(m[pivot][col]))    pivot = row;
	    if (Math.abs(m[pivot][col]) < 1e-12)    throw new Error("Control points are in a straight line (or all the same) -- can't fit a map to them.");
	    [m[col], m[pivot]] = [m[pivot], m[col]];

	    for (let row = col + 1; row < 3; ++row)
	    {
		const factor = m[row][col] / m[col][col];
		for (let k = col; k < 4; ++k)    m[row][k] -= factor * m[col][k];
	    }
	}

	const answer = [0, 0, 0];
	for (let row = 2; row >= 0; --row)
	{
	    let sum = m[row][3];
	    for (let k = row + 1; k < 3; ++k)    sum -= m[row][k] * answer[k];
	    answer[row] = sum / m[row][row];
	}
	return answer;
    }
}

export const J_MapOverlay = new _J_MapOverlay();
