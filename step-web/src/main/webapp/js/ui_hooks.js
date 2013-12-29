/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

/**
 * This file defines a number of hooks that the server code can call. The aim is
 * to redirect the calls quickly to other parts of the UI
 * 
 * The other calls here are for the menu system which are executing in any
 * particular context
 */


// ////////////////////////
// SOME DEFAULTS
// ////////////////////////
var DEFAULT_POPUP_WIDTH = 500;
var DETAIL_LEVELS = [ __s.basic_view, __s.intermediate_view, __s.advanced_view ];

/** a simple toggler for the menu items */
function toggleMenuItem(menuItem) {
    // try and find a menu name
    var menuName = getParentMenuName(menuItem);

    var passageId = step.passage.getPassageId(menuItem);
    if (!passageId) {
        passageId = "";
    }

    $.shout("MENU-" + menuName.name, {
        menu : getParentMenuName(menuItem),
        menuItem : {
            element : menuItem,
            name : menuItem.name
        },
        passageId : passageId
    });
}

function getParentMenuName(menuItem) {
    var menu = $(menuItem).closest("li[menu-name]");
    return {
        element : menu,
        name : menu.attr("menu-name")
    };
}

/**
 * show bubble from relevant passage object
 * 
 * @param element
 * @param passageReference
 * @param passageIdOrElement
 */
function viewPassage(passageIdOrElement, passageReference, element) {
    // only shout preview if the preview bar is not displaying options on it.
    if (!$("#previewBar").is(":visible") || !$("#previewReference").is(":visible")) {
        var passageId = passageIdOrElement;
        if(isNaN(parseInt(passageIdOrElement))) {
            passageId = step.passage.getPassageId(passageIdOrElement);
            element = passageIdOrElement;
        }
        
        $.shout("show-preview-" + passageId, {
            source : element,
            reference : passageReference
        });
    }
}




function makeMasterInterlinear(element, newVersion) {
    PassageModels.at(step.passage.getPassageId(element)).switchMasterInterlinearVersion(newVersion);
}

function forgetProfile(callback) {
    window.localStorage.clear();
    if(callback) {
        callback();
    }

    //set the location
    window.location.href = window.location.href.replace(/#.*/, "");
}

function getRelatedVerses(refs, passageId) {
    if(refs == null || refs.length == 0) {
        return;
    }
    
    var otherPassage = step.util.getOtherPassageId(passageId);
    PassageModels.at(otherPassage).save({ reference: refs });
}

function getRelatedSubjects(key, passageId) {
    var otherPassage = step.util.getOtherPassageId(passageId);
    var link = $("a[name='" + key + "']", step.util.getPassageContent(passageId))[0];
    var relatedSubjects = $.data(link, "relatedSubjects");
    
    //first change the fieldset:
    var subjectModel = SubjectModels.at(otherPassage);
    subjectModel.save({
        subjectText : "",
        subjectSearchType : "",
        subjectRelated : key,
        detail : 2
    });

    subjectModel.trigger("search", subjectModel, {});

    //if we're in single view, then we would want to bring up the second column
    step.state.view.ensureTwoColumnView();
}

function facebookShare(element) {
    window.open('https://www.facebook.com/sharer/sharer.php?s=100&p%5Btitle%5D=STEP&p%5Burl%5D='+
        encodeURIComponent(stepRouter.getShareableColumnUrl(element)) +
        "&p%5Bsummary%5D=" +
        encodeURIComponent($("title").text()+ "...") +
        "&p%5Bimages%5D%5B0%5D=" + encodeURIComponent(Backbone.history.location.origin + "/images/step-logo-100.png") +
        "&status=0",
        'fb-share-dialog', 'width=626,height=436');
    return false;
}
