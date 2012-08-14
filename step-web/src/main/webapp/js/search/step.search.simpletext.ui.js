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
        simpleTextTypePrimary : function(value, passageId) { $(".simpleTextTypePrimary", step.util.getPassageContainer(passageId)).val(value); },
        simpleTextCriteria : function(value, passageId) { $(".simpleTextCriteria", step.util.getPassageContainer(passageId)).val(value); },
        simpleTextScope : function(value, passageId) { $(".simpleTextScope", step.util.getPassageContainer(passageId)).val(value); },
        simpleTextInclude : function(value, passageId) { $(".simpleTextInclude", step.util.getPassageContainer(passageId)).val(value); },
        simpleTextTypeSecondary : function(value, passageId) { $(".simpleTextTypeSecondary", step.util.getPassageContainer(passageId)).val(value); },
        simpleTextSecondaryCriteria : function(value, passageId) { $(".simpleTextSecondaryCriteria", step.util.getPassageContainer(passageId)).val(value); },
        simpleTextProximity : function(value, passageId) { $(".simpleTextProximity", step.util.getPassageContainer(passageId)).val(value); },
        simpleTextSortByRelevance : function(value, passageId) { $(".simpleTextSortByRelevance", step.util.getPassageContainer(passageId)).val(value); },
        
        
//    textQuerySyntax : function(value, passageId) { $(".textQuerySyntax", step.util.getPassageContainer(passageId)).val(value); },
    
    
    evaluateQuerySyntax: function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        
        var query = "";
        
        var primaryType = $(".simpleTextTypePrimary", passageContainer).val();
        var primaryCriteria = $(".simpleTextCriteria", passageContainer).val();
        var secondaryType = $(".simpleTextTypeSecondary", passageContainer).val();
        var secondaryCriteria = $(".simpleTextSecondaryCriteria", passageContainer).val();
        var proximity = $(".simpleTextProximity", passageContainer).val();

        
        //if no primary criteria, exit here
        if(step.util.isBlank(primaryCriteria)) {
            step.state.simpleText.simpleTextQuerySyntax(passageId, query);
            return;
        }
        
        //add the restriction
        var restriction = step.state.simpleText.simpleTextScope(passageId);
        query += step.search.ui.textual._evalTextRestriction(restriction, query);

        //eval first part of the criteria
        query = this._evalCriteria(primaryType, primaryCriteria, query);

        if(secondaryCriteria == null || $.trim(secondaryCriteria) == "") {
            step.state.simpleText.simpleTextQuerySyntax(passageId, query);
            return;
        }
        
        var firstSpace = proximity.indexOf(' ');
        var proximityRange = proximity.substring(0, firstSpace);
        
        query += "~" + proximityRange + " ";
        query = this._evalCriteria(secondaryType, secondaryCriteria, query);
        
        step.state.simpleText.simpleTextQuerySyntax(passageId, query);
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
    }
};

$(document).ready(function() {
    $(".simpleTextTypePrimary").change(function() {  step.state.simpleText.simpleTextTypePrimary(step.passage.getPassageId(this), $(this).val()); });
    $(".simpleTextCriteria").change(function() {  step.state.simpleText.simpleTextCriteria(step.passage.getPassageId(this), $(this).val()); });
    $(".simpleTextScope").change(function() {  step.state.simpleText.simpleTextScope(step.passage.getPassageId(this), $(this).val()); });
    $(".simpleTextInclude").change(function() {  step.state.simpleText.simpleTextInclude(step.passage.getPassageId(this), $(this).val()); });
    $(".simpleTextTypeSecondary").change(function() {  step.state.simpleText.simpleTextTypeSecondary(step.passage.getPassageId(this), $(this).val()); });
    $(".simpleTextSecondaryCriteria").change(function() {  step.state.simpleText.simpleTextSecondaryCriteria(step.passage.getPassageId(this), $(this).val()); });
    $(".simpleTextProximity").change(function() {  step.state.simpleText.simpleTextProximity(step.passage.getPassageId(this), $(this).val()); });
    $(".simpleTextSortByRelevance").change(function() {  step.state.simpleText.simpleTextSortByRelevance(step.passage.getPassageId(this), $(this).val()); });
    
    $(".simpleTextFields input").keyup(function() {
        var passageContent = step.util.getPassageContent(passageId);
        var passageId = step.passage.getPassageId(this);
        //re-evaluate query syntax and store
        step.search.ui.simpleText.evaluateQuerySyntax(passageId);
        passageContent.empty();
    });
    
    $(".simpleTextClear").click(function() {
        //  reset texts
        var passageId = step.passage.getPassageId(this);
        step.state.simpleText.simpleTextCriteria(passageId, "");
        step.state.simpleText.simpleTextSecondaryCriteria(passageId, "");
        
        //then reset dropdowns
        step.state.simpleText.restoreDefaults(passageId, true);
        step.state.simpleText.simpleTextQuerySyntax(passageId, "");
    });

//    var passageContent = step.util.getPassageContent(passageId);
    
      $(".simpleTextType").autocomplete({
          minLength: 0,
          delay : 0,
          source: step.defaults.search.textual.simpleTextTypes,
          select: function(event, ui) {
              $(this).val(ui.item.value);
              $(this).change();
              $(this).trigger('keyup');
      }})
      .click(function() {
          $(this).autocomplete("search", "");
      });
      
      $(".simpleTextScope").autocomplete({
          minLength: 0,
          delay : 0,
          source: step.defaults.search.textual.availableRanges,
          select: function(event, ui) {
              $(this).val(ui.item.value);
              $(this).change();
              $(this).trigger('keyup');
      }})
      .click(function() {
          $(this).autocomplete("search", "");
      });
      
      $(".simpleTextInclude").autocomplete({
          minLength: 0,
          delay : 0,
          source: step.defaults.search.textual.simpleTextIncludes,
          select: function(event, ui) {
              $(this).val(ui.item.value);
              $(this).change();
              $(this).trigger('keyup');
      }})
      .click(function() {
          $(this).autocomplete("search", "");
      });

      $(".simpleTextProximity").autocomplete({
          minLength: 0,
          delay : 0,
          source: step.defaults.search.textual.simpleTextProximities,
          select: function(event, ui) {
              $(this).val(ui.item.value);
              $(this).change();
              $(this).trigger('keyup');
      }})
      .click(function() {
          $(this).autocomplete("search", "");
      });

      $(".simpleTextSortByRelevance").autocomplete({
          minLength: 0,
          delay : 0,
          source: step.defaults.search.textual.simpleTextSortBy,
          select: function(event, ui) {
              $(this).val(ui.item.value);
              $(this).change();
              $(this).trigger('keyup');
          }})
          .click(function() {
              $(this).autocomplete("search", "");
          });
      
      
    $(".simpleTextSearchButton").click(function() {
        step.state.activeSearch(step.passage.getPassageId(this), 'SEARCH_SIMPLE_TEXT', true);
    });
    
    
});

$(step.search.ui).hear("simpleText-search-state-has-changed", function(s, data) {
    step.search.simpleText.search(data.passageId);
});
