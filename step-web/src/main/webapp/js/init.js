
// call the initialisation functions
init();

//some extensions (perhaps should go in another file)
String.prototype.startsWith = function(str) { return (this.match("^"+str)==str) }


function init() {
	$(document).ready(function() {
		initMenu();
		initGlobalHandlers();
		initLayout();
		initDefaultValues();
		initLexicon();
		initBookmarks();
		
		initData();
		
		initInitialEvents();
		initLogin();
		
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
	$.get("topmenu.html", function(data) {
		var topMenu = $("#topMenu");
		topMenu.html(data);
		new TopMenu($("#topMenu-ajax"));		
	});
	
	
	$.get("panemenu.html", function(data) {
		var menusToBe = $(".innerMenus");
		menusToBe.html(data);
		menusToBe.each(function(index, value) {
		new ToolbarMenu(index, value);
		});
	});
}

function initDefaultValues() {
	addDefaultValue($("input.defaultValue"));
}

var nonIDedInputs = 0;
function addDefaultValue(inputSelector) {
	var default_values = new Array();
	inputSelector.each(function(index) {
		$(this).addClass("inactive");
		if(this.id == "") {
			this.id = nonIDedInputs++;
		}
		if (!default_values[this.id]) {
			default_values[this.id] = this.value;
		}
	});

	inputSelector.focus(function() {
		if (this.value == default_values[this.id]) {
			$(this).removeClass("inactive");
			this.value = '';
		}
		
		$(this).blur(function() {
			if (this.value == '') {
				$(this).addClass("inactive");
				this.value = default_values[this.id];
			}
		});
	});
	
}

/**
 * sets up the initial data and passages
 */
function initData() {
	
	//get all supported versions
	var options;
	$.getJSON(BIBLE_GET_ALL_FEATURES, function(data) {
		$.each(data, function() {
			options = data;
		});
	});
	
	//get data for passages
	// make call to server first and once, to cache all passages:
	var strongedVersions = [];
	var ii = 0;
	
	$.getJSON(BIBLE_GET_BIBLE_VERSIONS + "false", function(versionsFromServer) {
		
		$.each(versionsFromServer, function(index, item) {
			var showingText = "[" + item.initials + "] " + item.name;
			if(item.hasStrongs) {
				strongedVersions[ii++] = { label: showingText, value: item.initials};
			}
		});
		
		//add the ALL Version, by iterating through all found versions and adding them as the value
		var allVersionsKey = "";
		var passages = initPassages(versionsFromServer, options);
		initInterlinearPopup(strongedVersions);
		initModules(passages);
	});
}

/**
 * sets up the interlinear popup with the available versions
 * @param strongedVersions the list of strong versions
 */
function initInterlinearPopup(strongedVersions) {
	$(".interlinearPopup").each(function(index, interlinearPopup) {
		new InterlinearPopup(strongedVersions, index, interlinearPopup);
	});
}

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
		raiseError(data)
	});
}

function initLexicon() {
	new LexiconDefinition();
}

function initBookmarks() {
	new Bookmark();
}

function initLogin() {
	new Login();
}

/**
 * initialises the modules 	
 * @param passages a list of passages that were provided
 */
function initModules(passages) {
	var bottomSection = $("#bottomSectionContent");
	
	new TimelineWidget(bottomSection, passages);
	new GeographyWidget(bottomSection, passages);
}

function raiseError(error) {
	$("#error").text(error.errorMessage);
	$("#error").slideDown(250);
}

