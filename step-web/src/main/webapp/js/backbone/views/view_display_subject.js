var SubjectDisplayView = SearchDisplayView.extend({
    titleFragment: __s.search_subject,
    searchTypeToolbar: '<div class="subjectToolbar">' +
        '<span class="radioGroup">' +
        '<input <%= selected[0] %> type="radio" name="subjectSearchType" value="<%= SUBJECT_SEARCH %>" id="<%= passageId %>_esvHeadings" />' +
        '<label for="<%= passageId %>_esvHeadings"><%= __s.search_subject_book_headings %></label>' +
        '</span><span class="radioGroup">' +
        '<input <%= selected[1] %> type="radio" name="subjectSearchType" value="<%= NAVE_SEARCH %>" id="<%= passageId %>_nave" />' +
        '<label for="<%= passageId %>_nave"><%= __s.search_subject_nave %></label>' +
        '</span><span class="radioGroup">' +
        '<input <%= selected[2] %> type="radio" name="subjectSearchType" value="<%= NAVE_SEARCH_EXTENDED %>" id="<%= passageId %>_extendedNave" />' +
        '<label for="<%= passageId %>_extendedNave"><%= __s.search_subject_nave_extended %></label>' +
        '</span>' +
        '</div>',
    prefixMatcher: new RegExp("(" + SUBJECT_SEARCH + "|" + NAVE_SEARCH + "|" + NAVE_SEARCH_EXTENDED + ")" + "(?!.*?" + "(" + SUBJECT_SEARCH + "|" + NAVE_SEARCH + "|" + NAVE_SEARCH_EXTENDED + ")" + ")"),

    initialize: function () {
        SearchDisplayView.prototype.initialize.call(this);
        this.hasPages = false;
    },

    renderSearch: function () {
        console.log("Rendering subject search results");
        var searchType = this.model.get("searchType");

        if (searchType == 'SUBJECT_SIMPLE') {
            return this._doSimpleSubjectSearchResults(this.model.get("results"));
        } else {
            return this._doNaveSearchResults(this.model.get("results"));
        }
    },

    /**
     * Displays the first level of search
     * @param searchResults the results
     * @returns {*|jQuery}
     * @private
     */
    _doSimpleSubjectSearchResults: function (searchResults) {
        var results = $("<span>").addClass("subjectSection searchResults simpleSubjectSearch");
        var headingsSearch = searchResults[0].headingsSearch;
        var headingsResults = headingsSearch.results;

        for (var i = 0; i < headingsResults.length; i++) {
            this.getVerseRow(results, null, headingsResults[i]);
        }
        return results;
    },

    /**
     * Adds the right button to the results
     * @param results the results built up so far
     * @param query the query syntax that was used to search
     * @private
     */
    _doSpecificSearchRequirements: function (query, results) {
        var self = this;
        var passageId = this.model.get("passageId");
        var searchType = this.model.get("searchType");

        if (searchType != 'SUBJECT_RELATED') {
            var checked = [searchType == 'SUBJECT_SIMPLE' ? 'checked' : "",
                    searchType == 'SUBJECT_EXTENDED' ? 'checked' : "",
                    searchType == 'SUBJECT_FULL' ? 'checked' : ""];

            var searchTypes = $(_.template(this.searchTypeToolbar)({ passageId: passageId, selected: checked }));
            results.prepend(searchTypes);
        }

        //now iterate through all subject searches and set the the last subject search to be of this particular type
        return results;
    },
    _doSpecificSearchHandlers: function () {
        var self = this;
        var subjectToolbar = this.$el.find(".subjectToolbar");
        subjectToolbar.find("input[type='radio']").on('change', function () {
            //make sure the active passage is this one
            step.util.activePassageId(step.passage.getPassageId(this));
            var value = $(this).val();
            var activePassage = step.util.activePassage();
            var args = activePassage.get("args") || "";
            args = args.replace(self.prefixMatcher, value);
            step.router.navigateSearch(args);
        });

        this.$el.find(".searchResults .panel-default").on("show.bs.collapse", function () {
            //load more results
            self.handleExpandingContainer($(this));
        });

    },
    _doNaveSearchResults: function (searchResults) {
        var self = this;
        var results = $("<span>").addClass("searchResults");

        var lastHeader = "";
        if (!searchResults || searchResults.length == 0) {
            return;
        }

        //add a header
        lastHeader = searchResults[0].root;

        var heading = $("<h4>").addClass("subjectHeading").append(lastHeader);
        results.append(heading);

        var list = $('<div class="panel-group">').addClass("subjectSection searchResults");
        results.append(list);


        //searchResults is the array of results
        for (var i = 0; i < searchResults.length; i++) {
            if (searchResults[i].root != lastHeader) {
                //append a new header

                heading = $("<h4>").addClass("subjectHeading").append(searchResults[i].root);
                results.append(heading);

                list = $('<div class="panel-group">').addClass("subjectSection searchResults");
                results.append(list);
                lastHeader = searchResults[i].root;
            }

            var passageId = this.model.get("passageId");
            var expandingPanelId = "subject-results-" + i + "-" + passageId;
            var panel = step.util.ui.addCollapsiblePanel(searchResults[i].heading, "expandableSearchHeading", "#" + expandingPanelId);
            panel.append($('<div class="results">').attr("id", expandingPanelId).addClass("panel-collapse collapse").append(__s.results_loading))
            list.append(panel);

            //add some data
            panel.attr("root", searchResults[i].root).attr("fullHeader", searchResults[i].heading);
            if (searchResults[i].seeAlso) {
                panel.attr("seeAlso", searchResults[i].seeAlso);
            }
        }

        return results;
    },
    handleExpandingContainer: function (el) {
        if(el.attr("loaded") == "true") {
            return;
        }

        var self = this;
        var root = el.attr("root");
        var fullHeader = el.attr("fullHeader");
        var seeAlso = el.attr("seeAlso");

        //ensure this is the active passage
        var passageId = step.passage.getPassageId(el);
        step.util.activePassageId(passageId);
        var passage = step.util.activePassage();
        var versions = passage.get("masterVersion");
        var extraVersions = passage.get("extraVersions") || "";
        if (extraVersions != "") {
            versions += "," + extraVersions;
        }

        var reference = passage.get("searchRestriction");
        var context = passage.get("context");
        $.getSafe(SUBJECT_VERSES, [root, fullHeader, versions, reference, context], function (data) {
            var results = data.subjectEntries;
            el.attr("loaded", "true");
            var verses = $("<div>").addClass("expandedHeadingItem ");

            if(data.masterVersionSwapped == true) {
                verses.append($("<span class='subjectNotice'></span>").append(__s.error_subject_entries_versification_issue));
            }

            if (results) {
                for (var i = 0; i < results.length; i++) {
                    var verseContent = results[i].value;
                    if (results[i].fragment) {
                        verseContent = verseContent.substring(0, verseContent.lastIndexOf("</div>")).trim() + "[...]</div>";
                    }

                    var row = $('<div class="verseContent">');
                    var elVerse = $(verseContent);
                    var ref = results[i].reference;
                    var verseLink = $('<a name="' + ref + '"><span class="verseNumber">' + ref + '</span></a>');

                    elVerse.find(".verse:first").prepend(verseLink);

                    row.append(elVerse);
                    verses.append(row);
                }
            }

            //also append the see also references as links to do the search again
            var seeAlsoRefs = "";
            if (seeAlso) {
                seeAlsoRefs = $("<h4>").addClass("expandedHeadingItem").html(__s.subject_other_useful_entries);
                var otherLinks = $("<span>").addClass("expandedHeadingItemContents");

                var refs = seeAlso.split(";");
                for (var i = 0; i < refs.length; i++) {
                    if (step.util.isBlank(refs[i])) {
                        continue;
                    }

                    var link = $("<a>").attr("href", "javascript:void(0)").html(refs[i].trim());
                    var refLink = refs[i];
                    $(link).click({value: { refLink: refLink, seeAlso: seeAlso } }, function (event) {
                        var query;
                        var text = "";
                        text += event.data.value.refLink;

                        //also add in the root word if the word "above" or "below" appears
                        if (event.data.value.seeAlso.indexOf('above') != -1 && event.data.value.seeAlso.indexOf('below') != -1) {
                            //add in the root word
                            text += " " + root;
                        }

                        step.router.navigatePreserveVersions(NAVE_SEARCH + "=" + text);
                    });

                    seeAlsoRefs.append(" ");
                    otherLinks.append(link);
                    otherLinks.append(" ");
                }


                seeAlsoRefs.append(otherLinks);
            }

            verses = $(verses || "<span>").append(seeAlsoRefs);
            var resultsEl = $(el).find(".results");
            resultsEl.empty().append(verses);
            self._addVerseClickHandlers(resultsEl, resultsEl.find("[data-version]:first").data("version"));
            self._highlightResults(resultsEl, self.model.get("query"));
            step.util.ui.addStrongHandlers(passageId, verses);
            step.util.ui.enhanceVerseNumbers(passageId, self.$el, self.model.get("masterVersion"), true);
            if(results && results.length > 0) {
                self.doFonts(resultsEl, [], results[0].interlinearMode, results[0].languageCode);
            }
        }).error(function() {
            changeBaseURL();
        });
    }
});