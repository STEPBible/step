var ViewLexiconWordle = Backbone.View.extend({
        events: {
        },
        minFont: 9,
        maxFont: 32,
        passageId: 0,

        initialize: function () {
            var self = this;
            this.wordStatsTab = $("#wordStat");
            this.wordStats = this.getCloudContainer(this.wordStatsTab);
            this.wordScope = this.wordStatsTab.find(".scope");
            this.wordType = this.wordStatsTab.find(".statKind");
            this.passageButtons = this.wordStatsTab.find(".passageSelector");
            this.sortCloud = this.wordStatsTab.find("#sortCloud");
            
            this.wordScope.prop("title", __s.stat_scope_explanation).qtip({
                position: { my: "bottom center", at: "top center", effect: false },
                hide: { event: 'blur' },
                show: { event: 'focus' }
            });

            this.populateMenu(step.defaults.analysis.scope, this.wordScope, false);
            this.populateMenu(step.defaults.analysis.kind, this.wordType, true);

            this.sortCloud.button({ label: __s.stat_sort_off }).click(function() {
                var button = $(this);
                if(button.prop('checked')) {
                    button.button("option", "label", __s.stat_sort_on);
                } else {
                    button.button("option", "label", __s.stat_sort_off);
                }
                self.doStats();
            });
            
            this.passageButtons.passageButtons({
                showReference: false,
                selectable: true,
                passageId: this.passageId,
                clickHandler: function () {
                    self.passageId = $(this).prop("passageId");
                    MenuModels.at(self.passageId).save({ selectedSearch : "SEARCH_PASSAGE" });
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
            this.listenTo(Backbone.Events, "passage:rendered:0", function() { this.doStats(PassageModels.at(0)); } );
            this.listenTo(Backbone.Events, "passage:rendered:1", function() { this.doStats(PassageModels.at(1)); } );
        },

        _getStats: function (statsContainer, statType, scope, title, callback, animate) {
            var self = this;
            var model = PassageModels.at(this.passageId);
            var reference = model.get("reference");

            if(!this.wordStats.is(":visible")) {
                return;
            }
            
            if(!animate) {
                statsContainer.empty();
            }

            //internationalized scopes:
            var index = step.defaults.analysis.scope.indexOf(scope);
            var scopeKey = step.defaults.analysis.scopeType[index];

            //internationalized type
            var typeIndex = step.defaults.analysis.kind.indexOf(statType);
            var typeKey = step.defaults.analysis.kindTypes[typeIndex];

            if(scopeKey == undefined) {
                reference = scope;
                scopeKey = step.defaults.analysis.kindTypes[step.defaults.analysis.kindTypes.length -1];
            }

            $.getSafe(ANALYSIS_STATS, [model.get("version"), reference, typeKey, scopeKey], function (data) {
                step.util.trackAnalytics('wordle', 'type', typeKey);
                step.util.trackAnalytics('wordle', 'scope', scopeKey);
                self._createWordleTab(statsContainer, scope, title, data.passageStat, typeKey, callback, data.lexiconWords, animate);
            });
        },

        animateWordle : function() {
              
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
            }, true);
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
            if(shouldSort) {
                strongs.sort(function(a,b) {
                    return wordleData.stats[b] - wordleData.stats[a]; 
                });
            }
            
            
            $.each(strongs, function (index, key) {
                var newKey = key;
                var value = wordleData.stats[key];
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

                container.append(wordLink);
                container.append(" ");
                wordLink.click(function () {
                    callback(key, statType);
                });
            });

            var links = $("a", container);
            links.tagcloud({
                size: {
                    start: self.minFont,
                    end: self.maxFont,
                    unit: "px"
                }
            });
            
            if(statType == 'WORD') {
                links.hover(
                    function() {
                        step.passage.higlightStrongs({
                            strong: $(this).prop("strong")
                        });
                    }, function() {
                        step.passage.removeStrongsHighlights(step.passage.getPassageId(this));
                    }
                );
            }
        }
    })
    ;