var ViewHistory = Backbone.View.extend({
    itemTemplate: _.template('<li class="list-group-item" data-item="<%= item.get("id") %>">' +
        '<a class="openBookmark"><span class="glyphicon glyphicon-folder-open"></span></a>' +
        '<a class="starBookmark"><span class="glyphicon <%= item.get("favourite") ? "glyphicon-star" : "glyphicon-star-empty" %>"></span></a>' +
        '<a class="removeBookmark"><span class="glyphicon glyphicon-remove"></span></a>' +
        '<% _.each(view.getKeyValues(item.get("args")), function(a) { %><span class="argSelect select-<%= a.key %>"><%= a.value %></span> <% }); %>' +
        '</li>'),
    fullList: _.template('<ul class="list-group"><% bookmarks.each(function(bookmark) { %><%= view.itemTemplate({ item: bookmark, view: view }) %> <% }) %></ul>'),
    initialize: function () {
        var self = this;

        this.listenTo(step.bookmarks, 'change:lastAccessed', this.updatedBookmark);
        this.listenTo(step.bookmarks, 'add', this.addItem);
        this.listenTo(step.bookmarks, 'remove', this.removeItem);
        this.render();
    },
    render: function () {
        var self = this;
        if(this.list) {
            this.list.remove();
        }
        
        this.list = $(this.fullList({ bookmarks: step.bookmarks, view: this }));
        this.$el.append(this.list);
        this.$el.find(".removeBookmark").click(function () {
            var item = $(this).closest("li");
            var bookmarkId = item.data("item");
            step.bookmarks.findWhere({id: bookmarkId }).destroy();
            item.remove();
        });
        this.$el.find(".starBookmark").click(function() {
            var item = $(this).closest("li");
            var bookmarkId = item.data("item");
            var model = step.bookmarks.findWhere({id: bookmarkId });
            model.save({ favourite: !model.get("favourite") });
            step.bookmarks.sort();
            self.render();
        });
        this.$el.find(".openBookmark").click(function() {
            var item = $(this).closest("li");
            var bookmarkId = item.data("item");
            var model = step.bookmarks.findWhere({id: bookmarkId });
            step.router.navigateSearch(model.get("args"));
        });
    },
    getKeyValues: function (args) {
        var tokens = (args || "").split("|");
        var data = [];
        for (var i = 0; i < tokens.length; i++) {
            var tokenParts = tokens[i].split("=");
            if (tokenParts.length > 1) {
                var key = tokenParts[0];
                var value = tokenParts.slice(1).join("=");
                data.push({ key: key, value: value });
            }
        }
        return data;
    },
    refresh: function () {
        if (this.$el.hasClass("active")) {
            this.render();
        }
    },
    addItem: function (model) {
        var newItem = $(this.itemTemplate({ item: model, view: this }));
        this._insertBookmark(model, newItem);
    },
    removeItem: function (model) {
        this._findByModel(model).remove();
        model.destroy();
    },
    updatedBookmark: function (model) {
        this._insertBookmark(model, this._findByModel(model));
    },
    _insertBookmark: function(model, item) {
        var lastStarred = this.list.find("li:has(.glyphicon-star):last");
        if(model.get("favourite") || lastStarred.length == 0) {
            this.list.prepend(item);
        } else {
            item.insertAfter(lastStarred);
        }    
    },
    _findByModel: function(model) {
        return this.$el.find("li[data-item='" + model.get("id") + "']");
    }
});
