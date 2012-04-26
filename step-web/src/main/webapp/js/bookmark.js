/**
 * The bookmarks components record events that are happening across the application,
 * for e.g. passage changes, but will also show related information to the passage.
 * 
 * This could probably now be simplified by doing all the logic server side for the history
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

	this.bookmarkContainer.hear("bookmark-addition-requested", function(selfElement, data) {
		self.addBookmark(data.reference);
	});

	
	this.bookmarkContainer.hear("user-logged-in", function(selfElement, data) {
		self.mergeHistory(data);
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

//TODO make server setting
Bookmark.maxBookmarks = 10;
//TODO make server setting
Bookmark.historyDelimiter = '~';

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
	
	//check if we have the reference in the array (starts for example: '1 John@' where @ denotes the time at which it happened
	var indexInHistory = 0;
	for(indexInHistory = 0; indexInHistory < history.length; indexInHistory++) {
		if(history[indexInHistory].match("^" + passageReference + "@")) {
			break;
		}
	}

	//if we didn't find the item
	var fullHistoryStorageText = passageReference + "@" + new Date().getTime();
	
	if(indexInHistory == history.length) {
		if(history.length > Bookmark.maxBookmarks) {
			//we remove the first element in the array (i.e. the last child).
			history.pop();
			$("div.bookmarkItem:last", this.historyContainer).remove();
		}
		
		//then add
		this.createHistoryItem(passageReference);
		history.unshift(fullHistoryStorageText);
		$.get(HISTORY_ADD + fullHistoryStorageText);
	} else {
		//reposition item...
		var item = $("div.bookmarkItem", this.historyContainer).eq(indexInHistory).detach();
		history.splice(indexInHistory, 1);
		this.historyContainer.prepend(item);
		history.unshift(fullHistoryStorageText);
		$.get(HISTORY_ADD + fullHistoryStorageText);
	}
	
	this.setHistory(history);
};	


Bookmark.prototype.addBookmark = function(passageReference) {
	var self = this;
	$.getSafe(BOOKMARKS_ADD + passageReference, function(data) {
		self.createBookmarkItem(passageReference, this.bookmarkContainer, false);
	});
};	


Bookmark.prototype.initialiseHistory = function() {
	//create the history from the cookie, or - logged-in event will override
	var self = this;
	self.createHistoryItemsFromCookies();
};

/** 
 * we need to work out what our current history is like, and then reset it to be appropriate
 */
Bookmark.prototype.mergeHistory = function() {
	//we call this when we're logged on, so we get can send the history to the server, merge and set it back
	var self = this;
	$.getSafe(HISTORY_GET + $.cookie("history"), function(data) {
		//we now have the merged history
		self.clearHistory();
		
		var historyText = "";
		if(data) {
			$.each(data, function(index, item) {
				//for each item, it has a lastUpdated and a historyReference
				historyText += item.historyReference + '@' + new Date(item.lastUpdated).getTime() + Bookmark.historyDelimiter;
			});
			
			$.cookie("history", historyText);
			self.createHistoryItemsFromCookies();
		}
	});
};

/**
 * creates the history from the items stored in the cookie,
 * this is called either after setting the persisted history
 * into the cookie, or when the user is not logged in!
 */
Bookmark.prototype.createHistoryItemsFromCookies = function() {
	var history = this.getHistory();
	if(history != null) {
		for(var ii = history.length -1; ii >= 0; ii--) {
			this.createHistoryItem(history[ii]);
		}
	}
};

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
};

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

/**
 * clears the history
 */
Bookmark.prototype.clearHistory = function() {
	this.historyContainer.empty();
};


Bookmark.prototype.createItem = function(passageCookieReference, container, ascending) {
	var passageRefParts = passageCookieReference.split('@');
	var passageReference = passageRefParts[0];
	
	if(passageReference && passageReference != "") {
		var item = "<div class='bookmarkItem'>";
		item += "<a class='ui-icon ui-icon-arrowthick-1-w bookmarkArrow leftBookmarkArrow' href='#' onclick='$.shout(\"new-passage-0\", \""+ passageReference + "\");'>&larr;</a>";
		item += passageReference;
		item += "<a class='ui-icon ui-icon-arrowthick-1-e bookmarkArrow rightBookmarkArrow' href='#' onclick='$.shout(\"new-passage-1\", \""+ passageReference + "\");'>&rarr;</a>";
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
	$.cookie("history", history.join(Bookmark.historyDelimiter));
};
