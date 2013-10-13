var ViewLexiconWordle = Backbone.View.extend({
    events: {
    },
    minFont: 9,
    minSubjectFont : 12,
    maxFont: 32,
    passageId: 0,

    initialize: function () {
        var self = this;
        this.isAnimating = false;
        this.wordStatsTab = $("#wordStat");
        this.wordStats = this.getCloudContainer(this.wordStatsTab);
        this.wordScope = this.wordStatsTab.find(".scope");
        this.wordType = this.wordStatsTab.find(".statKind");
        this.passageButtons = this.wordStatsTab.find(".passageSelector");
        this.sortCloud = this.wordStatsTab.find("#sortCloud");
        this.animateCloud = this.wordStatsTab.find("#animateCloud");
        this.reference = this.wordStatsTab.find("#currentReference");
        
        this.wordScope.prop("title", __s.stat_scope_explanation).qtip({
            position: { my: "bottom center", at: "top center", effect: false },
            hide: { event: 'blur' },
            show: { event: 'focus' }
        });

        this.populateMenu(step.defaults.analysis.scope, this.wordScope, false);
        this.populateMenu(step.defaults.analysis.kind, this.wordType, true);

        this.sortCloud.button({ label: __s.stat_sort_off }).click(function () {
            self.sortCloudHandler();
            self.doStats();
        });

        this.animateCloud.button({ icons: { primary: "ui-icon-play" }, text : false }).click(function () {
            self.animateWordleHandler();
        });

        this.passageButtons.passageButtons({
            showReference: false,
            selectable: true,
            passageId: this.passageId,
            clickHandler: function () {
                self.passageId = $(this).prop("passageId");
                MenuModels.at(self.passageId).save({ selectedSearch: "SEARCH_PASSAGE" });
                self.doStats();
            }
        });


        this.listenToModels();
    },

    getCloudContainer: function (statsTab) {
        return statsTab.find(".cloudContainer");
    },

    populateMenu: function (data, inputBox, readOnly) {
        //get max length
        var self = this;
        var max = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].length > max) {
                max = data[i].length;
            }
        }

        step.util.ui.autocompleteSearch(
            inputBox,
            data,
            readOnly,
            undefined);
        inputBox.attr("size", max);
        inputBox.change(function () {
            self.doStats();
        });
    },

    listenToModels: function () {
        //update the model, in case we're not looking at the right one.
        this.listenTo(Backbone.Events, "passage:rendered:0", function () {
            this.doStats(PassageModels.at(0));
        });
        this.listenTo(Backbone.Events, "passage:rendered:1", function () {
            this.doStats(PassageModels.at(1));
        });
    },

    _getStats: function (statsContainer, statType, scope, title, callback, animate) {
        var self = this;
        var model = PassageModels.at(this.passageId);

        var modelReference = model.get("reference");
        var reference = this.isAnimating ? this.transientReference || modelReference : modelReference;

        if (!this.wordStats.is(":visible")) {
            return;
        }

        if (!animate) {
            statsContainer.empty();
        }

        //internationalized scopes:
        var index = step.defaults.analysis.scope.indexOf(scope);
        var scopeKey = step.defaults.analysis.scopeType[index];

        //internationalized type
        var typeIndex = step.defaults.analysis.kind.indexOf(statType);
        var typeKey = step.defaults.analysis.kindTypes[typeIndex];

        if (scopeKey == undefined) {
            reference = scope;
            scopeKey = step.defaults.analysis.kindTypes[step.defaults.analysis.kindTypes.length - 1];
        }

        $.getSafe(ANALYSIS_STATS, [model.get("version"), reference, typeKey, scopeKey, animate == true], function (data) {
            step.util.trackAnalytics('wordle', 'type', typeKey);
            step.util.trackAnalytics('wordle', 'scope', scopeKey);
            self.transientReference = data.passageStat.reference.name;
            self.reference.html(self.transientReference);
            
            //we're going to animate this, but we're going to finish and not keep going if the flag is set
            if(data.passageStat.reference.lastChapter) {
                self.animateWordleHandler();
            }
            
            self._createWordleTab(statsContainer, scope, title, data.passageStat, typeKey, callback, data.lexiconWords, animate);
        });
    },

    /**
     * Handles the sort button, but does not trigger a refresh - this is done in the caller method
     */
    sortCloudHandler : function() {
        if (this.sortCloud.prop('checked')) {
            this.sortCloud.button("option", "label", __s.stat_sort_on);
        } else {
            this.sortCloud.button("option", "label", __s.stat_sort_off);
        }
    },
    
    animateWordleHandler : function () {
        this.isAnimating = !this.isAnimating;
        if (this.isAnimating) {
            this.previousSortValue = this.sortCloud.prop('checked');
            this.sortCloud.prop("checked", true).button("disable");
            this.sortCloudHandler();
            this.sortCloud.button("refresh");
            
            this.previousScopeValue = this.wordScope.val();
            this.wordScope.val(step.defaults.analysis.scope[1]).prop("disabled", true);
            this.animateCloud.button("option", { icons: { primary: "ui-icon-pause"}});
            this.doStats();
        } else {
            this.sortCloud.prop("checked", this.previousSortValue || false).button("enable");
            this.sortCloudHandler();
            this.sortCloud.button("refresh");
            
            this.wordScope.val(this.previousScopeValue).prop("disabled", false);
            this.animateCloud.button("option", { icons: { primary: "ui-icon-play"}});
        }
        this.animateCloud.button("refresh").blur();
    },

    /**
     * Gets the stats for a passage and shows a wordle
     * @param passageId the passage ID
     * @param passageContent the passage Content
     * @param version the version
     * @param reference the reference
     * @private
     */
    doStats: function (model) {
        if (model) {
            //update passage id inline with the model, reflect changes on passage buttons
            this.passageId = model.get("passageId");
        }
        this.passageButtons.passageButtons("select", this.passageId);

        this._getStats(this.wordStats, this.wordType.val(), this.wordScope.val(), __s.word_cloud, function (key, statType) {
            var otherPassage = step.util.getOtherPassageId(step.lexicon.passageId);
            if (statType == 'WORD') {
                step.lexicon.sameWordSearch(key);
            } else if (statType == 'TEXT') {
                var textModel = SimpleTextModels.at(otherPassage);
                textModel.save({
                    detail: 0,
                    //exact words
                    simpleTextTypePrimary: step.defaults.search.textual.simpleTextTypesReference[2],
                    simpleTextCriteria: key
                });
                textModel.trigger("search", textModel, {});
                step.state.view.ensureTwoColumnView();
            } else if (statType == 'SUBJECT') {
                //first change the fieldset:
                var subjectModel = SubjectModels.at(otherPassage);
                subjectModel.save({
                    subjectText: key,
                    subjectSearchType: step.defaults.search.subject.subjectTypes[1],
                    subjectRelated: "",
                    detail: 0
                });

                subjectModel.trigger("search", subjectModel, {});
                step.state.view.ensureTwoColumnView();
            }
        }, this.isAnimating);
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
        var wordLink = $("<a></a>")
            .attr('href', 'javascript:void(0)')
            .attr('rel', value)
            .attr('title', sprintf(__s.stats_occurs_times, value, scope));

        if (lexiconWords && lexiconWords[key]) {
            //assume key is a strong number
            var fontClass = step.util.ui.getFontForStrong(key);

            if (lexiconWords[key].matchingForm) {
                wordLink.append(lexiconWords[key].gloss);
                var ancientVocab = $("<span></span>").addClass(fontClass).append(lexiconWords[key].matchingForm);
                wordLink.append(' (');
                wordLink.append(ancientVocab);
                wordLink.append(')');
                wordLink.prop("strong", key);
            } else {
                wordLink.append(lexiconWords[key].gloss);
            }
        } else {
            wordLink.html(key)
        }

        wordLink.attr("key", key);

        wordLink.click(function () {
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
     * @param animate - true to indicate previous results weren't cleared, and that an animation is required
     * @private
     */
    _createWordleTab: function (container, scope, title, wordleData, statType, callback, lexiconWords, animate) {
        var self = this;

        //create order of strong numbers
        var strongs = [];
        $.each(wordleData.stats, function (key, value) {
            strongs.push(key);
        });

        var shouldSort = this.sortCloud.prop("checked");
        if (shouldSort) {
            strongs.sort(function (a, b) {
                return wordleData.stats[b] - wordleData.stats[a];
            });
        } else {
            strongs.sort(function(a, b) {
                return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
            });
        }

        $("a", container).attr("rel", 0);

        $.each(strongs, function (index, key) {
            var value = wordleData.stats[key];

            var wordLink;
            if (animate) {
                //then try and find the link first
                var foundLink = $("[key='" + key + "']");
                if (foundLink.length > 0) {
                    wordLink = foundLink;
                    wordLink.attr('rel', value)
                        .attr('title', sprintf(__s.stats_occurs_times, value, scope));
                }
            }

            //if we're still null, then create the link
            if (wordLink == null) {
                wordLink = self.createWordleLink(key, value, scope, statType, lexiconWords, callback);

                //we set the font size to 0
                if (animate) {
                    wordLink.css("font-size", 0);
                }
                container.append(wordLink);
                container.append(" ");
            }
        });

        var links = $("a", container);
        links.tagcloud({
            size: {
                start: statType == "SUBJECT" ? self.minSubjectFont : self.minFont,
                end: self.maxFont,
                unit: "px"
            },
            animate: animate
        });

        if (statType == 'WORD') {
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

        //base it on the isAnimating rather than passed in value
        if (this.isAnimating) {
            delay(function () {
                self.doStats();
            }, 3500);
        }
    }
});
