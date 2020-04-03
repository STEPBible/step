var PanelView = Backbone.View.extend({
    el: function () {
        return step.util.getPassageContainer(this.model.get("passageId"));
    },
    initialize: function () {
        this.render();
    },
    render: function () {
        var self = this;
        var searchType = this.model.get("searchType");
        var partRendered = this.options.partRendered;

        if (searchType === "PASSAGE") {
            this.model.trigger("destroyViews");
            new PassageDisplayView({
                model: this.model,
                partRendered: partRendered
            });
        }
        else {
            require(["search"], function () {
                if (self.model.get("pageNumber") > 1) {
                    self.model.trigger("newPage");
                }
                else {
                    self.model.trigger("destroyViews");
                    switch (searchType) {
                        case "TEXT":
                        case "RELATED_VERSES":
                            new TextDisplayView({
                                model: self.model,
                                partRendered: partRendered
                            });
                            break;
                        case "SUBJECT_SIMPLE" :
                        case "SUBJECT_EXTENDED" :
                        case "SUBJECT_FULL" :
                        case "SUBJECT_RELATED" :
                            new SubjectDisplayView({
                                model: self.model,
                                partRendered: partRendered
                            });
                            break;
                        case "ORIGINAL_MEANING" :
                        case "EXACT_FORM" :
                        case "ORIGINAL_GREEK_FORMS" :
                        case "ORIGINAL_GREEK_RELATED" :
                        case "ORIGINAL_HEBREW_EXACT" :
                        case "ORIGINAL_HEBREW_FORMS" :
                        case "ORIGINAL_HEBREW_RELATED":
                            new WordDisplayView({
                                model: self.model,
                                partRendered: partRendered
                            });
                            break;
                    }
                }
            });
        }

        this.renderHeader();

        return this;
    },
    renderHeader: function () {
        var searchTokens = this.model.get("searchTokens");
        var container = $('<span class="argSummary"></span>');
        step.util.ui.renderArgs(searchTokens, container);

        var $header = this.$el.find(".passageOptionsGroup");
        $header.find(".argSummary").remove();
        $header.append(container);
    }
});
