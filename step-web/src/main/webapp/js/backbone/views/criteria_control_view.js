var CriteriaControlView;
CriteriaControlView = Backbone.View.extend({
    el: function() { return $(".advancedSearch").eq(this.model.get("passageId")); },

    initialize: function () {
        console.log(step.passage.getPassageId(this.$el));

        this.listenTo(this.model, "change", this._changeVisibleCriteria);
        this.passageToolbarContainer = this.$el.find(".passageToolbarContainer");

        //show the right fieldset
        this._changeVisibleCriteria();
    },


    intialise : function() {
        step.passage.getPassageId(this.$el);
    },

    /**
     * Changes the field set that is current showing
     */
    _changeVisibleCriteria : function() {
        var selectedSearch = this.model.get("selectedSearch");
        this.passageToolbarContainer.toggle(selectedSearch == "SEARCH_PASSAGE");
        this.$el.find("fieldset").hide().filter("[name='" + selectedSearch + "']").show();

        this.trigger("change")
    }
});
