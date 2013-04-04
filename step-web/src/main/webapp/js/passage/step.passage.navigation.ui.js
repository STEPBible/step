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
$(document).ready(function() {
    $(".previousChapter").button({
        icons : {
            primary : "ui-icon-arrowreturnthick-1-w"
        },
        text : false
    }).click(function(e) {
        e.preventDefault();
        step.passage.navigation.chapter.previous(step.passage.getPassageId(this));
    });

    $(".nextChapter").button({
        icons : {
            primary : "ui-icon-arrowreturnthick-1-w"
        },
        text : false
    }).click(function(e) {
        e.preventDefault();
        step.passage.navigation.chapter.next(step.passage.getPassageId(this));
    });

    $(".continuousPassage").button({
        icons : {
            primary : "ui-icon-script"
        },
        text : false
    }).click(function() {
        var enabled = "";
        
        var icon = $(this).button("option", "icons").primary;
        
        if(icon == "ui-icon-script") {
            enabled = true;
            $(this).button("option", "icons", {primary: "ui-icon-document-b"});
            $(this).attr("title", __s.passage_no_continuous_scroll);
        } else {
            enabled = false;
            $(this).button("option", "icons", {primary: "ui-icon-script"});
            $(this).attr("title", __s.passage_continuous_scroll);
        }
        
        step.passage.navigation.handleContinuousScrolling(step.passage.getPassageId(this), enabled);
    }).hear("passage-changed", function(button, data) {
        if (step.state.passage.multiRange(step.passage.getPassageId(this))) {
            // disable button
            $(button).attr("disabled", "disabled");
            $(button).continuousPassage.attr("title", __s.error_continuous_scroll_on_multiple_refs);
        } else {
            $(button).removeAttr("disabled");
            $(button).attr("title", __s.passage_continuous_scroll);
        }
    });
    
    $(".syncOtherPassage").button({
        icons : {
            primary : "ui-icon-pin-s",

        },
        text : false
    }).click(function() {
        var icon = $(this).button("option", "icons").primary;
    
        if(icon == "ui-icon-pin-s") {
            enabled = true;
            if(step.passage.getPassageId(this) == 0) {
                toggleMenuItem($("a[name = 'SYNC_LEFT']").get(0));
            } else {
                toggleMenuItem($("a[name = 'SYNC_RIGHT']").get(0));
            }
        } else {
            toggleMenuItem($("a[name = 'NO_SYNC']").get(0));
        }
    });
});
