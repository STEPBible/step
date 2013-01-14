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

    getReference : function(passageId) {
        return $(".passageContainer[passage-id = " + passageId + "] .passageReference").val();
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
        var container = step.util.getPassageContainer(passageId);
        var lookupVersion = step.state.passage.version(passageId);
        
        //get the real value from the textbox
        var lookupReference = this.getReference(passageId);
        var options = step.state.passage.options(passageId);
        var display = this.getDisplayMode(passageId);
        var interlinearMode = display.displayMode;
        var interlinearVersion = display.displayVersions;
        
        var self = this;
        if (!step.util.raiseErrorIfBlank(lookupVersion, "A version must be provided")
                || !step.util.raiseErrorIfBlank(lookupReference, "A reference must be provided")) {
            return;
        }

        var url = BIBLE_GET_BIBLE_TEXT + lookupVersion.toUpperCase() + "/" + lookupReference;
        if (options && options.length != 0) {
            url += "/" + options;

            if (interlinearVersion && interlinearVersion.length != 0) {
                url += "/" + interlinearVersion.toUpperCase();
                url += "/" + interlinearMode;
            }
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
                self._doFonts(passageId, passageContent, interlinearMode, interlinearVersion);
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
    
    _doFonts : function(passageId, passageContent, interlinearMode, interlinearVersions) {
        //interlinear or a display option
        var displayOptions = step.state.passage.options(passageId);
        var isInterlinearOption = displayOptions.indexOf("TRANSLITERATION") || displayOptions.indexOf("GREEK_VOCAB") || displayOptions.indexOf("ENGLISH_VOCAB"); 
        
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
            
            step.util.raiseInfo(passageId, "The Translation / Commentary does not cover the Bible Text (" + reference + ").", 'info', true);
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
                    at: "top " + atPosition
                },
                content : {
                    title : {
                        text: xref,
                        button : true
                    },
                    ajax : {
                        url : BIBLE_GET_BIBLE_TEXT + step.state.passage.version(passageId) + "/" + encodeURIComponent(xref),
                        type : 'GET',
                        data : {},
                        dataType : 'json',
                        success : function(data, status) {
                            this.set('content.title.text', data.longName);
                            this.set('content.text', data.value);
                        },
                    }
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
                        
                        $(api.elements.titlebar).append(goToPassageArrow(true, xref, "leftPassagePreview"));
                        $(api.elements.titlebar).append(goToPassageArrow(false, xref, "rightPassagePreview"));
                        $(".leftPassagePreview, .rightPassagePreview", api.elements.titlebar).button().click(function () { api.hide(); });
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
    
    _doVersions : function(passageId, passageContent) {
        step.alternatives.enrichPassage(passageId, passageContent);
    },
    
    _getInterlinearMode : function(passageId) {
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

    /* 2 queues of calls backs for passages */
    callbacks : [ [], [] ]

};


$(step.passage).hear("passage-state-has-changed", function(s, data) {
    step.passage.changePassage(data.passageId);
});

$(step.passage).hear("slideView-SEARCH_PASSAGE", function (s, data) {
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
        self.higlightStrongs(data);
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
            if (step.util.raiseErrorIfBlank(value, "A version must be selected.")) {
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
            event.stopPropagation();
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
    }).change(function() {
        step.state.passage.reference(self.passageId, $(this).val());
    }).click(function() {
        $(this).autocomplete("search", $(this).val());
        
        //if no results, then re-run search with nothing
        if($(".passageReference", step.util.getPassageContainer(self.passageId)).attr("autocomplete") == "off") {
            //search for nothing
            $(this).autocomplete("search", "");
        }
    }).blur(function() {
        $(this).trigger('change');
    }).data( "autocomplete" )._renderItem = function( ul, item ) {
        ul.addClass("stepComplete");
        
        return $( "<li></li>" )
        .data( "item.autocomplete", item )
        .append( "<a>" + item.label + "</a>" )
        .appendTo( ul );
    };
};

/**
 * changes the passage, with optional parameters
 */

/**
 * highlights all strongs match parameter strongReference
 * 
 * @strongReference the reference look for across this passage pane and
 *                  highlight
 */
Passage.prototype.highlightStrong = function(strongReference) {
    // check for black listed strongs
    if ($.inArray(strongReference, Passage.getBlackListedStrongs()) == -1) {
        $(".verse span[strong='" + strongReference + "']", this.container).addClass("emphasisePassagePhrase");
        $("span.w[strong='" + strongReference + "'] span.text", this.container).addClass("emphasisePassagePhrase");
    }
};


/**
 * if a number of strongs are given, separated by a space, highlights all of
 * them
 * 
 * @param strongMorphReference
 *            the references of all strongs and morphs asked for
 */
Passage.prototype.higlightStrongs = function(strongMorphReference) {
    if (strongMorphReference.strong == null) {
        return;
    }

    var references = strongMorphReference.strong.split();

    // reset all spans that are underlined:
    $(".verse span", this.container).removeClass("emphasisePassagePhrase");
    $("span.text", this.container).removeClass("emphasisePassagePhrase");

    for ( var ii = 0; ii < references.length; ii++) {
        this.highlightStrong(references[ii]);
    }
};

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
/**
 * static method that returns strongs that should not be tagged in the UI
 */
Passage.getBlackListedStrongs = function() {
    return [ "G3588" ];
};

$(step.passage).hear("SEARCH_PASSAGE-activated", function(self, data) {
    step.passage.lastUrls[data.passageId] = undefined;
});


