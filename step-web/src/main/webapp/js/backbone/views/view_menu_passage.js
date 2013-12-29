var PassageMenuView = Backbone.View.extend({
    events: {
        "click a[name]": "updateModel",
        "click .showStats": "showAnalysis"
    },
    el: function () {
        return $(".passageOptionsGroup").eq(this.model.get("passageId"))
    },
    items: [
        { initial: "H", key: "display_headings" },
        { initial: "V", key: "display_verseNumbers" },
        { initial: "L", key: "display_separateLines" },
        { initial: "R", key: "display_redLetter" },
        { initial: "N", key: "display_notes" },
        { initial: "E", key: "display_englishVocab" },
        { initial: "A", key: "display_greekVocab" },
        { initial: "D", key: "display_divide_hebrew", help: "display_divide_hebrew_help" },
        { initial: "G", key: "display_greek_pointing", help: "display_greek_accents_help" },
        { initial: "U", key: "display_hebrew_vowels", help: "display_hebrew_vowels_help" },
        { initial: "P", key: "display_pointing_include_hebrew", help: "display_pointing_include_hebrew_vowels_help" },
        { initial: "T", key: "display_transliteration" },
        { initial: "M", key: "display_grammar" },
        { initial: "C", key: "display_grammarColor" }
    ],

    initialize: function () {
        var self = this;
        _.bindAll(this);

//        Backbone.Events.listenTo(this.model, "change", this._updateAvailableOptions);

        //get the versions data sources
        for (var i = 0; i < step.datasources.length; i++) {
            if (step.datasources.at(i).get("name") == DS_VERSIONS) {
                this.versions = step.datasources[i];
            }
        }
        this._initUI();
    },

    showAnalysis: function () {
        step.lexicon.wordleView.passageId = passageId;
        lexiconDefinition.reposition(step.defaults.infoPopup.wordleTab);
    },

    _initUI: function () {
        var dropdown = $("<ul>").addClass("dropdown-menu miniKolumny passageOptions").attr("role", "menu");
        var selectedOptions = this.model.get("passage").display || "";

        for (var i = 0; i < this.items.length; i++) {
            var link = $('<a></a>')
                .attr("href", "javascript:void(0)")
                .attr("data-value", this.items[i].initial)
                .attr("title", __s[this.items[i].help])
                .append('<span class="glyphicon glyphicon-ok"></span>')
                .append("<span>" + __s[this.items[i].key] + "</span>");

            this._setVisible(link, selectedOptions.indexOf(this.items[i].initial) != -1);
            dropdown.append($("<li>").append(link)).attr("role", "presentation");
        }
        this.$el.append(dropdown);
        var self = this;
        dropdown.find('a').click(function (e) {
            e.stopPropagation();
            self._setVisible($(this), $(this).find('.glyphicon').css("visibility") == 'hidden');
            self._updateOptions();
        });
    },
    _updateAvailableOptions: function () {
        console.log("updating options");
    },
    _updateOptions: function () {
        //update the model
        var selectedOptions = this.$el.find("[data-selected='true']");
        var selectedCode = "";
        for (var i = 0; i < selectedOptions.length; i++) {
            selectedCode += selectedOptions.eq(i).data('value');
        }

        var passageOptions = this.model.get("passage");
        var clonedPassageOptions = _.clone(passageOptions);
        clonedPassageOptions.display = selectedCode;

        this.model.save({
            passage: clonedPassageOptions
        });
        return selectedCode;
    },

    _setVisible: function (link, visible) {
        link.find(".glyphicon").css("visibility", visible ? "visible" : "hidden");
        link.attr("data-selected", visible);
    },

    appendMenuButtons: function (groupOfButtons) {
        var interlinearMode = "NONE";
        switch (interlinearMode) {
            case "NONE":
                this.$el.find("h2:first").append(groupOfButtons);
                break;
            case "INTERLINEAR":
                groupOfButtons.insertBefore(this.$el.find(".interlinear:first"));
                break;
            case "INTERLEAVED":
            case "INTERLEAVED_COMPARE":
                groupOfButtons.insertBefore(this.$el.find(".verseGrouping:first"));
                break;
            case "COLUMN":
            case "COLUMN_COMPARE":
                groupOfButtons.insertBefore(this.$el.find("table:first"));
                break;
            default:
                console.log("Unable to ascertain where to put Analysis button - omitting");
                return;
        }

        this.$el = groupOfButtons;
    }
});