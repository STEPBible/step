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
step.search.ui.original = {
    allForms : [false,false],
        
    strongNumber : function(value, passageId) {
        $(".strongSearch", step.util.getPassageContainer(passageId)).val(value);
    },

    _setTitleFromTargetChange : function(target, value) {
        switch(value) {
            case WORDS_MEANING[0]   : step.search.ui.original._setTitleForWord(target, WORDS_MEANING[1]);   break;
            case GREEK_WORDS[0]     : step.search.ui.original._setTitleForWord(target, GREEK_WORDS[1]);     break;
            case HEBREW_WORDS[0]    : step.search.ui.original._setTitleForWord(target, HEBREW_WORDS[1]);    break;
        }
    },
    
    _setTitleForWord : function(target, option) {
            $(target).closest("fieldset").find(".originalWord").attr("title", option);
    },
    
    _displayCorrectOptions : function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        var currentType = $(".originalType", passageContainer).val();
        
        if(currentType == WORDS_MEANING[0]) {
            $(".originalMeaning", passageContainer).toggle(false);       
            $(".originalAncient", passageContainer).toggle(false);
        } else {
             $(".originalAncient", passageContainer).toggle(true);       
             $(".originalMeaning", passageContainer).toggle(false);       
        }
        
        this._displayCorrectGroupBy(passageId, passageContainer, currentType);
    },
    
    _displayCorrectGroupBy : function(passageId, passageContainer, currentType) {
        if(currentType == WORDS_MEANING[0]) {
            $(".originalSorting", passageContainer).prop("disabled", false);
            return;
        } 
        
        if(currentType == GREEK_WORDS[0] || currentType == HEBREW_WORDS[0]) {
            var kindOfForms = $(".originalForms", passageContainer).val();
            if(kindOfForms == ALL_RELATED) {
                $(".originalSorting", passageContainer).prop("disabled", false);
                return;
            } 
        } 
        $(".originalSorting", passageContainer).prop("disabled", true);
    },
    
    _displayGrammar : function(passageId) {
        var currentType = $(".originalType", passageContainer).val();
        
        step.util.getPassageContainer(passageId);
        if(currentType == GREEK_WORDS[0]) {
            //do greek options
            $(".grammarSearchOption").each(function(index, item) {
                var myItem = $(item);
                if($(item).hasClass(".function")) {
                    myItem.append($("<input type='checkbox'  />").attr('value', "noun")).append("Noun");
                    
                }
            });
        } else if(currentType == HEBREW_WORDS[0]) {
            //do hebrew
        }
    },
    
    restoreDefaults : function(passageId, force) {
        step.util.ui.resetIfEmpty(passageId, force, step.state.original.originalType,  step.defaults.search.original.originalTypes[0]);
        step.util.ui.resetIfEmpty(passageId, force, step.state.original.originalForms,  step.defaults.search.original.originalForms[1]);
        step.util.ui.resetIfEmpty(passageId, force, step.state.original.originalScope,  step.defaults.search.textual.availableRanges[0].value);
        step.util.ui.resetIfEmpty(passageId, force, step.state.original.originalWordScope,  "Mat 1:1");
        step.util.ui.resetIfEmpty(passageId, force, step.state.original.originalSorting,  step.defaults.search.original.originalSorting[0]);
    },
    
    restoreTitle : function(passageId, force) {
        var target = $(".originalType", step.util.getPassageContainer(passageId));
        var value = target.val();
        step.search.ui.original._setTitleFromTargetChange(target, value);
    },
    
    restoreOptions : function(passageId, force) {
        step.search.ui.original._displayCorrectOptions(passageId);
    },
    
    updateSliderLevel : function(passageId, newLevel) {
        $("fieldset:visible", step.util.getPassageContainer(passageId)).detailSlider("update",  { value: newLevel });
    },
    
    getLevel : function(passageId) {
        return $("fieldset:visible", step.util.getPassageContainer(passageId)).detailSlider("value");
    },
    
    evaluateQuerySyntax : function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        var level = this.getLevel(passageId);
        var originalType = $(".originalType", passageContainer).val();
        var originalWord = $(".originalWord", passageContainer).val();
        
        var originalScope = level == 0 ? "Gen-Rev" : $(".originalScope", passageContainer).val();
        var originalSorting = $(".originalSorting", passageContainer).val();

        var originalWordScope = "";
        
        var query = "o";
        if(originalType == WORDS_MEANING[0]) {
            query += "m";
        } else {
            if (originalType == GREEK_WORDS[0]) {
                query += "g";
            } else if(originalType == HEBREW_WORDS[0]) {
                query += "h";
            }
            
            var originalForms = $(".originalForms", passageContainer).val();
            if(originalForms == SPECIFIC_GRAMMAR) {
                query += "~";
                
                query += "noun~verb~"
                //TODO add forms for grammar
            } else if(originalForms == ALL_RELATED) {
                query += "~"
            } else if(originalForms == ALL_FORMS) {
                //add a = to make a double equal
                query += "*";
            }
        }
        query += "=";
        
        query += "+[" + originalScope + "] ";
        if(originalWordScope != "") {
            query += "{" + originalWordScope + "}";
        }
        query += originalWord;
        
        step.state.original.originalQuerySyntax(passageId, query);
        return query;
    },
    
    autocomplete : function() {
        $(document).ready(function() {
            var target = $(".originalWord");
            
            $.each(target, function(i, singleTarget) {
                $(singleTarget).lexicalcomplete({
                    minLength : 2,
                    select : function(event, ui) {
                        //manually change the text, so that the change() method can fire against the right version
                        $(this).val(ui.item.value);
                        $(this).change();
                        $(this).trigger('keyup');
                    },
                    open: function(event, ui) {
                        //check we've got the right size
                        $(".ui-autocomplete").map(function() {
                            //check if 'this' has a child containing the text of the first option
                                $(this).css('width', '400px').css("overflow-x", "hidden");
                        });
                    },
                    source : function(request, response) {
                        var passageId =  step.passage.getPassageId(this.element);
                        var searchType = step.state.original.originalType(passageId);
                        var suggestionType = undefined;
                        if(searchType == HEBREW_WORDS[0]) {
                            suggestionType = "hebrew";
                        } else if(searchType == GREEK_WORDS[0]) {
                            suggestionType = "greek";
                        } else if(searchType == WORDS_MEANING[0]){
                            suggestionType = "meaning";
                        }
                        
                        if(suggestionType == null) {
                            return response({});
                        }
                        
                        $.getPassageSafe({
                            url : SEARCH_SUGGESTIONS,
                            args : [suggestionType, encodeURIComponent(step.util.replaceSpecialChars(request.term)), step.search.ui.original.allForms[passageId]], 
                            callback: function(text) {
                                response($.map(text, function(item) {
                                    return { label: "<span>" + 
                                            "<span class='suggestionColumn ancientSearchSuggestion'>" + item.matchingForm + "</span>" +
                                            "<span class='suggestionColumn stepTransliteration'>" + step.util.ui.markUpTransliteration(item.stepTransliteration) + "</span>" + 
                                            "<span class='suggestionColumn'>" + item.gloss + "</span>" +
                                        "</span>", value: suggestionType == "meaning" ? item.gloss : item.matchingForm };
                                }));
                            },
                            passageId : step.passage.getPassageId(this),
                            level : 'error'
                       });
                    }
                }).data("customLexicalcomplete")._renderItem = function(ul, item) {
                    return $("<li></li>").data("ui-autocomplete-item", item).append("<a>" + item.label + "</a>").appendTo(ul);
                }
            });
            
            target.click(function() {
               $(this).lexicalcomplete("search");
            });
            
            $(step.search.ui.original).hear("lexical-filter-change", function(self, data) {
                var wordBox = $(".originalWord", step.util.getPassageContainer(data.passageId));
                wordBox.lexicalcomplete("search");
            });
        });
    }
};

$(document).ready(function() {
    var namespace = "original";
    step.state.trackState([".originalType", 
                           ".originalWord", 
                           ".originalForms", 
                           ".originalScope",
                           ".originalSorting",
                           ".originalSearchContext",
                           ".originalWordScope", 
                           ".originalSearchVersion",
                           ".originalPageNumber",
                           ".originalQuerySyntax"
                           ], namespace, [step.search.ui.original.restoreDefaults, step.search.ui.original.restoreTitle, step.search.ui.original.restoreOptions]);
    
    step.util.ui.autocompleteSearch(".originalType", step.defaults.search.original.originalTypes, true, function(target, value) {
       step.search.ui.original._setTitleFromTargetChange(target, value);
       step.search.ui.original._displayCorrectOptions(step.passage.getPassageId(target));
    });
    
    step.util.ui.autocompleteSearch(".originalForms", step.defaults.search.original.originalForms, true, function(target, value) {
        step.search.ui.original._displayCorrectOptions(step.passage.getPassageId(target));
    });
    step.util.ui.autocompleteSearch(".originalScope", step.defaults.search.textual.availableRanges);
    step.util.ui.autocompleteSearch(".originalSorting", step.defaults.search.original.originalSorting, true);
//    step.util.ui.autocompleteSearch(".originalWordScope", step.defaults.search.textual.availableRanges);

    step.search.ui.original.autocomplete();
    
    step.util.ui.trackQuerySyntax(".wordSearch", namespace);
    step.util.ui.searchButton(".originalSearchButton", 'SEARCH_ORIGINAL', undefined, function(passageId) { step.search.original.filters[passageId] = undefined });
     
    $(".originalClear").click(function() {
        var passageId = step.passage.getPassageId(this);
        step.search.ui.original.restoreDefaults(passageId, true);
        step.search.ui.original.restoreTitle(passageId, true);
        step.search.ui.original.restoreOptions(passageId, true);
        step.state.original.originalWord(passageId, "");
    });

    //do qtip for textbox
    $(".originalWord").qtip({
        show :  { event: 'focus' },
        hide : { event: 'blur' },
        position: {
            my: "bottom center",
            at: "top center",
            viewport: $(window)
        },
        style : {
            classes : "primaryLightBg primaryLightBorder"
        }
    });

    
    //do qtip for textbox
    $(".originalScope").qtip({
        show : { delay: 500 },
        position: {
            my: "bottom center",
            at: "top center",
            viewport: $(window)
        },
        style : {
            classes : "primaryLightBg primaryLightBorder"
        }
    });
});

$(step.search.ui.original).hear("original-search-state-has-changed", function(s, data) {
    step.search.original.search(data.passageId);
});



