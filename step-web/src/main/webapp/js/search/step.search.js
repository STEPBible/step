/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project All rights
 * reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. Neither the name of the Tyndale House, Cambridge
 * (www.TyndaleHouse.com) nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

step.search = {
    pageSize: step.defaults.pageSize,
    totalResults: 0,
    refinedSearch: [],
    lastSearch: "",

    original: {
        //place for two filters
        filters: [undefined, undefined],

        search: function (passageId) {
            var query = step.state.original.originalQuerySyntax(passageId);
            if (query != undefined) {
                query = step.util.replaceSpecialChars(query);
            }
            var pageNumber = step.state.original.originalPageNumber(passageId);
            var versions = step.state.original.originalSearchVersion(passageId);
            var context = step.state.original.originalSearchContext(passageId);

            var passageContainer = step.util.getPassageContainer(passageId);
            var sortOrder;

            if ($(".originalSorting:enabled", passageContainer).size() > 0) {
                var sortOrderString = $("fieldset:visible", passageContainer).detailSlider("value") > 0 ? step.state.original.originalSorting(passageId) : false;

                //find the index of the sort order
                var allSortings = step.defaults.search.original.originalSorting;
                for (var i = 0; i < allSortings.length; i++) {
                    if (allSortings[i] == sortOrderString) {
                        sortOrder = step.defaults.search.original.originalSortingValues[i];
                    }
                }
                if (!sortOrder) {
                    sortOrder = undefined;
                }
            } else {
                sortOrder = false;
            }

//            var filter = step.search.original.filters[passageId];

            var versions = step.state.original.originalSearchVersion(passageId);
            if (versions == undefined) {
                versions = "";
            }

            if (!this._versionsContainsStrongs(versions)) {
                versions = "KJV," + versions;
                step.state.original.originalSearchVersion(passageId, versions);
            }
//
//            if (filter && filter.length != 0) {
//                query += " where original is (" + filter.join() + ") ";
//            }

//            step.search._validateAndRunSearch(passageId, query, versions, sortOrder, context, pageNumber);
        },

        _versionsContainsStrongs: function (versions) {
            if (step.util.isBlank(versions)) {
                return false;
            }

            if (step.versions == undefined) {
                //assume true, since we are most likely in a situation where things are being reloaded
                return true;
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
    },

    quick: {
        search: function (passageId) {
            var query = $.trim(step.state.quick.searchQuerySyntax(passageId));
            if (query == undefined) {
                returned;
            }

            if (query[0] == 'o') {
                query = step.util.replaceSpecialChars(query);
            }

            var version = this._getQuickVersions(passageId);

            var context = 0;
            var ranked = false;
            var pageNumber = step.search.pageSize;

            step.search._validateAndRunSearch(passageId, query, version, ranked, context, pageNumber);
        },

        _getQuickVersions: function (passageId) {
            var versions = step.util.ui.getVisibleVersions(passageId);
            var versionInitials = "";
            $.each(versions, function (i, item) {
                versionInitials += $(this).val();
                versionInitials += ',';
            });
            return versionInitials;
        }
    },

    timeline: {
        reference: function (passageId) {
//            console.log("Searching timeline by reference");
            step.search._validateAndRunSearch(passageId, "dr=" + step.state.timeline.timelineReference(passageId), step.state.passage.version(passageId), false, 0, 1);
        },

        description: function (passageId) {
//            console.log("Searching by timeline description");
            step.search._validateAndRunSearch(passageId, "d=" + step.state.timeline.timelineEventDescription(passageId), step.state.passage.version(passageId), false, 0, 1);
        },

        dating: function (passageId) {
//            console.log("Searching by dating");            
        }
    },

    simpleText: {
        search: function (passageId) {
//            console.log("Simple text search...");
            var query = $.trim(step.state.simpleText.simpleTextQuerySyntax(passageId));
            var version = step.state.simpleText.simpleTextSearchVersion(passageId);
            var context = step.state.simpleText.simpleTextSearchContext(passageId);
            var ranked = false; // step.state.simpleText.simpleTextSortByRelevance(passageId) == step.defaults.search.textual.simpleTextSortBy[0];
            var pageNumber = step.state.simpleText.simpleTextPageNumber(passageId);

            step.search._validateAndRunSearch(passageId, query, version, ranked, context, pageNumber);
        }
    },

    textual: {
//        search : function(passageId){
////            console.log("Advanced text search...");
//            var query = $.trim(step.state.textual.textQuerySyntax(passageId));
//            var version = step.state.textual.textSearchVersion(passageId);
//            var context = step.state.textual.textSearchContext(passageId);
//            var ranked = step.state.textual.textSortByRelevance(passageId);
//            var pageNumber = step.state.textual.textPageNumber(passageId);
//
//            step.search._validateAndRunSearch(passageId, query, version, ranked, context, pageNumber);
//        }
    },


    _displayTimelineEventResults: function (results, passageId) {
        var resultHtml = $("<table>");
        var self = this;
        $.each(results, function (i, item) {
            var aTarget = "";
            if (item.verses && item.verses.length > 0) {
                aTarget = $.map(item.verses,function (item, i) {
                    return item.key;
                }).join();
                var newTable = $("<table>").addClass("masterSearchTable");
                self._displayPassageResults(resultHtml, item.verses, passageId, false, undefined);
                resultHtml.append(newTable);
            }

            var link = $("<a>").attr('href', 'javascript:void').html(item.description).click(function () {
                step.timeline.show(passageId, aTarget);
            });

            var cell = $("<td>").addClass("masterSearchResultRow").append(link);
            var row = $("<tr>").append(cell).append($("<td>").append(resultItem));

            resultHtml.append(row);
        });

        return resultHtml;
    },

    /**
     *
     * qualifiedSearchResults = {result: , key: }
     */
    _displayPassageResults: function (table, searchResults, passageId, goToChapter, sortOrder, contentGenerator) {
        var results = "";

        var lastUnicode = "";


        $.each(searchResults, function (i, item) {
            if (item.accentedUnicode && item.accentedUnicode != lastUnicode) {
                var header = $("<th>").addClass("searchResultStrongHeader").prop("colspan", "2");
                table.append(header);

                if (sortOrder == VOCABULARY) {
                    header.append(item.stepGloss == undefined ? "-" : item.stepGloss);
                    header.append($("<em>").addClass("stepTransliteration").append(step.util.ui.markUpTransliteration(item.stepTransliteration)));
                    header.append($("<span>").addClass("ancientSearch").append(item.accentedUnicode));
                } else {
                    header.append($("<span>").addClass("ancientSearch").append(item.accentedUnicode));
                    header.append("(");
                    header.append($("<em>").addClass("stepTransliteration").append(step.util.ui.markUpTransliteration(item.stepTransliteration)));
                    header.append("): ");
                    header.append(item.stepGloss == undefined ? "-" : item.stepGloss);
                }

                lastUnicode = item.accentedUnicode;
            }

            var newRow = $("<tr>").addClass("searchResultRow");
            var buttons = $("<td>").passageButtons({
                passageId: passageId,
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
        });
    },


    _displayResults: function (searchQueryResults, passageId) {
        var results = $("<span>");
        var searchResults = searchQueryResults.results;
        var sortOrder = searchQueryResults.order;

        //remove any hebrew language css
        step.util.getPassageContainer(passageId).removeClass("hebrewLanguage greekLanguage");

        if (searchResults == undefined || searchResults.length == 0 || (searchQueryResults.total == 0)) {
            this._notApplicableMessage(results, __s.search_no_search_results_found);
            this._changePassageContent(passageId, results);
            this._doOriginalWordToolbar(searchQueryResults.definitions, passageId);
            return;
        }

        var queryRan = step.util.undoReplaceSpecialChars(searchQueryResults.query);
        if (queryRan.startsWith("d=") || queryRan.startsWith("dr=")) {
            results.append(this._displayTimelineEventResults(searchResults, passageId));
        } else if (queryRan.startsWith("s=") || queryRan.startsWith("s+=") || queryRan.startsWith("s++=") || queryRan.startsWith("sr=")) {
            results.append(this._displaySubjectResults(queryRan, searchResults, passageId));
        } else {
            var table = $("<table>").addClass("searchResults");

            if (searchResults[0].preview) {
                this._displayPassageResults(table, searchResults, passageId, true, sortOrder);
            } else {
                //we customize the generation of the actual verse content to add the version
                this._displayPassageResults(table, searchResults, passageId, true, sortOrder, function (cell, item) {
                    var surrounding = $("<span>");
                    $.each(item.verseContent, function (i, verseContent) {
                        var content = $("<div>").addClass("multiVersionSubResult");
                        content.append($("<span>").addClass("smallResultKey").append(verseContent.contentKey));
                        content.append(verseContent.preview);
                        surrounding.append(content);
                    });
                    return surrounding;
                });
            }

            results.append(table);
        }


        if (searchQueryResults.maxReached == true) {
            this._notApplicableMessage(results, __s.search_too_many_results);
        }

        this._changePassageContent(passageId, results);
        this._doOriginalWordToolbar(searchQueryResults.definitions, passageId);
    },

    _notApplicableMessage: function (results, message) {
        var notApplicable = $("<span>").addClass("notApplicable").html(message);
        results.append(notApplicable);
    },

    _doOriginalWordToolbar: function (definitions, passageId) {
        var passageContent = step.util.getPassageContent(passageId);
        if (definitions) {
            //add a toolbar in there for each word
            var originalWordToolbar = $("<div>").addClass("originalWordSearchToolbar").originalWordToolbar({
                passageId: passageId,
                definitions: definitions
            });

            //first need to sort the buttons
            passageContent.prepend(originalWordToolbar);
        }
    },

    _changePassageContent: function (passageId, content) {
        var passageContent = $(step.util.getPassageContent(passageId));
        passageContent.empty().append(content);
        refreshLayout();
    }
};





