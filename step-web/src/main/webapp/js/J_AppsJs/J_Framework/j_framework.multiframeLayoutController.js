/******************************************************************************/
/* Sets up a multiframe application either in iFrames (normally for wide
   screens) or in a tabbed dialogue (normally for small screens).





   Summary of functionality
   =============================================================================

   I'm hoping this can serve as a basis for applications other than the
   genealogy data for which it was set up.

   The code in the present file has been set up with a view to supporting
   layouts of one column or two columns, with each column containing one frame
   or two frames (obviously with at least two frames overall, or there is no
   point in using multiframe facilities).  Be warned, though, that I have
   tested it only in the context of the genealogy application, which
   originally involved a left-hand column containing two frames, and a right-
   hand column containing one.

   To make use of it, I strongly recommend reading these comments in
   conjunction with j_peopleSplit3.html, for which it was originally written,
   and which has been annotated in such a way that looking at these two
   things together makes reasonable sense (I hope) ...





   HTML
   =============================================================================

   Take a copy of j_peopleSplit3.html to use as a template.

   All of the style information upon which the page relies is in
   j_framework.multiframeController.css.  You can override some of the settings
   there if you wish, but you should do so with care, because some need to be
   retained as-is.  I have attempted to indicate within that file the things
   which can safely be altered.

   What you _do_ need to change is the HTML ...

   The notes numbers below correspond to markers which I have put into
   j_peopleSplit3.html, and the HTML below is a copy of the HTML I used for
   the genealogy application, to act as an example.



   Note 1
   ------

   First, you need to say what iframes you will want to have.  You must have
   at least two.  You cannot have more than four.  And you cannot have more
   than two in a single column.  You deal with all this by modifying the
   contents of the framework-iframeList which appears near the top of the
   body:

     <jframework-iframeList>
       <iframe id='peopleIndex' wantSrc='html/J_AppsHtml/J_Genealogy/j_peopleIndex.html' scrolling='yes'           ></iframe><jframework-tabLegend>Index</jframework-tabLegend>
       <iframe id='scripture'   suppressStepHeader='yes'                                 scrolling='yes'           ></iframe><jframework-tabLegend>Scripture</jframework-tabLegend>
       <iframe id='genealogy'   wantSrc='html/J_AppsHtml/J_Genealogy/j_genealogy.html'   scrolling='no' show='wide'></iframe><jframework-tabLegend>Genealogy</jframework-tabLegend>
     </jframework-iframeList>


   Within this, you give normal iframe definitions, but with a few limitations:

   - Don't give src parameters.  In order to indicate what source is to be used
     for a particular iframe, use wantSrc instead.  At least one of the iframe
     definitions must have wantSrc, so that the application can start running.
     There's no need for _all_ of them to do so though.  In the genealogy
     application (illustrated above), the content of the scripture frame is
     determined by the others once the application is running, so it doesn't
     want to have a wantSrc.

   - Don't give style parameters for sizing purposes.  In general the code in
     this present file will sort the layout out for you, although you can give
     it some constraints within which to work.  We look at this later.

   - Do give each frame a unique meaningful id.  If the pages running in the
     separate frames need to communicate with each other, they will refer
     to their target using this id.

   - You can indicate whether you wish the iframe to support vertical
     scrolling.

   - If you will be using an iframe to hold a STEP scripture page, you can
     optionally use suppressStepHeader to attempt to suppress the headers
     in that window, so as to save space.  (This does things like removing
     the menu bar etc.)  Be warned that the code this invokes is not
     particularly nice, and is highly reliant upon the way the STEP
     scripture pages work at present.)

   - Probably you will want all iframes to be displayed regardless of whether the
     functionality is running in wide screen or narrow screen (tabbed dialog)
     mode.  However, you can add a 'show' attribute to the iframe tag to limit
     this.  The options for this are 'wide' (show in wide mode only); 'narrow'
     (show in narrow mode only); or 'wideNarrow' (show in both).  The value is
     not case-sensitive.  The default is wideNarrow.

   Immediately after each iframe definition you need a jframework-tabLegend tag.
   This says how that frame will be named if the tabbed dialogue layout is
   adopted.  The example above is slightly complicated, because I wanted to
   include a Unicode emjoi as part of the name, and those really need to be
   large in order to be legible.  You don't _have_ to do anything that
   complicated, however -- just putting a text string within the
   jframework-tabLegend tag is perfectly sufficient.

   (That really does _mean_ immediately after: don't have spaces or blanks between
   the </iframe> and the jframework-tabLegend.)

   The order in which you define the frames determines the order in which the
   tabs appear in the tabbed dialogue box when that is being used.  The first
   iframe in the list appears on the first tab, etc.  (You have more control
   over ordering when the iframes are all appearing together on the same page.
   We look at that in the next section.)

   The reason for this separate iframe definition block is a) that it makes
   it clearer what frames are being used, and b) I need to use the same
   definitions on both wide and tabbed layouts, and this avoids you having to
   duplicate them.

   Fitting to content:
     By default where you have two iframes in the same column, the space
     allotted to each is determined during initialisation -- 50% each unless
     you take steps to arrange otherwise.

     You can arrange to have the layout adjust dynamically, however, subject
     to certain constraints:

     - The feature is available only in wide layout mode (there is no harm
       in attempting to use it in tabbed mode, but it will be ignored).

     - It can be applied only to the _top_ frame of a column containing
       more than one frame.  (Again, there is no harm in calling it
       regardless -- it will simply be ignored.)

     To use the feature, the application running in the top frame must
     be using JFrameworkMultiframeCommunicationsSlave, and must call

       JFrameworkMultiframeCommunicationsSlave.sendMessageTo(null, { 'resizeIframe': height });

    Here the 'null' indicates that the message will be transferred to the
    layout controller defined in this present class, and the argument gives
    the required height for the frame.  The height of the iframe will be
    set to the height you specify accordingly, and the lower iframe
    in the column will be adjusted to fill the remaining space.

    Note that I don't do any error checking here, so it's down to you to
    ensure that you don't choose heights that are so large or so small that
    things will stop working.
     
   



   Note 2
   ------

   Having listed the frames which are to be used, the next thing is to indicate
   how they are to be laid out when viewing them altogether on a large screen.

     <jframework-wideLayoutVisibilityController>
       <jframework-wideLayoutContentContainer>

      
         <jframework-leftColumn>
	   <jframework-iframePlaceHolder iframeId='peopleIndex'></jframework-iframePlaceHolder>
	   <div class='jframework-heightResizer jframework-horizontalSeparator'></div> <!-- Optional: This gives you space between the rows, and a line which you can drag to resize things. -->
	   <jframework-iframePlaceHolder iframeId='scripture'></jframework-iframePlaceHolder>
         </jframework-leftColumn>

         <div class='jframework-widthResizer jframework-verticalSeparator'></div> <!-- Optional: This gives you space between the columns, and a line which you can drag to resize things. -->

         <jframework-rightColumn>
	   <jframework-iframePlaceHolder iframeId='genealogy'></jframework-iframePlaceHolder>
         </jframework-rightColumn>


       </jframework-wideLayoutContentContainer>
     </jframework-wideLayoutVisibilityController>


   The two outermost tags need to be retained exactly as is.

   Within the inner one, you need an jframework-leftColumn for the left column,
   and, if you have a second column, jframework-rightColumn for the right one.

   Between the two, you can OPTIONALLY have a separator with class
   jframework-verticalSeparator.  You can use this, for instance, to introduce
   a small gap between the two columns by ensuring that the class is defined to
   have a certain width.

   If you also give it class jframework-widthResizer, a dotted line will be added
   to it which can be dragged to resize the columns.

   You can add style max-width or min-width parameters to either or both of the
   columns if you wish (although you may want to check upon the effect of this
   before adopting this permanently, because it may impact the overall effect
   of resizing in unanticipated ways).

   You can also add a defaultWidth attribute to the left column.  (You can also
   add one to the right column too, but it will be ignored.)  This does what it
   says on the tin.  I strongly recommend giving it as a percentage -- a fixed
   width will rule out any kind of dynamic resizing.  The value you give may
   be adjusted slightly to take account of any separator.

   
   Within each column div, you put jframework-iframePlaceHolder tags to indicate
   the iframes which are to appear in that column.  Each must have an iframeId
   attribute which gives the id you assigned to the required iframe.

   If you have more than one iframe in a column, you can also OPTIONALLY
   include a separator between them.  This works pretty much as already
   discussed.  The separator must have class jframework-horizontalSeparator, and
   if you also give it a class jframework-heightResizer it will give a dotted
   line which can be dragged to change the relative heights of the two frames.

   CAUTION: When defining jframework-iframePlaceHolders, don't make them
   self-closing: use a separate </jframework-iframePlaceHolder>.  HTML doesn't
   seem to be too keen upon self-closing tags.



   Note 3
   ------

   That's dealt with the widescreen layout.  At note 3 there is some fixed HTML
   which is used to hold details of the tabbed dialogue layout.  You don't need
   to do anything with this, and should leave it as-is.  The processing here
   will amend it as necessary.



   Note 4
   ------

   And finaly there is a short section of Javascript at the end of the file to
   invoke the processing here.   In some measure this is down to you and the
   requirements of your particular application, but you do need to make sure
   that the relevant functions here are still called on load and resize.
*/





/******************************************************************************/
'use strict';
import { JFrameworkUtils } from '/js/J_AppsJs/J_Framework/j_framework.utils.js';
import { ClassJFrameworkMultiframeCommunicationsMaster } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsMaster.js';




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**               Class to let the user resize the left column               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* We create one of these only for the left column.  The underscore in the name
   is an attempt to convey the idea that it is used only within the present
   file -- there is no need for anyone else to worry about it. */

class _ClassJFrameworkMultiframeColumnResizer
{
    /**************************************************************************/
    /* According to ChatGPT, the content of iframes don't receive onresize
       events when the iframe is resize.  Except that it appears ChatGPT is
       wrong.  I've retained the code which it recommended, but commented it
       out. */

    constructor ()
    {
	/*
	document.querySelectorAll('.layoutSensitiveIFrame').forEach (iframe => {
	    const resizeObserver = new ResizeObserver(() => {
		iframe.contentWindow.postMessage("resized", "*"); // Notify iframe
	    });

	    resizeObserver.observe(iframe);
	});
	*/
    }

    
    /**************************************************************************/
    /* Mouse handlers to cater for the user attempting to resize frames. */
    
    setMouseHandlers ()
    {
	const me = this;
	document.addEventListener('mousemove', me._mouseMoveFn, {passive: true });
	document.addEventListener('mouseup',   me._mouseUpFn  , {passive: true });
    }

    
    /**************************************************************************/
    /* Used to set initial positioning. */
    
    setStartingParameters (startX)
    {
	this._startX = startX
	this._startWidthLeft = this._leftColumn.offsetWidth;
    }


    /**************************************************************************/
    /* Permits all iframes to receive pointer events. */
    
    _enableIframes ()
    {
	document.querySelectorAll('iframe').forEach((iframe) => {
            iframe.style.pointerEvents = 'auto';
	});
    }



    /**********************************************************************/
    /* Places a limit upon resizing. */
    
    _getMaxWidth (dflt)
    {
	var computedWidth = window.getComputedStyle(this._leftColumn).maxWidth; 
	var defaultWidth = this._leftColumn.style.maxWidth;
	const res = (defaultWidth || (computedWidth !== "auto" && computedWidth !== "none")) ? computedWidth : 999999
	return parseFloat(res > dflt ? dflt : res);
    }

	
    /**********************************************************************/
    /* Places a limit upon resizing. */

    _getMinWidth (dflt)
    {
	var computedWidth = window.getComputedStyle(this._leftColumn).minWidth; 
	var defaultWidth = this._leftColumn.style.minWidth;
	const res = (defaultWidth || computedWidth !== "auto") ? computedWidth : -1
	return parseFloat(res < dflt ? dflt : res);
    }

	
    /**************************************************************************/
    _makeMouseMoveFn () { return this._scheduleResize.bind(this); }
    _makeMouseUpFn () { return this._stopResize.bind(this); }


    /**************************************************************************/
    /* Does the actual resizing. */
    
    _resize (event)
    {
        const newWidthLeft = this._startWidthLeft + (event.clientX - this._startX);
	const minWidth = this._getMinWidth(100);
        const maxWidth = this._getMaxWidth(window.innerWidth - minWidth - 5); // Keep room for right column.
	
        if (newWidthLeft >= minWidth && newWidthLeft <= maxWidth)
        {
	    this._leftColumn.style.width = `${newWidthLeft}px`;
            this._rightColumn.style.width = `calc(100% - ${newWidthLeft}px - 5px)`;
	}

	this._animationFrameId = null; // Allow next update
    }


    /**************************************************************************/
    /* As I recall, this is used to ensure we don't respond to resize-related
       mouse-move events too readily -- otherwise you end up doing zillions of
       resizes when the mouse has hardly moved at all. */
    
    _scheduleResize (event)
    {
	if (!this._animationFrameId)
            this._animationFrameId = requestAnimationFrame(() => this._resize(event));
    }


    /**************************************************************************/
    /* Called on mouse-up after resizing (which signals the fact that the user
       is happy).  Removes the resize-related mouse handlers and then lets the
       iframes receive mouse events. */
    
    _stopResize ()
    {
	const mouseMoveFn = this._mouseMoveFn;
	const mouseUpFn = this._mouseUpFn;
	document.removeEventListener('mousemove', mouseMoveFn);
	document.removeEventListener('mouseup', mouseUpFn);
	this._enableIframes();
    }


    /**************************************************************************/
    _animationFrameId;
    _startX;
    _startWidthLeft;    

    _mouseMoveFn = this._makeMouseMoveFn();
    _mouseUpFn = this._makeMouseUpFn();

    _leftColumn = document.querySelector('jframework-leftColumn');
    _rightColumn = document.querySelector('jframework-rightColumn');
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                 Class to let the user resize the top row                 **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This is basically just an analogue of the previous class. */

/******************************************************************************/
class _ClassJFrameworkMultiframeRowResizer
{
    /**************************************************************************/
    constructor (col)
    {
	this._topIframePlaceHolder = col.querySelectorAll('jframework-iframePlaceHolder')[0];
	this._bottomIframePlaceHolder = col.querySelectorAll('jframework-iframePlaceHolder')[1];
	this._heightResizer = col.querySelector('.jframework-heightResizer');	
    }

    
    /**************************************************************************/
    /* Mouse handlers to cater for the user attempting to resize frames. */

    setMouseHandlers ()
    {
	const me = this;
	document.addEventListener('mousemove', me._mouseMoveFn, {passive: true });
	document.addEventListener('mouseup',   me._mouseUpFn  , {passive: true });
    }

    
    /**************************************************************************/
    /* Used to set initial positioning. */

    setStartingParameters (startY)
    {
	this._startY = startY;
	this._startHeightTop = this._topIframePlaceHolder.offsetHeight;
    }


    /**************************************************************************/
    /* Permits all iframes to receive pointer events. */

    _enableIframes ()
    {
	document.querySelectorAll('iframe').forEach((iframe) => {
            iframe.style.pointerEvents = 'auto';
	});
    }

    
    /**************************************************************************/
    _makeMouseMoveFn () { return this._scheduleResize.bind(this); }
    _makeMouseUpFn () { return this._stopResize.bind(this); }


    /**********************************************************************/
    /* Places a limit upon resizing. */

    _getMaxHeight (dflt)
    {
	const computedHeight = window.getComputedStyle(this._topIframePlaceHolder).maxHeight;
	const defaultHeight = this._topIframePlaceHolder.style.maxHeight;
	const res = (defaultHeight || (computedHeight !== 'auto' && computedHeight !== 'none')) ? computedHeight : 999999;
	return parseFloat(res > dflt ? dflt : res);
    }

	
    /**********************************************************************/
    /* Places a limit upon resizing. */

    _getMinHeight (dflt)
    {
	const computedHeight = window.getComputedStyle(this._topIframePlaceHolder).minHeight;
	const defaultHeight = this._topIframePlaceHolder.style.minHeight;
	const res = (defaultHeight || computedHeight !== 'auto') ? computedHeight : -1;
	return parseFloat(res < dflt ? dflt : res);
    }

	
    /**************************************************************************/
    /* Does the actual resizing. */

    _resize (event)
    {
	const newHeightTop = this._startHeightTop + (event.clientY - this._startY);
	const minHeight = this._getMinHeight(50);
	const maxHeight = this._getMaxHeight(window.innerHeight - minHeight - this._heightResizer.offsetHeight);

	if (newHeightTop >= minHeight && newHeightTop <= maxHeight)
	{
            this._topIframePlaceHolder.style.height = `${newHeightTop}px`;
            this._bottomIframePlaceHolder.style.height = `calc(100% - ${newHeightTop}px - 5px)`;
	}

	this._animationFrameId = null; // Allow next update
    }


    /**************************************************************************/
    /* As I recall, this is used to ensure we don't respond to resize-related
       mouse-move events too readily -- otherwise you end up doing zillions of
       resizes when the mouse has hardly moved at all. */
    
    _scheduleResize (event)
    {
	if (!this._animationFrameId)
            this._animationFrameId = requestAnimationFrame(() => this._resize(event));
    }


    /**************************************************************************/
    /* Called on mouse-up after resizing (which signals the fact that the user
       is happy).  Removes the resize-related mouse handlers and then lets the
       iframes receive mouse events. */
    
    _stopResize ()
    {
	const mouseMoveFn = this._mouseMoveFn;
	const mouseUpFn = this._mouseUpFn;
	document.removeEventListener('mousemove', mouseMoveFn);
	document.removeEventListener('mouseup', mouseUpFn);
	this._enableIframes();
    }


    
    /**************************************************************************/
    _animationFrameId;
    _startY;
    _startHeightTop;

    _mouseMoveFn = this._makeMouseMoveFn();
    _mouseUpFn = this._makeMouseUpFn();

    _topIframePlaceHolder;
    _bottomIframePlaceHolder;
    _heightResizer;
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                   Class to let the user resize things                    **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Intended only for internal use -- there should be no need for anyone else to
   create one of these. */

class _ClassJFrameworkMultiframeResizer
{
    constructor ()
    {
	/**********************************************************************/
	const me = this;


	
	/**********************************************************************/
	function processHeightResizer (colClass)
	{
	    const col = document.querySelector(colClass);
	    if (!col) return;

	    const resizer = col.querySelector('.jframework-heightResizer');
	    if (!resizer) return;

	    resizer.addEventListener('mousedown', (event) => {
		event.preventDefault();
		const multiFrameRowResizer  = new _ClassJFrameworkMultiframeRowResizer(col);
		me._disableIframes();
		multiFrameRowResizer.setStartingParameters(event.clientY);
		multiFrameRowResizer.setMouseHandlers();
	    });
	}

	processHeightResizer('jframework-leftColumn');
	processHeightResizer('jframework-rightColumn');


	    
	/**********************************************************************/
	const resizer = document.querySelector('.jframework-widthResizer');
	if (!resizer) return;

	resizer.addEventListener('mousedown', (event) => {
	    event.preventDefault();
	    const multiFrameColumnResizer = new _ClassJFrameworkMultiframeColumnResizer();
	    me._disableIframes();
	    multiFrameColumnResizer.setStartingParameters(event.clientX);
	    multiFrameColumnResizer.setMouseHandlers();
	});
    }


    /**********************************************************************/
    /* Prevents mouse events from being passed through to the iframes while
       the user is resizing things. */
    
    _disableIframes()
    {
	document.querySelectorAll('iframe').forEach((iframe) => {
            iframe.style.pointerEvents = 'none';
	});
    }
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                        Overall layout controller                         **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Should be no need for the caller to instantiate this -- an instance is
   created below, and that should be enough. */

class _ClassJFrameworkMultiframeLayoutController
{
    /**************************************************************************/
    constructor ()
    {
	window.JFrameworkMultiframeLayoutController = this; // Attach the instance to the window.
    }




	
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                                Layout                                **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    handleExternalResizeRequest (resizeSize, sourceFrameId)
    {
	this._resizeFrameHeightIfAppropriate(sourceFrameId, resizeSize);
    }

    
    /**************************************************************************/
    /* Apparently the weird syntax below ensures that things don't start
       running on startup until the load process approaches something like
       steady state. */
    
    onload ()
    {
	this._onloadAndOnresize();
    }

    _onloadAndOnresize () // I've split tyhis
    {
	const me = this;
	$(function() { me._selectLayout(); new _ClassJFrameworkMultiframeResizer(); } );
    }

    
    /**************************************************************************/
    /* Debounces things, so that we don't constantly resize stuff while the
       user is changing the width. */
    
    resize ()
    {
	var resizeTimeout;
	const me = this;
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => { me._onloadAndOnresize(); }, 200); // 200 ms delay after the last resize event.
    }
    

    /**************************************************************************/
    /* Forces the named tab to be opened, while hiding everything else. */
    
    openDialogTab (name)
    {
	try
	{
	    this._openDialogTab(this._frameIndexToNameMapping.get(name));
	}
	catch (e)
	{
	}
    }

    
    /**************************************************************************/
    /* Handles open-dialog-tab clicks.  I was ensuring that only one tab was
       visible by manipulating the display settings (none vs flex).  However,
       ChatGPT recommended adding or removing jframework-invisible-offscreen
       instead.  This keeps the window at full size, but just removes it to
       a position where it can't be seen.  This is a useful option, because
       actions in one tab here may affect the content of other tabs.  With
       display:none, the other iframes have zero width, and therefore may
       not update correctly.  With the expedient suggested here, they
       continue to have their normal width. */       

    _openDialogTab (index)
    {
	const tabbedLayoutContent = document.getElementsByClassName('jframework-tabbedLayoutIframeHolder');
	for (var i = 0; i < tabbedLayoutContent.length; i++)
	    tabbedLayoutContent[i].classList.add('jframework-invisible-offscreen');   //tabbedLayoutContent[i].style.display = 'none';

	const x = document.getElementById(`jframework-tabbedLayoutIframeHolder_${index}`);
	x.classList.remove('jframework-invisible-offscreen'); x.style.display = 'flex';

	window.JFrameworkMultiframeCommunicationsMaster.sendActivation(document.querySelector(`iframe[ix='${index}']`).id);
			


	const tabButtons = document.getElementsByClassName('jframework-tabButton');
	for (i = 0; i < tabButtons.length; i++)
	    tabButtons[i].classList.remove('jframework-tabButtonSelected');
	document.getElementById(`jframework-tabbedLayoutTabSelectorButton_${index}`).classList.add('jframework-tabButtonSelected');
    }

    
    /**************************************************************************/
    /* Changes the height of a frame.  This does something only when ...

       a) We are in wide layout mode; and
       b) There is more than one frame in the target column; and
       c) The target frame is the first in the column.

       At one stage there was a concern that I might be running this code before
       the iframe had fully loaded, and the code below was recommeded.  However,
       I don't think this is an issue now, because we can arrange to call the
       present code at the end of the load process.

       iFrame.onload = function()
       {
           iframe.closest('jframework-iframePlaceHolder').style.height = height + 'px';
       }
    */
    
    _resizeFrameHeightIfAppropriate (frameId, height)
    {
	if ('wideLayout' !== $('body').attr('jframework-layout'))
	    return;
	
	const iframe = $('#' + frameId)[0];
	const col = iframe.closest('jframework-leftColumn') || iframe.closest('jframework-leftColumn');
	const iframes = col.querySelectorAll('iframe');
	if (1 == iframes.length) // No point in doing anything if there is only one iframe in the column.
	    return;

	if (iframe !== iframes[0])
	    return;

	iframe.closest('jframework-iframePlaceHolder').style.height = height + 'px';
	setTimeout(() => {
	}, 0); // ChatGPT suggests this is a good idea to ensure things have a chance to settle down.

    }

    
    /**************************************************************************/
    /* Arranges for the apppropriate layout to be established -- all frames
       on a single page, or multiple tabs. */
    
    _selectLayout ()
    {
	var currentLayout = $('body').attr('jframework-layout');
	if (typeof currentLayout == 'undefined') currentLayout = 'undefined'
	var newLayout = JFrameworkUtils.isLargeScreen() ? 'wideLayout' : 'tabbedLayout';

	if ('undefined' == currentLayout) // Need full initialisation if we haven't set anything up at all yet.
	    this._selectLayoutCommonInitialisation(newLayout);

	if (currentLayout == newLayout) // If we are already using the intended layout, nothing to do.
	    return;

	$('body').attr('jframework-layout', newLayout); // Record the layout we are using.

	if ('wideLayout' == newLayout) // Select the required layout.
	    this._selectLayoutWideLayout();
	else
	    this._selectLayoutTabbedLayout();
    }


    /**************************************************************************/
    /* Common initialisation.

       There is a very little of this which is genuinely common.  Most of this
       function is concerned with setting stuff up for the tabbed layout, so
       that it's available should we need it.

       With the wide layout, the programmer puts placeholders in positions to
       indicate where the various frames are to go.  With the tabbed layout the
       program has to do it for itself.  Strictly that's not always going to be
       necessary, but to make later programming more consistent it will be
       useful to do it even if, later, we determine it is not necessary. */
    
    _selectLayoutCommonInitialisation (layout)
    {
        /**********************************************************************/
	/* The list of frames which are required, and associated information. */

	const selector = 'wideLayout' === layout ? 'wide' : 'narrow';
	var iframeList = $('jframework-iframeList').eq(0);
	var iframes = iframeList.children('iframe');
	const tabButtonContents = iframeList.children('jframework-tabLegend');
	const me = this;



        /**********************************************************************/
	/* Give each iframe an index value in case it turns out to be useful.
           Also the document will already contain placeholders for the wide
           layout, and we need to flag the fact that they are indeed intended
           for that layout. */
	
        iframes.each(function(index) { $(this).attr('ix', index); $(this).addClass('jframework-layoutSensitiveIFrame'); me._frameIndexToNameMapping.set($(this).attr('id'), index); });
        $('jframework-iframePlaceHolder').each(function (index) { $(this).addClass('jframework-wideLayout'); });


	
        /**********************************************************************/
	/* The tabbed dialog box needs selector buttons.  And we also need a
           div for each tab, which will contain the content.  Initially each
           of these simply wants to hold an iframePlaceHolder.  There is one
           really unpleasant bit below ...

	   The real meat of the following block is the html+= inside the loop
           which creates the buttons.  However the thing looks more like a
           tabbed dialog if you carry the line on which they sit all the way
           across the page.  I've tried various ways of doing that, but the
           only way which seems to work is to create an invisible button
           like the others, organised to fill the entire remaining width.

           For that to work, I also need a container with display:flex.
        */

	var html = '';
	tabButtonContents.each(function(index) {
	    html += `<button id='jframework-tabbedLayoutTabSelectorButton_${index}' class='jframework-tabButton'>${tabButtonContents[index].innerHTML}</button>`;
	});
	html += `<button class='jframework-tabButton' style='flex-grow:1; font-size:x-large; background: none; border-top: none; border-left: none; border-right: none; cursor: auto;'></button>`; // Kludge.
	$('jframework-tabbedLayoutButtonBar').append(html);
	
	html = '';
	iframes.each(function(index) {
	    html +=
`<div id='jframework-tabbedLayoutIframeHolder_${index}' class='jframework-tabbedLayoutIframeHolder'>
   <jframework-iframePlaceHolder class='jframework-tabbedLayout' iframeId='${iframes.eq(index).attr('id')}'></<jframework-iframePlaceHolder>
</div>`;
	});
	$('jframework-tabbedLayoutContent').append(html);
	
        const buttons = document.querySelectorAll('jframework-tabbedLayoutButtonBar .jframework-tabButton');
        buttons.forEach((button, index) => {
            button.onclick = (event) => this._openDialogTab(index);
        });
    }

    
    /**************************************************************************/
    /* Called only when the layout is first being established.  Looks to see if
       any iframes contain wantSrc attributes, and if so, copies this to
       src.  Also, merges in any attributes from the URL used to invoke the
       multiframe page itself. */
    
    _selectLayoutSetSources (iframes)
    {
	var parmsPassedToMultiframePage = window.location.search;
	if ('' != parmsPassedToMultiframePage)
	    parmsPassedToMultiframePage = '&' + parmsPassedToMultiframePage.substring(1); // Remove the leading '?' and replace by '&'.
	
        iframes.each(function(index) {
	    var wantSrc = $(this).attr('wantSrc');
	    const haveSrc = $(this).attr('src');
	    if (wantSrc && !haveSrc)
	    {
		if (wantSrc.includes('?'))
		    wantSrc = wantSrc + parmsPassedToMultiframePage;
		else if ('' != parmsPassedToMultiframePage)
		    wantSrc = wantSrc + '?' + parmsPassedToMultiframePage.substring(1);

		$(this).attr('src', window.location.origin + '/' + wantSrc);
	    }
	});
    }

    
    /**************************************************************************/
    /* We have _two_ collections of jframework-iframePlaceHolders (one set for
       wide layout and one for tabbed layout), but only _one_ set of actual
       iframes. This moves the iframes to the appropriate placeholders as
       determined by layout. */
    
    _selectLayoutMoveFramesTo (layout)
    {
	var iframes = $('.jframework-layoutSensitiveIFrame');
	var targets = $('jframework-iframePlaceHolder.' + layout);

	for (var i = 0; i < targets.length; ++i)
	{
	    const $target = targets.eq(i);
	    const $iframe = $('#' + $target.attr('iframeId'));
	    var show = $iframe.attr('show')
	    if (show)
		show = (layout.includes('wideLayout') && 'wide' === show.toLowerCase()) || 'wide' !== show.toLowerCase()
	    else
		show = true;

	    if (show)
		$target.html($iframe);
	}

	this._selectLayoutSetSources(iframes);
    }


    /**************************************************************************/
    /* Called to handle the tabbed layout.  We get here only if tabbed is
       required and the wide layout is not already active.  There are two
       possibilities -- the layout may not have been established at all yet,
       or we may previously have been using the wide layout. */
    
    _selectLayoutTabbedLayout ()
    {
        var wideLayout = document.querySelector('jframework-wideLayoutVisibilityController');
        var tabbedLayout = document.querySelector('jframework-tabbedLayoutVisibilityController');
	this._hideContainerWhichShouldRemainFullSizeIfPossible(wideLayout);
	this._showContainerWhichShouldRemainFullSizeIfPossible(tabbedLayout, 'flex');
	document.getElementById('jframework-tabbedLayoutTabSelectorButton_0').click();

	var iframes = $('.jframework-layoutSensitiveIFrame');
	var clickOn = -1;

	for (var i = 0; i < iframes.length; ++i)
	{
	    const $iframe = iframes.eq(i);
	    var show = $iframe.attr('show')
	    if (show)
		show = show.toLowerCase().includes('narrow');
	    else
		show = true;

	    if (show)
	    {
		if (clickOn < 0)
		    clickOn = i;
	    }
	    else
		document.getElementById('jframework-tabbedLayoutTabSelectorButton_' + i).style.display = 'none';
	}

	this._selectLayoutMoveFramesTo('jframework-tabbedLayout');
	document.getElementById('jframework-tabbedLayoutTabSelectorButton_' + clickOn).click();
    }

    
    /**************************************************************************/
    _hideContainerWhichShouldRemainFullSizeIfPossible (container)
    {
	container.classList.add('jframework-invisible-offscreen');
    }

    
    /**************************************************************************/
    _showContainerWhichShouldRemainFullSizeIfPossible (container, displaySetting)
    {
	container.classList.remove('jframework-invisible-offscreen');
    }

    
    /**************************************************************************/
    /* Called to handle the wide layout.  We get here only if wide is required
       and the wide layout is not already active.  There are two possibilities
       -- the layout may not have been established at all yet, or we may
       previously have been using a tabbed layout. */
    
    _selectLayoutWideLayout ()
    {
	/**********************************************************************/
	/* Set things up so that everything knows which layout we are using. */
	
        var wideLayout = document.querySelector('jframework-wideLayoutVisibilityController');
        var tabbedLayout = document.querySelector('jframework-tabbedLayoutVisibilityController');
	this._showContainerWhichShouldRemainFullSizeIfPossible(wideLayout, 'flex');
	this._hideContainerWhichShouldRemainFullSizeIfPossible(tabbedLayout);
	this._selectLayoutMoveFramesTo('jframework-wideLayout');



	/**********************************************************************/
	/* I assume we will _always_ have a left column, but possibly not a
	   right column.

	   Having established that we do have a column to deal with, see how
	   many placeholders we have.

	   If one, then we can devote the entire height to it.

	   If two, I set the top one to the default height which has
	   been specified for the iframe which it is to hold, and the bottom
	   one to flex:1.  I assume there will never be more than two. */
	
	function sizeContentsOfColumn (colClass)
	{
	    const column = $(`jframework-wideLayoutVisibilityController ${colClass}`);
	    if (0 == column.length) // We'll always have a left column, but we may not have a right column.
		return;
	    
	    const owningColumn = $(`jframework-wideLayoutVisibilityController ${colClass}`).eq(0);
	    const placeHoldersInColumn = $(`jframework-wideLayoutVisibilityController ${colClass} jframework-iframePlaceHolder`);
	    if (1 == placeHoldersInColumn.length)
		placeHoldersInColumn.eq(0).css('height', '100%');
	    else
	    {
		const horizontalSeparator = $(`jframework-wideLayoutVisibilityController ${colClass} .jframework-horizontalSeparator`);
		const separatorHeight = 1 == horizontalSeparator.length ? horizontalSeparator.outerHeight() : 0;
	
		var defaultHeight = placeHoldersInColumn.eq(0).attr('defaultHeight');
		if (!defaultHeight) defaultHeight = '50%'
		if (defaultHeight.includes('%'))
		{
		    const containerHeight = owningColumn.height();
		    defaultHeight = (containerHeight - separatorHeight) * defaultHeight.replace('%', '') / 100;
		    defaultHeight = Math.round((defaultHeight / containerHeight) * 100) + '%';
		}
		
		placeHoldersInColumn.eq(0).css('height', defaultHeight);
		placeHoldersInColumn.eq(1).css('flex', '1');
	    }
	}

	sizeContentsOfColumn('jframework-leftColumn');
	sizeContentsOfColumn('jframework-rightColumn');



	/**********************************************************************/
	/* Now for the columns.  If we have only one, then it occupies the
	   entire width.  If we have two, the first one is as specified (or
	   50% of the available space less the width of any separator), and the
	   right is whatever is left over. */
	
	const leftColumn = $('jframework-wideLayoutVisibilityController jframework-leftColumn')
	const rightColumn = $('jframework-wideLayoutVisibilityController jframework-rightColumn')
	if (0 == rightColumn.length)
	    leftColumn.css('width', '100%');
	else
	{
	    const verticalSeparator = $(`jframework-wideLayoutVisibilityController .jframework-verticalSeparator`);
	    const separatorWidth = 1 == verticalSeparator.length ? verticalSeparator.outerWidth() : 0;
	
	    var defaultWidth = leftColumn.attr('defaultWidth');
	    if (!defaultWidth) defaultWidth = '50%'
	    if (defaultWidth.includes('%'))
	    {
		const containerWidth = $(`jframework-wideLayoutVisibilityController`).width();
		defaultWidth = (containerWidth - separatorWidth) * defaultWidth.replace('%', '') / 100;
		defaultWidth = Math.round((defaultWidth / containerWidth) * 100) + '%'
	    }

	    leftColumn.css('width', defaultWidth);
	    rightColumn.css('flex', '1');
	    $('jframework-rightColumn iframe').css('2idth', '100%');
	}
    }


    /**************************************************************************/
    _dbgGetAncestors(element)
    {
	let ancestors = [];
	while (element)
	{
	    if (element.nodeType === 1)
	    {
		let x = window.getComputedStyle(element).height;
		ancestors.push({ tag: element.tagName, height: x });
	    }
	    element = element.parentNode;
	}
	console.log(ancestors);
    }
    

    /**************************************************************************/
    /* Swaps content of two iFrames.  The frames are selected by id.  Their
       ids and content (src) are swapped.

       WARNING: As of Mar 2025, swapping iframes between different locations
       was resulting in their content being reloaded, and state information
       being lost.  Apparently this is a known issue, and there is a new API
       called moveBefore which will address this, but at present this is
       available only in Chrome 133+.

       To attempt to get round this, where possible I use internal
       communication between iframes, rather than physically moving them
       around. */
    
    _swapPanes_YOU_PROBABLY_SHOULDNT_USE_THIS (paneAId, paneBId)
    {
	if (!this.amInIframe())
	    return;

	const paneAFrame = window.parent.document.getElementById(paneAId);
	const paneBFrame = window.parent.document.getElementById(paneBId);

	const paneASrc = paneAFrame.src;
	const paneBSrc = paneBFrame.src;

	paneAFrame.id = paneBId;
	paneBFrame.id = paneAId;

	paneAFrame.src = paneBSrc;
	paneBFrame.src = paneASrc;
    }
    

    /**************************************************************************/
    _frameIndexToNameMapping = new Map();
}

export const JFrameworkMultiframeLayoutController = new _ClassJFrameworkMultiframeLayoutController();
