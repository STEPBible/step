/******************************************************************************/
/* Handles a table combined with a search box which lets you select an item
   from the box.





   Summary of functionality
   =============================================================================

   This permits you to have a search box and an associated table which lists
   items the user may want to search for.

   The code here was originally written with the assumption that the table
   would go in a window -- probably an iframe -- of its own.  At the time of
   writing it is no longer being used exclusively in this way, but I'll start
   off by describing things as if it were.

   The anticipated layout is something like this:

     +----------------------------------------------------------------------+
     +                                                                      +
     +                         Optional headers etc                         +
     +                                                                      +
     +----------------------------------------------------------------------+

     +----------------------------------------------------------------------+
     +                                                                      +
     +                              Search box                              +
     +                                                                      +
     +----------------------------------------------------------------------+

     +----------------------------------------------------------------------+
     +                                                                      +
     +                                Table                                 +
     +                                                                      +
     +----------------------------------------------------------------------+


   The code was written to work in a situation where we had both headers and
   a search box, and where the two between them were of fixed height -- and
   we then wanted the table to expand to fill the remaining vertical space.
   (And the code has been tested largely in that configuration.)

   In fact, you can use the facilities here in a number of different modes,
   so long as you take into account the probability that not all of them
   have been tested:

   - You can omit the search box and just have the table.  In this case
     the user makes selections by clicking on rows in the table.

   - You can have both the search box and the table.  The user can make
     choices by clicking on rows in the table.  Alternatively, they can
     type into the search box, in which case the processing calls a
     routine which you supply to determine which rows match, and the
     table is updated dynamically to show only those rows which do match.
     If they get down to a single matching row, then hitting RETURN or
     TAB will select it; or alternatively they can select by clicking on
     one of the displayed rows.

   - Where you have both the search box and the table, there are a few
     additional options.  You can choose to have the table permanently
     displayed, or you can choose to have it appear only when the user
     clicks in the search box (and disappear again once a selection
     has been made).  And if you opt to have it displayed this way, you
     can also have the selected option continue to be displayed once it
     has been selected (to give visual feedback), or you can have it
     disappear (which might be appropriate if other changes will give
     obvious visual feedback).


   As regards the table itself, you can specify a height for it yourself,
   or you can have it accommodate itself automatically to the space
   available after taking the headers and search box into account.  In
   this latter case, the size of the table is determined at initialsation
   and is not subsequently recalculated.

   You can pre-populate the table yourself, or you can provide to the present
   class a function which it can call to obtain the body content -- more
   details below.

   I mentioned earlier that the discussion to date would be based upon the
   idea of the table being on its own in its own window -- probably in its own
   iframe.  And I said also that it is no longer exclusively being used that
   way.  In fact I now have it within a div which forms a pop-up in the
   genealogy application, with other material after it, and that seems to work
   fine.





   HTML
   =============================================================================

   The example below is drawn from j_peopleIndex.html, and has been
   simplified.  You may want to look there to see things in more detail.

     <!-- Header -->
     <div id='header'>
       <h2 style='margin-top: 6px; margin-bottom: 0;'>
         People in the Bible
         <span id='smallScreenInfo' style='font-size:small'></span> <!-- Additional information is added under control of Javascript on small screens. -->
       </h2>


       <!-- Search box. -->
       <div style='display: flex; align-items: center; padding-bottom: 5px;'>
         <textarea id='peopleSearchBox' class='jframework-searchBox' placeholder='Search: Type the start of a name here ...'></textarea>
       </div>
     </div> <!-- End of header. -->


     <!-- Table from which items are selected. -->

     <div id='peopleTableContainer' class='jframework-searchTableContainer'>
       <table class='jframework-searchTable jframework-standardText'>
         <colgroup><col span='1'><col span='1'></colgroup>
         <tbody></tbody>
       </table>
     </div>


   The h2 portion constitues the optional header mentioned above.  It, and the
   search box, are probably best wrapped in a div, which here I have labelled
   'header', although the actual id is relevant.  (It will need to _have_ an
   id though, because you need to be able to identify it to the processing if
   you want the processing to expand the table to fill the available space
   under the header.)

   If you want a search box, you need a textarea to serve the purpose.  In the
   example above, it is inside a div because at one time I wanted to be able
   to put a magnifying glass alongside it, but that's not essential.  What
   _is_ essential is that you give it a unique id, and that you include
   jframework-searchBox amongst its classes.

   And finally you need the table.  This _must_ go into a containing div to
   which you assign a unique id, and which is of class jframework-searchTableContainer.
   Within this you need the table, which must be of class jframework-searchTable.

   The colgroup is optional.  I wanted it here because the table needed to have
   more than one column, of differing widths.  (No widths are shown above
   because the widths are set programmatically.)

   The tbody can be empty, as here, if you supply to the present class a
   function to supply it with the content of the tbody.  Alternatively you
   can pre-populated it.





   Javascript and imports
   =============================================================================

   In your HTML file you need:

    <link href="/css/J_AppsCss/J_Framework/j_framework.common.css" rel="stylesheet" media="screen"/>
    <link href="/css/J_AppsCss/J_Framework/j_framework.tableWithSearchBox.css" rel="stylesheet" media="screen"/>
    <script src="/js/J_AppsJs/J_Framework/j_framework.tableWithSearchBox.js" type="text/javascript"></script>


   Unless you need to work with more than one instance, your code can make use
   of the JFrameworkTableWithSearchBox instance defined here.

   You configure this via its constructor.  Details of the required arguments
   are given within the code below.

   After that, you call initialise; and after that the instance itself does the
   rest without further intervention from you.





   Apologies
   =============================================================================

   There's a bit of a mess below, because I have a combination of jQuery and
   non-jQuery code.  I did intend to get rid of the jQuery code, but it turned
   out to be difficult to make the keyboard handling work properly without it.
   Having therefore been forced to use it there, I rather gave up the intent
   of expunging it elsewhere.  So there isn't much jQuery, but there is some.
*/
    
export class ClassJFrameworkTableWithSearchBox
{
    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Public                                 **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /*
       args should be something like (order does not matter):

	 const tableHandlerArgs =
	 {
	     headerId: 'aaa' or null / omitted
	     searchBoxId: 'bbb',
	     tableContainerId: 'ccc',
	     bodyBuilderFn: someFunctionOrNullIfPrepopulated,
	     clickHandlerFn: someFunction,
	     rowMatcherFn: rowMatcherFn or integer or null / omitted,
	     hideTableWhenNotInUse: trueOrFalse,
	     keepSelectedRowVisible: trueOrFalse,
	     owningIframe: name or null / omitted
	 };


       All ids should be supplied devoid of '#'.  Some arguments are optional.
       Where this is the case, they may either be omitted or may be supplied as
       null.

       The arguments are as follows:

       - headerId is the id of the header block.  If supplied, it is assumed
         to be of fixed height, and the table is expanded to fill the vertical
	 space below the header.  If not supplied, the table is not expanded,
         and it is your responsibility to give it a _fixed_ height.

       - searchBoxId is the id of the search-box text area.  If omitted,
         searching is not supported, and the user can only make selections
	 by clicking in the table (in which case, hideTableWhenNotInUse is
         taken as false irrespective of what has actually been supplied).
         Also in that case, rowMatcherFn may be null or omitted (and is
	 ignored if supplied).

       - tableContainerId: The id of the container which holds the table,

       - bodyBuilderFn: A function which receives no argument and returns,
         as a text string, the full content to be inserted into the tbody.
         If null, I assume the table is already populated.  As an example,
	 for the peopleIndex functionality, I return a lot of srings like
	 the following, all concatenated:

	   "<tr><td class='tb_col tb_col_1 clickable'>" + displayName + '</td>' +
	     "<td class='tb_col tb_col_2 clickable'>" + shortDescriptionWhere + shortDescription + '</td>' +
	   "</tr>";

         bodyBuilderFn may be omitted if the table is already populated.


       - clickHandlerFn is called when the user clicks in a table cell (or
         hits RETURN to select the one selected cell when searching).  It
         receives the cell itself and the zero-based column number of the
         cell.

       - rowMatcherFn is a function which finds all rows in the table
         matching the current search string, and is used to filter the table
         so that only those rows are visible.

	 rowMatcherFn is used only if there is a search box.  Options are:

         . A function which you yourself supply (see defaultRowMatcherFn to
           get an idea of what that should look like).

	 . Null or omitted.  In this case defaultRowMatcherFn is used.
	   This selects rows whose leftmost column starts with the
	   current content of the search box (case-insensitive).  But see
	   also the next bullet point ...

	 . An integer.  In this case, defaultRowMatcherFn, but the match
	   is against the content of the given column (zero-based).


       - hideTableWhenNotInUse: If true, the table is hidden when not in use,
         and displayed only in the course of the user making a selection.

       - keepSelectedRowVisible: This is relevant only when
         hideTableWhenNotInUse is true.  In this case it determines whether
	 the table is completely hidden after a selection has been made, or
	 whether the selected row remains visible.  Having it remain visible
	 gives you visual feedback of the selection, but you might want to
	 hide it if the processing applied to the selection makes it obvious
	 what was chosen.
    */

    constructor (args)
    {
	/**********************************************************************/
	this._headerHeight = -1;
	if (args.headerId) this._headerHeight = document.querySelector('#' + args.headerId).offsetHeight
	


	/**********************************************************************/
	this._searchBoxId = args.searchBoxId;
	this._bodyBuilderFn = args.bodyBuilderFn;
	this._clickHandlerFn = args.clickHandlerFn;
	this._rowMatcherFn = 'rowMatcherFn' in args ? args.rowMatcherFn : this._defaultRowMatcherFn;
	this._hideTableWhenNotInUse = args.hideTableWhenNotInUse;
	this._keepSelectedRowVisible = 'keepSelectedRowVisible' in args ? args.keepSelectedRowVisible : true;



	/**********************************************************************/
	this._tableContainer = document.querySelector('#' + args.tableContainerId);
	this._tableBody = document.querySelector('#' + args.tableContainerId + '  tbody');
	this._searchBox = this._searchBoxId ? $('#' + this._searchBoxId) : null;



	/**********************************************************************/
	this._rowMatcherColumn = 1;
	if (Number.isInteger(this._rowMatcherFn))
	{
	    this._rowMatcherColumn = 1 + this._rowMatcherFn;
	    this._rowMatcherFn = this._defaultRowMatcherFn;
	}



	/**********************************************************************/
	if (window.self === window.top)
	    this._parentIframeId = null;
	else
	{
	    const iFrame = window.frameElement;
	    this._parentIframeId = iFrame ? iFrame.id : '?';
	}

	

	/**********************************************************************/
	if (null === args.searchBoxId) this._hideTableWhenNotInUse = false;
    }


    /**************************************************************************/
    /* Hides the table and blanks out the content of the search box. */
    
    hideTable ()
    {
	this._showSelectedTableRowOnly(null);
	this._accommodateOwnerToTable(this._SHOW_SELECTED_OPTION);
    }

    
    /**************************************************************************/
    /* Highlights a single row, and unhighlights all others.  This needs to be
       public in case there is an initial selection which has to be
       highlighted. */
    
    highlightSelection (selection)
    {
	/**********************************************************************/
	/* Select the containing row. */
	
	const row = 'tr' == selection.tagName ? selection : selection.closest('tr');
	this._rowLastSelected = row;
	this._rowLastSelectedRelativeOffset = row.offsetTop - this._tableContainer.scrollTop;
	


	/**********************************************************************/
	/* Remove any existing highlighting. */
	
	const tbody = row.closest('tbody');
	for (const r of tbody.rows)
	    for (const c of r.cells)
		c.classList.remove('jframework-tableWithSearchBox-highlightTableEntry');



	/**********************************************************************/
	/* Highlight target row. */
	
	for (var i = 0; i < row.cells.length; ++i)
	    $(row.cells[i]).addClass('jframework-tableWithSearchBox-highlightTableEntry');



	/**********************************************************************/
	/* Limit the display to just the selected row. */
	
	this._showSelectedTableRowOnly(row);
	this._accommodateOwnerToTable(this._SHOW_SELECTED_OPTION);
    }


    /**************************************************************************/
    /* Constructs the table. */

    initialise ()
    {
	/**********************************************************************/
	this._selectedRow = null;



	/**********************************************************************/
	/* The caller may populate the table themselves.  Alternatively, they
	   may supply a function to do it. */
	
	if (null !== this._bodyBuilderFn) // Oct 20205: Was checking for a null being returned from calling the function, rather than checking whether the function variable itself was null.
	{
	    const rowsHtml = this._bodyBuilderFn();
	    this._tableBody.innerHTML = rowsHtml;
	}
	


	/**********************************************************************/
	this._addClickHandlers();
	if (null != this._searchBoxId)
	    this._addKeyboardInputHandler();



	/**********************************************************************/
	/* Arrange the layout so as to accommodate any header. */
	
	if (this._headerHeight >= 0)
	    this.setTableSizeOmitting(this._headerHeight);



	/**********************************************************************/
	this._tableContainer.style.display = this._hideTableWhenNotInUse ? 'none' : 'block';
    }


    /**************************************************************************/
    /* Called if the owning app loses focus.  The main purpose of this is to
       hide the table if we're to do so when it's not in use. */
    
    owningAppLostFocus ()
    {
	this._ditchSearchBoxContentAndHideTableIfAppropriate();
    }



    /**************************************************************************/
    /* Word of caution here.  Things may have been configured to hide the table
       when not in use (and indeed they are configured like that presently).
       When the user clicks in the search box, it causes the iframe to be
       resized, which will invoke the onresize code.  You need to be very
       careful that that code doesn't screw up the attempt to resize the
       iframe.  I _think_ using this._currentTableVisibilityachieves this. */

    redraw ()
    {
	//this._setTableVisibility(this._currentTableVisibility, this._selectedRow);
    }

    
    /**************************************************************************/
    /* Allows the caller to establish an initial size for the table when the
       table appears in a window all of its own and the caller wants the table
       to occupy the whole height of that window except for any space already
       allocated to the header. */
    
    setTableSizeOmitting (verticalSpaceAlreadyOccupied)
    {
        const fullHeight = $(window).height();
        const remainingHeight = Math.floor((fullHeight - verticalSpaceAlreadyOccupied) * 0.98);
	this._tableContainer.style.height = remainingHeight + 'px';
	this._tableContainer.style.maxHeight = remainingHeight + 'px';
    }





    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Private                                **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _SHOW_SELECTED_OPTION = 0;
    _SHOW_AVAILABLE_OPTIONS = 1;

    
    /**************************************************************************/
    /* Called the selection table has been altered.

       This may be called under either of two circumstances:

       - If 'reason' is _SHOW_SELECTED_OPTION, the method is being
         called because the user has selected a single item, and we
         may or may not want to arrange things so that just that
         single item is visible, and resize the containing frame to
         accommodate just the one item.

       - If 'reason' is _SHOW_AVAILABLE_OPTIONS, the method is being
         called to show a list of items which are available for
         selection.


       Unless _hideTableWhenNotInUse is set, there is nothing for the method
       to do, because the table is being permanently displayed.  Equally there
       is nothing to do unless the table is being shown in an iframe.
       Otherwise ...

       The two alternatives differ only in whether the table is
       displayed or not.  With _SHOW_AVAILABLE_OPTIONS it is _always_
       displayed, because it needs to be visible in order fo the user
       to make selections.

       With _SHOW_SELECTED_OPTION, the single selection is shown only
       if _keepSelectedRowVisible is true -- otherwise the table is
       completely
       hidden. */
    
    _accommodateOwnerToTable (reason)
    {
        /**********************************************************************/
	if (!this._hideTableWhenNotInUse)
	    return;

	if (!this._parentIframeId)
	    return;



        /**********************************************************************/
	try
	{
	    var containerHeight = (this._keepSelectedRowVisible || this._SHOW_AVAILABLE_OPTIONS == reason) ? this._tableContainer.offsetHeight : 0;

	    if (containerHeight <= 0)
		this._tableContainer.style.display = 'none';
	    else
		this._tableContainer.style.display = 'block';
	    
	    JFrameworkMultiframeCommunicationsSlave.sendMessageTo(null, { 'targetIframe': this._parentIframeId,
									  'resizeIframe': Number(this._headerHeight) + containerHeight + 10,
									  'reason': 'resizeSearchTable' });

	    if (containerHeight > 0)
	    {
		const me = this;
		requestAnimationFrame(() => {
		    me._tableContainer.height = containerHeight + 'px';
		    me._tableContainer.overflowY = 'auto';
		});
	    }
	}
	catch (e)
	{
	}
    }


    /**************************************************************************/
    /* Adds click handlers throughout the table. */

    _addClickHandlers ()
    {
	/**********************************************************************/
        var tblHandler = this;


	/**********************************************************************/
	/* Apply a click handler to the entire table, but arrange for it to
	   determine which cell was clicked, and then respond accordingly. */
	
	const clickHandlerFn = this._clickHandlerFn.bind(this);
	const highlightSelection = this.highlightSelection.bind(this);

	this._tableBody.addEventListener('click', function (event) {
	    const cell = event.target.closest('td, th');
	    if (cell)
	    {
		highlightSelection(cell);
		clickHandlerFn(cell, cell.cellIndex);
	    }
	});




	/**********************************************************************/
	/* If the user clicks anywhere outside of the search box and the table,
	   hide the table. */
	
	document.addEventListener('click', function(event) {
	    try // This is in case the table is used within a modal dialog and the click event closes the modal before we get here properly.
	    {
		if (tblHandler._tableContainer.contains(event.target))
		    return;
		
		if (tblHandler._searchBox && tblHandler._searchBox[0].contains(event.target))
		    return;

		tblHandler._searchBox.blur();
		tblHandler._previousSearchString = tblHandler._searchBox[0].value;
	    }
	    catch (e)
	    {
	    }
	});
    }


    /**************************************************************************/
    /* A default function to check if a given row matches user input.  This
       looks to see if the leftmost cell of the row starts with the user input
       (case-insensitive).  Normally we'd expect the caller to provide their
       own more sophisticated matching. */
    
    _defaultRowMatcherFn (row, userInput)
    {
	const entries = row.find('.tb_col_' + this._rowMatcherColumn).html().split('<br>');
	userInput = userInput.toLowerCase();
		
	for (var ix = 0; ix < entries.length; ++ix)
	{
	    var matchAgainst = entries[ix].toLowerCase();
	    if (matchAgainst.startsWith(userInput)) return true;
	}

	return false;
    }


    /**************************************************************************/
    /* Restores table to its visible state. */
    
    _restoreTable ()
    {
	this._tableContainer.style.display = 'block';
	this._tableContainer.style.overflowY = 'auto';
	//this._tableContainer.style.height = this._tableContainer.height; // Restore the table to its full permitted height.
    }

    
    /**************************************************************************/
    /* Scrolls the table to ensure that the given row is visible. */

    _scrollTableToRow (row)
    {
	this._tableContainer.scrollTop = row.offsetTop;
    }


    /**************************************************************************/
    /* Shows all rows.  This doesn't necessarily mean that all are visible at
       the same time, because there may well not be enough space, but each is
       _potentially_ visible, and can be reached by scrolling.

       We also set the cursor to be a pointer throughout the table, to indicate
       that all cells are mouseable. */

    _showAllTableRows ()
    {
        /**********************************************************************/
	this._restoreTable();



        /**********************************************************************/
        for (const row of this._tableBody.rows)
	    row.style.display = '';



        /**********************************************************************/
	this._tableBody.style.cursor = 'pointer';



	/*********************************************************************/
	this._accommodateOwnerToTable(this._SHOW_AVAILABLE_OPTIONS);
    }


    /**************************************************************************/
    /* Shows just a single row. */
    
    _showSelectedTableRowOnly (selectedRow)
    {
	/*********************************************************************/
	this._selectedRow = selectedRow;
	this._tableContainer.style.height = 'auto';
	this._tableContainer.style.cursor = 'default';
	this._tableContainer.style.overflowY = 'hidden';


	
	/*********************************************************************/
	/* Hide all rows except the selected one (assuming there _is_ a
	   selected one). */
	
	const tbody = this._tableContainer.querySelector('tbody');
	for (const r of tbody.rows)
	    r.style.display = (r === selectedRow) ? '' : 'none';



	/*********************************************************************/
	this._accommodateOwnerToTable(this._SHOW_SELECTED_OPTION);
    }





    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                          Keyboard handling                           **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    _addKeyboardInputHandler ()
    {
	/**********************************************************************/
	const tblHandler = this;
	const keyboardInputHandler = this._keyboardInputHandler.bind(this);
        const inputHandler = function (e) { keyboardInputHandler(e) };
	


	/**********************************************************************/
	this._searchBox.on('keydown', function(e) {
	    const enterKeyOrEquivalent = 'Enter' === e.key || 'Tab' === e.key;
	    if (enterKeyOrEquivalent) // I want enter and Tab/Backtab to indicate an attempt at selection, not to move out of the search box.
	    {
		e.preventDefault();
		e.stopPropagation();
	    }

	    if ('Escape' === e.key) // Remove focus from the box and throw away the default setting.
	    {
		tblHandler._ditchSearchBoxContentAndHideTableIfAppropriate();
		return;
	    }
	    
	    this._timer && clearTimeout(this._timer); // Don't want to respond to typing too quickly.
	    this._timer = setTimeout(inputHandler, 300, e);
	});



	/**********************************************************************/
	this._searchBox.on('click', function(event) {
	    event.stopPropagation();

	    tblHandler._searchBox[0].value = tblHandler._previousSearchString; // Use last value as initial default.

	    if ('' === tblHandler._searchBox[0].value)
		tblHandler._showAllTableRows();
	    else
	    {
		tblHandler._tableContainer.style.overflowY = 'auto';
		tblHandler._filterTable(tblHandler._searchBox[0].value, tblHandler); // Filter to select stuff in line with the content of the search box as it stood when we were last here.
		if(tblHandler._rowLastSelected)
		    requestAnimationFrame(() => { // Attempt to position the row so that it's in the same place vertically as before.
			tblHandler._tableContainer.scrollTop = tblHandler._rowLastSelected.offsetTop - tblHandler._rowLastSelectedRelativeOffset;
		    });	
	    }
	});
    }


    /**************************************************************************/
    /* Originally this code was run only when Esc was hit in the search box,
       which was taken as indicating that the user wanted to ditch any input,
       and therefore was also happy for the search table to vanish (assuming
       things are configured to make that possible).  I have hived it off to
       a separate method so it can also be called if the search box had focus
       and the user then clicks in an app other than the search app.  This
       will ditch any putative input, which may not be entirely ideal, but
       it will be a bit difficult to do better. */

    _ditchSearchBoxContentAndHideTableIfAppropriate ()
    {
	this._searchBox[0].blur();
	this._previousSearchString = '';
	this._searchBox[0].value = '';
	this.hideTable();
    }


    /**************************************************************************/
    /* Filters the table to show only things which match the user input.
       Returns the single visible row if precisely one row is visible;
       otherwise returns null. */
    
    _filterTable (userInput, tblHandler)
    {
	const rows = tblHandler._tableBody.rows;
	for (const row of rows) row.style.display = 'none'; // Hide everything until we know what is to be displayed.
	var visibleRows = 0;
	var theSingleRow = null;
        Array.from(rows).filter(row => tblHandler._rowMatcherFn($(row), userInput)).forEach( row => { visibleRows++; theSingleRow = row; $(row)[0].style.display = ''; } ); // Reveal matching rows only.
	tblHandler._restoreTable(); 
	this._scrollTableToRow(rows[0]);
	tblHandler._accommodateOwnerToTable(this._SHOW_AVAILABLE_OPTIONS);
	return 1 == visibleRows ? theSingleRow : null;
    }


    /**************************************************************************/
    /* Handles the search box input.  In particular, filters the table in
       accordance with the characters typed to date. */
    
    _keyboardInputHandler (e)
    {
	const me = this;
	
	function inputHandler (e)
	{
	    const enterKeyOrEquivalent = 'Enter' === e.key || 'Tab' === e.key;
            const inputBox = me._searchBox;
	    const tblHandler = me;
            var userInput = inputBox.val();
	    me._previousSearchString = userInput;
	    

            if ((userInput.slice(-1) === '\n') || (e.originalEvent.inputType === 'insertLineBreak'))
            {
		userInput = userInput.replace(/[\n\r]/g, '').replace(/\t/g, ' ').replace(/\s\s+/g, ' ').replace(/^\s+/g, '');
		me._previousSearchString = userInput;
		inputBox.val(userInput);
            }

	    me._previousSearchString = userInput;
	    const theSingleVisibleRow = me._filterTable(userInput, tblHandler);
	    if (null !== theSingleVisibleRow && enterKeyOrEquivalent)
	    {
		theSingleVisibleRow.cells[0].click();
		tblHandler._showSelectedTableRowOnly(theSingleVisibleRow);
		tblHandler._accommodateOwnerToTable(me._SHOW_SELECTED_OPTION);
		tblHandler._searchBox.blur();
		tblHandler._previousSearchString = tblHandler._searchBox[0].value;
		    return;
	    }
	    
	    tblHandler._accommodateOwnerToTable(me._SHOW_AVAILABLE_OPTIONS);
	}

	var debounceTimer;
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => { inputHandler(e); }, 100);
    }


    /**************************************************************************/
    _previousSearchString = '';
}
