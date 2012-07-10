step.search = {
    tagging : {
        exact : function(element) {
            this._doStrongSearch(element, SEARCH_STRONG_EXACT);
        },

        related : function(element) {
            this._doStrongSearch(element, SEARCH_STRONG_RELATED);
        },

        _doStrongSearch : function(element, searchType) {
            var passageId = step.passage.getPassageId(element);
            var passageContainer = step.util.getPassageContainer(element);
            var passageContent = step.util.getPassageContent(element);
            var query = $(".strongSearch", passageContainer).val();

            if (step.util.raiseErrorIfBlank(query, "Please enter a strong number")) {
                step.search._doSearch(searchType, passageId, query, passageContent);
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

    _doSearch : function(searchType, passageId, query, passageContent) {
        var self = this;
        $.getSafe(searchType + step.state.passage.version(passageId) + "/" + query, function(searchQueryResults) {
            self._displayResults(searchQueryResults, passageContent);
        });
    },

    _displayResults : function(searchQueryResults, passageContent) {
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

        $(passageContent).html(results);
    }
};
