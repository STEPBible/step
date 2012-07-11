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
step.state.timeline = {
    restore : function(passageId) {
        this.reference(passageId, this.reference(passageId));
        this.description(passageId, this.description(passageId));
        this.timelineDate(passageId, this.timelineDate(passageId));
        this.timelineYears(passageId, this.timelineYears(passageId));
    },

    reference : function(passageId, value) {
        if (value) {
            $(".timelineReference", step.util.getPassageContainer(passageId)).val(value);
        }

        return step.state._storeAndRetrieveCookieState(passageId, "timelineReference", value, false);
    },
    description : function(passageId, value) {
        if (value) {
            $(".timelineEventDescription", step.util.getPassageContainer(passageId)).val(value);
        }

        return step.state._storeAndRetrieveCookieState(passageId, "timelineEventDescription", value, false);
    },
    timelineDate : function(passageId, value) {
        if (value) {
            $(".timelineDate", step.util.getPassageContainer(passageId)).val(value);
        }

        return step.state._storeAndRetrieveCookieState(passageId, "timelineDate", value, false);
    },
    timelineYears : function(passageId, value) {
        if (value) {
            $(".timelineYears", step.util.getPassageContainer(passageId)).val(value);
        }

        return step.state._storeAndRetrieveCookieState(passageId, "timelineYears", value, false);
    },

    searchType : function(passageId, searchType) {
        return step.state._storeAndRetrieveCookieState(passageId, "timelineSearchType", searchType);
    }
};
