var PassageDisplayView = DisplayView.extend({
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
            this.listenTo(this.model, "afterRender", this.scrollToTargetLocation, this);
            this.partRendered = options.partRendered;
            this.render();
        },

        render: function () {
            //set the range attributes, silently, so as not to cause events
            this.model.set("startRange", this.model.get("startRange"), {silent: true});
            this.model.set("endRange", this.model.get("endRange"), {silent: true});
            this.model.set("multipleRanges", this.model.get("multipleRanges"), {silent: true});
            var options = this.model.get("selectedOptions") || [];
            var availableOptions = this.model.get("options") || [];
            // should be const instead of var, but not compatible with older browser
            // This must match the definition in the color_code_grammar.js
            // Do not take away the TBRMBR comment (to be removed by maven replacer
            var C_colorCodeGrammarAvailableAndSelected = 0; // TBRBMR
            cv[C_colorCodeGrammarAvailableAndSelected] = (options.indexOf("C") > -1) && (availableOptions.indexOf("C") > -1);
            if ((cv[C_colorCodeGrammarAvailableAndSelected]) && (typeof c4 === "undefined")) cf.initCanvasAndCssForClrCodeGrammar(); //c4 is currentClrCodeConfig.  It is called to c4 to save space
            var passageHtml, ntCSSOnThisPage = '', otCSSOnThisPage = '', pch, hasTOS = false, hasNTMorph = false;
            var reference = this.model.get("osisId");
            var version = this.model.get("masterVersion");
            var extraVersions = this.model.get("extraVersions");
            var bibleVersions = version.toUpperCase() + "," + extraVersions.toUpperCase();
            var r = step.util.getTestamentAndPassagesOfTheReferences(reference.split(" "));
            var justLoadedTOS = false;
            if (((bibleVersions.indexOf('ESV') > -1) || (bibleVersions.indexOf('THOT') > -1) || (bibleVersions.indexOf('OHB') > -1) || (bibleVersions.indexOf('NASB2020') > -1) || (bibleVersions.indexOf('NET2FULL') > -1) || (bibleVersions.indexOf("CUN") > -1)) &&
                (r[1])) { // r[1] is a boolean for reference OT
                justLoadedTOS = step.util.loadTOS();
                hasTOS = true;
            }
            if (((bibleVersions.indexOf('ESV') > -1) || (bibleVersions.indexOf('KJV') > -1) ||
                (bibleVersions.indexOf('SBLG') > -1) || (bibleVersions.indexOf('THGNT') > -1) || (bibleVersions.indexOf('CUN') > -1) || (bibleVersions.indexOf('NASB2020') > -1) || (bibleVersions.indexOf('NET2FULL') > -1)) &&
                (r[0])) // r[0] is a boolean for references with NT
                hasNTMorph = true;
            if (this.partRendered) {
                if (cv[C_colorCodeGrammarAvailableAndSelected]) {
                    if (hasTOS) {
                        pch = document.getElementsByClassName('passageContentHolder');
                        var r = cf.addClassForTHOT(pch[0].outerHTML, bibleVersions);
                        pch[0].outerHTML = r[0];
                        otCSSOnThisPage = r[1];
                    }
                    if (hasNTMorph) {
                        if (pch == null) pch = document.getElementsByClassName('passageContentHolder');
                        ntCSSOnThisPage = cf.getClassesForNT(pch[0].outerHTML);
                    }
                }
                passageHtml = this.$el.find(".passageContentHolder");
            }
            else {
                if (cv[C_colorCodeGrammarAvailableAndSelected]) {
                    if (hasTOS) {
                        var r = cf.addClassForTHOT(this.model.attributes.value, bibleVersions);
                        this.model.attributes.value = r[0];
                        otCSSOnThisPage = r[1];
                    }
                    if (hasNTMorph) ntCSSOnThisPage = cf.getClassesForNT(this.model.attributes.value);
                }
                passageHtml = $(this.model.get("value"));
            }
            var passageId = this.model.get("passageId");
            var interlinearMode = this.model.get("interlinearMode");
            var languages = this.model.get("languageCode");
            var passageContainer = this.$el.closest(".passageContainer");
            if (this._isPassageValid(passageHtml, reference)) {
                passageContainer.find(".resultsLabel").html("");
                this._warnIfNoStrongs(version);
                this._warnIfFirstTimeCompare(interlinearMode);
                this._warnIfInterlinearFirstTime(interlinearMode);
                this._warnFirstTimeColorCoding();
                this._warnCommentaryLookupVersion(version, extraVersions);
                this.doFonts(passageHtml, options, interlinearMode, languages);
                this.doSwapInterlinearLink(passageHtml);
                this._doInlineNotes(passageHtml, passageId);
                this._doSideNotes(passageHtml, passageId, version);
                this._doNonInlineNotes(passageHtml);
                this._doVerseNumbers(passageId, passageHtml, options, interlinearMode, version);
                this._doHideEmptyNotesPane(passageHtml);
                this._adjustTextAlignment(passageHtml);
                step.util.restoreFontSize(this.model, passageHtml);
                this._addStrongHandlers(passageId, passageHtml);
                this._doDuplicateNotice(passageId, passageHtml);
                this._updatePageTitle(passageId, passageHtml, version, this.model.get("reference"));
                this._doInterlinearDividers(passageHtml);
                this._doAlternatives(passageId, passageHtml, version, reference);

                if (!this.partRendered) {
                    step.util.ui.emptyOffDomAndPopulate(this.$el, passageHtml);
                }
                var monitorElement = (step.touchDevice && !step.touchWideDevice) ? $(document) : $(this.$el).find(".passageContentHolder");
                monitorElement.scroll(function(){
                    $(".versePopup").hide();
                    if ($(this).find(".resultsLabel").text() !== "") // This is search result
                        return;
                    var allVerseNumbers = $(this).find(".verseNumber");
                    var thisTop = (step.touchDevice && !step.touchWideDevice) ? $(window).scrollTop() + 21 : $(this).offset().top;
                    for (var i = 0; i < allVerseNumbers.length; i++) {
                        var curVerse = allVerseNumbers[i];
                        if ($(curVerse).offset().top > thisTop) {
                            var refButton = (step.touchDevice && !step.touchWideDevice) ? $("button.select-reference") : $(this).parent().parent().find("button.select-reference");
                            var newText = curVerse.innerHTML;
                            var isInterLinear = $(this).find('.interlinear').length > 0;
                            if ( ((isInterLinear) && (newText.indexOf(":") > -1)) ||
                                 ((!isInterLinear) && (newText.indexOf(":") == -1)) ) {
                                var origText = refButton[0].innerHTML.split(":");
                                if (origText[0] === "Ref")
                                    origText[0] = origText[1];
                                if (isInterLinear) {
                                    var curVerseParts = curVerse.innerHTML.split(":");
                                    if (curVerseParts.length > 1)
                                        newText = curVerseParts[1];
                                }
                                if (origText[0].trim() === "")
                                    newText = "Ref";
                                else
                                    newText = origText[0].trim() + ":" + newText;
                            }
                            $(refButton).text(newText);
                            break;
                        }
                    }
                });    
                //needs to happen after appending to DOM
                this.updateSTEPColor();
                this._addForeignLangToInterLinear();
                this._doChromeHack(passageHtml, interlinearMode, options);
                this.doInterlinearVerseNumbers(passageHtml, interlinearMode, options);
                this.scrollToTargetLocation(passageContainer);
                step.util.setupGesture();

                //give focus:
                $(".passageContentHolder", step.util.getPassageContainer(step.util.activePassageId())).focus();
            }
            // following 11 lines were added to enhance the Colour Code Grammar  PT
            // should be const instead of var, but not compatible with older browser
            // This must match the definition in the color_code_grammar.js
            // Do not take away the TBRMBR comment (to be removed by maven replacer
            var C_handleOfRequestedAnimation = 11; // TBRMBR
            var C_numOfAnimationsAlreadyPerformedOnSamePage = 16; // TBRMBR
            if ((cv[C_colorCodeGrammarAvailableAndSelected] !== undefined) && (cv[C_numOfAnimationsAlreadyPerformedOnSamePage] !== undefined) &&
                (cv[C_handleOfRequestedAnimation] !== undefined)) {
                if (cv[C_colorCodeGrammarAvailableAndSelected]) {
                    cv[C_numOfAnimationsAlreadyPerformedOnSamePage] = 0;
                    cf.refreshClrGrammarCSS(ntCSSOnThisPage, otCSSOnThisPage);
                    if (cv[C_handleOfRequestedAnimation] == -1) cf.goAnimate();
                }
            }
//            if (((languages[0].indexOf("en") == 0) ||
//				((typeof step.keyedVersions[version] === "object") && (step.keyedVersions[version].languageCode === "en"))) &&
		    if (step.util.bookOrderInBible(reference) > -1) { // }) {
                var xgenObj = passageHtml.find('.xgen');
                if ((xgenObj.length == 1) || ((xgenObj.length == 2) && ($(xgenObj[0]).text().trim().length < 2))) // sometimes there is a \n so length == 1 is OK
                    $(xgenObj[xgenObj.length - 1]).append('<button style="font-size:10px;line-height:10px;vertical-align:middle" type="button" onclick="step.util.showSummary(\'' +
                        reference + '\')" title="Show summary information" class="stepButton">' + __s.book_summary + '</button>');
            }
            if (!justLoadedTOS) step.util.addGrammar();
            var elmntsWithCaretChar = $("span:contains(^)");
            for (var ii = 0; ii < elmntsWithCaretChar.length; ii++ ) {
                if (elmntsWithCaretChar[ii].outerText.length == 1) {
                    $($("span:contains(^)")[ii]).css("vertical-align", "sub");
                    $($("span:contains(^)")[ii]).attr("var", "other")
                }
            }
            var isDebugMode = $.getUrlVars().indexOf("debug") > -1;
            var hasMatthewHenryConciseCommentary = bibleVersions.indexOf("MHCC") > -1;
            if (hasMatthewHenryConciseCommentary || isDebugMode) {
                var intros = passageHtml.find('.introduction');
                if (intros.length > 0) {
                    intros.show();
                    if (isDebugMode && !hasMatthewHenryConciseCommentary) {
                        intros.children().css('color', 'orange');
                        alert("One of the selected Bible or commentary has the \"introduction\" tag.  They are usually hidden.  Since the URL has debug in the query string, they are unhidden in orange color.  If you do not need to review the \"introduction\" tag, you can ignore them.");
                    }
                }
            }
        },

        _addForeignLangToInterLinear: function () {
            var currentUserLang = step.userLanguageCode.toLowerCase();
            if (step.defaults.langWithTranslatedLex.indexOf(currentUserLang) > -1) {
                var strongsToElmts = {};
                var elementsToReview = $(".interlinear").find(".w ").find("span.strongs");
                for (var i = 0; i < elementsToReview.length; i++) {
                    var curElement = $(elementsToReview[i]);
                    var curStrong = curElement.parent().attr("strong");
                    if ((typeof curStrong !== "string") || (curStrong === "")) {
                        if (curElement.text() === "Eng Vocab")
                            curElement.html("Eng Vocab<br>" + currentUserLang.substring(0,1).toUpperCase() + currentUserLang.substring(1,2) + " Vocab");
                        continue;
                    }
                    curStrong = curStrong.split(" ")[0]; // Take the first Strong
                    if (curStrong in strongsToElmts)
                        strongsToElmts[curStrong].push(curElement);
                    else
                        strongsToElmts[curStrong] = [ curElement ];
                }
                for (var key in strongsToElmts) {
                    fetch("https://us.stepbible.org/html/lexicon/" + currentUserLang + "_json/" +
                        key + ".json")
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        var gloss = data.gloss.trim();
                        var pos = gloss.indexOf(":");
                        if (pos > -1)
                            gloss = gloss.substring(pos+1).trim();
                        for (var i = 0; i < strongsToElmts[data.strong].length; i++) {
                            var thisElmnt = strongsToElmts[data.strong][i];
                            thisElmnt.html(thisElmnt.text() + "<br>" + gloss);
                        }
                    });
                }
            }
        },

        scrollToTargetLocation: function (passageContainer) {
            var self = this;
            if (!passageContainer) {
                passageContainer = step.util.getPassageContainer(this.model.get("passageId"));
            }

            //if the new passage is below the other, then scroll downwards
            var linkedModel = step.passages.findWhere({linked: 1});
            if (linkedModel != null) {
                var linkedPassageId = linkedModel.get("passageId");
                var container = step.util.getPassageContainer(linkedPassageId);
                if (container.offset().top < passageContainer.offset().top) {
                    //need to scroll to that location
                    $("body").animate({
                        scrollTop: passageContainer.offset().top
                    }, 200, null, function () {
                        self._scrollPassageToTarget(passageContainer);
                    });
                    return;
                }
            }
            this._scrollPassageToTarget(passageContainer);
        },
        _scrollPassageToTarget: function (passageContainer) {
            //get current column target data
            var column = passageContainer.closest(".column");
            passageContainer.find(".highlightBorder").removeClass("highlightBorder");

            var currentTarget = this.model.get("targetLocation");
            if (currentTarget) {
                var link = passageContainer.find("[name='" + currentTarget + "']");
                var linkOffset = link.offset();
                var scroll = linkOffset == undefined ? 0 : linkOffset.top + passageContainer.scrollTop() - passageContainer.offset().top;

                var originalScrollTop = -200;
                passageContainer.find(".passageContentHolder").animate({
                    scrollTop: originalScrollTop + scroll
                }, 500);

                $(link).closest(".verse").addClass("highlightBorder");

                //also do so if we are looking at an interlinear-ed version
                $(link).closest(".interlinear").find("*").addClass("highlightBorder");

                //reset the data attribute
                this.model.save({targetLocation: null}, {silent: true});
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
            var hasCommentaries = _.findWhere(keyed, {category: 'COMMENTARY'}) != null;
            if (hasCommentaries) {
                //find out which Bible should be used
                var firstBible = _.findWhere(keyed, {category: 'BIBLE'});
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
        _warnFirstTimeColorCoding: function () {
            var options = this.model.get("options") || "";
            if (options.indexOf("D") != -1) {
                step.util.raiseOneTimeOnly("display_divide_hebrew_explanation", "info");
            }
        },
        _warnIfInterlinearFirstTime: function (interlinearMode) {
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

        _doDuplicateNotice: function (passageId, passageHtml) {
            var notices = $(".versification-notice", passageHtml);
            for (var ii = 0; ii < notices.length; ii++) {
                var notice = notices.eq(ii);
                var noticeType = notice.attr("international");
                var noticeText = __s[noticeType];
                notice.attr("title", noticeText);
                if (notice.hasClass("duplicate")) {
                    notice.css("float", "left");
                }
                step.util.raiseInfo(noticeText, 'info', passageId);
            }

        },

        _doInterlinearDividers: function (passageContent) {
            $(".w:not([strong]):not(.verseStart)", passageContent).next().css("border-left", "none");
        },

        _doAlternatives: function (passageId, passageContent, version, reference) {
            // only do this if we've got a particular parameter set in the URL
            if ($.getUrlVar("altMeanings") != "true") {
                return;
            }

            require(['search', 'qtip'], function () {
                step.alternatives.enrichPassage(passageId, passageContent, version, reference);
            });
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
                message += "<br>" + this.warnIfBibleDoesNotHaveTestament(reference);
                var errorMessage = $("<span>").addClass("notApplicable").html(message);
                this.$el.html(errorMessage);
                return false;
            }
            return true;
        },
        warnIfBibleDoesNotHaveTestament: function (reference) {
            var bookOrder = step.util.bookOrderInBible(reference);
            if (bookOrder > -1) {
                var masterVersion = step.util.activePassage().get("masterVersion");
                var masterVersionLowerCase = masterVersion.toLowerCase();
                var extraVersionsMsg = "";
                var testamentOfPassageSelected = "Old";
                var theOtherTestament = "New";
                if (bookOrder > 38) {
                    testamentOfPassageSelected = "New";
                    theOtherTestament = "Old";
                }
                if ( 
                    ((testamentOfPassageSelected === "New") &&
                     ((step.passageSelect.translationsWithPopularOTBooksChapters.indexOf(masterVersionLowerCase) > -1) ||
                      (" ohb thot alep wlc mapm ".indexOf(masterVersionLowerCase) > -1))) ||
                    ((testamentOfPassageSelected === "Old") &&
                     ((step.passageSelect.translationsWithPopularNTBooksChapters.indexOf(masterVersionLowerCase) > -1) ||
                      (" sblgnt ".indexOf(masterVersionLowerCase) > -1))) ) {
                    var alertMessage = "<br>The Bible selected, " + masterVersion + ", only has the " +
                        theOtherTestament + " Testament, but an " + testamentOfPassageSelected + " Testament passage is selected." +
                        "<br><br>You can either:<ul>" +
                        "<li><a href=\"javascript:step.util.correctPassageNotInBible(3)\">Add another Bible which has " + testamentOfPassageSelected + " Testament" + 
                        extraVersionsMsg + ".</a>" +
                        "<li><a href=\"javascript:step.util.correctPassageNotInBible(4)\">Select a " + theOtherTestament + " Testament passage.</a>" +
                        "</ul>";
                    return alertMessage;
                }
            }
            return "";
        },
        /**
         *
         * @param passageContent the content that we are processing
         * @param passageId
         * @private
         */
        _doInlineNotes: function (passageContent) {
            var self = this;
            var notes = $(".verse .note, h2 .note, h3 .note", passageContent).has(".inlineNote");
            for (var i = 0; i < notes.length; i++) {
                var item = notes.get(i);
                var link = $("a", item);

                link.on("touchstart", function (ev) {
                    self.doInlineNoteQuickLexicon(passageContent, $(this), ev);
                }).hover(function (ev) {
                    // If another note is already open, don't replace the content on hover
                    if (!step.util.keepQuickLexiconOpen) {
                        self.doInlineNoteQuickLexicon(passageContent, $(this), ev);
                    }
                }, function () {
                    // Avoid automatically hiding quickLexicon if the user has clicked
                    if (!step.util.keepQuickLexiconOpen) {
                        $("#quickLexicon").remove();
                    }
                }).click(function (ev) {
                    if (step.util.timeoutID) {
                        clearTimeout(step.util.timeoutID);
                        step.util.timeoutID = null;
                    }
                    if (step.util.keepQuickLexiconOpen) {
                        step.util.keepQuickLexiconOpen = false;
                        self.doInlineNoteQuickLexicon(passageContent, $(this), ev);
                    }
                    else {
                        step.util.keepQuickLexiconOpen = true;
                        $("#quickLexicon").find(".close").css("color","yellow");
                        $("#quickLexicon").find("a.sideNote").find("strong").parent().addClass("glyphicon glyphicon-lock")
                        var unlockNotes = function() {
                           if (step.util.keepQuickLexiconOpen)
                               step.util.keepQuickLexiconOpen = false;
                            $('#quickLexicon').find('.close').css('color','white');
                            $("#quickLexicon").find("a.sideNote").find("strong").parent().removeClass("glyphicon glyphicon-lock")
                            step.util.timeoutID = null;
                        }
                        $("#quickLexicon").find("a.sideNote").find("strong").parent().click(unlockNotes);
                        step.util.timeoutID = setTimeout(unlockNotes, 15000);
                    }
                });
            }
        },
        doInlineNoteQuickLexicon: function (target, link, ev) {
            require(['quick_lexicon'], function () {
                var text = link.closest(".note").find(".inlineNote");
                var currentPageY = ((typeof ev.pageY !== "number") && (typeof ev.originalEvent.touches[0].pageY === "number")) ?
                    ev.originalEvent.touches[0].pageY : ev.pageY; // pageY is available at different variable if it is a touch event.
                //do the quick note
                new QuickLexicon({
                    text: text,
                    strong: null,
                    morph: null,
                    target: target,
                    position: currentPageY,
                    height: $(window).height(),
                    touchEvent: false
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

            //remove click functionality from verse headers...
            $(".notesPane > a", passageContent).click(function (e) {
                e.preventDefault();
            })

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

        // Does not seem to be in used.  11/30/2023 PT
        // keepNotesInSync: function (passageContent) {
        //     var currentHeight = passageContent.height();
        //     passageContent.find(".notesPane").height(currentHeight);
        //     $(passageContent).on('scroll', function () {
        //         //find top verse - 1.
        //         var allVerses = $(".verse", passageContent);
        //         var lastVerse = undefined;
        //         for (var ii = 0; ii < allVerses.length; ii++) {
        //             var currentVerse = $(allVerses[ii]);
        //             var versePosition = currentVerse.position().top;
        //             if (top >= 0) {
        //                 break;
        //             }
        //             lastVerse = currentVerse;
        //         }

        //         if (lastVerse == undefined) {
        //             passageContent.find(".notesPane").scrollTop(0);
        //         }
        //         else {

        //         }
        //     });
        // },

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
            if (!step.util.checkFirstBibleHasPassage(version, [xref.split(" ")[0]], [], true, true)) version = "ESV";
            if (!$.data(item, "initialised")) {
                require(["qtip", "drag"], function () {
                    item.qtip({
                        position: {my: "top " + myPosition, at: "top " + atPosition, viewport: $(window)},
                        style: {tip: false, classes: 'draggable-tooltip xrefPopup', width: {min: 800, max: 800}},
                        show: {event: 'click'}, hide: {event: 'click'},
                        content: {
                            text: function (event, api) {
                                var chosenVersion = version;
                                if (step.keyedVersions[version] && step.keyedVersions[version].category != 'BIBLE') {
                                    //get the first version in the current search that is non-commentary
                                    var allVersions = _.where(self.model.get("searchTokens"), {itemType: VERSION});
                                    chosenVersion = 'ESV';
                                    for (var i = 0; i < allVersions.length; i++) {
                                        var keyedVersion = step.keyedVersions[(allVersions[i].item || {}).initials];
                                        if (keyedVersion != null && keyedVersion.category == 'BIBLE') {
                                            chosenVersion = keyedVersion.initials;
                                        }
                                    }
                                }
                                $.getSafe(BIBLE_GET_BIBLE_TEXT + chosenVersion + "/" + encodeURIComponent(xref), function (data) {
                                    var text2Display = data.value;
                                    if (data.value.length > 1100)
                                    	text2Display = $(data.value).text().substring(0,900) + " ...";
                                    api.set('content.title.text', data.longName);
                                    api.set('content.text', text2Display);
                                    api.set('content.osisId', data.osisId)
                                }).error(function() {
                                    changeBaseURL();
                                });
                            },
                            title: {text: xref, button: false}
                        },
                        events: {
                            render: function (event, api) {
                                $(api.elements.titlebar).css("padding-right", "0px");
                                $(api.elements.titlebar)
                                    .prepend($('<span class="glyphicon glyphicon-new-window openRefInColumn"></span>')
                                        .on('click touchstart', function () {
                                            step.util.createNewLinkedColumnWithScroll(self.model.get("passageId"), api.get("content.osisId"), true, null, event);
                                            return false;
                                        }));
                                $(api.elements.titlebar)
                                    .prepend($('<button type="button" class="close" aria-hidden="true">X</button>')
                                        .on('click touchstart', function () {
                                            api.hide();
                                            return false;
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

                                step.util.ui.addStrongHandlers(self.model.get("passageId"), tooltip);
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
            var verseNotes = $(".verse .note, h3 .note, h2 .note", passageContent);
            var nonInlineNotes = verseNotes.not(verseNotes.has(".inlineNote"));

            for (var i = 0; i < nonInlineNotes.length; i++) {
                this._doHighlightNoteInPane(passageContent, $("a", nonInlineNotes.eq(i)));
            }
        },

        /**
         * Highlights the note in the side pane
         * @private
         */
        _doHighlightNoteInPane: function (passageContent, link) {
            var $note = $(".notesPane strong", passageContent).filter(function () {
                return $(this).text() == link.text();
            }).closest(".margin");

            var $link = $(link);

            require(["qtip"], function () {
                $link.qtip({
                    show: {event: 'mouseenter'},
                    hide: {event: 'unfocus mouseleave', fixed: true, delay: 200},
                    position: {my: "top center", at: "top center", of: $link, viewport: $(window), effect: false},
                    style: {classes: "xrefHover"},
                    overwrite: true,
                    content: {
                        text: $note
                    }
                });
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

            var title = reference + " | " + step.keyedVersions[version].shortInitials + " | STEP | " + clonedVerse.text();
            $("title").html(title);
        },

        _addStrongHandlers: function (passageId, passageContent) {
            step.util.ui.addStrongHandlers(passageId, passageContent)
        },

        updateSTEPColor: function () {
            this.updateSpecificColor("clrHighlight", "#17758F");
			this.updateSpecificColor("clrHighlightBg", "#17758F");
            this.updateSpecificColor("clrText", "#5d5d5d");
            this.updateSpecificColor("clr2ndHover", "#d3d3d3");
            this.updateSpecificColor("clrStrongText", "#447888");
            this.updateSpecificColor("clrLexiconFocusBG", "#c8d8dc");
            this.updateSpecificColor("clrRelatedWordBg", "#b2e5f3");
            this.updateSpecificColor("clrBackground", "#ffffff");
            if (step.util.isDarkMode()) $('body,html').css('color-scheme','dark');
            else $('body,html').css('color-scheme','normal');
        },

        updateSpecificColor: function (colorName, defaultColor) {
            var color = step.settings.get(colorName);
            if (!(((typeof color === "string") && (color.length == 7) && (color.substr(0,1) === "#"))))
                color = defaultColor;
            document.querySelector(':root').style.setProperty('--' + colorName, color);
        },

        handleFontSizeChange: function () {
            this.doInterlinearVerseNumbers(
                this.$el,
                this.model.get("interlinearMode"),
                this.model.get("options"));
        }
    })
;
