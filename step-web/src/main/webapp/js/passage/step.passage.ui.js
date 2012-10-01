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
$(window).resize(function() {
    step.passage.ui.resize();
});

step.passage.ui = {
    fontSizes : [undefined, undefined],
    resize : function() {
        var windowHeight = $(window).height();
        $(".passageContent").each(function(i, item) {
            $(item).height(windowHeight - $(item).position().top);
        });
    },
    
    restoreDefaults : function(passageId, force) {
        step.util.ui.resetIfEmpty(passageId, force, step.state.passage.extraVersionsDisplayOptions, step.defaults.passage.interOptions[0]);
    },
    
    updateDisplayOptions : function(passageId) {
        if(step.versions == undefined) {
            //don't have it from server yet, so return immediately
            return;
        }
        
        
        var passageContainer = step.util.getPassageContainer(passageId);
        var displayOptions = $(".extraVersionsDisplayOptions", passageContainer);
        
        var comparisonVersions = $(".extraVersions", passageContainer).val().replace(/ +/g, "");

        //check for no versions
        if(comparisonVersions == undefined || comparisonVersions.length == 0) {
            //then we disable the box and return immediately
            displayOptions.prop("disabled", true);
            return;
        } else {
            //otherwise we enable it
            displayOptions.prop("disabled", false);
        }
        
        //if we're looking at an interlinear option, then we need to check all versions support that
        if(comparisonVersions) {
            var versions = comparisonVersions.split(",");
            versions.push(step.state.passage.version(passageId));
            
            for(var i = 0; i < versions.length; i++) {
                //check that each version contains
                var features = this.getSelectedVersion(versions[i]);
                if(features && !features.hasStrongs) {
                    if(step.defaults.passage.interNamedOptions[step.defaults.passage.interOptions.indexOf(displayOptions.val())] == "INTERLINEAR") {
                        displayOptions.val(step.defaults.passage.interOptions[0]);
                        displayOptions.trigger('change');
                    } 
                    
                    //change available options
                    displayOptions.autocomplete("option", "source", step.defaults.passage.interOptionsNoInterlinear);
                    return;
                }
            }
        }
        
        //if we get here, then we need to allow interlinears:
        displayOptions.autocomplete("option", "source", step.defaults.passage.interOptions);
    },
    
    /**
     * Simple forward search
     */
    getSelectedVersion : function(versionName) {
        for(var i = 0; i < step.versions.length; i++) {
            if(versionName == step.versions[i].initials) {
                return step.versions[i];
            }
        }
        
//        console.log("Did not manage to find version ", versionName);
        return undefined;
    }
};

$(document).ready(function() {
    step.state.trackState([
                           ".extraVersions", ".extraVersionsDisplayOptions"
                           ], "passage", step.passage.ui.restoreDefaults);
    
    $(".extraVersionsDisplayOptions").change(function(event) {
        step.passage.changePassage(step.passage.getPassageId(event.target));
    });
    
    
    $(".smallerFonts").button({
            text : true
    }).click(function() {
        var elements = $(".passageContentHolder", step.util.getPassageContainer(this));
        var fontSize = parseInt(elements.css("font-size"));
        var newFontSize = fontSize -1;
        
        step.passage.ui.fontSizes[step.passage.getPassageId(this)] = newFontSize;
        
        elements.css("font-size", newFontSize);
    }).find(".ui-button-text").html("<span class='smallerFont'>A</span>");
    
    $(".largerFonts").button({
                text : true        
        }
    ).click(function() {
        var elements = $(".passageContentHolder", step.util.getPassageContainer(this));
        $.each(elements, function(i, item) {
            var fontSize = parseInt($(this).css("font-size"));
            var newFontSize = fontSize + 1;
            step.passage.ui.fontSizes[step.passage.getPassageId(this)] = newFontSize;
            $(this).css("font-size", newFontSize);
        })
    });
    
    $(".passageSizeButtons").buttonset();
    $(".passageLookupButtons").buttonset();

    step.util.ui.autocompleteSearch(".extraVersionsDisplayOptions", step.defaults.passage.interOptions);
    
});

$(step.passage.ui).hear("versions-initialisation-completed", function() {
    for(var i = 0; i < step.util.passageContents.length; i++) {
        step.passage.ui.updateDisplayOptions(i);
    }
    
    $.each($(".extraVersions"), function(i, item) {
        $(item).versions({
            multi : true
        }).bind('change', function(event) {
              var target = event.target;
              var passageId = step.passage.getPassageId(target);
              
              //reset displayOptions because interlinear might not be available
              step.passage.ui.updateDisplayOptions(passageId);
              
              step.passage.changePassage(passageId);
        });
    });
});
