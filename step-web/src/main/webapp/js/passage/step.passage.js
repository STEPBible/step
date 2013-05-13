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
    highlightStrong : function(passageId, strongReference, emphasiseClass) {
        var classes = emphasiseClass || "emphasisePassagePhrase";
        
        var container = passageId ? step.util.getPassageContainer(passageId) : $("body");
        
        
        // check for black listed strongs
        if ($.inArray(strongReference, this.blacklistedStrongs) == -1) {
            $(".verse [strong~='" + strongReference + "']", container).addClass(classes);
            $("span.w[strong~='" + strongReference + "'] span", container).addClass(classes);
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

        var references = strongMorphReference.strong.split(" ");
        var container = step.util.getPassageContainer(strongMorphReference.passageId);
        
        
        // reset all spans that are underlined:
        this.removeStrongsHighlights(strongMorphReference.passageId, strongMorphReference.classes);
        
        for ( var ii = 0; ii < references.length; ii++) {
            this.highlightStrong(strongMorphReference.passageId, references[ii], strongMorphReference.classes);
        }
    },

    removeStrongsHighlights : function(passageId, classes) {
        var classes = classes || "emphasisePassagePhrase";
        
        var container = passageId ? step.util.getPassageContainer(passageId) : $("body");
        $(".verse span", container).removeClass(classes);
        $("span.w span", container).removeClass(classes);
    },

    /* 2 queues of calls backs for passages */
    callbacks : [ [], [] ],
    blacklistedStrongs : [ "G3588" ],
};

//
//$(step.passage).hear("passage-state-has-changed", function(s, data) {
//    step.passage.changePassage(data.passageId);
//});
//
//$(step.passage).hear("slideView-SEARCH_PASSAGE", function (s, data) {
//    //notify hash change
//    step.state.browser.updateDetail(data.passageId);
//
//    step.passage.changePassage(data.passageId);
//});
//

function Passage(passageContainer, passageId) {
    // this is so that when we click a word, it highlights it
    // this.passage.click(function(e) {
    // var clickedWord = getWordAtPoint(this, e.pageX, e.pageY);
    // var lookup = clickedWord.replace(/[ ,.;:"]/g, "");
    //		
    // $.shout("show-all-strong-morphs", { displayedWord: lookup } );
    //		
    // });

    // register to listen for events that click a word/phrase:
//    this.passage.hear("show-all-strong-morphs", function(selfElement, data) {
//        step.passage.higlightStrongs(data);
//    });
//
//    // register when we want to be alerted that a bookmark has changed
//    this.passage.hear("show-preview-" + this.passageId, function(selfElement, previewData) {
//        self.showPreview(previewData);
//    });
//
//    this.passage.hear("version-list-refresh", function(selfElement, versions) {
//        step.version.refreshVersions(self.passageId, versions);
//    });
//
//    $(this.passage).hear("make-master-interlinear-" + this.passageId, function(selfElement, newMasterVersion) {
//        var interlinearVersion = step.state.passage.extraVersions(self.passageId).toUpperCase();
//        var currentVersion = step.state.passage.version(self.passageId).toUpperCase();
//        var newUpperMasterVersion = newMasterVersion.toUpperCase();
//
//        step.state.passage.extraVersions(self.passageId, interlinearVersion.replace(newUpperMasterVersion, currentVersion));
//        step.state.passage.version(self.passageId, newUpperMasterVersion);
//
//        $.shout("version-changed-dynamically" + self.passageId, newUpperMasterVersion);
//    });
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

$(step.passage).hear("SEARCH_PASSAGE-activated", function(self, data) {
    step.passage.lastUrls[data.passageId] = undefined;
});


