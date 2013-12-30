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

        //get the versions data sources
        for (var i = 0; i < step.datasources.length; i++) {
            if (step.datasources.at(i).get("name") == DS_VERSIONS) {
                this.versions = step.datasources[i];
            }
        }

        $(this.$el).on('show.bs.dropdown', function () {
            if (!self.rendered) {
                require(["defaults"], function () {
                    self._initUI();
                    self.rendered = true;
                    self._updateDisplayOptions();
                });
            } else {
                self._updateDisplayOptions();
            }
        });
    },

    _updateDisplayOptions: function () {
        var passage = this.model.get("data");
        if (passage == undefined || step.keyedVersions == undefined) {
            console.log("Unable to find a passage");
            return;
        }

        //set the correct version
        this.displayModeContainer.find(".glyphicon").removeClass("active");
        this.displayModeContainer
            .find("[data-value='" + passage.interlinearMode + "']")
            .find(".glyphicon").addClass("active");


        //depending on the version selected, we show the various options
        var masterVersion = step.keyedVersions[passage.masterVersion];
        var extraVersions = passage.extraVersions

        //remove any empty string...
        if (extraVersions == undefined || extraVersions == "") {
            extraVersions = [];
        } else {
            extraVersions = extraVersions.split(",");
        }

        if (extraVersions.length == 0) {
            this.displayModeContainer.hide();
            return;
        } else {
            this.displayModeContainer.show();
        }

        var allHaveStrong = masterVersion.hasStrongs;
        var sameLanguage = true;
        var masterLanguage = masterVersion.languageCode;
        for (var ii = 0; ii < extraVersions.length; ii++) {
            var extraResource = step.keyedVersions[extraVersions[ii]];
            allHaveStrong = allHaveStrong && extraResource.hasStrongs;
            sameLanguage = sameLanguage && extraResource.languageCode == masterLanguage;
        }

        this.displayModeContainer.find("a[data-value='INTERLINEAR']").closest("li").toggle(allHaveStrong);
        this.displayModeContainer.find("a[data-value='INTERLEAVED_COMPARE']").closest("li").toggle(sameLanguage);
        this.displayModeContainer.find("a[data-value='COLUMN_COMPARE']").closest("li").toggle(sameLanguage);
    },

    showAnalysis: function () {
        step.lexicon.wordleView.passageId = passageId;
        lexiconDefinition.reposition(step.defaults.infoPopup.wordleTab);
    },

    _initUI: function () {
        var dropdownContainer = $("<div>").addClass("dropdown-menu").attr("role", "menu");
        this.displayModeContainer = $("<div>");
        var displayMode = $("<h1>").append(__s.display_mode);
        this.displayModeContainer.append(displayMode);
        this.displayModeContainer.append(this._createDisplayModes());
        dropdownContainer.append(this.displayModeContainer);

        var displayOptions = $("<h1>").append(__s.display_options);
        dropdownContainer.append(displayOptions);
        dropdownContainer.append(this._createPassageOptions());
        this.$el.append(dropdownContainer);
    },
    _createDisplayModes: function () {
        var interOptions = step.defaults.passage.interOptions;
        var interNamesOptions = step.defaults.passage.interNamedOptions;

        var displayModes = $("<ul>").addClass("miniKolumny displayModes");
        for (var i = 0; i < interOptions.length; i++) {
            var link = this._createLink(interNamesOptions[i], interOptions[i]);
            displayModes.append($("<li>").append(link).attr("role", "presentation"));
        }


        var self = this;
        displayModes.find('a').click(function (e) {
            e.stopPropagation();
            displayModes.find('a').not(this).find(".glyphicon").removeClass("active");
            $(this).find('.glyphicon').addClass("active");
            self._updateOptions();
        });

        return displayModes;
    },
    _createPassageOptions: function () {
        var dropdown = $("<ul>").addClass("miniKolumny passageOptions");
        var selectedOptions = this.model.get("passage").display || "";

        for (var i = 0; i < this.items.length; i++) {
            var link = this._createLink(this.items[i].initial, __s[this.items[i].key], __s[this.items[i].help]);

            this._setVisible(link, selectedOptions.indexOf(this.items[i].initial) != -1);
            dropdown.append($("<li>").append(link)).attr("role", "presentation");
        }

        var self = this;
        dropdown.find('a').click(function (e) {
            e.stopPropagation();
            self._setVisible($(this), $(this).find('.glyphicon').css("visibility") == 'hidden');
            self._updateOptions();
        });
        return dropdown;
    },
    _createLink: function (value, text, title) {
        return $('<a></a>')
            .attr("href", "javascript:void(0)")
            .attr("data-value", value)
            .attr("title", title)
            .append('<span class="glyphicon glyphicon-ok"></span>')
            .append("<span>" + text + "</span>");
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
        clonedPassageOptions.interlinearMode = this.displayModeContainer.find("a:has(.glyphicon.active)").attr("data-value");

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