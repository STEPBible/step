(function() {
    window.WordDisplayView = TextDisplayView.extend({
        titleFragment : __s.search_word,
        /**
         * Allows a search to add in headers, footers, etc. In this case
         * we add in a header with the buttons to filter the results
         * @param query the query
         * @param results the results HTML jqObject that been created so far
         * @param resultsWrapper the results wrapper, containing all meta information
         * and results
         * @private
         */
        _doSpecificSearchRequirements: function (query, results, resultsWrapper, masterVersion) {
            if (resultsWrapper && resultsWrapper.searchQueryResults && resultsWrapper.searchQueryResults.definitions) {
                //add a toolbar in there for each word
                var originalWordToolbar = $("<div>").addClass("originalWordSearchToolbar").originalWordToolbar({
                    model: this.model,
                    definitions: resultsWrapper.searchQueryResults.definitions
                });

                results.prepend(originalWordToolbar);
                return results;
            }
            return results;
        },

        /**
         * Adds a header for groups of verses, in this case a header indicating the various
         * different words
         * @param item
         * @param sortOrder the type of sort
         * @param lastHeader the last seen header that was output
         */
        doGroupHeader: function (table, item, sortOrder, lastHeader) {
            if (item.accentedUnicode && item.accentedUnicode != lastHeader) {
                var header = $("<th>").addClass("searchResultStrongHeader").prop("colspan", "2");

                //add a new row
                table.append($("<tr>").append(header));

                if (sortOrder == VOCABULARY) {
                    header.append(item.stepGloss == undefined ? "-" : item.stepGloss);
                    header.append($("<em>").addClass("stepTransliteration").append(item.stepTransliteration));
                    header.append($("<span>").addClass("ancientSearch").append(item.accentedUnicode));
                } else {
                    header.append($("<span>").addClass("ancientSearch").append(item.accentedUnicode));
                    header.append("(");
                    header.append($("<em>").addClass("stepTransliteration").append(item.stepTransliteration));
                    header.append("): ");
                    header.append(item.stepGloss == undefined ? "-" : item.stepGloss);
                }

                return item.accentedUnicode;
            }
        }
    });
})();