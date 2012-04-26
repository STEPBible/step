
/**
 * Represents the menu that will be at the top of the passage container
 */
function ToolbarMenu(passageId, menuRoot) {
	this.passageId = passageId;
	this.menuRoot = $(menuRoot);
	var self = this;
	
	ddsmoothmenu.init({
		mainmenuid: menuRoot.id, 		//menu DIV id
		zIndexStart: 100,
		orientation: 'h', 				//Horizontal or vertical menu: Set to "h" or "v"
		classname: 'ddsmoothmenu innerMenu', //class added to menu's outer DIV
		//customtheme: ["#1c5a80", "#18374a"],
		contentsource: "markup"
	});
	
	this.setDefaultOptions();
	
	//also register a listener for ticking or unticking an option in the menu
	$(menuRoot).hear("pane-menu-internal-state-changed-" + this.passageId, function(selfElement, menuOption) {
		//menuOption is in the form { name: blah, selected: true/false }
		self.selectMenuItem(menuOption.name, menuOption.selected);
	});
	
	$(menuRoot).hear("pane-menu-toggle-item-" + this.passageId, function(selfElement, menuOptionName) {
		self.toggleMenuItem(menuOptionName);
	});
	
	$(menuRoot).hear("version-changed-" + this.passageId, function(selfElement, version) {
		self.refreshMenuOptions(version);
	});
}

/**
 * @param selected true to select
 * @param menuItem the item name
 */
ToolbarMenu.prototype.selectMenuItem = function(menuItem, selected) {
	if(selected) {
		this.tickMenuItem(menuItem);
	} else {
		this.untickMenuItem(menuItem);
	}
};


/**
 * toggles the tick next to the element
 * @param name of the element
 */
ToolbarMenu.prototype.toggleMenuItem = function(selectedItem) {
	if(this.checkItemIsSelectable(selectedItem)) {
		var matchedSelectedIcon = $(this.getItemSelector(selectedItem)).children(".selectingTick");
		if(matchedSelectedIcon.length) {
			this.untickMenuItem(selectedItem);		
		} else {
			this.tickMenuItem(selectedItem);
		}
		
		//fire-off an event indicating that menu options have changed!
		$.shout("toolbar-menu-options-changed-" + this.passageId);
	}
};


/**
 * puts a tick next to the menu item
 * @param selectedItem the name attribute of the element to click
 */
ToolbarMenu.prototype.tickMenuItem = function(selectedItem) {
	this.getItemSelector(selectedItem).not(":has(img)").append("<img class='selectingTick' src='images/selected.png' />");		
};

/**
 * removes the tick next to the menu item
 * @param selectedItem name of the item to untick
 */
ToolbarMenu.prototype.untickMenuItem = function(selectedItem) {
	$("img.selectingTick", this.getItemSelector(selectedItem)).remove();
};

/**
 * The menu item can be selected
 * @param selectedItem the name of the item to be selected
 * @return true if the item can be selected
 */
ToolbarMenu.prototype.checkItemIsSelectable = function(selectedItem) {
	//we only deal with elements that are enabled
	if(this.getItemSelector(selectedItem).hasClass("disabled")) {
		return false;
	}
	return true;
};

/**
 * Refreshes the menu options according to what can currently be displayed
 * @param version the new version of the passage
 */
ToolbarMenu.prototype.refreshMenuOptions = function(version) {
	var self = this;
	$.getJSON(BIBLE_GET_FEATURES + version, function (features) {
		//build up map of options
		$("li:contains('Display') a", self.menuRoot).each(function(index, value) {
			var changed = false;
			for(var i = 0 ; features[i]; i++) {
				if(value.name == features[i]) {
					$(value).removeClass("disabled");
					changed = true;
					break;
				}
			}
			
			if(changed == false) {
				$(value).addClass("disabled");
			}
		});
		$.shout("toolbar-menu-options-changed-" + self.passageId);
	});
};

/**
 * sets up the default options for the menu
 */
ToolbarMenu.prototype.setDefaultOptions = function() {
	this.toggleMenuItem("HEADINGS");
	this.toggleMenuItem("VERSE_NUMBERS");
	this.toggleMenuItem("NOTES");
};

/**
 * returns all menu items matching the name specified
 * TODO could add cache here based on name
 */
ToolbarMenu.prototype.getItemSelector = function(name) {
	return $("*[name = '" + name + "']", this.menuRoot);
};
