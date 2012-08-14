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
step.state.simpleText = {
    restore : function(passageId) {
        this.simpleTextTypePrimary(passageId, this.simpleTextTypePrimary(passageId));
        this.simpleTextCriteria(passageId, this.simpleTextCriteria(passageId));
        this.simpleTextScope(passageId, this.simpleTextScope(passageId));
        this.simpleTextInclude(passageId, this.simpleTextInclude(passageId));
        this.simpleTextTypeSecondary(passageId, this.simpleTextTypeSecondary(passageId));
        this.simpleTextSecondaryCriteria(passageId, this.simpleTextSecondaryCriteria(passageId));
        this.simpleTextProximity(passageId, this.simpleTextProximity(passageId));
        this.simpleTextSortByRelevance(passageId, this.simpleTextSortByRelevance(passageId));
        
        
        this.restoreDefaults(passageId, false);
//        this._restoreSortByRelevance(passageId);
        step.search.ui.simpleText.evaluateQuerySyntax(passageId);

    },
    
    restoreDefaults : function(passageId, force) {
        this._resetIfEmpty(passageId, force, step.state.simpleText.simpleTextTypePrimary, step.defaults.search.textual.simpleTextTypes[0]);
        this._resetIfEmpty(passageId, force, step.state.simpleText.simpleTextScope, step.defaults.search.textual.availableRanges[0].value);
        this._resetIfEmpty(passageId, force, step.state.simpleText.simpleTextInclude, step.defaults.search.textual.simpleTextIncludes[0]);
        this._resetIfEmpty(passageId, force, step.state.simpleText.simpleTextTypeSecondary, step.defaults.search.textual.simpleTextTypes[0]);
        this._resetIfEmpty(passageId, force, step.state.simpleText.simpleTextProximity, step.defaults.search.textual.simpleTextProximities[0]);
        this._resetIfEmpty(passageId, force, step.state.simpleText.simpleTextSortByRelevance, step.defaults.search.textual.simpleTextSortBy[0]);
    },
    
    _resetIfEmpty : function(passageId, force, evalFunction, defaultValue) {
      if(force == true || force == undefined || evalFunction(passageId) == null || evalFunction(passageId) == "") {
          evalFunction(passageId, defaultValue);
      }
    },
    
//    _restoreSortByRelevance : function(passageId) {
//        var s = this.textSortByRelevance(passageId);
//        if(!step.util.isBlank(s)) {
//            //then we have a value, so just store it
//            this.textSortByRelevance(passageId, s);
//        } else {
//            //use the default value
//            this.textSortByRelevance(passageId, step.defaults.search.textual.sortByRelevance, false);
//        }
//    }, 

    simpleTextTypePrimary : function(passageId, value) { if (value != null) { $(".simpleTextTypePrimary", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextTypePrimary", value, false); },
    simpleTextCriteria : function(passageId, value) { if (value != null) { $(".simpleTextCriteria", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextCriteria", value, false); },
    simpleTextScope : function(passageId, value) { if (value != null) { $(".simpleTextScope", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextScope", value, false); },
    simpleTextInclude : function(passageId, value) { if (value != null) { $(".simpleTextInclude", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextInclude", value, false); },
    simpleTextTypeSecondary : function(passageId, value) { if (value != null) { $(".simpleTextTypeSecondary", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextTypeSecondary", value, false); },
    simpleTextSecondaryCriteria : function(passageId, value) { if (value != null) { $(".simpleTextSecondaryCriteria", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextSecondaryCriteria", value, false); },
    simpleTextProximity : function(passageId, value) { if (value != null) { $(".simpleTextProximity", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextProximity", value, false); },
    simpleTextQuerySyntax : function(passageId, value) { if (value != null) { $(".simpleTextQuerySyntax", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextQuerySyntax", value, false); },
    simpleTextSortByRelevance : function(passageId, value) { if (value != null) { $(".simpleTextSortByRelevance", step.util.getPassageContainer(passageId)).val(value); } return step.state._storeAndRetrieveCookieState(passageId, "simpleTextSortByRelevance", value, false); } 
};
