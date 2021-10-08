var DisplayView = Backbone.View.extend({
    doSwapInterlinearLink: function(passageContent) {
        var self = this;
        var versionLinks = passageContent.find("[data-version]");

        var disabled = versionLinks.filter("[data-version-disabled='true']");
        disabled.attr("title", __s.interlinear_no_text_for_version);

        versionLinks.not(disabled).click(function() {
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
		var numOfItemsToAddToArray = 0;
		var interLinearElements = passageContent.find('span.w.verseStart');
		if (interLinearElements.length > 0) {
			var elementsWithInterLinearOptions = interLinearElements.first().find("span.strongs");
			// defined in interlinear.xsl around line 369 and 416
			var interLinearOptions = ["Text Trans", "Orig Vocab", "Vocab Trans", "Eng Vocab", "Esp Vocab", "中文詞", "中文词"];
			for (var i = 0; i < elementsWithInterLinearOptions.length; i++ ) {
				if (interLinearOptions.indexOf(elementsWithInterLinearOptions[i].textContent) > -1)
					numOfItemsToAddToArray ++;
			}
			elementsWithInterLinearOptions = interLinearElements.first().find("span.morphs");
			if ((elementsWithInterLinearOptions.length > 0) && (elementsWithInterLinearOptions[0].textContent === "Grammar"))
				numOfItemsToAddToArray ++;
		}
		for (var i = 0; i < numOfItemsToAddToArray; i++) {
			languages.splice(1, 0, "en");
		}
		// var numOfVersion = 0;
		// var allHaveStrong = true;
		// var allCanShowGrammar = true;
		// var data = step.util.activePassage().get("searchTokens") || [];
		// for (var i = 0; i < data.length; i++) {
			// if (data[i].tokenType == VERSION) {
				// var versionInitials = data[i].enhancedTokenInfo.initials;
				// allHaveStrong = ((allHaveStrong) && (step.keyedVersions[versionInitials].hasStrongs));
                // allCanShowGrammar = ((allCanShowGrammar) &&
                    // (step.keyedVersions[versionInitials].hasMorphology) &&
                    // ((step.keyedVersions[versionInitials].languageCode === "grc") || (versionInitials.toLowerCase().indexOf("kjv") == 0)) ); // As of Sept 2021, there is no support of Hebrew grammar.  The code on the backend has not been created.
				// numOfVersion ++;
			// }
		// }

        // if (options.indexOf("E") != -1) {
			// if ((numOfVersion == 1) || ((numOfVersion > 1) && (interlinearMode === "INTERLINEAR")))
				// languages.splice(indexToSplice++, 0, "en");
        // }
        // if (options.indexOf("T") != -1) {
            // languages.splice(indexToSplice++, 0, "en");
        // }
        // if (options.indexOf("O") != -1) {
            // languages.splice(indexToSplice++, 0, "en");
        // }
        // if (options.indexOf("A") != -1) {
			// if ( ((numOfVersion == 1) || ((numOfVersion > 1) && (interlinearMode === "INTERLINEAR"))) && 
                // (allHaveStrong) )
				// languages.splice(indexToSplice++, 0, "en");
        // }
        // if (options.indexOf("M") != -1) {
			// if ( ((numOfVersion == 1) || ((numOfVersion > 1) && (interlinearMode === "INTERLINEAR"))) && 
                // (allCanShowGrammar) )
				// languages.splice(indexToSplice++, 0, "en");
        // }

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
    },
    //Can be removed when/if Chrome fixes this
    _doChromeHack: function (passageHtml, interlinearMode, options) {
        //only applies to Chrome
        if (!$.isChrome) {
            return;
        }

        if (!passageHtml) {
            passageHtml = this.$el;
        }

        if (!interlinearMode) {
            if (this.model == undefined) {
                //no point in continuing if no model, since there can't be much on the page.
                return;
            }
            interlinearMode = this.model.get("interlinearMode");
        }

        if (!options) {
            options = this.model.get("options");
        }


        if (!this._isInterlinearMode(interlinearMode, options)) {
            return;
        }
        var interlinearBlocks = passageHtml.find(".interlinear span.w");

        //reset the 'clear' values
        interlinearBlocks.not(".verseStart").css("clear", "none");
        var previousElementOffset = undefined;

        for (var i = 0; i < interlinearBlocks.length; i++) {
            var element = interlinearBlocks.eq(i);
            var elementOffset = element.offset();

            //skip the first element
            if (previousElementOffset) {
                //check that previous element is either left or higher up
                var currentPadding = 0;
                if (previousElementOffset.top < elementOffset.top) {
                    element.css("clear", "left");
                }
                elementOffset = element.offset();
            }
            previousElementOffset = elementOffset;
        }
    },
    /**
     * Estimates the height of each block in an interlinear like way
     * @param individualBlocks each individual block in an interlinear.
     * @returns {Array}
     * @private
     */
    _getBlockSizes: function (individualBlocks) {
        //get sizes
        var sizes = [];
        var obtainedSizes = 0;
        for (var i = 0; i < individualBlocks.length; i++) {
            var block = individualBlocks.eq(i);
            var blockChildren = block.children();

            //initialise if not already done
            if (sizes.length == 0) {
                for (var j = 0; j < blockChildren.length; j++) {
                    sizes.push(-1);
                }
            }

            if (block.hasClass("verseStart")) {
                continue;
            }

            for (var j = 0; j < blockChildren.length; j++) {
                var blockChild = blockChildren.eq(j);
                if (sizes[j] == -1) {
                    sizes[j] = blockChild.height();
                    obtainedSizes++;
                }
            }
            if (obtainedSizes == sizes.length) {
                break;
            }
        }
        return sizes;
    },
    _isInterlinearMode: function (interlinearMode, options) {
        return options.indexOf("E") != -1 ||
            options.indexOf("T") != -1 ||
            options.indexOf("A") != -1 ||
            options.indexOf("M") != -1 ||
            interlinearMode == "INTERLINEAR"
    },

    /**
     * Resizes the interlinear verse numbers to line them up properly against their counter-part text nodes.
     * @param interlinearMode
     */
    doInterlinearVerseNumbers: function (passageContent, interlinearMode, options) {
        if (this._isInterlinearMode(interlinearMode, options)) {

            var targetParentElement = passageContent;
            if (!targetParentElement.hasClass("passageContentHolder")) {
                targetParentElement = targetParentElement.find(".passageContentHolder");
            }

            //obtain heights first...
            var individualBlocks = targetParentElement.children().children();
            if (individualBlocks.length == 0) {
                return;
            }

            var sizes = this._getBlockSizes(individualBlocks);

            //do verse numbers
            var verseNumbers = $(".verseStart", targetParentElement);
            for (var k = 0; k < verseNumbers.length; k++) {
                var verseBlocks = verseNumbers.eq(k).children();
                for (var i = 0; i < verseBlocks.length; i++) {
                    if (i < sizes.length && sizes[i] != 0) {
                        verseBlocks.eq(i).height(sizes[i]).css('line-height', sizes[i] + "px");
                    }
                }
            }

            //do all empty nodes as well.
            var allTextNodes = individualBlocks.not(".verseStart").children();
            for (var index = 0; index < allTextNodes.length; index++) {
                var potentialNode = allTextNodes.eq(index);
                if (potentialNode.hasClass("w")) {
                    //we're looking at a parent element, so do the same for the children
                    var wChildren = potentialNode.children();
                    for (var j = 0; j < wChildren.length; j++) {
                        wChildren.eq(j).height(sizes[j]).css('line-height', sizes[j] + "px")
                    }
                } else if (step.util.isBlank(potentialNode.text())) {
                    //work out index
                    var indexInParent = potentialNode.index();
                    if (indexInParent < sizes.length && sizes[indexInParent] != 0) {
                        potentialNode.height(sizes[indexInParent]).css('line-height', sizes[indexInParent] + "px");
                    }
                }
            }
        }
    }
});