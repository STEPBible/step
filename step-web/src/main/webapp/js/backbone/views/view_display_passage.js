var PassageDisplayView = Backbone.View.extend({
        el: function () {
            var passageContainer = step.util.getPassageContainer(this.model.get("passageId"));
            var passageContent = passageContainer.find(".passageContent");
            if (passageContent.length == 0) {
                passageContent = $('<div class="passageContent"></div>');
                passageContainer.find(".passageText").append(passageContent);
            }
            return passageContent;
        },
        initialize: function (options) {
            this.listenTo(this.model, "destroyViews", this.remove);
            this.listenTo(this.model, "destroy-column", this.remove);
            this.listenTo(this.model, "font:change", this.handleFontSizeChange, this);
            this.partRendered = options.partRendered;
            this.render();
        },

        render: function () {
            step.util.trackAnalytics("passage", "loaded", "time", new Date().getTime() - this.model.get("startTime"));
            step.util.trackAnalytics("passage", "version", this.model.get("version"));
            step.util.trackAnalytics("passage", "reference", this.model.get("reference"));

            //set the range attributes, silently, so as not to cause events
            this.model.set("startRange", this.model.get("startRange"), {silent: true });
            this.model.set("endRange", this.model.get("endRange"), {silent: true });
            this.model.set("multipleRanges", this.model.get("multipleRanges"), {silent: true });

            var passageHtml;
            if (this.partRendered) {
                passageHtml = this.$el.find(".passageContentHolder");
            } else {
                passageHtml = $(this.model.get("value"));
            }
            var passageId = this.model.get("passageId");
            var interlinearMode = this.model.get("interlinearMode");
            var extraVersions = this.model.get("extraVersions");
            var reference = this.model.get("osisId");
            var options = this.model.get("selectedOptions") || [];
            var version = this.model.get("masterVersion");
            var languages = this.model.get("languageCode");
            var passageContainer = this.$el.closest(".passageContainer");
            if (this._isPassageValid(passageHtml, reference)) {
                passageContainer.find(".resultsLabel").html("");
                this._warnIfNoStrongs(version);
                this._warnIfFirstTimeCompare(interlinearMode);
                this._warnCommentaryLookupVersion(version, extraVersions);
                this._doFonts(passageHtml, options, interlinearMode, languages);
                this._doInlineNotes(passageHtml, passageId);
                this._doSideNotes(passageHtml, passageId, version);
                this._doNonInlineNotes(passageHtml);
                this._doVerseNumbers(passageId, passageHtml, options, interlinearMode, version);
                this._doHideEmptyNotesPane(passageHtml);
                this._adjustTextAlignment(passageHtml);
                step.util.restoreFontSize(this.model, passageHtml);
//TODO:                step.fonts.redoTextSize(passageId, passageHtml);
                TODO:                this._addStrongHandlers(passageId, passageHtml);
                this._doDuplicateNotice(passageId, passageHtml);
                this._updatePageTitle(passageId, passageHtml, version, reference);
                this._doInterlinearDividers(passageHtml);
//TODO:                this._doVersions(passageId, passageHtml, version, reference);

                if (!this.partRendered) {
                    step.util.ui.emptyOffDomAndPopulate(this.$el, passageHtml);
                }

                //needs to happen after appending to DOM
                this._doChromeHack(undefined, passageHtml, interlinearMode, options);
                this.doInterlinearVerseNumbers(passageHtml, interlinearMode, options);
                this.scrollToTargetLocation(passageContainer);
            }
        },
        scrollToTargetLocation: function (passageContainer) {
            //get current column target data
            var column = passageContainer.closest(".column");
//            var passageContent = passageContainer.find(".passageContent");
            var currentTarget = this.model.get("targetLocation");
            if (currentTarget) {
                var link = passageContainer.find("[name='" + currentTarget + "']");
                var linkOffset = link.offset();
                var scroll = linkOffset == undefined ? 0 : linkOffset.top + passageContainer.scrollTop();

                var originalScrollTop = -100;
                passageContainer.animate({
                    scrollTop: originalScrollTop + scroll
                }, 500);

                $(link).closest(".verse").addClass("secondaryBackground");

                //also do so if we are looking at an interlinear-ed version
                $(link).closest(".interlinear").find("*").addClass("secondaryBackground");

                //reset the data attribute
                this.model.save({ targetLocation: null }, { silent: true });
            }
        },
        _warnCommentaryLookupVersion: function (version, extraVersions) {
            //if any of the versions are commentaries, then warn about reference lookups...
            var vs = [];
            vs.push(version);
            if (extraVersions) {
                vs = vs.concat(extraVersions.split(','));
            }
            var keyed = _.map(vs, function (v) {
                return step.keyedVersions[v];
            });
            var hasCommentaries = _.findWhere(keyed, { category: 'COMMENTARY' }) != null;
            if (hasCommentaries) {
                //find out which Bible should be used
                var firstBible = _.findWhere(keyed, {category: 'BIBLE' });
                if (firstBible == null) {
                    step.util.raiseInfo(sprintf(__s.commentary_version_default), 'info', this.model.get("passageId"), null, true);
                    return;
                }
                step.util.raiseInfo(sprintf(__s.commentary_version, firstBible.initials), 'info', this.model.get("passageId"), null, true);
            }
        },
        _warnIfFirstTimeCompare: function (interlinearMode) {
            if (interlinearMode != "INTERLEAVED" && interlinearMode != "COLUMN" &&
                interlinearMode != "NONE" && interlinearMode != "INTERLINEAR") {
                var warnings = step.settings.get("noStrongCompareWarning") || {};
                step.util.raiseInfo(__s.error_warn_no_strongs_when_compare, null, this.model.get("passageId"), null, warnings[interlinearMode]);
                warnings[interlinearMode] = true;
                step.settings.save({
                    noStrongCompareWarning: warnings
                });
            }
        },
        _warnIfFirstTimeCompare: function (interlinearMode) {
            if (interlinearMode != "INTERLINEAR") {
                return;
            }

            var warning = step.settings.get("warnInterlinearFirstTime") || false;
            step.util.raiseInfo(__s.warn_interlinear_view_selected, null, this.model.get("passageId"), null, warning);
            step.settings.save({
                warnInterlinearFirstTime: true
            });

        },
        _warnIfNoStrongs: function (masterVersion) {
            if (!step.keyedVersions) {
                //for some reason we have no versions
                console.warn("No versions have been loaded.")
                return;
            }

            if (step.keyedVersions[masterVersion].hasStrongs || step.keyedVersions[masterVersion].category != 'BIBLE') {
                return false;
            }

            var warnings = step.settings.get("noStrongWarnings") || {};
            step.util.raiseInfo(__s.error_warn_if_no_strongs, null, this.model.get("passageId"), null, warnings[masterVersion]);
            warnings[masterVersion] = true;
            step.settings.save({
                noStrongWarnings: warnings
            });
        },
        //Can be removed when/if Chrome fixes this
        _doChromeHack: function (eventName, passageHtml, interlinearMode, options) {
            //only applies to Chrome
            if (!$.isChrome) {
                return;
            }

            if (!passageHtml) {
                passageHtml = this.$el;
            }

            if (!interlinearMode) {
                if (this.model == undefined) {
                    //no point in continuing if no model, since there can't be much on the page.
                    return;
                }
                interlinearMode = this.model.get("interlinearMode");
            }

            if (!options) {
                options = this.model.get("options");
            }


            if (!this._isInterlinearMode(interlinearMode, options)) {
                return;
            }
            var interlinearBlocks = passageHtml.find(".interlinear span.w");

            //reset the 'clear' values
            interlinearBlocks.not(".verseStart").css("clear", "none");
            var previousElementOffset = undefined;

            for (var i = 0; i < interlinearBlocks.length; i++) {
                var element = interlinearBlocks.eq(i);
                var elementOffset = element.offset();

                //skip the first element
                if (previousElementOffset) {
                    //check that previous element is either left or higher up
                    var currentPadding = 0;
                    if (previousElementOffset.top < elementOffset.top) {
                        element.css("clear", "left");
                    }
                    elementOffset = element.offset();
                }
                previousElementOffset = elementOffset;
            }
        },
        _doDuplicateNotice: function (passageId, passageHtml) {
            var notices = $(".versification-notice", passageHtml);
            for (var ii = 0; ii < notices.length; ii++) {
                var notice = notices.eq(ii);
                var noticeType = notice.attr("international");
                notice.attr("title", __s[noticeType]);
                if (notice.hasClass("duplicate")) {
                    notice.css("float", "left");
                }
            }
        },

        _doInterlinearDividers: function (passageContent) {
            $(".w:not([strong]):not(.verseStart)", passageContent).next().css("border-left", "none");
        },

        _doVersions: function (passageId, passageContent, version, reference) {
            step.alternatives.enrichPassage(passageId, passageContent, version, reference);
        },

        /**
         *
         * Checks whether something is unicode, and if so, then sets up the unicode fonts.
         * @param passageContent passage html containing all the html content, wrapped
         * @param options the set of options currently selected.
         * @param interlinearMode the interlinear mode.
         * @param languages The languages for each line - PLEASE NOTE, these are CHANGED
         * @private
         */
        _doFonts: function (passageContent, options, interlinearMode, languages) {
            var originalLanguageLength = languages.length;

            //for interlinear options, we need to splice in a few extra languages.
            var indexToSplice = 1;
            if (options.indexOf("E") != -1) {
                languages.splice(indexToSplice++, 0, "en");
            }
            if (options.indexOf("T") != -1) {
                languages.splice(indexToSplice++, 0, "en");
            }
            if (options.indexOf("A") != -1) {
                languages.splice(indexToSplice++, 0, "he");
            }
            if (options.indexOf("M") != -1) {
                languages.splice(indexToSplice++, 0, "en");
            }

            //do display options make it an interlinear
            var isInterlinearOption = languages.length != originalLanguageLength;

            var fonts = step.util.ui._getFontClasses(languages);
            if (interlinearMode == "INTERLINEAR" || isInterlinearOption) {
                //we inspect each line in turn, and stylise each block.
                step.util.ui._applyCssClassesRepeatByGroup(passageContent, ".w", fonts, function (child) {
                    return child.parent().hasClass("verseStart");
                });
            } else if (interlinearMode.indexOf("INTERLEAVED") != -1) {
                step.util.ui._applyCssClassesRepeatByGroup(passageContent, ".verseGrouping", fonts, undefined, 1);
            } else if (interlinearMode.indexOf("COLUMN") != -1) {
                step.util.ui._applyCssClassesRepeatByGroup(passageContent, "tr.row", fonts, undefined, 1);
            } else {
                //normal mode, so all we need to do is check the language version, and if greek or hebrew then switch the font
                if (fonts[0]) {
                    passageContent.addClass(fonts[0]);
                }
            }
        },

        /**
         * Checks that the content returned by the server has stuff in it...
         * @param passageHtml
         * @returns {boolean}
         * @private
         */
        _isPassageValid: function (passageHtml, reference) {
            if (passageHtml.find(":not(.xgen):first").length == 0) {
                var message = sprintf(__s.error_bible_doesn_t_have_passage, reference);
                var errorMessage = $("<span>").addClass("notApplicable").html(message);
                this.$el.html(errorMessage);
                return false;
            }
            return true;
        },

        /**
         *
         * @param passageContent the content that we are processing
         * @param passageId
         * @private
         */
        _doInlineNotes: function (passageContent, passageId) {
            var myPosition = passageId == 0 ? "left" : "right";
            var atPosition = passageId == 0 ? "right" : "left";

            var notes = $(".verse .note", passageContent).has(".inlineNote");
            for (var i = 0; i < notes.length; i++) {
                var item = notes.get(i);
                var link = $("a", item);
                var note = $(".inlineNote", item);
                this._doInlineNoteQtip(link, note);
            }
        },
        _doInlineNoteQtip: function (link, note) {
            link.attr("title", note.html());
            require(["qtip"], function () {
                link.qtip({
                    position: {
                        my: "top left",
                        at: "top left"
                    },
                    style: { classes: "visibleInlineNote", tip: false },
                    events: {
                        show: function () {
                            var qtipApi = $(this).qtip("api");
                            var qtipOffset = qtipApi.elements.target.offset();
                            var currentPosition = $(this).qtip("option", "position");
                            currentPosition.target = [0, 0];
                        }
                    }
                });
            });
        },


        /**
         * Sets up qtip on all side notes
         * @param passageId the passage id
         * @param passageContent the html content
         * @param version the current version
         * @private
         */
        _doSideNotes: function (passageContent, passageId, version) {
            var self = this;
            var myPosition = passageId == 0 ? "left" : "right";
            var atPosition = passageId == 0 ? "right" : "left";

            var xrefs = $("[xref]", passageContent);
            for (var i = 0; i < xrefs.length; i++) {
                var item = xrefs.eq(i);
                var xref = item.attr("xref");

                item.click(function (e) {
                    e.preventDefault();
                });

                this._makeSideNoteQtip(item, xref, myPosition, atPosition, version);
            }
        },

        keepNotesInSync: function (passageContent) {
            var currentHeight = passageContent.height();
            passageContent.find(".notesPane").height(currentHeight);
            $(passageContent).on('scroll', function () {
                //find top verse - 1.
                var allVerses = $(".verse", passageContent);
                var lastVerse = undefined;
                for (var ii = 0; ii < allVerses.length; ii++) {
                    var currentVerse = $(allVerses[ii]);
                    var versePosition = currentVerse.position().top;
                    if (top >= 0) {
                        break;
                    }
                    lastVerse = currentVerse;
                }

                if (lastVerse == undefined) {
                    passageContent.find(".notesPane").scrollTop(0);
                } else {

                }
            });
        },

        /**
         * Creates a QTIP for a particular xref
         * @param item the item which is targetted in the side note bar
         * @param xref the actual cross-reference
         * @param myPosition the my position
         * @param atPosition the at position
         * @param version the version to be used for lookups
         * @private
         */
        _makeSideNoteQtip: function (item, xref, myPosition, atPosition, version) {
            var self = this;
            item.on("mouseover", function () {
                self._makeSideNoteQtipHandler(item, xref, myPosition, atPosition, version, false);
            }).on("touchstart", function () {
                self._makeSideNoteQtipHandler(item, xref, myPosition, atPosition, version, true);
            });
        },
        _makeSideNoteQtipHandler: function (item, xref, myPosition, atPosition, version, touch) {
            var self = this;
            if (!$.data(item, "initialised")) {
                require(["qtip", "drag"], function () {
                    item.qtip({
                        position: { my: "top " + myPosition, at: "top " + atPosition, viewport: $(window) },
                        style: { tip: false, classes: 'draggable-tooltip', width: { min: 800, max: 800} },
                        show: { event: 'click' }, hide: { event: 'click' },
                        content: {
                            text: function (event, api) {
                                var chosenVersion = version;
                                if (step.keyedVersions[version] && step.keyedVersions[version].category != 'BIBLE') {
                                    //get the first version in the current search that is non-commentary
                                    var allVersions = _.where(self.model.get("searchTokens"), {itemType: VERSION });
                                    chosenVersion = 'ESV';
                                    for (var i = 0; i < allVersions.length; i++) {
                                        var keyedVersion = step.keyedVersions[(allVersions[i].item || {}).initials];
                                        if (keyedVersion != null && keyedVersion.category == 'BIBLE') {
                                            chosenVersion = keyedVersion.initials;
                                        }
                                    }
                                }

                                $.getSafe(BIBLE_GET_BIBLE_TEXT + chosenVersion + "/" + encodeURIComponent(xref), function (data) {
                                    api.set('content.title.text', data.longName);
                                    api.set('content.text', data.value);
                                    api.set('content.osisId', data.osisId)
                                });
                            },
                            title: { text: xref, button: false }
                        },
                        events: {
                            render: function (event, api) {
                                $(api.elements.titlebar).css("padding-right", "0px");
                                $(api.elements.titlebar)
                                    .prepend($('<span class="glyphicon glyphicon-new-window openRefInColumn"></span>')
                                        .click(function () {
                                            step.util.createNewLinkedColumnWithScroll(self.model.get("passageId"), api.get("content.osisId"), true);
                                        })).prepend($('<button type="button" class="close" aria-hidden="true">&times;</button>').click(function () {
                                        api.hide();
                                    }));
                            },
                            visible: function (event, api) {
                                var tooltip = api.elements.tooltip;
                                var selector = touch ? ".qtip-title" : ".qtip-titlebar";
                                if (touch) {
                                    tooltip.find(".qtip-title").css("width", "90%");
                                }
                                new Draggabilly($(tooltip).get(0), {
                                    containment: 'body',
                                    handle: selector
                                });
                            }
                        }
                    });
                    //set to initialized
                    $.data(item, "initialised", true);

                });
            }
        },

        /**
         * Looks at non-inline notes and renders those!
         * @param passageContent
         * @private
         */
        _doNonInlineNotes: function (passageContent) {
            var verseNotes = $(".verse .note", passageContent);
            var nonInlineNotes = verseNotes.not(verseNotes.has(".inlineNote"));

            for (var i = 0; i < nonInlineNotes.length; i++) {
                var link = this._doHighlightNoteInPane(passageContent, $("a", nonInlineNotes.eq(i)));
            }
        },

        /**
         * Highlights the note in the side pane
         * @private
         */
        _doHighlightNoteInPane: function (passageContent, link) {
            var self = this;
            var inlineLink = $(".notesPane strong", passageContent).filter(function () {
                return $(this).text() == link.text();
            }).closest(".margin");

            var links = $(inlineLink).add(link);

            $(links).hover(function () {
                    self._highlightBothLinks(links);
                },
                function () {
                    self._unhighlighBothLinks(links);
                });
            $(links).on("touchstart", function () {
                self._highlightBothLinks(links);
            });
            $(links).on("touchend", function () {
                self._unhighlighBothLinks(links)
            });
        },
        _highlightBothLinks: function (links) {
            links.addClass("secondaryBackground");
        },
        _unhighlighBothLinks: function (links) {
            links.removeClass("secondaryBackground");
        },

        /**
         * Enhances verse numbers with their counts and related subjects popup
         * @param passageId
         * @param passageContent
         * @param options
         * @param interlinearMode
         * @param reference
         * @private
         */
        _doVerseNumbers: function (passageId, passageContent, options, interlinearMode, version) {
            //if interleaved mode or column mode, then we want this to continue
            //if no options, or no verse numbers, then exit
            var hasVerseNumbersByDefault = interlinearMode != undefined && interlinearMode != "" && interlinearMode != 'INTERLINEAR';

            if (options == undefined || (options.indexOf("V") == -1 && !hasVerseNumbersByDefault)) {
                //nothing to do:
                return;
            }

            step.util.ui.enhanceVerseNumbers(passageId, passageContent, version);
        },

        _doHideEmptyNotesPane: function (passageContent) {
            var notes = $(".notesPane", passageContent);

            if (notes.text().trim().length == 0) {
                notes.toggle(false);
            }
        },

        _adjustTextAlignment: function (passageContent) {
            //if we have only rtl, we right-align, so
            //A- if any ltr, then return immediately
            if (passageContent.attr("dir") == 'ltr' ||
                $(".ltr:first", passageContent).size() > 0 ||
                $("[dir='ltr']:first", passageContent).size() > 0 ||
                $(".ltrDirection:first", passageContent).size() > 0) {
                return;
            }

            //if no ltr, then assume, rtl
            passageContent.addClass("rtlDirection");
        },

        _updatePageTitle: function (passageId, passageContent, version, reference) {
            var clonedVerse = $(".verse:first", passageContent).clone();
            clonedVerse.find(".verseNumber, .note, sup").remove();

            var title = reference + " | " + version + " | STEP | " + clonedVerse.text();
            $("title").html(title);
        },

        _addStrongHandlers: function (passageId, passageContent) {
            step.util.ui.addStrongHandlers(passageId, passageContent)
        },

        /**
         * Estimates the height of each block in an interlinear like way
         * @param individualBlocks each individual block in an interlinear.
         * @returns {Array}
         * @private
         */
        _getBlockSizes: function (individualBlocks) {
            //get sizes
            var sizes = [];
            var obtainedSizes = 0;
            for (var i = 0; i < individualBlocks.length; i++) {
                var block = individualBlocks.eq(i);
                var blockChildren = block.children();

                //initialise if not already done
                if (sizes.length == 0) {
                    for (var j = 0; j < blockChildren.length; j++) {
                        sizes.push(0);
                    }
                }

                if (block.hasClass("verseStart")) {
                    continue;
                }

                for (var j = 0; j < blockChildren.length; j++) {
                    var blockChild = blockChildren.eq(j);
                    if (!step.util.isBlank(blockChild.text())) {
                        if (sizes[j] == 0) {
                            sizes[j] = blockChild.height();
                            obtainedSizes++;
                        }
                    }

                }
                if (obtainedSizes == sizes.length) {
                    break;
                }
            }
            return sizes;
        },

        handleFontSizeChange: function () {
            this.doInterlinearVerseNumbers(
                this.$el,
                this.model.get("interlinearMode"),
                this.model.get("options"));
        },

        _isInterlinearMode: function (interlinearMode, options) {
            return options.indexOf("E") != -1 ||
                options.indexOf("T") != -1 ||
                options.indexOf("A") != -1 ||
                options.indexOf("M") != -1 ||
                interlinearMode == "INTERLINEAR"
        },

        /**
         * Resizes the interlinear verse numbers to line them up properly against their counter-part text nodes.
         * @param interlinearMode
         */
        doInterlinearVerseNumbers: function (passageContent, interlinearMode, options) {
            if (this._isInterlinearMode(interlinearMode, options)) {

                var targetParentElement = passageContent;
                if (!targetParentElement.hasClass("passageContentHolder")) {
                    targetParentElement = targetParentElement.find(".passageContentHolder");
                }

                //obtain heights first...
                var individualBlocks = targetParentElement.children().children();
                if (individualBlocks.length == 0) {
                    return;
                }

                var sizes = this._getBlockSizes(individualBlocks);

                //do verse numbers
                var verseNumbers = $(".verseStart", targetParentElement);
                for (var k = 0; k < verseNumbers.length; verseNumbers++) {
                    var verseBlocks = verseNumbers.eq(k).children();
                    for (var i = 0; i < verseBlocks.length; i++) {
                        if (i < sizes.length && sizes[i] != 0) {
                            verseBlocks.eq(i).height(sizes[i]).css('line-height', sizes[i] + "px");
                        }
                    }
                }

                //do all empty nodes as well.
                var allTextNodes = individualBlocks.not(".verseStart").children();
                for (var index = 0; index < allTextNodes.length; index++) {
                    var potentialNode = allTextNodes.eq(index);
                    if (potentialNode.hasClass("w")) {
                        //we're looking at a parent element, so do the same for the children
                        var wChildren = potentialNode.children();
                        for (var j = 0; j < wChildren.length; j++) {
                            wChildren.eq(j).height(sizes[j]).css('line-height', sizes[j] + "px")
                        }
                    } else if (step.util.isBlank(potentialNode.text())) {
                        //work out index
                        var indexInParent = potentialNode.index();
                        if (indexInParent < sizes.length && sizes[indexInParent] != 0) {
                            potentialNode.height(sizes[indexInParent]).css('line-height', sizes[indexInParent] + "px");
                        }
                    }
                }
            }
        }
    })
    ;