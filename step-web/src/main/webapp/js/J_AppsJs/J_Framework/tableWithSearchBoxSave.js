/******************************************************************************/
/* Handles a table combined with a search box which lets you select an item
   from the box.





   Summary of functionality
   =============================================================================

   This permits you to have a search box and an associated table which lists
   items the user may want to search for.

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

   - You can skip the search box and just have the table.  In this case
     the user makes selections by clicking on rows in the table.

   - You can have both the search box and the table.  The user can make
     choices by clicking on rows in the table.  Alternatively, they can
     type into the search box, in which case the processing calls a
     routine which you supply to determine which rows match, and the
     table is updated dynamically to show only those rows which do match.
     If they get down to a single matching row, then hitting RETURN will
     select it; or alternatively they can select by clicking on one of
     the displayed rows.

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
   available after taking the headers and searchbox into account.  In
   this latter case, the size of the table is determined at initialsation
   and is not subsequently recalculated.

   You can pre-populate the table yourself, or you can provide to the present
   class a function which it can call to obtain the body content -- more
   details below.





   HTML
   =============================================================================

   The example below is drawn from j_peopleIndex.html, and has been
   simplified.  You may want to look there to see things in more detail.

     <!-- Header -->
     <div id='header'>
       <h2 style='margin-top: 6px; margin-bottom: 0;'>
         People in the Bible
         <span id='smallScreenInfo' style='font-size:small'></span> <!-- Additional information here is added under control of Javascript on small screens. -->
       </h2>


       <!-- Search box. -->
       <div style='display: flex; align-items: center; padding-bottom: 5px;'>
         <span style='font-size:xxx-large'>&#x1F50D;</span> <!-- Magnifying glass. -->
         <textarea id='peopleSearchBox' class='jframework-searchBox' placeholder='Search ...'></textarea>
       </div>
     </div> <!-- End of header. -->


     <!-- Table from which items are selected. -->
     <div id='peopleTableContainer' class='jframework-searchTableContainer'>
       <table class='jframework-searchTable'>
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
   example above, it is inside a div because I want to be able to put a magnifying
   glass alongside it, but that's not essential.  What _is_ essential is that you
   give it a unique id, and that you include jframework-searchBox amongst its
   classes.

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
	     rowMatcherFn: rowMatcherFn,
	     hideTableWhenNotInUse: trueOrFalse,
	     keepSelectedRowVisible: trueOrFalse,
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

       - rowMatcherFn is the function used to find row(s) which match a
         given search string.  It receives a row element and the current
         search string, and should return true / false according to whether
         that row is deemed to match.  rowMatcherFn may be null if
         seachBoxId is null.  You can supply your own, or you can use one of
	 the built-in ones available here (or you can when I get round to
	 writing any ...).

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
	this._headerHeight = -1;
	if (args.headerId) this._headerHeight = document.querySelector('#' + args.headerId).offsetHeight
	
	this._searchBoxId = args.searchBoxId;
	this._bodyBuilderFn = args.bodyBuilderFn;
	this._clickHandlerFn = args.clickHandlerFn;
	this._rowMatcherFn = args.rowMatcherFn;
	this._hideTableWhenNotInUse = args.hideTableWhenNotInUse;
	this._keepSelectedRowVisible = args.keepSelectedRowVisible ? args.keepSelectedRowVisible : true;

	this._tableContainer = $('#' + args.tableContainerId);
	this._tableBody = $('#' + args.tableContainerId + '  tbody');
	
	if (null === args.searchBoxId) this._hideTableWhenNotInUse = false;
    }


    /**************************************************************************/
    highlightSelection (selection)
    {
	const row = 'tr' == selection.tagName ? selection : selection.closest('tr');
	
	// Remove any existing highlighting.
	const tbody = row.closest('tbody');
	for (const r of tbody.rows)
	    for (const c of r.cells)
		c.style.background = 'white';



	// Highlight target row.
	for (var i = 0; i < row.cells.length; ++i)
	    $(row.cells[i]).css('background', '#FFFFC0');

	this._setTableVisibility(false, row);
    }


    /**************************************************************************/
    /* Constructs the table. */

    initialise ()
    {
	if (null !== this._bodyBuilderFn())
	{
	    this._tableBody.empty();
	    const rowsHtml = this._bodyBuilderFn();
	    this._tableBody.append(rowsHtml);
	}
	
	this._addClickHandlers();
	if (null != this._searchBoxId) this._addKeyboardInputHandler();

	if (this._headerHeight >= 0)
	    this.setTableSizeOmitting(this._headerHeight);

	this._tableContainerHeight = this._tableBody.closest('.jframework-searchTableContainer').outerHeight();// + 10; // 10 is a fidge factor.  Without it we loose the bottom border of the table.

	if (this._hideTableWhenNotInUse)
	    this._setTableVisibility(false);
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
	this._setTableVisibility(this._currentTableVisibility, this._selectedRow);
    }

    
    /**************************************************************************/
    setTableSizeOmitting (verticalSpaceAlreadyOccupied)
    {
        const fullHeight = $(window).height();
        const remainingHeight = Math.floor((fullHeight - verticalSpaceAlreadyOccupied) * 0.98);
        this._tableContainer.css('height', remainingHeight + 'px').css('max-height', remainingHeight + 'px');
    }






    /**************************************************************************/
    /**************************************************************************/
    /**                                                                      **/
    /**                               Private                                **/
    /**                                                                      **/
    /**************************************************************************/
    /**************************************************************************/

    /**************************************************************************/
    /* Adds click handlers throughout the table. */

    _addClickHandlers ()
    {
	/**********************************************************************/
        var rows = this._tableBody.find('tr');
        var tblHandler = this;

        for (var i = 0; i < rows.length; ++i)
        {
            rows[i].i = i;
	    for (var j = 0; j < rows[i].cells.length; ++j)
		rows[i].cells[j].addEventListener('click', function()
						  {
						    tblHandler.highlightSelection(this);
						    tblHandler._clickHandlerFn(this, j);
						  },
						  false);
        }



	/**********************************************************************/
	/* If the user clicks anywhere outside of the search box and the table,
	   hide the table. */
	
	document.addEventListener('click', function(event) {
	    try // This is in case the table is used within a modal dialog and the click event closes the modal before we get here properly.
	    {
		const searchBox = tblHandler._searchBoxId ? $('#' + tblHandler._searchBoxId) : null;
		const table = document.querySelector('.jframework-searchTableContainer');

		if (table.contains(event.target))
		    return;
		
		if (searchBox && searchBox[0].contains(event.target))
		    return;

		tblHandler._exitFromSearchBox(searchBox);
	    }
	    catch (e)
	    {
	    }
	});
    }


    /**************************************************************************/
    _addKeyboardInputHandler ()
    {
	const tblHandler = this;
        const inputHandler = function (e) { tblHandler._keyboardInputHandler(e) };
	const searchBox = $('#' + this._searchBoxId);

	searchBox.on('keydown', function(e) {
	    const enterKeyOrEquivalent = 'Enter' === e.key || 'Tab' === e.key;
	    if (enterKeyOrEquivalent) // I want enter and Tab/Backtab to indicate an attempt at selection, not to move out of the search box.
	    {
		e.preventDefault();
		e.stopPropagation();
	    }

	    if ('Escape' === e.key)
	    {
		tblHandler._exitFromSearchBox(searchBox);
		return;
	    }
	    
	    this._timer && clearTimeout(this._timer);
	    this._timer = setTimeout(inputHandler, 300, e);
	});

	searchBox.on('click', function(event) {
	    event.stopPropagation();
	    searchBox[0].value = '';
	    tblHandler._setTableVisibility(true);
	});
    }


    /**************************************************************************/
    _exitFromSearchBox (searchBox)
    {
	searchBox.blur();
	searchBox[0].value = '';
	this._setTableVisibility(false, this._selectedRow);
    }

    
    /**************************************************************************/
    /* Handles the search box input. */
    
    _keyboardInputHandler (e)
    {
	const enterKeyOrEquivalent = 'Enter' === e.key || 'Tab' === e.key;
        const inputBox = $('#' + this._searchBoxId)
	const tblHandler = this;
        var userInput = inputBox.val();

        if ((userInput.slice(-1) === '\n') || (e.originalEvent.inputType === 'insertLineBreak'))
        {
	    userInput = userInput.replace(/[\n\r]/g, '').replace(/\t/g, ' ').replace(/\s\s+/g, ' ').replace(/^\s+/g, '');
	    inputBox.val(userInput);
        }

        if ((typeof userInput !== 'string') || (userInput.length == 0))
	    $('tr').show();
        else
        {
	    const rows = this._tableBody.find('tr');
	    rows.hide();
	    var visibleRows = 0;
	    var theRow = null;
            Array.from(rows).filter(row => tblHandler._rowMatcherFn($(row), userInput)).forEach( row => { visibleRows++; theRow = row; $(row).show() } );
	    this._scrollTableToRow(0, false);
	    if (1 == visibleRows && enterKeyOrEquivalent)
	    {
		theRow.cells[0].click();
		if (tblHandler._hideTableWhenNotInUse)
		    tblHandler._setTableVisibility(false, theRow);
	    }
        }
    }


    /**************************************************************************/
    /* Scrolls the table to ensure that the given row is visible.  andHighlight
       is optional, default = true.  If set, the row is highlighted. */

    _scrollTableToRow (rowNo, andHighlight)
    {
	const rows = this._tableBody.find('tr');
	if (rowNo < 0 || rowNo >= rows.length)
	    return;
    
	const row = rows[rowNo];
	
	// Calculate the position to scroll.
	const container = document.querySelector('.jframework-searchTableContainer');
	const rowTop = row.offsetTop - container.offsetTop;
	container.scrollTop = rowTop;
	this._tableBody.get(0).scrollTop = rowTop //- (containerHeight / 2) + (row.offsetHeight / 2); */


	if (typeof andHighlight == "undefined" || andHighlight)
	    this._selectionHighlighterFn(rows[rowNo]);
    }


    /**************************************************************************/
    /* This one is fiddly ...

       'show' == true:
         We are being called to show the whole table (or probably more
	 accurately the table overall will be too big, and we will be
	 presenting only some scrollable portion of it).

	 If this._hideTableWhenNotInUse is false, the table is permanently
	 displayed anyway, so there is nothing to do.

	 If it's true, then the table is normally hidden, so we call upon the
	 iframe controller to enlarge the iframe to accommodate the table.
	 (The size we request was determined on initialisation, and we don't
	 subsequently change that.)


       'show' == false
         The code here has concluded that it would now be appropriate to hide
	 the table, because the user has finished with it.

	 If this._hideTableWhenNotInUse is false, then in fact the caller
	 indicated the table should not be hidden, so there is nothing to do.

	 If it's true, we now have two possibilities, depending upon the
	 setting of this._keepSelectedRowVisible.  In both cases we call the
	 iframe controller to release space; the only question is how much
	 space.

	 If this.this._keepSelectedRowVisible is false, we release _all_ of
	 the space allotted to the table, retaining only the search box.
	 If it is true, we retain just the currently selected row, so as to
	 give the user some visual feedback as to what has been selected. */

    _currentTableVisibility = this._hideTableWhenNotInUse
    _setTableVisibility (show, selectedRow = null)
    {
	this._currentTableVisibility = show;
	
	try
	{
	    if (null !== selectedRow)
		this._selectedRow = selectedRow;
	    
	    if (show)
	    {
		this._showAllTableRows();
		if (this._hideTableWhenNotInUse)
		    JFrameworkMultiframeCommunicationsSlave.sendMessageTo(null, { 'resizeIframe': Number(this._headerHeight) + Number(this._tableContainerHeight) + 10 });
	    }
	    else // Hide.  Here we require selectedRow to be non-null.
	    {
		if (!this._hideTableWhenNotInUse)
		{
		    const table = document.querySelector('.jframework-searchTable');
		    const rows = Array.from(table.querySelectorAll('tr'));
		    const rowNo = rows.indexOf(selectedRow);
		    this._showAllTableRows();
		    this._scrollTableToRow(rowNo, true);
		    return;
		}

		if (this._keepSelectedRowVisible)
		{
		    this._showAllTableRows();
		    const rowHeight = this._hideAllTableRowsExcept(this._keepSelectedRowVisible ? selectedRow : null);
		    JFrameworkMultiframeCommunicationsSlave.sendMessageTo(null, { 'resizeIframe': Number(this._headerHeight) + rowHeight + 10 });
		}
		else
		    JFrameworkMultiframeCommunicationsSlave.sendMessageTo(null, { 'resizeIframe': Number(this._headerHeight) + 10 });
	    }
	}
	catch (e)
	{
	}
    }


    /**************************************************************************/
    _hideAllTableRowsExcept (selectedRow = null)
    {
	const tbody = $('.jframework-searchTableContainer tbody')[0];
	for (const r of tbody.rows)
	    if (r !== selectedRow)
		r.style.display = 'none';

	const rowHeight = null == selectedRow ? 0 : $(selectedRow).outerHeight();
	$('.jframework-searchTableContainer').height(rowHeight);

	if (null !== selectedRow)
	{
	    for (const cell of selectedRow.cells) cell.style.cursor = 'pointer';
	    $('.jframework-searchTableContainer').css('overflow-y', 'hidden');
	}

	return rowHeight;
    }

    
    /**************************************************************************/
    /* Shows all rows. */

    _showAllTableRows ()
    {
	const container = this._tableBody.closest('.jframework-searchTableContainer');
	container.css('overflow-y', 'auto');
	container.css('height', this._tableContainerHeight); // Restore the table to its full height.
	container.css('display', 'block');
        this._tableBody.find('tr').each(function(index, row) {
	    $(row).show();
	    for (const cell of row.cells)
		cell.style.cursor = 'pointer';
	});
    }
}
