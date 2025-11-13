/******************************************************************************/
/* Standard ways of accessing stuff from our major data repositories --
   genealogy, maps, etc. */
/******************************************************************************/

/******************************************************************************/
'use strict';


/******************************************************************************/
import { JFrameworkPlacesData      } from '/js/J_AppsJs/J_Framework/j_framework.placesData.js';
import { JFrameworkSharedConstants } from '/js/J_AppsJs/J_Framework/j_framework.sharedConstants.js';
import { JFrameworkUtils           } from '/js/J_AppsJs/J_Framework/j_framework.utils.js';


/******************************************************************************/
export class JFrameworkStepDataAccessors
{
    /**************************************************************************/
    /* Opens a tab containing the Split3 genealogy data.

       tagOrStrong may be either a suitable tag, as defined below, or else
       a Strong number.

       If it is a tag, it must have an attribute data-strong giving the
       Strongs value to be looked up.

       The genealogy window is opened in a tab as indicated by targetTab.

       NOTE THE CONTRAST WITH strongLinkToMap.  In the present method, we
       already have the data (in the form of a tag which includes the
       Strong value) which we need to open up the target.  In strongLinkToMap
       we do not. */
    
    static strongLinkToGenealogy (tagOrStrong, targetTab = '_blank')
    {
	const strong = "string" === typeof(tagOrStrong) ? tagOrString : tagOrStrong.getAttribute('data-strong');
	const url = JFrameworkUtils.getFullUrl(JFrameworkSharedConstants.getValue('genealogySplit3') + '?strong=' + strong)
	JFrameworkStepDataAccessors._openTab(url, targetTab);
    }


    /**************************************************************************/
    /* Opens a tag containing map information.

       'tag' must have an attribute data-strong giving the Strongs value to be
       looked up, and the text content of the tag must be the name of the place.

       (Note the contrast with strongLinkToGenealogy.  There the argument may
       be either a Strong number or an appropriate tag.  Here it _has_ to be a
       tag, because I need to extract _two_ pieces of information from it.)

       The genealogy window is opened in a tab as indicated by targetTab. */
    
    static strongLinkToMap (tag, targetTab = '_blank')
    {
	/*********************************************************************/
	const strong = tag.getAttribute('data-strong');
	const name = tag.textContent;



	/*********************************************************************/
	/* async because getFieldGivenStrongs has to download and parse data
	   the first time it's called.  No need to wait for completion here
	   before returning. */

	(async () => {
	    var coords = await JFrameworkPlacesData.instance().getFieldGivenStrongs(strong, 'palopenmapsUrl');
	    coords = coords.split('@')[1];

	    var book   = await JFrameworkPlacesData.instance().getFieldGivenStrongs(strong, 'referenceFromUnifiedName');
	    book = book.split('.')[0];
	    book = JFrameworkUtils.convertUsxAbbreviationToOsisAbbreviation(book);

	    if ('0' !== coords)
	    {
		const url = JFrameworkUtils.getFullUrl(JFrameworkSharedConstants.getValue('multimap') + `?coord=${coords}&strong=${strong}&gloss=${name}&book=${book}`);
		JFrameworkStepDataAccessors._openTab(url, targetTab);
	    }
	})();
    }


    /**************************************************************************/
    /* 'noopener,noreferrer' doesn't seem to work here -- the tab isn't
       opened. */
    
    static _openTab (url, targetTab)
    {
	window.open(url, targetTab);
    }
}
