var SubjectSearchModel = SearchModel.extend({
    _evaluateQuerySyntaxInternal : function(attributes) {
        var subjectText = this.getSafeAttribute(attributes, "subjectText");
        var subjectRelated = this.getSafeAttribute(attributes, "subjectRelated");
        var detail = this.getSafeAttribute(attributes, "detail");
        var subjectType = this.getSafeAttribute(attributes, "subjectSearchType");

        if(step.util.isBlank(subjectText) && step.util.isBlank(subjectRelated)) {
            return;
        }

        //hidden field
        if(subjectType == "") {
            this.set("subjectSearchType", step.defaults.search.subject.subjectTypes[0]);
        }

        if(!step.util.isBlank(subjectText) || detail == 0) {
            return this.getSearchTypePrefix(subjectType) + subjectText;
        } else if(!step.util.isBlank(subjectRelated)) {
            return "sr=" + subjectRelated;
        } else {
            return "";
        }
    },

    /**
     * Returns the appropriate prefix for the a particular search type
     * @param searchType
     * @returns {string}
     */
    getSearchTypePrefix : function(searchType) {
        switch(searchType) {
            case step.defaults.search.subject.subjectTypes[2]:
                return "s++=";
            case step.defaults.search.subject.subjectTypes[1]:
                return "s+=";
            case step.defaults.search.subject.subjectTypes[0]:
            default:
                return "s=";
        }
    },

    /**
     * Returns the appropriate prefix for the a particular search type
     * @param searchType
     * @returns {string}
     */
    getReverseSearchTypePrefix : function(searchType) {
        switch(searchType) {
            case "s++=":
                return step.defaults.search.subject.subjectTypes[2];
            case "s+=":
                return step.defaults.search.subject.subjectTypes[1];
            default:
                return step.defaults.search.subject.subjectTypes[0];
        }
    }
});
