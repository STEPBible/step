/******************************************************************************/
/* Sets up a multiframe communications handler -- master.





   Terminology
   =============================================================================

   This class is intended for use in an application which controls a number of
   separate iframes.  I refer to this application here as the controller.  The
   other applications I refer to as iframeApps.





   Summary of functionality
   =============================================================================

   In essence, this class acts as a communications coordinator, permitting the
   various iframeApps to communicate with one another and with the coordinator.

   To make use of the functionality here, the iframeApps must themselves
   instantiate ClassJFrameworkMultiframeCommunicationsSlave (or a class
   derived from it), this providing the functionality needed to handle
   communications in the iframeApp.





   Javascript
   =============================================================================

   The controller will have its own HTML file which describes the iframes.
   You can set that file up any way you like, although you might like to look
   at J_Genealogy/j_peopleSplit3.html as an example which incorporates other
   potentially useful functionality.

   In that file (or in Javascript invoked from it), you need to instantiate
   either ClassJFrameworkMultiframeCommunicationsMaster or a class which
   inherits from it.

   Instantiate ClassJFrameworkMultiframeCommunicationsMaster itself if you
   _don't_ need the iframeApps to be able to send messages to the controller
   itself.  (They will still be able to communicate amongst themselves, and
   the controller will still be able to talk to them; the only thing lacking
   is the ability for the iframeApps to talk back to the controller.)

   In this case, you would want just:

     import { ClassJFrameworkMultiframeCommunicationsMaster } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsMaster.js';
     new ClassJFrameworkMultiframeCommunicationsMaster();


   If you _do_ need the iframeApps to talk to the controller itself, then
   you need to _inherit_ from ClassJFrameworkMultiframeCommunicationsMaster,
   and override receiveMessage with code to handle incoming messages:

     import { ClassJFrameworkMultiframeCommunicationsMaster } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsMaster.js';
     class MyClass extends ClassJFrameworkMultiframeCommunicationsMaster
     {
       receiveMessage (data, sourceFrameId)
       {
         ...
       }

       Any other functionality
     }

     new MyClass();

   Note that in neither case do you have to assign the class instance to
   anything -- the constructor here will automatically set things up so
   that all functionality works.   If you do need to be able to access
   the instance directly, however, do feel free to assign the instance to
   a variable,





  API
  =============================================================================

  On instantiation, window.JFrameworkMultiframeCommunicationsMaster is
  automatically set to point to an instance of your class.

  On startup, the class automatically sends a PARENT_URL message to all
  iframeApps which are set up to handle it (and ignores those which are not).

  - availableFrameIds gives back a list of the ids for all iframes.

  - sendMessageTo sends a message to a given frame.

  - broadcastMessageTo sends a message to a collection of frames.

  - sendActivation informs an iframe that it has been activated.

  - sendSetUrlForce forcibly sets the URL in a given iframe.  It does this
    immediately, without giving the iframeApp a chance to tidy up,

  - sendSetUrlRequest requests the iframeApp to change its URL, but gives
    it the opportunity to tidy up first.

  - deleteSavedData / getSavedData / saveData: When the URL being displayed
    in an iframe changes, any state information is lost.  These functions
    let an iframeApp ask the present class to save state information on its
    behalf, with a view to retrieving that data later.

  - receiveMessage needs to be overridden here if iframeApps need to talk
    back to the controller (as opposed to just talking amongst themselves).


  Note that most of the methods above are normally invoked from
  ClassJFrameworkMultiframeCommunicationsSlave in the iframeApp, although
  there is nothing to stop them from being invokved direct from the
  processing here if appropriate.

  Note also that in general failures are handled silently -- if you attempt
  to send a message to a non-existent iframeApp, or if you send a message
  which an iframeApp is not set up to handle, the error is simply ignored.
  This is deliberate -- I want applications to be able to run standalone as
  well as in the context of an iframe controller, and therefore don't want
  to make assumptions about what message handling they support.







  Change history
  =============================================================================

  2025-09-24 Pass URL parameters to all iframes on startup.



  'Jamie' Jamieson   STEPBible   Sep 2025
*/





/******************************************************************************/
'use strict';
import { JFrameworkUtils } from '/js/J_AppsJs/J_Framework/j_framework.utils.js';


/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                     Master communications controller                     **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
export class ClassJFrameworkMultiframeCommunicationsMaster
{
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                           Initialisation                             **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    constructor ()
    {
	window.JFrameworkMultiframeCommunicationsMaster = this; // Attach the instance to the window.
	this._dataStoreForIframes = new Map();
	const iframes = Array.from(document.querySelectorAll('iframe'))
	this._frameIds = iframes
	    .map(iframe => iframe.id)
	    .filter(id => id); // Remove empty or missing ids.

	const me = this;
	this._waitForIframesToLoad(iframes, me._onIframesLoaded);
    }


    /**************************************************************************/
    /* Pass any parameters from the URL used to invoke the parent to each
       iframe which may be interested in them.

       THIS MAY NOT BE TERRIBLY USEFUL: THE SLAVE APPS CAN ONLY PROCESS THE
       MESSAGE IF THEY ARE READY TO DO SO, AND CHANCES ARE THAT WITHOUT A
       FAIR BIT OF FIDDLY WORK, THEY WON'T BE. */

    _onIframesLoaded (owningClass)
    {
	const params = new URLSearchParams(window.location.search);
	owningClass.availableFrameIds().forEach(iframeId => {
	    try
	    {
		owningClass.sendMessageTo(iframeId, { msgType: 'PARENT_URL', data: params }, 'PARENT');
	    }
	    catch(_)
	    {
	    }
	});
    }

    
    /**************************************************************************/
    _waitForIframesToLoad (iframes, onIframesLoaded)
    {
	var loadedCount = 0;
	const me = this;

	iframes.forEach(iframe => {
	    iframe.addEventListener("load", () => {
		loadedCount++;
		if (loadedCount === iframes.length)
		    onIframesLoaded(me);
	    });
	});
    }


    
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                         Basic functionality                          **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* Returns a list of the names assigned to all of the available frames. */
    
    availableFrameIds ()
    {
	return this._frameIds;
    }


    
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                             Data storage                             **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* If a window is reloaded, state information is lost.  This is sometimes
       inconvenient.  In an iframe environment, it is possible to do slightly
       better than this, because the controller window can be set up here to
       store data on behalf of the iframes it contains.

       To use this feature, all that is required is for the iframeApp to call
       its saveData method, passing a key by which it wishes to identify the
       data and whatever data it wishes to store (which can be of any form).

       To retrieve the data, it calls getSavesData, with the same key.

       Note that according to ChatGPT, there is an alternative which may
       mean that applications can store data locally without having to have
       recourse to these facilities.  You call something like:

         sessionStorage.setItem('appState', JSON.stringify({ page: 'dashboard', filters: [1, 2] }));

      to save the data, and 

        const state = JSON.parse(sessionStorage.getItem('appState'));

      to retrieve it.  This may be a better bet, but I'd need to check it
      works. */
    
    /**************************************************************************/
    deleteSavedData (sourceFrameId, key)
    {
	const innerMap = this._dataStoreForIframes.get(sourceFrameId);
	if (innerMap && innerMap.has(key))
            innerMap.delete(key);
    }

    
    /**************************************************************************/
    getSavedData (sourceFrameId, key)
    {
	const innerMap = this._dataStoreForIframes.get(sourceFrameId);
	return innerMap?.get(key) ?? null;
    }


    /**************************************************************************/
    saveData (sourceFrameId, key, data)
    {
	var innerMap = this._dataStoreForIframes.get(sourceFrameId);

	if (!innerMap)
	{
            innerMap = new Map();
            this._dataStoreForIframes.set(sourceFrameId, innerMap);
	}

	innerMap.set(key, data);
    }





    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                     Inter-frame communications                       **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* OVERRIDE ME * OVERRIDE ME * OVERRIDE ME * OVERRIDE ME * OVERRIDE ME

       This method is called when we receive a message from a frame which is
       intended to reach the master.  You will need to override this if you
       want to do anything with it. */
    
    receiveMessage (data, sourceFrameId)
    {
    }

    
    /**************************************************************************/
    /* Broadcasts a message to potentially more than one target.  For more
       details, see sendMessageTo. */

    broadcastMessageTo (targetFrameIdRegex, data, sourceFrameId)
    {
	this._frameIds.filter(id => targetFrameIdRegex.test(id)).forEach(id => { // 08-Nov-2025: Corrected typo.
	    this.sendMessageTo(id, data, sourceFrameId);
	});
    }

    
    /**************************************************************************/
    /* Used to inform the content of an iframe that the iframe has just been
       activated. */
    
    sendActivation (targetFrameId)
    {
	try
	{
	    const receiver = this._getTarget(targetFrameId);
	    if (receiver)
	    {
		receiver.receiveActivation();
		return true;
	    }

	    return false;
	}
	catch (e)
	{
            e;
	}
    }

    
    /**************************************************************************/
    /* Sends a message from one iframe to another.

       The source and target here are both identified by their frame ids.

       There is no harm in calling this method even in a non-multiframe
       environment (or in a multiframe environment where the target iframe is
       not set up to accept messages).  In those cases it does nothing.

       The method returns true if the message was successfully transferred.
       There is, however, no easy way of determining whether the target has
       successfully made use of it.

       The processing here can be used even if not operating in a multiframe
       environment -- in that case, the function does nothing (and returns
       false).

       IMPORTANT: This relies upon the target frame having had time to
       establish the message receiver, which may well not have happened
       the first time you call this method.  You need to take steps to
       ensure this is not an issue.

       If targetFrameId is null, the message is passed to the layout controller,
       if there is one. */
    
    sendMessageTo (targetFrameId, data, sourceFrameId)
    {
	try
	{
	    const receiver = this._getTarget(targetFrameId);
	    if (receiver)
	    {
		receiver.receiveMessage(data, sourceFrameId);
		return true;
	    }

	    return false;
	}
	catch (e)
	{
            e;
	    return false;
	}
    }


    
    /**************************************************************************/
    /* Forces the given frame to display the given URL.  The target is
       identified by the id of the frame which is to be altered.  This can be
       called even when not operating in a multiframe environment or if the
       target frame does not exist.  In those cases it does nothing. */
    
    sendSetUrlForce (targetId, url)
    {
	const targetFrame = document.getElementById(targetId);
	if (!targetFrame)
	    return;

	targetFrame.src = url;
        this._suppressStepHeaderIfNecessary(targetFrame);
    }


    /**************************************************************************/
    /* This arranges to send a request to a target frame asking it to change
       the URL it is displaying.  Handling things this way gives the
       application running in the iframe the chance to do a certain amount of
       house-keeping before making the change. */
    
    sendSetUrlRequest (targetId, url)
    {
	try
	{
	    const targetFrame = document.getElementById(targetFrameId);
	    if (!targetFrame)
		return false;

	    const receiver = targetFrame.contentWindow.JFrameworkMultiframeCommunicationsSlave;
	    if (!receiver)
		return false;
	    
	    receiver.receiveSetUrlRequest(url, sourceFrameId);
	    return true;
	}
	catch (e)
	{
        e;
	    return false;
	}
    }


    /**************************************************************************/
    _getTarget (targetFrameId)
    {
	if (null == targetFrameId) // Destination is master.
	{
	    return this;
/*	    const receiver = window.JFrameworkMultiframeLayoutController;
	    if (!receiver)
		return null;

	    return receiver; */
	}


	const targetFrame = document.getElementById(targetFrameId);
	if (!targetFrame)
	    return null;

	const receiver = targetFrame.contentWindow.JFrameworkMultiframeCommunicationsSlave;
	if (!receiver)
	    return null;

	return receiver;
    }

    
    /**************************************************************************/
    /* And now for the nasty bit.  If we have an iframe which is showing
       a standard STEPBible scripture pane, then by default it has a
       navigation bar at the top which shows things like the Resources
       button.  This takes up screen real estate which, particularly on
       small screens, may be at somewhat of a premium.  Plus selecting any
       of these buttons when you are already looking at three different
       panes is going to be confusing.  I therefore offer the option of
       having the header suppressed.  Implementing this is complicated,
       though ...

       There is an <a> tag in the standard STEPBible pane -- #resizeButton --
       which lets the user decide whether the navigation bar should be
       present or not.  By simulating a click on this, therefore, I can
       force the bar to be suppressed.  Except it's not _quite_ that
       simple, because it's a toggle, so you want to make sure you
       simulate only a _single_ press.  To do that, I look at the 'title'
       attribute of the tag.  This starts with 'Increase' if presssing
       the button will increase the space devoted to the scripures (ie
       will suppress the header), and so I need to click the button only
       if it does indeed say 'Increase ...'

       Of course, all of this is totally horrendous, and relies utterly
       on the STEPBible window continuing to work as at present. */
    
    _suppressStepHeaderIfNecessary (frame)
    {
	const suppressStepHeader = frame.getAttribute('suppressStepHeader');
	if (null == suppressStepHeader || suppressStepHeader.toLowerCase() != 'yes')
	    return;
	
	const that = this; // For debug.
	
	frame.addEventListener('load', function () {
	    const doc = this.contentWindow.document;
	    if (doc && !doc.getElementById('step-suppress-header-sidebar-offset'))
	    {
		const style = doc.createElement('style');
		style.id = 'step-suppress-header-sidebar-offset';
		style.appendChild(doc.createTextNode('.row-offcanvas .sidebar-offcanvas { top: 0 !important; }'));
		const head = doc.head || doc.getElementsByTagName('head')[0];
		if (head)
		    head.appendChild(style);
	    }

	    const resizeButton = doc.getElementById('resizeButton');
	    const navBar = doc.getElementById('stepnavbar');

	    if (navBar)
		navBar.innerHTML = '<h2>Scriptures</h2>';

	    if (resizeButton)
	    {
		const doClick = resizeButton.getAttribute('title').split(' ')[0].toLowerCase() == 'increase'
		if (doClick)
		{
		    resizeButton.click();
		}
	    }
	});
    }
}
