var CONTINUOUS_SCROLLING_VERSE_GAP = 50;

step.passage = {
    lastUrls : [undefined, undefined],
    getPassageId : function(element) {
        return parseInt($(element).closest(".passageContainer").attr("passage-id"));
    },
    blacklistedStrongs : [ "G3588" ],

    /**
     * if a number of strongs are given, separated by a space, highlights all of
     * them
     *
     * @param strongMorphReference
     *            the references of all strongs and morphs asked for
     */
    higlightStrongs : function(strongMorphReference) {
		var showSimilarWord = step.passages.findWhere({ passageId: 0}).get("isSimilarWord");
		if (typeof showSimilarWord === "undefined") showSimilarWord = true;
        if ((strongMorphReference.strong == null) || (!showSimilarWord)) return;

        var strongNumbers = strongMorphReference.strong.split(" ");


        // reset all spans that are underlined:
        this.removeStrongsHighlights(undefined, strongMorphReference.classes);

        if (strongNumbers.length > 0) {
            var skippedCount = 0;
            for ( var i = 0; i < strongNumbers.length; i++) {
                if ((strongNumbers.length > 1) && (("G0846,H0853,G1161,G3588,G3754G,".indexOf(strongNumbers[i] + ",") > -1) || (strongNumbers[i].substring(0,2) === "H9"))) {
                    skippedCount ++;
                    continue;
                }
                this.highlightStrong(undefined, strongNumbers[i], strongMorphReference.classes);
            }
            if (skippedCount == strongNumbers.length) // If everything is skipped, show the first one.
                this.highlightStrong(undefined, strongNumbers[0], strongMorphReference.classes);
        }
    },

    /**
     * highlights all strongs match parameter strongReference
     *
     * @strongReference the reference look for across this passage pane and
     *                  highlight
     */
    highlightStrong : function(passageId, strongReference, emphasiseClass) {
		var showSimilarWord = step.passages.findWhere({ passageId: 0}).get("isSimilarWord");
		if (typeof showSimilarWord === "undefined") showSimilarWord = true;
        if ((!strongReference) || (!showSimilarWord)) return;

        var classes = emphasiseClass || "emphasisePassagePhrase";

        var container = passageId ? step.util.getPassageContainer(passageId) : $("body");

        var strongs = strongReference.split(' ');
        for(var i = 0; i < strongs.length; i++) {
            // check for black listed strongs
            if ($.inArray(strongs[i], this.blacklistedStrongs) == -1) {
				step.util.highlightStrong(strongs[i], '.heading [strong', "", container, classes);
				step.util.highlightStrong(strongs[i], '.verse [strong', "", container, classes);
				step.util.highlightStrong(strongs[i], 'span.w[strong', "span", container, classes);
//                $(".heading [strong~='" + step.util.unaugmentStrong(strongs[i]) + "']", container).addClass(classes);
//                $(".verse [strong~='" + step.util.unaugmentStrong(strongs[i]) + "']", container).addClass(classes);
//                $("span.w[strong~='" + step.util.unaugmentStrong(strongs[i]) + "'] span", container).addClass(classes);
            }
        }
    },

    removeStrongsHighlights : function(passageId, classes) {
        var classes = classes || "emphasisePassagePhrase relatedWordEmphasis";

        var container = passageId ? step.util.getPassageContainer(passageId) : $("body");
        $(".verse span, span.w span, .heading span", container).removeClass(classes);
    }
};
