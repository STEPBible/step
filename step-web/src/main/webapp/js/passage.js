/**
 * Definition of the Passage component responsible for displaying
 * OSIS passages appropriately. Ties the search box for the reference
 * and the version together to the passage displayed
 * @param passageContainer the passage Container containing the whole control
 * @param versions the list of versions to use to populate the dropdown
 */
function Passage(passageContainer, versions, passageId) {
	var self = this;
	this.container = passageContainer;
	this.version = $(".passageVersion", passageContainer);
	this.reference = $(".passageReference", passageContainer);
	this.passage = $(".passageContent", passageContainer);
	this.passageId = passageId;
	
	// set up autocomplete
	this.version.autocomplete({
		source : versions,
		minLength: 0,
		delay: 0,
		select : function(event, ui) {
			$(this).val(ui.item.value);
			$(this).change();
		},
		change: function() {
//			$.shout("version-change-" + this.passageId);
		}
	}).focus(function() {
		self.version.autocomplete("search", "");
	}).change(function() {
		$.shout("version-changed-" + self.passageId, this.value);
	});
	
	//set up change for textbox
	this.reference.change(function(){
		self.changePassage();
	});
	
	//register to listen for events that click a word/phrase:
	this.passage.hear("show-all-strong-morphs", function(selfElement, data) {
		self.higlightStrongs(data);
	});
	
	//register we want to be notified of menu option changes...
	this.passage.hear("toolbar-menu-options-changed-" + this.passageId, function(selfElement, data) {
		//we only care about this event if the menu was within the container...
		self.changePassage();
	});
}

/**
 * changes the passage, with optional parameters
 */
Passage.prototype.changePassage = function() {
	if(this.reference.hasClass("inactive") || this.version.hasClass("inactive")) {
		raiseError("You need to provide both a version and a reference to lookup a passage");
		return;
	}
	
	//now get the options from toolbar
	var options = this.getSelectedOptions();
	var interlinearVersion = this.getSelectedInterlinearVersion();
	
	var self = this;
	var lookupVersion = this.version.val();
	var lookupReference = this.reference.val();
	
	if(lookupReference && lookupVersion 
			&& lookupVersion != "" && lookupReference != ""
			&& (   lookupVersion != this.currentVersion 
				|| lookupReference != this.currentReference
			    || interlinearVersion != this.currentInterlinearVersion
				|| !compare(options, this.currentOptions)) 
		) {
		var url = BIBLE_GET_BIBLE_TEXT + lookupVersion + "/" + lookupReference;
		
		if(options && options.length != 0) {
			url += "/" + options ;

			if(interlinearVersion && interlinearVersion.length != 0) {
				url += "/" + interlinearVersion;
			}
		}
		
		//send to server
		$.get(url, function (text) {
			//we get html back, so we insert into passage:
			self.currentReference = lookupReference;
			self.currentVersion = lookupVersion;
			self.currentOptions = options;
			self.currentInterlinearVersion = interlinearVersion;
			self.passage.html(text.value);
			
			//passage change was successful, so we let the rest of the UI know
			$.shout("passage-changed", self.reference.val());
		});
	}
}


/**
 * highlights all strongs match parameter strongReference
 * @strongReference the reference look for across this passage pane and highlight
 */
Passage.prototype.highlightStrong = function(strongReference) {
	//check for black listed strongs
	if($.inArray(strongReference, Passage.getBlackListedStrongs()) == -1) {
		$(".verse span[onclick*=" + strongReference + "]", this.container).css("text-decoration", "underline");
		$("span.w[onclick*=" + strongReference + "] span.text", this.container).css("text-decoration", "underline");
	}
}

/**
 * This method scans the currently selected options in the menu
 * to find out what is selected and what is not...
 */
Passage.prototype.getSelectedOptions = function() {
	var selectedOptions = [];
	// we select all ticks, but only enabled
	$(".innerMenu a:has(img.selectingTick)", this.container).not(".disabled").each(function(index, value) {
		selectedOptions.push(value.name);
	});
	return selectedOptions;
}


Passage.prototype.getSelectedInterlinearVersion = function() {
	//look for menu item for interlinears...
	//we check that it has a tick and is enabled for the INTERLINEAR name
	var menuItem = $("a:has(img.selectingTick)[name = 'INTERLINEAR']", this.container).not(".disabled");
	
	if(menuItem.length) {
		//lookup the only link we have which is the passage-id attribute on the container
		var passageId = $(this.container).attr("passage-id");
		return $(".interlinearPopup[passage-id = '" + passageId + "'] > .interlinearVersions").val();
	}
	return "";
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

/**
 * static method that returns strongs that should not be tagged in the UI
 */
Passage.getBlackListedStrongs = function() {
	return ["strong:G3588"];
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
