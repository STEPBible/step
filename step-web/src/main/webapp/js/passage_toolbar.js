/**
 * Definition of the Passage component responsible for displaying
 * OSIS passages appropriately. Ties the search box for the reference
 * and the version together to the passage displayed
 */
	//static id
var toolbarId = 0;
function Toolbar(passage, buttonOptions) {

	var self = this;
	this.passage = passage;
	
	//create toolbar
	var passageContainer = passage.getPassageContainer();
	$(passage.getPassageContainer()).prepend('<div class="toolbarContainer ui-widget-content ui-corner-all" />');
	this.toolbarContainer = $(".toolbarContainer", passageContainer);

	//create a button for each option
	$.each(buttonOptions, function(index) {
		self.toolbarContainer.append(
				'<input type="checkbox" value="' + this.key + '" id="sb' + toolbarId + '"><label for="sb'
				+ toolbarId + '">' + this.displayName + '</label></input>');

		//find the newly created button
		$('#sb' + toolbarId, self.toolbarContainer).button().click(function() { self.passage.changePassage(); });
		
		toolbarId++;
	});
}

/**
 * resets the buttons
 */
Toolbar.prototype.refreshButtons = function(version) {
	var self = this;
	
	//query the server for features
	$.getJSON("rest/bible/features/" + version, function (features) {
		//for each button, if in array, then enable, otherwise disable
		$("input", self.toolbarContainer).each(function() {
			$(this).button("disable");
			for(var i = 0; i < features.length; i++) {
				if(features[i] == this.value) {
					$(this).button("enable");
				}
			}
		});
	});
}

Toolbar.prototype.getSelectedOptions = function() {
	var options = "";
	
	$("input:checked", this.toolbarContainer).each(function() {
		options += this.value + ",";
	});
	
	return options;
}


/**
 * Opens the toolbar
 */
Toolbar.prototype.open = function() {
	$(this.toolbarContainer).fadeIn(500);
}

/**
 * closes the toolbar
 */
Toolbar.prototype.close = function() {
	$(this.toolbarContainer).fadeOut(500);
}


