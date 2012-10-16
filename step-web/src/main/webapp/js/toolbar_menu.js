/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

/**
 * Represents the menu that will be at the top of the passage container
 */
function ToolbarMenu(passageId, menuRoot) {
	this.passageId = passageId;
	this.menuRoot = $(menuRoot);
	var self = this;
	
	ddsmoothmenu.init({
		mainmenuid: menuRoot.id, 		//menu DIV id
		zIndexStart: 100,
		orientation: 'h', 				//Horizontal or vertical menu: Set to "h" or "v"
		classname: 'ddsmoothmenu innerMenu', //class added to menu's outer DIV
		//customtheme: ["#1c5a80", "#18374a"],
		contentsource: "markup"
	});
	
	$(menuRoot).hear("version-changed-" + this.passageId, function(selfElement) {
		self.refreshMenuOptions();
	});
	
	$(menuRoot).hear("version-changed-dynamically" + this.passageId, function(selfElement) {
		self.refreshMenuOptions();
	});
}

/**
 * Refreshes the menu options according to what can currently be displayed
 * @param version the new version of the passage
 */
ToolbarMenu.prototype.refreshMenuOptions = function() {
	var self = this;
	var version = step.state.passage.version(this.passageId);
	var mode = step.passage.getDisplayMode(this.passageId).displayMode;
	if(step.util.isBlank(mode)) {
	    mode = "NONE";
	}
	
	var displayMenu = $("li[menu-name='DISPLAY']", step.util.getPassageContainer(this.passageId));
	$.getSafe(BIBLE_GET_FEATURES, [version, mode], function (features) {
		//build up map of options
	    $("a", displayMenu).removeClass("disabled").removeAttr('title').qtip('destroy');
		
		for(var i = 0; i < features.removed.length; i++) {
		    $("a[name='" + features.removed[i].option + "']", displayMenu)
		        .addClass("disabled")
		        .attr('title', features.removed[i].explanation)
		        .qtip({ position: {my: "center right", at: "left center", viewport: $(window) }});
		}
		
		$.shout("toolbar-menu-options-changed-" + self.passageId);
	});
};
