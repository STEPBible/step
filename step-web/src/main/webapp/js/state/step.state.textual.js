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
step.state.textual = {
    restore : function(passageId) {
        this.textPrimaryExactPhrase(passageId, this.textPrimaryExactPhrase(passageId));
        this.textPrimaryIncludeWords(passageId, this.textPrimaryIncludeWords(passageId));
        this.textPrimaryIncludeAllWords(passageId, this.textPrimaryIncludeAllWords(passageId));
        this.textPrimarySimilarSpellings(passageId, this.textPrimarySimilarSpellings(passageId));
        this.textPrimaryWordsStarting(passageId, this.textPrimaryWordsStarting(passageId));
        this.textPrimaryExcludeWords(passageId, this.textPrimaryExcludeWords(passageId));
        this.textPrimaryExcludePhrase(passageId, this.textPrimaryExcludePhrase(passageId));
        this.textPrimaryIncludeRangedWords(passageId, this.textPrimaryIncludeRangedWords(passageId));
        this.textPrimaryWithinXWords(passageId, this.textPrimaryWithinXWords(passageId));
        this.textCloseByExactPhrase(passageId, this.textCloseByExactPhrase(passageId));
        this.textCloseByIncludeWords(passageId, this.textCloseByIncludeWords(passageId));
        this.textCloseByIncludeAllWords(passageId, this.textCloseByIncludeAllWords(passageId));
        this.textCloseBySimilarSpellings(passageId, this.textCloseBySimilarSpellings(passageId));
        this.textCloseByWordsStarting(passageId, this.textCloseByWordsStarting(passageId));
        this.textCloseByExcludeWords(passageId, this.textCloseByExcludeWords(passageId));
        this.textCloseByExcludePhrase(passageId, this.textCloseByExcludePhrase(passageId));
        this.textCloseByIncludeRangedWords(passageId, this.textCloseByIncludeRangedWords(passageId));
        this.textCloseByWithinXWords(passageId, this.textCloseByWithinXWords(passageId));
        this.textVerseProximity(passageId, this.textVerseProximity(passageId));
        this.textRestriction(passageId, this.textRestriction(passageId));
        this.textRestrictionExclude(passageId, this.textRestrictionExclude(passageId));
        this.textSortByRelevance(passageId, this.textSortByRelevance(passageId));
        this.textQuerySyntax(passageId, this.textQuerySyntax(passageId));
    },

    textPrimaryExactPhrase : function(passageId, value) { if (value != null) { $(".textPrimaryExactPhrase", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryExactPhrase", value, false); },
    textPrimaryIncludeWords : function(passageId, value) { if (value != null) { $(".textPrimaryIncludeWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryIncludeWords", value, false); },
    textPrimaryIncludeAllWords : function(passageId, value) { if (value != null) { $(".textPrimaryIncludeAllWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryIncludeAllWords", value, false); },
    textPrimarySimilarSpellings : function(passageId, value) { if (value != null) { $(".textPrimarySimilarSpellings", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimarySimilarSpellings", value, false); },
    textPrimaryWordsStarting : function(passageId, value) { if (value != null) { $(".textPrimaryWordsStarting", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryWordsStarting", value, false); },
    textPrimaryExcludeWords : function(passageId, value) { if (value != null) { $(".textPrimaryExcludeWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryExcludeWords", value, false); },
    textPrimaryExcludePhrase : function(passageId, value) { if (value != null) { $(".textPrimaryExcludePhrase", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryExcludePhrase", value, false); },
    textPrimaryIncludeRangedWords : function(passageId, value) { if (value != null) { $(".textPrimaryIncludeRangedWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryIncludeRangedWords", value, false); },
    textPrimaryWithinXWords : function(passageId, value) { if (value != null) { $(".textPrimaryWithinXWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textPrimaryWithinXWords", value, false); },
    textCloseByExactPhrase : function(passageId, value) { if (value != null) { $(".textCloseByExactPhrase", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByExactPhrase", value, false); },
    textCloseByIncludeWords : function(passageId, value) { if (value != null) { $(".textCloseByIncludeWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByIncludeWords", value, false); },
    textCloseByIncludeAllWords : function(passageId, value) { if (value != null) { $(".textCloseByIncludeAllWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByIncludeAllWords", value, false); },
    textCloseBySimilarSpellings : function(passageId, value) { if (value != null) { $(".textCloseBySimilarSpellings", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseBySimilarSpellings", value, false); },
    textCloseByWordsStarting : function(passageId, value) { if (value != null) { $(".textCloseByWordsStarting", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByWordsStarting", value, false); },
    textCloseByExcludeWords : function(passageId, value) { if (value != null) { $(".textCloseByExcludeWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByExcludeWords", value, false); },
    textCloseByExcludePhrase : function(passageId, value) { if (value != null) { $(".textCloseByExcludePhrase", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByExcludePhrase", value, false); },
    textCloseByIncludeRangedWords : function(passageId, value) { if (value != null) { $(".textCloseByIncludeRangedWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByIncludeRangedWords", value, false); },
    textCloseByWithinXWords : function(passageId, value) { if (value != null) { $(".textCloseByWithinXWords", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textCloseByWithinXWords", value, false); },
    textVerseProximity : function(passageId, value) { if (value != null) { $(".textVerseProximity", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textVerseProximity", value, false); },
    textRestriction : function(passageId, value) { if (value != null) { $(".textRestriction", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textRestriction", value, false); },
    textRestrictionExclude : function(passageId, value) { if (value != null) { $(".textRestrictionExclude", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textRestrictionExclude", value, false); },
    textSortByRelevance : function(passageId, value) { if (value != null) { $(".textSortByRelevance", step.util.getPassageContainer(passageId)).prop('checked', value == "true" || value == true); } return step.state._storeAndRetrieveCookieState(passageId, "textSortByRelevance", value, false); },
    textQuerySyntax : function(passageId, value) { if (value != null) { $(".textQuerySyntax", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "textQuerySyntax", value, false); }

};
