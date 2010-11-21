/**
 * Definition of the Passage component responsible for displaying
 * OSIS passages appropriately. Ties the search box for the reference
 * and the version together to the passage displayed
 */
function Passage(passageContainer, versions) {
	var self = this;
	this.container = passageContainer;
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
		this.checked ? self.toolbar.open() : self.toolbar.close();
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

