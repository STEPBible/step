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

/**
 * Definition of the Passage component responsible for displaying OSIS passages
 * appropriately. Ties the search box for the reference and the version together
 * to the passage displayed
 * 
 * @param passageContainer
 *            the passage Container containing the whole control
 * @param versions
 *            the list of versions to use to populate the dropdown
 */

step.passage = {
    getPassageId : function(menuItem) {
        return $(menuItem).closest(".passageContainer").attr("passage-id");
    },

    getReference : function(passageId) {
        return $(".passageContainer[passage-id = " + passageId + "] .passageReference").val();
    },

    /* 2 queues of calls backs for passages */
    callbacks : [ [], [] ]
};

function Passage(passageContainer, rawServerVersions, passageId) {
    var self = this;
    this.container = passageContainer;
    this.version = $(".passageVersion", passageContainer);
    this.reference = $(".passageReference", passageContainer);
    this.passage = $(".passageContent", passageContainer);
    this.passageId = passageId;

    $(this).hear("passage-state-has-changed-" + passageId, function() {
        self.changePassage();
    });

    // read state from the cookie
    step.state.passage.restore(this.passageId);

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
        var interlinearVersion = self.getSelectedInterlinearVersion();
        var currentVersion = step.state.passage.version(this.passageId);

        self.setSelectedInterlinearVersion(interlinearVersion.replace(newMasterVersion, currentVersion), currentVersion, newMasterVersion);
        step.state.passage.version(this.passageId, newMasterVersion);

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
            step.state.passage.version(self.passageId, ui.item.value);
            $(this).change();
        },
    }).focus(function() {
        self.version.autocomplete("search", "");
    }).change(function() {
        if (step.util.raiseErrorIfBlank(this.value, "A version must be selected.")) {
            $.shout("version-changed-" + self.passageId, this.value);
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
            // $(this).val(ui.item.value);
        }
    }).change(function() {
        step.state.passage.reference(self.passageId, $(this).val());
        // self.changePassage();
    });
};

/**
 * changes the passage, with optional parameters
 */
Passage.prototype.changePassage = function() {
    var self = this;
    var lookupVersion = step.state.passage.version(this.passageId);
    var lookupReference = step.state.passage.reference(this.passageId);
    var options = step.state.passage.options(this.passageId);
    var interlinearVersion = step.state.passage.interlinearVersions(this.passageId);

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
    $.get(url, function(text) {
        step.state.passage.range(self.passageId, text.startRange, text.endRange, text.multipleRanges);

        // we get html back, so we insert into passage:
        self.passage.html(text.value);

        // passage change was successful, so we let the rest of the UI know
        $.shout("passage-changed", {
            passageId : self.passageId
        });

        // execute all callbacks
        var items = step.passage.callbacks[self.passageId];
        while (items.length != 0) {
            items.pop()();
        }
    });
};

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

/**
 * sets the toolbar so that the passage can open/close it
 */
Passage.prototype.setToolbar = function(toolbar) {
    this.toolbar = toolbar;
};

/**
 * sets the passage container, so that others can insert themselves into it
 */
Passage.prototype.getPassageContainer = function() {
    return this.container;
};

/**
 * @return the reference text
 */
Passage.prototype.getReference = function() {
    return this.reference.val();
};
