var MainSearchView = Backbone.View.extend({
    el: ".search-form",
    events: {
        "click .btn": "search"
    },
    initialize: function () {
        this.masterSearch = this.$el.find("#masterSearch");
        this.openNewColumn = this.$el.find("#openInNewPanel");

        var view = this;
        _.bindAll(this);
        _.bindAll(view);
        this.listenTo(step.passages, "sync-update", this.syncWithUrl);
        this.listenTo(Backbone.Events, "search:add", this._appendVersions);
        this.listenTo(Backbone.Events, "search:remove", this._removeVersion);

        this.masterSearch.select2({
            minimumInputLength: 3,
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
                    case MEANINGS:
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
                        })).append($("<a>").append(__s.pick_passage).click(function () {
                        alert('hello2');
                    })).append($("<a>").append(__s.search_advanced).click(function () {
                        alert("'advanced searched'");
                    }));
                var container = $("<span>").append(labels).append(message);
                return  container;
            },
            ajax: {
                url: function (term, page) {
                    return SEARCH_AUTO_SUGGESTIONS + term;
                },
                dataType: "json",
                quietMillis: 200,
                cache: true,
                results: function (data, page) {
                    var datum = [];
                    for (var ii = 0; ii < data.length; ii++) {
                        //will never be a TEXT search, so not in the list below
                        //SUBJECT searches behave with defaults
                        var item = data[ii].suggestion;
                        var text = data[ii].suggestion;

                        switch (data[ii].itemType) {
                            case HEBREW:
                            case GREEK:
                                text = view._getAncientFirstRepresentation(data[ii].suggestion, data[ii].itemType == HEBREW);
                                break;
                            case GREEK_MEANINGS:
                            case HEBREW_MEANINGS:
                                text = view._getEnglishFirstRepresentation(data[ii].suggestion, data[ii].itemType == HEBREW_MEANINGS);
                                break;
                            case REFERENCE:
                                text = data[ii].suggestion.fullName;
                                item = data[ii].suggestion;
                                break;
                        }

                        datum.push({ text: text, item: item, itemType: data[ii].itemType });
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
                    case TEXT_SEARCH:
                    case SUBJECT_SEARCH:
                        return entry.item;
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
            if (event.object && event.object.itemType == REFERENCE && event.object.item.wholeBook) {
                event.preventDefault();
                var select2Input = $(this);
                select2Input.select2("search", event.object.item.shortName);
            }
            return;
        });
        
        this.masterSearch.select2("container").find("input[type='text']").on("keyup", this._handleKeyPressInSearch);
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
        originalData.push({ item: data.version, itemType: 'version'});
        this.masterSearch.select2("data", originalData);
    },
    _removeVersion: function (data) {
        //find the element
        var versions = this.masterSearch.select2("data");
        for (var i = 0; i < versions.length; i++) {
            if (versions[i].item.initials == data.version.initials || versions.shortInitials == data.version.initials) {
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
                    switch(step.util.activePassage().get("subjectSearchType")) {
                        case "SUBJECT_SIMPLE": args += SUBJECT_SEARCH + "=" + encodeURIComponent(options[ii].item);break;   
                        case "SUBJECT_EXTENDED": args += NAVE_SEARCH + "=" + encodeURIComponent(options[ii].item);break;   
                        case "SUBJECT_FULL":args += NAVE_SEARCH_EXTENDED + "=" + encodeURIComponent(options[ii].item); break;
                        default: args += options[ii].itemType + "=" + encodeURIComponent(options[ii].item);
                    }
                    break;
                case TEXT_SEARCH:
                default:
                    args += options[ii].itemType + "=" + encodeURIComponent(options[ii].item);
                    break;
            }
        }

        //reset defaults:
        step.util.activePassage().save({ pageNumber: 1, filter: undefined }, { silent: true});
        console.log("Arguments are: ", args);

        //if we're wanting a new column, then create it right now
        if (this.openNewColumn.prop("checked")) {
            step.util.createNewColumn();
        }

        step.router.navigateSearch(args);
    },
    getCurrentInput: function () {
        return this.masterSearch.select2("container").find(".select2-input").val();
    },
    patch: function (results) {
        var staticResources = this._getData();

        //push some of the options that are also always present:
        staticResources.push({ item: this.getCurrentInput(), itemType: TEXT_SEARCH});

        return staticResources.concat(results);
    },
    _getData: function () {
        return this.filterLocalData();
    },
    matchDropdownEntry: function (term, textOrObject) {
        var regex = new RegExp("\\b" + term, "ig");
        if ($.type(textOrObject) === "string") {
//            console.log("TERM TERM TERM", term, "TEXT", textOrObject);
            return textOrObject != null && textOrObject != "" && textOrObject.toLowerCase().match(regex);
        }

        switch (textOrObject.itemType) {
            case VERSION:
//                console.log("Term: ", term, "Text or Object:", textOrObject.item.initials, textOrObject.item.shortInitials, textOrObject.item.name)
                var matches = this.matchDropdownEntry(term, textOrObject.item.initials) ||                 
                    this.matchDropdownEntry(term, textOrObject.item.shortInitials) ||
                    this.matchDropdownEntry(term, textOrObject.item.name);
                return matches;
            case GREEK_MEANINGS:
            case HEBREW_MEANINGS:
                return this.matchDropdownEntry(term, textOrObject.item.gloss);
            case GREEK:
            case HEBREW:
                return this.matchDropdownEntry(term, textOrObject.item.stepTransliteration) ||
                    this.matchDropdownEntry(term, textOrObject.item.matchingForm) ||
                    this.matchDropdownEntry(term, textOrObject.item.strongNumber);
            case TEXT_SEARCH:
            case SUBJECT_SEARCH:
                return this.matchDropdownEntry(term, textOrObject.item);
        }
        return false;
    },
    filterLocalData: function () {
        var options = [];

        var currentInput = this.getCurrentInput();
        for (var ii = 0; ii < step.itemisedVersions.length; ii++) {
            if (this.matchDropdownEntry(currentInput, step.itemisedVersions[ii])) {
                options.push(step.itemisedVersions[ii]);
            }
        }
        return options;
    },
    formatResultCssClass: function (item) {
        return "select-" + item.itemType;
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
        var row;

        switch (v.itemType) {
            case VERSION:
                row = [
                    '<div class="versionItem">',
                    '<span class="source">[' + __s.translation_commentary + ']</span>',
                    '<span class="features">' + step.util.ui.getFeaturesLabel(v.item) + '</span>',
                    '<span class="initials">' + v.item.shortInitials + '</span> - ',
                    '<span class="name">' + v.item.name + '</span>',
                    '</div>'
                ].join('');
                break;
            case GREEK:
                row = '<span class="source">[' + __s.search_greek + ']</span>' + this._getAncientFirstRepresentation(v.item, false);
                break;
            case GREEK_MEANINGS:
                row = '<span class="source">[' + __s.search_greek_meaning + ']</span>' + this._getEnglishFirstRepresentation(v.item, false);
                break;
            case HEBREW:
                row = '<span class="source">[' + __s.search_hebrew + ']</span>' + this._getAncientFirstRepresentation(v.item, true);
                break;
            case HEBREW_MEANINGS:
                row = '<span class="source">[' + __s.search_hebrew_meaning + ']</span>' + this._getEnglishFirstRepresentation(v.item, true);
                break;
            case REFERENCE:
                row = [
                    '<span class="source">[' + __s.bible_text + ']</span>',
                    v.item.fullName
                ].join('');
                break;
            case TEXT_SEARCH:
                row = [
                    '<span class="source">[' + __s.search_text + ']</span>',
                    v.item
                ].join('');
                break;
            case SUBJECT_SEARCH:
                row = '<span class="source">[' + __s.search_topic + ']</span>' + v.text;
                break;
            case MEANINGS:
                row = '<span class="source">[' + __s.search_meaning + ']</span>' + v.text.gloss;
                break;
        }
        var markup = [];
        window.Select2.util.markMatch(row, query.term, markup, escapeMarkup);
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
                return { fullName: enhancedInfo.name, shortName: enhancedInfo.osisKeyId };
            case GREEK_MEANINGS:
            case GREEK:
            case HEBREW_MEANINGS:
            case HEBREW:
            case STRONG_NUMBER:
                //we need to work out what kind of type this was before
                for(var ii = 0; ii < initialData.length; ii++) {
                    var previousType;
                    if(initialData[ii].item && initialData[ii].item.strongNumber == token) {
                        //we're a winner
                        tokenItem.tokenType = initialData[ii].itemType;
                    }
                }
                
                //else default to something (in the future, we may change the URLs
                if(token.length > 0 && token[0] == 'G') {
                    tokenItem.tokenType = GREEK_MEANINGS;
                } else {
                    tokenItem.tokenType = HEBREW_MEANINGS;
                }
                
                return enhancedInfo;
            case MEANINGS:
            case SUBJECT_SEARCH:
            case TEXT_SEARCH:
                return token;
        }
    },
    syncWithUrl: function (model) {
        if(model == null) {
            model = step.util.activePassage();
        }
        
        var initialData = this.masterSearch.select2("data");
        
        //overwrite all the data
        var data = [];
        var tokens = model.get("searchTokens") || [];
        for (var i = 0; i < tokens.length; i++) {
            //check if the tokens are in the search box already... if so, then don't add them
            data.push({ item: this._getPartialToken(initialData, tokens[i]), itemType: tokens[i].tokenType });
        }
        this.masterSearch.select2("data", data);
    },
    _handleKeyPressInSearch : function(ev) {
        if(ev.keyCode == 13) {
            //check whether the container is open
            if($(".select2-result-selectable").length == 0) {
                // trigger search
                this.search();
            }
        }
    }
});