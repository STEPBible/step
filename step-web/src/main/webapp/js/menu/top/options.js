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
	} else if(menuTrigger.menuItem.name == "SYNC_BOTH_PASSAGES") {
		step.state.passage.syncMode(isOptionEnabled);
		$(".passageContainer:not([passage-id=0]) .passageReference").prop("disabled", isOptionEnabled);
	}
});


$(step.menu).hear("initialise-passage-sync", function(s, sync) {
	if(sync) {
		step.menu.tickMenuItem(step.menu.getMenuItem("SYNC_BOTH_PASSAGES"));
		$(".passageContainer:not([passage-id=0]) .passageReference").prop("disabled", true);
	}
});
