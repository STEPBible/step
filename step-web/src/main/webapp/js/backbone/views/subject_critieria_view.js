var SubjectCriteria = Backbone.View.extend({
    el: function () {
        return $("fieldset[name='SEARCH_SUBJECT']").eq(this.model.get("passageId"));
    },
    events: {
        "keyup .subjectText": "updateModel",
        "keyup .querySyntax": "updateQuerySyntaxInModel",
        "click .resetSearch": "resetSearch",
        "click .subjectSearch": "doSearch"
    },

    initialize: function () {
        this.subject = this.$el.find(".subjectText");
        this.querySyntax = this.$el.find(".querySyntax");
        this.pageNumber = this.$el.find(".pageNumber");

        this.model.on("change", this._updateQuerySyntaxFromModel, this);
    },

    /**
     * Updates the model, then updates the view of the query syntax
     */
    updateModel: function () {
        this.model.save({ subject: this.subject.val() });
    },

    /**
     * Updates only the query syntax part
     */
    updateQuerySyntaxInModel: function () {
        this.model.save({ querySyntax: this.querySyntax.val() });
    },

    /**
     * Updates the query syntax from the model
     * @private
     */
    _updateQuerySyntaxFromModel: function () {
        //now get the updated query syntax
        var oldQuerySyntax = this.querySyntax.val();
        var newQuerySyntax = this.model.get("querySyntax");
        if (oldQuerySyntax != newQuerySyntax) {
            this.querySyntax.val(newQuerySyntax);
        }
    },

    /**
     * Blanks the search
     * @param event the event originating the trigger
     */
    resetSearch: function (event) {
        this.subject.val("");
        this.querySyntax.val("");
        this.updateModel();
    },

    /**
     * Do the search
     */
    doSearch: function () {
        //reset the page number
        this.model.save({ pageNumber: 1 });
        this.pageNumber.val(this.model.get("pageNumber"));
        this.model.trigger("search", this.model);
    }
});
