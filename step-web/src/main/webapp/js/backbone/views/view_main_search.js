var MainSearchView = Backbone.View.extend({
    el: ".search-form",
    events: {
        "click .btn": "search"
    },
    initialize: function () {
        this.masterSearch = this.$el.find("#masterSearch");

        _.bindAll(this);
        var view = this;


        view.masterSearch.select2({
            minimumInputLength: 3,
            //            data : this._getData,
            id: function (entry) {
                if (entry.itemType == REFERENCE) {
                    return entry.item.fullName;
                } else {
                    return entry.item.initials;
                }
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
                        var item = data[ii].suggestion;
                        var text = data[ii].suggestion;
                        if (data[ii].itemType == 'hebrew' || data[ii].itemType == 'greek') {
                            text = data[ii].suggestion.matchingForm + " (" + data[ii].suggestion.stepTransliteration + " - " + data[ii].suggestion.gloss + ")";
                        } else if (data[ii].itemType == 'greekMeanings' || data[ii].itemType == 'hebrewMeanings') {
                            text = data[ii].suggestion.gloss + " (" + data[ii].suggestion.stepTransliteration + " - " + data[ii].suggestion.matchingForm + ")";
                        } else if (data[ii].itemType == REFERENCE) {
                            text = data[ii].suggestion.fullName;
                            item = data[ii].suggestion;
                        }
                        datum.push({ text: text, item: item, itemType: data[ii].itemType });
                    }
                    return { results: view.patch(datum) };
                }
            },

            multiple: true,
            formatResult: view.formatResults,
            matcher: view.matchDropdownEntry,
            formatSelection: function (entry) {
                if (entry.itemType == REFERENCE) {
                    return entry.item.shortName;
                }
                return "<div class='versionItem'>" + entry.item.initials + "</div>"
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
    },
    search: function () {
        console.log("Searching...");
        var options = this.masterSearch.select2("data");
        var args = "";
        for (var ii = 0; ii < options.length; ii++) {
            if (args.length != 0) {
                args += "|";
            }
            args += options[ii].itemType + "=";

            switch (options[ii].itemType) {
                case VERSION:
                    args += encodeURIComponent(options[ii].item.initials);
                    break;
                case REFERENCE:
                    args += encodeURIComponent(options[ii].item.shortName);
                    break;
                default:
                    break;
            }
        }

        console.log("Arguments are: ", args);
        step.router.navigateSearch(args);
    },
    getCurrentInput: function () {
        return this.masterSearch.select2("container").find(".select2-input").val();
    },
    patch: function (results) {
        var staticResources = this._getData();

        return staticResources.concat(results);
    },
    _getData: function () {
        if (this.model.data.length != 0) {
            return this.filterLocalData(this.model.data.at(0).get("data"));
        }
        return { results: [] };
    },
    matchDropdownEntry: function (term, textOrObject) {
        var regex = new RegExp("\\b" + term, "ig");
        if ($.type(textOrObject) === "string") {
            return textOrObject != null && textOrObject != "" && textOrObject.toLowerCase().match(regex);
        }

        if (textOrObject.itemType == 'version') {
            return this.matchDropdownEntry(term, textOrObject.item.initials) ||
                this.matchDropdownEntry(term, textOrObject.item.name);
        }
        return false;
    },
    filterLocalData: function (data) {
        var options = [];

        var currentInput = this.getCurrentInput();
        for (var ii = 0; ii < data.length; ii++) {
            if (this.matchDropdownEntry(currentInput, data[ii])) {
                options.push(data[ii]);
            }
        }
        return options;
    },
    formatResultCssClass: function (item) {
        if (item.itemType == VERSION) {
            return "selectBibleRow";
        }
        if (item.itemType == "subjects") {
            return "subjects";
        } else if (item.itemType == "greek") {
            return "greek";
        } else if (item.itemType == "greekMeanings") {
            return "greekMeanings";
        } else if (item.itemType == "hebrew") {
            return "hebrew";
        } else if (item.itemType == "hebrewMeanings") {
            return "hebrewMeanings";
        } else if (item.itemType == REFERENCE) {
            return "selectReferenceRow";
        }
    },
    formatResults: function (v, container, query, escapeMarkup) {
        var row;
        if (v.itemType == VERSION) {
            row = [
                '<div class="versionItem">',
                '<span class="initials">' + v.item.initials + '</span> - ',
                '<span class="name">' + v.item.name + '</span>',
                '<span class="source">[' + __s.translation_commentary + ']</span>',
                '<span class="features">' + step.util.ui.getFeaturesLabel(v.item) + '</span>',
                '</div>'
            ].join('');
        } else if (v.itemType == "subjects") {
            row = v.text + '<span class="source">[' + "Topic" + ']</span>';
        } else if (v.itemType == "greek") {
            row = v.text + '<span class="source">[' + "Greek" + ']</span>';
        } else if (v.itemType == "greekMeanings") {
            row = v.text + '<span class="source">[' + "Greek meaning" + ']</span>';
        } else if (v.itemType == "hebrew") {
            row = v.text + '<span class="source">[' + "Hebrew" + ']</span>';
        } else if (v.itemType == "hebrewMeanings") {
            row = v.text + '<span class="source">[' + "Hebrew meaning" + ']</span>';
        } else if (v.itemType == REFERENCE) {
            row = [
                v.item.fullName,
                '<span class="source">[' + __s.bible_text + ']</span>'
            ].join('');
        }
        var markup = [];
        window.Select2.util.markMatch(row, query.term, markup, escapeMarkup);
        return markup.join("");
    }
});

