step.search = {
    tagging : {
        exact : function(passageId) {
            this._doStrongSearch(passageId, SEARCH_STRONG_EXACT);
        },

        related : function(passageId) {
            this._doStrongSearch(passageId, SEARCH_STRONG_RELATED);
        },

        _doStrongSearch : function(passageId, searchType) {
            var query = step.state.original.strong(passageId);

            if (step.util.raiseErrorIfBlank(query, "Please enter a strong number")) {
                step.search._doSearch(searchType, passageId, query);
            }
        }
    },

    handleSearch : function(element) {
        var passageId = step.passage.getPassageId(element);
        var passageContainer = step.util.getPassageContainer(passageId);
        var passageContent = step.util.getPassageContent(passageId);
        var query = $(".versionSearchBox", passageContainer).val();
        if (step.util.raiseErrorIfBlank(query, "Please provide a query")) {
            this._doSearch(SEARCH_DEFAULT, passageId, query, passageContent);
        }
    },

    _doSearch : function(searchType, passageId, query) {
        var self = this;
        $.getSafe(searchType + step.state.passage.version(passageId) + "/" + query, function(searchQueryResults) {
            self._displayResults(searchQueryResults, passageId);
        });
    },

    _displayResults : function(searchQueryResults, passageId) {
        var results = "";
        var searchResults = searchQueryResults.results;

        if (searchResults.length == 0) {
            results += "<span class='notApplicable'>No search results were found</span>";
        }

        $.each(searchResults, function(i, item) {
            results += "<div class='searchResultRow'><span class='searchResultKey'> ";
            results += goToPassageArrow(true, item.key, "searchKeyPassageArrow");
            results += item.key;
            results += goToPassageArrow(false, item.key, "searchKeyPassageArrow");
            results += "</span>";
            results += item.preview;
            results += "</div>";
        });

        if (searchQueryResults.maxReached == true) {
            results += "<span class='notApplicable'>The maximum number of search results was reached. Please refine your search to see continue.</span>";
        }
        
        $(step.util.getPassageContent(passageId)).html(results);
    }
};
