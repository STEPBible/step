var AdvancedCriteria = SearchCriteria.extend({
    initialize: function () {
        //first call parent
        SearchCriteria.prototype.initialize.call(this);



        //TODO add some handlers to make the restriction field disabled
        //as soon as something is written in it (i.e. the fields Gen-Rev)
        //so that only one of the fields is ever disabled at any one time
    }

});
