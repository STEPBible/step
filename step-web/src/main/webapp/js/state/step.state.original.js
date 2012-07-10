step.state.original = {
    restore : function(passageId) {
        this.strong(passageId, this.strong(passageId));
    },

    strong : function(passageId, value) {
        if (value) {
            $(".strongSearch", step.util.getPassageContainer(passageId)).val(value);
        }

        return step.state._storeAndRetrieveCookieState(passageId, "strongSearch", value, false);
    },
    
    searchType: function(passageId, searchType) {
        return step.state._storeAndRetrieveCookieState(passageId, "searchType", searchType);
    }
};
