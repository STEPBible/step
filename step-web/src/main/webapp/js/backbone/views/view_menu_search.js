var SearchMenuView = Backbone.View.extend({
    el : function() { return $(".innerMenu li[menu-name='SEARCH']").eq(this.model.get("passageId")); },
    events : {
        "click a[name]" : "changeView"
    },

    initialize : function() {
        var searchName = this.model.get("selectedSearch");
        this.changeView({ target : this.$el.find("[name='" + searchName + "']").get(0) });
        this.listenTo(this.model, "change", this.syncModel);
    },

    syncModel : function() {
        var newlySelectedSearch = this.model.get("selectedSearch");
        var menuItem = step.menu.getMenuItem(newlySelectedSearch, this.model.get("passageId"));
        step.menu.tickOneItemInMenuGroup({ menu : { element : this.$el}, menuItem : { element : menuItem }});
    },

    changeView : function(event) {
        //get selected option
        step.menu.tickOneItemInMenuGroup({ menu : { element : this.$el}, menuItem : { element : event.target}});
        var options = step.menu.getSelectedOptions(this.$el);

        //assume there is only 1
        if(!options || options.length != 1) {
            console.warn("Search options in inconsistent state", options)
        }

        this.model.save({ selectedSearch : options[0] });
    }
});