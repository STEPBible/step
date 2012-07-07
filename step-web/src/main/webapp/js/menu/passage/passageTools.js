$(step.menu).hear("MENU-PASSAGE-TOOLS", function(self, menuTrigger) {
	if(menuTrigger.menuItem.name == "BOOKMARK") {
		$.shout("bookmark-addition-requested", { 
			reference: step.passage.getReference(menuTrigger.passageId) 
		});
	}
});
