
/**
 * Represents the menu that will be at the top of the passage container
 */
function TopMenu(menuRoot) {
	this.menuRoot = $(menuRoot);
	var self = this;

	ddsmoothmenu.init({
		 mainmenuid: menuRoot.id, //menu DIV id
		 zIndexStart: 1000,
		 orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
		 classname: 'ddsmoothmenu topMenu', //class added to menu's outer DIV
		 //customtheme: ["#1c5a80", "#18374a"],
		 contentsource: ["topMenu", "topmenu.html"]
		});
	
	this.setDefaultOptions();
	
//	$(menuRoot).hear("pane-menu-toggle-item-" + this.passageId, function(selfElement, menuOptionName) {
//		self.toggleMenuItem(menuOptionName);
//	});
}

/**
 * @param selected true to select
 * @param menuItem the item name
 */
TopMenu.prototype.selectMenuItem = function(menuItem, selected) {
	if(selected) {
		this.tickMenuItem(menuItem);
	} else {
		this.untickMenuItem(menuItem);
	}
}


/**
 * toggles the tick next to the element
 * @param name of the element
 */
TopMenu.prototype.toggleMenuItem = function(selectedItem) {
	if(this.checkItemIsSelectable(selectedItem)) {
		var matchedSelectedIcon = $(this.getItemSelector(selectedItem)).children(".selectingTick");
		if(matchedSelectedIcon.length) {
			this.untickMenuItem(selectedItem);		
		} else {
			this.tickMenuItem(selectedItem);
		}

		//fire off options?
		//fire-off an event indicating that menu options have changed!
//		$.shout("toolbar-menu-options-changed-" + this.passageId);
	}
}


/**
 * puts a tick next to the menu item
 * @param selectedItem the name attribute of the element to click
 */
TopMenu.prototype.tickMenuItem = function(selectedItem) {
	this.getItemSelector(selectedItem).not(":has(img)").append("<img class='selectingTick' src='images/selected.png' />");		
}

/**
 * removes the tick next to the menu item
 * @param selectedItem name of the item to untick
 */
TopMenu.prototype.untickMenuItem = function(selectedItem) {
	$("img.selectingTick", this.getItemSelector(selectedItem)).remove();
}

/**
 * The menu item can be selected
 * @param selectedItem the name of the item to be selected
 * @return true if the item can be selected
 */
TopMenu.prototype.checkItemIsSelectable = function(selectedItem) {
	//we only deal with elements that are enabled
	if(this.getItemSelector(selectedItem).hasClass("disabled")) {
		return false;
	}
	return true;
}

/**
 * sets up the default options for the menu
 */
TopMenu.prototype.setDefaultOptions = function() {
	this.toggleMenuItem("LIMIT_AVAILABLE_MODULES");
}

/**
 * returns all menu items matching the name specified
 * TODO could add cache here based on name
 */
TopMenu.prototype.getItemSelector = function(name) {
	return $("*[name = '" + name + "']", this.menuRoot);
}
