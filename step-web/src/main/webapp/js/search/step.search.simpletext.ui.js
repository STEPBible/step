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
step.search.ui.simpleText = {
    evaluateQuerySyntax: function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        
        var query = "";
        var prefix = "t=";
        
        var primaryType = $(".simpleTextTypePrimary", passageContainer).val();
        var primaryCriteria = $(".simpleTextCriteria", passageContainer).val();
        var secondaryType = $(".simpleTextTypeSecondary", passageContainer).val();
        var secondaryCriteria = $(".simpleTextSecondaryCriteria", passageContainer).val();
        var proximity = $(".simpleTextProximity", passageContainer).val();
        var includeExclude = $(".simpleTextInclude", passageContainer).val();
        
        //if no primary criteria, exit here
        if(step.util.isBlank(primaryCriteria)) {
            step.state.simpleText.simpleTextQuerySyntax(passageId, query);
            return;
        }
        
        //add the restriction
        var restriction = step.state.simpleText.simpleTextScope(passageId);
        var restrictionQuery = step.search.ui.textual._evalTextRestriction(restriction, query);

        //eval first part of the criteria
        query = this._evalCriteria(primaryType, primaryCriteria, query);

        if(secondaryCriteria == null || $.trim(secondaryCriteria) == "") {
            var finalQuery = prefix + restrictionQuery + query;
            step.state.simpleText.simpleTextQuerySyntax(passageId, finalQuery);
            return finalQuery;
        }
        
        var firstSpace = proximity.indexOf(' ');
        var proximityRange = proximity == step.defaults.search.textual.simpleTextProximities[0] ? "same" : proximity.substring(0, firstSpace);

        
        if(includeExclude == step.defaults.search.textual.simpleTextIncludes[0]) {
            if(!isNaN(proximityRange)) {
                query += " ~" + proximityRange + " ";
            } else {
                //add brackets and AND
                query = "(" + $.trim(query) + ") AND ";
            }
            
            query = this._evalCriteria(secondaryType, secondaryCriteria, query);
        } else if (includeExclude == step.defaults.search.textual.simpleTextIncludes[1]) {
            if(secondaryType == step.defaults.search.textual.simpleTextSecondaryTypes[0]) {
                //excluding separate words
                query += step.search.ui.textual._evalExcludeWord(secondaryCriteria);
            } else {
                //excluding a phrase
                query += step.search.ui.textual._evalExcludePhrase(secondaryCriteria);
            }
        }
        
        var finalQuery = prefix + restrictionQuery + query; 
        step.state.simpleText.simpleTextQuerySyntax(passageId, finalQuery);
        return finalQuery;
    },
    
    _evalCriteria : function(searchType, criteria, query) {
            switch($.trim(searchType)) {
            case step.defaults.search.textual.simpleTextTypes[0] : query += step.search.ui.textual._evalAnyWord(criteria); break; 
            case step.defaults.search.textual.simpleTextTypes[1] : query += step.search.ui.textual._evalAllWords(criteria); break; 
            case step.defaults.search.textual.simpleTextTypes[2] : query += step.search.ui.textual._evalExactPhrase(criteria); break; 
            case step.defaults.search.textual.simpleTextTypes[3] : query += step.search.ui.textual._evalSpellings(criteria); break; 
            case step.defaults.search.textual.simpleTextTypes[4] : query += step.search.ui.textual._evalStarting(criteria); break; 
        }
        return query;
    },

    restoreDefaults : function(passageId, force) {
        step.util.ui.resetIfEmpty(passageId, force, step.state.simpleText.simpleTextTypePrimary, step.defaults.search.textual.simpleTextTypes[0]);
        step.util.ui.resetIfEmpty(passageId, force, step.state.simpleText.simpleTextScope, step.defaults.search.textual.availableRanges[0].value);
        step.util.ui.resetIfEmpty(passageId, force, step.state.simpleText.simpleTextInclude, step.defaults.search.textual.simpleTextIncludes[0]);
        step.util.ui.resetIfEmpty(passageId, force, step.state.simpleText.simpleTextTypeSecondary, step.defaults.search.textual.simpleTextTypes[1]);
        step.util.ui.resetIfEmpty(passageId, force, step.state.simpleText.simpleTextProximity, step.defaults.search.textual.simpleTextProximities[0]);
        step.util.ui.resetIfEmpty(passageId, force, step.state.simpleText.simpleTextSortByRelevance, step.defaults.search.textual.simpleTextSortBy[0]);
    },
    
    restoreIncludeExclude : function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        var include = $(".simpleTextInclude", passageContainer);
        step.search.ui.simpleText.includeProximityChange(include, include.val());
    },
    
    includeProximityChange : function(currentElement, value) {
        var proximity = $(currentElement).closest("table").find(".simpleTextProximity");
        if(value == 'include') {
            if(proximity.val() == 'the same verse') {
                //reset
                proximity.val(step.defaults.search.textual.simpleTextProximities[0]);
                proximity.attr('disabled', false);
            }
        } else if(value == 'exclude') {
            proximity.val(step.defaults.search.textual.simpleTextProximities[0]);
            proximity.attr('disabled', true);
        }
    }
};

$(document).ready(function() {
    var namespace = "simpleText";
    step.state.trackState([
                           ".simpleTextTypePrimary",
                           ".simpleTextCriteria",
                           ".simpleTextScope",
                           ".simpleTextInclude",
                           ".simpleTextTypeSecondary",
                           ".simpleTextSecondaryCriteria",
                           ".simpleTextProximity",
                           ".simpleTextSortByRelevance",
                           ".simpleTextQuerySyntax",
                           ".simpleTextSearchContext",
                           ".simpleTextSearchVersion",
                           ".simpleTextPageNumber"
                           ], namespace, [step.search.ui.simpleText.restoreDefaults, step.search.ui.simpleText.restoreIncludeExclude]);

    step.util.ui.trackQuerySyntax(".simpleTextFields", namespace);
    $(".simpleTextClear").click(function() {
        //  reset texts
        var passageId = step.passage.getPassageId(this);
        step.state.simpleText.simpleTextCriteria(passageId, "");
        step.state.simpleText.simpleTextSecondaryCriteria(passageId, "");
        
        //then reset dropdowns
        step.search.ui.simpleText.restoreDefaults(passageId, true);
        step.state.simpleText.simpleTextQuerySyntax(passageId, "");
    });

      step.util.ui.searchButton(".simpleTextSearchButton",  'SEARCH_SIMPLE_TEXT');
      step.util.ui.autocompleteSearch(".simpleTextType", step.defaults.search.textual.simpleTextTypes, true);
      step.util.ui.autocompleteSearch(".simpleTextSecondaryTypes", step.defaults.search.textual.simpleTextSecondaryTypes, true);
      step.util.ui.autocompleteSearch(".simpleTextScope", step.defaults.search.textual.availableRanges);
      step.util.ui.autocompleteSearch(".simpleTextProximity", step.defaults.search.textual.simpleTextProximities, true);
      step.util.ui.autocompleteSearch(".simpleTextSortByRelevance", step.defaults.search.textual.simpleTextSortBy, true);
      step.util.ui.autocompleteSearch(".simpleTextInclude", step.defaults.search.textual.simpleTextIncludes, true, function(currentElement, value) {
          step.search.ui.simpleText.includeProximityChange(currentElement, value);
      });
      
      //also add a qtip
      $(".simpleTextScope").qtip({
          show :  { event: 'focus' },
          hide : { event: 'blur' },
          position: {
              at: "right center",
              my: "left center",
              viewport: $(window)
          },
           style: { 
               tip: 'leftMiddle' // Notice the corner value is identical to the previously mentioned positioning corners
            }
      });
});

$(step.search.ui).hear("SEARCH_SIMPLE_TEXT-activated", function(s, data) {
    //check version on toolbar
    var version = step.state.simpleText.simpleTextSearchVersion(data.passageId);
    if(step.util.isBlank(version)) {
        step.state.simpleText.simpleTextSearchVersion(data.passageId, step.state.passage.version(data.passageId));
    }
});

$(step.search.ui).hear("simpleText-search-state-has-changed", function(s, data) {
    step.search.simpleText.search(data.passageId);
});
