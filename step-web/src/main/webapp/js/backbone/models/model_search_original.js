var WordSearchModel = SearchModel.extend({

    /**
      * Override to intercept the get method for sort order
     * @param attributeName
     */
    get : function(attributeName){
        //this doesn't really exist, but is stored as originalSorting
        if(attributeName != "sortOrder") {
            return SearchModel.prototype.get.call(this, attributeName);
        }

        return this._getSortOrder();
    },

    set : function(attributes, options) {
        //filters are arrays, so make sure they get stored as such
        if(attributes && attributes.filter && !_.isArray(attributes.filter)) {
            attributes.filter = attributes.filter.split(",");
        }
        SearchModel.prototype.set.call(this, attributes, options);
    },

    _getSortOrder : function() {
        var detail = this.get("detail");
        var sorting = this.get("originalSorting");
        var sortOrder = undefined;

        if(sorting == undefined) {
            return undefined;
        }

        if(detail > 0) {
            //find the index of the sort order
            var allSortings = step.defaults.search.original.originalSorting;
            for (var i = 0; i < allSortings.length; i++) {
                if (allSortings[i] == sorting) {
                    return sortOrder = step.defaults.search.original.originalSortingValues[i];
                }
            }
        }
        return undefined;
    },

    _evaluateQuerySyntaxInternal : function(attributes) {
        var level =             this.getSafeAttribute(attributes, "detail");
        var originalType =      this.getSafeAttribute(attributes, "originalType");
        var originalWord =      this.getSafeAttribute(attributes, "originalWord");
        var originalSorting =   this.getSafeAttribute(attributes, "originalSorting");
        var originalScope =     level == 0 ? __s.whole_bible_range : this.getSafeAttribute(attributes, "originalScope");
        var originalForms =     this.getSafeAttribute(attributes, "originalForms");
        var filter = this.getSafeAttribute(attributes, "filter");

        var query = "o";

        if(originalType == WORDS_MEANING[0]) {
            query += "m";
        } else {
            if (originalType == GREEK_WORDS[0]) {
                query += "g";
            } else if(originalType == HEBREW_WORDS[0]) {
                query += "h";
            }

            if(originalForms == ALL_RELATED) {
                query += "~"
            } else if(originalForms == ALL_FORMS) {
                query += "*";
            }
        }
        query += "=";

        query += "+[" + originalScope + "] ";
        query += originalWord;

        //add filter
        if (filter && filter.length != 0) {
            query += " where original is (" + filter.join() + ") ";
        }

        return this._getFinalQuerySyntax(query);
    },

    /**
     * Override the defaulted value for the search versions
     * @param attributeName
     */
    getDefaultedValue : function(attributeName) {
        if(attributeName != "searchVersions") {
            return SearchModel.prototype.getDefaultedValue.call(this, attributeName);
        }

        var searchVersions = this.get("searchVersions");
        if(step.util.isBlank(searchVersions)) {
            return "ESV";
        }

        if (!this._versionsContainsStrongs(searchVersions)) {
            return "ESV," + searchVersions;
        }

        return searchVersions;
    },

    /**
     * @param versions a list of versions
     * @returns {boolean} true to indicate one or more versions have strong numbers
     * @private
     */
    _versionsContainsStrongs: function (versions) {
        if (step.util.isBlank(versions)) {
            return false;
        }

        if (step.versions == undefined) {
            //assume false, since we are most likely in a situation where things are being reloaded
            return false;
        }

        var vs = versions.split(",");

        //iterate through all versions of interest
        for (var j = 0; j < vs.length; j++) {
            //looking for them in step.strongVersions
            if (step.strongVersions[vs[j].toUpperCase()]) {
                return true;
            }
        }

        return false;
    }
});
