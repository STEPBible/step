var SubjectSearchModel = SearchModel.extend({
    _evaluateQuerySyntax : function(attributes) {
        return "s=" + this.getSafeAttribute(attributes, "subjectText");
    }
});
