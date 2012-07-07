$(step.menu).hear("MENU-OPTIONS", function(self, menuTrigger) {
	var isOptionEnabled = step.menu.toggleMenuItem(menuTrigger.menuItem.element);
	
	if(menuTrigger.menuItem.name == "SHOW_ALL_VERSIONS") {
		$.getSafe(BIBLE_GET_BIBLE_VERSIONS + isOptionEnabled, function(versions) {
			// send events to passages and reload - then change init function
			$.shout("version-list-refresh", versions);
		});		
	} else if(menuTrigger.menuItem.name == "SYNC_BOTH_PASSAGES") {
		step.state.passage.syncMode(isOptionEnabled);
		$(".passageContainer:not([passage-id=0]) .passageReference").prop("disabled", isOptionEnabled);
	}
});


$(step.menu).hear("initialise-passage-sync", function(s, sync) {
	if(sync) {
		step.menu.tickMenuItem(step.menu.getMenuItem("SYNC_BOTH_PASSAGES"));
		$(".passageContainer:not([passage-id=0]) .passageReference").prop("disabled", true);
	}
});
