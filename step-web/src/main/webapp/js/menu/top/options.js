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
$(step.menu).hear("MENU-OPTIONS", function(self, menuTrigger) {
    var isOptionEnabled = step.menu.toggleMenuItem(menuTrigger.menuItem.element);
	if(menuTrigger.menuItem.name == "SHOW_ALL_VERSIONS") {
		$.getSafe(BIBLE_GET_BIBLE_VERSIONS + isOptionEnabled, function(versions) {
			// send events to passages and reload - then change init function
			$.shout("version-list-refresh", versions);
		});		
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


$(step.menu).hear("MENU-SYNC", function(self, menuTrigger) {
    step.menu.tickOneItemInMenuGroup(menuTrigger);
    if(menuTrigger.menuItem.name == "NO_SYNC") {
        step.state.passage.syncMode(-1);
        $(".passageContainer:not([passage-id=0]) .passageReference").prop("disabled", false);
        $(".passageContainer:not([passage-id=1]) .passageReference").prop("disabled", false);
    } else if(menuTrigger.menuItem.name == "SYNC_LEFT") {
        step.state.passage.syncMode(0);
        $(".passageContainer:not([passage-id=0]) .passageReference").prop("disabled", true);
        $(".passageContainer:not([passage-id=1]) .passageReference").prop("disabled", false);
    } else if(menuTrigger.menuItem.name == "SYNC_RIGHT") {
        step.state.passage.syncMode(1);
        $(".passageContainer:not([passage-id=0]) .passageReference").prop("disabled", false);
        $(".passageContainer:not([passage-id=1]) .passageReference").prop("disabled", true);
    }    
});

$(step.menu).hear("initialise-passage-sync", function(s, sync) {
    var menuItem;
    if(sync == 0) {
        //        $.shout("MENU-SYNC", );
        toggleMenuItem($("a[name = 'SYNC_LEFT']").get(0));
        
    } else if(sync == 1) {
        toggleMenuItem($("a[name = 'SYNC_RIGHT']").get(0));
//        menuItem = step.menu.getMenuItem("SYNC_LEFT");        
    } else {
//        menuItem = step.menu.getMenuItem("NO_SYNC");        
        toggleMenuItem($("a[name = 'NO_SYNC']").get(0));
//        menuItem = step.menu.getMenuItem("SYNC_RIGHT");        
    }
    
//    step.menu.tickMenuItem(menuItem);
});
