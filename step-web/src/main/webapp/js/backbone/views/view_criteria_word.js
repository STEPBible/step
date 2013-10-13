var WordCriteria = SearchCriteria.extend({
    initialize: function () {
        //first call parent
        SearchCriteria.prototype.initialize.call(this);

        this.originalAncient = this.$el.find(".originalAncient");
        this._displayCorrectOptions();
        this._setTitleFromTargetChange();
        this.autocomplete();
    },

    /**
     * Invoked because it is set up as a drop function
     */
    originalTypeChanged: function (currentElement, value) {
        this._displayCorrectOptions();
        this._setTitleFromTargetChange();
    },

    /**
     * Invoked because it is set up as a drop function
     */
    originalFormsChanged: function () {
        this._displayCorrectOptions();
    },

    /**
     * Updates the qtip title to display the correct message
     * @private
     */
    _setTitleFromTargetChange: function () {
        var value = this.viewElementsByName.originalType.val();

        switch (value) {
            case WORDS_MEANING[0] :
                this.viewElementsByName.originalWord.attr("title", WORDS_MEANING[1]);
                break;
            case GREEK_WORDS[0] :
                this.viewElementsByName.originalWord.attr("title", GREEK_WORDS[1]);
                break;
            case HEBREW_WORDS[0] :
                this.viewElementsByName.originalWord.attr("title", HEBREW_WORDS[1]);
                break;
        }
    },


    _displayCorrectOptions: function () {
        var currentType = this.viewElementsByName.originalType.val();

        var isMeaning = currentType == WORDS_MEANING[0];
        this.originalAncient.toggle(!isMeaning);
        this._displayCorrectGroupBy(currentType);
    },

    _displayCorrectGroupBy: function (currentType) {
        if (currentType == WORDS_MEANING[0]) {
            this.viewElementsByName.originalSorting.prop("disabled", false);
            return;
        }

        if (currentType == GREEK_WORDS[0] || currentType == HEBREW_WORDS[0]) {
            var kindOfForms = this.viewElementsByName.originalForms.val();
            if (kindOfForms == ALL_RELATED) {
                this.viewElementsByName.originalSorting.prop("disabled", false);
                return;
            }
        }
        this.viewElementsByName.originalSorting.prop("disabled", true);
    },

    autocomplete: function () {
        var self = this;
        $(this.viewElementsByName.originalWord).lexicalcomplete({
            minLength: 2,
            select: function (event, ui) {
                //manually change the text, so that the change() method can fire against the right version
                $(this).val(ui.item.value);
                $(this).change();
                $(this).trigger('keyup');
            },
            open: function (event, ui) {
                //check we've got the right size
                $(".ui-autocomplete").map(function () {
                    //check if 'this' has a child containing the text of the first option
                    $(this).css('width', '400px').css("overflow-x", "hidden");
                });
            },
            source: function (request, response) {
                var that = this;

                var searchType = self.viewElementsByName.originalType.val();
                var suggestionType = undefined;
                if (searchType == HEBREW_WORDS[0]) {
                    suggestionType = "hebrew";
                } else if (searchType == GREEK_WORDS[0]) {
                    suggestionType = "greek";
                } else if (searchType == WORDS_MEANING[0]) {
                    suggestionType = "meaning";
                }

                if (suggestionType == null) {
                    return response({});
                }

                $.getPassageSafe({
                    url: SEARCH_SUGGESTIONS,
                    args: [suggestionType,
                        encodeURIComponent(step.util.replaceSpecialChars(request.term)),
                        that.options.allForms
                    ],
                    callback: function (text) {
                        response($.map(text, function (item) {
                            return { label: "<span>" +
                                "<span class='" + (item.strongNumber[0] == 'H' ? 'hbFont ancientHbSearchSuggestion' : 'greekLanguage ancientSearchSuggestion') + " suggestionColumn'>" + item.matchingForm + "</span>" +
                                "<span class='suggestionColumn stepTransliteration'>" + step.util.ui.markUpTransliteration(item.stepTransliteration) + "</span>" +
                                "<span class='suggestionColumn'>" + item.gloss + "</span>" +
                                "</span>", value: suggestionType == "meaning" ? item.gloss : item.matchingForm };
                        }));
                    },
                    passageId: self.model.get("passageId"),
                    level: 'error'
                });
            }
        }).data("customLexicalcomplete")._renderItem = function (ul, item) {
            return $("<li></li>").data("ui-autocomplete-item", item).append("<a>" + item.label + "</a>").appendTo(ul);
        };

        this.viewElementsByName.originalWord.click(function () {
            $(this).lexicalcomplete("search");
        });

        $(this).hear("lexical-filter-change-" + self.model.get("passageId") , function () {
            self.viewElementsByName.originalWord.lexicalcomplete("search");
        });
    }
});
