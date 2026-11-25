/******************************************************************************/
/* STEPBible User Guide -- application set-up (see application.html).

   - Wide screens: J_Lib's multi-panel layout, guide on the left, scripture
     on the right.
   - Narrow screens: J_ResponsiveLayout turns the two panels into two tabs.
   - Links in the guide to STEPBible passages and searches are shown in the
     scripture panel (switching to its tab on narrow screens).
   - The user's STEPBible colours and font size are applied to the page and
     to the scripture window, and re-applied if they change.

   The scripture window is the STEPBible instance serving this page (the
   local one in offline STEPBible, stepbible.org in production), so relative
   URLs are used throughout.
*/

/******************************************************************************/
import { J_ResponsiveLayout, J_LIB_LAYOUT_CSS, loadStylesheetFirst } from "./imports.js";
import { JUserGuide }         from "./j_userGuide.js";
import { JUserGuideSettings } from "./j_userGuideSettings.js";

const _SCRIPTURE_START = "/?skipwelcome&noredirect";
const _GUIDE_PANEL     = "jUG-guide-holder";
const _SCRIPTURE_PANEL = "jUG-scripture-holder";


/******************************************************************************/
class _ClassApplication
{
    /**************************************************************************/
    async initialise ()
    {
	await loadStylesheetFirst(J_LIB_LAYOUT_CSS);
	document.body.style.visibility = "";

	const scripture = document.getElementById("jUG-scripture-iframe");
	this._scripture = scripture;

	/* Re-apply the user's settings to the scripture window each time it
	   loads (and when the settings change). */

	scripture.addEventListener("load", () => JUserGuideSettings.applyToFrame(scripture));
	JUserGuideSettings.init(() => JUserGuideSettings.applyToFrame(scripture));
	scripture.src = _SCRIPTURE_START;

	J_ResponsiveLayout.initialise({
	    panels: [ { id: _GUIDE_PANEL,     label: "User Guide" },
		      { id: _SCRIPTURE_PANEL, label: "Scripture"  } ],
	    initialPanel: _GUIDE_PANEL
	});

	await JUserGuide.init({ openInStep: url => this.showInScripture(url) });
    }


    /**************************************************************************/
    /* Shows a STEPBible URL (eg "/?q=reference=John.3") in the scripture
       panel, bringing its tab to the front on narrow screens. */

    showInScripture (relativeUrl)
    {
	const url = new URL(relativeUrl, window.location.origin);
	if (!url.searchParams.has("skipwelcome")) url.searchParams.set("skipwelcome", "");
	if (!url.searchParams.has("noredirect"))  url.searchParams.set("noredirect", "");
	this._scripture.src = url.pathname + url.search.replace(/=(&|$)/g, "$1") + url.hash;
	J_ResponsiveLayout.showPanel(_SCRIPTURE_PANEL);
    }
}

export const Application = new _ClassApplication();
