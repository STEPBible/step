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
    getPassageId : function(element) {
        return $(element).closest(".passageContainer").attr("passage-id");
    },

    getReference : function(passageId) {
        return $(".passageContainer[passage-id = " + passageId + "] .passageReference").val();
    },
    
    changePassage: function(passageId) {
        var lookupVersion = step.state.passage.version(passageId);
        var lookupReference = step.state.passage.reference(passageId);
        var options = step.state.passage.options(passageId);
        var interlinearVersion = step.state.passage.interlinearVersions(passageId);

        if (!step.util.raiseErrorIfBlank(lookupVersion, "A version must be provided")
                || !step.util.raiseErrorIfBlank(lookupReference, "A reference must be provided")) {
            return;
        }

        var url = BIBLE_GET_BIBLE_TEXT + lookupVersion + "/" + lookupReference;
        if (options && options.length != 0) {
            url += "/" + options;

            if (interlinearVersion && interlinearVersion.length != 0) {
                url += "/" + interlinearVersion;
            }
        }

        // send to server
        $.getSafe(url, function(text) {
            step.state.passage.range(passageId, text.startRange, text.endRange, text.multipleRanges);

            // we get html back, so we insert into passage:
            step.util.getPassageContent(passageId).html(text.value);

            // passage change was successful, so we let the rest of the UI know
            $.shout("passage-changed", {
                passageId : passageId
            });

            // execute all callbacks
            var items = step.passage.callbacks[passageId];
            while (items.length != 0) {
                items.pop()();
            }
        });
    },

    /* 2 queues of calls backs for passages */
    callbacks : [ [], [] ]
};


$(step.passage).hear("passage-state-has-changed", function(s, data) {
    step.passage.changePassage(data.passageId);
});



function Passage(passageContainer, rawServerVersions, passageId) {
    var self = this;
    this.container = passageContainer;
    this.version = $(".passageVersion", passageContainer);
    this.reference = $(".passageReference", passageContainer);
    this.passage = $(".passageContent", passageContainer);
    this.passageId = passageId;


    this.initVersionsTextBox(rawServerVersions);
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
        self.refreshVersionsTextBox(versions);
    });

    $(this.passage).hear("make-master-interlinear-" + this.passageId, function(selfElement, newMasterVersion) {
        var interlinearVersion = step.state.passage.interlinearVersions(self.passageId); 
        var currentVersion = step.state.passage.version(self.passageId);

        
        step.state.passage.interlinearVersions(self.passageId, interlinearVersion.replace(newMasterVersion, currentVersion), currentVersion, newMasterVersion);
        step.state.passage.version(self.passageId, newMasterVersion);

        $.shout("version-changed-dynamically" + self.passageId, newMasterVersion);
    });
};

/**
 * refreshes the list attached to the version dropdown
 */
Passage.prototype.refreshVersionsTextBox = function(rawServerVersions) {
    // need to make server response adequate for autocomplete:
    var parsedVersions = $.map(rawServerVersions, function(item) {
        var showingText = "[" + item.initials + "] " + item.name;
        var features = "";
        // add to Strongs if applicable, and therefore interlinear
        if (item.hasStrongs) {
            features += " " + "<span class='versionFeature strongsFeature' title='Vocabulary available'>V</span>";
            features += " " + "<span class='versionFeature interlinearFeature' title='Interlinear available'>I</span>";
        }

        // add morphology
        if (item.hasMorphology) {
            features += " " + "<span class='versionFeature morphologyFeature' title='Grammar available'>G</span>";
        }

        // return response for dropdowns
        return {
            label : showingText,
            value : item.initials,
            features : features
        };
    });

    this.version.autocomplete({
        source : parsedVersions
    });
};

/**
 * Sets up the autocomplete for the versions dropdown
 */
Passage.prototype.initVersionsTextBox = function(rawServerVersions) {
    var self = this;

    // set up autocomplete
    this.version.autocomplete({
        minLength : 0,
        delay : 0,
        select : function(event, ui) {
            //manually change the text, so that the change() method can fire against the right version
            self.version.val(ui.item.value);
            
            $(this).change();
        },
    }).focus(function() {
        self.version.autocomplete("search", "");
    }).change(function() {
        if (step.util.raiseErrorIfBlank(this.value, "A version must be selected.")) {
            step.state.passage.version(self.passageId, this.value);
            $(this).blur();
        }
        ;
    });

    this.version.data("autocomplete")._renderItem = function(ul, item) {
        return $("<li></li>").data("item.autocomplete", item).append("<a><span class='features'>" + item.features + "</span>" + item.label + "</a>").appendTo(
                ul);
    };

    this.refreshVersionsTextBox(rawServerVersions);
};

Passage.prototype.initReferenceTextBox = function() {
    var self = this;

    // set up change for textbox
    this.reference.autocomplete({
        source : function(request, response) {
            $.get(BIBLE_GET_BIBLE_BOOK_NAMES + request.term + "/" + step.state.passage.version(self.passageId), function(text) {
                response(text);
            });
        },
        minLength : 0,
        delay : 0,
        select : function(event, ui) {
            step.state.passage.reference(self.passageId, ui.item.value);
        }
    }).change(function() {
        step.state.passage.reference(self.passageId, $(this).val());
    });
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

Passage.prototype.getSelectedInterlinearVersion = function() {
    // look for menu item for interlinears...
    // we check that it has a tick and is enabled for the INTERLINEAR name
    var menuItem = $("a:has(img.selectingTick)[name = 'INTERLINEAR']", this.container).not(".disabled");

    if (menuItem.length) {
        return $(".interlinearPopup[passage-id = '" + this.passageId + "'] > .interlinearVersions").val();
    }
    return "";
};

Passage.prototype.setSelectedInterlinearVersion = function(newVersions, newlyAvailable, noLongerAvailable) {
    var popup = $(".interlinearPopup[passage-id = '" + this.passageId + "']");

    // set the popup underlying text
    $(".interlinearVersions", popup).val(newVersions);

    var input = $("input[value = '" + newlyAvailable + "']", popup);
    input.removeAttr('disabled');
    input.next().removeClass('inactive');

    // now disable the current one
    var currentVersion = $("input[value = '" + noLongerAvailable + "']", popup);
    currentVersion.attr('disabled', 'disabled');
    currentVersion.next().addClass('inactive');
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
        console.log(data);
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
    return [ "strong:G3588" ];
};



