/**
 * This file defines a number of hooks that the server code can call.
 * The aim is to redirect the calls quickly to other parts of the UI
 */

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
function showStrong(strong) {
	$.shout("show-strong", strong);
	
	//need to find what event is coming in, to get the clicked element and pass that down
	
	//invoke show-all-strong-morphs first, for all 
	
	//select span containing text <strong>, then get its parent and invoke click() on it. 
}

/**
 * called when clicking on a morph
 * @param morph the moprh that is clicked on
 */
function showMorph(morph) {
	
}
