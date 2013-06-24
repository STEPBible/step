var SimpleTextSearchModel = AdvancedSearchModel.extend({
    referenceKeys : {
        simpleTextTypePrimary: { textValues : step.defaults.search.textual.simpleTextTypes , referenceValues : step.defaults.search.textual.simpleTextTypesReference },
        simpleTextInclude: { textValues : step.defaults.search.textual.simpleTextIncludes, referenceValues : step.defaults.search.textual.simpleTextIncludesReference },
        simpleTextTypeSecondary: { textValues : step.defaults.search.textual.simpleTextSecondaryTypes, referenceValues : step.defaults.search.textual.simpleTextSecondaryTypesReference},
        simpleTextProximity : { textValues : step.defaults.search.textual.simpleTextProximities, referenceValues : step.defaults.search.textual.simpleTextProximitiesReference }
    },

    _evaluateQuerySyntaxInternal : function(attributes) {
        var query = "";
        var prefix = "t=";
        var level =             this.getSafeAttribute(attributes, "detail");
        var primaryType =       this.getSafeAttribute(attributes, "simpleTextTypePrimary");
        var primaryCriteria =   this.getSafeAttribute(attributes, "simpleTextCriteria");
        var secondaryType =     this.getSafeAttribute(attributes, "simpleTextTypeSecondary");
        var secondaryCriteria = this.getSafeAttribute(attributes, "simpleTextSecondaryCriteria");
        var proximity =         this.getSafeAttribute(attributes, "simpleTextProximity");
        var includeExclude =    this.getSafeAttribute(attributes, "simpleTextInclude");
        var restriction =       this.getSafeAttribute(attributes, "simpleTextScope");

        //if no primary criteria, exit here
        if(step.util.isBlank(primaryCriteria)) {
            return "";
        }

        //add the restriction
        var restrictionQuery = this._evalTextRestriction(restriction, query);

        //eval first part of the criteria
        query = this._evalCriteria(primaryType, primaryCriteria, query);

        if(level == 0 || secondaryCriteria == null || $.trim(secondaryCriteria) == "") {
            var finalQuery = prefix + restrictionQuery + query;
            return this._getFinalQuerySyntax(finalQuery);
        }

        var firstSpace = proximity.indexOf(' ');
        var proximityRange = proximity == step.defaults.search.textual.simpleTextProximities[0] ? "same" : proximity.substring(0, firstSpace);
        if(includeExclude == step.defaults.search.textual.simpleTextIncludes[0]) {
            if(!isNaN(proximityRange)) {
                query += " ~" + proximityRange + " ";
            } else {
                //add brackets and AND
                query = "(" + $.trim(query) + ") AND ";
            }

            query = this._evalCriteria(secondaryType, secondaryCriteria, query);
        } else if (includeExclude == step.defaults.search.textual.simpleTextIncludes[1]) {
            if(secondaryType == step.defaults.search.textual.simpleTextSecondaryTypes[0]) {
                //excluding separate words
                query += this._evalExcludeWord(secondaryCriteria);
            } else {
                //excluding a phrase
                query += this._evalExcludePhrase(secondaryCriteria);
            }
        }

        return this._getFinalQuerySyntax(prefix + restrictionQuery + query);
    },

    _evalCriteria : function(searchType, criteria, query) {
        switch($.trim(searchType)) {
            case step.defaults.search.textual.simpleTextTypes[0] : query += this._evalAnyWord(criteria); break;
            case step.defaults.search.textual.simpleTextTypes[1] : query += this._evalAllWords(criteria); break;
            case step.defaults.search.textual.simpleTextTypes[2] : query += this._evalExactPhrase(criteria); break;
            case step.defaults.search.textual.simpleTextTypes[3] : query += this._evalSpellings(criteria); break;
            case step.defaults.search.textual.simpleTextTypes[4] : query += this._evalStarting(criteria); break;
        }
        return query;
    }
});
