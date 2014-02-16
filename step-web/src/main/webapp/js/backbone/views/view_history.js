var ViewHistory = Backbone.View.extend({
    events: {
    },
    itemTemplate: _.template('<li class="list-group-item" data-item="<%= item.get("id") %>">' +
        '<a class="openBookmark"><span class="glyphicon glyphicon-folder-open"></span></a>' +
        '<a class="starBookmark"><span class="glyphicon glyphicon-star-empty"></span></a>' +
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
        this.list = $(this.fullList({ bookmarks: step.bookmarks, view: this }));
        this.$el.append(this.list);
        this.$el.find(".removeBookmark").click(function () {
            var item = $(this).closest("li");
            var bookmarkId = item.data("item");
            step.bookmarks.findWhere({id: bookmarkId }).destroy();
            item.remove();
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
        this.list.prepend(newItem);
    },
    removeItem: function (model) {
        this._findByModel(model).remove();
        model.destroy();
    },
    updatedBookmark: function (model) {
        this.list.prepend(this._findByModel(model));
    },
    _findByModel: function(model) {
        return this.$el.find("li[data-item='" + model.get("id") + "']");
    }
});
