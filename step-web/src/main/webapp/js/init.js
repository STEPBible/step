// call the initialisation functions
init();

function init() {
	$(document).ready(function() {
		initLayout();
		initGlobalHandlers();
		initDefaultValues();
		initData();
	});
}

/**
 * initialises layout
 */
function initLayout() {

	//do outerlayout first
	$('body').layout({
		name : 'outerLayout', 
		spacing_open: 2,
		autoResize : true, // try to maintain pane-percentages
		autoReopen : true, // auto-open panes that were previously
		autoBindCustomButtons : true,
		north__paneSelector: '#error',
		west__paneSelector : '.leftPassage',
		center__paneSelector : '.bookmarks',
		east__paneSelector : '.rightPassage',
		west__size : .45, // percentage size expresses as a decimal
		east__size : .45,
		north__minSize : 0,
		north__size: 20,
		north__spacing_open : 0,
		north__spacing_closed : 0,
		north__initClosed: true,
		minSize : 130,
		noRoomToOpenAction : "hide"
	});

	$('#bookmarkPane').layout({
		name : 'outerLayout', 
		resizable: false, 
		closable: false,
		slidable: false,
		spacing_open: 0,
		spacing_closed: 0,
		
		autoResize : true, // try to maintain pane-percentages
		autoReopen : true, // auto-open panes that were previously
		autoBindCustomButtons : true,
		north__paneSelector : '.northBookmark',
		center__paneSelector : '.bookmarksContent',
		south__paneSelector : '.logo',
		north__size : 70, 
		south__size : 30,
		noRoomToOpenAction : "hide"
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
	$.getJSON("rest/bible/features-all", function(data) {
		$.each(data, function() {
			options = data;
		});
	});
	
	//get data for passages
	// make call to server first and once, to cache all passages:
	var strongedVersions = [];
	var ii = 0;
	
	$.getJSON("rest/bible/versions", function(data) {
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
		
		
		//set up initial passages with reference data:
		var versions = ["ESV" ];
		var passages = ["Romans 1"];
		$(".passageContainer").each(
				function(index) {
					var passage = new Passage(this, parsedResponse);
					var toolbar = new Toolbar(passage, options, strongedVersions);
					passage.setToolbar(toolbar);
					
					if(index < versions.length) {
						passage.changePassage(versions[index], passages[index]);
					}
				})
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

function raiseError(error) {
	$("#error").text(error);
	$('body').layout().open("north");
}
