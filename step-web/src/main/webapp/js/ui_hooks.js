/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

/**
 * This file defines a number of hooks that the server code can call.
 * The aim is to redirect the calls quickly to other parts of the UI
 * 
 * The other calls here are for the menu system which are executing in any particular context
 */

/////////////////////////////////////////////////////////////////////////
// The following section defines method names and controller names
// These are used as part of the rest-like calls
/////////////////////////////////////////////////////////////////////////

BOOKMARKS_GET = 						STEP_SERVER_BASE_URL + "favourites/getBookmarks";
BOOKMARKS_ADD = 						STEP_SERVER_BASE_URL + "favourites/addBookmark/";
HISTORY_GET = 							STEP_SERVER_BASE_URL + "favourites/getHistory/";
HISTORY_ADD = 							STEP_SERVER_BASE_URL + "favourites/addHistory/";

BIBLE_GET_BIBLE_VERSIONS = 				STEP_SERVER_BASE_URL + "bible/getBibleVersions/";
BIBLE_GET_BIBLE_TEXT = 					STEP_SERVER_BASE_URL + "bible/getBibleText/";
BIBLE_GET_FEATURES = 					STEP_SERVER_BASE_URL + "bible/getFeatures/";
BIBLE_GET_ALL_FEATURES = 				STEP_SERVER_BASE_URL + "bible/getAllFeatures/";
BIBLE_GET_BIBLE_BOOK_NAMES = 			STEP_SERVER_BASE_URL + "bible/getBibleBookNames/";
BIBLE_GET_NEXT_CHAPTER =				STEP_SERVER_BASE_URL + "bible/getNextChapter/";
BIBLE_GET_PREVIOUS_CHAPTER = 			STEP_SERVER_BASE_URL + "bible/getPreviousChapter/";

DICTIONARY_GET_BY_HEADWORD = 			STEP_SERVER_BASE_URL + "dictionary/lookupDictionaryByHeadword/";
DICTIONARY_SEARCH_BY_HEADWORD = 		STEP_SERVER_BASE_URL + "dictionary/searchDictionaryByHeadword/"

MODULE_GET_ALL_MODULES = 				STEP_SERVER_BASE_URL + "module/getAllModules/";
MODULE_GET_ALL_INSTALLABLE_MODULES = 	STEP_SERVER_BASE_URL + "module/getAllInstallableModules/";
MODULE_GET_INFO =		 				STEP_SERVER_BASE_URL + "module/getInfo/";

SETUP_IS_FIRST_TIME = 					STEP_SERVER_BASE_URL + "setup/isFirstTime/";
SETUP_INSTALL_DEFAULT_MODULES = 		STEP_SERVER_BASE_URL + "setup/installDefaultModules/";
SETUP_INSTALL_BIBLE = 					STEP_SERVER_BASE_URL + "setup/installBible/";

TIMELINE_GET_EVENTS = 					STEP_SERVER_BASE_URL + "timeline/getEvents/";
TIMELINE_GET_EVENTS_IN_PERIOD = 		STEP_SERVER_BASE_URL + "timeline/getEventsInPeriod/";
TIMELINE_GET_EVENTS_FROM_REFERENCE = 	STEP_SERVER_BASE_URL + "timeline/getEventsFromReference/";
TIMELINE_GET_CONFIGURATION = 			STEP_SERVER_BASE_URL + "timeline/getTimelineConfiguration";

USER_LOGIN = 							STEP_SERVER_BASE_URL + "user/login/";
USER_LOGOUT = 							STEP_SERVER_BASE_URL + "user/logout/";
USER_REGISTER = 						STEP_SERVER_BASE_URL + "user/register/";
USER_GET_LOGGED_IN_USER = 				STEP_SERVER_BASE_URL + "user/getLoggedInUser";

GEOGRAPHY_GET_PLACES = 					STEP_SERVER_BASE_URL + "geography/getPlaces/";
	
//////////////////////////
// SOME DEFAULTS
//////////////////////////
var DEFAULT_POPUP_WIDTH = 500;
var DETAIL_LEVELS = ["Quick", "Deeper", "Detailed"]

/**
 * a helper function that returns the passageId relevant to the menu item provided
 * @param menuItem the menuItem 
 * @return id of the passage
 */
function getPassageId(menuItem) {
	return $(menuItem).closest(".passageContainer").attr("passage-id");
}



/** a simple toggler for the menu items */
function toggleMenuItem(menuItem) {
	//the hook needs to find the passage id if we're a sub menu
	var eventName = "pane-menu-toggle-item";
	var passageId = getPassageId(menuItem);
	if(passageId) {
		eventName += "-" + passageId;
	} else {
		//append passage
	}
	
	$.shout(eventName, menuItem.name);
};

function changePassage(element, passageReference) {
	$("#previewReference").hide();
	$.shout("new-passage-" + getPassageId(element), passageReference);
}

/**
 * show bubble from relevant passage object
 * @param element
 * @param passageReference
 */
function viewPassage(element, passageReference) {
	//only shout preview if the preview bar is not displaying options on it.
	if(!$("#previewBar").is(":visible") || !$("#previewReference").is(":visible")) {
		$.shout("show-preview-" + getPassageId(element), { source: element, reference: passageReference});
	}
}

/**
 * we show the preview options in the box that shows the reference.
 */
function showPreviewOptions() {
	var previewBar = $("#previewBar");
	$("#previewLeft", previewBar).button({text: false, icons: { primary:"ui-icon-arrowthick-1-w" }}).click(
			function(){
				$.shout("new-passage-0", $("#previewReference .previewReferenceKey").text().replace(/[\[\]]/g, ""));
				$("#previewClose").trigger("click");
			});
	$("#previewClose", previewBar).button({text: false, icons: { primary:"ui-icon-close" }}).click(
			function() { 
				$("#previewBar").hide();
				$("#previewReference").hide();
			});
	$("#previewRight", previewBar).button({text: false, icons: { primary:"ui-icon-arrowthick-1-e" }}).click(
			function(){
				$.shout("new-passage-1", $("#previewReference .previewReferenceKey").text());
				$("#previewClose").trigger("click");
			});
	previewBar.show();
	
	//we remove handlers that close the popup and make it resizable and draggable + remove margin from container top
	$("#previewReference").resizable({maxWidth: 500}).off("mouseleave.previewscripture").draggable({handle: "#previewBar"});
	$(".notesPane").off("mouseleave.previewscripture");
	$(".notesPane").off("mouseleave");
	//remove any margin from the container top
	
}

/**
 * shows the login popup
 */
function login() {
	$.shout("show-login-popup");
};

/**
 * shows the interlinear options as a popup
 * @param menuItem the menuItem to tick if the popup selects options
 */
function showInterlinearChoices(menuItem) {
	//get passage id from menu parent
	$.shout("interlinear-menu-option-triggered-" + getPassageId(menuItem)); 
};

/**
 * called when click on a piece of text.
 */
function showDef(source) {
	var s = $(source);
	
	var strong = s.attr("strong");
	var morph = s.attr("morph");
	
	$.shout("show-all-strong-morphs", { strong: strong, morph: morph, source: source});
};


/** TODO: move this out of here to utils.js if we have more utility classes/functions 
 * helper function for morph and strongs 
*/
function showInfo(tag, sourceElement) {
	//trigger the parent event - to show everything
	$(sourceElement).parent().click();
	
	//need to find what event is coming in, to get the clicked element and pass that down
	$("#lexiconDefinition span:contains(" + tag + ")").parent().click();	
};

function showArticle(headword, instance) {
	var passageId = $("#selectedPane").val();
	
	$.getSafe(DICTIONARY_GET_BY_HEADWORD + headword + "/" + instance, function(data) {
		//TODO finish this off...
		$(".passageContainer[passage-id = " + passageId + "]").html(data.text);
	});
}

function showAbout() {
	//show popup for About box
	$( "#about" ).dialog({ 
		buttons: { "Ok": function() { $(this).dialog("close"); } },
		width: DEFAULT_POPUP_WIDTH,
		title: "STEP :: Scripture Tools for Every Pastor",
	});
};

/**
 * Shows the timeline module
 */
function showTimelineModule(menuItem) {
	showBottomSection(menuItem);
	$.shout("show-timeline", { passageId : + getPassageId(menuItem) });
};

/**
 * shows the geography module
 */
function showGeographyModule(menuItem) {
	showBottomSection();
	$.shout("show-maps", { passageId : + getPassageId(menuItem) } );
};

/**
 * shows the bottom section
 */
function showBottomSection(menuItem) {
	if (getPassageId(menuItem) == 0)
	{
		var verse = $('#leftPassageReference').val();
		$('.timelineContext:first').html(verse);
	}
	else
	{
		var verse = $('#rightPassageReference').val();
		$('.timelineContext:first').html(verse);	
	}

	var bottomSection = $("#bottomSection");
	var bottomSectionContent = $("#bottomSectionContent");
	
	bottomSection.show();
	bottomSection.height(250);
	bottomSectionContent.height(225);
	
	refreshLayout();
}

function hideBottomSection() {
	var bottomSection = $("#bottomSection");
	var bottomSectionContent = $("#bottomSectionContent");

	bottomSection.hide();
	bottomSection.height(0);
	bottomSectionContent.height(0);
	
	refreshLayout();
}
