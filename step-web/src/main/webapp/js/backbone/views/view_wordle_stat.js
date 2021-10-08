var ViewLexiconWordle = Backbone.View.extend({
    events: {
    },
    minFont: 14,
    minSubjectFont: 12,
    maxFont: 24,
    passageId: 0,

    initialize: function () {
        var self = this;
        this.isNextChapter = false;

        var scopeContainer = $("<form class='scopeContainer '>");

        this.wordType = this.populateMenu(step.defaults.analysis.kind,  step.defaults.analysis.kindTypes, __s.analyse_label, "wordType");
        this.wordScope = this.populateMenu(step.defaults.analysis.scope, step.defaults.analysis.scopeType, __s.bible_text, "wordScope", true);
        this.sortSelection = this.populateMenu(step.defaults.analysis.sort, step.defaults.analysis.sortType, __s.analyse_sort_label, "sortSelection");
        this.newLineSelected = $('<button class="btn btn-default btn-xs pull-right" id="newLineWordle"><span type="button"/>Selected passage</button>');
        this.resultWithLineBreak = $('<input type="checkbox" id="resultWithLineBreak" checked="checked" class="pull-right" />');
        this.nextChapter = $('<button class="btn btn-default btn-xs pull-right" id="nextChapterWordle"><span type="button"/>' + __s.stats_next_chapter + '</button>');
        this.statsContainer = $('<div id="statsContainer"></div>');
        this.addRefreshStats(this.resultWithLineBreak);

        scopeContainer.append(this.wordType);
        scopeContainer.append(this.wordScope);
        scopeContainer.append(this.scope);
        scopeContainer.append(this.sortSelection);
        scopeContainer.append(
            $('<div class="form-group"><label for="resultWithLineBreak">' + __s.analyse_result_linebreak + '</label></div>').append(this.resultWithLineBreak));

        scopeContainer.append(
            $('<div id="nextChapterInputLine" class="form-group"><label for="nextChapterWordle">' + __s.analyse_update + ':</label></div>').append(this.nextChapter).append(this.newLineSelected));

		this.$el.append("<h2>" + __s.vocabulary_analysis + "</h2>");
        this.$el.append(scopeContainer);
        this.$el.append(this.statsContainer);

        this.newLineSelected.click(function(ev) {
            event.preventDefault();
            self.doStats();
        });
        this.nextChapter.click(function(ev) {
            self.isNextChapter = true;
            event.preventDefault();
            self.doStats();
        });
//        this.$el.closest(".tab-content").on("tab-change", function(ev) { self._stopAnimationOnTabChange(ev); });
    },
    refresh: function() {
        if(this.$el.hasClass("active")) {
            this.doStats();
        }
    },

    addRefreshStats: function(el) {
        var self = this;
        el.click(function() { self.doStats() });
    },
    populateMenu: function (data, values, label, id, includeText) {
        var self = this;
        
        //create form group
        var formGroup = $('<div class="form-group">');
        var label = $('<label></label>').append(label).attr("for", id);

        //create a button menu
        var buttonGroup = $('<div class="btn-group pull-right"></div>').attr("id", id);
        var value = $('<span class="currentRef"></span>');
        var button = $('<button type="button" data-toggle="dropdown" class="btn btn-default btn-xs dropdown-toggle"></div>')
            .append(value).append('<span class="caret"></span>');


        //get max length
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
// The following 19 lines were commented out because the input field is not processed even if the user enter another book or chapter
// I suspect this function was not fully implemented.  Since this does not work and could confuse the user, the code is commented out.
// This should work better for the user.  PT June 2, 2019
/*      if (includeText) {
            var activePassageData = step.util.activePassage();
            var activeReference = activePassageData.get("reference") || this._getBestReference(activePassageData);
            var textReference = $('<input type="text" class="refInput" />')
                .attr("placeholder", __s.analyse_book_ref)
                .val(activeReference)
                .prop('disabled', true);;
            textReference.data(data[0]);
            var li = $('<li role="presentation"></li>');
            var link = $("<a></a>");
            link.append(step.util.ui.selectMark()).append(textReference);
            li.append(link);
            menu.append(li);
            li.addClass("selected").find(".glyphicon").addClass("active");
            li.data("value", activeReference);
        } 

        for (var i = includeText ? 1 : 0; i < data.length; i++) { */
// The following line was added when the above 19 lines were commented out
        for (var i = 0; i < data.length; i++) {
            var link = $('<a role="menuitem" tabIndex="-1" href="javascript:void(0)">' + data[i] + '</a>');
            var li = $('<li role="presentation"></li>');
            li.append(link.prepend(step.util.ui.selectMark()));

            if (!includeText && i == 0) {
                li.addClass("selected").find(".glyphicon").addClass("active");
            } 
            li.data("value",values[i]);
            menu.append(li);
        }

        var firstLi = menu.find("li:first");
        if(firstLi.text() == "") {
            value.html(firstLi.find("input").val());
        } else {
            value.html(firstLi.text());
        }

        menu.find("a").click(function () {
            var link = $(this)
            var linkText = link.text();
            if(linkText == "") {
                var newRef = link.find("input").val();
                value.html(newRef);
                link.closest("li").data("value", newRef);
            } else {
                value.html(linkText);
            }
            
            link.closest("ul").find("li").removeClass("selected").find(".active").removeClass("active");
            link.parent().addClass("selected").find(".glyphicon").addClass("active");
            self.doStats();
        });

        menu.find("input").click(function (e) {
            e.stopPropagation();
            e.preventDefault();
        }).on("keydown", function (event) {
            event.stopPropagation();
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code == 13) {
                event.preventDefault();
                var input = $(this);
                value.html(input.val());
                input.closest("ul").removeClass("selected");
                input.closest("li").addClass("selected").data("value", input.val());
                self.doStats();
            }
        });

        formGroup.append(label);
        buttonGroup.append(button);
        buttonGroup.append(menu);
        formGroup.append(buttonGroup);
        return formGroup;
    },

    _getBestReference: function(model) {
        return step.util.getPassageContainer(model.get("passageId")).find(".verseNumber").closest("a[name]").attr("name")
    },

    _getStats: function (statType, scope, sortType, callback) {
        var self = this;
        var model = step.util.activePassage();

        var modelReference = model.get("reference") || this._getBestReference(model);
        var modelVersion = model.get("masterVersion");
        var reference = (this.isNextChapter) ? this.transientReference || modelReference : modelReference;

        var scopeTypes = step.defaults.analysis.scopeType;
        if(scopeTypes.indexOf(scope) == -1) {
            scope = scopeTypes[0];
        }

        var mostOccurences = (sortType == "SORT_BY_REVERSED_FREQUENCY") ? false : true;
        this.statsContainer.empty();

        var lastTime = new Date().getTime();
        //console.log(new Date().getTime(), reference, "Wordle server call");
        var currentUserLang = (step.userLanguageCode) ? step.userLanguageCode.toLowerCase() : "en";
        $.getSafe(ANALYSIS_STATS, [modelVersion, reference, statType, scope, (this.isNextChapter), currentUserLang, mostOccurences], function (data) {
            //console.log(new Date().getTime(), "Wordle server data received");
            step.util.trackAnalyticsTime('wordle', 'loaded', new Date().getTime() - new Date().getTime());
            step.util.trackAnalytics('wordle', 'type', statType);
            step.util.trackAnalytics('wordle', 'scope', scope);
            self.transientReference = data.passageStat.reference.name;
            self._createWordleTab(self.statsContainer, scope, data.passageStat, statType, callback, data.lexiconWords, self.isNextChapter, self.transientReference);
        }).error(function() {
            changeBaseURL();
        });
        this.isNextChapter = false;
    },

    /**
     * Gets the stats for a passage and shows a wordle
     * @private
     */
    doStats: function () {
        //console.log(new Date().getTime(), "Doing stats");

        this._getStats(this.wordType.find(".selected").data("value"), this.wordScope.find(".selected").data("value"),  this.sortSelection.find(".selected").data("value"),  function (key, statType) {
            if (statType == 'WORD') {
                var args = "strong=" + encodeURIComponent(key);
                step.router.navigatePreserveVersions(args, false, true);
            } else if (statType == 'TEXT') {
                var args = "text=" + encodeURIComponent(key);
                step.router.navigatePreserveVersions(args, false, true);
            } else if (statType == 'SUBJECT') {
                var args = "subject=" + encodeURIComponent(key);
                step.router.navigatePreserveVersions(args, false, true);
            }
        });
    },

    /**
     * Creates a new wordle link
     * @param value the number of times a word occurs
     * @param scope the scope of the stat display (book/chapter/etc.)
     * @param lexiconWords the lexicon words
     * @param key the key, i.e. word, accented unicode, etc.
     * @returns {*|jQuery}
     */
    createWordleLink: function (key, value, scope, statType, lexiconWords, callback) {
        var analysisConstants = step.defaults.analysis;
        var scopeText = analysisConstants.scope[analysisConstants.scopeType.indexOf(scope)];
        var isLineBreakSelected = this.resultWithLineBreak.prop('checked')
        var relativeSize = (isLineBreakSelected) ? 10 : value[0];
        var wordLink = $("<a></a>")
            .attr('href', 'javascript:void(0)')
            .attr('rel', relativeSize);
        if (isLineBreakSelected) {
            if (statType == "WORD") wordLink.attr('title', sprintf(__s.stats_occurs_times_in_book_bible, value[1], value[2]));
        }
        else wordLink.attr('title', sprintf(__s.stats_occurs_times, value[0], scopeText));

        if (lexiconWords && lexiconWords[key]) {
            //assume key is a strong number
            var fontClass = step.util.ui.getFontForStrong(key);

            if (lexiconWords[key].matchingForm) {
                var ancientVocab = $("<span>" + lexiconWords[key].matchingForm +"</span>").addClass(fontClass);
                wordLink.append(ancientVocab);
                wordLink.append(' (');
                if (isLineBreakSelected) {
                    var transliteration = $("<i>" + lexiconWords[key].stepTransliteration + "</i>");
                    wordLink.append(transliteration);
                    wordLink.append(") ");
                    wordLink.append(lexiconWords[key].gloss);
                    wordLink.append(' - ');
                    wordLink.append(value[0]);
                    wordLink.append(__s.analyse_times);
                }
                else {
                        wordLink.append(lexiconWords[key].gloss);
                        wordLink.append(')');
                }
                wordLink.prop("strong", key);
            } else {
                    wordLink.append(lexiconWords[key].gloss);
                    wordLink.append(' - ');
                    wordLink.append(value[0]);
                    wordLink.append(' ');
                    wordLink.append(__s.analyse_times);
            }
        } else {
            wordLink.html(key);
            wordLink.append(' - ');
            wordLink.append(value[0]);
            wordLink.append(' ');
            wordLink.append(__s.analyse_times);
        }

        wordLink.attr("key", key);

        wordLink.click(function () {
            step.util.activePassage().save({strongHighlights: ""})
            callback(key, statType);
        });
        return wordLink;
    },

    /**
     * @param container the container where the content will be put
     * @param scope chapter/nearby chapter/book
     * @param title the title of the tab
     * @param wordleData the actual data to be rendered
     * @param statType WORD / SUBJECT/ TEXT
     * @param callback the callback when a word is clicked
     * @param lexiconWords the lexicon words
     * @private
     */
    _createWordleTab: function (container, scope, wordleData, statType, callback, lexiconWords, isNextChapter, passageScope) {
        var self = this;

        var strongs = []; //create order of strong numbers
		var displayScope = passageScope;
		if (scope == "BOOK") {
			displayScope = displayScope.replace(/\d+$/, "");
		}
        var scopeText = step.defaults.analysis.scope[step.defaults.analysis.scopeType.indexOf(scope)];
        
        $(container).append("<span style=\"font-size:150%;font-weight:bold\">" + displayScope + " (" + scopeText + "):</span><br><br>");
        $.each(wordleData.stats, function (key, value) {
            strongs.push(key);
        });

        if (this.sortSelection.find(".selected").data("value") === step.defaults.analysis.sortType[0]) {
            strongs.sort(function (a, b) {
				var diff = wordleData.stats[b][0] - wordleData.stats[a][0];
				if (diff == 0) {
					diff = wordleData.stats[b][1] - wordleData.stats[a][1];
					if (diff == 0) {
					    diff = wordleData.stats[b][2] - wordleData.stats[a][2];
                        if (diff == 0) diff = a.toLowerCase() < b.toLowerCase() ? -1 : 1;
                    }
				}
                return diff;
            });
        } else if (this.sortSelection.find(".selected").data("value") === step.defaults.analysis.sortType[1]) {
            strongs.sort(function (b, a) {
				var diff = wordleData.stats[b][0] - wordleData.stats[a][0];
				if (diff == 0) {
					diff = wordleData.stats[b][1] - wordleData.stats[a][1];
					if (diff == 0) {
					    diff = wordleData.stats[b][2] - wordleData.stats[a][2];
                        if (diff == 0) diff = b.toLowerCase() < a.toLowerCase() ? -1 : 1;
                    }
				}
                return diff;
            });
        }
        else {
            strongs.sort(function (a, b) {
                return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
            });
        }

        $("a", container).attr("rel", 0);

        $.each(strongs, function (index, key) {
            var value = wordleData.stats[key];

            var wordLink;

            //if we're still null, then create the link
            if (wordLink == null) {
                wordLink = self.createWordleLink(key, value, scope, statType, lexiconWords, callback);
                container.append(wordLink);
                if (self.resultWithLineBreak.prop('checked')) container.append("<br>");
                else container.append(" ");
            }
        });

        var links = $("a", container);
        links.tagcloud({
            size: {
                start: statType == "SUBJECT" ? self.minSubjectFont : self.minFont,
                end: self.maxFont,
                unit: "px"
            },
            animate: isNextChapter
        });

        if (statType === 'WORD') {
            links.hover(
                function () {
                    step.passage.higlightStrongs({
                        strong: $(this).prop("strong")
                    });
                }, function () {
                    step.passage.removeStrongsHighlights(step.passage.getPassageId(this));
                }
            );
        }

        if ( (scope === "CHAPTER") && (!wordleData.reference.lastChapter) ) {
            $("#nextChapterWordle").show();
            $("#nextChapterInputLine").show();
        }
        else {
            $("#nextChapterWordle").hide();
            $("#nextChapterInputLine").hide();
        }
        $("#newLineWordle").hide();
    }
});
