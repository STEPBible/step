var PassageMenuView = Backbone.View.extend({
    infoIcon: '<a href="javascript:void(0)" class="infoIcon" data-html="true" data-toggle="popover" data-placement="bottom"><span class="glyphicon glyphicon-info-sign" href="javascript:void(0)"></span></span>',
    events: {
        "click a[name]": "updateModel",
        "click .previousChapter": "goToPreviousChapter",
        "click .nextChapter": "goToNextChapter",
        "click .closeColumn": "closeColumn",
        "click .openNewPanel": "openNewPanel",
        "show.bs.dropdown *": "handleDropdownMenu"
    },
    fontButtons: '<li class="noHighlight fontSizeContainer"><%= __s.font_sizes %><span class="pull-right btn-group"><button class="btn btn-default btn-sm smallerFontSize" type="button" title="<%= __s.passage_smaller_fonts %>">' +
        '<span class="smallerFont"><%= __s.passage_font_size_symbol %></span></button>' +
        '<button class="btn btn-default btn-sm largerFontSize" type="button" title="<%= __s.passage_larger_fonts %>">' +
        '<span class="largerFont"><%= __s.passage_font_size_symbol %></span></button></span></li>',
    el: function () {
        return step.util.getPassageContainer(this.model.get("passageId")).find(".passageOptionsGroup");
    },
    items: [
        { initial: "H", key: "display_headings" },
        { initial: "V", key: "display_verseNumbers" },
        { initial: "L", key: "display_separateLines" },
        { initial: "R", key: "display_redLetter" },
        { initial: "N", key: "display_notes" },
        { group: "display_vocab_options", items: [
            { initial: "E", key: "display_englishVocab" },
            { initial: "A", key: "display_greekVocab" },
            { initial: "T", key: "display_transliteration" }]
        },
        { group: "original_language_options", items: [
            { initial: "D", key: "display_divide_hebrew", help: "display_divide_hebrew_help" },
            { initial: "G", key: "display_greek_pointing", help: "display_greek_accents_help" },
            { initial: "U", key: "display_hebrew_vowels", help: "display_hebrew_vowels_help" },
            { initial: "P", key: "display_pointing_include_hebrew", help: "display_pointing_include_hebrew_vowels_help" }
        ]},
        { initial: "M", key: "display_grammar" },
        { initial: "C", key: "display_grammarColor" }
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
                .removeClass("text-info text-warning text-warning").addClass("text-danger")
                .find(".glyphicon").removeClass('glyphicon-exclamation-sign glyphicon-warning-sign glyphicon-info-sign').addClass("glyphicon-exclamation-sign");
        } else if (warningMessages) {
            this.warnings
                .removeClass("text-info text-danger text-warning").addClass("text-warning")
                .find(".glyphicon").removeClass('glyphicon-exclamation-sign glyphicon-warning-sign glyphicon-info-sign').addClass("glyphicon-warning-sign");
        } else {
            this.warnings
                .removeClass("text-info text-danger text-warning").addClass("text-info")
                .find(".glyphicon").removeClass('glyphicon-exclamation-sign glyphicon-warning-sign glyphicon-info-sign').addClass("glyphicon-info-sign");
        }
    }, raiseMessage: function (opts) {
        var titleSoFar = this.warnings.attr("data-content") || "";
        if (titleSoFar != "") {
            titleSoFar += "<p />";
        }

        if(opts.level == 'warning') {
            titleSoFar += '<span class="text-warning glyphicon glyphicon-warning-sign"></span> ';
        } else if(opts.level == 'danger' || opts.level == 'error') {
            titleSoFar += '<span class="text-danger glyphicon glyphicon-exclamation-sign"></span> ';
        } else if(opts.level == 'info') {
            titleSoFar += '<span class="text-info glyphicon glyphicon-info-sign"></span> ';
        }
        titleSoFar += opts.message;
        this.warnings.popover({ html : true });
        this.warnings.attr("data-content", titleSoFar);
        this._updateIcon();
        this.warnings.show();
        if(opts.silent != true) {
            this.warnings.popover('show');
        }
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
            require(["defaults"], function () {
                if (!self.rendered) {
                    self._initUI();
                    self.rendered = true;
                    self._updateDropdownContents(ev.target);
                }
            });
        } else {
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
        previousNext.toggle(isPassage);
        this.$el.find(".contextContainer").toggle(!isPassage);

    },
    _updateDropdownContents: function (targetTrigger) {
        if (this._isDisplayOptionsDropdown(targetTrigger)) {
            this._updateColumnOptions();
        } else if (this._isShareDropdown(targetTrigger)) {
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
        this._updateSortOptions();
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
        if(!isPassage) {
            return;
        }
        
        //make invisible all options except for 'available ones'
        var displayOptions = this.displayOptions.find("li.passage");
        for (var i = 0; i < displayOptions.length; i++) {
            var displayOption = displayOptions.eq(i);
            displayOption.toggle(availableOptions.indexOf(displayOption.find("[data-value]").attr("data-value")) != -1);
        }

        //do we need to show the group headings...
        this.displayOptions.find(".menuGroup").each(function(i, item) {
            var heading = $(item);
            var subOptions = $(heading.data("target")).find("li");
            var visible = false;
            for(var i = 0 ; i < subOptions.length; i++) {
                // if we don't have 'display: ...' then we'll assume visible
                visible = visible || ((subOptions.eq(i).css("display") || "") != "none");
            }

            heading.toggle(visible);
        });

    },
    _updateSearchOptions: function () {

    },
    _updateSortOptions: function() {
        var sortOptions = this.$el.find(".sortOptions");
        //we will only ever show the sort options, if multiple strong numbers are searched for,
        //as well as being a word search
        var searchType = this.model.get("searchType");
        if((searchType == "ORIGINAL_MEANING" ||
            searchType == "ORIGINAL_GREEK_RELATED" ||
            searchType == "ORIGINAL_HEBREW_RELATED") && (this.model.get("strongHighlights") || []).length > 1) {
            sortOptions.toggle(true);   
        } else {
            sortOptions.toggle(false);
        }
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
        var sameLanguaguageAndBible = masterVersion.category == 'BIBLE';
        var masterLanguage = masterVersion.languageCode;
        for (var ii = 0; ii < extraVersions.length; ii++) {
            var extraResource = step.keyedVersions[extraVersions[ii]];
            allHaveStrong = allHaveStrong && extraResource.hasStrongs;
            
            //js: &= gives us a 0 return value
            sameLanguaguageAndBible = sameLanguaguageAndBible && extraResource.languageCode == masterLanguage;
            sameLanguaguageAndBible = sameLanguaguageAndBible && extraResource.category == 'BIBLE';
        }

        this.displayModeContainer.find("a[data-value='INTERLINEAR']").closest("li").toggle(allHaveStrong);
        this.displayModeContainer.find("a[data-value='INTERLEAVED_COMPARE']").closest("li").toggle(sameLanguaguageAndBible);
        this.displayModeContainer.find("a[data-value='COLUMN_COMPARE']").closest("li").toggle(sameLanguaguageAndBible);
    },

    _initUI: function () {
        //create settings dropdown
        var dropdownContainer = $("<div>").addClass("dropdown-menu pull-right").attr("role", "menu");
        this.displayModeContainer = $("<div>");
        var displayMode = $("<h1>").append(__s.display_mode);
        this.displayModeContainer.append(displayMode);
        this.displayModeContainer.append(this._createDisplayModes());
        dropdownContainer.append(this.displayModeContainer);

        this.displayOptions = this._createDisplayOptions();
        this.otherOptions = this._createSearchOptions();
        this.wordSearchOptions = this._createWordSortOptions();
        dropdownContainer
            .append(this.displayOptions)
            .append(_.template("<h1><%= __s.general_options %></h1>")())
            .append(this.otherOptions)
            .append(this.wordSearchOptions);

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
        var displayOptionsHeading = $("<h1>").append(__s.display_options);

        var dropdown = $("<ul>").addClass("passageOptions");
        dropdown.append(this._createPassageOptions(dropdown));
        
        dropdownContainer.append(displayOptionsHeading);
        dropdownContainer.append(dropdown);
        return dropdownContainer;
    },
    getContextLabel: function (context) {
        return sprintf(__s.search_context, context);
    },
    _createWordSortOptions: function () {
        var container = $('<span class="sortOptions"></span>').append($("<h1>").append(__s.word_search_sort_options));
        var dropdown = $("<ul></ul>");
        dropdown.append($("<li>").append(this._createLink('false', __s.scripture, __s.scripture_help)));
        dropdown.append($("<li>").append(this._createLink(VOCAB_SORT, __s.vocabulary, __s.vocabulary_help)));

        var currentOrder = this.model.get("order") || "false";
        this._setVisible(dropdown.find("[data-value='" + currentOrder + "']"), true);
        
        var self = this;
        this._addTickHandlers(dropdown.find("a"), true, function (el) {
            //need to trigger new search after setting value of model 
            var orderCode = el.attr("data-value");
            self.model.save({ order: orderCode, pageNumber: 1 });
        });
        container.append(dropdown);
        return container;
    },
    _createSearchOptions: function () {
        var dropdown = $("<ul></ul>")
        var self = this;
        var context = this.model.get("context") || 0;

        var li = $('<li class="noHighlight contextContainer">').append($('<span class="contextLabel"></span>').append(this.getContextLabel(context)));
        li.append($('<span class="btn-group pull-right"></span>')
            .append('<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-minus"></span></button>')
            .append('<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-plus"></span></button>'));

        li.find("button").click(function (ev) {
            ev.stopPropagation();
            //need to trigger new search after setting value of model 
            var contextVal = self.model.get("context");
            var increment = $(this).find(".glyphicon-minus").length ? -1 : 1;
            if (step.util.isBlank(contextVal)) {
                contextVal = 0;
            } else if (isNaN(contextVal)) {
                contextVal = 0;
            } else {
                contextVal = parseInt(contextVal);
            }
            contextVal += increment;
            if (contextVal < 0) {
                contextVal = 0;
            }
            $(this).closest("li").find(".contextLabel").html(self.getContextLabel(contextVal));
            self.model.save({ context: contextVal});

        });
        //create context link
        dropdown.append(li);
        dropdown.append(_.template(this.fontButtons)())
            .find(".smallerFontSize").click(this.decreaseFontSize).end()
            .find(".largerFontSize").click(this.increaseFontSize);


        return dropdown;

    },
    /**
     * creates items into the provided container,
     * @param dropdown the container
     * @param items the items to iterate over
     * @private
     */
    _createItemsInDropdown: function(dropdown, items) {
//        <div class="panel-group" id="accordion">


        var selectedOptions = this.model.get("selectedOptions") || "";
        for (var i = 0; i < items.length; i++) {
            if(items[i].group) {
                var panel = $('<div class="panel panel-default">');

                var collapseHeader =
                    '<a data-toggle="collapse" class="menuGroup" data-parent="#displayOptions-' + this.model.get("passageId") + '" ' +
                    'data-target="#displayOptions-' + items[i].group + this.model.get("passageId") + '">'
                    + __s[items[i].group] +
                    '<span class="caret"></span></a>';
                var collapseBody = $('<div class="panel-collapse collapse"></div>').attr("id", 'displayOptions-' + items[i].group + this.model.get("passageId") );
                var panelBody = $("<div class='panel-body'>");
                collapseBody.append(panelBody);
                this._createItemsInDropdown(panelBody, items[i].items || []);

                panel.append(collapseHeader).append(collapseBody);
                dropdown.append(panel);
            } else {
                var link = this._createLink(items[i].initial, __s[items[i].key], __s[items[i].help]);
                this._setVisible(link, selectedOptions.indexOf(items[i].initial) != -1);
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

        links.filter("[data-toggle]").on('click', function(ev) {
            ev.stopPropagation();

            var target = $($(this).closest("[data-target]").data("target"));
            target.collapse("toggle", !target.hasClass("in"));
        });

        return dropdown;
    },
    _addTickHandlers: function (target, grouped,handler) {
        var self = this;
        target.click(function (e) {
            e.stopPropagation();
            var el = $(this);
            if(grouped) {
                //then untick all others
                $.each(el.closest("ul").find("a"), function() { 
                    self._setVisible($(this), false);
                });
                self._setVisible(el, true);
            } else {
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

    _setVisible: function (link, visible) {
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
        } else {
            this.sharingBar.empty();
        }

        var url = step.router.getShareableColumnUrl(this.model.get("passageId"), true);

        //do google plus
        if (window.gapi != undefined) {
            var gPlusOne = $('<g:plusone size="medium"></g:plusone>');
            gPlusOne.attr("href", url);
            this.sharingBar.append($("<li>").append(gPlusOne));
            window.gapi.plusone.go(this.sharingBar.get(0));
        }

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
            var facebook = $('<fb:share-button type="button_count"></fb:share-button>').attr("href", url);
            this.sharingBar.append($("<li>").append(facebook));
            window.FB.XFBML.parse(facebook.parent().get(0));
        }
    },
    decreaseFontSize: function (ev) {
        ev.stopPropagation();
        step.util.activePassageId(this.model.get("passageId"));
        step.util.changeFontSize(this.$el, -1);
        return false;
    },
    increaseFontSize: function (ev) {
        ev.stopPropagation();
        step.util.activePassageId(this.model.get("passageId"));
        step.util.changeFontSize(this.$el, 1);
        return false;
    },
    goToPreviousChapter: function () {
        this.goToSiblingChapter(this.model.get("previousChapter"));
    },
    goToNextChapter: function () {
        this.goToSiblingChapter(this.model.get("nextChapter"));
    },
    goToSiblingChapter: function (key) {
        step.util.activePassageId(this.model.get("passageId"));

        var args = this.model.get("args") || "";

        //remove all references from the args
        args = args
            .replace(/reference=[0-9a-zA-Z :.;-]+/ig, "")
            .replace(/&&/ig, "")
            .replace(/&$/ig, "");

        if (args.length > 0 && args[args.length - 1] != '|') {
            args += "|";
        }
        args += "reference=" + key.osisKeyId;
        step.router.navigateSearch(args);
    },
    /**
     * Closes the whole column by removing it from the DOM
     */
    closeColumn: function () {
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
            var linkTargetModel = step.passages.findWhere({ passageId: linkTarget });
            if (linkTargetModel) {
                //not much to do, except remove the icon
                step.util.getPassageContainer(linkTargetModel.get("passageId")).find(".glyphicon-link").remove();
            }
        }

        if (linkedPassageIds.length > 0) {
            step.util.activePassageId(linkedPassageIds[0]);
        } else {
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
        this.$el.find(".closeColumn").toggle(shouldShow);
        if (!shouldShow) {
            //make sure it's not the last button
            this.$el.find(".closeColumn").insertBefore(this.$el.find(".openNewPanel"));
        } else {
            //ensure last element
            this.$el.find(".openNewPanel").insertBefore(this.$el.find(".closeColumn"));
        }
    }
});