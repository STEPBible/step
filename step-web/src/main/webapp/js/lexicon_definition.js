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
function LexiconDefinition(currentLevel) {
	var self = this;
	//listen for particular types of events and call the prototype functions
	this.getPopup().hear("show-all-strong-morphs", function(selfElement, data) {
		self.showDef(data);
	});
	
	$("#detailLevel").slider({
		min: 1,
		max: 3,
		slide: function(event, ui) {
			self.updateSliderImpact(ui.value-1);
		},
		value: currentLevel + 1
	});
	
	this.updateSliderImpact(currentLevel);
};

LexiconDefinition.prototype.updateSliderImpact = function(newLevel) {
	$("#sliderDetailLevelLabel").html(DETAIL_LEVELS[newLevel] + " view");
	
	//show all relevant levels
	$("#lexiconDefinition *").filter(function() { return $(this).attr("level") <= newLevel; }).show();
	$("#lexiconDefinition *").filter(function() { return $(this).attr("level") > newLevel; }).hide();
};

LexiconDefinition.prototype.getPopup = function() {
	if(this.popup) {
		this.popup.css('display', 'inline-block');
		return this.popup;
	}
	
	//create the popup container
	this.popup = $("#lexiconDefinition");
	this.popup.tabs().draggable({ handle: "#lexiconDefinitionHeader"});
	$('#lexiconPopupClose').click(function() {
		$('#lexiconDefinition').hide();
	});
	return this.popup;
};

LexiconDefinition.prototype.showDef = function(data) {
	var self = this;
	var popup = self.getPopup();
	
	//create all tabs - first remove everything, then readd.
	var displayedWord = data.displayedWord;
	var strong = data.strong;
	var morph = data.morph;
	var verse = $(data.source).closest("span.verse").filter("a:first").attr("name");
	
	//Get info on word
	$.getSafe(MODULE_GET_INFO + strong + "/" + morph + "/" + verse, function(data) {
		self.showOriginalWordData(data);
		self.showContext(data);
	});
	
	this.reposition();
};

LexiconDefinition.prototype.showOriginalWordData = function(data) {
	var detailLevel = $("#selectedDetail", this.popup).val();
	
	this.populateIds(data.morphInfos, "#grammarContainer");
	this.populateIds(data.vocabInfos, "#vocabContainer");
	
};


LexiconDefinition.prototype.populateIds = function(data, container) {
	$("*", container).each(function(index, item) {
		if(item.id) {
			var content = data[0][item.id];
			if(content) {
				if(content.replace) {
					content = content.replace(/_(.*)_/g, "<span class=\"emphasisePopupText\">$1</span>");
				}
				
				$(item).html(content);
			}
		}
		
		if($(item).attr("depends-on")) {
			//make visible or not
			$(item).toggle(data[0][$(item).attr("depends-on")] != "");
		}
	});
}

LexiconDefinition.prototype.showContext = function(data) {
	var detailLevel = $("#selectedDetail", this.popup).val();
	
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
