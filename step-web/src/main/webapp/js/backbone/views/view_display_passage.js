var PassageDisplayView = Backbone.View.extend({
        el: function () {
            return $(".passageContainer").eq(this.model.get("passageId"));
        },
        initialize: function () {
            Backbone.Events.on("passage:new:" + this.model.get("passageId"), this.render, this);
            Backbone.Events.on("font:change:" + this.model.get("passageId"), this.handleFontSizeChange, this);

            this.passageContent = this.$el.find(".passageContent");
            step.fonts.fontButtons(this.$el, true);

            $(".passageSizeButtons").buttonset();
            $(".passageLookupButtons").buttonset();

            Backbone.Events.on("window-resize", this._doChromeHack, this);
        },

        render: function (newPassage) {
            step.util.trackAnalytics("passage", "loaded", "time", new Date().getTime() - newPassage.startTime);
            step.util.trackAnalytics("passage", "version", this.model.get("version"));
            step.util.trackAnalytics("passage", "reference", newPassage.reference);

            //set the range attributes, silently, so as not to cause events
            this.model.set("startRange", newPassage.startRange, {silent: true });
            this.model.set("endRange", newPassage.endRange, {silent: true });
            this.model.set("multipleRanges", newPassage.multipleRanges, {silent: true });


            var passageHtml = $(newPassage.value);
            var passageId = this.model.get("passageId");
            var interlinearMode = this.model.get("interlinearMode");
            var extraVersions = this.model.get("extraVersions");
            var reference = this.model.get("reference");
            var options = this.model.get("options");
            var version = this.model.get("version");
            var languages = newPassage.languageCode;

            if (this._isPassageValid(passageHtml, reference)) {
                this._doFonts(passageHtml, options, interlinearMode, languages);
                this._doInlineNotes(passageHtml, passageId);
                this._doSideNotes(passageHtml, passageId, version);
                this._doNonInlineNotes(passageHtml);

                this._doVerseNumbers(passageId, passageHtml, options, interlinearMode, version);
//        self.doStats(passageId, passageContent, lookupVersion, text.reference);
                this._doHideEmptyNotesPane(passageHtml);
                this._adjustTextAlignment(passageHtml);
                step.fonts.redoTextSize(passageId, passageHtml);
                this._addStrongHandlers(passageId, passageHtml);
                this._doDuplicateNotice(passageId, passageHtml);
                this._updatePageTitle(passageId, passageHtml, version, reference);
                this._doTransliterations(passageHtml);
                this._doInterlinearDividers(passageHtml);
                this._doVersions(passageId, passageHtml, version, reference);
                this._doAnalysisButton(passageId, passageHtml, interlinearMode);
                this._doSocial();
                step.util.closeInfoErrors(passageId);
                step.util.ui.emptyOffDomAndPopulate(this.passageContent, passageHtml);

                //needs to happen after appending to DOM
                this._doChromeHack(undefined, passageHtml, interlinearMode, options);
                this.doInterlinearVerseNumbers(passageHtml, interlinearMode, options);
                Backbone.Events.trigger("passage:rendered:" + passageId);
            }
        },

        //Can be removed when/if Chrome fixes this
        _doChromeHack: function (eventName, passageHtml, interlinearMode, options) {
            //only applies to Chrome
            if (!$.isChrome) {
                return;
            }

            if (!passageHtml) {
                passageHtml = this.passageContent;
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

        _doAnalysisButton: function (passageId, passageHtml, interlinearMode) {
            var analysisButton = $("<span></span>");
            analysisButton.prepend(__s.stats_analysis_button).addClass("analysisButton");

            analysisButton.button({ text: true });

            switch (interlinearMode) {
                case "NONE":
                    passageHtml.find("h2:first").append(analysisButton);
                    break;
                case "INTERLINEAR":
                    analysisButton.insertBefore(passageHtml.find(".interlinear:first"));
                    break;
                case "INTERLEAVED":
                case "INTERLEAVED_COMPARE":
                    analysisButton.insertBefore(passageHtml.find(".verseGrouping:first"));
                    break;
                case "COLUMN":
                case "COLUMN_COMPARE":
                    analysisButton.insertBefore(passageHtml.find("table:first"));
                    break;
                default:
                    console.log("Unable to ascertain where to put Analysis button - omitting");
                    return;
            }
            analysisButton.click(function () {
                step.lexicon.wordleView.passageId = passageId;
                lexiconDefinition.reposition(step.defaults.infoPopup.wordleTab);
            });
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

        _doSocial: function () {
            step.util.ui.doSocialButtons(this.$el.find(".passageToolbarContainer"));
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
                this.passageContent.html(errorMessage);
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

                link.attr("title", note.html());
                link.qtip({
                    position: {
                        my: "center " + myPosition,
                        at: "center " + atPosition
                    },
                    style: { classes: "visibleInlineNote" },
                    events: {
                        show: function () {
                            var qtipApi = $(this).qtip("api");
                            var qtipOffset = qtipApi.elements.target.offset();
                            var yPosition = qtipOffset.top;
                            var centerPane = $("#centerPane");
                            var xPosition = centerPane.offset().left;

                            if (xPosition == 0) {
                                //most likely in 2 column view, so attempt to place on the same axis as
                                //where we currently are...
                                xPosition = $(".leftColumn").width();
                            }


                            if (passageId == 1) {
                                xPosition += centerPane.width();
                            }

                            var currentPosition = $(this).qtip("option", "position");
                            currentPosition.target = [xPosition, yPosition];
                        }
                    }
                });
            }
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

            var xrefs = $(".notesPane [xref]", passageContent);
            for (var i = 0; i < xrefs.length; i++) {
                var item = xrefs.eq(i);
                var xref = item.attr("xref");

                item.click(function (e) {
                    e.preventDefault();
                });

                this._makeSideNoteQtip(item, xref, myPosition, atPosition, version);
            }
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
            item.mouseover(function () {
                if(!$.data(item, "initialised")) {
                    item.qtip({
                        position: { my: "top " + myPosition, at: "top " + atPosition, viewport: $(window) },
                        style: { tip: false, classes: 'draggable-tooltip', width: { min: 800, max: 800} },
                        show: { event: 'click' }, hide: { event: 'click' },
                        content: {
                            text: function (event, api) {
                                $.getSafe(BIBLE_GET_BIBLE_TEXT + version + "/" + encodeURIComponent(xref), function (data) {
                                    api.set('content.title.text', data.longName);
                                    api.set('content.text', data.value);
                                });
                            },
                            title: { text: xref, button: false }
                        },
                        events: {
                            render: function (event, api) {
                                $(this).draggable({
                                    containment: 'window',
                                    handle: api.elements.titlebar
                                });
    
                                $(api.elements.titlebar).css("padding-right", "0px");
    
                                $(api.elements.titlebar).prepend(goToPassageArrowButton(true, version, xref, "leftPassagePreview"));
                                $(api.elements.titlebar).prepend(goToPassageArrowButton(false, version, xref, "rightPassagePreview"));
                                $(api.elements.titlebar).prepend($("<a>&nbsp;</a>").button({ icons: { primary: "ui-icon-close" }}).addClass("closePassagePreview").click(function () {
                                    api.hide();
                                }));
    
                                $(".leftPassagePreview, .rightPassagePreview", api.elements.titlebar)
                                    .first().button({ icons: { primary: "ui-icon-arrowthick-1-e" }})
                                    .next().button({ icons: { primary: "ui-icon-arrowthick-1-w" }}).end()
                                    .click(function () {
                                        api.hide();
                                    });
                            }
                        }
                    });
                    //set to initialized
                    $.data(item, "initialised", true);
                }
            });
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
            var inlineLink = $(".notesPane strong", passageContent).filter(function () {
                return $(this).text() == link.text();
            }).closest(".margin"); 
            
            $(link).hover(function () {
                inlineLink.addClass("ui-state-highlight");
            }, function () {
                inlineLink.removeClass("ui-state-highlight");
            });

            $(inlineLink).hover(function () {
                link.addClass("inlineNoteHighlight");
            }, function () {
                link.removeClass("inlineNoteHighlight");
            });
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

            var self = this;
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
            if ($(".ltr:first", passageContent).size() > 0 || $("[dir='ltr']:first", passageContent).size() > 0 || $(".ltrDirection:first", passageContent).size() > 0) {
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
         * Change the transliterations and format them
         * @param passageContent
         * @private
         */
        _doTransliterations: function (passageContent) {
            var transliterations = $(".stepTransliteration", passageContent);
            for (var i = 0; i < transliterations.length; i++) {
                step.util.ui.markUpTransliteration(transliterations.eq(i));
            }
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
                this.$el.find(".passageContent"),
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