var TextDisplayView = SearchDisplayView.extend({
    renderSearch: function (serverResults, query) {
        console.log("Rendering text search results");

        var results = $("<span>");
        var searchResults = serverResults.results;
        var sortOrder = serverResults.order;

        var table = $("<table>").addClass("searchResults");
        results.append(table);

        //multiple vs singular version
        if (searchResults[0].preview) {
            this._displayPassageResults(table, searchResults, sortOrder);
        } else {
            //we customize the generation of the actual verse content to add the version
            this._displayPassageResults(table, searchResults, sortOrder, function (cell, item) {
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
    _displayPassageResults: function (table, searchResults, sortOrder, contentGenerator) {
        var results = "";
        var lastUnicode = "";
        for (var i = 0; i < searchResults.length; i++) {
            this.doGroupHeader(table, searchResults[i], sortOrder);
            this.getVerseRow(table, contentGenerator, searchResults[i]);
        }
    },

    /**
     * Adds a header to group verses together
     * @param table the table that is being built up
     * @param result the particular result in question (i.e. one row of the search results)
     * @param sortOrder the sort order that was specified in the request (taken from the response, in case we want to override)
     */
    doGroupHeader : function(table, result, sortOrder) {
        //by default, we don't group items
    },

    getVerseRow: function getVerseRow(table, contentGenerator, item) {
        var newRow = $("<tr>").addClass("searchResultRow");
        var buttons = $("<td>").passageButtons({
            passageId: this.model.get("passageId"),
            ref: item.key,
            showChapter: true
        });
        newRow.append(buttons);
        var contentCell = $("<td>").addClass("searchResultRow");
        newRow.append(contentCell);

        if (contentGenerator != undefined) {
            contentCell.append(contentGenerator(contentCell, item));
        } else {
            contentCell.append(item.preview);
        }

        table.append(newRow);
    }

});

