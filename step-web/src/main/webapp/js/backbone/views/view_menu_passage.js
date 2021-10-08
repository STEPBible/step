var PassageMenuView = Backbone.View.extend({
    infoIcon: '<a href="javascript:void(0)" class="infoIcon" data-html="true" data-toggle="popover" data-placement="top">' +
        '<span class="glyphicon glyphicon-info-sign"></span>' +
        '</a>',
    events: {
        "click a[name]": "updateModel",
        "click .previousChapter": "goToPreviousChapter",
        "click .nextChapter": "goToNextChapter",
        "click .closeColumn": "closeColumn",
        "click .openNewPanel": "openNewPanel",
        "show.bs.dropdown *": "handleDropdownMenu"
    },
    fontButtons: '<li><%= __s.font_sizes %><span class="<%= step.state.isLtR() ? "pull-right" : "pull-left" %> btn-group">' +
        '<button class="btn btn-default btn-sm largerFontSize" type="button" title="<%= __s.font %>">' +
        '<span class="largerFont"><%= __s.passage_font_size_symbol %></span></button></span></li>',
    quickLexicon: '<li><a href="javascript:void(0)" data-selected="true"><span><%= __s.quick_lexicon %></span><span class="glyphicon glyphicon-ok pull-right" style="visibility: <%= isQuickLexicon ? "visible" : "hidden" %>;color:var(--clrText)"></span></a></li>',
    similarWord: '<li><a href="javascript:void(0)" data-selected="true"><span><%= __s.similar_word %></span><span class="glyphicon glyphicon-ok pull-right" style="visibility: <%= isSimilarWord ? "visible" : "hidden" %>;color:var(--clrText)"></span></a></li>',
    // enWithEsLexicon: '<li><a href="javascript:void(0)" data-selected="true"><span><%= __s.en_with_es_lexicon %></span><span class="glyphicon glyphicon-ok pull-right" style="visibility: <%= isEnWithEsLexicon ? "visible" : "hidden" %>;color:var(--clrText)"></span></a></li>',
    enWithZhLexicon: '<li><a href="javascript:void(0)" data-selected="true"><span><%= __s.en_with_zh_lexicon %></span><span class="glyphicon glyphicon-ok pull-right" style="visibility: <%= isEnWithZhLexicon ? "visible" : "hidden" %>;color:var(--clrText)"></span></a></li>',
    secondZhLexicon: '<li><a href="javascript:void(0)" data-selected="true"><span><%= __s.zh_second_zh_lexicon %></span><span class="glyphicon glyphicon-ok pull-right" style="visibility: <%= isSecondZhLexicon ? "visible" : "hidden" %>;color:var(--clrText)"></span></a></li>',
    verseVocab: '<li><a href="javascript:void(0)" data-selected="true"><span><%= __s.verse_vocab %></span><span class="glyphicon glyphicon-ok pull-right" style="visibility: <%= isVerseVocab ? "visible" : "hidden" %>;color:var(--clrText)"></span></a></li>',
    el: function () {
        return step.util.getPassageContainer(this.model.get("passageId")).find(".passageOptionsGroup");
    },
    items: [
        {initial: "H", key: "display_headings"},
        {initial: "V", key: "display_verseNumbers"},
        {initial: "L", key: "display_separateLines"},
        {initial: "R", key: "display_redLetter"},
        {initial: "N", key: "display_notes"},
        {
            group: "display_vocab_options", items: [
                {initial: "E", key: "display_englishVocab"},
                {initial: "A", key: "display_greekVocab"},
                {initial: "T", key: "display_transliteration"},
                {initial: "B", key: "display_spanishVocab"},
                {initial: "Z", key: "display_chineseVocab"}
            ]
        },
        {
            group: "original_language_options", items: [
                {initial: "O", key: "display_original_transliteration"},
                {initial: "D", key: "display_divide_hebrew", help: "display_divide_hebrew_help"},
                {initial: "G", key: "display_greek_pointing", help: "display_greek_accents_help"},
                {initial: "U", key: "display_hebrew_vowels", help: "display_hebrew_vowels_help"},
                {initial: "P", key: "display_pointing_include_hebrew", help: "display_pointing_include_hebrew_vowels_help"}
            ]
        },
        {initial: "M", key: "display_grammar"},
        {initial: "C", key: "display_grammarColor"}
    ],

    initialize: function () {
        var self = this;
        _.bindAll(this);
        //listen for model changes
        this.listenTo(this.model, "sync-update", this._updateVisibleDropdown);
        this.listenTo(this.model, "destroy-column", this.remove);
        this.column = this.$el.closest(".column");
        this.column.click(this.activateColumn);

        //get the versions data sources
        this._updateVisibleDropdown();

        this.warnings = $(step.util.getPassageContainer(this.model.get("passageId"))).find(".infoIcon");
        if (this.warnings.length == 0) {
            this.warnings = $(_.template(this.infoIcon)());
            this.$el.parent().append(this.warnings);
        }


        this.listenTo(this.model, "raiseMessage", this.raiseMessage);
        this.listenTo(this.model, "squashErrors", this.squashError);
        this.listenTo(Backbone.Events, "columnsChanged", this.updateVisibleCloseButton);
    },
    _updateIcon: function () {
        var errorMessages = (this.warnings.attr('data-content') || "").indexOf("glyphicon-exclamation-sign") != -1;
        var warningMessages = (this.warnings.attr('data-content') || "").indexOf("glyphicon-warning-sign") != -1;
        if (errorMessages) {
            this.warnings
                .removeClass("text-muted text-info text-warning text-warning").addClass("text-danger")
                .find(".glyphicon").removeClass('glyphicon-exclamation-sign glyphicon-warning-sign glyphicon-info-sign').addClass("glyphicon-exclamation-sign");
        }
        else if (warningMessages) {
            this.warnings
                .removeClass("text-muted text-info text-danger text-warning").addClass("text-warning")
                .find(".glyphicon").removeClass('glyphicon-exclamation-sign glyphicon-warning-sign glyphicon-info-sign').addClass("glyphicon-warning-sign");
        }
        else {
            this.warnings
                .removeClass("text-muted text-info text-danger text-warning").addClass("text-info")
                .find(".glyphicon").removeClass('glyphicon-exclamation-sign glyphicon-warning-sign glyphicon-info-sign').addClass("glyphicon-info-sign");
        }
    }, raiseMessage: function (opts) {
        var self = this;
        var titleSoFar = this.warnings.attr("data-content") || "";
        if (titleSoFar != "") {
            titleSoFar += "<p />";
        }

        if (opts.level == 'warning') {
            titleSoFar += '<span class="text-warning glyphicon glyphicon-warning-sign"></span> ';
        }
        else if (opts.level == 'danger' || opts.level == 'error') {
            titleSoFar += '<span class="text-danger glyphicon glyphicon-exclamation-sign"></span> ';
        }
        else if (opts.level == 'info') {
            titleSoFar += '<span class="text-info glyphicon glyphicon-info-sign"></span> ';
        }
        titleSoFar += opts.message;
        this.warnings.popover({html: true}).on("hide.bs.popover", function () {
            self.handleInfoHide();
        });
        this.warnings.attr("data-content", titleSoFar);
        this._updateIcon();
        this.warnings.show();
        if (opts.silent != true) {
            this.warnings.popover('show');
            this.warnings.next(".popover").on('click', function () {
                self.warnings.popover("hide");
                self.handleInfoHide();
            })
        }
        else {
            this.warnings.on("shown.bs.popover", function () {
                self.warnings.next(".popover").on('click', function () {
                    self.warnings.popover("hide");
                    self.handleInfoHide();
                })
            });
        }

    },
    handleInfoHide: function () {
        this.warnings.removeClass("text-info text-warning text-danger");
        this.warnings.addClass("text-muted");
    },
    squashError: function () {
        this.warnings.attr("data-content", "");
        this.warnings.hide();
        this.warnings.popover('hide');
        this._updateIcon();
    },
    handleDropdownMenu: function (ev) {
        var self = this;
        if (!self.rendered) {
            if (!self.rendered) {
                self._initUI();
                self.rendered = true;
                self._updateDropdownContents(ev.target);
            }
        }
        else {
            self._updateDropdownContents(ev.target);
        }
    },
    _updateVisibleDropdown: function () {
        var openDropdown = this.$el.find(".dropdown.open");
        if (this._isDisplayOptionsDropdown(openDropdown)) {
            this._updateColumnOptions();
        }

        var isPassage = this.model.get("searchType") == 'PASSAGE';
        var previousNext = this.$el.find(".nextPreviousChapterGroup");
        previousNext.toggle(true);
        nextOnly = previousNext.find(".nextChapter");
        nextOnly.toggle(isPassage);
        this.$el.find(".contextContainer").toggle(!isPassage);

    },
    _updateDropdownContents: function (targetTrigger) {
        if (this._isDisplayOptionsDropdown(targetTrigger)) {
            this._updateColumnOptions();
        }
        else if (this._isShareDropdown(targetTrigger)) {
            this._doSocialButtons();
        }
        this._updateVisibleDropdown();
    },
    _isDisplayOptionsDropdown: function (target) {
        return $(target).has(">.showSettings").length > 0;
    },
    _isShareDropdown: function (target) {
        return $(target).has(">.dropdown-share").length > 0;
    },
    _updateColumnOptions: function () {
        if (this.model == undefined || step.keyedVersions == undefined || !this.rendered) {
            console.log("Unable to find a passage");
            return;
        }

        var masterVersion = step.keyedVersions[this.model.get("masterVersion")];
        this._updateDisplayModeOptions(masterVersion);
        this._updateDisplayOptions();
        this._updateSearchOptions();
    },
    /**
     * Obtains the options available in the masterVersion.
     * Then only makes those available. If we're in an interlinear mode, then
     * we need to further disable those options that are not available...
     * @param passage the passage model data
     * @private
     */
    _updateDisplayOptions: function () {
        //first set the available options to be visible, and non-available options to be invisible...
        var availableOptions = this.model.get("options") || "";
        var isPassage = this.model.get("searchType") == "PASSAGE";

        //don't show the section at all if we're not a passage
        this.displayOptions.toggle(isPassage);

        // quit straight away if not a passage
        if (!isPassage) {
            return;
        }

        //make invisible all options except for 'available ones'
        var displayOptions = this.displayOptions.find("li.passage");
        for (var i = 0; i < displayOptions.length; i++) {
            var displayOption = displayOptions.eq(i);
            var displayOptionCode = displayOption.find("[data-value]").attr("data-value");
            displayOption.toggle(availableOptions.indexOf(displayOptionCode) != -1);
            if (displayOptionCode == "C") {
                if ((availableOptions.indexOf("C") > -1) && (displayOption.find(".glyphicon").css("visibility") != "hidden")) {
                    this.displayOptions.find("li#grammar_list_item.noHighlight.grammarContainer")[0].hidden = false;
                }
                else {
                    this.displayOptions.find("li#grammar_list_item.noHighlight.grammarContainer")[0].hidden = true;
                }
            }
        }
        //do we need to show the group headings...
        this.displayOptions.find(".menuGroup").each(function (i, item) {
            var heading = $(item);
            var subOptions = $(heading.data("target")).find("li");
            var visible = false;
            for (var i = 0; i < subOptions.length; i++) {
                // if we don't have 'display: ...' then we'll assume visible
                visible = visible || ((subOptions.eq(i).css("display") || "") != "none");
            }

            heading.toggle(visible);
        });

    },
    _updateSearchOptions: function () {

    },
    _updateDisplayModeOptions: function (masterVersion) {
        //set the current display mode.
        this.displayModeContainer.find(".glyphicon").removeClass("active");
        this.displayModeContainer
            .find("[data-value='" + this.model.get("interlinearMode") + "']")
            .find(".glyphicon").addClass("active");


        //depending on the version selected, we show the various options
        var extraVersions = this.model.get("extraVersions");

        //remove any empty string...
        if (extraVersions == undefined || extraVersions == "") {
            extraVersions = [];
        }
        else {
            extraVersions = extraVersions.split(",");
        }

        if (extraVersions.length == 0) {
            this.displayModeContainer.hide();
            return;
        }
        else {
            this.displayModeContainer.show();
        }

        var allHaveStrong = masterVersion.hasStrongs;
        var allSameTagging = true;
        var sameLanguaguageAndBible = masterVersion.category == 'BIBLE';
        var masterLanguage = masterVersion.languageCode;
        for (var ii = 0; ii < extraVersions.length; ii++) {
            var extraResource = step.keyedVersions[extraVersions[ii]];
            allHaveStrong = allHaveStrong && extraResource.hasStrongs;

            //js: &= gives us a 0 return value
            sameLanguaguageAndBible = sameLanguaguageAndBible && extraResource.languageCode == masterLanguage;
            sameLanguaguageAndBible = sameLanguaguageAndBible && extraResource.category == 'BIBLE';
            allSameTagging = allSameTagging && extraResource.hasSeptuagintTagging == masterVersion.hasSeptuagintTagging;
        }

        this.displayModeContainer.find("a[data-value='INTERLINEAR']").closest("li").toggle(allHaveStrong && allSameTagging);
        this.displayModeContainer.find("a[data-value='INTERLEAVED_COMPARE']").closest("li").toggle(sameLanguaguageAndBible);
        this.displayModeContainer.find("a[data-value='COLUMN_COMPARE']").closest("li").toggle(sameLanguaguageAndBible);
    },

    _initUI: function () {
        //create settings dropdown
		var oldMenu = this.$el.find(".dropdown-menu.pull-right.stepModalFgBg"); // When a panel is added, it was probably copied so it copied over the old menu
		if (oldMenu.length == 1) this.$el.find(".dropdown-menu.pull-right.stepModalFgBg")[0].remove();
        var dropdownContainer = $("<div>").addClass("dropdown-menu pull-right stepModalFgBg").attr("role", "menu").attr("dir", step.state.isLtR() ? "" : "rtl");
        this.displayModeContainer = $("<div>");
        var displayMode = $("<h2>").append(__s.display_mode);
        this.displayModeContainer.append(displayMode);
        this.displayModeContainer.append(this._createDisplayModes());
        dropdownContainer.append(this.displayModeContainer);

        this.displayOptions = this._createDisplayOptions();
        this.otherOptions = this._createSearchOptions();
        dropdownContainer
            .append(this.displayOptions)
            .append(_.template("<h2><%= __s.general_options %></h2>")())
            .append(this.otherOptions);

        var shareDropdownMenu = $("<div>").addClass("dropdown-menu pull-right").attr("role", "menu");

        this.$el.find(".dropdown:has(.dropdown-share)").append(shareDropdownMenu);
        this.$el.find(".dropdown:has(.showSettings)").append(dropdownContainer);
    },
    _createDisplayModes: function () {
        var interOptions = step.defaults.passage.interOptions;
        var interNamesOptions = step.defaults.passage.interNamedOptions;
        var explanations = step.defaults.passage.interOptionsExplanations;

        var displayModes = $("<ul>").addClass("displayModes");
        for (var i = 0; i < interOptions.length; i++) {
            var link = this._createLink(interNamesOptions[i], interOptions[i], explanations[i]);
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
    _createDisplayOptions: function () {
        var dropdownContainer = $('<span class="displayOptionsContainer panel-group">').attr("id", "displayOptions-" + this.model.get("passageId"));
        var displayOptionsHeading = $("<h2>").append(__s.display_options);

        var dropdown = $("<ul>").addClass("passageOptions");
        var context = this.model.get("context") || 0;
        var li = $('<li class="noHighlight contextContainer">').append($('<span class="contextLabel" dir="' + (step.state.isLtR() ? "ltr" : "rtl") + '"></span>').append(this.getContextLabel(context)));

        dropdown.append(this._createPassageOptions(dropdown));

        dropdown.append(li);

        colorCodeGrammarButton = '<li id=grammar_list_item class="noHighlight grammarContainer"><%= __s.config_color_grammar %>' +
            '<span class="<%= step.state.isLtR() ? "pull-right" : "pull-left" %> btn-group">' +
            '<button class="btn btn-default btn-xs grammarColor" type="button" title="<%= __s.config_color_grammar_explain %>">' +
            '<span class="glyphicon glyphicon-cog"></span></button></span></li>',
            dropdown.append(_.template(colorCodeGrammarButton)())
                .find(".grammarColor").click(step.util.showConfigGrammarColor);

        dropdownContainer.append(displayOptionsHeading);
        dropdownContainer.append(dropdown);
        return dropdownContainer;
    },
    getContextLabel: function (context) {
        return sprintf(__s.search_context, context);
    },
    _createSearchOptions: function () {
        var dropdown = $("<ul></ul>")
        var self = this;
        var context = this.model.get("context") || 0;

        var li = $('<li class="noHighlight contextContainer">').append($('<span class="contextLabel" dir="' + (step.state.isLtR() ? "ltr" : "rtl") + '"></span>').append(this.getContextLabel(context)));
        li.append($('<span class="btn-group ' + (step.state.isLtR() ? "pull-right" : "pull-left") + '"></span>')
            .append('<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-minus" title="' + __s.search_less_context + '"></span></button>')
            .append('<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-plus" title="' + __s.search_more_context + '"></span></button>'));

        li.find("button").click(function (ev) {
            ev.stopPropagation();
            //need to trigger new search after setting value of model
            var contextVal = self.model.get("context");
            var increment = $(this).find(".glyphicon-minus").length ? -1 : 1;
            if (step.util.isBlank(contextVal)) {
                contextVal = 0;
            }
            else if (isNaN(contextVal)) {
                contextVal = 0;
            }
            else {
                contextVal = parseInt(contextVal);
            }
            contextVal += increment;
            if (contextVal < 0) {
                contextVal = 0;
            }
            $(this).closest("li").find(".contextLabel").html(self.getContextLabel(contextVal));
            self.model.save({context: contextVal});

        });

        //create menu options
        var currentQuickLexiconSetting = self.model.get("isQuickLexicon");
        if (currentQuickLexiconSetting == null) {
            this.model.save({isQuickLexicon: true});
            currentQuickLexiconSetting = true;
        }
        dropdown.append($(_.template(this.quickLexicon)({isQuickLexicon: currentQuickLexiconSetting})).click(function (e) {
            //prevent the bubbling up
            e.stopPropagation();

            //set the setting
            var quickLexicon = !self.model.get("isQuickLexicon");
            self.model.save({isQuickLexicon: quickLexicon});

            //toggle the tick
            self._setVisible(this, quickLexicon);
        }));
        // if (step.userLanguageCode.toLowerCase().indexOf("es") == 0) {
            // var currentEnWithEsLexiconSetting = self.model.get("isEnWithEsLexicon");
            // if (currentEnWithEsLexiconSetting == null) {
                // this.model.save({ isEnWithEsLexicon: true });
                // currentEnWithEsLexiconSetting = true;
            // }
            // dropdown.append($(_.template(this.enWithEsLexicon)({ isEnWithEsLexicon: currentEnWithEsLexiconSetting })).click(function (e) {
                // e.stopPropagation(); //prevent the bubbling up
                // var enWithEsLexicon = !self.model.get("isEnWithEsLexicon");
                // self.model.save({ isEnWithEsLexicon: enWithEsLexicon });
                // self._setVisible(this, enWithEsLexicon); // toggle the tick
            // }));
        // }
        if (step.userLanguageCode.toLowerCase().indexOf("zh") == 0) {
            var currentEnWithZhLexiconSetting = self.model.get("isEnWithZhLexicon");
            if (currentEnWithZhLexiconSetting == null) {
                this.model.save({ isEnWithZhLexicon: false });
                currentEnWithZhLexiconSetting = false;
            }
            dropdown.append($(_.template(this.enWithZhLexicon)({ isEnWithZhLexicon: currentEnWithZhLexiconSetting })).click(function (e) {
                e.stopPropagation(); //prevent the bubbling up
                var enWithZhLexicon = !self.model.get("isEnWithZhLexicon");
                self.model.save({ isEnWithZhLexicon: enWithZhLexicon });
                self._setVisible(this, enWithZhLexicon); // toggle the tick
            }));
            var currentSecondZhLexiconSetting = self.model.get("isSecondZhLexicon");
            if (currentSecondZhLexiconSetting === null) {
                this.model.save({ isSecondZhLexicon: true });
                currentSecondZhLexiconSetting = true;
            }
            dropdown.append($(_.template(this.secondZhLexicon)({ isSecondZhLexicon: currentSecondZhLexiconSetting })).click(function (e) {
                e.stopPropagation(); //prevent the bubbling up
                var newSecondZhLexicon = !self.model.get("isSecondZhLexicon");  // reverse true or false
                self.model.save({ isSecondZhLexicon: newSecondZhLexicon }); // toggle the tick
                self._setVisible(this, newSecondZhLexicon);
            }));
        }
        var currentVerseVocabSetting = self.model.get("isVerseVocab");
        if (currentVerseVocabSetting == null) {
            this.model.save({isVerseVocab: true});
            currentVerseVocabSetting = true;
        }
        dropdown.append($(_.template(this.verseVocab)({isVerseVocab: currentVerseVocabSetting})).click(function (e) {
            //prevent the bubbling up
            e.stopPropagation();

            //set the setting
            var verseVocab = !self.model.get("isVerseVocab");
            self.model.save({isVerseVocab: verseVocab});

            //if verse vocab has been turned off, then destroy all qtips
            require(["qtip"], function () {
                $(".verseNumber", step.util.getPassageContainer(dropdown)).closest("a").qtip("destroy");
            });

            //toggle the tick
            self._setVisible(this, verseVocab);
        }));
		var currentSimilarWordSetting = self.model.get("isSimilarWord");
        if (currentSimilarWordSetting == null) {
            this.model.save({isSimilarWord: true});
            currentSimilarWordSetting = true;
        }
        dropdown.append($(_.template(this.similarWord)({isSimilarWord: currentSimilarWordSetting})).click(function (e) {
            //prevent the bubbling up
            e.stopPropagation();

            //set the setting
            var similarWord = !self.model.get("isSimilarWord");
            self.model.save({isSimilarWord: similarWord});

            //toggle the tick
            self._setVisible(this, similarWord);
        }));

        dropdown.append(li);
        dropdown.append(_.template(this.fontButtons)())
            .find(".largerFontSize").click(this.changeFontSizeInThisPanel);

        return dropdown;

    },
    /**
     * creates items into the provided container,
     * @param dropdown the container
     * @param items the items to iterate over
     * @private
     */
    _createItemsInDropdown: function (dropdown, items) {
//        <div class="panel-group" id="accordion">
        var selectedOptions = this.model.get("selectedOptions") || "";
        for (var i = 0; i < items.length; i++) {
            if (items[i].group) {
                var panel = $('<div class="panel panel-default stepModalFgBg">');

                var collapseHeader =
                    '<a data-toggle="collapse" class="menuGroup" data-parent="#displayOptions-' + this.model.get("passageId") + '" ' +
                    'data-target="#displayOptions-' + items[i].group + this.model.get("passageId") + '">'
                    + __s[items[i].group] +
                    '<span class="caret"></span></a>';
                var collapseBody = $('<div class="panel-collapse collapse"></div>').attr("id", 'displayOptions-' + items[i].group + this.model.get("passageId"));
                var panelBody = $("<div class='panel-body'>");
                collapseBody.append(panelBody);
                this._createItemsInDropdown(panelBody, items[i].items || []);

                panel.append(collapseHeader).append(collapseBody);
                dropdown.append(panel);
            }
            else {
                if ((items[i].initial === "Z") && (step.userLanguageCode.toLowerCase() === "zh")) items[i].initial = "S"; // Option code for Simplified Chinese is "S"
				if (!( ( (items[i].initial === "Z") && (step.userLanguageCode.toLowerCase() !== "zh_tw") ) ||
					   ( (items[i].initial === "S") && (step.userLanguageCode.toLowerCase() !== "zh") ) ||
					   ( (items[i].initial === "B") && (step.userLanguageCode.toLowerCase() !== "es") ) ) ) {
					var keyText = __s[items[i].key];
                    var helpText = __s[items[i].help];
                    var link = this._createLink(items[i].initial, keyText, helpText);
                    this._setVisible(link, selectedOptions.indexOf(items[i].initial) != -1);
                }
            }
            dropdown.append($("<li>").addClass("passage").append(link)).attr("role", "presentation");
        }
    },
    _createPassageOptions: function (dropdown) {
//        var selectedOptions = this.model.get("selectedOptions") || "";
        this._createItemsInDropdown(dropdown, this.items);

        var self = this;
        var links = dropdown.find('a');
        this._addTickHandlers(links.not("[data-toggle]"), false, function () {
            self._updateOptions();
        });

        links.filter("[data-toggle]").on('click', function (ev) {
            ev.stopPropagation();

            var target = $($(this).closest("[data-target]").data("target"));
            target.collapse("toggle", !target.hasClass("in"));
        });

        return dropdown;
    },
    _addTickHandlers: function (target, grouped, handler) {
        var self = this;
        target.click(function (e) {
            e.stopPropagation();
            var el = $(this);
            if (grouped) {
                //then untick all others
                $.each(el.closest("ul").find("a"), function () {
                    self._setVisible($(this), false);
                });
                self._setVisible(el, true);
            }
            else {
                self._setVisible(el, el.find('.glyphicon').css("visibility") == 'hidden');
            }

            if (handler) {
                handler(el);
            }
        });
    },
    _createLink: function (value, text, title) {
        return $('<a></a>')
            .attr("href", "javascript:void(0)")
            .attr("data-value", value)
            .attr("title", title)
            .append("<span>" + text + "</span>")
            .append(step.util.ui.selectMark("pull-right"));
    },
    _updateAvailableOptions: function () {
        console.log("updating options");
    },
    _updateOptions: function () {
        //update the model
        var selectedOptions = this.displayOptions.find("[data-selected='true']");
        var selectedCode = "";
        for (var i = 0; i < selectedOptions.length; i++) {
            selectedCode += selectedOptions.eq(i).data('value');
        }
        this.model.save({
            pageNumber: 1,
            selectedOptions: selectedCode,
            interlinearMode: this.displayModeContainer.find("a:has(.glyphicon.active)").attr("data-value")
        });
        return selectedCode;
    },

    _setVisible: function (el, visible) {
        var link = $(el);
        link.find(".glyphicon").css("visibility", visible ? "visible" : "hidden");
        link.attr("data-selected", visible);
    },

    _doSocialButtons: function () {
        step.util.activePassageId(this.model.get("passageId"));
        if (step.state.isLocal()) {
            return;
        }

        var element = this.$el.find(".dropdown-share").closest(".dropdown").find(".dropdown-menu");
        if (!this.sharingBar) {
            this.sharingBar = $("<ul>");
            element.append(this.sharingBar);
        }
        else {
            this.sharingBar.empty();
        }

        var url = step.router.getShareableColumnUrl(this.model.get("passageId"), true);
		
        //do twitter
        if (window.twttr != undefined) {
            var twitter = $('<a href="https://twitter.com/share" class="twitter-share-button" data-via="Tyndale_House">Tweet</a>')
            twitter.attr("data-url", url);
            twitter.attr("data-text", $("title").text());
            this.sharingBar.append($("<li>").append(twitter));
            window.twttr.widgets.load();
        }

        //do facebook share
        if (window.FB && window.FB.XFBML) {
			if (url != null) {
				if (url.indexOf('-') > -1) {
					alert("Sorry, Facebook does not accept a URL with a '-' character.  The passage selected has a '-' chaaracter.");
				}
				else {
					url = url.replace(/\|/g, "%7C"); // .replace(/\-/g, "%2D");
					var facebook = $('<fb:share-button type="button_count"></fb:share-button>').attr("href", url);
					this.sharingBar.append($("<li>").append(facebook));
					window.FB.XFBML.parse(facebook.parent().get(0));
				}
			}
        }
    },
    // decreaseFontSize: function (ev) {
        // ev.stopPropagation();
        // step.util.activePassageId(this.model.get("passageId"));
        // step.util.changeFontSize(this.$el, -1);
        // return false;
    // },
    changeFontSizeInThisPanel: function (ev) {
        ev.stopPropagation();
        step.util.showFontSettings(this.model.get("passageId"));
        return false;
    },
    goToPreviousChapter: function (ev) {
        this.goToSiblingChapter(this.model.get("previousChapter"), ev);
    },
    goToNextChapter: function (ev) {
        this.goToSiblingChapter(this.model.get("nextChapter"), ev);
    },
    goToSiblingChapter: function (key, ev) {
        if (ev) {
            ev.preventDefault();
        }
        step.util.activePassageId(this.model.get("passageId"));
        var args = this.model.get("args") || "";
        args = args.replace(new RegExp('\\|?' + REFERENCE        + '[^|]+', "ig"), "");
        var reference = "";
        var tmpArgs = this.removeSearchArgs(args);
        if (tmpArgs !== args) { // There is probably search so go to current chapter instead.  
            args = tmpArgs;
            reference = this.model.attributes.osisId;
            this.model.attributes.strongHighlights = "";
        }
        else {
            if ((key != undefined) && (key.osisKeyId != undefined) && (key.osisKeyId != null)) reference = key.osisKeyId;
            else alert("Cannot determine the last location, please re-enter the last passage you want to view.  key.osisKeyId is null or undefined");
        }
        args = args.replace(/&&/ig, "")
                   .replace(/&$/ig, "");
        if (args.length > 0) {
            args = args.replace(/^\|/, '')
                       .replace(/\|\|+/, '|');
            if (args[args.length - 1] !== '|') args += '|';
        }
        args += "reference=" + reference;
        console.log("navigateSearch from goToSiblingChapter: " + args);
        step.router.navigateSearch(args);
    },
    removeSearchArgs: function(args) {
        return args.replace(new RegExp('\\|?' + STRONG_NUMBER    + '[^|]+', "ig"), "")
		           .replace(new RegExp('\\|?' + SYNTAX           + '[^|]+', "ig"), "")
                   .replace(new RegExp('\\|?' + TEXT_SEARCH      + '[^|]+', "ig"), "")
                   .replace(new RegExp('\\|?' + SUBJECT_SEARCH   + '[^|]+', "ig"), "")
                   .replace(new RegExp('\\|?' + GREEK            +  '[^|]+', "ig"), "")
                   .replace(new RegExp('\\|?' + HEBREW           +  '[^|]+', "ig"), "")
                   .replace(new RegExp('\\|?' + GREEK_MEANINGS   +  '[^|]+', "ig"), "")
                   .replace(new RegExp('\\|?' + HEBREW_MEANINGS  +  '[^|]+', "ig"), "")
                   .replace(new RegExp('\\|?' + MEANINGS         +  '[^|]+', "ig"), "");
    },
    /**
     * Closes the whole column by removing it from the DOM
     */
    closeColumn: function (ev) {
        var targetButton = $(ev.target).closest("button");
        if (targetButton.hasClass("disabled")) {
            ev.stopPropagation();
            targetButton.blur();
            return;
        }


        this.model.trigger("destroy-column");
        this.column.remove();

        //resize the columns
        step.util.refreshColumnSize();
        step.util.showOrHideTutorial();

        //make sure any model that was linked to it is undone
        var passageId = parseInt(this.column.find("[passage-id]").attr("passage-id"));

        //remove any links to this passage
        var linkedPassageIds = step.util.unlink(passageId);

        //also remove any links from this passage to another passage...
        var linkTarget = this.model.get("linked");
        if (linkTarget != null) {
            var linkTargetModel = step.passages.findWhere({passageId: linkTarget});
            if (linkTargetModel) {
                //not much to do, except remove the icon
                step.util.getPassageContainer(linkTargetModel.get("passageId")).find(".linkPanel").remove();
            }
        }

        if (linkedPassageIds.length > 0) {
            step.util.activePassageId(linkedPassageIds[0]);
        }
        else {
            //let it reset on its on terms
            step.util.activePassageId();
        }

        this.model.destroy();
        Backbone.Events.trigger("columnsChanged", {});
    },
    activateColumn: function () {
        var passageId = this.column.find("[passage-id]").attr("passage-id");
        step.util.activePassageId(passageId);
    },
    openNewPanel: function (ev) {
        //if we're wanting a new column, then create it right now
        step.util.activePassageId(this.model.get("passageId"));
        step.util.createNewColumn();
        ev.stopPropagation();
    },
    updateVisibleCloseButton: function () {
        var shouldShow = $(".column").not(".examplesColumn").length > 1;
        this.$el.find(".closeColumn").toggleClass("disabled", !shouldShow);
//        if (!shouldShow) {
//            make sure it's not the last button
//            this.$el.find(".closeColumn").insertBefore(this.$el.find(".openNewPanel"));
//        } else {
//            ensure last element
//            this.$el.find(".openNewPanel").insertBefore(this.$el.find(".closeColumn"));
//        }
    }

});
