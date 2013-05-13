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

step.lexicon = {
    passageId : 0,
    positioned : false,
    currentLexiconData : undefined,
    
    sameWordSearch : function(strongNumber, refLimit) {
        this.doSearch(ALL_FORMS, strongNumber, refLimit);
    },

    relatedWordSearch: function (strongNumber, refLimit) {
        this.doSearch(ALL_RELATED, strongNumber, refLimit);
    },

    doSearch : function(searchType, strongNumber, refLimit) {
        var query;
        if(strongNumber) {
            query = strongNumber;
        } else {
            query = $("span[info-name ='strongNumber']").text();
        }
        
        if(step.util.raiseErrorIfBlank(query, __s.error_no_strong_data)) {
            var targetPassageId = step.util.getOtherPassageId(this.passageId);
            
            var model = WordSearchModels.at(targetPassageId);
            var attributes = {};

            if(refLimit) {
                attributes.originalScope = refLimit;
                if (model.get("detail") < 1) {
                    attributes.detail = 1;
                }
            } else {
                attributes.originalScope = __s.whole_bible_range;
            }
            
            attributes.originalType = query[0] == 'H' ? HEBREW_WORDS[0] : GREEK_WORDS[0];
            attributes.originalWord = query;
            attributes.originalForms = searchType;
            attributes.searchContext = 0;
            attributes.originalSearchVersion = step.util.ui.getVisibleVersions(this.passageId).val();
            
            model.save(attributes);
            model.trigger("search", model, {});
            //if we're in single view, then we would want to bring up the second column
            step.state.view.ensureTwoColumnView();
        }
    },

    resetContainer : function (container) {
        $("*", container).each(function (index, element) {
            if ($(element).attr("info-name")) {
                $(element).html("");
            }
        });
    },

    populateNames : function (indexToWord, data, container) {
        this.resetContainer(container);

        // now check if we have information, if not, then hide
        if (data.length == 0) {
            $(container).hide();
            return;
        } else {
            $(container).show();
        }

        $("*", container).each(function (index, item) {
            var infoName = $(item).attr("info-name");
            if (infoName) {
                var infos = infoName.split("|");
                var content = data[indexToWord][infos[0]];
                if (content == "") {
                    content = data[indexToWord][infos[1]];
                }

                if (content) {
                    if (content.replace) {
                        content = content.replace(/_([^_]*)_/g, "<span class=\"emphasisePopupText\">$1</span>");
                    }

                    var targetItem = $(item);
                    if (targetItem.length > 0) {
                        targetItem.html(content);
                    }
                }

                if(infoName == 'accentedUnicode') {
                    //add correct font
                    targetItem.removeClass();
                    targetItem.addClass(data[indexToWord].strongNumber[0] == 'H' ? "hbFontSmall" : "unicodeFont");
                }
            }

            var dependencyList = $(item).attr("depends-on");
            if (dependencyList) {
                var dependencies = dependencyList.split(",");

                // if any one of the dependencies is to be shown, then we show
                for (var ii = 0; ii < dependencies.length; ii++) {
                    if (data[indexToWord][dependencies[ii]] != "") {
                        $(item).toggle(true);
                        return;
                    }
                }
                $(item).toggle(false);
            }
        });
    },

    switchWords : function(strongNumber) {
        if(this.currentLexiconData == undefined) {
            //an error occurred:
            log.console("Trying to switch words for undefined data.");
        }

        for(var i = 0; i < this.currentLexiconData.vocabInfos.length; i++) {
            if(this.currentLexiconData.vocabInfos[i].strongNumber == strongNumber) {
                //we're in business, so need to trigger the display again.
                this.showSingleWordOnPopup(i);
            }
        }
    },

    showSingleWordOnPopup : function(index) {
        var data = this.currentLexiconData;

        step.lexicon.populateNames(index, data.morphInfos, "#grammarContainer");
        step.lexicon.populateNames(index, data.vocabInfos, "#vocabContainer");

        if (data.vocabInfos[index] && data.vocabInfos[index].relatedNos) {
            var linkContainer =  $("*[info-name = 'relatedNos']", "#vocabContainer");
            $.each(data.vocabInfos[index].relatedNos, function(i, item) {
                //build a link, with gloss (unicode title='translit') 
                var unicode = $("<span>").append(item.matchingForm).addClass("ancientLanguage").prop("href", "javascript:void");
                var link = $("<a>").append(item.gloss + " (");
                link.append(unicode);
                link.append(")");
                link.prop("title", item.stepTransliteration)
                link.prop("strongNumber", item.strongNumber);
                link.addClass("lexiconRelatedWord");
                linkContainer.append(link);
            });
            
            $("span[info-name='relatedNos'] a").button().click(function() {
                showDef($(this).prop("strongNumber"));
            });
            $("span[info-name='relatedNos']").buttonset();
        }

        this.clearWordLinks();

        this.updateWordLinks(data.vocabInfos, index);
        var translit = $("[info-name='stepTransliteration']");
        step.util.ui.markUpTransliteration(translit);
    },

    /**
     * clears all entries contained in word links
     */
    clearWordLinks: function () {
        var entries = $("#vocabEntries");
        entries.empty();
    },

    updateWordLinks : function (vocabInfos, index) {
        //we don't do anything if we have only 1 vocabInfo
        if(vocabInfos && vocabInfos.length < 2) {
            return;
        }

        //create list from vocab infos
        var self = this;
        var links = "";
        var entries = $("#vocabEntries");

        entries = entries.append("<h5>" + __s.selected_lexicon_word + ": </h5>");

        for(var i = vocabInfos.length -1; i >= 0; i--) {
            var link = $("<input type='radio' class='lexiconWordLink' name='lexiconWordLink' />").attr("id", "lexiconWordLink" + i);
            var label = $("<label></label>").attr("for", "lexiconWordLink" + i).html(vocabInfos[i].stepGloss);
            
            
            self.addWordLinkClickHandler(link, vocabInfos[i]);

            if(i == index) {
                link.prop("checked", "true");
            }

            entries.append(label);
            entries.append(link.append(" "));
            link.button();
        }
    },

    /**
     * To avoid closure issues, we create a new function, in order to pass a copy of the vocabInfo.
     * This simply adds an onclick event
     * @param link that is being created
     * @param vocabInfo the vocabInfo containing the strong number
     */
    addWordLinkClickHandler : function(link, vocabInfo) {
        link.click(function(){
            step.lexicon.switchWords(vocabInfo.strongNumber);
        });
    }
};


/**
 * The bookmarks components record events that are happening across the
 * application, for e.g. passage changes, but will also show related information
 * to the passage.
 */
function LexiconDefinition() {
    var self = this;
    // listen for particular types of events and call the prototype functions
    this.getPopup().hear("show-all-strong-morphs", function(selfElement, data) {
        step.passage.higlightStrongs(data);

        self.showDef(data);

        // temporary measure, but we can keep it in as a safe-guard against no
        // strong mapping being found:
        $("span[info-name ='strong']").val(data.strong);
    });

    $("#origin").detailSlider({
        key: "lexicon",
        scopeSelector : "#lexiconDefinition"
    });
}
    
LexiconDefinition.prototype.getPopup = function() {
    if (this.popup) {
        return this.popup;
    }

    // create the popup container
    var lexiconDefinitionSelector = $("#lexiconDefinition");
    this.popup = lexiconDefinitionSelector;

    this.popup.tabs().draggable({
        handle : "#lexiconDefinitionHeader"
    });
    lexiconDefinitionSelector.tabs( "option", "active", 0);
    
    
    $('#lexiconPopupClose').button({ icons: { primary: "ui-icon-closethick" }, text: false }).click(function () {
        $('#lexiconDefinition').hide();
    });
    
    lexiconDefinitionSelector.offset({top : $(window).height() - lexiconDefinitionSelector.height() - 10 });
    
    return this.popup;
};

LexiconDefinition.prototype.showDef = function(data) {
    var self = this;

    step.lexicon.passageId = data.passageId;

    // create all tabs - first remove everything, then re-add.
    var strong = data.strong;
    var morph = data.morph;
    var verse = $(data.source).closest("span.verse").filter("a:first").attr("name");

    // Get info on word
    $.getSafe(MODULE_GET_INFO + strong + "/" + morph + "/" + verse, function(data) {
        self.showOriginalWordData(data);
    });

    this.reposition();
};


LexiconDefinition.prototype.showOriginalWordData = function(data) {
    //finally do the odd-ones out
    //we use the last info, as the main info
    if(data.vocabInfos.length == 0) {
        return;
    }
    // remove previous information
    step.lexicon.currentLexiconData = data;
    step.lexicon.showSingleWordOnPopup(data.vocabInfos.length - 1);
};

LexiconDefinition.prototype.reposition = function() {
    // if left position is negative, then we assume it's off screen and need
    // position
    var popup = this.getPopup();
    popup.css('display', 'block');
    if (!step.lexicon.positioned || popup.css("left")[0] == '-') {
        step.lexicon.positioned = true;
        var lexiconDefinition = $("#lexiconDefinition");
        lexiconDefinition.offset({
            top  : $(window).height() - lexiconDefinition.height() - 20,
            left : $(window).width() - lexiconDefinition.width() - 10
        });
        
    }
};
