$(step.menu).hear("MENU-CONTEXT", function(self, menuTrigger) {
	step.menu.tickOneItemInMenuGroup(menuTrigger);

	//deal with events
	var menuItem = menuTrigger.menuItem;
	step.navigation.showBottomSection(menuItem);
	
	if(menuItem.name == "TIMELINE") {
		$.shout("show-timeline", { passageId : step.passage.getPassageId(menuItem) });
	} else if(menuTrigger.menuItem.name == "GEOGRAPHY") {
		$.shout("show-maps", { passageId : step.passage.getPassageId(menuItem) } );
	}
});

