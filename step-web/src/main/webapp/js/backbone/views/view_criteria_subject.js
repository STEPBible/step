/**************************************************************************************************
 * Copyright (c) 2013, Directors of the Tyndale STEP Project                                      *
 * All rights reserved.                                                                           *
 *                                                                                                *
 * Redistribution and use in source and binary forms, with or without                             *
 * modification, are permitted provided that the following conditions                             *
 * are met:                                                                                       *
 *                                                                                                *
 * Redistributions of source code must retain the above copyright                                 *
 * notice, this list of conditions and the following disclaimer.                                  *
 * Redistributions in binary form must reproduce the above copyright                              *
 * notice, this list of conditions and the following disclaimer in                                *
 * the documentation and/or other materials provided with the                                     *
 * distribution.                                                                                  *
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)                        *
 * nor the names of its contributors may be used to endorse or promote                            *
 * products derived from this software without specific prior written                             *
 * permission.                                                                                    *
 *                                                                                                *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                            *
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                              *
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS                              *
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE                                 *
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                           *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,                           *
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                               *
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER                               *
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT                             *
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING                                 *
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF                                 *
 * THE POSSIBILITY OF SUCH DAMAGE.                                                                *
 **************************************************************************************************/

var SubjectCriteria = SearchCriteria.extend({
    events: _.extend(SearchCriteria.prototype.events, {
        "change input[type='text']" : "updateTextStatus",
        "keyup input[type='text']" : "updateTextStatus"
    }),

    initialize: function () {
        SearchCriteria.prototype.initialize.call(this);
        this.viewElementsByName.subjectRelated.biblebooks({ version : 'ESV' });
        this.updateTextStatus();

        var self = this;
        this.detailLevel = this.$el.detailSlider({ changed : function(newValue) {
            self.model.save({ detail : newValue });
            self.updateTextStatus();
        }});
        this.autocomplete();
        this.$el.find(".resetSubjectText,.resetSubjectRelated").button({ icons: { primary: "ui-icon-close" }, text: false});
    },

    autocomplete: function () {
        var self = this;
        $(this.viewElementsByName.subjectText).autocomplete({
            minLength: 3,
            select: function (event, ui) {
                //manually change the text, so that the change() method can fire against the right version
                $(this).val(ui.item.value);
                $(this).change();
                $(this).trigger('keyup');
                self.doSearch();
            },
            source: function (request, response) {
                var that = this;
                $.getPassageSafe({
                    url: SUBJECT_SUGGESTION,
                    args: [encodeURIComponent(step.util.replaceSpecialChars(request.term))],
                    callback: response,
                    passageId: self.model.get("passageId"),
                    level: 'error'
                });
            }
        });

        this.viewElementsByName.subjectText.click(function () {
            $(this).autocomplete("search");
        });
    },

    resetSearch : function() {
        //call the parent first
        SearchCriteria.prototype.resetSearch.call(this);

        //then update the status
        this.updateTextStatus();
    },

    updateTextStatus : function() {
        //we only allow text in one of the two boxes we have, and we always prefer the subjectText
        var hasSubjectText = !step.util.isBlank(this.viewElementsByName.subjectText.val());

        //we disable the other box and update the tip
        //if text is filled, we disable this, otherwise we enable (always)
        var detail = this.model.get("detail");
        this.viewElementsByName.subjectRelated.prop("disabled", hasSubjectText || detail == 0);

        //slightly different here, we only enable if the other one is blank
        //we also allow subject text enabled if the other one is for some reason disabled
        var relatedIsFilled = !step.util.isBlank(this.viewElementsByName.subjectRelated.val());

        var enableSubjecText = hasSubjectText || detail == 0 || !relatedIsFilled;
        this.viewElementsByName.subjectText.prop("disabled", !enableSubjecText);
    }
});
