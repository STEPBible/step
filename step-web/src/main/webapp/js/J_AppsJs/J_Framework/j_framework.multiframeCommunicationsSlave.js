/******************************************************************************/
/* Sets up a multiframe communications handler -- slave.





   Terminology
   =============================================================================

   This class is intended for use in an application which may possibly run in
   an iframe within a browser tab, and may wish to communciate with applications
   in other iframes in that browser tab.

   In what follows, I will refer to the application we are presently dealing
   with as theApp, to applications in other iframes as otherApps, and to
   the software running in the main browser tab (ie the software responsible
   for laying out and administering the iframes) as the controller.





   Summary of functionality
   =============================================================================

   This class ...

   - Lets theApp send messages to otherApps or to the controller.

   - Lets theApp receive messages from otherApp.

   - Lets theApp find out when it has been activated (see below).

   - Lets theApp save and retrieve data.  This is probably of use mainly when
     theApp's URL is being changed and theApp needs to retain state information
     (state information is normally lost across a reload).


   Activation: The standard library facilities arrange for the controller to
   display data either all at once (on a wide screen) or in a tabbed dialogue
   box (on a narrow screen).

   In tabbed mode, all if the individual iframes exist all the time, but only
   one is visible.  The fact that they all exist means that you can
   communicate with them and update them in the normal manner.  However,
   hidden iframes are treated by the DOM / Javascript as having zero width.
   This turned out to be a particular issue in the genealogy application,
   where I wanted to draw a family tree and have it centred.  I could update
   it without any problem, but 'centring' it on a zero-width window meant
   that it ended up at x = 0, and when displayed it therefore came out at
   the left, rather than in the centre.  I introduced activation notifications
   to address this -- the SVG application was notified when its tab became
   visible, and was able to use that activation to recentre the family tree.

   I'm not sure whether activiation notications are useful for anything else,
   but they're avaialble if you want them.





   Javascript
   =============================================================================

   In each of the iframe apps you need to define your own class which inherits
   from this present one, and then instantiate it:

   import { ClassJFrameworkMultiframeCommunicationsSlave } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsSlave.js';

   class MyClass extends ClassJFrameworkMultiframeCommunicationsSlave
   {
         receiveActivation ()
	 {
	   ...
	 }

	 receiveMessage (data, callingFrameId)
	 {
	   ...
	 }

	 receiveSetUrlRequest (url, callingFrameId)
	 {
	   ...
	 }

	 And any other functionality you require
  }

  const myClassInstance = new MyClass();


  Strictly there is no need actually to assign the instance to anything
  unless you yourself want to be able to refer to it.  In other words,
  strictly the 'const myClassInstance =' above is unnecessary.  The
  mere fact of instantiating the class is enough to sort out all of the
  linkages needed to make it work.

  The three 'receive' methods override ones defined in ClassJFrameworkMultiframeCommunicationsSlave.

  receiveActivation should be set up to handle activiations.  You don't
  need to define it if you don't anticipate handling activations.

  receiveMessage should be set up to parse and handle other incoming
  messages.  Again, there is no need to define it if you won't be
  handling messages.

  receiveSetUrlRequest should be set up to handle a request to change the
  URL displayed in the iframe.  The base method simply goes ahead and
  changes the URL.  Overriding that method gives you the chance to intervene
  to carry out house-keeping etc.


  All of these receive an argument callingFrameId.  Within the context of the
  controller, each iframe is given a unique id, and it is this id which is
  passed.  In some cases, the originator is the controller, in which case
  callingFrameId is null.

  The 'data' argument can be in any form you like, so long as all
  interested parties agree.

  Your inheriting class automatically inherits methods to let it
  send notifications, store and retrieve data, etc.

  One final note.  If theApp happens to be capable of running standalone as
  well as in a multiframe environment, there is no need to write two
  different variants.  Simply write it as though for the multiframe
  environment.  It can continue to attempt to call all of the methods here,
  but they simply won't do anything.





  Internals
  =============================================================================

  On instantiation, window.JFrameworkMultiframeCommunicationsSlave is
  automatically set to point to an instance of your class.



  'Jamie' Jamieson   STEPBible   May 2025
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
export class ClassJFrameworkMultiframeCommunicationsSlave
{
    /**************************************************************************/
    constructor ()
    {
	window.JFrameworkMultiframeCommunicationsSlave = this; // Attach the instance to the window.
	this._myFrameId = JFrameworkUtils.myFrameId();
	if (window !== window.parent && window.parent.JFrameworkMultiframeCommunicationsMaster !== undefined)
	    this._communicationsMaster = window.parent.JFrameworkMultiframeCommunicationsMaster;
    }






    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                             Data storage                             **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _USE_MASTER_FOR_PERSISTENT_STORAGE = true;

    
    /**************************************************************************/
    /* If we're running in an enclosing iframe, arranges to store data in the
       window which holds the iframe.  This gives a way of retaining data
       across a reload.

       To retrieve the data, it calls getSavesData, with the same key. */
    
    /**************************************************************************/
    deleteSavedData (key)
    {
	if (this._USE_MASTER_FOR_PERSISTENT_STORAGE)
	{
	    if (this._communicationsMaster)
		this._communicationsMaster.deleteSavedData(this._myFrameId, key);
	}
	else
	    sessionStorage.removeItem(key);
    }

    
    /**************************************************************************/
    getSavedData (key)
    {
	if (this._USE_MASTER_FOR_PERSISTENT_STORAGE)
	{
	    if (this._communicationsMaster)
		return this._communicationsMaster.getSavedData(this._myFrameId, key);
	    else
		return null;
	}
	else
	    return JSON.parse(sessionStorage.getItem(key));
    }


    /**************************************************************************/
    saveData (key, data)
    {
	if (this._USE_MASTER_FOR_PERSISTENT_STORAGE)
	{
	    if (this._communicationsMaster)
		this._communicationsMaster.saveData(this._myFrameId, key, data);
	}
	else
	    sessionStorage.setItem(key, JSON.stringify(data));    
    }





    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**               Inter-frame communications -- Receive                  **/
    /**                  You probably will override these                    **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* For use mainly in a tabbed environment, where a tab needs to know it
       has been activated (for example, because it can't draw stuff until it's
       active). */
    
    receiveActivation ()
    {
    }

    
    /**************************************************************************/
    receiveMessage (data, sourceFrameId)
    {
    }

    
    /**************************************************************************/
    receiveSetUrlRequest (url, sourceFrameId)
    {
	window.location.replace(url);	
    }







    
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                  Inter-frame communications -- Send                  **/
    /**                  You probably won't override these                   **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* Broadcasts a message to potentially more than one target.  For more
       details, see sendMessageTo. */

    broadcastMessageTo (targetFrameIdRegex, data)
    {
	if (this._communicationsMaster)
	    this._communicationsMaster.broadcastMessageTo(targetFrameIdRegex, data, this._myFrameId);
    }

    
    /**************************************************************************/
    /* Sends a message from this iframe to another.

       There is no harm in calling this method even in a non-multiframe
       environment (or in a multiframe environment where the target iframe is
       not set up to accept messages).  In those cases it does nothing.

       The method returns true if the message was successfully transferred.
       There is, however, no easy way of determining whether the target has
       successfully made use of it.

       IMPORTANT: This relies upon the target frame having had time to
       establish the message receiver, which may well not have happened
       the first time you call this method.  You need to take steps to
       ensure this is not an issue.

       If the targetFrameId is given as null, the message will be sent to
       the frame layout controller. */
    
    sendMessageTo (targetFrameId, data)
    {
	if (this._communicationsMaster)
	    return this._communicationsMaster.sendMessageTo(targetFrameId, data, this._myFrameId);
	else
	    return false;
    }


    /**************************************************************************/
    /* Calls upon the controller to change the URL in one of the frames.  The
       target is identified by the id of the frame which is to be altered.
       This can be called even when not operating in a multiframe environment
       or if the target frame does not exist.  In those cases it does nothing.

      This call forces the target to change its URL -- it does not let it
      intervene to do house-keeping etc. */
    
    sendSetUrlForce (targetId, url)
    {
	if (this._communicationsMaster)
	    this._communicationsMaster.sendSetUrlForce(targetId, url);
    }


    /**************************************************************************/
    /* This arranges to send a request to a target frame asking it to change
       the URL it is displaying.  Handling things this way gives the
       application running in the iframe to do a certain amount of house-
       keeping before making the change. */
    
    sendSetUrlRequest (targetId, url)
    {
	if (this._communicationsMaster)
	    this._communicationsMaster.sendSetUrlRequest(targetId, url);
    }
}

