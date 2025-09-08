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
	const me = this;
	this._previousScriptureUrl = '';
	this._previousAllStrongs = '';
	this._firstTime = false;
	this._setUpToHandleUserSettingsInScriptureWindow(); // May not be required.
	function fn () { me._updateUserSettings(); } // May not be required, in which case remove 'fn' from the next line too.
	JFrameworkUserSettings.init(fn);
    }

    
    /**************************************************************************/
    /* Normally if the application running in a frame uses sendMessageTo,
       ClassJFrameworkMultiframeCommunicationsMaster passes it straight to the
       target frame.  Here, we want to intervene so as to be able to
       coordinate things. */
    
    sendMessageTo (targetFrame, data, callingFrameId)
    {
	if ('resizeIframe' in data) // Does the obvious.
	{
	    this._processResizeIframe(data, callingFrameId);
	    return;
	}

	if ('newPerson' in data) // Changes the content of windows after a revised selection.
	{
	    this._processNewPerson(data, callingFrameId);
	    return;
	}

	if ('forceTabVisible' in data && !JFrameworkUtils.isLargeScreen()) // Forces a given logical tab to be visible on a narrow screen where the logical tabs are all displayed on one single physical tab.
	{
	    JFrameworkMultiframeLayoutController.openDialogTab(data.forceTabVisible);
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
    /* This is slightly awkward.  Originally I was simply passing Strongs
       numbers.  This works, in so far as it selects the correct verses, but
       it highlights the target name(s) only if the Bible text has Strongs
       tags.  Adding names details as well seems to sort out the highlighting.
       However, one issue will remain -- that the names available to me from
       the genealogy data use ESV spellings, and there is no guarantee that
       these will work with the selected Bible text.  I don't think this is
       necessarily a _huge_ problem: I think you'll still see the correct
       verses; it simply means that even with our best efforts, there is no
       guarantee that the names will be highlighted.

       The results here will be something like the following (which is for
       Saul / Paul in the NT):

         http://localhost:8989/?skipwelcome&q=version=ESV@srchJoin=(1o2o3o4)@strong=G3972G@strong=G4549G@strong=G4569G@strong=G4569H@text=Saul@text=Paul&options=VHN&noredirect

       Note that the name(s) of the selectedperson are always correctly
       highlighted in the scripture window if using a tagged Bible like ESV.
       With a non-tagged Bible like NIV there is a limit to how many verses
       contain correct tagging.  If too many verses are involved, highlighting
       occurs in the later verses only sporadically.
    */
    
    _makeScriptureUrl (personRec)
    {
	/**********************************************************************/
	function makeCommonPortion (elts, fieldName, n)
	{
	    const fields = fieldName + elts.join(fieldName);
	    const srchJoin = 1 == elts.length ? n.toString() : Array.from({ length: elts.length }, (_, i) => n + i).join('o');
	    return { srchJoin: srchJoin, fields: fields, n: elts.length };
	}



	/**********************************************************************/
	function makeStrongsPortion (elts, fieldName, n)
	{
	    return makeCommonPortion(elts, fieldName, n);
	}

	

	/**********************************************************************/
	function makeNamesPortion (elts, fieldName, n)
	{
	    const fields = fieldName + elts.join(fieldName);
	    return { srchJoin: '', fields: fields, n: 0 };
	}

	

	/**********************************************************************/
	/* We're guaranteed to have at least one Strongs and at least one name,
	   so we always need srchJoin.  The Strongs portion and the name
	   portion need to be joined by 'a', implying that we want the
	   Strong's criteria to be satisfied AND the names criteria.  Within
	   each section, we need multiple elements to be joined by 'o',
	   implying that we are content for any of the elements to be
	   satisfied. */
	
	const strongsBit = makeStrongsPortion(personRec.allDStrongs, '@strong=', 1);
	const namesBit   = makeNamesPortion  (personRec.allNames,    '@text=',   strongsBit.n + 1);
        // var join = '@srchJoin=(_strongs_a_names_)';
        var join = '@srchJoin=(_strongs_)';
	join = join.replace('_strongs_', strongsBit.srchJoin);
	join = join.replace('_names_', namesBit.srchJoin);

	const res = window.location.origin + '/?skipwelcome&q=' + join + strongsBit.fields + namesBit.fields + '&options=VHN&noredirect';
	// console.log(res);
	return res;
    }


    /**************************************************************************/
    /* This is intended to weed out multiple calls for the same Strong number.
       In particular, I want to avoid some sort of chain whereby the peopleIndex
       selects a person, which information is then passed to the genealogy, and
       that responds by sending a message back to the peopleIndex informing it
       of the change, and this then sets about informing things all over again.

       The normal situation of interest arises where the user changes the
       _selected_ person in the genealogy window without changing the root (ie
       theyjust change which person is highlighted).  The peopleIndex hears about
       this, and will update accordingly -- and at this point, we want the
       suppression processing to do its stuff.

       However, if the user subsequently clicks on the visible item in the
       peopleIndex, we take that as implying that rather than that person
       just being the _selected_ person they actually want them to become
       the root of the tree.  In that case, therefore, we need to forward
       the message to the genealogy app come what may.

       The this._previousAllStrongs = '' statement below ensures that the
       normal filtering is turned off while handling that message.

       Note A: Originally this was set up so as to keep absolutely
       everything mutually in step.  In particular, that meant that if
       a new person was selected in the genealogy window, I endeavoured to
       change the content of the search window.

       This was fiddly, and I believe is now going, in fact, to be confusing,
       since the requirements have recently changed, such that I'm required
       to retain the most recent search string, and default any new search
       to use that (the rationale being that perhaps you were searching for
       a name which is shared by a number of different people, and want to
       be able to step through them).

       Remove the 'if' statement marked Note A below if you want to
       reinstate the full synchronisation -- although if you do that, you
       may have to do a little debugging, since I'm not sure it was fully
       working.

       'data' should be a record of the form { newPerson: rec, reason: '...' }
       where rec is a person record containing at least the following fields:

       - allDStrongs: A list of all Strongs references for this person.

       - allNames = names: A list of all 'base' names for the person (ie Aaron,
         rather than Aaron@...).

       - masterDStrongs: The master Strongs number for the person.

       - disambiguatedName: The disambiguated name for the person.
    */

    _processNewPerson (data, callingFrameId)
    {
	if ('peopleIndex' == callingFrameId)
	    this._previousAllStrongs = '';

	const personRec = data.newPerson;
	const collapsedStrongs = personRec.allDStrongs.join('|');
	
	if (collapsedStrongs !== this._previousAllStrongs || this._firstTime)
	{
	    const targetFrameId = 'peopleIndex' == callingFrameId ? 'genealogy' : 'peopleIndex';
	    this._previousAllStrongs = collapsedStrongs;
	    super.sendMessageTo(targetFrameId, data, callingFrameId);
	}
	
	const url = this._makeScriptureUrl(personRec);
	this.sendSetUrlForce('scripture', url);

	this._firstTime = false;
    }


    /**************************************************************************/
    _processResizeIframe (data, callingFrameId)
    {
	if (window.JFrameworkMultiframeLayoutController)
	    window.JFrameworkMultiframeLayoutController.handleExternalResizeRequest(data.resizeIframe, callingFrameId);
    }





    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                  Interaction with scripture window                   **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* I'm not sure whether we're going to need this eventually or not ...

       If the user uses the Font menu to change the display settings (eg to
       choose dark mode), by default the genealogy scripture window doesn't
       pick up those new settings.

       I have no idea why this should be the case, because in the Gospel
       Harmony window (as an example), the settings are _respected_ (although
       admittedly so far as I can see only to the extent that they are taken
       into account when first entering that portion of the system; so long as
       it remains visible, any further changes are ignored).

       Getting around this is a little fiddly.

       _updateUserSettings below applies the user settings to the scripture
       window.  It is called whenever those settings change.

       However, of itself this is not quite enough, because without further
       steps, it may run before the scripture window has actually been
       rendered, in which case it has no effect; and we also need to ensure it
       is re-run every time the content of the scripture window changes
       (I _think_).

       This is handled by _setUpToHandleUserSettingsInScriptureWindow.

       It may be that at some point we can find a way of running the scripture
       window such that it behaves 'properly', in which case the two methods
       below can go, and references to them in init can also go.  Until then,
       we're stuck with the code as it is. */
    
    /**************************************************************************/
    _setUpToHandleUserSettingsInScriptureWindow ()
    {
	const me = this;
	const iframe = document.getElementById('scripture');

	iframe.addEventListener('load', () => {
	    // apply variables once iframe finishes loading
	    me._updateUserSettings();
	});

	// If the iframe is already loaded (cached content), force run now:
	if (iframe.contentDocument?.readyState === 'complete') {
	    me._updateUserSettings();
	}
    }

    
    /**************************************************************************/
    _updateUserSettings ()
    {
	const iframe = document.getElementById('scripture');

	const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
	if (!iframeDoc) return;
	JFrameworkUserSettings.applySettings(iframeDoc.documentElement, JFrameworkUserSettings.getSettings());
    }
}

const _JPeopleSplit3Coordinator = new _ClassJPeopleSplit3Coordinator();
