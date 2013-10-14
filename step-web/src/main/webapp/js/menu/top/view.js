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
        if(optionName == 'SINGLE_COLUMN_VIEW') {
            var previousSelection =  MenuModels.at(1).get("selectedSearch");
            MenuModels.at(1).save({ selectedSearch: 'SINGLE_COLUMN', previousSelection : previousSelection });
//            MenuModels.at(1).trigger("change", MenuModels.at(1))
        } else {
            var previousSelection =  MenuModels.at(1).get("selectedSearch") || "SEARCH_PASSAGE";
            if(previousSelection == "SINGLE_COLUMN") {
                previousSelection = "SEARCH_PASSAGE";
            }

            MenuModels.at(1).save({ selectedSearch : previousSelection});
            $.shout("view-change", {viewName : menuTrigger.menuItem.name});
            MenuModels.at(1).trigger("change", MenuModels.at(1))
        }
	} else if(menuTrigger.menuItem.name == "SWAP_BOTH_PASSAGES") {
        var model0 = PassageModels.at(0);
        var model1= PassageModels.at(1);
        var version0 = model0.get("version");
        var version1 = model1.get("version");;
        var reference0 = model0.get("reference");
        var reference1 = model1.get("reference");

        model0.save({ version: version1, reference : reference1});
        model1.save({ version: version0, reference : reference0});
    } else if(menuTrigger.menuItem.name == "DOWNLOAD_WINDOWS") {
        step.menu.options.downloadApp("windows");
    } else if(menuTrigger.menuItem.name == "DOWNLOAD_MAC") {
        step.menu.options.downloadApp("windows");
    } else if(menuTrigger.menuItem.name == "DOWNLOAD_MAC_NO_JAVA") {
        step.menu.options.downloadApp("windows");
    }
});


step.menu.options = {
        enablePassage : function(enabledPassageId) {
            var passageContainer = $(".passageContainer[passage-id=" + enabledPassageId + "]");
            
            $(".passageReference", passageContainer).prop("disabled", false);
            $(".previousChapter, .nextChapter", passageContainer).button("enable");
            $(".syncOtherPassage", passageContainer)
                .button("enable")
                .button("option", "icons", {primary: "ui-icon-pin-s"})
                .attr("title", "Use this passage for both columns");
        },
        
        disablePassage : function(disablePassageId) {
            var passageContainer = $(".passageContainer[passage-id=" + disablePassageId + "]");
            
            $(".passageReference", passageContainer).prop("disabled", true);
            $(".previousChapter, .nextChapter", passageContainer).button("disable");
            $(".syncOtherPassage", passageContainer)
                .button("disable")
                .button("option", "icons", {primary: "ui-icon-pin-s"});
            
            
            var otherPassageContainer = $(".passageContainer[passage-id=" + ((disablePassageId +1) %2) + "]");
            $(".syncOtherPassage", otherPassageContainer)
                .button("option", "icons", {primary: "ui-icon-pin-w"})
                .attr("title", "Make passages independent");
        },
        
        tickSyncMode : function(mode, menuTrigger) {
            if(!menuTrigger) {
                menuTrigger = step.menu.getMenuTrigger(mode, "SYNC");
            }

            step.menu.tickOneItemInMenuGroup(menuTrigger);


            if(mode == "NO_SYNC") {
                PassageModels.at(0).set({ synced : -1 });
                PassageModels.at(1).set({ synced : -1 });
                PassageModels.at(0).save({});
                PassageModels.at(1).save({});
                step.menu.options.enablePassage(0);
                step.menu.options.enablePassage(1);
                stepRouter.firstSync = false;
            } else if(mode == "SYNC_LEFT") {
                step.menu.options.enablePassage(0);
                step.menu.options.disablePassage(1);
                stepRouter.firstSync = true;
                PassageModels.at(1).save({ synced : 0 });
            } else if(mode == "SYNC_RIGHT") {
                step.menu.options.enablePassage(1);
                step.menu.options.disablePassage(0);
                stepRouter.firstSync = true;
                PassageModels.at(0).save({ synced : 1 });
            }
        },
        downloadApp : function(downloadType) {
            step.util.trackAnalytics('download', downloadType);

            //STEP_SERVER_VERSION_TOKEN is defined in the POM file
            var version = "STEP_SERVER_VERSION_TOKEN".replace(/\./g, "_");
            var url = "http://www.stepbible.org/downloads/STEP_" + downloadType + "_" + version;
            if(downloadType == 'windows') {
                url += ".exe";
            } else {
                url += ".dmg";
            }
            
            $("body").append($("<iframe></iframe>").attr("src", url));
        }
    
};

$(step.menu).hear("MENU-SYNC", function(self, menuTrigger) {
    step.menu.options.tickSyncMode(menuTrigger.menuItem.name, menuTrigger);
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
    refreshLayout();
});

