var PassageMenuView = Backbone.View.extend({
    el : "#leftPaneMenu",
    events : {
        "click a[name]" : "updateModel"
    },
    imageTemplate : "<img class='selectingTick' src='images/selected.png' />",

    initialize : function() {
        var self = this;
        this.menuOptions = this.$el.find("[name]");

        //set up menu options correctly
        var selectedOptions = this.model.get("options");
        $.each(this.menuOptions, function(i, element) {
            var item = $(element);
            if(selectedOptions.indexOf(item.attr("name")) != -1) {
                //option is present, so update it
                self._selectOption(item);
            } else {
                self._unselectMenuOption(item);
            }
        });
    },

    /**
     * Selects a menu option
     * @param element
     * @private
     */
    _selectOption : function(element) {
        $(element).not(":has(img)").append(this.imageTemplate);
    },

    /**
     * Unticks the menu option
     * @param element the menu element
     * @private
     */
    _unselectMenuOption : function(element) {
        $("img", element).remove();
    },

    /**
     * Gets the currently selected options in the view
     */
    getOptionString: function () {
        var self = this;
        var selectedOptions = $.map(this.menuOptions, function(anchorLink) {
            if(self.isSelected(anchorLink)) {
                return $(anchorLink).attr("name");
            }
            return undefined;
        });

        return selectedOptions;
    },

    /**
     * True, if it is selectable and has a tick
     * @param element the menu item
     * @returns {boolean}
     */
    isSelected : function(element) {
        return this.isSelectable(element) && this.isTicked(element);
    },

    /**
     * True if the option is ticked, regardless of whether it has been disabled or not
     * @param element
     */
    isTicked: function (element) {
        return $(element).has("img.selectingTick").size() != 0;
    },

    /**
     * True if the selector is not disabled
     * @param selector
     * @returns {boolean}
     */
    isSelectable : function(selector) {
        return !$(selector).hasClass("disabled");
    },

    /**
     * Updates the model
     */
    updateModel : function() {
        //get list of options
        this.model.save({
            options : this.getOptionString()
        });
    }
});