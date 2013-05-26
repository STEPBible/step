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

//    restoreIncludeExclude : function(passageId) {
//        var passageContainer = step.util.getPassageContainer(passageId);
//        var include = $(".simpleTextInclude", passageContainer);
//        step.search.ui.simpleText.includeProximityChange(include, include.val());
//    },
    

};

$(document).ready(function() {
//    var namespace = "simpleText";
//    step.state.trackState([
//                           ".simpleTextTypePrimary",
//                           ".simpleTextCriteria",
//                           ".simpleTextScope",
//                           ".simpleTextInclude",
//                           ".simpleTextTypeSecondary",
//                           ".simpleTextSecondaryCriteria",
//                           ".simpleTextProximity",
////                           ".simpleTextSortByRelevance",
//                           ".simpleTextQuerySyntax",
//                           ".simpleTextSearchContext",
//                           ".simpleTextSearchVersion",
//                           ".simpleTextPageNumber"
//                           ], namespace, [step.search.ui.simpleText.restoreDefaults, step.search.ui.simpleText.restoreIncludeExclude]);

//    step.util.ui.trackQuerySyntax(".simpleTextFieldsTable", namespace);
//    $(".simpleTextClear").click(function() {
//        //  reset texts
//        var passageId = step.passage.getPassageId(this);
//        step.state.simpleText.simpleTextCriteria(passageId, "");
//        step.state.simpleText.simpleTextSecondaryCriteria(passageId, "");
//
//        //then reset dropdowns
//        step.search.ui.simpleText.restoreDefaults(passageId, true);
//        step.state.simpleText.simpleTextQuerySyntax(passageId, "");
//    });

//      step.util.ui.searchButton(".simpleTextSearchButton",  'SEARCH_SIMPLE_TEXT');

//      step.util.ui.autocompleteSearch(".simpleTextType", step.defaults.search.textual.simpleTextTypes, true);
//      step.util.ui.autocompleteSearch(".simpleTextSecondaryTypes", step.defaults.search.textual.simpleTextSecondaryTypes, true);
//      step.util.ui.autocompleteSearch(".simpleTextScope", step.defaults.search.textual.availableRanges);
//      step.util.ui.autocompleteSearch(".simpleTextProximity", step.defaults.search.textual.simpleTextProximities, true);
////      step.util.ui.autocompleteSearch(".simpleTextSortByRelevance", step.defaults.search.textual.simpleTextSortBy, true);
//      step.util.ui.autocompleteSearch(".simpleTextInclude", step.defaults.search.textual.simpleTextIncludes, true, function(currentElement, value) {
//          step.search.ui.simpleText.includeProximityChange(currentElement, value);
//      });
//
//      //also add a qtip
//      $(".simpleTextScope").qtip({
//          show :  { event: 'focus' },
//          hide : { event: 'blur' },
//          position: {
//              at: "right center",
//              my: "left center",
//              viewport: $(window)
//          },
//          style : {
//              classes : "primaryLightBg primaryLightBorder"
//          }
//      });
});

//$(step.search.ui).hear("SEARCH_SIMPLE_TEXT-activated", function(s, data) {
//    //check version on toolbar
//    var version = step.state.simpleText.simpleTextSearchVersion(data.passageId);
//    if(step.util.isBlank(version)) {
//        step.state.simpleText.simpleTextSearchVersion(data.passageId, step.state.passage.version(data.passageId));
//    }
//});
//
//$(step.search.ui).hear("simpleText-search-state-has-changed", function(s, data) {
//    step.search.simpleText.search(data.passageId);
//});
//
//$(step.search.ui).hear("slideView-SEARCH_SIMPLE_TEXT", function(s, data) {
//    step.search.ui.simpleText.evaluateQuerySyntax(data.passageId);
//});
