/******************************************************************************/
/* STEPBible User Guide -- everything the guide takes from J_Lib.

   Following the recommendation in J_Lib's creating4PanelLayouts guide, this is
   the only file which knows where J_Lib lives.  If J_Lib moves, change the
   paths here (the stylesheet URLs included) and nothing else.

   The guide is a two-panel layout (the guide itself, and a STEPBible
   scripture window), so it uses J_Lib's generic multi-panel layout and
   responsive (tabbed, on small screens) layout rather than the 4-panel one.
   J_Lib itself is used exactly as supplied.
*/

/******************************************************************************/
import "../J_Lib/j_tabbedDialog.js";   // <j-tabbed-dialog>, used by J_ResponsiveLayout for the narrow layout.

export { default as J_ResponsiveLayout } from "../J_Lib/j_responsiveLayout.js";
export { J_Utils }                       from "../J_Lib/j_utils.js";



/******************************************************************************/
/* Stylesheets.

   j_multiPanelLayout.css brings in j_common.css (STEPBible colour variables
   and base styles).  The editor needs only j_common.css. */

export const J_LIB_LAYOUT_CSS = new URL("../J_Lib/j_multiPanelLayout.css", import.meta.url);
export const J_LIB_COMMON_CSS = new URL("../J_Lib/j_common.css",           import.meta.url);


/******************************************************************************/
/* Adds the stylesheet before any other stylesheet on the page (so that the
   page's own styles win), and resolves once it has loaded. */

export function loadStylesheetFirst (url)
{
    return new Promise(resolve => {
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = url.href;
	link.addEventListener("load",  resolve, { once: true });
	link.addEventListener("error", resolve, { once: true }); // Better unstyled than invisible.
	const firstStylesheet = document.head.querySelector('link[rel="stylesheet"], style');
	document.head.insertBefore(link, firstStylesheet);
    });
}
