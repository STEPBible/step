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
 * The bookmarks components record events that are happening across the application,
 * for e.g. passage changes, but will also show related information to the passage.
 */
function LexiconDefinition() {
	var self = this;
	//listen for particular types of events and call the prototype functions
	this.getPopup().hear("show-all-strong-morphs", function(selfElement, data) {
		self.showDef(data);
	} );
}

LexiconDefinition.prototype.getPopup = function() {
	if(this.popup) {
		this.popup.css('display', 'inline-block');
		return this.popup;
	}
	
	//create the popup container
	$("body").append("<span id='lexiconDefinition'><ul><span id='lexiconPopupClose'>X</span></ul></span>");
	this.popup = $("#lexiconDefinition");
	this.popup.tabs().draggable();
	$('#lexiconPopupClose').click(function() {
		$('#lexiconDefinition').hide();
	});
	return this.popup;
};

LexiconDefinition.prototype.showDef = function(s) {
	var self = this;
	var popup = self.getPopup();
	
	//create all tabs - first remove everything, then readd.
	popup.tabs("destroy");
	popup.tabs();
	
	var tabs = s.split(" ");
	$(tabs).each(function() {
		popup.tabs("add", MODULE_GET_DEFINITION + this, self.getShortKey(this));
	});

	popup.tabs("option", {
		collapsible: true,
		selected: 0
	});
	
	//TODO this is a workaround because of bug http://bugs.jqueryui.com/ticket/5069
	popup.tabs("select", 1);
	popup.tabs("select", 0);
	
	//if left position is negative, then we assume it's off screen and need position
	if(popup.css("left")[0] == '-') {
		//position in the middle
		popup.position({
			of: $("body"),
			my: "right top",
			at: "right top",
			collision: "fit flip",
		});
	}
};

LexiconDefinition.prototype.getShortKey = function(k) {
	var subKey = k.substring(k.indexOf(':') + 1);
	if(subKey[0] == 'G' || subKey[0] == 'H') {
		return subKey.substring(1);
	}
	return subKey;
};
