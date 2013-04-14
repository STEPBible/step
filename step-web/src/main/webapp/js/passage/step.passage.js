/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project All rights
 * reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. Neither the name of the Tyndale House, Cambridge
 * (www.TyndaleHouse.com) nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

var CONTINUOUS_SCROLLING_VERSE_GAP = 50;

step.passage = {
    lastUrls : [undefined, undefined],
    
    getPassageId : function(element) {
        return $(element).closest(".passageContainer").attr("passage-id");
    },

    getDisplayMode : function(passageId) {
        var container = step.util.getPassageContainer(passageId);
        var level = $(".advancedSearch fieldset[name='SEARCH_PASSAGE']", container).detailSlider("value");
        var interlinearVersion = "";
        var interlinearMode = "NONE";
        if(level > 0) {
            interlinearVersion = $(".extraVersions", container).val();
            if(!step.util.isBlank(interlinearVersion)) {
                interlinearVersion = interlinearVersion.trim();
                interlinearMode = "INTERLEAVED";
            }
        }

        if(level > 1 && !step.util.isBlank(interlinearVersion)) {
            interlinearMode = this._getInterlinearMode(passageId);
        }
        
        return { displayMode : interlinearMode, displayVersions : interlinearVersion };
    },
    
    getReference : function(passageId) {
        var syncMode = parseInt(step.state.passage.syncMode());
        
        if(syncMode == -1) {
            return $(".passageReference", step.util.getPassageContainer(passageId)).val();
        } 
        
        return $(".passageReference", step.util.getPassageContainer(syncMode)).val();
    },

    changePassage: function(passageId) {
        var lookupVersion = step.state.passage.version(passageId);

        //get the real value from the text box
        var lookupReference = this.getReference(passageId);
        var options = step.state.passage.options(passageId);
        var display = this.getDisplayMode(passageId);
        var interlinearMode = display.displayMode;
        var interlinearVersion = display.displayVersions;

        var self = this;
        if (!step.util.raiseErrorIfBlank(lookupVersion, __s.error_version_missing)
                || !step.util.raiseErrorIfBlank(lookupReference, __s.error_reference_missing)) {
            return;
        }

        var url = BIBLE_GET_BIBLE_TEXT + lookupVersion.toUpperCase() + "/" + lookupReference;
        if (options && options.length != 0) {
            url += "/" + options;
        } else {
            url += "/";
        }

        if (interlinearVersion && interlinearVersion.length != 0) {
            url += "/" + interlinearVersion.toUpperCase();
            url += "/" + interlinearMode;
        }

        if(this.lastUrls[passageId] == url) {
            //execute all callbacks only
            step.passage.executeCallbacks(passageId);
            return;
        }
        this.lastUrls[passageId] = url;


        // send to server
        var startTime = new Date().getTime();

        $.getPassageSafe({
            url : url,
            callback:  function(text) {
                step.util.trackAnalytics("passage", "loaded", "time", new Date().getTime() - startTime);
                step.util.trackAnalytics("passage", "version", lookupVersion);
                step.util.trackAnalytics("passage", "reference", text.reference);

                step.state.passage.range(passageId, text.startRange, text.endRange, text.multipleRanges);

                // we get html back, so we insert into passage:
                var passageContent = step.util.getPassageContent(passageId);
                self._setPassageContent(passageId, passageContent, text);

                // passage change was successful, so we let the rest of the UI know
                $.shout("passage-changed", {
                    passageId : passageId
                });

                // execute all callbacks
                step.passage.executeCallbacks(passageId);


                //finally add handlers to elements containing xref
                self._doVerseNumbers(passageId, passageContent, options, interlinearMode, text.reference);
//                self._doStats(passageId, passageContent, lookupVersion, text.reference);
                self._doFonts(passageId, passageContent, interlinearMode, interlinearVersion);
                self._doInterlinearVerseNumbers(passageContent, interlinearMode);
                self._doInlineNotes(passageId, passageContent);
                self._doNonInlineNotes(passageContent);
                self._doSideNotes(passageId, passageContent);
                self._doHideEmptyNotesPane(passageContent);
                self._adjustTextAlignment(passageContent);
                self._redoTextSize(passageId, passageContent);
                self._addStrongHandlers(passageId, passageContent);
                self._updatePageTitle(passageId, passageContent, lookupVersion, lookupReference);
                self._doTransliterations(passageId, passageContent);
                step.util.closeInfoErrors(passageId);
                step.state.passage.reference(passageId, text.reference, false);
                self._doVersions(passageId, passageContent);
                self._doHash(passageId, text.reference, lookupVersion, options, interlinearMode, interlinearVersion);
            },
            passageId: passageId,
            level: 'error'
         });
    },

    _updatePageTitle : function(passageId, passageContent, version, reference) {
        if(passageId == 0) {
            $("title").html(version + " " + reference + " " + $(".verse", passageContent).text().replace("1", ""));
        }
    },

    _addStrongHandlers : function(passageId, passageContent) {
        step.util.ui.addStrongHandlers(passageId, passageContent)
    },

    _redoTextSize : function(passageId, passageContent) {

        var contentHolder = $(".passageContentHolder", passageContent);

        //we're only going to be cater for one font size initially, so pick the major version one.
        var fontKey = step.passage.ui.getFontKey(contentHolder);
        var fontSizes = step.passage.ui.fontSizes[passageId];
        var fontSize;
        if(fontSizes != undefined) {
            fontSize = fontSizes[fontKey];
        }

        if(fontSize != undefined) {
            contentHolder.css("font-size", fontSize);
        }
    },

    _doTransliterations : function(passageId, passageContent) {
        $.each($(".stepTransliteration", passageContent), function(i, item) {
           step.util.ui.markUpTransliteration($(this));
        });
    },
    
    _doInterlinearVerseNumbers : function(passageContent, interlinearMode) {
        if(interlinearMode == "INTERLINEAR") {
            $.each($(".verseStart", passageContent).children(), function(i, item) { 
                var nextItem = $(this).parent().next().children().get(i);
                var height = $(nextItem).height();
                var thisItem = $(this);
                var currentLineHeight = parseInt(thisItem.css("font-size").replace("px", "")) * 1.5;
                thisItem.height(height);
                
                var paddingRequired = height - currentLineHeight;
                thisItem.css("padding-top", paddingRequired /2);
                
            });
        }
    },
    
    _doFonts : function(passageId, passageContent, interlinearMode, interlinearVersions) {
        //interlinear or a display option
        var displayOptions = step.state.passage.options(passageId);
        var isInterlinearOption = displayOptions.indexOf("TRANSLITERATION") != -1 || displayOptions.indexOf("GREEK_VOCAB")  != -1 || displayOptions.indexOf("ENGLISH_VOCAB")  != -1;

        if((interlinearVersions != null && interlinearVersions.length > 0 && interlinearMode == "INTERLINEAR") || isInterlinearOption) {
            $(".interlinear").find("span.interlinear, .ancientVocab, .text", passageContent).filter(function() {
                return step.util.isUnicode(this);
            }).addClass("unicodeFont").filter(function() {
                return step.util.isHebrew(this);
            }).addClass("hbFont");
        }

        if(interlinearMode == "" || interlinearMode == undefined || interlinearVersions  == undefined || interlinearVersions == "") {
            //examine the first verse's contents, remove spaces and numbers
            var val = $(".verse:first", passageContent);
            if(step.util.isUnicode(val)) {
                var passageContentHolder = $(".passageContentHolder", passageContent);
                passageContentHolder.addClass("unicodeFont");

                    if(step.util.isHebrew(val)) {
                        passageContentHolder.addClass("hbFont");
                    }
            }
        }
    },

    _setPassageContent : function(passageId, passageContent, serverResponse) {
        //first check that we have non-xgen elements
        if($(serverResponse.value).children().not(".xgen").size() == 0) {
            var reference = step.state.passage.reference(passageId)

            step.util.raiseInfo(passageId, sprintf(__s.error_bible_doesn_t_have_passage, reference), 'info', true);
            passageContent.html("");
        } else {
            passageContent.html(serverResponse.value);
        }
    },

    _doNonInlineNotes : function(passageContent) {
        var verseNotes = $(".verse .note", passageContent);
        var nonInlineNotes = verseNotes.not(verseNotes.has(".inlineNote"));

        nonInlineNotes.each(function(i, item) {
            var link = $("a", this);
            var passageContainer = step.util.getPassageContainer(link);

            $(link).hover(function() {
                $(".notesPane strong", passageContainer).filter(function() {
                    return $(this).text() == link.text();
                }).closest(".margin").addClass("ui-state-highlight");
            }, function() {
                $(".notesPane strong", passageContainer).filter(function() {
                    return $(this).text() == link.text();
                }).closest(".margin").removeClass("ui-state-highlight");
            });
        });
    },

    _doInlineNotes : function(passageId, passageContent) {
        var myPosition = passageId == 0 ? "left" : "right";
        var atPosition = passageId == 0 ? "right" : "left";

        $(".verse .note", passageContent).has(".inlineNote").each(function(i, item) {
            var link = $("a", this);
            var note = $(".inlineNote", this);

            link.attr("title", note.html());

            $(link).qtip({
                    position: {
                        my: "center " + myPosition,
                        at: "center " + atPosition
                    },
                    style: {
                        classes : "visibleInlineNote"
                    },

                    events : {
                        show : function() {
                            var qtipApi = $(this).qtip("api");
                            var yPosition = qtipApi.elements.target.offset().top;
                            var centerPane = $("#centerPane");
                            var xPosition = centerPane.offset().left;

                            if(passageId == 1) {
                                xPosition += centerPane.width();
                            }

                            var currentPosition = $(this).qtip("option", "position");
                            currentPosition.target = [xPosition, yPosition];
                        }
                    }
            });
        });
    },

    _adjustTextAlignment : function(passageContent) {
        //we right align

        //if we have only rtl, we right-align, so
        //A- if any ltr, then return immediately
        if($(".ltr", passageContent).size() > 0 || $("[dir='ltr']", passageContent).size() > 0 || $(".ltrDirection", passageContent).size() > 0) {
            return;
        }

        //if no ltr, then assume, rtl
        $(".passageContentHolder", passageContent).addClass("rtlDirection");
    },

//    /**
//     * Gets the stats for a passage and shows a wordle
//     * @param passageId the passage ID
//     * @param passageContent the passage Content
//     * @param version the version
//     * @param reference the reference
//     * @private
//     */
//    _doStats: function (passageId, passageContent, version, reference) {
//        var self = this;
//        $.getSafe(ANALYSIS_STATS, [version, reference], function(data) {
//            //create 3 tabs
//            var linksToTabs = $("<ul></ul>");
//
//            var headers = [__s.word_stats, __s.strong_stats, __s.subject_stats];
//            var tabNames = ["wordStat", "strongStat", "subjectStat"];
//            for(var i = 0; i < headers.length; i++) {
//                linksToTabs.append("<li><a href='#" + tabNames[i] + "'>" + headers[i] + "</a></li>");
//            }
//
//            var tabHolder = $("<div></div>");
//            tabHolder.append(linksToTabs);
//
//            //create a link with rel for each bit in stat.
//            
//            self._createWordleTab(tabHolder, data.wordStat, tabNames, 0);
//            self._createWordleTab(tabHolder, data.strongsStat, tabNames, 1);
//            self._createWordleTab(tabHolder, data.subjectStat, tabNames, 2);
//
//            $(tabHolder).tabs();
//            
//            passageContent.append(tabHolder);
//        });
//    },
//
//    _createWordleTab : function(tabHolder, wordleData, headerNames, headerIndex) {
//        var headerName = headerNames[headerIndex];
//        
//        var container = $("<div></div>").attr('id', headerName);
//        var added = false;
//        
//        $.each(wordleData.stats, function(key, value) {
//            var wordLink = $("<a></a>").attr('href', '#').attr('rel', value).html(key);
//            container.append(wordLink);
//            container.append(" ");
//            added = true;
//        });
//
//        $("a", container).tagcloud({
//            size : {
//                start : 9,
//                end: 28,
//                unit : "px"
//            },
//            color : {
//                start : "#000",
//                end : "#696"
//            }
//        });
//        
//        if(added) {
//            tabHolder.append(container);
//        } else {
//            //remove header
//            $("[href='#" + headerNames[headerIndex] + "']", tabHolder).remove();
//        }
//    },

    _doVerseNumbers : function(passageId, passageContent, options, interlinearMode, reference) {
        //if interleaved mode or column mode, then we want this to continue
        //if no options, or no verse numbers, then exit
        var hasVerseNumbersByDefault = interlinearMode != undefined && interlinearMode != "" && interlinearMode != 'INTERLINEAR';

        if(options == undefined || (options.indexOf("VERSE_NUMBERS") == -1 && !hasVerseNumbersByDefault)) {
            //nothing to do:
            return;
        }

        var book = reference;
        var firstSpace = reference.indexOf(' ');
        if(firstSpace != -1) {
            book = reference.substring(0, firstSpace);
        }

        var self = this;
        //otherwise, exciting new strong numbers to apply:
        $.getSafe(BIBLE_GET_STRONGS_AND_SUBJECTS, [reference], function(data) {
            $.each(data.strongData, function(key, value) {
                //there may be multiple values of this kind of format:
                var text = "<table class='verseNumberStrongs'>";
                var bookKey = key.substring(0, key.indexOf('.'));
                var internalVerseLink = $("a[name='" + key + "']", passageContent);

                if(internalVerseLink[0] == undefined) {
                    //no point in continuing here, since we have no verse to attach it to.
                    return;
                }
                
                //append header row
                var header = "<th></th><th>" + __s.bible_book + "</th><th>" + (data.ot ? __s.OT : __s.NT) + "</th>";
                text += "<tr>";
                text += header;
                text += header;
                text += "</tr>";
                
                $.each(value, function(i, item) {
                    var even = (i % 2) == 0;
                    
                   if(even) {
                       text += "<tr>";
                   } 
                   
                   text += "<td>";
                   //add search icon
                   text += self._addLinkToLexicalSearch(passageId, "ui-icon ui-icon-search verseStrongSearch", "sameWordSearch", item.strongNumber, __s.search_for_this_word, "");
                   text += self._addLinkToLexicalSearch(passageId, "ui-icon ui-icon-zoomin verseStrongSearch", "relatedWordSearch", item.strongNumber, __s.search_for_related_words, "");

                   text += "<a href='#' onclick='showDef(\"";
                   text += item.strongNumber;
                   text += ", ";
                   text += passageId;
                   text += "\")'>";
                   text += item.gloss;
                   text += " (";
                   text += item.stepTransliteration;
                   text += ", <span class='unicodeFont'>";
                   text += item.matchingForm;
                   text += "</span>)</a> ";

                   //add count in book icon:
                   text += "</td><td>";
                   text += self._addLinkToLexicalSearch(passageId, "strongCount", "sameWordSearch", item.strongNumber + "\", \"" + bookKey, "", sprintf(__s.times, data.counts[item.strongNumber].book));
                   text += "</td>";
                   		
                   text += "<td class='";
                   if(even) {
                       text += "even";
                   }
                   text += "'>";
                   text += self._addLinkToLexicalSearch(passageId, "strongCount", "sameWordSearch", item.strongNumber, "", sprintf(__s.times, data.counts[item.strongNumber].bible));
                   text += "</td>";
                   
                   if(!even) {
                       text += "</tr>";
                   }
                });
                
                if((value.length %2) == 1) {
                    text += "</tr>";
                }
                text += "</table><br />";
                
                if(data.significantlyRelatedVerses[key] && data.significantlyRelatedVerses[key].length != 0) {
                    text += "<a class='related' href='#' onclick='getRelatedVerses(\"" + data.significantlyRelatedVerses[key].join('; ') + "\" ," + passageId + ")'>" + __s.see_related_verses + "</a>&nbsp;&nbsp;";
                }
                
                if(data.relatedSubjects[key] && data.relatedSubjects[key].total != 0) {
                    //attach data to internal link (so that it goes when passage goes
                    var subjects = data.relatedSubjects[key];
                    $.data(internalVerseLink[0], "relatedSubjects", subjects);
                    
                    var subjectOverview = "";
                    var i =  0;
                    for(i = 0; i < 5 && i < subjects.results.length; i++) {
                        subjectOverview += subjects.results[i].root;
                        subjectOverview += ", ";
                        subjectOverview += subjects.results[i].heading;
                        subjectOverview += " ; ";
                    }
                    
                    if(i < subjects.results.length) {
                        subjectOverview += "...";
                    }
                    
                    
                    text += "<a class='related' href='#' title='" + subjectOverview.replace(/'/g, "&apos;") +
                    		"' onclick='getRelatedSubjects(\"" + key + "\", " + passageId + ")'>" + __s.see_related_subjects + "</a>&nbsp;&nbsp;";
                }
                
                internalVerseLink.qtip({
                    content: text,
                    show: { 
                        event : 'mouseenter',
                        solo: true
                    },
                    hide: { 
                        event: 'unfocus mouseleave',
                        fixed: true,
                        delay: 200
                    },
                    
                    position : {
                        my: "bottom center",
                        at: "top center",
                        viewport: $(window)
                    },
                    style : {
                        classes : "primaryLightBg primaryLighBorder noQtipWidth"
                    }
                });
            });
        });
    },
    
    
    _addLinkToLexicalSearch : function(passageId, classes, functionName, strongNumber, title, innerText) {
        var text = "";
        text += "<a href='#' class='" + classes + "' onclick='step.lexicon.passageId=";
        text += passageId;
        text += "; step.lexicon." + functionName + "(\"";
        text += strongNumber;
        text +="\")' title='";
        text += title.replace(/'/g, "&apos;");
        text += "'>" + innerText + "</a>";
        return text;
    },
    
    _doSideNotes : function(passageId, passageContent) {
        var myPosition = passageId == 0 ? "left" : "right";
        var atPosition = passageId == 0 ? "right" : "left"; 

        
        $.each($(".notesPane [xref]", passageContent), function(i, item) {
            var xref = $(this).attr("xref");
            
            $(this).click(function(e) {
                e.preventDefault();
            });
            
            
            $(this).qtip({
                position: {
                    my: "top " + myPosition,
                    at: "top " + atPosition,
                    viewport: $(window)
                },
                content : {
                    text : function(event, api) {
                        $.getSafe(BIBLE_GET_BIBLE_TEXT + step.state.passage.version(passageId) + "/" + encodeURIComponent(xref), function(data) {
                            api.set('content.title.text', data.longName);
                            api.set('content.text', data.value);
                        });
                    },
                    
                    title : {
                        text: xref,
                        button : false
                    },
                },
                style: {
                    tip: false,
                    classes: 'draggable-tooltip',
                    width: { min: 800,  max: 800}
                },
                show :  { event: 'click' },
                hide : { event: 'click' },
                events : {
                    render : function(event, api) {
                        $(this).draggable({
                            containment: 'window',
                            handle: api.elements.titlebar
                        });
                        
                        $(api.elements.titlebar).css("padding-right", "0px");

                        $(api.elements.titlebar).prepend(goToPassageArrowButton(true, xref, "leftPassagePreview"));
                        $(api.elements.titlebar).prepend(goToPassageArrowButton(false, xref, "rightPassagePreview"));
                        $(api.elements.titlebar).prepend($("<a>&nbsp;</a>").button({ icons : { primary : "ui-icon-close" }}).addClass("closePassagePreview").click(function(){ api.hide(); }));
                        
                        $(".leftPassagePreview, .rightPassagePreview", api.elements.titlebar).first().button({
                            icons : {
                                primary : "ui-icon-arrowthick-1-e"
                            }
                        }).next().button({
                            icons : {
                                primary : "ui-icon-arrowthick-1-w"
                            }
                        }).end().click(function () { api.hide(); });
                    }
                }
            });                 
        });
    },
    
    _doHideEmptyNotesPane : function(passageContent) {
        var notes = $(".notesPane", passageContent);
        
        if(notes.text().trim().length == 0) {
            notes.toggle(false);
        }
    },
    
    _doHash : function(passageId, reference, version, options, interlinearMode, interlinearVersion) {
        step.state.browser.changePassage(passageId, reference, version, options, interlinearMode, interlinearVersion);
    },
    
    _doVersions : function(passageId, passageContent) {
        step.alternatives.enrichPassage(passageId, passageContent);
    },
    
    _getInterlinearMode : function(passageId) {
        //first ensure we have an interlinear mode selected
        step.passage.ui.updateDisplayOptions(passageId);
        
        var name = step.state.passage.extraVersionsDisplayOptions(passageId);
        var index = step.defaults.passage.interOptions.indexOf(name);
        return step.defaults.passage.interNamedOptions[index];
    },
    
    executeCallbacks : function(passageId) {
        var items = step.passage.callbacks[passageId];
        while (items.length != 0) {
            items.pop()();
        }
    },
    
    /**
     * highlights all strongs match parameter strongReference
     * 
     * @strongReference the reference look for across this passage pane and
     *                  highlight
     */
    highlightStrong : function(passageId, strongReference) {
        var container = step.util.getPassageContainer(passageId);
        // check for black listed strongs
        if ($.inArray(strongReference, this.blacklistedStrongs) == -1) {
            $(".verse span[strong~='" + strongReference + "']", container).addClass("emphasisePassagePhrase");
            $("span.w[strong~='" + strongReference + "'] span.text", container).addClass("emphasisePassagePhrase");
        }
    },
    
    /**
     * if a number of strongs are given, separated by a space, highlights all of
     * them
     * 
     * @param strongMorphReference
     *            the references of all strongs and morphs asked for
     */
    higlightStrongs : function(strongMorphReference) {
        if (strongMorphReference.strong == null) {
            return;
        }

        var references = strongMorphReference.strong.split();
        var container = step.util.getPassageContainer(strongMorphReference.passageId);
        
        
        // reset all spans that are underlined:
        this.removeStrongsHighlights(strongMorphReference.passageId);
        
        for ( var ii = 0; ii < references.length; ii++) {
            this.highlightStrong(strongMorphReference.passageId, references[ii]);
        }
    },

    removeStrongsHighlights : function(passageId) {
        var container = step.util.getPassageContainer(passageId);
        $(".verse span", container).removeClass("emphasisePassagePhrase");
        $("span.text", container).removeClass("emphasisePassagePhrase");
    },

    /* 2 queues of calls backs for passages */
    callbacks : [ [], [] ],
    blacklistedStrongs : [ "G3588" ],
};


$(step.passage).hear("passage-state-has-changed", function(s, data) {
    step.passage.changePassage(data.passageId);
});

$(step.passage).hear("slideView-SEARCH_PASSAGE", function (s, data) {
    //notify hash change
    step.state.browser.updateDetail(data.passageId);

    step.passage.changePassage(data.passageId);
});


function Passage(passageContainer, passageId) {
    var self = this;
    this.container = passageContainer;
    this.version = $(".passageVersion", passageContainer);
    this.reference = $(".passageReference", passageContainer);
    this.passage = $(".passageContent", passageContainer);
    this.passageId = passageId;


    this.initVersionsTextBox();
    this.initReferenceTextBox();

    // this is so that when we click a word, it highlights it
    // this.passage.click(function(e) {
    // var clickedWord = getWordAtPoint(this, e.pageX, e.pageY);
    // var lookup = clickedWord.replace(/[ ,.;:"]/g, "");
    //		
    // $.shout("show-all-strong-morphs", { displayedWord: lookup } );
    //		
    // });

    // register to listen for events that click a word/phrase:
    this.passage.hear("show-all-strong-morphs", function(selfElement, data) {
        step.passage.higlightStrongs(data);
    });

    // register when we want to be alerted that a bookmark has changed
    this.passage.hear("show-preview-" + this.passageId, function(selfElement, previewData) {
        self.showPreview(previewData);
    });

    this.passage.hear("version-list-refresh", function(selfElement, versions) {
        step.version.refreshVersions(self.passageId, versions);
    });

    $(this.passage).hear("make-master-interlinear-" + this.passageId, function(selfElement, newMasterVersion) {
        var interlinearVersion = step.state.passage.extraVersions(self.passageId).toUpperCase(); 
        var currentVersion = step.state.passage.version(self.passageId).toUpperCase();
        var newUpperMasterVersion = newMasterVersion.toUpperCase(); 
        
        step.state.passage.extraVersions(self.passageId, interlinearVersion.replace(newUpperMasterVersion, currentVersion));
        step.state.passage.version(self.passageId, newUpperMasterVersion);

        $.shout("version-changed-dynamically" + self.passageId, newUpperMasterVersion);
    });
};



/**
 * Sets up the autocomplete for the versions dropdown
 */
Passage.prototype.initVersionsTextBox = function() {
    var self = this;
    
    $(this.version).versions();
    $(this.version).bind('change', function(event) {
            var value = $(event.target).val();
            if (step.util.raiseErrorIfBlank(value, __s.version_must_be_selected)) {
                  //need to refresh the options of interleaving/interlinear, etc.
                  step.passage.ui.updateDisplayOptions(self.passageId);
                  step.state.passage.version(self.passageId, value);
            }
    });
};

Passage.prototype.initReferenceTextBox = function() {
    var self = this;

    // set up change for textbox
    this.reference.autocomplete({
        source : function(request, response) {
            $.getPassageSafe({
                url : BIBLE_GET_BIBLE_BOOK_NAMES,
                args : [request.term, step.state.passage.version(self.passageId)], 
                callback: function(text) {
                    response($.map(text, function(item) {
                        return { 
                            label: "<span>" + item.shortName + " <span style='font-size: larger'>&rArr;</span> " + item.fullName + "</span>", 
                            value: item.shortName, 
                            wholeBook : item.wholeBook 
                        };
                    }));
                },
                passageId : self.passageId,
                level : 'error'
           });
        },
        minLength : 0,
        delay : 0,
        select : function(event, ui) {
//            event.stopPropagation();
            var fireChange = !ui.item.wholeBook;
            if(fireChange) {
                step.state.passage.reference(self.passageId, ui.item.value, fireChange);
            } else {
                $(this).focus();
                var that = this;
                
                delay(function() {
                    $(that).autocomplete("search", ui.item.value);
                }, 50, "step.passage.reference.dropdown");
            }
        }
    })
//    .blur(function() {
//        step.state.passage.reference(self.passageId, $(this).val());
//    })
    .click(function() {
        $(this).autocomplete("search", $(this).val());
        
        //if no results, then re-run search with nothing
        if($(".passageReference", step.util.getPassageContainer(self.passageId)).attr("autocomplete") == "off") {
            //search for nothing
            $(this).autocomplete("search", "");
        }
    }).blur(function() {
        $(this).trigger('change');
    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
        ul.addClass("stepComplete");
        
        return $( "<li></li>" )
        .data( "ui-autocomplete-item", item )
        .append( "<a>" + item.label + "</a>" )
        .appendTo( ul );
    };
};

/**
 * changes the passage, with optional parameters
 */





/**
 * shows a preview of the current text desired
 */
Passage.prototype.showPreview = function(previewData) {
    var reference = previewData.reference;
    var source = previewData.source;

    var myAnchor = this.passageId == 0 ? "left" : "right";
    var offset = (80 * (this.passageId == 0 ? 1 : -1)) + " 0";

    $.getSafe(BIBLE_GET_BIBLE_TEXT + step.state.passage.version(this.passageId) + "/" + reference, function(data) {
//        console.log(data);
        $("#popupText").html(data.value + "<span class='previewReferenceKey'>[" + data.reference + "]</span>");

        var popup = $("#previewReference");
        popup.show().position({
            of : $(source),
            my : myAnchor + " center",
            at : "center " + "center",
            offset : offset,
            collision : "fit"
        }).on("mouseleave.previewscripture", function(s) {
            popup.hide();
        });

        $(".notesPane").on("mouseleave.previewscripture", function(s) {
            popup.hide();
        });
    });
};

$(step.passage).hear("SEARCH_PASSAGE-activated", function(self, data) {
    step.passage.lastUrls[data.passageId] = undefined;
});


