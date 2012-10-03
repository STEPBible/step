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
DUAL_VIEW_OPTION = "This option is not available in the 'single column view'. Please select 'Two column view' from the options above.";

$(step.menu).hear("MENU-VIEW", function(self, menuTrigger) {
	
	var level = $(menuTrigger.menuItem.element).attr("level");
	var optionName = menuTrigger.menuItem.name;
	
	if(optionName == 'SINGLE_COLUMN_VIEW' || optionName == 'TWO_COLUMN_VIEW') {
	    step.menu.untickMenuItem($(menuTrigger.menuItem.element).parent().parent().find("*").not("[level]"));
	    step.menu.tickMenuItem(menuTrigger.menuItem.element);
	    $.shout("view-change", {viewName : menuTrigger.menuItem.name});	
	} else if(menuTrigger.menuItem.name == "SWAP_BOTH_PASSAGES") {
        var version0 = step.state.passage.version(0);
        var version1 = step.state.passage.version(1);
        var reference0 = step.state.passage.reference(0);
        var reference1 = step.state.passage.reference(1);

        step.state.passage.version(0, version1, false);
        step.state.passage.reference(0, reference1);
        step.state.passage.version(1, version0, false);
        step.state.passage.reference(1, reference0);
    }
	
	
	
});


step.menu.options = {
        enablePassage : function(enabledPassageId) {
            var passageContainer = $(".passageContainer[passage-id=" + enabledPassageId + "]");
            
            $(".passageReference", passageContainer).prop("disabled", false);
            $(".syncOtherPassage", passageContainer)
                .button("enable")
                .button("option", "icons", {primary: "ui-icon-pin-s"})
                .attr("title", "Use this passage for both columns");
        },
        
        disablePassage : function(disablePassageId) {
            var passageContainer = $(".passageContainer[passage-id=" + disablePassageId + "]");
            
            $(".passageReference", passageContainer).prop("disabled", true);
            $(".syncOtherPassage", passageContainer)
                .button("disable")
                .button("option", "icons", {primary: "ui-icon-pin-s"});
            
            
            var otherPassageContainer = $(".passageContainer[passage-id=" + ((disablePassageId +1) %2) + "]");
            $(".syncOtherPassage", otherPassageContainer)
                .button("option", "icons", {primary: "ui-icon-pin-w"})
                .attr("title", "Make passages independent");
        },
        
        _tickSyncMode : function(mode, fire) {
            if(mode == "NO_SYNC") {
                step.state.passage.syncMode(-1, fire);
                step.menu.options.enablePassage(0);
                step.menu.options.enablePassage(1);
            } else if(mode == "SYNC_LEFT") {
                step.state.passage.syncMode(0, fire);
                step.menu.options.enablePassage(0);
                step.menu.options.disablePassage(1);
            } else if(mode == "SYNC_RIGHT") {
                step.state.passage.syncMode(1, fire);
                step.menu.options.enablePassage(1);
                step.menu.options.disablePassage(0);
            }    
        }
};

$(step.menu).hear("MENU-SYNC", function(self, menuTrigger) {
    step.menu.tickOneItemInMenuGroup(menuTrigger);
    step.menu.options._tickSyncMode(menuTrigger.menuItem.name);
});

$(step.menu).hear("initialise-passage-sync", function(s, sync) {
    var syncName;  
    
    if(sync == 0) {
        syncName = "SYNC_LEFT";
    } else if(sync == 1) {
        syncName = "SYNC_RIGHT";
    } else {
        syncName = "NO_SYNC";
    }

    step.menu.tickMenuItem($("a[name='" + syncName+ "']"));
    step.menu.options._tickSyncMode(syncName, false);
});

$(step.menu).hear("view-change-done", function(self, data) {
    var optionsMenu = $("li[menu-name = 'OPTIONS']");
    
    //hide or display menu
    if(step.state.view.getView() == 'SINGLE_COLUMN_VIEW') {
        $("#topMenu li[menu-name='SYNC'] a").addClass("disabled").attr("title", DUAL_VIEW_OPTION);
        $("#topMenu li > a[name='SWAP_BOTH_PASSAGES']").addClass("disabled").attr("title", DUAL_VIEW_OPTION);
    } else {
        $("#topMenu li[menu-name='SYNC'] a").removeClass("disabled").attr("title", "");
        $("#topMenu li > a[name='SWAP_BOTH_PASSAGES']").removeClass("disabled").attr("title", "");
    }
    
    optionsMenu.toggle();
});

