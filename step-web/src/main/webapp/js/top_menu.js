
/**
 * Represents the menu that will be at the top of the passage container
 */
function TopMenu(menuRoot) {
	var self = this;
	this.menuRoot = menuRoot;

	
	ddsmoothmenu.init({
		 mainmenuid: menuRoot.attr("id"), //menu DIV id
		 zIndexStart: 1000,
		 orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
		 classname: 'ddsmoothmenu topMenu', //class added to menu's outer DIV
         contentsource: "markup"
		});
	
	this.setDefaultOptions();
	
	$(menuRoot).hear("pane-menu-toggle-item", function(selfElement, menuOption) {
		self.toggleMenuItem(menuOption);
	});
	
	this.setupHearers();
}

TopMenu.prototype.setupHearers = function() {
	this.menuRoot.hear("topmenu-LIMIT_AVAILABLE_MODULES", function(selfElement, enabled) {
		var versions = $.getSafe(BIBLE_GET_BIBLE_VERSIONS + enabled, function(versions) {
			// send events to passages and reload - then change init function
			$.shout("version-list-refresh", versions);
		});
	});
	
	this.menuRoot.hear("topmenu-SYNC_BOTH_PASSAGES", function(selfElement, enabled) {
		//alert all passages that we are passage 0 is master
		if(enabled) {
			$.shout("sync-passage-activated");
		} else {
			$.shout("sync-passage-deactivated");
		}
	});
};

/**
 * toggles the tick next to the element
 * @param name of the element
 */
TopMenu.prototype.toggleMenuItem = function(selectedItem) {
	if(this.checkItemIsSelectable(selectedItem)) {
		var matchedSelectedIcon = $(this.getItemSelector(selectedItem)).children(".selectingTick");
		if(matchedSelectedIcon.length) {
			this.untickMenuItem(selectedItem);		
			$.shout("topmenu-" + selectedItem, false);
		} else {
			this.tickMenuItem(selectedItem);
			$.shout("topmenu-" + selectedItem, true);
		}
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
//	this.toggleMenuItem("LIMIT_AVAILABLE_MODULES");
}

/**
 * returns true if item is selected
 */
TopMenu.prototype.isItemSelected = function(name) {
	return getItemSelector(name).children("img.selectingTick").length != 0;
}

/**
 * returns all menu items matching the name specified
 * TODO could add cache here based on name
 */
TopMenu.prototype.getItemSelector = function(name) {
	return $("*[name = '" + name + "']", this.menuRoot);
}
