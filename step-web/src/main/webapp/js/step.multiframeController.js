/******************************************************************************/
/* Sets up a multiframe application either in iFrames or in a tabbed dialogue.

   I'm hoping this can serve as a basis for applications other than the
   genealogy data for which it was set up.

   The functionality comprises a number of separate parts:

   - Basic layout.

   - Interframe communications.

   - Utilities (this portion being based upon some things which do indeed
     seem to be used fairly commonly in existing code).

   - And three related classes which make it possible to resize columns
     (or frames within an individual column) by dragging with the mouse.
     This functionality is relevant only when multiple iframes are being
     displayed on one screen all at once.

   To make use of it, I strongly recommend reading these comments in
   conjunction with peopleSplit3.html, which has been annotated in such a
   way that looking at these two things together makes reasonable sense
   (I hope) ...





   What you need to do
   ===================

   Take a copy of peopleSplit3.html to use as a template.

   This starts with some style information.  You _can_ change or add to this if
   you need to, but in general I'd recommend leaving things as they are --
   some of the stuff there, the code relies upon.

   What you _do_ need to change is the HTML ...

   The notes numbers below correspond to markers which I have put into
   peopleSplit3.html, and the HTML is a copy of the HTML I used for the
   genealogy application, to act as an example.

   The code in the present file has been set up with a view to supporting
   layouts of one column or two columns, with each column containing one frame
   or two frames (obviously with at least two frames overall, or there is no
   point in using multiframe facilities).  Be wanred, though, that I have
   tested it only in the context of the genealogy application, which
   involved a left-hand column containing two frames, and a right-hand
   column containing one.



   Note 1
   ------

   First, you need to say what iframes you will want to have.  You must have
   at least two, and you cannot have more than four.  You do this by modifying
   the contents of the span#iframeList which appears near the top of the body:

   <span id='iframeList' style='display:none'>
     <iframe id='peopleIndex' wantSrc='peopleIndex.html' scrolling='yes'></iframe><tabLegend><span class='bigEmoji'>&#128203;</span>&nbsp;Index</tabLegend>
     <iframe id='scripture'   suppressStepHeader='yes'   scrolling='yes'></iframe><tabLegend><span class='bigEmoji'>&#128218;</span>&nbsp;Scripture</tabLegend>
     <iframe id='genealogy'   wantSrc='genealogy.html'   scrolling='no' ></iframe><tabLegend><span class='bigEmoji'>&#x1F46A;</span>&nbsp;Genealogy</tabLegend>
   </span>


   You give normal iframe definitions, but with a few limitations:

   - Don't give src parameters.  In order to indicate what source is to be used
     for a particular iframe, use wantSrc instead.  At least one of the iframe
     definitions must have wantSrc, so that the application can start running.
     There's no need for _all_ of them to do so though.  In the genealogy
     application (illustrated above), the content of the scripture frame is
     determined by the others, so it doesn't want to have a wantSrc.

   - Don't give style parameters for sizing purposes.  In general the code in
     this present file will sort the layout out for you, although you can give
     it some constraints within which to work.  We look at this later.

   - Do give each frame unique meaningful id.  If the pages running in the
     separate frames need to communicate with each other, they will refer
     to their target using this id.


   Immediately after each iframe definition you need a tabLegend tag.  This says
   how that frame will be named if the tabbed dialogue layout is adopted.  The
   example above is slightly complicated, because I wanted to include a Unicode
   emjoi as part of the name, and those really need to be large in order to be
   legible.  You don't _have_ to do anything that complicated, however -- just
   putting a text string within the tabLegend tag is perfectly sufficient.

   The order in which you define the frames determines the order in which the
   tabs appear in the tabbed dialogue box when that is being used.  The first
   iframe in the list appears on the first tab, etc.  (You have more control
   over ordering when the iframes are all appearing together on the same page.
   we look at that in the next section.)

   The reason for this separate iframe definition block is a) that it makes
   it clearer what frames are being used, and b) I need to use the same
   definitions on both wide and tabbed layouts, and this avoids you having to
   duplicate them.



   Note 2
   ------

   Having listed the frames which are to be used, the next thing is to indicate
   how they are to be laid out when viewing them altogether on a large screen.

     <div id='wideLayoutVisibilityController' style='display:none; width:100%; height:100%; margin-left:10px; margin-bottom:10px;'> *** DON'T CHANGE ***
       <div id='wideLayoutContentContainer'   style='display:flex; flex-direction: row; flex:1; justify-content:center; align-items:center;'> *** DON'T CHANGE ***

         <div class='leftColumn'>
	   <iframePlaceHolder iframeId='peopleIndex'></iframePlaceHolder>
	   <div class='heightResizer horizontalSeparator'></div>
	   <iframePlaceHolder iframeId='scripture'></iframePlaceHolder>
         </div>

         <div class='widthResizer verticalSeparator'></div>

         <div class='rightColumn' style='display:flex; height:100%; flex-grow:1;'>
	   <iframePlaceHolder iframeId='genealogy'></iframePlaceHolder>
         </div>

       </div> *** DON'T CHANGE ***
     </div> *** DON'T CHANGE ***


   The two outermost div's need to be retained as is.  Within these, you need
   one div for the left column and, if you have a second column, one for the
   right column.

   The left or only column must have class leftColumn, and the right column
   must have class rightColumn.

   Between the two, you can OPTIONALLY have a separator with class
   verticalSeparator.  You can use this, for instance, to introduce a small
   gap between the two columns by ensuring it has a certain width.

   If you also give it class widthResizer, a dotted line will be added to
   it which can be dragged to resize the columns.

   You can add style max-width or min-width parameters to either or both of the
   columns if you wish (although you may want to check upon the impact of this
   before adopting this permanently, because it may impact the overall effect
   of resizing in unanticipated ways).

   You can also add a defaultWidth attribute to the left column.  (You can also
   add one to the right column, but it will be ignored.)  This does what it
   says on the tin.  I strongly recommend giving it as a percentage -- a fixed
   width will rule out any kind of dynamic resizing.  The value you give may
   be adjusted slightly to take account of any separator.

   
   Within each column div, you put iframePlaceHolder tags to indicate the
   iframes which are to appear in that column.  Each must have an iframeId
   attribute which gives the id you assigned to the required iframe.

   If you have more than one iframe in a column, you can also OPTIONALLY
   include a separator between them.  This works pretty much as already
   discussed.  The separator must have class horizontalSeparator, and if you
   also give it a class heightResizer it will give a dotted line which can be
   dragged to change the relative heights of the two frames.

   CAUTION: When defining iframePlaceHolders, don't make them self-closing:
   use a separate </iframePlaceHolder>.  HTML doesn't seem to be too keen
   upon self-closing tags.



   Note 3
   ------

   That's dealt with the widescreen layout.  At note 3 there is some fixed HTML
   which is used to hold details of the tabbed dialogue layout.  You don't need
   to do anything with this, and should leave it as-is.  The processing here
   will amend it as necessary.



   Note 4
   ------

   And finaly there is a short section of Javascript at the end of the file to
   invoke the processing here.  You can modify this if you need to, so long as
   you make sure that the relevant functions here are still called on load and
   resize.




   Caveats
   =======

   Some of the functionality here requires iframes to be moved from one location
   to another.  To be more precise, this happens a) when swapping between wide
   layout and tabbed dialogue layout; and b) when swapping the genealogy and
   scripture iframes in wide layout.

   At the time of writing, this is not ideal, because moving iframes always
   causes them to be reloaded, with the result that any changes the user
   has applied will be lost.

   Apparently there is a new API called moveBefore which will address this, but
   presently this is available only in Chrome 133+.

   To attempt to get round this, where possible I use internal communication
   between iframes, rather than resizing.
*/

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* We create one of these only for the left column. */

class ClassMultiframeColumnResizer
{
    /**************************************************************************/
    /* The content of iframes don't receive onresize events when the iframe is
       resized, so we have to resort to other means to let them know.

       EXCEPT ... It looks as though this information (which was supplied
       by ChatGPT), is wrong, and therefore I don't need the code after all. */

/*    
    constructor ()
    {
	document.querySelectorAll('.layoutSensitiveIFrame').forEach (iframe => {
	    const resizeObserver = new ResizeObserver(() => {
		iframe.contentWindow.postMessage("resized", "*"); // Notify iframe
	    });

	    resizeObserver.observe(iframe);
	});
    }
*/

    
    /**************************************************************************/
    setMouseHandlers ()
    {
	const me = this;
	document.addEventListener('mousemove', me._mouseMoveFn, {passive: true });
	document.addEventListener('mouseup',   me._mouseUpFn  , {passive: true });
    }

    
    /**************************************************************************/
    setStartingParameters (startX)
    {
	this._startX = startX
	this._startWidthLeft = this._leftColumn.offsetWidth;
    }


    /**************************************************************************/
    _enableIframes ()
    {
	document.querySelectorAll('iframe').forEach((iframe) => {
            iframe.style.pointerEvents = 'auto';
	});
    }



    /**********************************************************************/
    _getMaxWidth (dflt)
    {
	var computedWidth = window.getComputedStyle(this._leftColumn).maxWidth; 
	var defaultWidth = this._leftColumn.style.maxWidth;
	const res = (defaultWidth || (computedWidth !== "auto" && computedWidth !== "none")) ? computedWidth : 999999
	return parseFloat(res > dflt ? dflt : res);
    }

	
    /**********************************************************************/
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
    _scheduleResize (event)
    {
	if (!this._animationFrameId)
            this._animationFrameId = requestAnimationFrame(() => this._resize(event));
    }


    /**************************************************************************/
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

    _leftColumn = document.querySelector('.leftColumn');
    _rightColumn = document.querySelector('.rightColumn');
}





/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class ClassMultiframeRowResizer
{
    /**************************************************************************/
    constructor (col)
    {
	this._topIframePlaceHolder = col.querySelectorAll('iframePlaceHolder')[0];
	this._bottomIframePlaceHolder = col.querySelectorAll('iframePlaceHolder')[1];
	this._heightResizer = col.querySelector('.heightResizer');	
    }

    
    /**************************************************************************/
    setMouseHandlers ()
    {
	const me = this;
	document.addEventListener('mousemove', me._mouseMoveFn, {passive: true });
	document.addEventListener('mouseup',   me._mouseUpFn  , {passive: true });
    }

    
    /**************************************************************************/
    setStartingParameters (startY)
    {
	this._startY = startY
	this._startHeightTop = this._topIframePlaceHolder.offsetHeight;
    }


    /**************************************************************************/
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
    _getMaxHeight (dflt)
    {
	const computedHeight = window.getComputedStyle(this._topIframePlaceHolder).maxHeight;
	const defaultHeight = this._topIframePlaceHolder.style.maxHeight;
	const res = (defaultHeight || (computedHeight !== 'auto' && computedHeight !== 'none')) ? computedHeight : 999999
	return parseFloat(res > dflt ? dflt : res);
    }

	
    /**********************************************************************/
    _getMinHeight (dflt)
    {
	const computedHeight = window.getComputedStyle(this._topIframePlaceHolder).minHeight;
	const defaultHeight = this._topIframePlaceHolder.style.minHeight;
	const res = (defaultHeight || computedHeight !== 'auto') ? computedHeight : -1;
	return parseFloat(res < dflt ? dflt : res);
    }

	
    /**************************************************************************/
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
    _scheduleResize (event)
    {
	if (!this._animationFrameId)
            this._animationFrameId = requestAnimationFrame(() => this._resize(event));
    }


    /**************************************************************************/
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
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class MultiframeResizer
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

	    const resizer = col.querySelector('.heightResizer');
	    if (!resizer) return;

	    resizer.addEventListener('mousedown', (event) => {
		event.preventDefault();
		const multiFrameRowResizer  = new ClassMultiframeRowResizer(col);
		me._disableIframes();
		multiFrameRowResizer.setStartingParameters(event.clientY);
		multiFrameRowResizer.setMouseHandlers();
	    });
	}

	processHeightResizer('.leftColumn');
	processHeightResizer('.rightColumn');


	    
	/**********************************************************************/
	const resizer = document.querySelector('.widthResizer');
	if (!resizer) return;

	resizer.addEventListener('mousedown', (event) => {
	    event.preventDefault();
	    const multiFrameColumnResizer = new ClassMultiframeColumnResizer();
	    me._disableIframes();
	    multiFrameColumnResizer.setStartingParameters(event.clientX);
	    multiFrameColumnResizer.setMouseHandlers();
	});
    }


    /**********************************************************************/
    _disableIframes()
    {
	document.querySelectorAll('iframe').forEach((iframe) => {
            iframe.style.pointerEvents = 'none';
	});
    }
}





/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class ClassMultiframeController
{
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                            Configuration                             **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    WidthThreshold = 960; // Width in pixels below which tabs are used.
    UrlBase = '/html/' // String within URLs before which the root of the URL appears.

    



    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                                Layout                                **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* Debounces things, so that we don't constantly resize stuff while the
       user is changing the width. */
    
    resize ()
    {
	var resizeTimeout;
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => { onload(); }, 200); // 200 ms delay after the last resize event.
    }
    

    /**************************************************************************/
    /* Apparently the weird syntax below ensures that things don't start
       running on startup until the load process approaches something like
       steady state. */
    
    onload ()
    {
	const that = this;
	$(function() { that.selectLayout(); new MultiframeResizer(); } );
    }

    
    /**************************************************************************/
    /* Arranges for the apppropriate layout to be established -- all frames
       on a single page, or multiple tabs. */
    
    selectLayout ()
    {
	var currentLayout = $('body').attr('layout');
	if (typeof currentLayout == 'undefined') currentLayout = 'undefined'
	var newLayout = this.getMasterWindowWidth() >= this.WidthThreshold ? 'wideLayout' : 'tabbedLayout';

	if ('undefined' == currentLayout) // Need full initialisation if we haven't set anything up at all yet.
	    this.selectLayoutCommonInitialisation();

	if (currentLayout == newLayout) // If we are already using the intended layout, nothing to do.
	    return;

	$('body').attr('layout', newLayout); // Record the layout we are using.

	if ('wideLayout' == newLayout) // Select the required layout.
	    this.selectLayoutWideLayout();
	else
	    this.selectLayoutTabbedLayout();
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
    
    selectLayoutCommonInitialisation ()
    {
        /**********************************************************************/
	/* The list of frames which are required, and associated information. */
	
	var iframeList = $('#iframeList');
	var iframes = iframeList.children('iframe');
	const tabButtonContents = iframeList.children('tabLegend');



        /**********************************************************************/
	/* Give each iframe an index value in case it turns out to be useful.
           Also the document will already contain placeholders for the wide
           layout, and we need to flag the fact that they are indeed intended
           for that layout. */
	
        iframes.each(function(index) { $(this).attr('ix', index); $(this).addClass('layoutSensitiveIFrame'); });
        $('iframePlaceHolder').each(function (index) { $(this).addClass('wideLayout'); });


	
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
	    html += `<button id='tabbedLayoutTabSelectorButton_${index}' class='tabButton' onclick='multiframeControllerOpenDialogTab(event, ${index})'>${tabButtonContents[index].innerHTML}</button>`;
	});
	html += `<button class='tabButton' style='flex-grow:1; font-size:x-large; background: none; border-top: none; border-left: none; border-right: none; cursor: auto;'></button>`; // Kludge.
	$('#tabbedLayoutButtonBar').append(html);
	
	html = '';
	iframes.each(function(index) {
	    html += `<div id='tabbedLayoutIframeHolder_${index}' class='tabbedLayoutIframeHolder'><iframePlaceHolder class='tabbedLayout' iframeId='${iframes.eq(index).attr('id')}'/></div></div>`;
	});
	$('#tabbedLayoutContent').append(html);
    }

    
    /**************************************************************************/
    /* Called only when the layout is first being established.  Looks to see if
       any iframes contain wantSrc attributes, and if so, copies this to
       src.  Also, merges in any attributes from the URL used to invoke the
       multiframe page itself. */
    
    selectLayoutSetSources (iframes)
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
		
		$(this).attr('src', wantSrc);
	    }
	});
    }

    
    /**************************************************************************/
    /* We have _two_ collections of iframePlaceHolders (one set for wide
       layout and one for tabbed layout), but only _one_ set of actual iframes.
       This moves the iframes to the appropriate placeholders as determined by
       layout. */
    
    selectLayoutMoveFramesTo (layout)
    {
	var iframes = $('.layoutSensitiveIFrame');
	var targets = $('iframePlaceHolder.' + layout);

	for (var i = 0; i < targets.length; ++i)
	{
	    var $target = targets.eq(i);
	    var $iframe = $('#' + $target.attr('iframeId'));
	    $target.html($iframe);
	}

	this.selectLayoutSetSources(iframes);
	
	return;
    }


    /**************************************************************************/
    /* Called to handle the tabbed layout.  We get here only if tabbed is
       required and the wide layout is not already active.  There are two
       possibilities -- the layout may not have been established at all yet,
       or we may previously have been using the wide layout. */
    
    selectLayoutTabbedLayout ()
    {
        var wideLayout = document.getElementById('wideLayoutVisibilityController');
        var tabbedLayout = document.getElementById('tabbedLayoutVisibilityController');
        wideLayout.style.display = 'none';
        tabbedLayout.style.display = 'flex';
	this.selectLayoutMoveFramesTo('tabbedLayout');
	document.getElementById('tabbedLayoutTabSelectorButton_0').click();
    }

    
    /**************************************************************************/
    /* Called to handle the wide layout.  We get here only if wide is required
       and the wide layout is not already active.  There are two possibilities
       -- the layout may not have been established at all yet, or we may
       previously have been using a tabbed layout. */
    
    selectLayoutWideLayout ()
    {
	/**********************************************************************/
	/* Set things up so that everything knows which layout we are using. */
	
        var wideLayout = document.getElementById('wideLayoutVisibilityController');
        var tabbedLayout = document.getElementById('tabbedLayoutVisibilityController');
        wideLayout.style.display = 'flex';
        tabbedLayout.style.display = 'none';
	this.selectLayoutMoveFramesTo('wideLayout');



	/**********************************************************************/
	/* I assume we will _always_ have a leftColumn.  See how many
           placeholders we have.  If one, then we can devote the entire height
           to it.  If two, I set the top one to the default height which has
	   been specified for the iframe which it is to hold, and the bottom
	   one to flex:1.  I assume there will never be more than two. */
	
	function sizeContentsOfColumn (colClass)
	{
	    const column = $(`#wideLayoutVisibilityController ${colClass}`);
	    if (0 == column.length)
		return;
	    
	    const owningColumn = $(`#wideLayoutVisibilityController ${colClass}`).eq(0);
	    const placeHoldersInColumn = $(`#wideLayoutVisibilityController ${colClass} iframePlaceHolder`);
	    if (1 == placeHoldersInColumn.length)
		placeHoldersInColumn.eq(0).css('height', '100%');
	    else
	    {
		const horizontalSeparator = $(`#wideLayoutVisibilityController ${colClass} .horizontalSeparator`);
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

	sizeContentsOfColumn('.leftColumn');
	sizeContentsOfColumn('.rightColumn');



	/**********************************************************************/
	/* Now for the columns.  If we have only one, then it occupies the
	   entire width.  If we have two, the first one is as specified (or
	   50% of the available space less the width of any separator), and the
	   right is whatever is left over. */
	
	const leftColumn = $('#wideLayoutVisibilityController .leftColumn')
	const rightColumn = $('#wideLayoutVisibilityController .rightColumn')
	if (0 == rightColumn.length)
	    leftColumn.css('width', '100%');
	else
	{
	    const verticalSeparator = $(`#wideLayoutVisibilityController .verticalSeparator`);
	    const separatorWidth = 1 == verticalSeparator.length ? verticalSeparator.outerWidth() : 0;
	
	    var defaultWidth = leftColumn.attr('defaultWidth');
	    if (!defaultWidth) defaultWidth = '50%'
	    if (defaultWidth.includes('%'))
	    {
		const containerWidth = $(`#wideLayoutVisibilityController`).width();
		defaultWidth = (containerWidth - separatorWidth) * defaultWidth.replace('%', '') / 100;
		defaultWidth = Math.round((defaultWidth / containerWidth) * 100) + '%'
	    }

	    leftColumn.css('width', defaultWidth);
	    rightColumn.css('flex', '1');
	}
    }


    /**************************************************************************/
    /* Swaps content of two iFrames.  The frames are selected by id.  Their
       ids and content (src) are swapped.

       WARNING: As of Mar 2025, swapping iframes between different locations
       in the DOM will result in their content being reloaded, and state
       information being lost.  See head-of-file comments. */
    
    swapPanes (paneAId, paneBId)
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
    /**************************************************************************/
    /**                                                                      **/
    /**                             Data storage                             **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* There is no absolute guarantee that this class will actually always be
       used in a multiframe environment -- it may be included in files which
       may sometimes be used that way, and sometimes not.  However, where
       something _is_ being used in a multiframe environment, the item
       contained in an iframe may wish to preserve information across reloads.
       The methods here handle that -- if the page which owns the iframes
       makes available a window-level map dataStoreForIframes, this arranges
       to store data in it which can still be accessed after the content of an
       iframe has been reloaded.  The iframe has to associate a unique
       identifier with the data when it stores it, and to supply that same
       identifier in order to access it.  There is no harm in calling the
       methods here even in the absence of the data store, and even when not
       operating in a multi-frame environment -- saveData will simply do
       nothing, and getSavedData will return null. */
    
    /**************************************************************************/
    getSavedData (sourceId, data)
    {
	const dataStore = window.parent.dataStoreForIframes;
	return dataStore ? dataStore.get(window.frameElement.id) : null;
    }


    /**************************************************************************/
    saveData (sourceId, data)
    {
	const dataStore = window.parent.dataStoreForIframes;
	if (dataStore)
	    dataStore.set(window.frameElement.id, data);
    }





    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                     Inter-frame communications                       **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* Used to inform the content of an iframe that the iframe has just been
       activated. */
    
    sendActivation (targetId)
    {
	try
	{
	    var targetFrame = document.getElementById(targetId);
	    if (!targetFrame) targetFrame = window.parent.document.getElementById(targetId);
	    if (!targetFrame)
		return;

	    const receiver = targetFrame.contentWindow['activationEventReceiver'];
	    if (receiver && typeof receiver === 'function')
	    {
		const myId = this.myFrameId();
		receiver(myId);
	    }
	}
	catch (e)
	{
	}
    }

    
    /**************************************************************************/
    /* Sends a message from whatever is running in one frame to whatever is
       running in another.  The target is identified by the id of the iframe
       to which the message is to be sent.

       The processing here can be used even if not operating in a multiframe
       environment -- in that case, the function does nothing. */
    
    sendMessage (targetId, data)
    {
	try
	{
	    var targetFrame = document.getElementById(targetId);
	    if (!targetFrame) targetFrame = window.parent.document.getElementById(targetId);
	    if (!targetFrame)
		return;

	    const receiver = targetFrame.contentWindow['messageReceiver'];
	    if (receiver && typeof receiver === 'function')
		receiver(this.myFrameId(), data);
	}
	catch (e)
	{
	}
    }


    
    /**************************************************************************/
    /* Changes the URL in one of the iFrames.  The target is identified by the
       id of the frame which is to be altered.  This can be called even when
       not operating in a multiframe environment or if the target frame does
       not exist.  In those cases it does nothing. */
    
    setUrl (targetId, url)
    {
	var targetFrame = document.getElementById(targetId);
	if (!targetFrame) targetFrame = window.parent.document.getElementById(targetId);
	if (!targetFrame)
	    return;

	targetFrame.src = url;
        this.suppressStepHeaderIfNecessary(targetFrame);
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

       There is an <a> tag in the standard STEPBible pane -- #resizeButton
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
    
    suppressStepHeaderIfNecessary (frame)
    {
	const suppressStepHeader = frame.getAttribute('suppressStepHeader');
	if (null == suppressStepHeader || suppressStepHeader.toLowerCase() != 'yes')
	    return;
	
	const that = this; // For debug.
	
	frame.addEventListener('load', function () {
	    const resizeButton = this.contentWindow.document.getElementById('resizeButton');
	    const navBar = this.contentWindow.document.getElementById('stepnavbar');

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

    



    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                              Utilities                               **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* If you're using the present class, this should be pretty redundant,
       because we always _should_ be operating in an iframe. */

    amInIframe ()
    {
	try
	{
            return window.self !== window.top;
	}
	catch (e)
	{
            return true;
	}
    }
	

    /**************************************************************************/
    /* Given something like 'myPage.html' returns a full URL for it. */
    
    getFullUrl (page)
    {
	var urlPart1 = window.location.origin;
	var pos = window.location.href.indexOf(this.UrlBase);
	urlPart1 = window.location.href.substr(0, pos);
	return urlPart1 + this.UrlBase + page;
    }


    /**************************************************************************/
    /* You need to be careful with innerWidth.  For starters, it includes the
       width of any scrollbar, so it may not always be what you want -- although
       here, where our only interest is whether we have a large or a small
       screen, it probably doesn't matter hugely.

       More to the point, though, if you just use window.innerWidth, then the
       value you get is, in the case of things running in an iframe, the
       width of the iframe, and that's no good when our concern is how big
       the overall window is. */
    
    getMasterWindowWidth ()
    {
	if (this.amInIframe())
	    return window.parent.innerWidth;
	else
	    return window.innerWidth;
    }

    
    /**************************************************************************/
    isLargeScreen ()
    {
	return this.getMasterWindowWidth() >= this.WidthThreshold;
    }

    
    /**************************************************************************/
    /* Gets the id of the current frame.  Also copes with being at the top
       level rather than in a frame, in which case it returns null. */
    
    myFrameId ()
    {
	try
	{
	    return window.frameElement.id;
	}
	catch (e)
	{
	    return null;
	}
    }


    /**************************************************************************/
    /* Checks if there is a frame / tag with the given name. */
    
    targetExists (targetName)
    {
	if (this.amInIframe())
	    return window.parent.document.getElementById(targetName).length > 0;
	else
	    return false;
    }
}

const MultiframeController = new ClassMultiframeController();


/******************************************************************************/
/* Handles open-dialog-tab clicks.  I'd far rather have this as part of the
   above class, but it's a bit painful trying to sort out the syntax etc to
   do that. */

function multiframeControllerOpenDialogTab (event, index)
{
    const tabbedLayoutContent = document.getElementsByClassName('tabbedLayoutIframeHolder');
    for (i = 0; i < tabbedLayoutContent.length; i++)
	tabbedLayoutContent[i].style.display = 'none';
    document.getElementById(`tabbedLayoutIframeHolder_${index}`).style.display = 'flex';
    MultiframeController.sendActivation(document.querySelector(`iframe[ix='${index}']`).id);
			
    const tabButtons = document.getElementsByClassName('tabButton');
    for (i = 0; i < tabButtons.length; i++)
	tabButtons[i].classList.remove('tabButtonSelected');
    document.getElementById(`tabbedLayoutTabSelectorButton_${index}`).classList.add('tabButtonSelected');
}
