
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
//		initTimeline(mainAppLayout);
		initBookmarks();
		initData();
		initInitialEvents();
	});
}

/**
 * initialises layout
 */
function initLayout() {
	$("body").hear("refresh-layout", function() {
		//we resize the heights:
		var windowHeight = $(window).height();
		var innerMenuHeight = $("#leftPaneMenu").height();
		var topMenuHeight = $("#topMenu").height();
		var imageAndFooterHeight = $(".northBookmark").height() + $(".logo").height();
		$(".column").height(windowHeight - topMenuHeight);
		$(".bookmarksContent").height(windowHeight - topMenuHeight - imageAndFooterHeight);
	});
	
	//listen to layout changes and alert
	$(window).resize(function() {
		$.shout("refresh-layout");
	});
}

function initMenu() {
	ddsmoothmenu.init({
		 mainmenuid: "topMenu-ajax", //menu DIV id
		 zIndexStart: 1000,
		 orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
		 classname: 'ddsmoothmenu topMenu', //class added to menu's outer DIV
		 //customtheme: ["#1c5a80", "#18374a"],
		 contentsource: ["topMenu", "topmenu.html"]
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
	
	$.getJSON(BIBLE_GET_BIBLE_VERSIONS, function(data) {
		var parsedResponse = $.map(data, function(item) {
			var showingText = "[" + item.initials + "] " + item.name;
			
			//add to strongs if applicable
			if(item.hasStrongs) {
				strongedVersions[ii++] = { label: showingText, value: item.initials };
			}
			
			//return response for dropdowns
			return {
				label : showingText,
				value : item.initials
			}
		});
		
		//add the ALL Version, by iterating through all found versions and adding them as the value
		var allVersionsKey = "";
		initPassages(parsedResponse, options);
		initInterlinearPopup(strongedVersions);
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
 */
function initPassages(allVersions, options) {
	//set up initial passages with reference data:
	$(".column").each(
		function(index) {
			var passageContainer = $(".passageContainer", this);
			passageContainer.attr("passage-id", index);
			new Passage(passageContainer, allVersions, index);
		}
	);
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
			
//			return !($._jq_shout.registry["version-changed-0"] === undefined
//		 		|| $._jq_shout.registry["version-changed-1"] === undefined);
	}, 	function() {
			$.shout("version-changed-" + 0, $(".passageContainer[passage-id = '0'] .passageVersion").val());
			$.shout("version-changed-" + 1, $(".passageContainer[passage-id = '1'] .passageVersion").val());
	});
}

function initGlobalHandlers() {
	$("#loading").ajaxStart(function() {
		$(this).show();
	});

	$("#loading").ajaxComplete(function() {
		$(this).hide();
	});
	
	//set always visible - should probably be its own class
	$( "#loading" ).position({
		of: $( "body" ),
		my: "top",
		at: "top",
		collision: "fit"
	});
	
	$("#error").click(function() {
		$('body').layout().close("north");
	});
	
	$("#error").ajaxComplete(function(ev, req, ajaxOptions) {
		var currentResponse = $.parseJSON(req.responseText);
		if(currentResponse.error) {
			raiseError(currentResponse.error)
		}
	});
}

function initLexicon() {
	new LexiconDefinition();
}

function initBookmarks() {
	new Bookmark($("#bookmarkPane"));
}

function initTimeline(mainAppLayout) {
	new TimelineWidget($("#bottomSection"), mainAppLayout);
}

function raiseError(error) {
	$("#error").text(error);
	$('body').layout().open("north");
}

