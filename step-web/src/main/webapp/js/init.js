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
// call the initialisation functions
init();

//some extensions (perhaps should go in another file)
String.prototype.startsWith = function(str) { return (this.match("^"+str)==str); };


function init() {
	$(document).ready(function() {
		initMenu();
		initGlobalHandlers();
		initLayout();

		//init modules
//		initModules()
		
		initData();
		
		initInitialEvents();
//		initLogin();
		
	});
}

function refreshLayout() {
	//we resize the heights:
	var windowHeight = $(window).height();
	var innerMenuHeight = $("#leftPaneMenu").height();
	var topMenuHeight = $("#topMenu").height();
	var headingContainerHeight = $(".headingContainer").height();
	var imageAndFooterHeight = $(".northBookmark").height() + $(".logo").height();
	var bottomSectionHeight = $("#bottomSection").height();
	var windowWithoutMenuNorModule = windowHeight - topMenuHeight - bottomSectionHeight; 
	var columnHeight = windowWithoutMenuNorModule;
	var bookmarkHeight = windowWithoutMenuNorModule - imageAndFooterHeight ;
	var passageTextHeight = windowWithoutMenuNorModule - innerMenuHeight;
	var gapBetweenMenuAndPassage = 5;
	var passageContentHeight = passageTextHeight - headingContainerHeight;
	
	
	$(".column").height(columnHeight);
	$(".bookmarkPane").height(bookmarkHeight);
	$(".passageText").height(passageTextHeight);
	$(".passageContent").css("top", headingContainerHeight + gapBetweenMenuAndPassage);
	$(".passageContent").height(passageContentHeight - gapBetweenMenuAndPassage * 2);	

//	alert(headingContainerHeight);
//	if($("#debug").text() == "") {
//		$("#bookmarkPane").append("<span id=\"debug\" />");		
//	}
//	
//	var heights = 
//		"window = " + windowHeight + "\n" + 
//		"paneMenu = " + innerMenuHeight + "\n" +
//		"topMenu = " + topMenuHeight + "\n" + 
//		"imageAndFooter = " + imageAndFooterHeight + "\n" +
//		"passageText = " + $(".passageText").height() + "\n" +
//		"heading = " + $(".headingContainer").height() + "\n" +
//		"passageContent = " + $(".passageContent").height() + "\n" ;
//		
//	$("#debug").text(heights);
	
}

/**
 * initialises layout
 */
function initLayout() {
	$("body").hear("passage-changed", function() {
		refreshLayout();
	});
	
	//listen to layout changes and alert
	$(window).resize(function() {
		refreshLayout();
	});
	
	
}

function initMenu() {
	new TopMenu($("#topMenu-ajax"));		
	var menusToBe = $(".innerMenus");
	menusToBe.each(function(index, value) {
		new ToolbarMenu(index, value);
	});
}

/**
 * sets up the initial data and passages
 */
function initData() {
	
	//get all supported versions
	var options = {};
	$.getJSON(BIBLE_GET_ALL_FEATURES, function(data) {
		$.each(data, function() {
			options = data;
		});
	});
	
	//get data for passages
	// make call to server first and once, to cache all passages:
	$.getJSON(BIBLE_GET_BIBLE_VERSIONS + "false", function(versionsFromServer) {
		var passages = initPassages(versionsFromServer, options);
		initInterlinearPopup(versionsFromServer);
		initModules(passages);
	});
}

/**
 * sets up the interlinear popup with the available versions
 * @param strongedVersions the list of strong versions
 */
function initInterlinearPopup(versionsFromServer) {
	$(".interlinearPopup").each(function(index, interlinearPopup) {
		new InterlinearPopup(versionsFromServer, index, interlinearPopup);
	});
};

/**
 * creates the passages components
 * @param allVersions the list of versions to be given to a dropdown
 * @param strongedVersions a list of version containing strong tagging
 * @param options a list of options to be displayed in the toolbar
 * @return a list of passage objects so that synchronous calls can be made
 */
function initPassages(allVersions, options) {
	//set up initial passages with reference data:
	var passages = [];
	
	$(".column").each(
		function(index) {
			var passageContainer = $(".passageContainer", this);
			passageContainer.attr("passage-id", index);
			passages.push(new Passage(passageContainer, allVersions, index));
		}
	);
	return passages;
}

/**
 * waits for a particular condition to be ready, then triggers the action
 * @param isReady a function that can be called to tell us whether something is ready
 * @param action a function to trigger when we know it will work
 */
function waitingForCondition(isReady, action) {
	if(isReady() == false) {
		window.setTimeout(function() {
							waitingForCondition(isReady, action);
						}, 250);
	} else {
		action();
	}
}

function initInitialEvents() {
	//unfortunately, all events might not be loaded yet, in particular
	// - version-changed-0 and version-changed-1
	waitingForCondition(
		function() {
			return !($(".passageContainer[passage-id = '0'] .passageVersion") === undefined
			    || $(".passageContainer[passage-id = '1'] .passageVersion").val() === undefined);
	}, 	function() {
			$.shout("version-changed-" + 0, $(".passageContainer[passage-id = '0'] .passageVersion").val());
			$.shout("version-changed-" + 1, $(".passageContainer[passage-id = '1'] .passageVersion").val());
	});
}

function initGlobalHandlers() {
	//set always visible - should probably be its own class
	$( "#loading" ).position({
		of: $( "body" ),
		my: "top",
		at: "top",
		collision: "fit"
	});
	
	//TODO refactor as error object
	$("#error").slideUp(0);
	$("#error").click(function() {
		$(this).slideUp(250);
	});
	
	$("#error").hear("caught-error-message", function(selfElement, data) {
		raiseError(data);
	});
}

/**
 * initialises the modules 	
 * @param passages a list of passages that were provided
 */
function initModules(passages) {
	new LexiconDefinition();
	new Bookmark();
	new Login();
	new Title();
		
	var bottomSection = $("#bottomSectionContent");
	new TimelineWidget(bottomSection, passages);
	new GeographyWidget(bottomSection, passages);
}

function raiseError(error) {
	$("#error").text(error.errorMessage);
	$("#error").slideDown(250);
}

