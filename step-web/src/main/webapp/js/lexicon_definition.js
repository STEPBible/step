
/**
 * The bookmarks components record events that are happening across the application,
 * for e.g. passage changes, but will also show related information to the passage.
 */
function LexiconDefinition() {
	var self = this;
	//listen for particular types of events and call the prototype functions
	this.getPopup().hear("show-all-strong-morphs", function(selfElement, data) {
		self.showAllStrongMorphs(data);
	} );
}

LexiconDefinition.prototype.getPopup = function() {
	if(this.popup) {
		this.popup.css('display', 'inline-block');
		return this.popup;
	}
	
	//create the popup container
	$("body").append("<span id='lexiconDefinition'><ul><span id='lexiconPopupClose'>X</span></ul></span>");
	this.popup = $("#lexiconDefinition");
	this.popup.tabs().draggable();
	$('#lexiconPopupClose').click(function() {
		$('#lexiconDefinition').hide();
	});
	return this.popup;
}

LexiconDefinition.prototype.showStrong = function(s) {
	
}

LexiconDefinition.prototype.showMorphs = function(s) {
	
}

LexiconDefinition.prototype.showAllStrongMorphs = function(s) {
	var self = this;
	var popup = self.getPopup();
	
	//create all tabs - first remove everything, then readd.
	popup.tabs("destroy");
	popup.tabs();
	
	var tabs = s.split(" ");
	$(tabs).each(function() {
		popup.tabs("add", MODULE_GET_DEFINITION + this, self.getShortKey(this));
	});

	popup.tabs("option", {
		collapsible: true,
		selected: 0
	});
	
	//TODO this is a workaround because of bug http://bugs.jqueryui.com/ticket/5069
	popup.tabs("select", 1);
	popup.tabs("select", 0);
	
	//if left position is negative, then we assume it's off screen and need position
	if(popup.css("left")[0] == '-') {
		//position in the middle
		popup.position({
			of: $("body"),
			my: "right top",
			at: "right top",
			collision: "fit flip",
		});
	}
}

LexiconDefinition.prototype.getShortKey = function(k) {
	var subKey = k.substring(k.indexOf(':') + 1);
	if(subKey[0] == 'G' || subKey[0] == 'H') {
		return subKey.substring(1);
	}
	return subKey;
}
