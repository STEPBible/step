
/**
 * The bookmarks components record events that are happening across the application,
 * for e.g. passage changes, but will also show related information to the passage.
 */
function Bookmark(bookmarkContainer) {
	this.bookmarkContainer = bookmarkContainer;
	var self = this;
	
	//listen to passage changes
	this.bookmarkContainer.hear("passage-changed", function(selfElement, data) {
		self.addHistory(data.reference);
	});
	
	this.initialiseHistory();
}

Bookmark.maxBookmarks = 10;
Bookmark.historyDelimiter = '#';

//we need to ignore the first two passage changes since we have those in the history
//the history giving us the order of things
Bookmark.ignoreChangePassage = 2;

/**
 * Adding a bookmark
 */
Bookmark.prototype.addHistory = function(passageReference) {
	//we ignore the first two items:
	if(Bookmark.ignoreChangePassage != 0) {
		Bookmark.ignoreChangePassage--;
		return;
	}
	
	
	//if we have the bookmark already, then we stop here
	var history = this.getHistory();
	
	var indexInHistory = $.inArray(passageReference, history);
	
	if(indexInHistory == -1) {
		if(history.length > Bookmark.maxBookmarks) {
			//we remove the first element in the array (i.e. the last child).
			history.pop();
			$("div.bookmarkItem:last", this.bookmarkContainer).remove();
		}
		
		//then add
		this.createBookmarkItem(passageReference);
		history.unshift(passageReference);
	} else {
		//reposition item...
		var item = $("div.bookmarkItem", this.bookmarkContainer).eq(indexInHistory).detach();
		history.splice(indexInHistory, 1);
		this.bookmarkContainer.prepend(item);
		history.unshift(passageReference);
	}
	
	this.setHistory(history);
};	
	
Bookmark.prototype.initialiseHistory = function() {
	var history = this.getHistory();
	if(history != null) {
		for(var ii = history.length -1; ii >= 0; ii--) {
			this.createBookmarkItem(history[ii]);
		}
	}
}

Bookmark.prototype.createBookmarkItem = function(passageReference) {
	if(passageReference && passageReference != "") {
		var item = "<div class='bookmarkItem'>";
		item += "<a class='ui-icon ui-icon-arrowthick-1-w bookmarkArrow leftBookmarkArrow' href='#' onclick='$.shout(\"bookmark-triggered-0\", \""+ passageReference + "\");'>&larr;</a>";
		item += passageReference;
		item += "<a class='ui-icon ui-icon-arrowthick-1-e bookmarkArrow rightBookmarkArrow' href='#' onclick='$.shout(\"bookmark-triggered-1\", \""+ passageReference + "\");'>&rarr;</a>";
		item += "</div>";
		
		this.bookmarkContainer.prepend(item);
	}
};

Bookmark.prototype.getHistory = function() {
	var history = $.cookie("history");
	if(history == null) {
		return [];
	}
	return history.split(Bookmark.historyDelimiter);
};

Bookmark.prototype.setHistory = function(history) {
	$.cookie("history", history.join(Bookmark.historyDelimiter))
};
