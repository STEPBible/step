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
        var strongShowDef = "";
        if (total == 0) {
            results = (this.options.partRendered ? this.$el.find("> span") : $("<div>")).append(this._getErrorMessage());
        } else {
			var options = this.model.get("selectedOptions") || [];
            var availableOptions = this.model.get("options") || [];

            // should be const instead of var, but not compatible with older browser
            // This must match the definition in the color_code_grammar.js
            // Do not take away the TBRMBR comment (to be removed by maven replacer
            var C_colorCodeGrammarAvailableAndSelected = 0; // TBRBMR
            cv[C_colorCodeGrammarAvailableAndSelected] = (options.indexOf("C") > -1) && (availableOptions.indexOf("C") > -1);
            if ((cv[C_colorCodeGrammarAvailableAndSelected]) && (typeof c4 === "undefined")) cf.initCanvasAndCssForClrCodeGrammar(); //c4 is currentClrCodeConfig.  It is called to c4 to save space
            var passageHtml, ntCSSOnThisPage = '', otCSSOnThisPage = '', hasTOS = false, hasNTMorph = false;
            var bibleVersions = this.model.attributes.masterVersion.toUpperCase() + "," + this.model.attributes.extraVersions.toUpperCase();
            if ((bibleVersions.indexOf('ESV') > -1) || (bibleVersions.indexOf('OHB') > -1) || 
                (bibleVersions.indexOf('THOT') > -1)  || (bibleVersions.indexOf('_MORPH') > -1)) {
                step.util.loadTOS();              
                hasTOS = true;
            }
            if ((bibleVersions.indexOf('ESV') > -1) || (bibleVersions.indexOf('KJV') > -1) ||
                (bibleVersions.indexOf('SBLG') > -1) || (bibleVersions.indexOf('THGNT') > -1) || (bibleVersions.indexOf('CUN') > -1)  || (bibleVersions.indexOf('_MORPH') > -1)) hasNTMorph = true;
            results = this.options.partRendered ? this.$el.find("> span") : this.renderSearch(append, this.$el.find(".searchResults"));

			if (cv[C_colorCodeGrammarAvailableAndSelected]) {
				if (hasTOS) {
					var r = cf.addClassForTHOT(results[0].outerHTML, bibleVersions);
					$(results[0]).html(r[0]);
					otCSSOnThisPage = r[1];
				}
				if (hasNTMorph) {
					ntCSSOnThisPage = cf.getClassesForNT(results[0].outerHTML);
				}
			}

            this._addVerseClickHandlers(results);
            var strongHighlights = this.model.get("strongHighlights");
            if (strongHighlights) {
                this.highlightMultiStrongs(results, strongHighlights);
                if (($(".column").length == 1) && (!step.touchDevice) && (window.innerWidth > 770))
                    strongShowDef = strongHighlights.join(' ');
            } else {
                this._highlightResults(results, query);
            }
            var activePassageData = this.model.get("searchTokens");
            for (var i = 0; i < activePassageData.length; i++) {
                var actPsgeDataElm = activePassageData[i];
                var itemType = actPsgeDataElm.itemType ? actPsgeDataElm.itemType : actPsgeDataElm.tokenType
                if (itemType === SYNTAX) {
                    var syntaxWords = actPsgeDataElm.token.replace(/\(/g, '').replace(/\)/g, '').split(" ");
                    step.util.findSearchTermsInQuotesAndRemovePrefix(syntaxWords);
                    var arrayLength = syntaxWords.length;
                    for (var j = 0; j < arrayLength; j++) {
                        var curWord = syntaxWords[j];
                        if ((curWord !== "AND") && (curWord !== "OR") && (curWord !== "NOT")) {
                            if (curWord.indexOf("strong:") == 0)
                                this._lookForStrongInSearchString(curWord.substring(7), results, strongHighlights);
                            else if (curWord !== query)
                                this._highlightResults(results, curWord);
                        }
                    }
                }
                else if (itemType === TEXT_SEARCH) {
                    if (actPsgeDataElm.token !== query)
                        this._highlightResults(results, actPsgeDataElm.token);
                }
                else if ((itemType === STRONG_NUMBER) || (itemType === GREEK_MEANINGS) ||
                    (itemType === GREEK) || (itemType === HEBREW_MEANINGS) ||
                    (itemType === HEBREW))
                        this._lookForStrongInSearchString(actPsgeDataElm.token, results, strongHighlights);
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

        if (numReturned > 0) this.doTitle();
        this.doSwapInterlinearLink(this.$el);
        step.util.ui.addStrongHandlers(passageId, this.$el);
        step.util.ui.enhanceVerseNumbers(passageId, this.$el, this.model.get("masterVersion"), true);
        this.doInterlinearVerseNumbers(this.$el, this.model.get("interlinearMode"), this.model.get("options"));
		
		// following 10 lines were added to enhance the Color Code Grammar  PT
		// should be const instead of var, but not compatible with older browser
		// This must match the definition in the color_code_grammar.js
		// Do not take away the TBRMBR comment (to be removed by maven replacer
		var C_handleOfRequestedAnimation = 11; // TBRMBR
		var C_numOfAnimationsAlreadyPerformedOnSamePage = 16; // TBRMBR
		if ((cv[C_colorCodeGrammarAvailableAndSelected] !== undefined) && (cv[C_numOfAnimationsAlreadyPerformedOnSamePage] !== undefined) &&
			(cv[C_handleOfRequestedAnimation] !== undefined)) {
			if (cv[C_colorCodeGrammarAvailableAndSelected]) {
				cv[C_numOfAnimationsAlreadyPerformedOnSamePage] = 0;
				cf.refreshClrGrammarCSS(ntCSSOnThisPage, otCSSOnThisPage);
				if (cv[C_handleOfRequestedAnimation] == -1) cf.goAnimate();
			}
		}
		
        this._doChromeHack(this.$el, this.model.get("interlinearMode"), this.model.get("options"));
        if (step.touchDevice && !step.touchWideDevice)
            $(".copyrightInfo").removeClass("copyrightInfo").addClass("crInfoX");
        if (strongShowDef !== "")
            step.util.ui.showDef(strongShowDef);
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
        if (step.touchDevice && !step.touchWideDevice)
            return $(document);
        return this.$el.closest(".passageContent").find("> span");
    },
    getMoreResults: function () {
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
        if (typeof clientHeight !== "number")
            clientHeight = $(window).height();

        var numOfSearchRows = $(".searchResultRow").length;
        if (numOfSearchRows == 0)
            return;
        var thirtyPercentRowsPerPage = (numOfSearchRows / this.pageNumber) * .3;
        var checkRow = Math.floor(numOfSearchRows - thirtyPercentRowsPerPage);
        var posOf70PercentRowInLastPage = $($(".searchResultRow")[checkRow])[0].getBoundingClientRect().top;
        if (posOf70PercentRowInLastPage < clientHeight) {
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
            if ((!step.util.isBlank(highlightTerms[i])) && (highlightTerms[i] !== "null")) {
                var regex = new RegExp("\\b" + highlightTerms[i] + "\\b", "ig");
                doHighlight(results.get(0), "secondaryBackground", regex);
            }
        }
    },

    _lookForStrongInSearchString: function (curWord, results, strongHighlights) {
        var strongArray = [];
        if (!strongHighlights) strongHighlights = [];
        if (strongHighlights.indexOf(curWord) == -1) strongArray.push(curWord);
        if (isNaN(curWord.charAt(curWord.length - 1))) {
            curWord = curWord.slice(0, -1);
            if (strongHighlights.indexOf(curWord) == -1) strongArray.push(curWord);
        }
        if (strongArray.length > 0)
            this.highlightMultiStrongs(results, strongArray);
    },

    highlightMultiStrongs: function (results, strongsList) {
        if (strongsList == undefined) {
            return;
        }
        //now let's iterate through the list of strongs, find all the elements that match, and add the highlight class
        for (var i = 0; i < strongsList.length; i++) {
			step.util.highlightStrong(strongsList[i], 'span[strong', "", results, "secondaryBackground");
//            $("span[strong~='" + step.util.unaugmentStrong(strongsList[i]) + "']", results).addClass("secondaryBackground");
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
        if (str.length > 0 && (str[0] === "'" || str[0] == '"')) {
            str = str.substring(1);
        }

        if (str.length > 0 && (str[str.length - 1] ==="'" || str[str.length - 1] === '"')) {
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
