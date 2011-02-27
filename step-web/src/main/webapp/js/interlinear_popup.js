/**
 * Sets up the logic around intialisation, displaying and retrieving 
 * values from the interlinear popup.
 * 
 * The popup displays a list of checkboxes, one for each version containing
 * strong numbers. Selecting one or more of the checkboxes, causes the passasge
 * display to be displayed one line under another, e.g.
 * KJV - The blah
 * Byz - The blah
 * 
 * @param an array of Bible versions that contain strong numbers
 */
function InterlinearPopup(strongedVersions, passageId, interlinearPopup) {
	this.passageId = passageId;
	this.interlinearPopup = $(interlinearPopup);
	
	//sets up the checkboxes in the popup
	var self = this;

	//first set up the passage id
	this.interlinearPopup.attr("passage-id", this.passageId);
	
	//now do the handlers
	this.createCheckboxes(strongedVersions);
	this.addHandlersToCheckboxes();
	this.addAllOptionsHandler();
	this.addShowHandler();
}

/**
 * creates all the checkboxes, one per strong version
 * @param strongedVersions the list of strong versions
 */
InterlinearPopup.prototype.createCheckboxes = function(strongedVersions) {
	var ii = 0;
	var allOptionsValue = "";
	var allCheckBoxes = "";
	var interlinearChoices = $(".interlinearChoices", this.interlinearPopup);
	
	var row = 0;
	for(ii = 0 ; ii < strongedVersions.length; ii++) {
		var longName = strongedVersions[ii].label;
		var shortName = longName.length > 20 ? shortenName(longName, 20) : longName;
		
		//created a checkbox for this, that adds the text if checked to the input
		if(row % 2 == 0) {
			allCheckBoxes += "<tr>";
		}
		
		allCheckBoxes += "<td>";
		allCheckBoxes += "<input id='il_" + ii + "' type='checkbox' value='" + strongedVersions[ii].value + "' />" +
						  "<label for='il_" + ii + "' title='" + longName + "'>" + shortName + "</label>";
		allCheckBoxes += "</td>";
	
		if(row % 2 == 0) {
			allCheckBoxes += "</tr>";
		}
		
		row++;
		
		allOptionsValue += strongedVersions[ii].value;
		if(ii < strongedVersions.length -1) {
			allOptionsValue += ',';
		}
	}
	
	var allOptions = "<tr><td><input id='il_all' type='checkbox' value='" + allOptionsValue + "' />" +
	  "<label for='il_" + ii + "'>All</label></td><td>&nbsp;</td></tr>";
	
	interlinearChoices.append("<table>" + allOptions + allCheckBoxes + "</table>");
}

/**
 * adds the handlers to all the normal checkboxes to add text into
 * the textbox if selected and remove it if not
 */
InterlinearPopup.prototype.addHandlersToCheckboxes = function() {
	var self = this;
	$("input", this.interlinearPopup).not("#il_all").change(function() {
		var currentText = $(".interlinearVersions", self.interlinearPopup).val();
		var itemValue = this.value;
		
		//if checked & textbox contains the checkbox
		if(this.checked && currentText.indexOf(itemValue) < 0) {
			currentText += itemValue + ",";
		} else if(!this.checked) {
			currentText = currentText.replace(itemValue, "");
			currentText = currentText.replace(",,", ",");
			if(currentText[0] == ',') {
				currentText = currentText.substring(1);
			}
		}
		$(".interlinearVersions", self.interlinearPopup).val(currentText);
	});
}

/**
 * adds a handler that adds all the options to the textbox
 */
InterlinearPopup.prototype.addAllOptionsHandler = function() {
	$("#il_all", this.interlinearPopup).change(function() {
		//so on change, we basically put replace the whole text, not just part of it...
		if(this.checked) {
			$(".interlinearVersions", self.interlinearPopup).val(this.value);
			$("label[for = 'il_all']", this.interlinearPopup).val("None");
		} else {
			$(".interlinearVersions", self.interlinearPopup).val("");
			$("label[for = 'il_all']", this.interlinearPopup).val("All");
		}
	});
}

/**
 * sets up the handler to show the popup. This alerts the menu if the state has changed
 * so that the icon can be adjusted correctly, it also alerts that the options have changed
 * so that a passage may or may not need changing...
 */
InterlinearPopup.prototype.addShowHandler = function() {
	var self = this;
	$(this.interlinearPopup).hear("interlinear-menu-option-triggered-" + this.passageId, function(selfElement, passageId) {
		selfElement.dialog({
			buttons : { "OK" : function() {
							//we check that we have selected some options and alert the menu if so
							if($("input:checked", self.interlinearPopup).length) {
								$.shout("pane-menu-internal-state-changed-" + self.passageId, { name: "INTERLINEAR", selected: true });
							} else {
								$.shout("pane-menu-internal-state-changed-" + self.passageId, { name: "INTERLINEAR", selected: false });
							}
							$(selfElement).dialog("close");
							
							//not always true but almost always (since we might still have the same options as before)
							$.shout("toolbar-menu-options-changed-" + self.passageId);
						},
			},
			modal: true,
			width: DEFAULT_POPUP_WIDTH,
			title: "Please choose one or more versions for the interlinear" + self.passageId
		});
	});
}
