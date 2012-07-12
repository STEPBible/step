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
    textPrimaryExactPhrase : function(value, passageId) { $(".textPrimaryExactPhrase", step.util.getPassageContainer(passageId)).val(value); },
    textPrimaryIncludeWords : function(value, passageId) { $(".textPrimaryIncludeWords", step.util.getPassageContainer(passageId)).val(value); },
    textPrimarySimilarSpellings : function(value, passageId) { $(".textPrimarySimilarSpellings", step.util.getPassageContainer(passageId)).val(value); },
    textPrimaryWordsStarting : function(value, passageId) { $(".textPrimaryWordsStarting", step.util.getPassageContainer(passageId)).val(value); },
    textPrimaryExcludeWords : function(value, passageId) { $(".textPrimaryExcludeWords", step.util.getPassageContainer(passageId)).val(value); },
    textPrimaryExcludePhrase : function(value, passageId) { $(".textPrimaryExcludePhrase", step.util.getPassageContainer(passageId)).val(value); },
    textPrimaryIncludeRangedWords : function(value, passageId) { $(".textPrimaryIncludeRangedWords", step.util.getPassageContainer(passageId)).val(value); },
    textPrimaryWithinXWords : function(value, passageId) { $(".textPrimaryWithinXWords", step.util.getPassageContainer(passageId)).val(value); },
    textCloseByExactPhrase : function(value, passageId) { $(".textCloseByExactPhrase", step.util.getPassageContainer(passageId)).val(value); },
    textCloseByIncludeWords : function(value, passageId) { $(".textCloseByIncludeWords", step.util.getPassageContainer(passageId)).val(value); },
    textCloseBySimilarSpellings : function(value, passageId) { $(".textCloseBySimilarSpellings", step.util.getPassageContainer(passageId)).val(value); },
    textCloseByWordsStarting : function(value, passageId) { $(".textCloseByWordsStarting", step.util.getPassageContainer(passageId)).val(value); },
    textCloseByExcludeWords : function(value, passageId) { $(".textCloseByExcludeWords", step.util.getPassageContainer(passageId)).val(value); },
    textCloseByExcludePhrase : function(value, passageId) { $(".textCloseByExcludePhrase", step.util.getPassageContainer(passageId)).val(value); },
    textCloseByIncludeRangedWords : function(value, passageId) { $(".textCloseByIncludeRangedWords", step.util.getPassageContainer(passageId)).val(value); },
    textCloseByWithinXWords : function(value, passageId) { $(".textCloseByWithinXWords", step.util.getPassageContainer(passageId)).val(value); },
    textVerseProximity : function(value, passageId) { $(".textVerseProximity", step.util.getPassageContainer(passageId)).val(value); },
    textRestriction : function(value, passageId) { $(".textRestriction", step.util.getPassageContainer(passageId)).val(value); },
    textSortByRelevance : function(value, passageId) { $(".textSortByRelevance", step.util.getPassageContainer(passageId)).prop('checked', value); },
    textQuerySyntax : function(value, passageId) { $(".textQuerySyntax", step.util.getPassageContainer(passageId)).val(value); },
    
    
    evaluateQuerySyntax: function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        
        var query = "";
        query += this._evalExactPhrase($(".textPrimaryExactPhrase", passageContainer).val());
        query += this._evalAnyWord($(".textPrimaryIncludeWords", passageContainer).val());
        query += this._evalSpellings($(".textPrimarySimilarSpellings", passageContainer).val());
        query += this._evalStarting($(".textPrimaryWordsStarting", passageContainer).val());
        query += this._evalExcludeWord($(".textPrimaryExcludeWords", passageContainer).val());
        query += this._evalExcludePhrase($(".textPrimaryExcludePhrase", passageContainer).val());
        query += this._evalWordsWithinRangeOfEachOther(
                    $(".textPrimaryIncludeRangedWords", passageContainer).val(), 
                    $(".textPrimaryWithinXWords", passageContainer).val());
        
        var secondaryQuery = "";
        secondaryQuery += this._evalExactPhrase($(".textCloseByExactPhrase", passageContainer).val());
        secondaryQuery += this._evalAnyWord($(".textCloseByIncludeWords", passageContainer).val());
        secondaryQuery += this._evalSpellings($(".textCloseBySimilarSpellings", passageContainer).val());
        secondaryQuery += this._evalStarting($(".textCloseByWordsStarting", passageContainer).val());
        secondaryQuery += this._evalExcludeWord($(".textCloseByExcludeWords", passageContainer).val());
        secondaryQuery += this._evalExcludePhrase($(".textCloseByExcludePhrase", passageContainer).val());
        secondaryQuery += this._evalWordsWithinRangeOfEachOther(
                    $(".textCloseByIncludeRangedWords", passageContainer).val(), 
                    $(".textCloseByWithinXWords", passageContainer).val());
        
        
        query = this._evalProximity($(".textVerseProximity").val(), query, secondaryQuery);
        query = this._evalTextRestriction($(".textRestriction").val(), query);
        
        step.state.textual.textQuerySyntax(passageId, query);
    },
    //TODO think about escaping
    _evalExactPhrase : function(text) {
        if(!step.util.isBlank(text)) {
            return ' "' + text + '"'; 
        }
        return "";
    },
    
    _evalAnyWord : function(text) {
        return " " + text;
    },
    
    _evalSpellings : function(text) {
        if(!step.util.isBlank(text)) {
            return " " + text + '~'; 
        }
        return "";
    },
    
    _evalStarting : function(text) {
        if(!step.util.isBlank(text)) {
            return " " + text + '*'; 
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
            query = "+[" + restriction + "] " + query; 
        }
        return query;
    }
};

$(document).ready(function() {
    $(".textPrimaryExactPhrase").change(function() {  step.state.textual.textPrimaryExactPhrase(step.passage.getPassageId(this), $(this).val()); });
    $(".textPrimaryIncludeWords").change(function() {  step.state.textual.textPrimaryIncludeWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textPrimarySimilarSpellings").change(function() {  step.state.textual.textPrimarySimilarSpellings(step.passage.getPassageId(this), $(this).val()); });
    $(".textPrimaryWordsStarting").change(function() {  step.state.textual.textPrimaryWordsStarting(step.passage.getPassageId(this), $(this).val()); });
    $(".textPrimaryExcludeWords").change(function() {  step.state.textual.textPrimaryExcludeWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textPrimaryExcludePhrase").change(function() {  step.state.textual.textPrimaryExcludePhrase(step.passage.getPassageId(this), $(this).val()); });
    $(".textPrimaryIncludeRangedWords").change(function() {  step.state.textual.textPrimaryIncludeRangedWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textPrimaryWithinXWords").change(function() {  step.state.textual.textPrimaryWithinXWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseByExactPhrase").change(function() {  step.state.textual.textCloseByExactPhrase(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseByIncludeWords").change(function() {  step.state.textual.textCloseByIncludeWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseBySimilarSpellings").change(function() {  step.state.textual.textCloseBySimilarSpellings(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseByWordsStarting").change(function() {  step.state.textual.textCloseByWordsStarting(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseByExcludeWords").change(function() {  step.state.textual.textCloseByExcludeWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseByExcludePhrase").change(function() {  step.state.textual.textCloseByExcludePhrase(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseByIncludeRangedWords").change(function() {  step.state.textual.textCloseByIncludeRangedWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textCloseByWithinXWords").change(function() {  step.state.textual.textCloseByWithinXWords(step.passage.getPassageId(this), $(this).val()); });
    $(".textVerseProximity").change(function() {  step.state.textual.textVerseProximity(step.passage.getPassageId(this), $(this).val()); });
    $(".textRestriction").change(function() {  step.state.textual.textRestriction(step.passage.getPassageId(this), $(this).val()); });
    $(".textSortByRelevance").change(function() {  step.state.textual.textSortByRelevance(step.passage.getPassageId(this), $(this).prop('checked')); });
    $(".textQuerySyntax").change(function() { step.state.textual.textQuerySyntax(step.passage.getPassageId(this), $(this).val()); });

    $(".textClearButton").click(function() {
        var passageId = step.passage.getPassageId(this);
        //need to register state, so don't go straight to the field on the screen
        step.state.textual.textPrimaryExactPhrase(passageId, "");
        step.state.textual.textPrimaryIncludeWords(passageId, "");
        step.state.textual.textPrimarySimilarSpellings(passageId, "");
        step.state.textual.textPrimaryWordsStarting(passageId, "");
        step.state.textual.textPrimaryExcludeWords(passageId, "");
        step.state.textual.textPrimaryExcludePhrase(passageId, "");
        step.state.textual.textPrimaryIncludeRangedWords(passageId, "");
        step.state.textual.textPrimaryWithinXWords(passageId, "");
        step.state.textual.textCloseByExactPhrase(passageId, "");
        step.state.textual.textCloseByIncludeWords(passageId, "");
        step.state.textual.textCloseBySimilarSpellings(passageId, "");
        step.state.textual.textCloseByWordsStarting(passageId, "");
        step.state.textual.textCloseByExcludeWords(passageId, "");
        step.state.textual.textCloseByExcludePhrase(passageId, "");
        step.state.textual.textCloseByIncludeRangedWords(passageId, "");
        step.state.textual.textCloseByWithinXWords(passageId, "");
        step.state.textual.textVerseProximity(passageId, "");
        step.state.textual.textRestriction(passageId, "");
        step.state.textual.textSortByRelevance(passageId, false);
        step.state.textual.textQuerySyntax(passageId, "");
    });
    
    $(".textSearchTable input").keyup(function() {
        //re-evaluate query syntax and store
        step.search.ui.textual.evaluateQuerySyntax(step.passage.getPassageId(this));
    });
    
    $(".textSearchButton").click(function() {
        step.state.activeSearch(step.passage.getPassageId(passageId), 'SEARCH_TEXT', true);
    });
});

$(step.search.ui).hear("textual-search-state-has-changed", function(s, data) {
    step.search.textual.search(data.passageId);
});

