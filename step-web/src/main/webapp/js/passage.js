/**
 * Definition of the Passage component responsible for displaying
 * OSIS passages appropriately. Ties the search box for the reference
 * and the version together to the passage displayed
 * @param passageContainer the passage Container containing the whole control
 * @param versions the list of versions to use to populate the dropdown
 * @param columnLayout a handle to the layout manager to activate various panels
 */
function Passage(passageContainer, versions, columnLayout) {
	var self = this;
	this.container = passageContainer;
	this.columnLayout = columnLayout;
	this.version = $(".passageVersion", passageContainer);
	this.reference = $(".passageReference", passageContainer);
	this.passage = $(".passageText", passageContainer);
	this.options = [ ];
	
	//style button
	$(".searchButton", passageContainer).button({
		icons: { primary: "ui-icon-search" }, 
		text: false
	})
	.removeClass( "ui-corner-all" )
	.addClass( "ui-corner-right ui-button-icon no-left-border" )
	.click(function() {
		self.changePassage();
	});
	
	$(".toolbarButton", passageContainer).button({
		icons: { primary: "ui-icon-wrench" }, 
		text: false
	}).change(function() {
		this.checked ? self.columnLayout.open("north") : self.columnLayout.close("north");
//		this.checked ? self.toolbar.open() : self.toolbar.close();
	});
	
	
	// set up autocomplete
	this.version.autocomplete({
		source : versions,
		minLength : 0,
		delay: 0,
		select: function(event, ui) {
			//force change?
			$(this).val(ui.item.value);
			self.reference.focus();
			self.toolbar.refreshButtons(ui.item.value);

			//we do not change the passage here, as we need to have refreshed the buttons 
			//so the refresh buttons will fire instead
			return false;
		},
	}).focus(function() {
		this.select();
	});
	
	//set up dropdown button next to it
	addButtonToAutoComplete(this.version, "ui-icon-triangle-1-s");
	
	//set up blur for textbox
	this.reference.change(function(){
		self.changePassage();
	});
	
	//register to listen for events that click a word/phrase:
	this.passage.hear("show-all-strong-morphs", function(selfElement, data) {
		self.higlightStrongs(data);
	} );
}

/**
 * changes the passage, with optional parameters
 * @param version the version passed in (optional - otherwise takes this.version)
 * @param reference the reference to lookup (optional - otherwise takes this.reference)
 */
Passage.prototype.changePassage = function(/* optional */ version, /* optional */reference) {
	//if this was called from somewhere else, rather than as a reaction to an event,
	//we change the values of the textboxes
	if(version && this.version.val() != version) {
		this.version.val(version);
		this.version.removeClass("inactive");
		this.toolbar.refreshButtons(version);
	}
	
	if(reference && this.reference.val() != reference) {
		this.reference.val(reference);
		this.reference.removeClass("inactive");
	}
	
	if(this.reference.hasClass("inactive") || this.version.hasClass("inactive")) {
		raiseError("You need to provide both a version and a reference to lookup a passage");
		return;
	}
	
	//now get the options from toolbar
	var options = this.toolbar.getSelectedOptions();
	var interlinearVersion = this.toolbar.getSelectedInterlinearVersion();
	
	var self = this;
	if(this.version.val() && this.reference.val() && this.version.val() != "" && this.reference.val() != "") {
		var url = "rest/bible/text/" + this.version.val() + "/" + this.reference.val();
		
		if(options && options.length != 0) {
			url += "/" + options ;

			if(interlinearVersion && interlinearVersion.length != 0) {
				url += "/" + interlinearVersion;
			}
		}
		
		//send to server
		$.get(url, function (text) {
			//we get html back, so we insert into passage:
			self.passage.html(text.value);
		});
	}
}

/**
 * sets the toolbar so that the passage can open/close it
 */
Passage.prototype.setToolbar = function(toolbar) {
	this.toolbar = toolbar;
}

/**
 * sets the passage container, so that others can insert themselves into it
 */
Passage.prototype.getPassageContainer = function() {
	return this.container;
}

/**
 * highlights all strongs match parameter strongReference
 * @strongReference the reference look for across this passage pane and highlight
 */
Passage.prototype.highlightStrong = function(strongReference) {
	$(".verse span[onclick*=" + strongReference + "]", this.container).css("text-decoration", "underline");
	$("span.w[onclick*=" + strongReference + "] span.text", this.container).css("text-decoration", "underline");
}

/**
 * if a number of strongs are given, separated by a space, highlights all of them
 * @param strongMorphReference the references of all strongs and morphs asked for
 */
Passage.prototype.higlightStrongs = function(strongMorphReference) {
	var references = strongMorphReference.split(' ');
	
	//reset all spans that are underlined:
	$(".verse span", this.container).css("text-decoration", "none");
	$("span.text", this.container).css("text-decoration", "none");
	
	
	for(var ii = 0; ii < references.length; ii++) {
		if(references[ii].startsWith("strong:")) {
			this.highlightStrong(references[ii]);
		} 
		//we ignore everything else
	}
}

