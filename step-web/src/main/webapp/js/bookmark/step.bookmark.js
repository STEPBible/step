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
 * 
 * This could probably now be simplified by doing all the logic server side for the history
 */

step.bookmark = {
        maxItems : 15,
        skip : 2,
        
        addItem : function(type, reference) {
            if(this.skip > 0) {
                this.skip--;
                return
            }
            
            var newReference = (reference || "").replace(/['"]/g, "");
            var items = this.getItems(type);
            items = items.replace(newReference, "");
            
            items = items + "|" + newReference;
            var deleted = this.store(type, items);
            
            
            var container = this._getContainer(type);
            var ascending = this._getAscending(type);
            
            this._deleteItems(container, ascending, deleted);
            this._deleteItemsMatchingReference(newReference, container);
            this._renderSingleItem(newReference, this._getAscending(type), container);
        },
        
        getItems : function(type) {
            return $.localStore(type) || "";
        },
        
        store : function(type, delimitedList) {
            var arr = (delimitedList || "").split("|");

            var shifted = 0;
            while(arr.length > this.maxItems) {
                arr.shift();
                shifted++;
            }
            
            $.localStore(type, arr.join("|"));
            return shifted;
        },
        
        render : function(type) {
            var items = this.getItems(type).split("|");
            var container = this._getContainer(type);
            var ascending = this._getAscending(type);

            //empty and re-render
            container.empty();
            for(var i = 0; i < items.length; i++) {
                this._renderSingleItem(items[i], ascending, container);
            }
        },

        _deleteItems : function(container, ascending, deleted) {
            for(var i = 0; i < deleted; i++) {
                if(ascending) {
                    container.children().first().remove();
                } else {
                    container.children().last().remove();
                }
            }
        },
        
        _deleteItemsMatchingReference : function(reference, container) {
            $("[ref='" + reference + "']", container).remove();
        },
        
        _getContainer : function(type) {
            return type == 'bookmark' ? $("#bookmarkDisplayPane") : $("#historyDisplayPane");
        },
        
        _getAscending : function(type) {
            return type == 'bookmark';
        },
        
        _renderSingleItem : function(reference, ascending, container) {
            
            if(!step.util.isBlank(reference)) {
                var item = "<div class='bookmarkItem' ref='" + reference + "'>";
                item += goToPassageArrow(true, reference, "bookmarkArrow leftBookmarkArrow");
                item += "<a class='searchRefLink' href='#' onclick='passageArrowTrigger(0, \"" + reference + "\", false)' >"
                item += reference;
                item += "</a>";
                item += goToPassageArrow(false, reference, "bookmarkArrow rightBookmarkArrow");
                item += "</div>";
                
                if(ascending) {
                    container.append(item);
                } else {
                    container.prepend(item);
                }
            }            
        }
}

//listen to passage changes
$(step.bookmark).hear("passage-changed", function(selfElement, data) {
    step.bookmark.addItem("history", step.state.passage.reference(data.passageId));
});

$(step.bookmark).hear("bookmark-addition-requested", function(selfElement, data) {
    step.bookmark.addItem("bookmark", data.reference);
});

$(document).ready(function() {
    step.bookmark.render("history");
    step.bookmark.render("bookmark");
    
    //add click handlers for history and bookmarks...
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
});

