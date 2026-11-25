/******************************************************************************/
/* This handles the situation where you have a multi-panel layout, and also
   allows for the possibility that a panel can be resized by the user --
    enlarged, perhaps over the top of other panels.

   Note that the code here was originally almost entirely AI-generated, and
   was not ChatGPT's finest hour.  Claude has since cleared things up a good
   deal, but I can't guarantee that all of the following makes sense.



   How it works for the user
   -------------------------

   A resizable panel has two edges which face the interior of the page --
   for the bottom right panel, the top and left edges; for the top left panel,
   the bottom and right edges; and so on.  The user can

   - Drag either of these edges (the cursor turns into a double-headed arrow
     when it is over the edge); or

   - Drag the handle at the corner where the two edges meet, which moves both
     edges at once; or

   - Double-click the handle, which toggles between expanding the panel to the
     maximum permitted extent and returning it to its original size.

   The edges and handle are optional, and can be limited in various ways
   (see 'makeResizable' below).  You can prevent expansion or prevent
   contraction; and a small margin is always left at the edge of the browser
   window, so that the user can't drag things to where they can no longer
   be got at.



   What you need to do
   -------------------

   For the 4-panel layout, list the panels you want to be resizable in the
   'resizablePanels' option of J_4PanelLayout.initialise, which ends up here.
   Any panel can be made resizable; none is resizable unless you ask.

   A Jamieson   STEPBible   Oct-2026
*/

class _J_PanelResizer
{
    /**********************************************************************/
    /* Used to prevent the panel from becoming so small when shrinking, or
       so close to the edge when expanding, that there's a risk the user
       will no longer be able to get at the resizing handle. */

    _MINIMUM_PANEL_SIZE = 50;
    _CLOSEST_APPROACH_TO_EDGES = 10;
    _SNAP_BACK_TOLERANCE = 3;   // Pixels.  Within this of its original place and size, a panel returns to normal.



    /**********************************************************************/
    /* A resized panel is raised above the other panels so that it can cover
       them.  If several panels are resized, the one most recently used is
       topmost.  This is the next z-index to hand out. */

    _nextZIndex = 500;



    /**********************************************************************/
    /* All Claude code:

       Makes a panel resizable.

       - area is the panel itself.  When the panel is enlarged it is taken out
         of the normal layout and a blank placeholder is left behind, so that
         the rest of the layout doesn't move.

       - sides says which two edges of the panel can be moved: one of "top" /
         "bottom", and one of "left" / "right".  These should be the edges
         which face into the page: ["top", "left"] for a panel in the bottom
         right corner, ["bottom", "right"] for one in the top left, and so on.

       - handle is the corner handle.  If you don't supply one, one is
         created at the corner where the two sides meet.

       - edges says whether the edges themselves are draggable, as well as the
         handle.

       - permitExpand and permitContract control whether the user can make the
         panel larger or smaller than its original size.

       Returns { reset }, where reset() puts the panel back to its original
       size (for example, when switching to a layout in which the panel cannot
       be resized at all). */

    /**********************************************************************/
    /* Hands out the next z-index in the sequence used to bring panels to the
       front.  Whatever was touched most recently -- an enlarged panel, or the
       search panel when a search starts -- ends up on top. */

    nextZIndex ()
    {
	return this._nextZIndex++;
    }



    /**********************************************************************/
    makeResizable ({ area, handle = null, sides = ["top", "left"], permitExpand = true, permitContract = true, edges = true } = {})
    {
	/******************************************************************/
	const verticalSide   = sides.find(side => "top"  === side || "bottom" === side);
	const horizontalSide = sides.find(side => "left" === side || "right"  === side);
	if (2 !== sides.length || !verticalSide || !horizontalSide)
	    throw new Error(`J_PanelResizer: 'sides' must be one of top/bottom and one of left/right, not ${JSON.stringify(sides)}.`);

	/* The class makes the area positioned, so that the handle and edges can be
	   placed relative to it, and gives it a stacking context of its own, which
	   keeps its handle and edges beneath any other resizable panel which has
	   been enlarged over the top of it (see the stylesheet). */

	area.classList.add("j-multi-panel-layout-resizable");



	/******************************************************************/
	let lastManualGeometry = null; // Null until the user has actually moved something.
	let maximised = false;
	let drag = null;
	let placeholder = null;
	let placeholderHeightFraction = 0;



	/******************************************************************/
	/* The size the panel has when the user has not touched it.  This is
	   captured at the start of each drag which begins from the untouched
	   state, rather than once at start-up, so that it remains right if the
	   window has been resized, or the layout has swapped between wide and
	   narrow, in the meantime. */

	let baseWidth;
	let baseHeight;



	/******************************************************************/
	/* Handle and edges. */

	if (!handle)
	{
	    handle = document.createElement("div");
	    handle.className = `j-multi-panel-layout-resize-handle-${verticalSide}-${horizontalSide}`;
	    area.append(handle);
	}

	/* Using a handle or edge is a 'meta' activity, which should not disturb
	   what the application is doing.  The attribute tells the search box not
	   to treat a press here as a click 'outside' it, which would close its
	   options table. */

	handle.setAttribute("data-j-resize-control", "");

	const edgeElements = [];
	if (edges)
	    sides.forEach(side => {
		const edge = document.createElement("div");
		edge.className = `j-multi-panel-layout-resize-edge j-multi-panel-layout-resize-edge-${side}`;
		edge.setAttribute("data-j-resize-control", "");
		area.append(edge);
		edgeElements.push([edge, [side]]);
	    });



	/******************************************************************/
	/* Given the rectangle the panel had when the drag started and the
	   distance the pointer has moved since, works out where the panel should
	   now be.  Only the edges being dragged move, and they are held within
	   the permitted limits. */

	const geometryFor = (start, draggedSides, dx, dy) => {
	    const edge = this._CLOSEST_APPROACH_TO_EDGES;
	    const minWidth  = permitContract ? this._MINIMUM_PANEL_SIZE : baseWidth;
	    const minHeight = permitContract ? this._MINIMUM_PANEL_SIZE : baseHeight;
	    const maxWidth  = permitExpand   ? Infinity : baseWidth;
	    const maxHeight = permitExpand   ? Infinity : baseHeight;
	    const clamp = (value, low, high) => Math.min(Math.max(value, low), high);

	    let left = start.left, right = start.right, top = start.top, bottom = start.bottom;

	    if (draggedSides.includes("left"))   left   = clamp(left + dx,   Math.max(edge, right - maxWidth),  right - minWidth);
	    if (draggedSides.includes("right"))  right  = clamp(right + dx,  left + minWidth,  Math.min(window.innerWidth  - edge, left + maxWidth));
	    if (draggedSides.includes("top"))    top    = clamp(top + dy,    Math.max(edge, bottom - maxHeight), bottom - minHeight);
	    if (draggedSides.includes("bottom")) bottom = clamp(bottom + dy, top + minHeight,  Math.min(window.innerHeight - edge, top + maxHeight));

	    return { left: left, top: top, width: right - left, height: bottom - top };
	};



	/******************************************************************/
	const rememberGeometry = () => {
	    const rect = area.getBoundingClientRect();
	    lastManualGeometry = {
		leftFraction:   rect.left   / window.innerWidth,
		topFraction:    rect.top    / window.innerHeight,
		widthFraction:  rect.width  / window.innerWidth,
		heightFraction: rect.height / window.innerHeight
	    };
	};



	/******************************************************************/
	const applyGeometry = geometry => {
	    if ("fixed" !== area.style.position)
	    {
		/* About to take the panel out of the normal layout, so leave a blank
		   space of the same size, so that the other panels stay put. */

		const rect = area.getBoundingClientRect();
		placeholder = document.createElement("div");
		placeholder.setAttribute("aria-hidden", "true");
		placeholder.style.height = `${rect.height}px`;
		placeholder.style.margin = getComputedStyle(area).margin;   // Occupy exactly the space the panel did.
		placeholderHeightFraction = rect.height / window.innerHeight;
		area.before(placeholder);
		area.style.margin = "0";
		area.style.position = "fixed";
	    }

	    area.style.left   = `${geometry.left}px`;
	    area.style.top    = `${geometry.top}px`;
	    area.style.width  = `${geometry.width}px`;
	    area.style.height = `${geometry.height}px`;
	};



	/******************************************************************/
	const reapplyGeometry = () => {
	    if (!lastManualGeometry || "fixed" !== area.style.position) return;

	    applyGeometry({
		left:   lastManualGeometry.leftFraction   * window.innerWidth,
		top:    lastManualGeometry.topFraction    * window.innerHeight,
		width:  lastManualGeometry.widthFraction  * window.innerWidth,
		height: lastManualGeometry.heightFraction * window.innerHeight
	    });

	    if (placeholder)
		placeholder.style.height = `${placeholderHeightFraction * window.innerHeight}px`;
	};

	window.addEventListener("resize", reapplyGeometry);



	/******************************************************************/
	/* Puts the area back as the stylesheet describes it, by removing
	   everything we have set inline.  (This is better than restoring
	   remembered pixel values, because the stylesheet's values are
	   percentages and therefore track the window.) */

	const reset = () => {
	    for (const property of ["position", "left", "top", "width", "height", "margin", "zIndex"])
		area.style[property] = "";

	    placeholder?.remove();
	    placeholder = null;

	    maximised = false;
	    drag = null;
	    lastManualGeometry = null;
	};



	/******************************************************************/
	/* Lets the user drag 'element', which moves the given sides of the
	   panel. */

	const makeDraggable = (element, draggedSides) => {
	    element.addEventListener("pointerdown", e => {
		if (0 !== e.button) return;

		const rect = area.getBoundingClientRect();

		if ("fixed" !== area.style.position) // Untouched so far, so this is the base size.
		{
		    baseWidth = rect.width;
		    baseHeight = rect.height;
		}

		drag = { sides: draggedSides, startX: e.clientX, startY: e.clientY, startRect: rect, moved: false };
		element.setPointerCapture(e.pointerId);
		e.preventDefault();
	    });



	    element.addEventListener("pointermove", e => {
		if (!drag) return;

		const dx = e.clientX - drag.startX;
		const dy = e.clientY - drag.startY;
		if (!drag.moved && 0 === dx && 0 === dy) return;

		drag.moved = true;
		maximised = false;
		area.style.zIndex = String(this._nextZIndex++ );   // Above any other resized panel.
		applyGeometry(geometryFor(drag.startRect, drag.sides, dx, dy));
	    });



	    element.addEventListener("pointerup", e => {
		if (!drag) return;

		element.releasePointerCapture(e.pointerId);

		if (drag.moved)
		{
		    /* If the user has dragged the panel back to (within a couple of
		       pixels of) where it started, put it back into the normal
		       flow, rather than leaving it fixed at a pixel position.  A
		       panel which is still fixed does not move when the layout
		       changes -- for instance, when the options table of the search
		       box opens and pushes the panel below it down -- and so would
		       end up on top of things it should not cover.  The placeholder
		       always occupies the panel's original slot, so it tells us where
		       'back to the start' is. */

		    const here = area.getBoundingClientRect();
		    const home = placeholder?.getBoundingClientRect();
		    const close = (a, b) => Math.abs(a - b) <= this._SNAP_BACK_TOLERANCE;

		    if (home && close(here.left, home.left) && close(here.top, home.top) && close(here.width, home.width) && close(here.height, home.height))
			reset();
		    else
			rememberGeometry();
		}   // A click which moves nothing must not leave anything behind.

		drag = null;
	    });



	    element.addEventListener("pointercancel", () => {
		drag = null;
	    });
	};

	makeDraggable(handle, sides);
	edgeElements.forEach(([edge, edgeSides]) => makeDraggable(edge, edgeSides));



	/******************************************************************/
	/* Roughly speaking, double-clicking the handle alternates between
	   something akin to full screen and original size. */

	handle.addEventListener("dblclick", e => {
	    e.preventDefault();

	    if (maximised)
	    {
		reset();
		return;
	    }

	    const rect = area.getBoundingClientRect();
	    if ("fixed" !== area.style.position)
	    {
		baseWidth = rect.width;
		baseHeight = rect.height;
	    }

	    // Maximum: take the two movable edges as far as they are allowed to go.
	    const far = 1e6;
	    const dx = "left" === horizontalSide ? -far : far;
	    const dy = "top"  === verticalSide   ? -far : far;
	    area.style.zIndex = String(this._nextZIndex++);
	    applyGeometry(geometryFor(rect, sides, dx, dy));
	    rememberGeometry();
	    maximised = true;
	});



	/******************************************************************/
	/* The caller can use this to put the panel back to its normal size
	   (for example, when switching to a layout where the panel cannot
	   be resized at all). */

	return { reset };
    } // makeResizable.
}

const J_PanelResizer = new _J_PanelResizer();
export default J_PanelResizer;
