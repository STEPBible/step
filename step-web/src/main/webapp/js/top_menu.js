/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
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
		$.getSafe(BIBLE_GET_BIBLE_VERSIONS + enabled, function(versions) {
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
};


/**
 * puts a tick next to the menu item
 * @param selectedItem the name attribute of the element to click
 */
TopMenu.prototype.tickMenuItem = function(selectedItem) {
	this.getItemSelector(selectedItem).not(":has(img)").append("<img class='selectingTick' src='images/selected.png' />");		
};

/**
 * removes the tick next to the menu item
 * @param selectedItem name of the item to untick
 */
TopMenu.prototype.untickMenuItem = function(selectedItem) {
	$("img.selectingTick", this.getItemSelector(selectedItem)).remove();
};

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
};

/**
 * sets up the default options for the menu
 */
TopMenu.prototype.setDefaultOptions = function() {
//	this.toggleMenuItem("LIMIT_AVAILABLE_MODULES");
};

/**
 * returns true if item is selected
 */
TopMenu.prototype.isItemSelected = function(name) {
	return getItemSelector(name).children("img.selectingTick").length != 0;
};

/**
 * returns all menu items matching the name specified
 * TODO could add cache here based on name
 */
TopMenu.prototype.getItemSelector = function(name) {
	return $("*[name = '" + name + "']", this.menuRoot);
};
