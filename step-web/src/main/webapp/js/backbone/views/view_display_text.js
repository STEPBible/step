var TextDisplayView = SearchDisplayView.extend({
    titleFragment : __s.search_text,
    renderSearch: function (query, masterVersion) {
        console.log("Rendering text search results");

        var results = $("<span>");
        var searchResults = this.model.get("results");
        var sortOrder = this.model.get("order");

        var table = $("<div>").addClass("searchResults");
        results.append(table);

        //multiple vs singular version
        if (searchResults[0].preview) {
            this._displayPassageResults(masterVersion, table, searchResults, sortOrder);
        } else {
            //we customize the generation of the actual verse content to add the version
            this._displayPassageResults(masterVersion, table, searchResults, sortOrder, function (cell, item) {
                var surrounding = $("<span>");
                for (var i = 0; i < item.verseContent.length; i++) {
                    var verseContent = item.verseContent[i];
                    var content = $("<div>").addClass("multiVersionSubResult");
                    content.append($("<span>").addClass("smallResultKey").append(verseContent.contentKey));
                    content.append(verseContent.preview);
                    surrounding.append(content);
                }
                return surrounding;
            });
        }
        return results;
    },

    /**
     * Displays a verse list
     * qualifiedSearchResults = {result: , key: }
     */
    _displayPassageResults: function (masterVersion, table, searchResults, sortOrder, contentGenerator) {
        var lastHeader = undefined;
        for (var i = 0; i < searchResults.length; i++) {
            var newHeader = this.doGroupHeader(table, searchResults[i], sortOrder, lastHeader);
            if(newHeader != null) {
                lastHeader = newHeader;
            }

            this.getVerseRow(masterVersion, table, contentGenerator, searchResults[i]);
        }
    },

    /**
     * Adds a header to group verses together
     * @param table the table that is being built up
     * @param result the particular result in question (i.e. one row of the search results)
     * @param sortOrder the sort order that was specified in the request (taken from the response, in case we want to override)
     * @param lastHeader the last header that was output
     * @return the header that is output, or null otherwise
     */
    doGroupHeader : function(table, result, sortOrder, lastHeader) {
        //by default, we don't group items
    }
});

