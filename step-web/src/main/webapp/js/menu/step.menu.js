step.menu = {
	tickOneItemInMenuGroup: function(menuTrigger) {
		//untick all menu items, then tick one
		this.untickAll(menuTrigger.menu.element);
		return this.tickMenuItem(menuTrigger.menuItem.element);
	},
	
	tickMenuItem: function(selectedItem) {
		//check selectable
		if(!this.isSelectable(selectedItem)) {
			return false;
		}
		
		$(selectedItem).not(":has(img)").append("<img class='selectingTick' src='images/selected.png' />");			
		return true;
	},
	
	untickMenuItem: function(selectedItem) {
		$("img.selectingTick", selectedItem).remove();
	},

	untickAll: function(selectorOrMenuName, passageId) {
	    var menu = selectorOrMenuName;
	    if(typeof(selectorOrMenuName) == 'string') {
	        if(passageId) {
	            menu = $("a[menu-name = '" + selectorOrMenuName + "']", step.util.getPassageContainer(passageId));
	        } else {
	            menu = $("a[menu-name = '" + selectorOrMenuName + "']");
	        }
	    }
	    
		$(menu).find("img.selectingTick").remove();
	},
	
	toggleMenuItem: function(selectedItem) {
		//check selectable:
		if(!this.isSelectable(selectedItem)) {
			return false;
		}
		
		var matchedSelectedIcon = $(selectedItem).children(".selectingTick");
		
		if(matchedSelectedIcon.length) {
			matchedSelectedIcon.remove();
			return false;
		} else {
			this.tickMenuItem(selectedItem);
			return true;
		}
	},

	getSelectedOptions: function(menu) {
		var menuElement = menu;
		if(menu.element) {
			//then use element, otherwise assume we've got the element
			menuElement = menu.element;
		}
		
		// we select all ticks, but only enabled
		var selectedOptions = [];
		$("a:has(img.selectingTick)", menuElement).not(".disabled").each(function(index, value) {
			selectedOptions.push(value.name);
		});
		return selectedOptions;
	},
	
	getSelectedOptionsForMenu: function(passageId, menuName) {
	    return this.getSelectedOptions($("li[menu-name=" + menuName + "]", step.util.getPassageContainer(passageId)));
	},
		
    isOptionSelected: function(optionName, passageId) {
        return this.getMenuItem(optionName, passageId).has("img.selectingTick").size() != 0;
    },
	
	defaults: function(menuName, itemList) {
		var self = this;
		$(document).ready(function() {
			var menu = $("li[menu-name=" + menuName + "]");
			
			var myItems = $.isFunction(itemList) ? itemList() : itemList;
			var items = $.isArray(myItems) ? myItems : [ myItems ] ;
			for(var item in items) {
				self.tickMenuItem($("a[name='" + items[item]  + "']", menu));
			}
		}) ;
	},
	
	isSelectable: function(selector) {
		return !$(selector).hasClass("disabled");
	},
	
	handleClickEvent: function(menuItem) {
		var passageId = step.passage.getPassageId(menuItem);
		if(!passageId) {
			passageId = "";
		}
		
		var menu = this.getParentMenu(menuItem);
		
		$.shout("MENU-" + menu.name, {
			menu: menu, 
			menuItem: { element: menuItem, name: menuItem.name }, 
			passageId: passageId 
		});
	},

	getParentMenu: function(menuItem) {
		var menu = $(menuItem).closest("li[menu-name]");
		return {element: menu, name: menu.attr("menu-name") };
	},
	
	getMenuItem: function(optionName, passageId) {
		if(passageId != undefined) {
			return $(".passageContainer[passage-id = " + passageId + "] li[menu-name] a[name = '" + optionName + "']");
		} else {
			return $("li[menu-name] a[name = '" + optionName + "']");
		}
	}
};


