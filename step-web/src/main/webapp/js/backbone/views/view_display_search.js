var SearchDisplayView = Backbone.View.extend({
    el: function () {
        return $(".passageContainer").eq(this.model.get("passageId"));
    },

    /**
     * Initialises - should be called with the options set.
     */
    initialize: function () {
        Backbone.Events.on(this.options.searchType + ":new:" + this.model.get("passageId"), this.render, this);
        this.passageContent = this.$el.find(".passageContent");
        this.resultsLabel = step.util.getPassageContainer(this.$el).find("fieldset:visible .resultsLabel");
        this.hasPages = true;
    },

    render: function (resultsWrapper, append) {
        var self = this;
        var searchResults = resultsWrapper.searchQueryResults;
        var query = step.util.undoReplaceSpecialChars(searchResults.query);

        this.args = resultsWrapper.searchArgs;
        this.versionArg = resultsWrapper.versionArg;
        this.masterVersion = resultsWrapper.masterVersion;
        this.lastSearch = searchResults.query;
        
        var numReturned = searchResults.results ? searchResults.results.length : 0;
        if(append) {
            this._updateTotalAppend(numReturned);
        } else {
            this._updateTotal(searchResults.total, resultsWrapper.pageNumber, numReturned);
        }

        var results;
        if (searchResults.total == 0 || searchResults.results.length == 0) {
            results = $("<div>").append(__s.search_no_search_results_found).addClass("notApplicable");
        } else if (searchResults.maxReached) {
            this._notApplicableMessage(results, __s.search_too_many_results);
        } else {
            results = this.renderSearch(searchResults, query, this.masterVersion);

            if (searchResults.strongHighlights) {
                this._highlightStrongs(results, searchResults.strongHighlights);
            } else {
                this._highlightResults(results, query);
            }
            this._doFonts(results, searchResults.languages);
        }

        var passageId = this.model.get("passageId");
        step.fonts.redoTextSize(passageId, results);

        if(append) {
            this.passageContent.append(results);
        } else {
            var passageHtml = this._doSpecificSearchRequirements(query, results, resultsWrapper, resultsWrapper.masterVersion);
            step.util.ui.emptyOffDomAndPopulate(this.passageContent, passageHtml);
            this.passageContent.scroll(function () {
                self.getMoreResults();
            });
        }
        step.util.closeInfoErrors(passageId);
        step.util.ui.doSocialButtons(this.$el.find(".searchToolbar"));

        this.doTitle();
        step.util.ui.addStrongHandlers(passageId, this.passageContent);
        step.util.ui.enhanceVerseNumbers(passageId, this.passageContent, resultsWrapper.masterVersion);
        Backbone.Events.trigger("search:rendered:" + passageId);
    },

    getMoreResults: function () {
        var self = this;
        
        //never load new pages
        if(!this.hasPages) {
            return;
        }
        
        if(this.fetching == true) {
            return;
        }
        
        var scrollDownProportion = this.passageContent.scrollTop() / this.passageContent.prop("scrollHeight");
        var scrollDownLeftOver = this.passageContent.prop("scrollHeight") - this.passageContent.scrollTop();
        if (scrollDownProportion > 0.9 || scrollDownProportion == this.passageContent.height() || scrollDownLeftOver < 800) {
            var currentPageNumber = this.args[this.args.length - 2];
            var newPageNumber = parseInt(currentPageNumber) + 1;
            var pageSize = this.model.get("pageSize");
            
            //check page size
            if(currentPageNumber * pageSize > this.currentTotal) {
                return;
            }
            this.fetching = true;
            
            //append results
            //change page number to be one more...
            var startTime = new Date().getTime();
            this.args[this.args.length - 2] = newPageNumber;
            
            
            $.getSafe(SEARCH_DEFAULT, this.args, function (searchQueryResults) {
                step.util.trackAnalyticsSearch(startTime, searchQueryResults, self.versionArg, self.args[0]);
                console.log("Getting more results", searchQueryResults);
                
                //render the results
                self.render({
                    searchQueryResults: searchQueryResults,
                    pageNumber: newPageNumber,
                    masterVersion : self.versionArg,
                    searchArgs : self.args,
                    versionArg : self.versionArg
                }, true);
                
                self.fetching = false;
            });
        }
    },

    doTitle: function () {
        $("title").html(this.titleFragment + " | STEP");
    },

    _doFonts: function (results, languages) {
        var fonts = step.util.ui._getFontClasses(languages);
        if (languages.length == 1) {
            //apply to whole passage
            results.find(".searchResults .passageContentHolder").addClass(fonts[0]);
        } else {
            step.util.ui._applyCssClassesRepeatByGroup(results, "td.searchResultRow > span", fonts, undefined, 0);
        }
    },

    /**
     * An ability to post-process the results at the very end
     * @param query the query syntax
     * @param results the all-emcompassing results object
     * @param resultsWrapper the wrapper containing all meta information about this current search
     * @private
     */
    _doSpecificSearchRequirements: function (query, results, resultsWrapper, masterVersion) {
        //do nothing
        return results;
    },

    _updateTotalAppend: function(newResults) {
        this.currentEnd = this.currentEnd + newResults;
        this.resultsLabel.html(sprintf(__s.paging_showing_x_to_y_out_of_z_results, this.currentStart, this.currentEnd, this.currentTotal));
    },
    
     _updateTotal: function (total, pageNumber, totalResultsReturned) {
        //1 = 1 + (pg1 - 1) * 50, 51 = 1 + (pg2 -1) * 50
        var pageSize = totalResultsReturned;
        var start = total == 0 ? 0 : 1 + ((pageNumber - 1) * (this.options.paged ? pageSize : 1000000));
        var end = pageNumber * pageSize;
        end = end < total ? end : total;

        this.currentStart = start;
        this.currentEnd = end;
        this.currentTotal = total;
        this.resultsLabel.html(sprintf(__s.paging_showing_x_to_y_out_of_z_results, start, end, total));

        stepRouter.totalResults[this.model.get("passageId")] = total;
    },

    _highlightResults: function (results, query) {
        var highlightTerms = this._highlightingTerms(query);

        if (highlightTerms == undefined || results == undefined) {
            step.search.highlightTerms = [];
            return;
        }

        for (var i = 0; i < highlightTerms.length; i++) {
            if (!step.util.isBlank(highlightTerms[i])) {
                var regex = new RegExp("\\b" + highlightTerms[i] + "\\b", "ig");
                doHighlight(results.get(0), "secondaryBackground", regex);
            }
        }
    },

    _highlightStrongs: function (results, strongsList) {
        if (strongsList == undefined) {
            return;
        }

        //now let's iterate through the list of strongs, find all the elements that match, and add the highlight class

        for (var i = 0; i < strongsList.length; i++) {
            $("span[strong~='" + strongsList[i] + "']", results).addClass("secondaryBackground");
        }
    },

    _highlightingTerms: function (query) {
        var terms = [];
        var termBase = query.substring(query.indexOf('=') + 1);

        //remove the search in (v1, v2, v3)
        termBase = termBase.replace("#plus#", "")
        termBase = termBase.replace(/in \([^)]+\)/gi, "");
        termBase = termBase.replace("=>", " ")

        //remove range restrictions, -word and -"a phrase"
        termBase = termBase.replace(/[+-]\[[^\]]*]/g, "");
        termBase = termBase.replace(/-[a-zA-Z]+/g, "");
        termBase = termBase.replace(/-"[^"]+"/g, "");

        //remove distances and brackets
        termBase = termBase.replace(/~[0-9]+/g, "");
        termBase = termBase.replace(/[\(\)]*/g, "");
        termBase = termBase.replace(/ AND /g, " ");
        termBase = termBase.replace(/\+/g, " ");
        termBase = termBase.replace("+", "");

        var matches = termBase.match(/"[^"]*"/);
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                
                terms.push(this.cleanup(matches[i].substring(1, matches[i].length - 1)));
            }
        }

        //then remove it from the query
        termBase = termBase.replace(/"[^"]*"/, "");
        var smallTerms = termBase.split(" ");
        if (smallTerms) {
            for (var i = 0; i < smallTerms.length; i++) {
                var consideredTerm = smallTerms[i].trim();
                if (consideredTerm.length != "") {
                    terms.push(consideredTerm);
                }
            }
        }
        return terms;
    },

    /**
     * Removes speed marks from beginning
     * @param str the string
     * @returns {*} the string, after removal of speech marks
     */
    cleanup : function(str) {
        //remove leading/trailing speech marks
        if(str.length > 0 && (str[0] == "'" || str[0] == '"')) {
            str = str.substring(1);
        }

        if(str.length > 0 && (str[str.length - 1] == "'" || str[str.length - 1] == '"')) {
            str = str.substring(0, str.length -1);
        }

        return str;
    },

    _notApplicableMessage: function (results, message) {
        var notApplicable = $("<span>").addClass("notApplicable").html(message);
        results.append(notApplicable);
    }
});
