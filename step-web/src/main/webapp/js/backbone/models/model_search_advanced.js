var AdvancedSearchModel = SearchModel.extend({
    _evaluateQuerySyntaxInternal: function(attributes) {
        var level = this.getSafeAttribute(attributes, "detail");

        var prefix = "t=";
        var query = "";
        //level 0
        query += this._evalExactPhrase(this.getSafeAttribute(attributes, "textPrimaryExactPhrase"));
        query += this._evalAllWords(this.getSafeAttribute(attributes, "textPrimaryIncludeAllWords"));
        query += this._evalAnyWord(this.getSafeAttribute(attributes, "textPrimaryIncludeWords"));

        //level 2
        if(level == 2) {
            query += this._evalSpellings(this.getSafeAttribute(attributes, "textPrimarySimilarSpellings"));
            query += this._evalStarting(this.getSafeAttribute(attributes, "textPrimaryWordsStarting"));
            query += this._evalExcludeWord(this.getSafeAttribute(attributes, "textPrimaryExcludeWords"));
            query += this._evalExcludePhrase(this.getSafeAttribute(attributes, "textPrimaryExcludePhrase"));
            query += this._evalWordsWithinRangeOfEachOther(
                this.getSafeAttribute(attributes, "textPrimaryIncludeRangedWords"),
                this.getSafeAttribute(attributes, "textPrimaryWithinXWords"));
        }

        //level 1
        var secondaryQuery = "";
        if(level > 0) {
            secondaryQuery += this._evalAllWords(this.getSafeAttribute(attributes, "textCloseByIncludeAllWords"));
            secondaryQuery += this._evalExactPhrase(this.getSafeAttribute(attributes, "textCloseByExactPhrase"));
            secondaryQuery += this._evalAnyWord(this.getSafeAttribute(attributes, "textCloseByIncludeWords"));
        }

        //level 2
        if(level == 2) {
            secondaryQuery += this._evalSpellings(this.getSafeAttribute(attributes, "textCloseBySimilarSpellings"));
            secondaryQuery += this._evalStarting(this.getSafeAttribute(attributes, "textCloseByWordsStarting"));
            secondaryQuery += this._evalExcludeWord(this.getSafeAttribute(attributes, "textCloseByExcludeWords"));
            secondaryQuery += this._evalExcludePhrase(this.getSafeAttribute(attributes, "textCloseByExcludePhrase"));
            secondaryQuery += this._evalWordsWithinRangeOfEachOther(
                this.getSafeAttribute(attributes, "textCloseByIncludeRangedWords"),
                this.getSafeAttribute(attributes, "textCloseByWithinXWords"));
        }

        if(level > 0) {
            query = this._evalProximity(this.getSafeAttribute(attributes, "textVerseProximity"), query, secondaryQuery);
        }

        var restriction = this.getSafeAttribute(attributes, "textRestriction");
        query = this._evalTextRestriction(restriction, query);

        var restrictionExclude = this.getSafeAttribute(attributes, "textRestrictionExclude");
        if(!step.util.isBlank(restrictionExclude) && !step.util.isBlank(restriction)) {
            step.util.raiseError(__s.error_search_restriction_and_inclusion);
        } else {
            query = this._evalTextRestrictionExclude(restrictionExclude, query);
        }

        query = prefix + query;
        return query;
    },
    
});
