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
            this.highlightStrong(undefined, strongNumbers[0], strongMorphReference.classes);
            for ( var i = 1; i < strongNumbers.length; i++) {
                if (step.util.suppressHighlight(strongNumbers[i]))
                    continue;
                this.highlightStrong(undefined, strongNumbers[i], strongMorphReference.classes);
            }
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
            }
        }
    },

    removeStrongsHighlights : function(passageId, classes) {
        var classes = classes || "emphasisePassagePhrase relatedWordEmphasis";
        var container = passageId ? step.util.getPassageContainer(passageId) : $("body");
        $(".verse span, span.w span, .heading span", container).removeClass(classes);
    }
};
