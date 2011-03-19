
/**
 * The bookmarks components record events that are happening across the application,
 * for e.g. passage changes, but will also show related information to the passage.
 */
function Bookmark(bookmarkContainer) {
	this.historyContainer = $("#historyDisplayPane");
	this.bookmarkContainer = $("#bookmarkDisplayPane");
	this.loadedBookmarks = false;
	var self = this;
	
	//listen to passage changes
	this.historyContainer.hear("passage-changed", function(selfElement, data) {
		self.addHistory(data.reference);
	});
	
	this.initialiseHistory();
	
	//add accordion handlers
	$("#bookmarkPane h3").click(function() {
		//toggle the arrow
		var eastArrow = "ui-icon-triangle-1-e";
		var southArrow = "ui-icon-triangle-1-s";
		var icon = $(":first", this);
		
		if(icon.hasClass(eastArrow)) {
			icon.removeClass(eastArrow);
			icon.addClass(southArrow);
		} else {
			icon.addClass(eastArrow);
			icon.removeClass(southArrow);
		}

		$(this).next().slideToggle(250);
	}).disableSelection().next().slideUp(0);
	
	//finally, we add a handler to force login of the bookmarks
	$("#bookmarkHeader").click(function() {
		self.loadBookmarks();
	}).hear("user-logged-out", function(selfElement, data) {
		//we clear the bookmarks
		
		self.loadedBookmarks = false;
		self.bookmarkContainer.html("");
	});
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
			$("div.bookmarkItem:last", this.historyContainer).remove();
		}
		
		//then add
		this.createHistoryItem(passageReference);
		history.unshift(passageReference);
	} else {
		//reposition item...
		var item = $("div.bookmarkItem", this.historyContainer).eq(indexInHistory).detach();
		history.splice(indexInHistory, 1);
		this.historyContainer.prepend(item);
		history.unshift(passageReference);
	}
	
	this.setHistory(history);
};	
	
Bookmark.prototype.initialiseHistory = function() {
	var history = this.getHistory();
	if(history != null) {
		for(var ii = history.length -1; ii >= 0; ii--) {
			this.createHistoryItem(history[ii]);
		}
	}
}

/**
 * loads the bookmarks from the server
 */
Bookmark.prototype.loadBookmarks = function() {
	var self = this;
	if(!this.loadedBookmarks) {
		$.getSafe(BOOKMARKS_GET, function(data) {
			//someone might have clicked twice, so need to check again
			if(!this.loaded) {
				this.loaded = true;
				//we load the bookmarks
				$.each(data, function(index, item) {
					self.createBookmarkItem(item.bookmarkReference);
				});
			}
		});
	}
}

/**
 * creates a history item
 */
Bookmark.prototype.createHistoryItem = function(passageReference) {
	this.createItem(passageReference, this.historyContainer, false);
};

/**
 * creates a history item
 */
Bookmark.prototype.createBookmarkItem = function(passageReference) {
	this.createItem(passageReference, this.bookmarkContainer, false);
};


Bookmark.prototype.createItem = function(passageReference, container, ascending) {
	if(passageReference && passageReference != "") {
		var item = "<div class='bookmarkItem'>";
		item += "<a class='ui-icon ui-icon-arrowthick-1-w bookmarkArrow leftBookmarkArrow' href='#' onclick='$.shout(\"bookmark-triggered-0\", \""+ passageReference + "\");'>&larr;</a>";
		item += passageReference;
		item += "<a class='ui-icon ui-icon-arrowthick-1-e bookmarkArrow rightBookmarkArrow' href='#' onclick='$.shout(\"bookmark-triggered-1\", \""+ passageReference + "\");'>&rarr;</a>";
		item += "</div>";
		
		if(ascending) {
			container.append(item);
		} else {
			container.prepend(item);
		}
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
