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
	});
}

LexiconDefinition.prototype.getPopup = function() {
	if(this.popup) {
		this.popup.css('display', 'inline-block');
		return this.popup;
	}
	
	//create the popup container
	this.popup = $("#lexiconDefinition");
	this.popup.tabs().draggable();
	$('#lexiconPopupClose').click(function() {
		$('#lexiconDefinition').hide();
	});
	
	
	
	return this.popup;
};

LexiconDefinition.prototype.showDef = function(data) {
	var self = this;
	var popup = self.getPopup();
	
	//create all tabs - first remove everything, then readd.
	popup.tabs("destroy");
	popup.tabs();
	
	var displayedWord = data.displayedWord;
	var strong = data.strong;
	var morph = data.morph;
	
	//show dictionary elements
	this.showStrong(data.strong);
	this.showMorph(data.morph);
	this.showDictionaryTabs(data.displayedWord);
	
	popup.tabs("option", {
		collapsible: false,
		selected: 0
	});
	
	//TODO this is a workaround because of bug http://bugs.jqueryui.com/ticket/5069
//	popup.tabs("select", 1);
//	popup.tabs("select", 0);
	
	this.reposition();
};

LexiconDefinition.prototype.showStrong = function(strong) {
	if(strong) {
//		String strongs = strong.split(" ");
//		$.getSafe(MODULE_GET_DEFINITION + strong, function() {
			
//		});		
	}
};

LexiconDefinition.prototype.showMorph = function(morph) {
	if(morph) {
//		String strongs = strong.split(" ");
//		$.getSafe(MODULE_GET_DEFINITION + strong, function() {
			
//		});		
	}
};

LexiconDefinition.prototype.showDictionaryTabs = function(displayedWord) {
	var self = this;
	$.getSafe(DICTIONARY_SEARCH_BY_HEADWORD + displayedWord, function(data) {
//		$("#tab-1").html(data.text);
//		var tabTitle = data.source;
//		self.getPopup().tabs( "add", "#tab-1", tabTitle);
		
		//make a ul list
		var html = "<h3>Word context</h3><ul>";
		
		$.each(data, function(index, item) {
			html += "<li><a href=\"#\" onclick='showArticle(\""+ item.headword + "\", \"" + item.headwordInstance+ "\")'>" + item.headword + "</a></li>";
		});
		
		html += "</ul><h3>Verse context</h3>";
		$("#dictionaries").html(html);
	});
};

LexiconDefinition.prototype.getShortKey = function(k) {
	var subKey = k.substring(k.indexOf(':') + 1);
	if(subKey[0] == 'G' || subKey[0] == 'H') {
		return subKey.substring(1);
	}
	return subKey;
};

LexiconDefinition.prototype.reposition = function() {
	//if left position is negative, then we assume it's off screen and need position
	if(this.getPopup().css("left")[0] == '-') {
		//position in the middle
		this.getPopup().position({
			of: $("body"),
			my: "right top",
			at: "right top",
			collision: "fit flip",
		});
	}
}
