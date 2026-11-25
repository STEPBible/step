/******************************************************************************/
/* Provides for a search box into which the user types, and an options table
   which drops down beneath it, over the top of whatever else is on the page,
   showing the elements which match the input string to date.

   The search box itself has a fixed height, so it never changes the layout
   of the page.  When the user clicks in it, the box and the options table
   come out on top of everything else (and may become wider than the space
   the box normally occupies, though only as wide as the columns need -- see the
   configuration variables below).
   Hitting ESCAPE, clicking outside the area, tabbing away, or selecting
   an item all hide the options table again, leaving only the search box.

   To use this, your HTML needs to include code something like this (the
   header is optional, and you don't _have_ to use the class which I have
   below, but it does give you the standard formatting we are using
   elsewhere.

    <h2 class="j-input-box-with-options-table-header" >Places in the Bible</h2>
    <j-input-box-with-options-table input-box-with-options-name="j-search-box"></j-input-box-with-options-table>


   In addition, you need to populate the options table -- see
   j_optionsTableInitialiser.js


   Elements are nested as follows (the dropdown is positioned absolutely
   relative to the anchor, which is what keeps the layout stable):

     +----------------------------------------------------------------+
     | j-input-box-with-options-table-search-box-holder               |
     |                                                                |
     |  j-input-box-with-options-table-header  (optional)             |
     |                                                                |
     |  +----------------------------------------------------------+  |
     |  | -anchor  (fixed height: the space the search box occupies)|  |
     |  |  +----------------------------------------------------+  |  |
     |  |  | -dropdown  (absolute; widens and floats when active)|  |  |
     |  |  |  -search-row:   icon, -search-box (input), clear    |  |  |
     |  |  |  -table-container                                  |  |  |
     |  |  |     -table (the options)                           |  |  |
     |  |  +----------------------------------------------------+  |  |
     |  +----------------------------------------------------------+  |
     +----------------------------------------------------------------+


   Items are selected either by typing into the search box or by clicking
   on a row.  The UP and DOWN arrow keys move a highlight through the rows
   which are currently showing (the list scrolls to keep it in view), and
   hitting ENTER selects the highlighted row.  If nothing is highlighted,
   ENTER selects the row if only one is visible.  Hitting ESCAPE in the search box
   clears the search and hides the options.

   Raises j-input-box-with-options-table-row-selected when an item is selected,
   giving the row number.

   Raises j-input-box-with-options-table-search-cancelled if the search is
   cancelled.

   There are other events too; but probably the only one of real interest is
   j-input-box-with-options-table-row-selected.


   Configuration (CSS custom properties, set on the element or an ancestor):

     --j-input-box-with-options-table-active-max-width
         The most width the box and options may take while the search is active
         (default 90vw -- ie 90% of the width of the window).  They take only as
         much as the columns need (see the width and maxWidth settings in
         j_optionsTableInitialiser.js), but never less than the box normally has.
     --j-input-box-with-options-table-box-height        Default 44px.
     --j-input-box-with-options-table-table-max-height  Overrides the automatic
         limit (the space down to the bottom of the screen).
     --clr-j-input-box-with-options-table-search-box-bg Colour of the search box.
     --clr-j-input-box-with-options-table-dropdown-bg   Colour of the options.
     --clr-j-input-box-with-options-table-border        Border colour.
     --clr-j-input-box-with-options-table-muted         Colour of secondary text.
     --clr-j-input-box-with-options-table-row-stripe    Colour of alternate rows.  Set it equal
         to the dropdown colour to switch striping off.

   A Jamieson   STEPBible   Oct-2026
*/

/******************************************************************************/
const CSS = `
/******************************************************************************/
:host {
    display: block;
    position: relative;
    width: 100%;
    min-height: 0;

    --clr-j-input-box-with-options-table-search-box-bg: var(--clrLexiconFocusBG);
    --clr-j-input-box-with-options-table-dropdown-bg: var(--clrSecondary0, white);
    --clr-j-input-box-with-options-table-border: var(--clrSecondary3, #757575);
    --clr-j-input-box-with-options-table-muted: var(--clrSecondary4, #5c5c5c);
    --clr-j-input-box-with-options-table-row-stripe: color-mix(in srgb, var(--clr-j-input-box-with-options-table-border) 9%, var(--clr-j-input-box-with-options-table-dropdown-bg));
    --j-input-box-with-options-table-box-height: 44px;
    --j-input-box-with-options-table-active-max-width: 90vw;
    --j-input-box-with-options-table-table-clr-row-hover: var(--clr-j-hover-background);
    --j-input-box-with-options-table-table-clr-row-active: var(--clr-j-active-background);
}

/* While active we must be above everything else (the layout also raises the panel
   we live in, if it has one). */
:host(.j-active) {
    z-index: 2000;
}


/******************************************************************************/
/* An optional header. */

.j-input-box-with-options-table-header {
    margin-top: 6px;
    color: var(--clrText);
    font-size: 30px;
    font-weight: bold;
}

.j-input-box-with-options-table-header:empty {
    display: none;
}



/******************************************************************************/
/* A container which fits around the search box. */

.j-input-box-with-options-table-search-box-holder {
    display: block;
    padding-bottom: 5px;
    width: 100%;
}



/******************************************************************************/
/* The space which the search box occupies in the layout.  Its height is fixed,
   so nothing else on the page moves when the options appear. */

.j-input-box-with-options-table-anchor {
    position: relative;
    width: 100%;
    height: var(--j-input-box-with-options-table-box-height);
}



/******************************************************************************/
/* The search box and (when active) the options.  Taken out of the flow so that
   it can float over the rest of the page and become wider. */

.j-input-box-with-options-table-dropdown {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
}

/* When active, the box and options are as wide as the options need (which is
   governed by the column widths -- see j_optionsTableInitialiser.js), but never
   narrower than the box normally is, and never wider than the configured maximum
   or the space between here and the right-hand edge of the screen. */

.j-input-box-with-options-table-dropdown.active {
    width: max-content;
    min-width: 100%;
    max-width: min(var(--j-input-box-with-options-table-active-max-width), var(--j-input-box-with-options-table-auto-max-width, 100vw));
}



/******************************************************************************/
/* The rounded bar which holds the icon, the text and the clear button. */

.j-input-box-with-options-table-search-row {
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    height: var(--j-input-box-with-options-table-box-height);
    padding: 0 8px 0 12px;

    border: 2px solid var(--clr-j-input-box-with-options-table-border);
    border-radius: 12px;
    background: var(--clr-j-input-box-with-options-table-search-box-bg);
}

.j-input-box-with-options-table-dropdown.active .j-input-box-with-options-table-search-row {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.j-input-box-with-options-table-search-icon {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    fill: none;
    stroke: var(--clr-j-input-box-with-options-table-muted);
    stroke-width: 2;
    stroke-linecap: round;
}



/******************************************************************************/
/* The box the user types into. */

.j-input-box-with-options-table-search-box {
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
    padding: 0;
    margin: 0;

    font-family: inherit;
    font-size: 16px;                /* Not smaller, or iOS zooms in when focused. */
    line-height: 20px;

    border: none;
    outline: none;
    background: transparent;
    color: var(--clrText, black);
}

.j-input-box-with-options-table-search-box::placeholder {
    color: var(--clr-j-input-box-with-options-table-muted);
}



/******************************************************************************/
/* Clears the search text. */

.j-input-box-with-options-table-clear {
    flex: 0 0 auto;
    display: none;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--clr-j-input-box-with-options-table-muted);
    font-size: 20px;
    line-height: 28px;
    cursor: pointer;
}

.j-input-box-with-options-table-clear:hover {
    background: var(--j-input-box-with-options-table-table-clr-row-hover);
}

.j-input-box-with-options-table-clear.visible {
    display: block;
}



/******************************************************************************/
/* Sits around the options table; hidden unless the search is active. */

.j-input-box-with-options-table-table-container {
    display: none;
    box-sizing: border-box;
    margin-top: 6px;
    width: max-content;       /* Only as wide as the columns need ... */
    max-width: 100%;          /* ... but no wider than the search box above it. */

    --j-input-box-with-options-table-auto-max-height: 60vh;   /* Replaced by the code. */
    max-height: var(--j-input-box-with-options-table-table-max-height, var(--j-input-box-with-options-table-auto-max-height));
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;

    border: 2px solid var(--clr-j-input-box-with-options-table-border);
    border-radius: 12px;
    background: var(--clr-j-input-box-with-options-table-dropdown-bg);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}



/******************************************************************************/
/* Lets you show the table when appropriate. */

.j-input-box-with-options-table-table-container.active {
    display: block;
}



/******************************************************************************/
/* Shown instead of the table when nothing matches. */

.j-input-box-with-options-table-no-matches {
    display: none;
    padding: 12px 16px;
    color: var(--clr-j-input-box-with-options-table-muted);
    font-family: Georgia, serif;
}

.j-input-box-with-options-table-table-container.no-matches .j-input-box-with-options-table-no-matches {
    display: block;
}



/******************************************************************************/
/* The search table. */

.j-input-box-with-options-table-table {
    background: none;
    table-layout: auto;
    width: 100%;
    border-collapse: collapse;
}



/******************************************************************************/
/* A single column. */

.j-input-box-with-options-table-table-col {
    background: none;
    padding: 8px 14px;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--clr-j-input-box-with-options-table-border) 30%, transparent);
    word-wrap: break-word; /* Old browsers. */
    overflow-wrap: anywhere; /* New ones. */
    vertical-align: middle;
    color: var(--clrText);
    font-family: Georgia, serif;
    font-size: var(--defaultFontSize) !important;
    box-sizing: border-box;
    min-width: 0;
}

/* Second and subsequent columns are secondary information. */
.j-input-box-with-options-table-table-col + .j-input-box-with-options-table-table-col {
    color: var(--clr-j-input-box-with-options-table-muted);
}



/******************************************************************************/
/* Distinguish the first column to indicate it's the one which gets searched. */

.j-input-box-with-options-table-first-column {
    color: #111111;
}



/******************************************************************************/
/* The text within a column which has a maxWidth (the width itself is set inline
   by j_optionsTableInitialiser.js). */

.j-input-box-with-options-table-cell-content {
    box-sizing: border-box;
}



/******************************************************************************/
/* A row. */

.j-input-box-with-options-table-table tr {
    cursor: pointer;
}

/* Alternate rows have a different colour.  Rows hidden by the filter are not
   counted, so the stripes stay regular however many rows are showing.  (Needs
   a browser from 2023 or later; in older ones there simply are no stripes.)
   The :where() matters: it gives the stripe rule no extra specificity, so the hover,
   highlight and active rules below win over it whichever order they appear in. */

.j-input-box-with-options-table-table tr:where(:nth-child(even of :not([style*="display: none"]))) {
    background-color: var(--clr-j-input-box-with-options-table-row-stripe);
}

.j-input-box-with-options-table-table tr:hover {
    background-color: var(--j-input-box-with-options-table-table-clr-row-hover);
}

.j-input-box-with-options-table-table tr.j-highlighted {
    background-color: var(--j-input-box-with-options-table-table-clr-row-hover);
}

.j-input-box-with-options-table-table tr:active {
    background-color: var(--j-input-box-with-options-table-table-clr-row-active);
}
`;



/******************************************************************************/
class J_InputBoxWithOptionsTable extends HTMLElement
{
    /*************************************************************************/
    connectedCallback()
    {
	/**********************************************************************/
        /* connectedCallback runs again every time the element (or any ancestor)
           is moved in the DOM -- which happens when the responsive layout swaps
           between the wide and narrow arrangements.  Everything here must
           therefore be done only once. */
	
        if (this._j_initialised) return;
        this._j_initialised = true;



	/**********************************************************************/
	this._name = this.getAttribute("j-input-box-with-options-name");
        this._matcher = null;
	this._buildHtml();
        this._attachHandlers();
    }


    /*************************************************************************/
    setHeader (htmlContent)
    {
	this.shadowRoot.querySelector(".j-input-box-with-options-table-header").innerHTML = htmlContent;
    }

    
    /*************************************************************************/
    setRowMatcher (matcher)
    {
        this._matcher = matcher;
    }


    /**************************************************************************/
    _attachHandlers ()
    {
	/**********************************************************************/
	const searchBox = this.shadowRoot.querySelector(".j-input-box-with-options-table-search-box")
	const table = this.shadowRoot.querySelector(".j-input-box-with-options-table-table");
	const clearButton = this.shadowRoot.querySelector(".j-input-box-with-options-table-clear");
	const tableContainer = this.shadowRoot.querySelector(".j-input-box-with-options-table-table-container");



	/**********************************************************************/
	/* Set things up when the user clicks in the box into which they type. */
	
	const activateIfNecessary = () => {
	    if (!tableContainer.classList.contains("active")) this._setActive(true);
	};

	searchBox.addEventListener("focus", () => {
            this._setActive(true);
	});

	/* After ESCAPE the search is no longer active but the box keeps the focus,
	   so no further 'focus' event will arrive.  Clicking in the box, or typing
	   into it, must therefore bring the options table back. */

	searchBox.addEventListener("pointerdown", activateIfNecessary);
	searchBox.addEventListener("input", activateIfNecessary);



	/**********************************************************************/
	/* Inform interested parties that the user has typed something. */
	
	searchBox.addEventListener("input", () => {
	    if (this._matcher) this._matcher(searchBox.value);
	    this._afterFilterChange();
            this.dispatchEvent(
		new CustomEvent("j-input-box-with-options-table-search-input-change", {
                    bubbles: true,
                    composed: true,
                    detail: { value: searchBox.value }
		})
            );
	});



	/**********************************************************************/
	/* The clear button empties the box but leaves the search active.  Pressing
	   (not just clicking) must not take the focus away from the box. */

	clearButton.addEventListener("pointerdown", event => event.preventDefault());
	clearButton.addEventListener("click", () => {
	    searchBox.value = "";
	    searchBox.dispatchEvent(new Event("input"));
	    searchBox.focus();
	});



	/**********************************************************************/
	/* Handle ENTER and ESCAPE presses.  The former selects an item, but
	   only if at present we have just one item visible in the table (ie
	   there is no ambiguity).  The latter abandons input and selects
	   nothing.  TAB moves the focus elsewhere, so the options are hidden. */
	
	searchBox.addEventListener("keydown", event => {
            if ("Enter" === event.key)
            {
		event.preventDefault();

		const highlighted = this._highlightedRow();
		const visibleRows = this._visibleRows();

		if (highlighted)
		    this._completeSelection(highlighted.getAttribute("n"));
		else if (1 === visibleRows.length)
                    this._completeSelection(visibleRows[0].getAttribute("n"));
            }
            else if ("Escape" === event.key)
		this._cancelSelection();
	    else if ("Tab" === event.key)
		this._setActive(false);
	    else if ("ArrowDown" === event.key || "ArrowUp" === event.key ||
		     "PageDown" === event.key || "PageUp" === event.key)
	    {
		event.preventDefault();                                  // Stops the text cursor jumping about.
		if (!tableContainer.classList.contains("active")) this._setActive(true);
		const step = ("ArrowDown" === event.key || "PageDown" === event.key) ? 1 : -1;
		this._moveHighlight(step, event.key.startsWith("Page") ? 8 : 1);
	    }
	});



	/**********************************************************************/
	/* Handles row clicks. */
	
	table.addEventListener("click", event => {
            const row = event.target.closest("tr[n]");
            if (row) this._completeSelection(row.getAttribute("n"));
	});




	/**********************************************************************/
	/* Arranges to deactivate the search facility if the user has clicked
           anywhere outside the area. */
	
	document.addEventListener("pointerdown", event => {
            const path = event.composedPath();
	    const usingResizeControl = path.some(el => el.hasAttribute?.("data-j-resize-control"));   // Resizing panels shouldn't affect the search.

            if (!path.includes(this) && !usingResizeControl) {
		this._setActive(false);
            }
	});



	/**********************************************************************/
	/* The options must not run off the bottom of the screen, so we limit their
	   height according to the space available.  That changes if the window is
	   resized or (on a phone) the on-screen keyboard appears. */

	const refit = () => { if (this.classList.contains("j-active")) this._fitToScreen(); };
	window.addEventListener("resize", refit);
	window.visualViewport?.addEventListener("resize", refit);
    }
    

    /**************************************************************************/
    _buildHtml ()
    {
	const html = `
          <div class="j-input-box-with-options-table-search-box-holder">
            <div class="j-input-box-with-options-table-header"></div>
            <div class="j-input-box-with-options-table-anchor">
              <div class="j-input-box-with-options-table-dropdown">
                <div class="j-input-box-with-options-table-search-row">
                  <svg class="j-input-box-with-options-table-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>
                  <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"
                         input-box-with-options-table-name="${this._name}" class="j-input-box-with-options-table-search-box" placeholder="Search ...">
                  <button type="button" class="j-input-box-with-options-table-clear" aria-label="Clear" tabindex="-1">&times;</button>
                </div>
                <div class="j-input-box-with-options-table-table-container">
                  <table input-box-with-options-table-name="${this._name}" class="j-input-box-with-options-table-table"></table>
                  <div class="j-input-box-with-options-table-no-matches">No matches</div>
                </div>
              </div>
            </div>
          </div>
        `;

        this.attachShadow({ mode: "open" }).innerHTML = `
            <style>${CSS}</style>
            ${html}
        `;

    }

    
    /**************************************************************************/
    /* Called when the user wants to abandon what they're doing (Escape).
       No row number is reported. */

    _cancelSelection ()
    {
	this.dispatchEvent(
            new CustomEvent("j-input-box-with-options-table-search-cancelled", {
		bubbles: true,
		composed: true
            })
	);

	this._resetSearchBox();
    }


    /**************************************************************************/
    /* Called when the user has definitely selected a row -- either by typing
       enough to leave exactly one row showing and hitting Return, or by
       clicking a row directly.  Reports the row number, then resets the
       search box and hides the table ready for next time. */

    _completeSelection (rowNumber)
    {
	this.dispatchEvent(
            new CustomEvent("j-input-box-with-options-table-row-selected", {
		bubbles: true,
		composed: true,
		detail: { rowNumber: Number(rowNumber) }
            })
	);

	this._resetSearchBox();
    }


    /**************************************************************************/
    /* Clears things down after the user has made a selection or cancelled. */
    
    _resetSearchBox ()
    {
	const searchBox = this.shadowRoot.querySelector(".j-input-box-with-options-table-search-box");

	searchBox.value = "";
	if (this._matcher) this._matcher("");
	this._afterFilterChange();
	this._setActive(false);

	// Setting .value programmatically doesn't fire 'input', so tell
	// anyone listening (e.g. the row filter) explicitly.
	this.dispatchEvent(
            new CustomEvent("j-input-box-with-options-table-search-input-change", {
		bubbles: true,
		composed: true,
		detail: { value: "" }
            })
	);
    }


    /**************************************************************************/
    /* Things which depend upon what is currently in the box and which rows
       the filter has left visible: the clear button, the 'no matches'
       message, and the scroll position of the list. */

    _afterFilterChange ()
    {
	const searchBox = this.shadowRoot.querySelector(".j-input-box-with-options-table-search-box");
	const table = this.shadowRoot.querySelector(".j-input-box-with-options-table-table");
	const tableContainer = this.shadowRoot.querySelector(".j-input-box-with-options-table-table-container");

	this.shadowRoot.querySelector(".j-input-box-with-options-table-clear")
	    .classList.toggle("visible", "" !== searchBox.value);

	const rows = [...table.querySelectorAll("tr")];
	const anyVisible = rows.some(row => "none" !== row.style.display);
	tableContainer.classList.toggle("no-matches", rows.length > 0 && !anyVisible);

	tableContainer.scrollTop = 0;
	this._clearHighlight();
    }


    /**************************************************************************/
    /* Arrow-key navigation.  The highlighted row is the one which Enter will
       select.  Nothing is highlighted to begin with (so that ENTER with exactly
       one row showing still works as it always did); the first ArrowDown
       highlights the first visible row, the first ArrowUp the last.  Movement
       wraps round.  Typing, or hiding the options, removes the highlight. */

    _visibleRows ()
    {
	const table = this.shadowRoot.querySelector(".j-input-box-with-options-table-table");
	return [...table.querySelectorAll("tr")].filter(row => "none" !== row.style.display);
    }

    _highlightedRow ()
    {
	const row = this.shadowRoot.querySelector(".j-input-box-with-options-table-table tr.j-highlighted");
	return row && "none" !== row.style.display ? row : null;
    }

    _clearHighlight ()
    {
	this.shadowRoot.querySelector(".j-input-box-with-options-table-table tr.j-highlighted")?.classList.remove("j-highlighted");
    }

    _moveHighlight (direction, distance)
    {
	const rows = this._visibleRows();
	if (0 === rows.length) return;

	const current = this._highlightedRow();
	let index;
	if (!current) index = direction > 0 ? 0 : rows.length - 1;
	else
	{
	    index = rows.indexOf(current) + direction * distance;
	    if (distance > 1) index = Math.max(0, Math.min(rows.length - 1, index));   // Page keys stop at the ends.
	    else index = (index + rows.length) % rows.length;                           // Arrow keys wrap.
	}

	this._clearHighlight();
	rows[index].classList.add("j-highlighted");
	rows[index].scrollIntoView({ block: "nearest" });
    }


    /**************************************************************************/
    /* Limits the height of the options so that they stay on the screen. */

    _fitToScreen ()
    {
	const tableContainer = this.shadowRoot.querySelector(".j-input-box-with-options-table-table-container");
	const anchor = this.shadowRoot.querySelector(".j-input-box-with-options-table-anchor");
	const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
	const space = viewportHeight - anchor.getBoundingClientRect().bottom - 6 /* gap */ - 16 /* margin */;
	tableContainer.style.setProperty("--j-input-box-with-options-table-auto-max-height", `${Math.max(120, space)}px`);

	const dropdown = this.shadowRoot.querySelector(".j-input-box-with-options-table-dropdown");
	const roomOnRight = document.documentElement.clientWidth - anchor.getBoundingClientRect().left - 8;
	dropdown.style.setProperty("--j-input-box-with-options-table-auto-max-width", `${Math.max(200, roomOnRight)}px`);
    }


    /**************************************************************************/
    /* Called when the user clicks in the search box or the search table.
       Makes things ready to receive input. */
    
    _setActive(active)
    {
	const tableContainer = this.shadowRoot.querySelector(".j-input-box-with-options-table-table-container");
	const dropdown = this.shadowRoot.querySelector(".j-input-box-with-options-table-dropdown");

	if (active) { this._fitToScreen(); this._afterFilterChange(); }

	tableContainer.classList.toggle("active", active);
	dropdown.classList.toggle("active", active);
	this.classList.toggle("j-active", active);

	this.dispatchEvent(
            new CustomEvent("j-input-box-with-options-table-search-active-change", {
		detail: { active },
		bubbles: true,
		composed: true
            })
	);
    }
}
customElements.define("j-input-box-with-options-table", J_InputBoxWithOptionsTable);





/******************************************************************************/
class _J_InputBoxWithOptionsTableInterface
{
    /**************************************************************************/
    /* The table is built using a custom tab and apparently that involves the
       shadow DOM in a way I have yet to understand. */
	
    getSearchTable (tableName)
    {
	const component = document.querySelector('j-input-box-with-options-table');
	return component.shadowRoot.querySelector(`table[input-box-with-options-table-name="${tableName}"]`);	
    }
}

const J_InputBoxWithOptionsTableInterface = new _J_InputBoxWithOptionsTableInterface();
export default J_InputBoxWithOptionsTableInterface;
