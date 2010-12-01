/**
 * Definition of the Passage component responsible for displaying
 * OSIS passages appropriately. Ties the search box for the reference
 * and the version together to the passage displayed
 */
	//static id
var toolbarId = 0;
function Toolbar(passage, columnContainer, buttonOptions, strongedVersions) {

	var self = this;
	this.passage = passage;
	
	//create toolbar
	columnContainer.append('<div class="toolbarContainer ui-widget-content ui-corner-all" />');
	this.toolbarContainer = $(".toolbarContainer", columnContainer);

	
	//create a button for each option
	$.each(buttonOptions, function(index) {
		self.toolbarContainer.append(
				'<input type="checkbox" value="' + this.key + '" id="sb' + toolbarId + '"><label for="sb'
				+ toolbarId + '">' + this.displayName + '</label></input>');

		//find the newly created button
		var newButton = $('#sb' + toolbarId, self.toolbarContainer);
		newButton.button().click(function() { self.passage.changePassage(); });
		
		if(this.enabledByDefault) {
			newButton.attr("checked", "checked");
		}
		
		//finally, if we're looking at the interlinear, then create a dropdown with potential versions
		if (this.key == "INTERLINEAR") {
			self.createInterlinearDropdown(toolbarId, strongedVersions, newButton);
		}
		toolbarId++;
	});
}

//function split( val ) {
//	return val.split( /,\s*/ );
//}
function extractLast( term ) {
	return split( term ).pop();
}

Toolbar.prototype.createInterlinearDropdown = function(toolbarId, strongedVersions, interlinearButton) {
	this.toolbarContainer.append("<input id='interlinear" + toolbarId
			+ "' type='text' class='interlinearVersion' value='Interlinear version' disabled='disabled' />");

	var self = this;
	var interlinearSelector = $('#interlinear' + toolbarId);
	interlinearSelector.autocomplete({
		source : strongedVersions,
		minLength : 0,
		delay: 0,
		select : function(event, ui) {
			var terms = this.value.split( /,\s*/ );
			
			// remove the current input
			terms.pop();
			
			// add the selected item
			terms.push( ui.item.value );
			
			// add placeholder to get the comma-and-space at the end
			terms.push( "" );
			this.value = terms.join( ", " );
			self.passage.changePassage();
			return false;
		}
	});
	
	addDefaultValue(interlinearSelector);
	
	//todo, make utility function
	//set up dropdown button next to it
	var interlinearDropdownButton = $( "<button>&nbsp;</button>" ).attr( "tabIndex", -1 )
	.attr( "title", "Show all Bible versions" )
	.insertAfter( interlinearSelector )
	.button({
		icons: {
			primary: "ui-icon-triangle-1-s"
		},
		text: false,
		disabled: true
	})
	.removeClass( "ui-corner-all" )
	.addClass( "ui-corner-right ui-button-icon no-left-border" )
	.click(function() {
		// close if already visible
		if ( interlinearSelector.autocomplete( "widget" ).is( ":visible" ) ) {
			interlinearSelector.autocomplete( "close" );
			return;
		}

		// pass empty string as value to search for, displaying all results
		interlinearSelector.autocomplete( "search", "" );
		interlinearSelector.focus();
	});
	
	interlinearButton.click(function() {
		if($(this).attr('checked')) {
			interlinearSelector.removeAttr("disabled");
			interlinearDropdownButton.button("enable");
			interlinearSelector.focus();
		} else {
			interlinearSelector.attr("disabled", "disabled");
			interlinearDropdownButton.attr("disabled", "disabled");
			interlinearDropdownButton.button("disable");
		}
	});
}

/**
 * resets the buttons
 */
Toolbar.prototype.refreshButtons = function(version) {
	var self = this;
	
	//query the server for features
	$.getJSON("rest/bible/features/" + version, function (features) {
		//for each button, if in array, then enable, otherwise disable

		//TODO: for some reason there are sometime some initialisation issues which throw an exception
		try {
			$("input", self.toolbarContainer).each(function() {
				$(this).button("disable");
				for(var i = 0; i < features.length; i++) {
					if(features[i] == this.value) {
						$(this).button("enable");
					}
				}
				
				if($(this).button( "option", "disabled" )) {
					$(this).removeAttr("checked");
				}
				$(this).button("refresh");
			});
		} finally {
			self.passage.changePassage();
		}
	});
}

Toolbar.prototype.getSelectedOptions = function() {
	var options = "";
	
	$("input:checked", this.toolbarContainer).each(function() {
		options += this.value + ",";
	});
	
	return options;
}

Toolbar.prototype.getSelectedInterlinearVersion = function() {
	var version = $(".interlinearVersion", this.toolbarContainer).val();
	
	if(version && !$(".interlinearVersion", this.toolbarContainer).hasClass("inactive")) {
		return version;
	}
	
	return "";
}


/**
 * Opens the toolbar
 */
Toolbar.prototype.open = function() {
	$(this.toolbarContainer).fadeIn(500);
}

/**
 * closes the toolbar
 */
Toolbar.prototype.close = function() {
	$(this.toolbarContainer).fadeOut(500);
}


