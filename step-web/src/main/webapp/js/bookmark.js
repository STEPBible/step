
/**
 * The bookmarks components record events that are happening across the application,
 * for e.g. passage changes, but will also show related information to the passage.
 */
function Bookmark(bookmarkContainer) {
	this.bookmarkContainer = bookmarkContainer;
	var self = this;
	
	//listen to passage changes
	this.bookmarkContainer.hear("passage-changed", function(selfElement, data) {
		self.addHistory(data);
	});
}


/**
 * Adding a bookmark
 */
Bookmark.prototype.addHistory = function(passageReference) {
	//construct bookmark
//	var item = "<span>" + passageReference + "</span>";
//	$("#bookmarkPane span").prepend(item);
}	
	
	
	
	
	//	var bookmark = this.get(passageReference);
//	if(bookmark) {
//		//move bookmark around
//		
//		return;
//	}
//	
//	//otherwise we create the bookmark
//	bookmark = "<span class='bookmark'>" +
//			"<a href='#left-" + passageReference + "' >" + "left-arrow" +"</a>" +
//			passageReference +
//			"<a href='#right-" + passageReference + "' >" + "right-arrow" +"</a>" +;
//	
//	$(this.bookmarkContainer).append(bookmark);
//	
//	//insert bookmark here => i.e. it would be good to have a linked list implementation? (or perhaps, 
//	//we insert whatever...
//	this.currentBookmarks.insert(bookmark);
//}
//
///**
// * gets a bookmark
// */
//Bookmark.prototype.get = function(passageReference) {
//	//TODO check this
//	return $("val() = " + passageReference, this.bookmarkContainer);
////or
//	/*
//	var i = 0;
//	for(i = 0; i < this.currentBookmarks.length; i++) {
//		if(this.currentBookmarks[i].val() = passageReference) {
//			return this.currentBookmarks[i];
//		}
//	}*/
//}
//
///** 
// * removes a bookmark from the list
// */
//Bookmark.prototype.remove(reference) {
//	var b = getBookmark(reference);
//	if(b) {
//		b.removeFromParent();
//	}
//}

