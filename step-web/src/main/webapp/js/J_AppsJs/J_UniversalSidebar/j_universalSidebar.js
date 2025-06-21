/******************************************************************************/
/* Handles the universal sidebar.

   The main class here is ClassJUniversalSidebar.  This handles basic
   activities like data management and also does some of the simpler display
   actions itself.  It relies upon a separate class to handle the chronology
   display, because that is more complicated.

   More importantly, it also delegates to classes which inherit from
   _ClassJUniversalSidebarInterface the job of interfacing to the outside
   world.

   These classes have two remits.  They inform ClassJUniversalSidebar of
   the book and chapter for which it should be displaying informaton; and
   they handle requests from ClassJUniversalSidebar to display 'external'
   information (such as our own genealogy page, or external web pages).

   At present, only a pull interface has been written, but it should be
   possible to create a push interface as an alternative should that ever
   become appropriate.

   More details of the interfaces appear below.
*/

/******************************************************************************/
'use strict';
import { JFrameworkUtils }                              from '/js/J_AppsJs/J_Framework/j_framework.utils.js';
import { ClassJFrameworkMultiframeCommunicationsSlave } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsSlave.js'





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Base interface                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class _ClassInterface extends ClassJFrameworkMultiframeCommunicationsSlave
{
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Pull interface                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/*
  Implementation note
  ===================

  This interface assumes that we are running in a multiframe environment which
  is being controlled by something (henceforth the 'controller') based upon my
  j_framework.multiframeCommunicationsMaster.js software, with which I can
  therefore communicate.

  It assumes also that the scripture details are being presented within an
  iframe whose details it can request from the controller.

  It does two things.

  The simpler to describe is that it forwards to the controller requests
  to display 'external' web pages like our own genealogy page, or pages
  owned by third parties.  The reason that it forwards them is that if
  actioned locally, they would appear within the iframe in which the
  sidebar is running, which is of very limited extent.  Passing them to the
  contoller lets them be displayed in the overall window, which would
  normally be appreciably larger.

  The other responsibility of the present class is to keep track of what
  is being displayed in the scripture window, so that the sidebar can be
  updated appropriately.

  Ideally this would be handled by a push interface, with the scripture
  window informing interested parties of any change.  However at present
  we don't have that luxury, so things have to be handled by a pull
  interface -- the present class arranges to poll the controller at
  regular intervals to see if things have changed.

  There is a further complication here, in that having obtained that
  information, we also need to extract from it details of the book and
  chapter being displayed.

  The code here becomes particularly unpleasant -- and possibly
  particularly unreliable.

  I had hope to extract the relevant details from the URL, but here there
  are two problems.  First, I am not sure whether I have seen samples of
  all the different formats of URL, so would not have been certain I was
  able to cope with them all.  And second, the URLs seem to be pretty
  tolerant of the format used for references -- Mt, Mat, Matt and Matthew
  all seem to be ok, for instance -- and I didn't want to have to write
  code to accept all of them.  (I presume there may be library code
  somewhere which handles all of this, but I have yet to find it.)

  I therefore resorted to parsing the HTML code, since that does seem to
  have embedded in it the chapter reference in a standard form.  This, too,
  is not ideal, though.  Once again I'm not sure whether I have seen and
  addressed all possible formats; and this does mean that the code here
  is critically reliant upon the format of the HTML never changing.
*/

/******************************************************************************/
class _ClassInterfacePull extends _ClassInterface
{
    /**************************************************************************/
    onload ()
    {
	const me = this;
	this._lastUrl = null;

	function f ()
	{
	    me._requestDetailsOfScriptureContent(me);
	}
	
	setInterval(f, 500);
    }


    /**************************************************************************/
    /* Asks the controller to open a tab containing one of our genealogy
       pages. */
    
    openGenealogy (personName, strong)
    {
	this.sendMessageTo(null, { fn: 'openGenealogy', url: JFrameworkUtils.makeGenealogyUrlBasedOnStrong(strong) });
    }

    
    /**************************************************************************/
    /* Asks the controller to open a tab containing one of our genealogy
       pages. */
    
    openMap (placeName, strong, coords, book)
    {
	this.sendMessageTo(null, { fn: 'openMap', url: JFrameworkUtils.makeMapUrl(coords, strong, placeName, book) });
    }

    
    /**************************************************************************/
    /* Asks the controller to open a tab containing a photo-related page from
       OpenBible. */
    
    openPicture (urlPortion)
    {
	this.sendMessageTo(null, { fn: 'openPicture', url: JFrameworkUtils.makeOpenBiblePhotoDetailUrl(urlPortion) });
    }

    
    /**************************************************************************/
    /* This is set up to attempt to avoid confusion if incoming messages are
       received while we're still in the process of handling a previous one.

       I don't have a problem dropping intermediate messages while processing,
       but when processing is complete, I do need to check and confirm that
       the most recent has been processed.

       I am not confident in the code below because I'm sure I can see
       potential race conditions, but ChatGPT assures me that the threading
       model used in Javascipt obviates such a possibility.  Mind you, if
       that's correct, then I'm not at all sure I need go to the lengths
       below. */
    
    receiveMessage (data, sourceFrame)
    {
	/**********************************************************************/
	const me = this;


	
	/**********************************************************************/
	function doIt (data, sourceFrame)
	{
	    me._busy = true;
	    try
	    {
		async function f ()
		{
		    await me._processMessage(data, sourceFrame);
		}

		f();
	    }
	    finally
	    {
		if (me._pendingMessage)
		{
		    const pendingMessage = me._pendingMessage;
		    me._pendingMessage = null;
		    doIt(pendingMessage[0], pendingMessage[1]);
		}
		me._busy = false;
	    }
	}


	
	/**********************************************************************/
	if (me._busy)
	    me._pendingMessage = [data, sourceFrame];
	else
	    doIt(data, sourceFrame);
    }


    /**************************************************************************/
    _handleDetailsOfScriptureContent (data)
    {
	if (data.url == this._lastUrl)
	    return;

	JUniversalSidebar.newScriptureReference(data.url, data.document);

	this._lastUrl = data.url;
    }
    
	
    /**************************************************************************/
    _processMessage (data, sourceFrame)
    {
	switch (data.fn)
	{
	    case 'scriptureContent':
	    {
		this._handleDetailsOfScriptureContent(data);
		break;
	    }
	}
    }


    /**************************************************************************/
    /* This is called every 500 ms to see if the content of the scripture window
       has changed.  It would be better if I didn't have to do this, but I
       can't improve on it unless I can change the code for the scripture
       window, and I have no control over that. */
    
    _requestDetailsOfScriptureContent (me)
    {
	me.sendMessageTo(null, { fn: 'checkScriptureUrl' });
    }
}






/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Push interface                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class _ClassInterfacePush extends _ClassInterface
{
    // TBD if required.
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                   Extract book and chapter information                   **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ReferenceParser {}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                   Extract book and chapter information                   **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This variant extracts book and chapter information from the text of a web
   page.  It has the advantage that it seems to be in standard form (in
   particular, uniformly using the full English name of the book).  On the
   other hand, it has the disadvantage a) that it makes me entirely dependent
   upon the format of the HTML not changing; and b) that I'm not sure I have
   yet encountered all relevant formats. */

class _ClassReferenceParserBasedOnHtml extends _ReferenceParser
{
    /**************************************************************************/
    scriptureReference (url, document)
    {
	/**********************************************************************/
	var container = document.querySelector('h2.xgen'); // Standalone verse.
	if (!container)
	    container = document.querySelector("a.verseLink"); // Verse as part of interlinear.



	/**********************************************************************/
	var ref = null;

	if (container)
	{
	    for (const node of container.childNodes)
	    {
		if (node.nodeType === Node.TEXT_NODE)
		{
		    ref = node.textContent.replace('\u200F', '').trim(); // Remove right-to-left mark.
		    break;
		}
            }
	}
	    
	

	/**********************************************************************/
	var book = null;
	var chapter = null;
	
	if (null !== ref)
	{
	    const match = ref.match(/^(\w+)\s+(\d+)/);
	    if (match)
	    {
		book = JFrameworkUtils.convertFullNameToUsxAbbreviation(match[1]);
		if (null != book) chapter = match[2];
	    }
	}
	


	/**********************************************************************/
	return [book, chapter];
    }
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                            The main business                             **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassJUniversalSidebar
{
    /**************************************************************************/
    onload ()
    {
	this._referenceParser = new _ClassReferenceParserBasedOnHtml();
	this._chronologyHandler = new _ClassChronologyHandler();

	const url = new URL(window.location.href);
	const params = new URLSearchParams(url.search);
	if (params.has('haveController'))
	    this._interface = new _ClassInterfacePull();
	else
	    this._interface = new _ClassInterfacePush();

	this._interface.onload();
    }


    /**************************************************************************/
    onresize ()
    {
	// $$$ force redraw?  Or what?
    }

    
    /**************************************************************************/
    /* Called when we have a new book / chapter to which we need to respond. */

    newScriptureReference (url, document)
    {
	/**********************************************************************/
	const [book, chapter] = this._referenceParser.scriptureReference(url, document);
	
	const me = this;
	if (!me._dataAvailable)
	    me._readData().then(() => { me._dataAvailable = true; me._createContent(book, chapter) });
	else
	    me._createContent(book, chapter);
    }


    /**************************************************************************/
    toggleSection (toggle, forceVisible = false)
    {
	const header = toggle.parentElement;
	const contentHolder = header.parentElement.querySelector('div');
	if ('none' == contentHolder.style.display || forceVisible)
	{
	    header.querySelector('.sectionToggle').innerHTML = '&#x25B2;';
	    contentHolder.style.display = 'block';
	    toggle.title = 'Hide';
	}
	else
	{
	    header.querySelector('.sectionToggle').innerHTML = '&#x25BC;';
	    contentHolder.style.display = 'none';
	    toggle.title = 'Show';
	}
    }
    
    
    /**************************************************************************/
    /* Reads the JSON file containing the per-chapter data. */
  
    _acquireData (file, callback)
    {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
		callback(rawFile.responseText);
            }
	}
	rawFile.send(null);
    }


    /**************************************************************************/
    _createContent (book, chapter)
    {
	/**********************************************************************/
	if (!JUniversalSidebar._ref)
	{
	    JUniversalSidebar._ref                    = document.getElementById('ref');
	    JUniversalSidebar._date                   = document.getElementById('date');
	    JUniversalSidebar._whatContentHolder      = document.getElementById('whatContent');
	    JUniversalSidebar._whenContentHolder      = document.getElementById('whenContent');
	    JUniversalSidebar._whereContentHolder     = document.getElementById('whereContent');
	    JUniversalSidebar._whereMapsContentHolder = document.getElementById('whereContentMaps');
	    JUniversalSidebar._wherePicsContentHolder = document.getElementById('whereContentPics');
	    JUniversalSidebar._wherePicsContainer     = document.getElementById('wherePicsContainer');
	    JUniversalSidebar._whoContentHolder       = document.getElementById('whoContent');
	    JUniversalSidebar._noData                 = document.getElementById('noData');
	    JUniversalSidebar._haveData               = document.getElementById('haveData');
	}


	
	/**********************************************************************/
	const fullRef = book + "." + chapter;
	const chapterDetails = JUniversalSidebar._chapterData[fullRef];
	JUniversalSidebar._ref.textContent = "(" + book + " " + chapter + ")";



	/**********************************************************************/
	if (!chapterDetails)
	{
	    JUniversalSidebar._noData  .style.display = 'block';
	    JUniversalSidebar._haveData.style.display = 'none';
	    return;
	}
	


	/**********************************************************************/
	var numericDate;
	var dateForDisplay;
	var numericDate = Number(chapterDetails.chapterDateAm);
	if (numericDate >= 0)
	{
	    dateForDisplay = numericDate + ' AM';
	    numericDate = JFrameworkUtils.amDateToBcDate(numericDate);
	}
	else
	{
	    numericDate = Number(chapterDetails.chapterDate);
	    if (numericDate < 0)
		dateForDisplay = (-numericDate) + ' BC'
	    else
		dateForDisplay = numericDate + ' AM';
	}
	    
	JUniversalSidebar._date                  .innerHTML = dateForDisplay;
	JUniversalSidebar._whatContentHolder     .innerHTML = JUniversalSidebar._createWhatContent     (fullRef, chapterDetails);
	JUniversalSidebar._whereMapsContentHolder.innerHTML = JUniversalSidebar._createWhereMapsContent(fullRef, chapterDetails);
	JUniversalSidebar._wherePicsContentHolder.innerHTML = JUniversalSidebar._createWherePicsContent(fullRef, chapterDetails);
	JUniversalSidebar._whoContentHolder      .innerHTML = JUniversalSidebar._createWhoContent      (fullRef, chapterDetails);
	this._createWhenContent(numericDate);


	
	/**********************************************************************/
	JUniversalSidebar._noData  .style.display = 'none';
	JUniversalSidebar._haveData.style.display = 'block';
    }

    
    /**************************************************************************/
    _createWhatContent (fullRef, chapterDetails)
    {
	return 'Content TBD Content TBD Content TBD Content TBD Content TBD Content TBD Content TBD Content TBD Content TBD Content TBD Content TBD';
    }

    
    /**************************************************************************/
    _createWhenContent (date)
    {
	this._chronologyHandler.newChronology(date);	
    }

    
    /**************************************************************************/
    _createWhereMapsContent (fullRef, chapterDetails)
    {
	const book = fullRef.split('.')[0];
	const places = chapterDetails.places;
	if (0 == places.length)
	    return '&mdash;';

	return places.map(place => `<a href='#' onclick='JUniversalSidebar._interface.openMap("${place.name}", "${place.strong}", "${place.coords}", "${book}")'>${place.name}</a>`).join(', ');
    }

    
    /**************************************************************************/
    _createWherePicsContent (fullRef, chapterDetails)
    {
	const places = chapterDetails.places;
	const filtered = places.filter(item => 'openBibleUrlPortion' in item && item.openBibleUrlPortion);

	JUniversalSidebar._wherePicsContainer.style.display = filtered.length > 0 ? 'block' : 'none';

	return filtered.map(place => `<a href='#' onclick='JUniversalSidebar._interface.openPicture("${place.openBibleUrlPortion}")'>${place.name}</a>`).join(', ');
    }

    
    /**************************************************************************/
    _createWhoContent (fullRef, chapterDetails)
    {
	const book = fullRef.split('.')[0];
	const people = chapterDetails.people;
	if (0 == people.length)
	    return '&mdash;';

	return people.map(person => `<a href='#' onclick='JUniversalSidebar._interface.openGenealogy("${person.name}", "${person.strong}")'>${person.name}</a>`).join(', ');
    }

    
    /**************************************************************************/
    _readData ()
    {
	return new Promise((resolve, reject) => {
	    const jsonPath = JFrameworkUtils.getFullUrl('html/json/J_AppsJson/J_UniversalSidebar/j_universalSidebarData.json');
	    const me = JUniversalSidebar;
	    me._acquireData(jsonPath, function(text) {
		me._chapterData = JSON.parse(text);
		resolve();
	    });
	});
    }
}




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                           Chronology handler                             **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassChronologyHandler
{
    /**************************************************************************/
    constructor ()
    {
	this._insertionPoints = document.querySelectorAll('.chronologyInsertion');
    }

    
    /**************************************************************************/ 
    newChronology (chapterDate)
    {
	this._hideAllInsertionPoints();
	const ip = this._findInsertionPoint(chapterDate);

	ip.style.display = 'block';
	ip.innerHTML = 'Hi there';
    }


    /**************************************************************************/ 
    _findInsertionPoint (chapterDate)
    {
	for (var i = this._insertionPoints.length - 1; i >= 0; i--)
	{
	    const el = this._insertionPoints[i];
	    const lowValue = Number(el.getAttribute('low'));
	    if (lowValue < chapterDate)
		return el;
	}
    }
    

    /**************************************************************************/ 
    _hideAllInsertionPoints ()
    {
	this._insertionPoints.forEach(el => {
	    el.innerHTML = '';
	    el.style.display = 'none';
	});
    }
}





/******************************************************************************/
const JUniversalSidebar = new _ClassJUniversalSidebar();
window.JUniversalSidebar = JUniversalSidebar;
