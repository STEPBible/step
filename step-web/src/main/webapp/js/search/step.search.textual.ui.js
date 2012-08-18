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
step.search.ui.textual = {
    evaluateQuerySyntax: function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        
        var query = "t=";
        query += this._evalExactPhrase($(".textPrimaryExactPhrase", passageContainer).val());
        query += this._evalAllWords($(".textPrimaryIncludeAllWords", passageContainer).val());
        query += this._evalAnyWord($(".textPrimaryIncludeWords", passageContainer).val());
        query += this._evalSpellings($(".textPrimarySimilarSpellings", passageContainer).val());
        query += this._evalStarting($(".textPrimaryWordsStarting", passageContainer).val());
        query += this._evalExcludeWord($(".textPrimaryExcludeWords", passageContainer).val());
        query += this._evalExcludePhrase($(".textPrimaryExcludePhrase", passageContainer).val());
        query += this._evalWordsWithinRangeOfEachOther(
                    $(".textPrimaryIncludeRangedWords", passageContainer).val(), 
                    $(".textPrimaryWithinXWords", passageContainer).val());
                
        var secondaryQuery = "";
        secondaryQuery += this._evalAllWords($(".textCloseByIncludeAllWords", passageContainer).val());
        secondaryQuery += this._evalExactPhrase($(".textCloseByExactPhrase", passageContainer).val());
        secondaryQuery += this._evalAnyWord($(".textCloseByIncludeWords", passageContainer).val());
        secondaryQuery += this._evalSpellings($(".textCloseBySimilarSpellings", passageContainer).val());
        secondaryQuery += this._evalStarting($(".textCloseByWordsStarting", passageContainer).val());
        secondaryQuery += this._evalExcludeWord($(".textCloseByExcludeWords", passageContainer).val());
        secondaryQuery += this._evalExcludePhrase($(".textCloseByExcludePhrase", passageContainer).val());
        secondaryQuery += this._evalWordsWithinRangeOfEachOther(
                    $(".textCloseByIncludeRangedWords", passageContainer).val(), 
                    $(".textCloseByWithinXWords", passageContainer).val());
        
        
        query = this._evalProximity($(".textVerseProximity", passageContainer).val(), query, secondaryQuery);
        
        var restriction = $(".textRestriction", passageContainer).val();
        query = this._evalTextRestriction(restriction, query);
        
        var restrictionExclude = $(".textRestrictionExclude", passageContainer).val();
        if(!step.util.isBlank(restrictionExclude) && !step.util.isBlank(restriction)) {
            step.util.raiseError("Both a restriction and an inclusion of range have been specified. The range restriction will be used.");
        } else {
            query = this._evalTextRestrictionExclude(restrictionExclude, query);
        }
        
        
        step.state.textual.textQuerySyntax(passageId, query);
        return query;
    },
    //TODO think about escaping
    _evalExactPhrase : function(text) {
        if(!step.util.isBlank(text)) {
            return ' "' + text + '" '; 
        }
        return "";
    },

    _evalAllWords : function(text) {
        if(!step.util.isBlank(text)) {
            var words = $.trim(text).split(" ").join(" AND ");
            return words ;
            //            return "(" + words + ")";
        }
        return "";
    },

    _evalAnyWord : function(text) {
        return " " + text;
    },
    
    _evalSpellings : function(text) {
        if(!step.util.isBlank(text)) {
            return " " + $.trim(text).split(" ").join("~ ") + "~ ";
        }
        return "";
    },
    
    _evalStarting : function(text) {
        if(!step.util.isBlank(text)) {
            return " " + $.trim(text).split(' ').join('* ') + '* '; 
        }
        return "";
    },
    
    _evalExcludeWord : function(text) {
        if(!step.util.isBlank(text)) {
            var words = text.split(" ");
            var syntax = "";
            for (var i = 0; i < words.length; i++) {
                syntax += " -" + words[i];
            }
            return syntax; 
        }
        return "";
    },
    
    _evalExcludePhrase : function(text) {
        if(!step.util.isBlank(text)) {
            return ' -"' + text +'"'; 
        }
        return "";
    },
    
    _evalWordsWithinRangeOfEachOther : function(text, range) {
        if(!step.util.isBlank(text)) {
            return ' "' + text + '"~' + range; 
        }
        return "";
    },
    
    _evalProximity : function(proximity, query, secondaryQuery) {
        if(!step.util.isBlank(proximity)) {
            //join the two queries up
            query = "(" + query + ") ~" + proximity + " (" + secondaryQuery + ")"; 
        }
        return query;
    },
    
    _evalTextRestriction : function(restriction, query) {
        if(!step.util.isBlank(restriction)) {
            //join the two queries up
            query = query + "+[" + restriction + "] "; 
        }
        return query;
    },

    _evalTextRestrictionExclude : function(restriction, query) {
        if(!step.util.isBlank(restriction)) {
            //join the two queries up
            query = "-[" + restriction + "] " + query; 
        }
        return query;
    }

};

$(document).ready(function() {
    var namespace = "textual";
    step.state.trackState([
                            ".textPrimaryExactPhrase",     
                            ".textPrimaryIncludeWords",
                            ".textPrimaryIncludeAllWords",
                            ".textPrimarySimilarSpellings",
                            ".textPrimaryWordsStarting",
                            ".textPrimaryExcludeWords",
                            ".textPrimaryExcludePhrase",
                            ".textPrimaryIncludeRangedWords",
                            ".textPrimaryWithinXWords",
                            ".textCloseByExactPhrase",
                            ".textCloseByIncludeWords",
                            ".textCloseByIncludeAllWords",   
                            ".textCloseBySimilarSpellings",
                            ".textCloseByWordsStarting",
                            ".textCloseByIncludeRangedWords",
                            ".textCloseByWithinXWords",
                            ".textVerseProximity",
                            ".textRestriction",
                            ".textRestrictionExclude",
                            ".textSortByRelevance",
                            ".textQuerySyntax",
                            ".textSearchContext"
                           ], namespace);
    
    step.util.ui.trackQuerySyntax(".textSearchTable", namespace);
    $(".textClearButton").click(function() {
        var passageId = step.passage.getPassageId(this);
        
        //need to register state, so don't go straight to the field on the screen
        step.state.textual.textPrimaryExactPhrase(passageId, "");
        step.state.textual.textPrimaryIncludeWords(passageId, "");
        step.state.textual.textPrimaryIncludeAllWords(passageId, "");
        step.state.textual.textPrimarySimilarSpellings(passageId, "");
        step.state.textual.textPrimaryWordsStarting(passageId, "");
        step.state.textual.textPrimaryExcludeWords(passageId, "");
        step.state.textual.textPrimaryExcludePhrase(passageId, "");
        step.state.textual.textPrimaryIncludeRangedWords(passageId, "");
        step.state.textual.textPrimaryWithinXWords(passageId, "");
        step.state.textual.textCloseByExactPhrase(passageId, "");
        step.state.textual.textCloseByIncludeWords(passageId, "");
        step.state.textual.textCloseByIncludeAllWords(passageId, "");
        step.state.textual.textCloseBySimilarSpellings(passageId, "");
        step.state.textual.textCloseByWordsStarting(passageId, "");
        step.state.textual.textCloseByIncludeRangedWords(passageId, "");
        step.state.textual.textCloseByWithinXWords(passageId, "");
        step.state.textual.textVerseProximity(passageId, "");
        step.state.textual.textRestriction(passageId, "");
        step.state.textual.textRestrictionExclude(passageId, "");
        step.state.textual.textSortByRelevance(passageId, true);
        step.state.textual.textQuerySyntax(passageId, "");
    });
    
    
    step.util.ui.searchButton(".textSearchButton",  'SEARCH_TEXT', function() {
        legend.trigger('click');
    });
    
    $(".showRanges").bind( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
                $(this).data( "autocomplete" ).menu.active ) {
            event.preventDefault();
        }
        }).click(function() {
            $(this).autocomplete("search", "");
        }).autocomplete({
            minLength: 0,
            delay : 0,
            source: function( request, response ) {
                // delegate back to autocomplete, but extract the last term
                response( $.ui.autocomplete.filter(
                    step.defaults.search.textual.availableRanges, extractLast( request.term ) ) );
            },
            focus: function() {
                return false;
            },
            select: function( event, ui ) {
                var target = $(event.target);
                target.val(ui.item.value);
                target.trigger('change');
                step.search.ui.textual.evaluateQuerySyntax(step.passage.getPassageId(target));
                return false;
            },
            open: function(event, ui) {
                //check we've got the right size
                $(".ui-autocomplete").map(function() {
                    //check if 'this' has a child containing the text of the first option
                    if($(this).find(":contains('" + step.defaults.search.textual.availableRanges[0].label + "')")) {
                        $(this).css('width', '300px');
                    };
                    return false;
                });
            }            
        });
});

$(step.search.ui).hear("textual-search-state-has-changed", function(s, data) {
    step.search.textual.search(data.passageId);
});

