var SubjectDisplayView = SearchDisplayView.extend({
    titleFragment : __s.search_subject,
    renderSearch: function (searchResults, query) {
        console.log("Rendering subject search results");
        var query = step.util.undoReplaceSpecialChars(searchResults.query);

        if (query.startsWith("s=")) {
            return this._doSimpleSubjectSearchResults(query, searchResults.results);
        } else {
            //caters for s+=, s++= and sr=
            return this._doNaveSearchResults(query, searchResults.results);
        }
    },

    /**
     * Displays the first level of search
     * @param query the query syntax that was sent
     * @param searchResults the results
     * @returns {*|jQuery}
     * @private
     */
    _doSimpleSubjectSearchResults: function (query, searchResults) {
        var results = $("<table>").addClass("subjectSection searchResults simpleSubjectSearch");
        var headingsSearch = searchResults[0].headingsSearch;
        var headingsResults = headingsSearch.results;

        for (var i = 0; i < headingsResults.length; i++) {
            var item = $("<tr>");
            var button = $("<td>").addClass("subjectHeading").passageButtons({
                passageId: this.model.get("passageId"),
                ref: headingsResults[i].key,
                showChapter: true
            });

            item.append(button);
            item.append($("<td>").append(headingsResults[i].preview));
            results.append(item);
        }
        return results;
    },

    /**
     * Adds a "more" button to the searches
     * @param query the query
     * @param results the html fragment built up so far
     * @param text the text to be displayed
     * @private
     */
    _addMoreSubjectButton: function (query, results, text) {
        var model = this.model;
        var moreSubjectLink = $("<a href='javascript:void(0)'>").append(text);

        //set up click link, which we will clone if required
        moreSubjectLink.click(function() {
            //add in a plus and send it back through
            var equalIndex = query.indexOf('=');
            var newQuery = query.substring(0, equalIndex) + '+' + query.substring(equalIndex);

            if (newQuery.indexOf("+++") != -1) {
                newQuery = newQuery.replace("+++", "");
            }

            model.save({ querySyntax : newQuery });
            model.trigger("search", model);
        });

        //add the buttons and results
        var wrapper = $("<div>");
        var moreSubjectsButton = $("<div class='moreSubjects'>").append(moreSubjectLink);
        moreSubjectsButton.find("a").button({});

        wrapper.append(moreSubjectsButton);
        wrapper.append(results);
        if (results.hasClass(".searchResults")) {
            wrapper.append(moreSubjectsButton.clone(true));
        }
        return wrapper;
    },

    /**
     * Adds the right button to the results
     * @param results the results built up so far
     * @param query the query syntax that was used to search
     * @private
     */
    _doSpecificSearchRequirements: function (query, results) {
        var undoneQuery = step.util.undoReplaceSpecialChars(query);

        if (undoneQuery.startsWith("s=")) {
            return this._addMoreSubjectButton(query, results, __s.subject_search_first);
        } else if (undoneQuery.startsWith("s+=")) {
            var wrappedSearchResults = this._addMoreSubjectButton(query, results,__s.subject_search_second);
            this._addSubjectExpandHandlers(query, results);
            return wrappedSearchResults;
        } else if (undoneQuery.startsWith("s++=")) {
            var wrappedSearchResults = this._addMoreSubjectButton(query, results, __s.subject_search_third);
            this._addSubjectExpandHandlers(query, results);
            return wrappedSearchResults;
        } else if (undoneQuery.startsWith("sr=")) {
            this._addSubjectExpandHandlers(query, results);
            return results;
        }
    },

    resetExpandableItems: function (results) {
        $(".expandableSearchHeading", results).each(function (i, item) {
            $.data(item, 'expanded', false);
            var arrow = $(this).find("span.arrow");
            arrow.html(arrow.html().replace('\u25bc', '\u25b6'));
        });
    },

    _addSubjectExpandHandlers: function (query, results) {
        var self = this;

        $(".expandableSearchHeading", results).click(function () {
            if ($.data(this, 'expanded') == true) {
                $(".expandedHeadingItem", results).remove();
                self.resetExpandableItems(results);
                return;
            }

            self.resetExpandableItems(results);
            $.data(this, 'expanded', true);

            var arrow = $(this).find("span.arrow");
            arrow.html(arrow.html().replace('\u25b6', '\u25bc'));

            var root = $(this).prop("root");
            var fullHeader = $(this).prop("fullHeader");
            var seeAlso = $(this).prop("seeAlso");
            var version = "ESV";
            var currentHeading = this;

            //first delete the headings
            $(".expandedHeadingItem", results).remove();

            //get verses for subject search
            $.getSafe(SUBJECT_VERSES, [root, fullHeader, version], function (results) {
                var verses = $("<table>").addClass("expandedHeadingItem");
                if (results) {
                    for (var i = 0; i < results.length; i++) {
                        var verseContent = results[i].value;
                        if (results[i].fragment) {
                            verseContent = verseContent.substring(0, verseContent.lastIndexOf("</div>")).trim() + "[...]</div>";
                        }

                        var row = $("<tr>");
                        row.append($("<td>").passageButtons({
                            passageId: self.model.get("passageId"),
                            ref: results[i].reference,
                            showChapter: true,
                            display: "inline"
                        }));

                        verseContent = $("<td>").append(verseContent);
                        row.append(verseContent);
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

                        var link = $("<a>").attr("href", "javascript:void").html(refs[i].trim());
                        var refLink = refs[i];
                        $(link).click(function () {
                            var splitByComma = refLink.split(",");
                            var query;
                            var text = "";
                            if (splitByComma.length == 1) {
                                //do a s+ search
                                query = "s+=";
                            } else {
                                // do a s++ search
                                query = "s++="
                            }

                            text += refLink;

                            //also add in the root word if the word "above" or "below" appears
                            if (seeAlso.indexOf('above') != -1 && seeAlso.indexOf('below') != -1) {
                                //add in the root word
                                text += " " + root;
                            }
                            query += text;

                            step.state.subject.subjectText(passageId, text);
                            step.state.subject.subjectQuerySyntax(passageId, query);
                            step.search.subject.search(passageId);
                        });

                        seeAlsoRefs.append($("<br />"));
                        otherLinks.append(link);
                    }


                    seeAlsoRefs.append(otherLinks);
                }

                verses = $(verses || "<span>").append(seeAlsoRefs);
                $(currentHeading).after(verses);
            });
        });
    },

    _doNaveSearchResults : function (query, searchResults) {
        var results = $("<span>").addClass("searchResults");

        var lastHeader = "";
        if (searchResults.length == 0) {
            return;
        }

        //add a header
        lastHeader = searchResults[0].root;

        var heading = $("<h3>").addClass("subjectHeading").append(lastHeader);
        results.append(heading);

        var list = $("<ul>").addClass("subjectSection searchResults");
        results.append(list);


        //searchResults is the array of results
        for (var i = 0; i < searchResults.length; i++) {
            if (searchResults[i].root != lastHeader) {
                //append a new header
                heading = $("<h3>").addClass("subjectHeading").append(searchResults[i].root);
                results.append(heading);

                list = $("<ul>").addClass("subjectSection searchResults");
                results.append(list);
                lastHeader = searchResults[i].root;
            }

            var item = $("<li>")
                .append($("<span>").addClass("arrow").css("font-size", "smaller").html("&#9654;")).append("&nbsp;&nbsp;")
                .append(searchResults[i].heading).addClass("expandableSearchHeading ui-state-default ui-corner-all")
                .prop("root", searchResults[i].root)
                .prop("fullHeader", searchResults[i].heading);

            if (searchResults[i].seeAlso) {
                item.prop("seeAlso", searchResults[i].seeAlso);
            }

            results.append(item);
        }
        return results;
    }
});