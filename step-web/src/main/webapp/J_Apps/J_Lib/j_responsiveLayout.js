/******************************************************************************/
/* All down to Claude.  I won't pretend to have read through this and
   understood it.

   Switches a multi-panel layout between a 'wide' arrangement (the normal
   multi-panel grid) and a 'narrow' arrangement for small screens, in which
   each panel becomes one tab of a tabbed dialog, so that only one panel is
   visible at a time.  The switch happens automatically, both when the page
   first loads and whenever the user resizes the browser window across the
   boundary.

   What you need:

   1. The wide layout, exactly as usual (see j_multiPanelLayout.css).  Each
      panel must be an element with an id (the 'holder' for that panel).

   2. A call such as:

        J_ResponsiveLayout.initialise({
            panels: [ { id: "search-box-holder", label: "Search"    },
                      { id: "scripture-holder",  label: "Scripture" },
                      { id: "info-box-holder",   label: "Info"      },
                      { id: "map-holder",        label: "Map"       } ],
            onLayoutChange: mode => { ... }       // Optional.  "wide" or "narrow".
        });

      Call it _after_ the panels have been populated (ie after
      J_Utils.initialiseTemplates), because it needs the panels to exist.
      The panels appear as tabs in the order given.

   Optional settings:

      wideLayoutSelector       Defaults to ".j-multi-panel-layout-overall-layout".

      initialPanel             The id of the panel whose tab is selected when
                               the narrow layout is first shown.  Defaults to
                               the first panel.  Later switches back and forth
                               between wide and narrow keep whichever tab the
                               user was last on.

      minimumWidthOfWideLayout Defaults to the --minimumSizeOfBigScreens
                               variable in j_common.css (960).  Screens
                               narrower than this get the narrow layout.

   Other things you can do:

      J_ResponsiveLayout.isNarrow            true if the narrow layout is in use.

      J_ResponsiveLayout.showPanel(id)       In the narrow layout, selects the
                                             tab for that panel (so, for
                                             instance, you can jump to the info
                                             tab after the user picks something
                                             on the search tab).  Does nothing
                                             in the wide layout, where all
                                             panels are visible anyway.

   The html element carries data-j-layout="wide" or "narrow", which you can
   use in CSS (the stylesheet uses it to hide the map's resize handle in the
   narrow layout).



   How it works, and a warning
   ---------------------------

   The panels are _moved_ from the wide layout into the tabbed dialog (and back
   again), rather than being copied, so they keep their state -- what the user
   has typed, scroll positions, and so on.  They are slotted into the dialog,
   which is why the dialog needs no changes to host them.

   Moving an element in the DOM causes connectedCallback to run again for it
   and for every custom element inside it.  Any component which is to live in
   a panel must therefore be written so that connectedCallback does its set-up
   only once (see the _j_initialised tests in the existing components).  An
   <iframe> inside a panel is reloaded (from its current src) when the panel
   is moved, because that is what browsers do.

   Claude   STEPBible   Oct-2026
*/

/******************************************************************************/

/* This uses the j-tabbed-dialog tag, so j_tabbedDialog.js must have been
   imported somewhere (as it already is, in j_placesImports.js).  I don't
   import it here because a custom element can be defined only once, and
   the same file reached by two different URL spellings counts as two
   different modules. */


/******************************************************************************/
class _J_ResponsiveLayout
{
    /**************************************************************************/
    initialise ({ panels, wideLayoutSelector = ".j-multi-panel-layout-overall-layout", minimumWidthOfWideLayout = null, onLayoutChange = null, initialPanel = "j-application-specific-holder" } = {})
    {
	/**********************************************************************/
	this._wideLayout = document.querySelector(wideLayoutSelector);
	if (!this._wideLayout)
	    throw new Error(`J_ResponsiveLayout: no element matches '${wideLayoutSelector}'.`);

	this._panels = panels.map(panel => {
	    const holder = document.getElementById(panel.id);
	    if (!holder)
		throw new Error(`J_ResponsiveLayout: no element with id '${panel.id}'.`);
	    return { id: panel.id, label: panel.label, holder: holder, placeholder: null };
	});

	this._onLayoutChange = onLayoutChange;
	this._initialPanel = initialPanel;
	this._narrowLayout = null; // Built the first time we need it.
	this._mode = null;



	/**********************************************************************/
	const minimum = minimumWidthOfWideLayout ?? this._getDefaultMinimumWidth();
	const query = window.matchMedia(`(max-width: ${minimum - 0.02}px)`);
	query.addEventListener("change", event => { this._apply(event.matches ? "narrow" : "wide"); });
	this._apply(query.matches ? "narrow" : "wide");
    }


    /**************************************************************************/
    get isNarrow ()
    {
	return "narrow" === this._mode;
    }

    
    /**************************************************************************/
    showPanel (id)
    {
	if (!this.isNarrow) return;

	const index = this._panels.findIndex(panel => id === panel.id);
	if (index >= 0)
	    this._narrowLayout.querySelector("j-tabbed-dialog").selectTab(index);
    }


    /**************************************************************************/
    _getDefaultMinimumWidth ()
    {
	const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--minimumSizeOfBigScreens"));
	return Number.isFinite(value) ? value : 960;
    }


    /**************************************************************************/
    _apply (mode)
    {
	if (mode === this._mode) return;

	if ("narrow" === mode)
	    this._moveToNarrowLayout();
	else
	    this._moveToWideLayout();

	this._mode = mode;
	document.documentElement.dataset.jLayout = mode;
	if (this._onLayoutChange) this._onLayoutChange(mode);
    }


    /**************************************************************************/
    _moveToNarrowLayout ()
    {
	if (!this._narrowLayout) this._buildNarrowLayout();

	const dialog = this._narrowLayout.querySelector("j-tabbed-dialog");

	this._panels.forEach((panel, index) => {
	    panel.placeholder = document.createComment(` home of ${panel.id} in the wide layout `);
	    panel.holder.replaceWith(panel.placeholder);
	    panel.holder.setAttribute("slot", `j-narrow-panel-${index}`);
	    dialog.append(panel.holder);
	});

	this._wideLayout.hidden = true;
	this._narrowLayout.hidden = false;
    }


    /**************************************************************************/
    _moveToWideLayout ()
    {
	this._panels.forEach(panel => {
	    if (!panel.placeholder) return; // Can happen on first call, when we have never been narrow.
	    panel.holder.removeAttribute("slot");
	    panel.placeholder.replaceWith(panel.holder);
	    panel.placeholder = null;
	});

	this._wideLayout.hidden = false;
	if (this._narrowLayout) this._narrowLayout.hidden = true;
    }


    /**************************************************************************/
    /* Creates the tabbed dialog.  Each tab's content is just a slot, which the
       panel is later moved into.  The dialog is created hidden and kept for
       subsequent switches, which means it remembers which tab was selected. */

    _buildNarrowLayout ()
    {
	const container = document.createElement("div");
	container.className = "j-multi-panel-layout-narrow-layout";
	container.hidden = true;

	const dialog = document.createElement("j-tabbed-dialog");
	dialog.setAttribute("tabbed-dialog-name", "jNarrowLayoutTabs");

	this._panels.forEach((panel, index) => {
	    const description = document.createElement("j-tabbed-dialog-tab-description");

	    const label = document.createElement("j-tabbed-dialog-tab-label");
	    label.textContent = panel.label;

	    const content = document.createElement("j-tabbed-dialog-tab-content");
	    const slot = document.createElement("slot");
	    slot.name = `j-narrow-panel-${index}`;
	    content.append(slot);

	    description.append(label, content);
	    dialog.append(description);
	});

	container.append(dialog);
	this._wideLayout.after(container); // The dialog's connectedCallback runs here.
	this._narrowLayout = container;

	/* Initial tab.  Left alone, the dialog opens on the first tab. */
	if (this._initialPanel)
	{
	    const index = this._panels.findIndex(panel => this._initialPanel === panel.id);
	    if (index < 0)
		throw new Error(`J_ResponsiveLayout: initialPanel '${this._initialPanel}' is not one of the panels.`);
	    dialog.selectTab(index);
	}
    }
}

const J_ResponsiveLayout = new _J_ResponsiveLayout();
export default J_ResponsiveLayout;
