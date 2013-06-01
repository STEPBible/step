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
step.passage.ui = {
    fontSizes : [{}, {}],

    getFontKey : function(passageContentHolder) {
        return $(passageContentHolder).hasClass("hbFont") ? "hb" : ($(passageContentHolder).hasClass("unicodeFont") ? "unicode" : "default");
    },
    
    changeFontSize : function(source, increment) {
        var elements = $(".passageContentHolder", step.util.getPassageContainer(source));
        var passageId = step.passage.getPassageId(source);
        
        
        var  key = this.getFontKey(elements);
        $.each(elements, function(i, item) {
            var fontSize = parseInt($(this).css("font-size"));
            var newFontSize = fontSize + increment;
            
            //key it to be the default font, unicodeFont or Hebrew font
            step.passage.ui.fontSizes[passageId][key] = newFontSize;
            $(this).css("font-size", newFontSize);
        });
        
        step.passage.doInterlinearVerseNumbers(passageId);
    }
};

$(document).ready(function() {
//    step.state.trackState([
//                           ".extraVersions", ".extraVersionsDisplayOptions"
//                           ], "passage", step.passage.ui.restoreDefaults);


    $(".smallerFonts").button({ text : true }).click(function() {
        step.passage.ui.changeFontSize(this, -1);
    }).find(".ui-button-text").html("<span class='smallerFont'>A</span>");

//    $(".resetVersions").click(function() {
//        $(this).parent().find(".extraVersions").val("").trigger('change');
//    });

    $(".largerFonts").button({ text : true }).click(function() {
        step.passage.ui.changeFontSize(this, 1);
    });

    $(".passageSizeButtons").buttonset();
    $(".passageLookupButtons").buttonset();


});

$(step.passage.ui).hear("versions-initialisation-completed", function() {
//    for(var i = 0; i < step.util.passageContents.length; i++) {
//        step.passage.ui.updateDisplayOptions(i);
//    }
    
    $.each($(".extraVersions"), function(i, item) {

    });
});
