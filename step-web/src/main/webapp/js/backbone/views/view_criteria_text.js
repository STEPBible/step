var TextCriteria = SearchCriteria.extend({
    initialize: function () {
        //first call parent
        SearchCriteria.prototype.initialize.call(this);
    },

    /**
     * Invoked because it is set up as a drop function
     */
    simpleTextIncludeChanged : function(currentElement, value) {
        this.includeProximityChange(currentElement, value);
    },

    includeProximityChange : function(currentElement, value) {
        var proximity = this.viewElementsByName.simpleTextProximity;
        if(value == 'include') {
            if(proximity.val() == 'the same verse') {
                //reset
                proximity.val(step.defaults.search.textual.simpleTextProximities[0]);
                proximity.attr('disabled', false);
            }
        } else if(value == 'exclude') {
            proximity.val(step.defaults.search.textual.simpleTextProximities[0]);
            proximity.attr('disabled', true);
        }
    }
});
