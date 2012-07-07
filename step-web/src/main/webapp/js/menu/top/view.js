$(step.menu).hear("MENU-VIEW", function(self, menuTrigger) {
	step.menu.tickOneItemInMenuGroup(menuTrigger);
	
	step.state.detail.store($(menuTrigger.menuItem.element).attr("level"));
});
