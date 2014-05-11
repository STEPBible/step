var DisplayView = Backbone.View.extend({
    doSwapInterlinearLink: function(passageContent) {
        var self = this;
        var versionLinks = passageContent.find("[data-version]");

        versionLinks.click(function() {
            var el = $(this);
            var newMasterVersion = el.attr("data-version");
            var newArgs = step.util.swapMasterVersion(newMasterVersion, self.model, false);
        }).attr("title", __s.interlinear_swap_master_version);
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
    doFonts: function (passageContent, options, interlinearMode, languages) {
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
            //we assume english, because we assume the server side has already rendered this class
            languages.splice(indexToSplice++, 0, "en");
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
            step.util.ui._applyCssClassesRepeatByGroup(passageContent, ".verseGrouping", fonts, undefined, 0, '.singleVerse');
        } else if (interlinearMode.indexOf("COLUMN") != -1) {
            step.util.ui._applyCssClassesRepeatByGroup(passageContent, "tr.row", fonts, undefined, 1);
        } else if(this.model.get("searchType") == 'PASSAGE') {
            //normal mode, so all we need to do is check the language version, and if greek or hebrew then switch the font
            if (fonts[0]) {
                passageContent.addClass(fonts[0]);
            }
        } else {
            passageContent.find(".searchResults .passageContentHolder, .expandedHeadingItem .passageContentHolder").addClass(fonts[0]);
        }
    }
});