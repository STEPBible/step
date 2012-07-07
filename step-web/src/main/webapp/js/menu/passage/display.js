$(step.menu).hear("MENU-DISPLAY", function(self, menuTrigger) {
	if($(menuTrigger.menuItem.element).hasClass("disabled")) {
		//do nothing
		return;
	}
	
	if(menuTrigger.menuItem.name != "INTERLINEAR") {
		step.menu.toggleMenuItem(menuTrigger.menuItem.element);

		//save the new state of options
		var selectedOptions = step.menu.getSelectedOptions(menuTrigger.menu.element);
		step.state.passage.options(menuTrigger.passageId, selectedOptions);
	} else {
		$.shout("interlinear-menu-option-triggered-" +  menuTrigger.passageId);
	}
});

$(step.menu).hear("interlinear-menu-option", function(self, interlinearResult) {
	var mi = step.menu.getMenuItem(interlinearResult.name, interlinearResult.passageId);
	if(interlinearResult.selected) {
		step.menu.tickMenuItem(mi);
	} else {
		step.menu.untickMenuItem(mi);
	}

	var selectedOptions = step.menu.getSelectedOptions(step.menu.getParentMenu(mi));
	step.state.passage.options(interlinearResult.passageId, selectedOptions);
});


$(step.menu).hear("initialise-passage-display-options", function(self, data) {
	//refresh ui
	var passageContainer = step.util.getPassageContainer(data.passageId);
	step.menu.untickAll(passageContainer);
	for(var i in data.menuOptions) {
		step.menu.tickMenuItem($("a[name='" + data.menuOptions[i] +"']", passageContainer));
	}
});





