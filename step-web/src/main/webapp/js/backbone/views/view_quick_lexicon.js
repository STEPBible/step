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

var QuickLexicon = Backbone.View.extend({
    el: function () {
        return $("<span>").position({ my: "right top", at: "right top", of: $(window) }).hide();
    },

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
        this.inProgress = false;
    },

    /**
     * Updates the text and shows it
     * @param strongNumbers
     */
    render: function (event) {
        if(this.inProgress) {
            return;
        }
        
        this.inProgress = true;
        
        var self = this;
        if(this.qtip != undefined) {
            this.qtip.qtip("destroy");
        }

        this.qtip = $(this.model.get("element")).qtip({
            style: { tip: false, classes: "quickLexiconDefinition primaryLightBg" },
            position: { my: "top center", at: "top center", viewport: $(window), target: $("body"), effect: false },
            hide: { event: 'unfocus mouseleave' },
            events : {
                show: function(event, api) {
                    self.showRelatedNumbers($.data(self.qtip, "relatedNumbers"));
                }
            },
            content: {
                text: function (event, api)  {
                    var strong = self.model.get("strongNumber");
                    var morph = self.model.get("morph");

                    $.getSafe(MODULE_GET_QUICK_INFO, [strong, morph], function (data) {
                        var vocabInfo = "";
                        if (data.vocabInfos) {
                            $.each(data.vocabInfos, function (i, item) {
                                $.data(self.qtip, "relatedNumbers", item.rawRelatedNumbers);
                                self.showRelatedNumbers($.data(self.qtip, "relatedNumbers"));

                                var fontClass = strong.length > 0 && strong[0] == 'H' ? "hbFontSmall" : 'unicodeFont';

                                vocabInfo += "<h1>" +
                                    "<span class='" + fontClass + "'>" +
                                    item.accentedUnicode +
                                    "</span> (<span class='stepTransliteration'>" +
                                    item.stepTransliteration +
                                    "): " +
                                    item.stepGloss +
                                    "</h1>" +
                                    "<span>" +
                                    (item.shortDef == undefined ? "" : item.shortDef) +
                                    "</span></p>";
                            });
                        }

                        vocabInfo += "<span class='infoTagLine'>" +
                            __s.more_info_on_click_of_word +
                            "</span>";
                        api.set('content.text', vocabInfo);
                        self.inProgress = false;
                    }, null, null, null, function() {
                        self.inProgress = false;
                    });
                }
            }
        });

        this.qtip.qtip("show");
    },

    /**
     * @param rawRelatedNumbers the related raw numbers
     */
    showRelatedNumbers : function(rawRelatedNumbers) {
        if(rawRelatedNumbers) {
            step.passage.highlightStrong(null, rawRelatedNumbers.replace(/,/ig, ""), "relatedWordEmphasisHover");
        }
    }
});
