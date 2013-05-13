var SearchMenuModel = Backbone.Model.extend({
    defaults: function () {
        return {
            passageId: 0,
            selectedSearch : "SEARCH_PASSAGE"
        }
    },
    initialize : function() {
        console.log(this.get("passageId"));
    }
});
