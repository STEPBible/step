$(document).ready(function() {
	setup();
});

/**
 * This method sets up the main page allowing the user to install modules as he/she wishes
 */
function setup() {
	$("#installCoreModules").click(function() {
		// we add a click handler that installs the default modules
		$.getJSON(SETUP_INSTALL_DEFAULT_MODULES, function(data) {
			// installation has started - so now we can afford to make calls to the internet:
			// set up available modules - to do extend to everything...
			$.getJSON(MODULE_GET_ALL_INSTALLABLE_MODULES, function(data) {
				$(data).each(function() {
					var toBeInstalled = "<a class='notInstalled' href=\"javascript:installVersion('" + this.initials +  "','" + 
						this.name.replace(/'/g,"\\'")  + "')\">[" + this.initials + "] " + this.name + "</a><br />";
					$("#availableModules").append(toBeInstalled);
				});
			});
		});
	});
	
	// set up available modules - to do extend to everything...
	$.getJSON(MODULE_GET_ALL_MODULES, function(data) {
		$(data).each(function() {
			var installed = "<div class=\"installed\">[" + this.initials + "] " + this.name + " - Installed</div>";
			$("#inProgressModules").append(installed);
		});
	});
}

function installVersion(initials, name) {
	$.getJSON(SETUP_INSTALL_BIBLE + initials, function(data) {
		//set up a progress bar on the other side...
	});
}


