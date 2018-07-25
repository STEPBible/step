var ViewHistory = Backbone.View.extend({
    MAX_HISTORY: 300,
    itemTemplate: _.template('<li class="list-group-item historyItem" data-item="<%= item.get("id") %>">' +
        '<a class="openBookmark" title="<%= __s.bookmarks_open %>"><span class="glyphicon glyphicon-open"></span></a>' +
        '<a class="starBookmark" data-favourite="<%= item.get("favourite")%>" title="<%= item.get("favourite") ? __s.passage_tools_delete_bookmark : __s.passage_tools_bookmark %>">' +
        '<span class="glyphicon <%= item.get("favourite") ? "glyphicon-pushpin-pinned" : "glyphicon-pushpin" %>"></span></a>' +
        '<a class="removeBookmark" title="<%= __s.bookmark_remove %>"><span class="glyphicon glyphicon-remove"></span></a>' +
        '<span class="argSummary">' +
        '<%= step.util.ui.renderArgs(item.get("searchTokens")) %>' +
        '</span>' +
        '</li>'),
    fullList: _.template(
        '<h2><%= __s.bookmarks_pinned %></h2><ul class="list-group">' +
        '<% var bks = bookmarks.where({favourite: true }); for(var i = 0; i < bks.length; i++) { %><%= view.itemTemplate({ item: bks[i], view: view }) %> <% } %>' +
        '</ul><h2><%= __s.bookmarks_recent %></h2><ul class="list-group">' +
        '<% var bks = bookmarks.where({favourite: false }); for(var i = 0; i < bks.length; i++) { %><%= view.itemTemplate({ item: bks[i], view: view }) %> <% } %>' +
        '</ul>'),
    initialize: function () {
        var self = this;

        this.listenTo(step.bookmarks, 'change:lastAccessed', this.updatedBookmark);
        this.listenTo(step.bookmarks, 'add', this.addItem);
        this.listenTo(step.bookmarks, 'remove', this.removeItem);
        this.render();
    },
    removeBookmarkHandler: function (self) {
        var item = $(self).closest("li");
        var bookmarkId = item.data("item");
        step.bookmarks.findWhere({id: bookmarkId }).destroy();
        item.remove();
    }, starBookmarkHandler: function (self) {
        var item = $(self).closest("li");
        var bookmarkId = item.data("item");
        var model = step.bookmarks.findWhere({id: bookmarkId });
        model.save({ favourite: !model.get("favourite") });
        step.bookmarks.sort();
        this.render();
    }, openBookmarkHandler: function (self) {
        var item = $(self).closest("li");
        var bookmarkId = item.data("item");
        var model = step.bookmarks.findWhere({id: bookmarkId });
        step.router.navigateSearch(model.get("args"));
    }, render: function () {
        var self = this;
        if(this.list) {
            this.list.remove();
            this.list = null;
        }
        //force re-add
        this._getList();

        this.$el.find(".removeBookmark").click(function () {
            self.removeBookmarkHandler(this);
        });
        this.$el.find(".starBookmark").click(function() {
            self.starBookmarkHandler(this);
        });
        this.$el.find(".openBookmark").click(function() {
            self.openBookmarkHandler(this);
        });
    },
    
    refresh: function () {
        if (this.$el.hasClass("active")) {
            this.render();
        }
    },
    addItem: function (model) {
        var newItem = $(this.itemTemplate({ item: model, view: this }));
        var self = this;
        this._insertBookmark(model, newItem);

        newItem.find(".removeBookmark").click(function () {
            self.removeBookmarkHandler(this);
        });
        newItem.find(".starBookmark").click(function() {
            self.starBookmarkHandler(this);
        });
        newItem.find(".openBookmark").click(function() {
            self.openBookmarkHandler(this);
        });

        //count the number of bookmark items, and if too large, then get rid of them.
        var bookmarks = this.$el.find(".historyItem").not(":has([data-favourite='true'])");
        if(bookmarks.length > this.MAX_HISTORY) {
            //only delete if they are not marked as favourite
            var lastBookmark = bookmarks.last().data("item");
            var bookmark = step.bookmarks.findWhere({ id: lastBookmark });
            if(bookmark) {
                this.removeItem(bookmark);
            }
        }
    },
    removeItem: function (model) {
        this._findByModel(model).remove();
        model.destroy();
    },
    updatedBookmark: function (model) {
        this._insertBookmark(model, this._findByModel(model));
    },
    _insertBookmark: function(model, item) {
        try {
            if (model.get("favourite")) {
                var firstRecent = this._getList().find("li:has([data-favourite='true']):first");
                if (firstRecent.length > 0) {
                    item.insertBefore(firstRecent);
                } else {
                    this._getList().filter(".list-group:first").append(item);
                }

            } else {
                var firstRecent = this._getList().find("li:has([data-favourite='false']):first");
                if (firstRecent.length > 0) {
                    item.insertBefore(firstRecent);
                } else {
                    this._getList().filter(".list-group:last").append(item);
                }
            }
        } catch(e) {
            console.log("FAILED TO ADD BOOKMARK");
        }

    },
    _findByModel: function(model) {
        return this.$el.find("li[data-item='" + model.get("id") + "']");
    },
    _getList: function() {
        if(this.list) {
            return this.list;
        }
        this.list = $(this.fullList({ bookmarks: step.bookmarks, view: this }));
        this.$el.append(this.list);
        return this.list;
    }
});
