var SubjectSearchModel = SearchModel.extend({
    _evaluateQuerySyntaxInternal : function(attributes) {
        var subjectText = this.getSafeAttribute(attributes, "subjectText");
        var subjectRelated = this.getSafeAttribute(attributes, "subjectRelated");
        var detail = this.getSafeAttribute(attributes, "detail");

        if(!step.util.isBlank(subjectText) || detail == 0) {
            return "s=" + subjectText;
        } else if(!step.util.isBlank(subjectRelated)) {
            return "sr=" + subjectRelated;
        } else {
            return "";
        }
    }
});
