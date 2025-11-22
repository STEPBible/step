/******************************************************************************/
/* Functionality
   =============

   This class coordinates communication amongst the various iframes which run
   in j_chronologySplit3.html.

   Strictly, the chronology application is simple enough that this class
   isn't really needed -- the search index could communication directly
   with the chronology application.  I have retained it largely because
   I wanted the code for the chronology application to look vaguely
   similar to that for the genealogy application.  And indeed the latter
   made provision for certain additional odds and ends (like resizing)
   which it is probably useful to retain, although I'm not too clear
   whether they are actually going to be used.

   'Jamie' Jamieson   STEPBible   Sep 2025
*/

/******************************************************************************/
'use strict';
import { ClassJFrameworkMultiframeCommunicationsMaster } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsMaster.js';
import { JFrameworkMultiframeLayoutController          } from '/js/J_AppsJs/J_Framework/j_framework.multiframeLayoutController.js';
import { JFrameworkUserSettings                        } from '/js/J_AppsJs/J_Framework/j_framework.userSettings.js';
import { JFrameworkUtils                               } from '/js/J_AppsJs/J_Framework/j_framework.utils.js';



  

/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                               Coordinator                                **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassJChronologySplit3Coordinator extends ClassJFrameworkMultiframeCommunicationsMaster
{
    /**************************************************************************/
    constructor ()
    {
	super();
	const me = this;
	function fn () { me._updateUserSettings(); } // May not be required, in which case remove 'fn' from the next line too.
	JFrameworkUserSettings.init(fn);
    }

    
    /**************************************************************************/
    sendMessageTo (targetFrameId, data, callingFrameId)
    {
	if ('resizeIframe' in data) // Does the obvious.
	{
	    this._processResizeIframe(data, callingFrameId);
	    return;
	}

	if ('key' in data) // Changes the selection in the chronology window.
	{
	    super.sendMessageTo(targetFrameId, data, callingFrameId);
	    JFrameworkMultiframeLayoutController.openDialogTab('chronology');
	    return;
	}

	if ('forceTabVisible' in data && !JFrameworkUtils.isLargeScreen()) // Forces a given logical tab to be visible on a narrow screen where the logical tabs are all displayed on one single physical tab.
	{
	    JFrameworkMultiframeLayoutController.openDialogTab(data.forceTabVisible);
	    return;
	}

	super.sendMessageTo(targetFrameId, data, callingFrameId);
    }


    /**************************************************************************/
    _processResizeIframe (data, callingFrameId)
    {
	if (window.JFrameworkMultiframeLayoutController)
	    window.JFrameworkMultiframeLayoutController.handleExternalResizeRequest(data.resizeIframe, callingFrameId);
    }
}

const _JChronologySplit3Coordinator = new _ClassJChronologySplit3Coordinator();
