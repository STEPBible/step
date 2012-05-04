/**
 * a simple way of controlling the title bar
 */
function Title() {
	var self = this;
	this.version = [];
	this.reference = [];
	
	// listen to passage changes
	$(this).hear("passage-changed", function(selfElement, data) {
		self.reference[data.passageId] = data.reference;
		self.version[data.passageId] = data.version;
		
		self.updateTitle();
		
	});
};

/**
 * Updates the title to the correct string
 */
Title.prototype.updateTitle = function() {
	var prefix = "STEP Bible: ";
	var title = prefix;
	if(this.reference[0]) {
		title += this.reference[0] + " in the " + this.version[0];
	}
	
	if(this.reference[1]) {
		if(title.length > prefix.length) {
			title += " and ";
		}
		title += this.reference[1] + " in the " + this.version[1];
	}
	document.title = title;
};


