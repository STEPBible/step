var MainSearchView = Backbone.View.extend({
    el: ".search-form",
    events: {
        "click .find ": "search",
        "click #openNewPanel": "openNewPanel"
    },
    //context items are of the form { itemType: x, value: y }
    specificContext: [],
    initialize: function () {
        var self = this;
        this.masterSearch = this.$el.find("#masterSearch");
        this.openNewColumn = this.$el.find("#openNewPanel");
        this.specificContext = [];

        var view = this;
        _.bindAll(this);
        _.bindAll(view);
        this.listenTo(step.passages, "sync-update", this.syncWithUrl);
        this.listenTo(Backbone.Events, "search:add", this._appendVersions);
        this.listenTo(Backbone.Events, "search:remove", this._removeVersion);

        this.masterSearch.select2({
            minimumInputLength: 2,
            id: function (entry) {
                var id = entry.itemType + "-";
                switch (entry.itemType) {
                    case REFERENCE:
                        id += entry.item.fullName;
                        break;
                    case VERSION:
                        id += entry.item.shortInitials;
                        break;
                    case GREEK:
                    case GREEK_MEANINGS:
                    case HEBREW_MEANINGS:
                    case HEBREW:
                        //for these searches, we prevent multiple searches for the same strong number
                        //and therefore share an id.
                        id += entry.item.strongNumber;
                        break;
                    //some searches default to their item
                    case TEXT_SEARCH:
                    case SUBJECT_SEARCH:
                        id += (entry.item.searchTypes || []).join("-") + ":" + entry.item.value;
                        break;
                    case SYNTAX:
                        id += entry.value;
                        break;
                    case MEANINGS:
                    case TOPIC_BY_REF:
                    case RELATED_VERSES:
                    default:
                        id += entry.item;
                        break;
                }
                return id;
            },
            formatInputTooShort: function (input, min) {

                var n = min - input.length;
                var message = sprintf(__s.x_more_characters, n, (n == 1 ? "" : __s.characters_plural));
                var labels = $("<span>").addClass("searchLabel")
                    .append($("<a>").attr("data-toggle", "modal").attr("data-target", "#bibleVersions").append(__s.all_versions).attr("title", __s.all_versions)
                        .on("click", function () {
                            require(["menu_extras"], function () {
                                new PickBibleView({ model: step.settings, searchView: view });
                            });
                        })).append($("<a>").append(__s.pick_passage).on('click', function () {
                        require(["menu_extras"], function () {
                            console.log("hi - pick passage");
                        });
                    })).append($("<a>").append(__s.search_advanced).on('click', function () {
                        require(["menu_extras", "defaults"], function () {
                            //find master version
                            var dataItems = self.masterSearch.select2("data");
                            var masterVersion = REF_VERSION;
                            for (var i = 0; i < dataItems; i++) {
                                if (dataItems[i].itemType == VERSION) {
                                    masterVersion = dataItems[i].item.initials;
                                    break;
                                }
                            }

                            new AdvancedSearchView({ searchView: view, masterVersion: masterVersion });
                        });
                    }));
                var container = $("<span>").append(labels).append($('<span class="message">').append(message));
                return  container;
            },
            ajax: {
                url: function (term, page) {
                    var url = SEARCH_AUTO_SUGGESTIONS + term;
                    var contextArgs = "";
                    if (self.specificContext.length != 0) {
                        for (var i = 0; i < self.specificContext.length; i++) {
                            contextArgs += self.specificContext[i].itemType + "=" + self.specificContext[i].value;
                            if (i < self.specificContext.length) {
                                contextArgs += '|';
                            }
                        }
                    }
                    return url + "/" + encodeURIComponent(contextArgs);
                },
                dataType: "json",
                quietMillis: KEY_PAUSE,
                cache: true,
                results: function (data, page) {
                    var datum = [];
                    for (var ii = 0; ii < data.length; ii++) {
                        var itemAndText = view.convertResultTermToTypedOptions(data[ii], datum);

                        datum.push({
                            text: itemAndText.text,
                            item: itemAndText.item,
                            itemType: data[ii].itemType });
                    }
                    return { results: view.patch(datum) };
                }
            },

            multiple: true,
            formatResult: view.formatResults,
            matcher: view.matchDropdownEntry,
            /**
             * Formats the entry in the multi-select text input, once selected from the dropdown.
             * @param entry
             * @returns {*}
             */
            formatSelection: function (entry) {
                switch (entry.itemType) {
                    case REFERENCE:
                        return entry.item.shortName;
                    case VERSION:
                        return "<div class='versionItem'>" + entry.item.shortInitials + "</div>"
                    case GREEK:
                    case HEBREW:
                        var className = entry.itemType == GREEK ? "unicodeFont" : "hbFontMini";
                        return "<div class='" + className + "' title='" + entry.item.gloss + ", " + entry.item.stepTransliteration + "'>" + entry.item.matchingForm + "</div>";
                    case GREEK_MEANINGS:
                    case HEBREW_MEANINGS:
                        return "<div title='" + entry.item.gloss + ", " + entry.item.matchingForm + "'>" + entry.item.stepTransliteration + "</div>";
                    case MEANINGS:
                        return entry.item.gloss;
                    case SUBJECT_SEARCH:
                        return entry.item.value;
                    case TEXT_SEARCH:
                        return entry.item;
                    case SYNTAX:
                        return '<div title="' + entry.item.value + '">' + entry.item.text + "</div>";
                    default:
                        return entry.item.text;
                }
            },
            escapeMarkup: function (m) {
                return m;
            },
            formatResultCssClass: view.formatResultCssClass,
            formatSelectionCssClass: view.formatResultCssClass
        }).on("select2-selecting", function (event) {
            if (event.object && event.object.itemType == REFERENCE && event.object.item.wholeBook && !event.object.itemSubType) {
                event.preventDefault();
                var select2Input = $(this);
                self._addSpecificContext(REFERENCE, event.object.item.shortName);

                //wipe the last term to force a re-select
                $.data(self.masterSearch.select2("container"), "select2-last-term", null);
                select2Input.select2("search", event.object.item.shortName);
            } else if (event.object.item.grouped) {
                event.preventDefault();
                var select2Input = $(this);
                $.data(self.masterSearch.select2("container"), "select2-last-term", null);
                self._addSpecificContext(LIMIT, event.object.itemType);
                select2Input.select2("search", self.getCurrentInput());
                select2Input.select2("container").find("input").focus();
            }
            return;
        }).on("select2-opening", function (event) {
            //remove any context that has references
            self._removeSpecificContext([REFERENCE, VERSION, LIMIT]);

            //add the first version selected to the context
            var data = self.masterSearch.select2("data") || [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].itemType == VERSION) {
                    self._addSpecificContext(VERSION, data[i].item.initials);
                    break;
                }
            }
        });

        this.masterSearch.select2("container").find("input[type='text']").on("keyup", this._handleKeyPressInSearch);
    },
    convertResultTermToNormalOption: function (termSuggestion, datum) {
        var text = termSuggestion;
        var item = termSuggestion;


        //will never be a TEXT or a SYNTAX autocompletion? search, so not in the list below
        switch (termSuggestion.itemType) {
            case HEBREW:
            case GREEK:
                text = this._getAncientFirstRepresentation(termSuggestion.suggestion, termSuggestion.itemType == HEBREW);
                break;
            case GREEK_MEANINGS:
            case HEBREW_MEANINGS:
                text = this._getEnglishFirstRepresentation(termSuggestion.suggestion, termSuggestion.itemType == HEBREW_MEANINGS);
                break;
            case REFERENCE:
                //for a reference that is a whole book, we push an extra one in
                text = termSuggestion.suggestion.fullName;
                item = termSuggestion;

                if (termSuggestion.suggestion.wholeBook) {
                    //allow selection of whole book
                    datum.push({ text: termSuggestion.suggestion.fullName, item: termSuggestion.suggestion, itemType: termSuggestion.itemType,
                        itemSubType: 'bookSelection' });
                }
                break;
            case SUBJECT_SEARCH:
                text = termSuggestion.suggestion.value;
                break;
        }

//        console.log(termSuggestion.itemType, termSuggestion, text, item.suggestion);
        return {text: text, item: item.suggestion };
    },
    convertResultToGroup: function (item) {
        var returnedItem = item;
        this.setGroupText(returnedItem);

        return { text: returnedItem.text, item: returnedItem };
    },
    convertResultTermToTypedOptions: function (termSuggestion, datum) {
        if (termSuggestion.grouped) {
            return this.convertResultToGroup(termSuggestion);
        }

        return this.convertResultTermToNormalOption(termSuggestion, datum);
    },
    setGroupText: function (item) {
        item.text = item.maxReached ? sprintf(__s.options_number_of_terms_max, 50, item.count) : sprintf(__s.options_number_of_terms, item.count);
    },
    openNewPanel: function () {
        //if we're wanting a new column, then create it right now
        step.util.createNewColumn();
    },
    _getAncientFirstRepresentation: function (item, hebrew) {
        return '<span class="' + (hebrew ? 'hbFontMini' : 'unicodeFontMini') + '">' + item.matchingForm + "</span> (" + item.stepTransliteration + " - " + item.gloss + ")";
    },
    _getEnglishFirstRepresentation: function (item, hebrew) {
        return item.gloss + " (" + item.stepTransliteration + " - " + '<span class="' + (hebrew ? 'hbFontMini' : 'unicodeFontMini') + '">' + item.matchingForm + "</span>)";
    },
    _getCurrentInitials: function () {
        var data = this.masterSearch.select2("data");
        var initials = [];
        for (var i = 0; i < data.length; i++) {
            initials.push(data[i].item.shortInitials);
        }
        return initials;
    },
    _appendVersions: function (data) {
        var originalData = this.masterSearch.select2("data");
        originalData.push({ item: data.value, itemType: data.itemType});
        this.masterSearch.select2("data", originalData);
    },
    _removeVersion: function (data) {
        //find the element
        var versions = this.masterSearch.select2("data");
        for (var i = 0; i < versions.length; i++) {
            if (versions[i].item.initials == data.value.initials || versions.shortInitials == data.value.initials) {
                versions.splice(i, 1);
                i--;
            }
        }
        this.masterSearch.select2("data", versions);
    },
    search: function () {
        console.log("Searching...");
        var options = this.masterSearch.select2("data");
        var args = "";
        for (var ii = 0; ii < options.length; ii++) {
            if (args.length != 0) {
                args += "|";
            }

            switch (options[ii].itemType) {
                case VERSION:
                    args += options[ii].itemType + "=";
                    args += encodeURIComponent(options[ii].item.shortInitials);
                    break;
                case REFERENCE:
                    args += options[ii].itemType + "=";
                    args += encodeURIComponent(options[ii].item.shortName);
                    break;
                case GREEK:
                case GREEK_MEANINGS:
                case HEBREW:
                case HEBREW_MEANINGS:
                    args += STRONG_NUMBER + "=" + encodeURIComponent(options[ii].item.strongNumber);
                    break;
                case MEANINGS:
                    args += MEANINGS + "=" + encodeURIComponent(options[ii].item.gloss);
                    break;
                case SUBJECT_SEARCH:
                    var lastSelection = step.util.activePassage().get("subjectSearchType");
                    var selectedSubjectSearchType = "";
                    var previouslySelectedIndex = options[ii].item.searchTypes.indexOf(lastSelection);
                    if (previouslySelectedIndex != -1) {
                        //use the last selection
                        selectedSubjectSearchType = options[ii].item.searchTypes[previouslySelectedIndex];
                    } else {
                        //use the first item
                        selectedSubjectSearchType = options[ii].item.searchTypes[0];
                    }

                    switch (selectedSubjectSearchType) {
                        case "SUBJECT_SIMPLE":
                            args += SUBJECT_SEARCH;
                            break;
                        case "SUBJECT_EXTENDED":
                            args += NAVE_SEARCH;
                            break;
                        case "SUBJECT_FULL":
                            args += NAVE_SEARCH_EXTENDED;
                            break;
                        default:
                            args += options[ii].itemType + "=" + encodeURIComponent(options[ii].item);
                    }
                    args += "=" + encodeURIComponent(options[ii].item.value);
                    break;
                case TOPIC_BY_REF:
                case RELATED_VERSES:
                    args += options[ii].itemType + "=" + encodeURIComponent(options[ii].item.text);
                    break;
                case SYNTAX:
                    args += options[ii].itemType + "=" + encodeURIComponent(options[ii].item.value);
                    break;
                case TEXT_SEARCH:
                default:
                    args += options[ii].itemType + "=" + encodeURIComponent(options[ii].item);
                    break;
            }
        }

        //reset defaults:
        step.util.activePassage().save({ pageNumber: 1, filter: null, strongHighlights: null }, { silent: true});
        console.log("Arguments are: ", args);
        step.router.navigateSearch(args);
    },
    getCurrentInput: function () {
        return this.masterSearch.select2("container").find(".select2-input").val();
    },
    patch: function (results) {
        //check we don't have a limit:
        var includeEverything = true;
        var limit = null;
        for (var i = 0; i < this.specificContext.length; i++) {
            if (this.specificContext[i].itemType == LIMIT) {
                includeEverything = false;
                limit = this.specificContext[i].value;
            }
        }

        var staticResources = [];
        if (includeEverything) {
            staticResources = this._getData();
            //push some of the options that are also always present:
            staticResources.push({ item: this.getCurrentInput(), itemType: TEXT_SEARCH});
            staticResources.push({ item: {"shortName": this.getCurrentInput(), "fullName": this.getCurrentInput(), "wholeBook": false }, itemType: REFERENCE, itemSubType: 'freeInput' });
        } else if(limit == VERSION) {
            staticResources = this._getData(limit);
        }
        return staticResources.concat(results);
    },
    _getData: function (limit) {
        return this.filterLocalData(limit);
    },
    matchDropdownEntry: function (term, textOrObject) {
        if (step.util.isBlank(textOrObject)) {
            return false;
        }

        var regex = new RegExp("\\b" + term, "ig");
        if ($.type(textOrObject) === "string") {
            return textOrObject != null && textOrObject != "" && textOrObject.toLowerCase().match(regex);
        }

        switch (textOrObject.itemType) {
            case VERSION:
                var matches = this.matchDropdownEntry(term, textOrObject.item.name || "");
                return matches;
            case GREEK_MEANINGS:
            case HEBREW_MEANINGS:
                return this.matchDropdownEntry(term, textOrObject.item.gloss);
            case GREEK:
            case HEBREW:
                return this.matchDropdownEntry(term, textOrObject.item.stepTransliteration) ||
                    this.matchDropdownEntry(term, textOrObject.item.matchingForm) ||
                    this.matchDropdownEntry(term, textOrObject.item.strongNumber);
            case SUBJECT_SEARCH:
                return this.matchDropdownEntry(term, textOrObject.item.value);
            case TEXT_SEARCH:
                return this.matchDropdownEntry(term, textOrObject.item);
        }
        return false;
    },
    _addSpecificContext: function (itemType, value) {
        this._removeSpecificContext(itemType);
        this.specificContext.push({ itemType: itemType, value: value });
    },
    /**
     * Removes all contexts of a particular type
     * @param itemType the item type, or array of item types
     * @private
     */
    _removeSpecificContext: function (itemType) {
        if (itemType == null) {
            itemType = [];
        } else if (!$.isArray(itemType)) {
            itemType = [itemType];
        }

        for (var i = 0; i < this.specificContext.length; i++) {
            if (itemType.indexOf(this.specificContext[i].itemType) != -1) {
                this.specificContext.splice(i, 1);
                //i will be incremented, so keep it in sync with for loop increment
                i--;
            }
        }
    },
    filterLocalData: function (limit) {
        var options = [];

        //we will only add stuff if there is no specific context around references
        for (var i = 0; i < this.specificContext.length; i++) {
            if (this.specificContext[i].itemType == REFERENCE) {
                return options;
            }
        }

        var currentInput = (this.getCurrentInput() || "").toLowerCase();
        var exactInitials = [];
        var prefixInitials = [];
        var others = [];

        var totalNotDisplayed = 0;
        for (var ii = 0; ii < step.itemisedVersions.length; ii++) {
            var currentVersion = step.itemisedVersions[ii];
            var short = (currentVersion.item.shortInitials || "").toLowerCase();
            var initials = (currentVersion.item.initials || "").toLowerCase();

            if ((initials != "" && initials == currentInput) || (short != "" && short == currentInput)) {
                exactInitials.push(currentVersion);
            } else if (short.startsWith(currentInput) || initials.startsWith(currentInput)) {
                prefixInitials.push(currentVersion);
            } else if (this.matchDropdownEntry(currentInput, currentVersion)) {
                if (limit == VERSION || exactInitials.length + prefixInitials.length < 3) {
                    others.push(step.itemisedVersions[ii]);
                } else {
                    totalNotDisplayed++;
                }
            }
        }


        options = options.concat(exactInitials);
        options = options.concat(prefixInitials);

        if (options.length < 3) {
            options = options.concat(others.splice(0, 3 - options.length));
        }

        if (totalNotDisplayed > 0) {
            var groupedItem = { item: {}, grouped: true, count: totalNotDisplayed, maxReached: false };
            this.setGroupText(groupedItem);
            options.push( { text: groupedItem.text, item: groupedItem, itemType: VERSION });
        }

        return options;
    },
    formatResultCssClass: function (item) {
        return "select-" + item.itemType;
    },
    getSource: function (itemType) {
        var source;
        switch (itemType) {
            case VERSION:
                source = __s.translation_commentary;
                break;
            case GREEK:
                source = __s.search_greek;
                break;
            case GREEK_MEANINGS:
                source = row = __s.search_greek_meaning;
                break;
            case HEBREW:
                source = __s.search_hebrew;
                break;
            case HEBREW_MEANINGS:
                source = __s.search_hebrew_meaning;
                break;
            case REFERENCE:
                source = __s.bible_text;
                break;
            case SUBJECT_SEARCH:
                source = __s.search_topic;
                break;
            case MEANINGS:
                source = __s.search_meaning;
                break;
            case SYNTAX:
                source = __s.query_syntax;
                break;
            case TEXT_SEARCH:
                source = __s.search_text;
        }
        return '<span class="source">[' + source + ']</span>';
    },
    /**
     * Renders the view when shown in the dropdown list
     *
     * @param v the item we are rendering
     * @param container
     * @param query
     * @param escapeMarkup
     * @returns {string}
     */
    formatResults: function (v, container, query, escapeMarkup) {
        var source = this.getSource(v.itemType);
        var row;

        if (v.item.grouped) {
            return "<span class='glyphicon glyphicon-chevron-right'></span> " + source + v.item.text;
        }

        switch (v.itemType) {
            case VERSION:
                row = [
                    '<div class="versionItem">',
                    source,
                        '<span class="features">' + step.util.ui.getFeaturesLabel(v.item) + '</span>',
                        '<span class="initials">' + v.item.shortInitials + '</span> - ',
                        '<span class="name">' + v.item.name + '</span>',
                    '</div>'
                ].join('');
                break;
            case GREEK:
                row = source + this._getAncientFirstRepresentation(v.item, false);
                break;
            case GREEK_MEANINGS:
                row = source + this._getEnglishFirstRepresentation(v.item, false);
                break;
            case HEBREW:
                row = source + this._getAncientFirstRepresentation(v.item, true);
                break;
            case HEBREW_MEANINGS:
                row = source + this._getEnglishFirstRepresentation(v.item, true);
                break;
            case REFERENCE:
                var refSource = __s.bible_text;
                if (v.itemSubType == 'bookSelection') {
                    refSource = __s.bible_text;
                } else if (v.itemSubType == 'freeInput') {
                    refSource = __s.bible_text_free_entry;
                } else if (!v.itemSubType && v.item.wholeBook) {
                    refSource = __s.bible_text_chapters;
                }

                row = ['<span class="source">[' + refSource + ']</span>',
                    v.item.fullName
                ].join('');
                break;
            case TEXT_SEARCH:
                row = [source,
                    v.item
                ].join('');
                break;
            case SUBJECT_SEARCH:
                var features = "";

                for (var i = 0; i < v.item.searchTypes.length; i++) {
                    switch (v.item.searchTypes[i]) {
                        case 'SUBJECT_SIMPLE':
                            features += '<span title="' + __s.search_subject_esv_headings + '">' + __s.search_subject_esv_headings_initials + '</span> ';
                            break;
                        case 'SUBJECT_EXTENDED':
                            features += '<span title="' + __s.search_subject_nave + '">' + __s.search_subject_nave_initials + '</span> ';
                            break;
                        case 'SUBJECT_FULL':
                            features += '<span title="' + __s.search_subject_nave_extended + '">' + __s.search_subject_nave_extended_initials + '</span> ';
                            break;
                    }
                }
                row = source + '<span class="features">' + features + '</span>' + v.item.value + '</div>';
                break;
            case MEANINGS:
                row = source + v.item.gloss;
                break;
            case SYNTAX:
                row = source + v.item.value;
                break;
        }
        var markup = [];
        window.Select2.util.markMatch(row, "unlikelytomatch" + query.term, markup, escapeMarkup);
        return markup.join("");
    },

    _getPartialToken: function (initialData, tokenItem) {
        var tokenType = tokenItem.tokenType;
        var token = tokenItem.token || "";
        var enhancedInfo = tokenItem.enhancedTokenInfo;

        switch (tokenType) {
            case VERSION:
                return step.keyedVersions[token];
            case REFERENCE:
                return { fullName: enhancedInfo.name, shortName: enhancedInfo.name };
            case GREEK_MEANINGS:
            case GREEK:
            case HEBREW_MEANINGS:
            case HEBREW:
            case STRONG_NUMBER:
                //we need to work out what kind of type this was before
                for (var ii = 0; ii < initialData.length; ii++) {
                    var previousType;
                    if (initialData[ii].item && initialData[ii].item.strongNumber == token) {
                        //we're a winner
                        tokenItem.tokenType = initialData[ii].itemType;
                    }
                }

                //else default to something (in the future, we may change the URLs
                if (token.length > 0 && token[0] == 'G') {
                    tokenItem.tokenType = GREEK_MEANINGS;
                } else {
                    tokenItem.tokenType = HEBREW_MEANINGS;
                }

                return enhancedInfo;
            case SUBJECT_SEARCH:
                return { value: token, searchTypes: ["SUBJECT_SIMPLE"] };
            case NAVE_SEARCH:
                return { value: token, searchTypes: ["SUBJECT_EXTENDED"] };
            case NAVE_SEARCH_EXTENDED:
                return { value: token, searchTypes: ["SUBJECT_FULL"] };
            case TOPIC_BY_REF:
            case RELATED_VERSES:
                return { text: token };
            case MEANINGS:
                return { gloss: token };
            case TEXT_SEARCH:
            case SYNTAX:
                return enhancedInfo == null ? {text: "&lt;...&gt;", value: token} : {text: enhancedInfo, value: "&lt;" + enhancedInfo + "...&gt;"};
            default:
                return token;
        }
    },
    _reconstructToken: function (initialData, tokens, i) {
        var item = this._getPartialToken(initialData, tokens[i]);
        var tokenType = tokens[i].tokenType;
        switch (tokenType) {
            case SUBJECT_SEARCH:
            case NAVE_SEARCH:
            case NAVE_SEARCH_EXTENDED:
                tokenType = SUBJECT_SEARCH;
                break;
        }

        return { item: item, itemType: tokenType };
    },
    syncWithUrl: function (model) {
        if (model == null) {
            model = step.util.activePassage();
        }

        var initialData = this.masterSearch.select2("data");

        //overwrite all the data
        var data = [];
        var tokens = model.get("searchTokens") || [];
        for (var i = 0; i < tokens.length; i++) {
            //check if the tokens are in the search box already... if so, then don't add them
            data.push(this._reconstructToken(initialData, tokens, i));
        }
        this.masterSearch.select2("data", data);
    },
    _handleKeyPressInSearch: function (ev) {
        if (ev.keyCode == 13) {
            //check whether the container is open
            if ($(".select2-result-selectable").length == 0) {
                // trigger search
                this.search();
            }
        }
    }
});