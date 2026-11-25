/******************************************************************************/
/* Implements a tabbed dialog box.

   To use it, you need to have something like:

     <template any-attributes>
       <j-tabbed-dialog tabbed-dialog-name="testDialog" image-scroll-or-scale="???">
         tab-descriptor
         tab-descriptor
         ...
       </j-tabbed-dialog>
     </template>

  Where a tabDescriptor looks like:

     <j-tabbed-dialog-tab-description>
       <j-tabbed-dialog-tab-label>Patriarchs</j-tabbed-dialog-tab-label>
       <j-tabbed-dialog-tab-content>
         <div class="j-image-scroller">
	   <img src="./images/patriarchs.png" alt="Map of Patriarchs"></img>
	 </div>
       </j-tabbed-dialog-tab-content>
     </j-tabbed-dialog-tab-description>


  Each of these defines the label to go on the tab, and the content to be
  shown on that tab, and is linked to the overal dialog via the tabbed-dialog-name
  attribute on the <template> tab.

  There is no limit on the number of these which you can have -- or at least,
  no limit built into the code: I don't know what would happen if you have so
  many tabs they start pushing at the boundary of the available space.

  In the example above, the tab contains an image, which is enclosed in an
  optional <div class="j-image-scroller">.  This, along with the optional
  image-scroll-or-scale attribute on <j-tabbed-dialog> controls how
  images on the tabs are handled.

  If an image is not enclosed in <div class="j-image-scroller">, it is simply
  drawn on the tab as is.

  If it is enclosed in <div class="j-image-scroller">, then:

  - If image-scroll-or-scale is "scroll", or is omitted, and if the image
    is too large to fit in the tab, the image is displayed at normal size,
    and you can drag on it to scroll it.

    You can also zoom the image with the mouse wheel, or by pinching on
    a touch screen (up to four times natural size, and out as far as the whole
    image being visible).  Add image-zoom="off" to <j-tabbed-dialog> if you
    don't want this.

  - If image-scroll-or-scale is "scale", the image is scaled to fit the
    available space.  In some applications, the container in which the
    tabbed dialog may be resizable under user control, and in this case
    the image will be rescaled as necessary to fit the available space,
    except that it will never go above 100%.


   A Jamieson STEPBIble Oct-2026
*/
/******************************************************************************/

/******************************************************************************/
const CSS_MAIN = `
/*----------------------------------------------------------------------------*/
/* General tabbed layout. */

:host {
    display: block;
    width: 100%;
    height: 100%;
}

:host > div {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

j-tabbed-dialog-impl-tab-content-container {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    width: 100%;
    overflow: hidden;
}

.j-tabbed-dialog-impl-tab-content {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    display: flex; /* Flex for all tabs, not just the visible one, so hidden tabs keep their full size too. */
}

j-tabbed-dialog-impl-button-container { /* The bar which contains the buttons. */
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;          /* If the tabs won't fit on one line, carry on onto another. */
    row-gap: 3px;
    flex: 0 0 auto;
    width: 100%;
    box-sizing: border-box;
    background: white;
}



/*----------------------------------------------------------------------------*/
/* A nifty expedient suggested by ChatGPT.

   In tabbed dialog mode, you have one tab visible, and the others invisible.
   Quite often changes in one tab are supposed to effect changes in the others.
   If the invisible ones have been made invisible using display:none, they are
   given zero size, and under those circumstances, updates may not render
   correctly.  The settings below get round this by avoiding display:none.
   Instead, the frame is left at its normal size, and merely positioned well
   away from sight.

   You add this class when you want things to be invisible, and then remove
   it in order to restore them to being visible and in their normal
   position. */


.j-tabbed-dialog-impl-visible-offscreen {
  visibility: hidden;
  position: absolute;
  left: -9999px;
}


/*----------------------------------------------------------------------------*/
/* Tab buttons used on the tabbed dialogue layout.  You shouldn't need to
   change any of this. */
      
.j-tabbed-dialog-impl-tab-button {
    background: #555;
    color: white;
    flex: 0 0 auto;
    max-width: 100%;          /* A single very long label can't push the bar wider than the dialog ... */
    overflow: hidden;         /* ... it is cut short instead. */
    text-overflow: ellipsis;
    white-space: nowrap;
    border-left: 2px solid black;
    border-top: 2px solid black;
    border-right: 2px solid black;
    outline: none;
    cursor: pointer;
    padding: 3px 8px;
    font-size: small;
    font-weight: normal;
    border-radius: 12px 12px 0px 0px;
/*    margin-bottom: 12px; */
}

.j-tabbed-dialog-selector-button-selected {
    background: white !important;
    color: black !important;
    border-bottom: 1px solid white !important;
    font-weight: bold;
}

.j-tabbed-dialog-impl-tab-button:hover {
    background-color: #777;
}

.j-tabbed-dialog-impl-tab-button:active {
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.6); /* Pressed effect */
    background: var(--jframework-clrInfoBoxBackground);
    color: black;
}`;



/*----------------------------------------------------------------------------*/
/* Enables images to be dragged, rather than having scroll bars. */

const CSS_IMAGE_HANDLER_COMMON = `
.j-image-scroller {
    width: 100%;
    height: 100%;
    overflow: auto;
    cursor: grab;

    /* We handle all dragging and pinching ourselves, so stop the browser
       trying to do its own panning / zooming on touch screens. */
    touch-action: none;
    overscroll-behavior: contain;

    /* Hide scrollbars */
    scrollbar-width: none;

    margin: 0;
    padding: 0;
}

.j-image-scroller::-webkit-scrollbar {
    display: none;
}

/* Maps which have markers drawn on them (j_mapOverlay.js) stay invisible, though
   still laid out, until the overlay removes data-j-hold, so you never see them
   before they are centred. */
.j-image-scroller[data-j-hold] {
    visibility: hidden;
}

.j-image-scroller.dragging {
    cursor: grabbing;
}

.j-image-scroller img {
    user-select: none;
    -webkit-user-drag: none;
    width: auto;
    height: auto;
    margin: 0;
    display: block;
}
`;


/*----------------------------------------------------------------------------*/
/* Additional definitions if we want to be able to drag / scroll the maps and
   keep them to original size. */

const CSS_IMAGE_HANDLER_SCROLL = `
.j-image-scroller img {
    max-width: none;
    max-height: none;
}
`;


/*----------------------------------------------------------------------------*/
/* Additional defitions if we want to scale the map with the container. */

const CSS_IMAGE_HANDLER_SCALE = `
.j-image-scroller {
    overflow: hidden;
    cursor: default;
}

.j-image-scroller img {
    max-width: 100%;
    max-height: 100%;
}
`;





/******************************************************************************/
/* Extends HTML with a tabbed dialog bar element. */

class JTabbedDialog extends HTMLElement
{
    /**************************************************************************/
    connectedCallback()
    {
	/**********************************************************************/
        /* connectedCallback runs again every time the element (or any ancestor)
	   is moved in the DOM -- which happens when the responsive layout swaps
	   between the wide and narrow arrangements.  Everything here must
	   therefore be done only once. */
	
        if (this._j_initialised) return;

	const tabs = this.querySelectorAll(":scope > j-tabbed-dialog-tab-description");
	if (0 === tabs.length)
	{
	    /* The dialog builds itself from its tabs, once, at the moment it is added to the page.
	       So the tabs must already be inside it by then -- generate them into a <template>
	       (or into the element before it is attached), not afterwards. */
	    console.error(`j-tabbed-dialog '${this.getAttribute("tabbed-dialog-name")}' has no <j-tabbed-dialog-tab-description> children at the time it was connected, so it cannot be built.`);
	    return;
	}
        this._j_initialised = true;



	/**********************************************************************/
        const dialogName = this.getAttribute("tabbed-dialog-name");
	const imageBehaviour = this.getAttribute("image-scroll-or-scale") ?? "scroll";

	const headers = this._generateTabbedDialogHeadersHtml(dialogName, tabs);
	const content = this._generateTabbedDialogContentsHtml(dialogName, tabs);

	tabs.forEach(node => node.remove());
	
	const html =`
          <div>
            <j-tabbed-dialog-impl-button-container>
	      ${headers}
            </j-tabbed-dialog-impl-button-container>

            <j-tabbed-dialog-impl-tab-content-container>
	      ${content}
            </j-tabbed-dialog-impl-tab-content-container>
          </div>`;

	const cssImageHandler = "scroll" == imageBehaviour ? CSS_IMAGE_HANDLER_SCROLL : CSS_IMAGE_HANDLER_SCALE;


        this.attachShadow({ mode: "open" }).innerHTML = `
            <style>${CSS_MAIN}${CSS_IMAGE_HANDLER_COMMON}${cssImageHandler}</style>
            ${html}
        `;

	this._attachClickHandlers(dialogName);
	if ("scroll" == imageBehaviour) this._attachDragHandlers(dialogName, "off" !== this.getAttribute("image-zoom"));
	this._openDialogTab(dialogName, 0);


	/* Hold back any image which will have markers drawn on it (see j_mapOverlay.js)
	   until the overlay releases it.  This runs in the same step as building the
	   shadow DOM, so the image is never painted unhidden.  The timeout is only
	   a backstop in case nothing ever releases it. */

	const held = [...this.shadowRoot.querySelectorAll(".j-image-scroller")]
	      .filter(scroller => scroller.querySelector("img[data-map-name]"));
	held.forEach(scroller => scroller.setAttribute("data-j-hold", ""));
	setTimeout(() => held.forEach(scroller => scroller.removeAttribute("data-j-hold")), 10000);
    }


    /**************************************************************************/
    /* Programmatically selects a tab (0-based), as if the user had clicked it. */

    selectTab (index)
    {
	this._openDialogTab(this.getAttribute("tabbed-dialog-name"), index);
    }


    /**************************************************************************/
    /* The tab contents live in this element's shadow DOM, so
       document.getElementById and a plain querySelector on <j-tabbed-dialog>
       cannot see them.  These two look inside it instead:

         dialog.querySelectorInTabs("#open-street-map").src = "...";

       I haven't overridden querySelector / querySelectorAll themselves, because
       connectedCallback uses this.querySelectorAll to find the tab descriptions
       (which are in the ordinary DOM until the shadow DOM replaces them), and
       overriding would break that. */

    querySelectorInTabs (selector)
    {
        return this.shadowRoot?.querySelector(selector) ?? null;
    }


    querySelectorAllInTabs (selector)
    {
        return this.shadowRoot?.querySelectorAll(selector) ?? [];
    }


    /**************************************************************************/
    _attachClickHandlers (dialogName)
    {
        const buttons = this.shadowRoot.querySelectorAll(`.j-tabbed-dialog-impl-tab-button[tabbed-dialog-name=${dialogName}`);
        buttons.forEach((button, index) => {
            button.onclick = (event) => this._openDialogTab(dialogName, index);
        });
    }

	
    /**************************************************************************/
    _attachDragHandlers (dialogName, zoomable)
    {
	const scrollers = [...this.shadowRoot.querySelectorAll(".j-image-scroller")]
	      .filter(item => item.closest(`[tabbed-dialog-name="${CSS.escape(dialogName)}"]`));
	scrollers.forEach(scroller => { this._attachDragHandlers_1(dialogName, scroller, zoomable) });
    }


    /**************************************************************************/
    /* Lets the user drag an image to scroll it, and (unless zoomable is false)
       zoom it with the mouse wheel or by pinching with two fingers.

       The image is zoomed by changing its displayed size, so scrolling, the
       size of the area it occupies and anything overlaid on it (such as
       j_mapOverlay.js's markers, which watch the image's size) all follow
       naturally.  Zooming is about the point under the cursor or between
       the fingers, so that point stays where it is on the screen.

       Zoom is limited to the range from 'whole image visible' (or 1:1, if
       the image is smaller than the space available) up to MAX_ZOOM times
       natural size.  It happens only as a result of user action: changing the
       size of the window does not rescale the image.

       Pointer handling is done in one place for both mouse and touch.  One
       pointer down means drag; two means pinch (which also pans, following
       the midpoint of the two fingers). */

    _attachDragHandlers_1 (dialogName, scroller, zoomable)
    {
	/**********************************************************************/
	const MAX_ZOOM = 4;
	const img = scroller.querySelector("img");
	const pointers = new Map();     // pointerId -> { x, y } (client coordinates).
	let zoom = 1;                   // Displayed size / natural size.

	let startX, startY, startScrollLeft, startScrollTop;   // For single-pointer dragging.
	let lastDistance, lastMidX, lastMidY;                  // For pinching.



	/**********************************************************************/
	const beginDrag = () => {
	    const [p] = pointers.values();
	    startX = p.x;
	    startY = p.y;
	    startScrollLeft = scroller.scrollLeft;
	    startScrollTop = scroller.scrollTop;
	};



	/**********************************************************************/
	const pinchState = () => {
	    const [a, b] = [...pointers.values()];
	    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, distance: Math.hypot(a.x - b.x, a.y - b.y) };
	};



	/**********************************************************************/
	const zoomBy = (factor, clientX, clientY) => {
	    if (!zoomable || !img || !img.naturalWidth) return;

	    const fit = Math.min(scroller.clientWidth / img.naturalWidth, scroller.clientHeight / img.naturalHeight);
	    const newZoom = Math.min(MAX_ZOOM, Math.max(Math.min(1, fit), zoom * factor));
	    if (newZoom === zoom) return;

	    const rect = scroller.getBoundingClientRect();
	    const pointX = clientX - rect.left;
	    const pointY = clientY - rect.top;
	    const imageX = (scroller.scrollLeft + pointX) / zoom;   // The bit of the image under the cursor, in natural pixels.
	    const imageY = (scroller.scrollTop + pointY) / zoom;

	    zoom = newZoom;
	    img.style.width = `${img.naturalWidth * zoom}px`;
	    img.style.height = `${img.naturalHeight * zoom}px`;

	    scroller.scrollLeft = imageX * zoom - pointX;
	    scroller.scrollTop = imageY * zoom - pointY;
	};



	/**********************************************************************/
	/* Initial size.  An image can say how big it should be when first shown
	   with data-initial-scale on the <img> (or, for all images in the dialog,
	   image-initial-scale on <j-tabbed-dialog>):

	     "0.35"   35% of the image's natural size
	     "fit"    the whole image, as large as will fit in the space

	   The same limits apply as to user zooming (no smaller than the whole
	   image, no larger than MAX_ZOOM times natural size).  The user can still
	   zoom in or out from there.  This is done once, as the image first
	   becomes available: it is not repeated if the window is resized. */

	const applyInitialScale = () => {
	    const spec = img?.dataset.initialScale ?? this.getAttribute("image-initial-scale");
	    if (null == spec || !img.naturalWidth) return;

	    const fit = Math.min(scroller.clientWidth / img.naturalWidth, scroller.clientHeight / img.naturalHeight);
	    const wanted = "fit" === spec ? fit : Number(spec);
	    if (!(wanted > 0)) { console.error(`Bad initial scale '${spec}': use a positive number, or "fit".`); return; }

	    zoom = Math.min(MAX_ZOOM, Math.max(Math.min(1, fit || 0), wanted));
	    img.style.width = `${img.naturalWidth * zoom}px`;
	    img.style.height = `${img.naturalHeight * zoom}px`;
	    scroller.scrollLeft = 0;
	    scroller.scrollTop = 0;
	};

	if (img)
	{
	    if (img.complete && img.naturalWidth > 0) applyInitialScale();
	    else img.addEventListener("load", applyInitialScale, { once: true });
	}



	/**********************************************************************/
	scroller.addEventListener("pointerdown", event => {
	    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
	    scroller.setPointerCapture(event.pointerId);

	    if (1 === pointers.size)
	    {
		beginDrag();
		scroller.classList.add("dragging");
	    }
	    else if (2 === pointers.size)
	    {
		const state = pinchState();
		lastDistance = state.distance;
		lastMidX = state.x;
		lastMidY = state.y;
	    }
	});



	/**********************************************************************/
	scroller.addEventListener("pointermove", event => {
	    const pointer = pointers.get(event.pointerId);
	    if (!pointer) return;

	    pointer.x = event.clientX;
	    pointer.y = event.clientY;

	    if (1 === pointers.size)
	    {
		scroller.scrollLeft = startScrollLeft - (pointer.x - startX);
		scroller.scrollTop = startScrollTop - (pointer.y - startY);
	    }
	    else if (2 === pointers.size)
	    {
		const state = pinchState();
		if (lastDistance > 0 && state.distance > 0) zoomBy(state.distance / lastDistance, state.x, state.y);
		scroller.scrollLeft -= state.x - lastMidX;
		scroller.scrollTop -= state.y - lastMidY;
		lastDistance = state.distance;
		lastMidX = state.x;
		lastMidY = state.y;
	    }
	});



	/**********************************************************************/
	const endPointer = event => {
	    if (!pointers.delete(event.pointerId)) return;

	    try { scroller.releasePointerCapture(event.pointerId); } catch (e) { /* Already released. */ }

	    if (1 === pointers.size) beginDrag();    // Pinch over: carry on dragging with the remaining finger.
	    if (0 === pointers.size) scroller.classList.remove("dragging");
	};

	scroller.addEventListener("pointerup", endPointer);
	scroller.addEventListener("pointercancel", endPointer);



	/**********************************************************************/
	/* The mouse wheel.  Not passive, because we need to stop the page
	   scrolling (or the browser zooming the whole page).  Trackpad pinch
	   gestures arrive here too, as wheel events with ctrlKey set, and
	   those carry small deltas, hence the larger multiplier. */

	scroller.addEventListener("wheel", event => {
	    if (!zoomable) return;
	    event.preventDefault();

	    let delta = event.deltaY;
	    if (1 === event.deltaMode) delta *= 16;         // Lines.
	    else if (2 === event.deltaMode) delta *= 400;   // Pages.

	    zoomBy(Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0015)), event.clientX, event.clientY);
	}, { passive: false });
    }

    
    /**************************************************************************/
    _generateTabbedDialogContentsHtml (dialogName, tabs)
    {
	let html = "";

	tabs.forEach(function(tab, index) {
	    let tabContent = tab.querySelector("j-tabbed-dialog-tab-content").innerHTML
	    html +=
              `<div id="j-tabbed-dialog-tab-content-${dialogName}-${index}" class="j-tabbed-dialog-impl-tab-content" tabbed-dialog-name="${dialogName}" index="${index}">
                ${tabContent}
              </div>`;
	});

	return html;
    }


    /**************************************************************************/
    /* Create the selector buttons for tabbed dialog box. */

    _generateTabbedDialogHeadersHtml (dialogName, tabs)
    {
	/**********************************************************************/
	let html = "";


	
	/**********************************************************************/
	/* The genuine buttons. */
	
	tabs.forEach(function(tab, index) {
	    let tabLabel = tab.querySelector("j-tabbed-dialog-tab-label").textContent;
	    html += `<button id="j-tabbed-dialog-selector-button-${dialogName}-${index}" class="j-tabbed-dialog-impl-tab-button" tabbed-dialog-name=${dialogName} index="${index}">${tabLabel}</button>`;
	});


	
	/**********************************************************************/
	/* The thing looks more like a tabbed dialog if you carry on the line
           which the butons sit on all the way across the page.  I've tried
           various ways of doing that, but the only way which seems to work
           is to create an invisible button like the others, organised to
           fill the entire remaining width.

           For that to work, I also need a container with display:flex.
        */
	
//	html += `<button class="j-tabbed-dialog-impl-tab-button" style="flex-grow:1; font-size:x-large; background: none; border-top: none; border-left: none; border-right: none; cursor: auto;"></button>`;
	return html;
    }


    /**************************************************************************/
    /* Handles open-dialog-tab clicks.  I was ensuring that only one tab was
       visible by manipulating the display settings (none vs flex).  However,
       ChatGPT recommended adding or removing j-tabbed-dialog-impl-visible-offscreen
       instead.  This keeps the window at full size, but just removes it to
       a position where it can't be seen.  This is a useful option, because
       actions in one tab here may affect the content of other tabs.  With
       display:none, the other tabs have zero width, and therefore may
       not update correctly.  With the expedient suggested here, they
       continue to have their normal width. */       

    _openDialogTab (dialogName, index)
    {
	const tabbedLayoutContentEntries = this.shadowRoot.querySelectorAll(`.j-tabbed-dialog-impl-tab-content[tabbed-dialog-name=${dialogName}]`);

	for (var i = 0; i < tabbedLayoutContentEntries.length; i++)
	    tabbedLayoutContentEntries[i].classList.add("j-tabbed-dialog-impl-visible-offscreen");

	const x = this.shadowRoot.querySelector(`.j-tabbed-dialog-impl-tab-content[tabbed-dialog-name=${dialogName}][index="${index}"]`);
	x.classList.remove("j-tabbed-dialog-impl-visible-offscreen"); x.style.display = "flex";

	const tabButtons = this.shadowRoot.querySelectorAll(`.j-tabbed-dialog-impl-tab-button[tabbed-dialog-name=${dialogName}]`);
	for (i = 0; i < tabButtons.length; i++)
	    tabButtons[i].classList.remove("j-tabbed-dialog-selector-button-selected");
	this.shadowRoot.querySelector(`.j-tabbed-dialog-impl-tab-button[tabbed-dialog-name=${dialogName}][index="${index}"]`).classList.add("j-tabbed-dialog-selector-button-selected");
    }
}
customElements.define("j-tabbed-dialog", JTabbedDialog);
