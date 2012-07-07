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

function Search(passageContainer) {
	this.context = $(passageContainer);
	this.passageId = this.context.attr("passage-id");
	
	var self = this;

	this.versionSearchBox = $(".versionSearchBox", this.context).keypress(function(e) {
	    if(e.which == 13) {
	    	self.handleSearch();
	    }
	});

	
	$(".searchButton", passageContainer).button(
			{
				icons: { primary: 'ui-icon-search' },
				text: false
			}
	).click(function() {
		self.handleSearch();
	}).position({my: "left", at: "right", of: this.versionSearchBox});

	
//	$(".searchScope", this.context).hide();
}

/**
 * handles a search click
 */
Search.prototype.handleSearch = function() {
	var self = this;
	
	$.getSafe(SEARCH_DEFAULT + $(".passageVersion", this.context).val() + "/" + $(".versionSearchBox", this.context).val(), function(searchQueryResults) {
		var results = "";
		var searchResults = searchQueryResults.results;
		
		if(searchResults.length == 0) {
			results += "<span class='notApplicable'>No search results were found</span>";
		}
		
		$.each(searchResults, function(i, item) {
			results += "<div class='searchResultRow'><span class='searchResultKey'> ";
			results += goToPassageArrow(true, item.key, "searchKeyPassageArrow");
			results += item.key;
			results += goToPassageArrow(false, item.key, "searchKeyPassageArrow");
			results += "</span>";
			results += item.preview;
			results += "</div>";
		});

		if(searchQueryResults.maxReached == true) {
			results += "<span class='notApplicable'>The maximum number of search results was reached. Please refine your search to see continue.</span>";
		}
		
		$(".passageContent", self.context).html(results);
		
	});
};


