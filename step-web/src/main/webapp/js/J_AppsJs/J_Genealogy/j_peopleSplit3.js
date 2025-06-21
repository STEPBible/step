/******************************************************************************/
/* Functionality
   =============

   This class coordinates communication amongst the various iframes which run
   in j_peopleSplit3.html.

   The idea is that rather than have the iframes communicate directly with
   one another, they go via here with a view to weeding out repeated calls
   all of which simply achieve the same thing.

   'Jamie' Jamieson   STEPBible   Jan 2025
*/

/******************************************************************************/
'use strict';
import { ClassJFrameworkMultiframeCommunicationsMaster } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsMaster.js';



  

/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                               Coordinator                                **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassJPeopleSplit3Coordinator extends ClassJFrameworkMultiframeCommunicationsMaster
{
    /**************************************************************************/
    /* The first-time flag below is needed because on initial entry to the
       system, the required person details are passed straight to the genealogy
       iframe, which then sends them back to the people index.  The filtering
       below would recognise that as being a resend of the same person, and
       would filter things out, but for the flag. */
    
    constructor ()
    {
	super();
	this._previousScriptureUrl = '';
	this._previousStrong = '';
	this._firstTime = false;
    }

    
    /**************************************************************************/
    /* Normally if the application running in a frame uses sendMessageTo,
       ClassJFrameworkMultiframeCommunicationsMaster passes it straight to the
       target frame.  Here, we want to intervene so as to be able to
       coordinate things. */
    
    sendMessageTo (targetFrame, data, callingFrameId)
    {
	if ('resizeIframe' in data)
	{
	    this._processResizeIframe(data, callingFrameId);
	    return;
	}

	if ('strong' in data)
	{
	    this._processNewStrong(data, callingFrameId);
	    return;
	}
    }


    /**************************************************************************/
    /* At the time of writing, this is used externally only when the user
       follows a scripture link from the info-box, in which case we are
       looking up a reference which is not directly associated with the
       person currently being displayed (plus internally from the present
       class). */
    
    sendSetUrlForce (targetId, url)
    {
	if (url != this._previousScriptureUrl || this._firstTime)
	{
	    this._previousScriptureUrl= url;
	    super.sendSetUrlForce('scripture', url);
	}
    }

    
    /**************************************************************************/
    _makeScriptureUrl (data)
    {
	var allStrongs = 'allStrongs' in data ? data.allStrongs : data.strong;
	allStrongs = allStrongs.split('|');
	
	const partialUrl = '@strong=' + allStrongs.join('@strong=');

        var join = '';
	if (allStrongs.length > 1)
        {
            var join = '@srchJoin=(';
	    
            for (var i = 1; i <= allStrongs.length; ++i)
                join += i + "o";

            join = join.substring(0, join.length - 1) + ")";
        }

	return window.location.origin + '/?skipwelcome&q=' + join + partialUrl; // + "&options=VHN");
    }


    /**************************************************************************/
    /* This is intended to weed out multiple calls for the same Strong number.
       In particular, I want to avoid some sort of chain whereby the peopleIndex
       selects a person, which information is then passed to the genealogy, and
       that responds by sending a message back to the peopleIndex ... which
       in turn responds by sending a message back to the peopleIndex.

       There is, however, one special case to cater for.  The user can change
       the selection in the genealogy window without changing the root (ie
       they can just change which person is highlighted).  The peopleIndex
       hears about this, and will update accordingly -- and at this point,
       we want the suppression processing to do its stuff.

       However, if the user subsequently clicks on the visible item in the
       peopleIndex, we take that as implying that rather than that person
       just being the _selected_ person they actually want them to become
       the root of the tree.  In that case, therefore, we need to forward
       the message to the genealogy app come what may.

       The this._previousStrong = '' statement below ensures that the
       normal filtering is turned off while handling that message. */
    
    _processNewStrong (data, callingFrameId)
    {
	if ('peopleIndex' == callingFrameId)
	    this._previousStrong = '';
	
	if (data.strong != this._previousStrong || this._firstTime)
	{	
	    const targetFrameId = 'peopleIndex' == callingFrameId ? 'genealogy' : 'peopleIndex';
	    this._previousStrong = data.strong;
	    super.sendMessageTo(targetFrameId, data, callingFrameId);
	}

	
	const url = this._makeScriptureUrl(data);
	this.sendSetUrlForce('scripture', url);

	this._firstTime = false;
    }


    /**************************************************************************/
    _processResizeIframe (data, callingFrameId)
    {
	if (window.JFrameworkMultiframeLayoutController)
	    window.JFrameworkMultiframeLayoutController.handleExternalResizeRequest(data.resizeIframe, callingFrameId);
    }
}

const _JPeopleSplit3Coordinator = new _ClassJPeopleSplit3Coordinator();
