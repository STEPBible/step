$(step.menu).hear("MENU-HELP", function(self, menuTrigger) {
	if(menuTrigger.menuItem.name == "ABOUT") {
		//show popup for About box
		$( "#about" ).dialog({ 
			buttons: { "Ok": function() { $(this).dialog("close"); } },
			width: DEFAULT_POPUP_WIDTH,
			title: "STEP :: Scripture Tools for Every Person",
		});
	}
});
