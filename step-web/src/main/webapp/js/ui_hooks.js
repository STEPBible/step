/**
 * This file defines a number of hooks that the server code can call.
 * The aim is to redirect the calls quickly to other parts of the UI
 */

/////////////////////////////////////////////////////////////////////////
// The following section defines method names and controller names
// These are used as part of the rest-like calls
/////////////////////////////////////////////////////////////////////////
BIBLE_GET_BIBLE_VERSIONS = "rest/bible/getBibleVersions/";
BIBLE_GET_BIBLE_TEXT = "rest/bible/getBibleText/";
BIBLE_GET_FEATURES = "rest/bible/getFeatures/";
BIBLE_GET_ALL_FEATURES = "rest/bible/getAllFeatures/";

MODULE_GET_ALL_MODULES = "rest/module/getAllModules/";
MODULE_GET_ALL_INSTALLABLE_MODULES = "rest/module/getAllModules/";
MODULE_GET_DEFINITION = "rest/module/getDefinition/";

SETUP_IS_FIRST_TIME = "rest/setup/isFirstTime/";
SETUP_INSTALL_DEFAULT_MODULES = "rest/setup/installDefaultModules/";
SETUP_INSTALL_BIBLE = "rest/setup/installBible/";

TIMELINE_GET_EVENTS = "rest/timeline/getEvents/";
TIMELINE_GET_EVENTS_FROM_REFERENCE = "rest/timeline/getEventsFromReference/";




/**
 * called when click on a piece of text.
 * @param strongMorphs all the strongs and morphs associated with this "word"
 */
function showAllStrongMorphs(strongMorphs) {
	$.shout("show-all-strong-morphs", strongMorphs);
}

/**
 * Called when clicking on a strong link
 * @param strong strong to be displayed
 */
function showStrong(strong, sourceElement) {
	showMorphOrStrong(strong, sourceElement);
}

/**
 * called when clicking on a morph
 * @param morph the moprh that is clicked on
 */
function showMorph(morph, sourceElement) {
	showMorphOrStrong(morph, sourceElement);
}

/** TODO: move this out of here to utils.js if we have more utility classes/functions 
 * helper function for morph and strongs 
*/
function showMorphOrStrong(tag, sourceElement) {
	//trigger the parent event - to show everything
	$(sourceElement).parent().click()
	
	//need to find what event is coming in, to get the clicked element and pass that down
	$("#lexiconDefinition span:contains(" + tag + ")").parent().click();	
}
