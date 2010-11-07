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
	}).click(function() {
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
		select : function(event, ui) {
			self.toolbar.refreshButtons(ui.item.value);
			self.changePassage();
		}
	});
	
	//set up blur for textbox
	this.reference.blur(function(){
		self.changePassage();
	});
}

/**
 * changes the passage, with optional parameters
 * @param version the version passed in (optional - otherwise takes this.version)
 * @param reference the reference to lookup (optional - otherwise takes this.reference)
 */
Passage.prototype.changePassage = function(version, reference) {
	var newVersion = version ? version : (!this.version.hasClass("inactive") ? this.version.val() : null);
	var newReference = reference ? reference : (!this.reference.hasClass("inactive") ? this.reference.val() : null);

	//now get the options from toolbar
	var options = this.toolbar.getSelectedOptions();
	
	var self = this;
	if(newVersion && newReference && newVersion != "" && newReference != "") {
		//send to server
		$.get("rest/bible/text/" + newVersion + "/" + newReference + "/" + options, function (text) {
			//we get html back, so we insert into passage:
			self.passage.html(text);
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

