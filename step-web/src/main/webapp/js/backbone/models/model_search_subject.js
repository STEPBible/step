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
            switch(subjectType) {
                case step.defaults.search.subject.subjectTypes[2]:
                    return "s++=" + subjectText;
                case step.defaults.search.subject.subjectTypes[1]:
                    return "s+=" + subjectText;
                case step.defaults.search.subject.subjectTypes[0]:
                default:
                    return "s=" + subjectText;
            }
        } else if(!step.util.isBlank(subjectRelated)) {
            return "sr=" + subjectRelated;
        } else {
            return "";
        }
    }
});
