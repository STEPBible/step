var SearchDisplayView = DisplayView.extend({
    el: function () {
        var passageContainer = step.util.getPassageContainer(this.model.get("passageId"));
        var passageContent = passageContainer.find(".passageContent");
        if (passageContent.length == 0) {
            passageContent = $('<div class="passageContent"></div>');
            passageContainer.find(".passageText").append(passageContent);
        }
        return passageContent;
    },

    /**
     * Initialises - should be called with the options set.
     */
    initialize: function () {
        _.bindAll(this);

        this.listenTo(this.model, "destroyViews", this.remove);
        this.listenTo(this.model, "destroy-column", this.remove);

        this.resultsLabel = step.util.getPassageContainer(this.$el).find(".resultsLabel");
        this.hasPages = true;
        this.pageNumber = 1;

        this.render(false);
        this.listenTo(this.model, "newPage", this.renderAppend);

        //finished rendering, so reset the partial rendering flag
        this.options.partRendered = false;

        //we always save the results in the firstPageResults field, so that we can restore quickly at a later date
        this.model.save({ firstPageResults: this.model.get("results"), results: null }, { silent: true })
    },
    renderAppend: function () {
        this.render(true);
        this.fetching = false;

        //remove icon
        this.$el.find(".searchResults .waiting").remove();

        this.model.save({ results: null }, { silent: true })
    },
    render: function (append) {
        var self = this;
        var query = this.model.get("query");

        this.args = this.model.get("searchArgs");
        this.versionArg = this.model.get("versionArg");
        this.lastSearch = query;

        var results = this.model.get("results");
        var total = this.model.get("total");

        var numReturned = results != undefined ? results.length : 0;
        if (append) {
            this._updateTotalAppend(numReturned);
        } else {
            this._updateTotal(this.model.get("total"));
        }

        var results;
        if (total == 0) {
            results = (this.options.partRendered ? this.$el.find("> span") : $("<div>")).append(this._getErrorMessage());
        } else {
            results = this.options.partRendered ? this.$el.find("> span") : this.renderSearch(append, this.$el.find(".searchResults"));

            this._addVerseClickHandlers(results);

            var strongHighlights = this.model.get("strongHighlights");
            if (strongHighlights) {
                this._highlightStrongs(results, strongHighlights);
            } else {
                this._highlightResults(results, query);
            }

            this.doFonts(append ? this.getScrollableArea() : results, "", this.model.get("interlinearMode"), this.model.get("languageCode"));
        }

        var passageId = this.model.get("passageId");
        step.util.restoreFontSize(this.model, results.find(".passageContentHolder"));

        if (append) {
            //already appended?
            //this.getScrollableArea().append(results);
        } else {
            var passageHtml = results;
            if (!this.options.partRendered) {
                passageHtml = this._doSpecificSearchRequirements(query, results, this.model.get("masterVersion"));
                step.util.ui.emptyOffDomAndPopulate(this.$el, passageHtml);
            }

            //everything is now attached, so we can add handlers
            this._doSpecificSearchHandlers();
            this.getScrollableArea().scroll(function () {
                self.getMoreResults();
            });
        }

        this.doTitle();
        this.doSwapInterlinearLink(this.$el);
        step.util.ui.addStrongHandlers(passageId, this.$el);
        step.util.ui.enhanceVerseNumbers(passageId, this.$el, this.model.get("masterVersion"), true);
        this.doInterlinearVerseNumbers(this.$el, this.model.get("interlinearMode"), this.model.get("options"));
        this._doChromeHack(this.$el, this.model.get("interlinearMode"), this.model.get("options"));
    },
    _getErrorMessage: function () {
        var errorMessage = $("<span>");

        //get list of versions
        var versions = [this.model.get("masterVersion")];
        var extraVersions = this.model.get("extraVersions");
        if (!step.util.isBlank(extraVersions)) {
            versions = versions.concat(extraVersions.split(","));
        }


        var reference = this.model.get("searchRestriction");
        var message;
        if (step.util.isBlank(reference)) {
            reference = __s.whole_bible_range;
            message = sprintf(__s.search_no_search_results_found_in_version_reference_master_restriction,
                    "<b>" + versions.join(", ") + "</b>", "<b>" + versions[0] + "</b>");
        } else {
            message = sprintf(__s.search_no_search_results_found_in_version_reference,
                    "<b>" + reference + "</b>",
                    "<b>" + versions.join(", ") + "</b>");
        }

        errorMessage.append(message).addClass("notApplicable");
        return errorMessage;
    },
    //adds verse click handlers to open up the verse in a separate linked passage
    _addVerseClickHandlers: function (results, masterVersion) {
        var self = this;
        results.find(".verseNumber").parent().click(function (ev) {
            //now go to a new place. Let's be crazy about it as well, and simply chop off the last part
            var verseRef = $(this).attr("name");
            if(verseRef == null) {
                verseRef = $(this).closest("[name]").attr("name");
            }

            var callback = null;
            if(masterVersion) {
                callback = function(model) {
                    step.util.swapMasterVersion(masterVersion, model, true);
                }
            }

            step.util.createNewLinkedColumnWithScroll(self.model.get("passageId"), verseRef, false, callback, ev);
        });

    },
    /**
     * returns the area on which we have attached the scroll event
     * @returns {*}
     */
    getScrollableArea: function () {
        return this.$el.closest(".passageContent").find("> span");
    }, getMoreResults: function () {
        var self = this;

        //never load new pages
        if (!this.hasPages) {
            return;
        }

        if (this.fetching == true) {
            return;
        }

        var scrollableArea = this.getScrollableArea();


        //visible height
        var clientHeight = scrollableArea.prop("clientHeight");

        //how far down we are
        var scrollTop = scrollableArea.prop("scrollTop");

        //total scrollable height
        var scrollHeight = scrollableArea.prop("scrollHeight");

        var leftToScroll = scrollHeight - scrollTop - clientHeight;

        var scrollDownProportion = scrollableArea.scrollTop() / scrollableArea.prop("scrollHeight");
        if (scrollDownProportion > 0.7 || scrollDownProportion == scrollableArea.height() || leftToScroll < 800) {
            var currentPageNumber = this.pageNumber;
            var newPageNumber = parseInt(currentPageNumber) + 1;
            var pageSize = this.model.get("pageSize");

            //check page size
            if (currentPageNumber * pageSize > this.currentTotal) {
                return;
            }
            this.fetching = true;

            //append results
            //change page number to be one more...
            var startTime = new Date().getTime();
            this.pageNumber = newPageNumber;

            //we don't want to update the page URL here
            this.model.save({pageNumber: newPageNumber}, { silent: true });

            //add a full width container for the waiting icon
            this.$el.find(".searchResults").append("<div class='waiting'>&nbsp;</div>");

            step.router.doMasterSearch(this.model.get("args"), null, this.model.get("interlinearMode"),
                newPageNumber, this.model.get("strongHighlights"),
                this.model.get("order"),
                this.model.get("context"), true);
        }
    },

    doTitle: function () {
        $("title").html(this.titleFragment + " | STEP");
    },

    /**
     * An ability to post-process the results at the very end
     * @param query the query syntax
     * @param results the all-emcompassing results object
     * @private
     */
    _doSpecificSearchRequirements: function (query, results) {
        //do nothing
        return results;
    },
    /**
     * add the handling that is required for using the toolbars
     */
    _doSpecificSearchHandlers: function () {
        //do nothing by default
    },
    _updateTotalAppend: function () {
        this.resultsLabel.html(sprintf(__s.paging_showing, this.currentTotal));
    },

    _updateTotal: function (total) {
        this.currentTotal = total;
        this.resultsLabel.html(sprintf(__s.paging_showing, total));
    },

    _highlightResults: function (results, query) {
        var highlightTerms = this._highlightingTerms(query);

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

            $("span[strong~='" + step.util.unaugmentStrong(strongsList[i]) + "']", results).addClass("secondaryBackground");
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
        termBase = termBase.replace(/\*/ig, "[0-9a-zA-Z]*");

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
    cleanup: function (str) {
        //remove leading/trailing speech marks
        if (str.length > 0 && (str[0] == "'" || str[0] == '"')) {
            str = str.substring(1);
        }

        if (str.length > 0 && (str[str.length - 1] == "'" || str[str.length - 1] == '"')) {
            str = str.substring(0, str.length - 1);
        }

        return str;
    },

    _notApplicableMessage: function (results, message) {
        var notApplicable = $("<span>").addClass("notApplicable").html(message);
        results.append(notApplicable);
    },
    getVerseRow: function (table, contentGenerator, item) {
        var newRow = $("<div>").addClass("searchResultRow");
        var contentCell = $("<div>").addClass("searchResultRow");
        newRow.append(contentCell);

        if (contentGenerator != undefined) {
            contentCell.append(contentGenerator(contentCell, item));
        } else {
            contentCell.append(item.preview);
        }

        table.append(newRow);
    }
});
