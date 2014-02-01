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
//hear the resize to resize our passage content
step.fonts = {
    fontSizes: [
        {},
        {}
    ],

    fontButtons: function (context, triggerChange) {
        $(".smallerFonts", context).button({ text: true }).click(function () {
            step.fonts.changeFontSize(this, -1, triggerChange);
        }).find(".ui-button-text").html("<span class='smallerFont'>A</span>");

        $(".largerFonts", context).button({ text: true }).click(function () {
            step.fonts.changeFontSize(this, 1, triggerChange);
        });
    },

    getFontKey: function (passageContentHolder) {
        return $(passageContentHolder).hasClass("hbFont") ? "hb" : ($(passageContentHolder).hasClass("unicodeFont") ? "unicode" : "default");
    },

    /**
     * Reinstate previous text sizes
     * @param passageId
     * @param passageContent
     * @private
     */
    redoTextSize: function (passageId, passageContent) {
        //we're only going to be cater for one font size initially, so pick the major version one.
        var fontKey = this.getFontKey(passageContent);
        var fontSizes = this.fontSizes[passageId];
        var fontSize;
        if (fontSizes != undefined) {
            fontSize = fontSizes[fontKey];
        }

        if (fontSize != undefined) {
            passageContent.css("font-size", fontSize);
        }
    },

    
};
