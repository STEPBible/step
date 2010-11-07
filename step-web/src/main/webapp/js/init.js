// call the initialisation functions
init();

function init() {
	$(document).ready(function() {
		initLayout();
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
		west__paneSelector : '.leftPassage',
		center__paneSelector : '.bookmarks',
		east__paneSelector : '.rightPassage',
		west__size : .45, // percentage size expresses as a decimal
		east__size : .45,
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

var nonIDedInputs = 0;
function initDefaultValues() {
	$("input.defaultValue").addClass("inactive");

	var default_values = new Array();
	$("input.defaultValue").focus(function() {
		if(this.id == "") {
			this.id = nonIDedInputs++;
		}
		
		if (!default_values[this.id]) {
			default_values[this.id] = this.value;
		}

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
	$.getJSON("rest/bible/versions", function(data) {
		var parsedResponse = $.map(data, function(item) {
			return {
				label : "[" + item.initials + "] " + item.name,
				value : item.initials
			}
		});
		
		//set up initial passages with reference data:
		var versions = ["KJV" ];
		var passages = ["Romans 1:1-10"];
		$(".passageContainer").each(
				function(index) {
					var passage = new Passage(this, parsedResponse);
					var toolbar = new Toolbar(passage, options);
					passage.setToolbar(toolbar);
					
					if(index < versions.length) {
						passage.changePassage(versions[index], passages[index]);
					}
				})
		});
}

