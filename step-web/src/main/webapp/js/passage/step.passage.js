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
    blacklistedStrongs : [ "G3588" ],

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
            $(".heading [strong~='" + strongReference + "']", container).addClass(classes);
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
    }
};
