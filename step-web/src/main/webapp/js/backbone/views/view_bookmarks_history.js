/**************************************************************************************************
 * Copyright (c) 2013, Directors of the Tyndale STEP Project                                      *
 * All rights reserved.                                                                           *
 *                                                                                                *
 * Redistribution and use in source and binary forms, with or without                             *
 * modification, are permitted provided that the following conditions                             *
 * are met:                                                                                       *
 *                                                                                                *
 * Redistributions of source code must retain the above copyright                                 *
 * notice, this list of conditions and the following disclaimer.                                  *
 * Redistributions in binary form must reproduce the above copyright                              *
 * notice, this list of conditions and the following disclaimer in                                *
 * the documentation and/or other materials provided with the                                     *
 * distribution.                                                                                  *
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)                        *
 * nor the names of its contributors may be used to endorse or promote                            *
 * products derived from this software without specific prior written                             *
 * permission.                                                                                    *
 *                                                                                                *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                            *
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                              *
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS                              *
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE                                 *
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                           *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,                           *
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                               *
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER                               *
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT                             *
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING                                 *
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF                                 *
 * THE POSSIBILITY OF SUCH DAMAGE.                                                                *
 **************************************************************************************************/

var BookmarkHistory = Backbone.View.extend({
    el: function () {
        return $("#bookmarkPane")
    },


    //model is the form:
    // { history : listOfModels, bookmarks: listOfModels }
    initialize: function () {
        this.renderAll(this.model.bookmarks, this._getAscending('bookmarks'), this._getContainer('bookmarks'));
        this.renderAll(this.model.history, this._getAscending('history'), this._getContainer('history'));

        Backbone.Events.on("passage:new:0 passage:new:1", this.addToHistoryModels, this);
        Backbone.Events.on("bookmark:new", this.addToBookmarkModels, this);
        this.listenTo(this.model.history, "add", this.addHistoryView);
        this.listenTo(this.model.history, "remove", this.removeView);
        this.listenTo(this.model.bookmarks, "add", this.addBookmarksView);
        this.listenTo(this.model.bookmarks, "remove", this.removeView);
    },

    addToBookmarkModels : function(value) {
        this.addToModels(value, false, this.model.bookmarks);
    },

    addToHistoryModels: function (value) {
        this.addToModels(value, true, this.model.history);
    },

    addToModels : function(value, addToFront, models) {
        //look for that reference in the list
        var model = models.find(function (model) {
            return model.get("reference") == value.reference
        });

        var options = addToFront ? { at : 0} : {};
        if (model) {
            //re-arrange models
            models.remove(model);
            models.add(model, options);
            return;
        }

        var newItem = new BookmarkModel({ reference: value.reference, version: value.version });
        models.add(newItem, options );
        newItem.save();

        //finally remove any history items that happen to be beyond the 15 mark
        while(models.length > 15) {
            models.at(models.length -1).destroy();
        }
    },

    addBookmarksView : function(singleModel) {
        this.addView(singleModel, 'bookmarks');
    },

    addHistoryView: function (singleModel) {
        this.addView(singleModel, 'history');
    },

    addView : function(singleModel, type) {
        this._renderSingleItem(
            singleModel.get("bookmarkId"),
            singleModel.get("reference"),
            this._getAscending(type),
            this._getContainer(type));
    },

    removeView : function(singleModel) {
        this.$el.find("[bookmarkId='" + singleModel.get("bookmarkId") + "']").remove();
    },

    renderAll: function (list, ascending, container) {
        for (var i = 0; i < list.length; i++) {
            var singleModel = list.at(i);
            this._renderSingleItem(singleModel.get("bookmarkId"), singleModel.get("reference"), ascending, container);
        }
    },

    _renderSingleItem: function (bookmarkId, reference, ascending, container) {
        if (!step.util.isBlank(reference)) {
            var item = $("<div>").addClass('bookmarkItem');
            item.attr("bookmarkId", bookmarkId);
            item.passageButtons({ ref: reference });

            if (ascending) {
                container.append(item);
            } else {
                container.prepend(item);
            }
        }
    },

    _getContainer: function (type) {
        return type == 'bookmarks' ? this.$el.find("#bookmarkDisplayPane") : this.$el.find("#historyDisplayPane");
    },

    _getAscending: function (type) {
        return type == 'bookmarks';
    }
});
