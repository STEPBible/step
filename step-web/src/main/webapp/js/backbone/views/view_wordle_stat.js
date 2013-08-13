var ViewLexiconWordle = Backbone.View.extend({
    events: {
    },
    minFont : 8,
    maxFont : 32,
    scope : __s.stats_scope_chapter,

    initialize: function () {
        this.wordStats = $("#wordStat");
        this.textStats = $("#textStat");
        this.subjectStats = $("#subjectStat");
        this.lastReference = undefined;

        var self = this;
        $("#lexiconDefinitionHeader").find(".statTab").click(function() {
            self._doStats();
        });

        this.relistenToModel();
    },

    relistenToModel : function() {
        //update the model, in case we're not looking at the right one.
        this.stopListening(this.model);
        this.model = PassageModels.at(step.lexicon.passageId);
        this.listenTo(this.model, "change:reference", this._doStats);
    },

    /**
     * Gets the stats for a passage and shows a wordle
     * @param passageId the passage ID
     * @param passageContent the passage Content
     * @param version the version
     * @param reference the reference
     * @private
     */
    _doStats: function () {

        var self = this;
        var reference = this.model.get("reference");
        if(reference == this.lastReference) {
            return;
        }

        this.wordStats.empty();
        this.textStats.empty();
        this.subjectStats.empty();

        $.getSafe(ANALYSIS_STATS, [this.model.get("version"), reference], function(data) {
            self._createWordleTab(self.wordStats, data.strongsStat, data.lexiconWords);
            self._createWordleTab(self.textStats, data.wordStat);
            self._createWordleTab(self.subjectStats, data.subjectStat);
        });
        this.lastReference = reference;
    },

    _createWordleTab : function(tabContainer, wordleData, lexiconWords) {
        var self = this;
        var container = $("<div></div>");
        var added = false;

        $.each(wordleData.stats, function(key, value) {
            var newKey = key;
            var wordLink = $("<a></a>")
                .attr('href', '#')
                .attr('rel', value)
                .attr('title', sprintf(__s.stats_occurs_times, value, self.scope));

            if(lexiconWords) {
                //assume key is a strong number
                var fontClass = step.util.ui.getFontForStrong(key);

                if(lexiconWords[key].matchingForm) {
                    wordLink.append(lexiconWords[key].gloss);
                    var ancientVocab = $("<span></span>").addClass(fontClass).append(lexiconWords[key].matchingForm);
                    wordLink.append(' (');
                    wordLink.append(ancientVocab);
                    wordLink.append(')');
                } else {
                    wordLink.append(lexiconWords[key].gloss);
                }
            } else {
                wordLink.html(key)
            }

            container.append(wordLink);
            container.append(" ");
            added = true;
        });

        $("a", container).tagcloud({
            size : {
                start : self.minFont,
                end: self.maxFont,
                unit : "px"
            },
            color : {
                start : "#000",
                end : "#33339F"
            }
        });

        if(added) {
            tabContainer.append(container);
        } else {
            //remove header
            tabContainer.hide();
        }
    }
});