/******************************************************************************/
/* Handles a table combined with a search box which lets you select an item
   from the box.

   The following examples are taken from peopleIndex.html.  You may want to
   refer to that in order to see a more detailed example of the facilities
   being used.

   As regards HTML, you will need something like this:

     <div>
       <textarea id='searchBox'
        style='width: 100%; height: 30px; line-height: 30px; overflow: hidden; font-size: 16px; border: 2px solid black; background: #17758f; resize:none; padding: 0 10px; color: white;'
	placeholder="Search for person's name ..."></textarea>
     </div>

    and also ...

    <div id='peopleTableContainer' style='border: 2px solid black;'>
      <table id='peopleTable' style='table-layout: fixed;'>
        <colgroup><col span='1' style='width:25%;'><col span='1' style='width:75%;'></colgroup>
        <tbody id='tb_body'></tbody>
      </table>
    </div>

  The textarea serves as the search box, and it needs to have an id.  The
  attributes above are the ones I happened to need in the application where
  this present class was first used,  You can change them as you see fit.

  As regards the second block, You need the div, and it must have an id.  The
  style in the above example was applicable only to my specific application, and
  can be changed.

  You need the table, but the processing here doesn't make use of any id you
  supply.  The style above was also (probably) specific to my application, and
  therefore presumably can be changed.

  The colgroup is entirely optional -- in my case I wanted to split the columns
  unequally.

  The tbody is required, but the processing here does not make use of the id.
  The tbody itself should be empty.

  The outer div is needed because a table inherently has a height large enough to
  accommodate _all_ rows, regardless of how many are actually being shown at any
  one time.  The outer div lets us determine the screen-height actually devoted to
  displaying the table, and provides the information required when scrolling to
  make a given row visitble.

  You also need the following style-settings on the container and the table.
  overflow-y provides for scrolling of long tables, and width:100% is needed if
  you are using specific column widths -- without it, all columns are the same
  width.

    #peopleTableContainer {
        overflow-y: auto;
    }

    #peopleTable {
        width: 100%;
    }
*/
    
class ClassTableWithSearchBoxHandler
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
       args should be something like:

	 const tableHandlerArgs =
	 {
	     tableContainerId: 'xyz',
	     bodyBuilderFn: someFunction,
	     clickHandlerFn: someFunction,
	     selectionHighlighterFn: someFunction,
	     searchBoxId: 'abc',
	     rowMatcherFn: rowMatcherFn
	 };


       All elements must be present, but searchBoxId may be null if, in fact,
       you don't want a search box, and if is, then rowMatcherFn may also be
       null.

       The arguments are as follows:

       - tableContainerId: The id of the table container div, devoid of '#'.

       - bodyBuilderFn: This receives no argument.  It should return a 
         strong which is a concatenation of all the <tr> tags which will make
         up the body of the table.

       - clickHandlerFn is called when the user clicks in a table cell.  It
         receives the cell and the zero-based column number of the cell.

       - selectionHighlighterFn is called to highlight a given cell or row.
         It normally receives a cell object, but should be written also to
         accept a row.  This latter option may occur, for instance, if the
         processing selects row 0, say, on initialisation, and doesn't want
         to make an arbitrary decision as to which row to pretend has been
         selected.

       - searchBoxId is the id of the search-box text area.  It may be null
         if you do not wish to support searching.

       - rowMatcherFn is the function used to find row(s) which match a
         given search string.  It receives a row element and the current
         search string, and should return true / false according to whether
         that row is deemed to match.  rowMatcherFn may be null if
         seachBoxId is null.
    */

    constructor (args)
    {
	this.tableContainerId = args.tableContainerId;
	this.bodyBuilderFn = args.bodyBuilderFn;
	this.clickHandlerFn = args.clickHandlerFn;
	this.selectionHighlighterFn = args.selectionHighlighterFn;

	this.searchBoxId = args.searchBoxId;
	this.rowMatcherFn = args.rowMatcherFn;

	this.container = $('#' + this.tableContainerId);
	this.tableBody = $('#' + this.tableContainerId + '  tbody');
    }


    /**************************************************************************/
    /* Constructs the table. */

    initialise ()
    {
	const rowsHtml = this.bodyBuilderFn();
	this.tableBody.empty();
	this.tableBody.append(rowsHtml);
	this.addClickHandlers();
	if (null != this.searchBoxId) this.addKeyboardInputHandler();
    }
    

    /**************************************************************************/
    /* Scrolls the table to ensure that the given row is visible.  andHighlight
       is optional, default = true.  If set, the row is highlighted. */

    scrollTableToRow (rowNo, andHighlight)
    {
	const rows = this.tableBody.find('tr');
	if (rowNo < 0 || rowNo >= rows.length)
	    return;
    
	const row = rows[rowNo];
	
	// Calculate the position to scroll.
	const rowTop = row.offsetTop;  // The distance of the row from the top.
	const containerHeight = this.container.get(0).clientHeight;

	// Scroll the container to the row.
	this.container.get(0).scrollTop = rowTop - (containerHeight / 2) + (row.offsetHeight / 2);

	if (typeof andHighlight == "undefined" || andHighlight)
	    this.selectionHighlighterFn(rows[rowNo]);
    }


    /**************************************************************************/
    /* Shows all rows. */

    showAll ()
    {
        this.tableBody.find('tr').show();
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

    addClickHandlers ()
    {
        var rows = this.tableBody.find('tr');
        var tblHandler = this;

        for (var i = 0; i < rows.length; ++i)
        {
            rows[i].i = i;
	    for (var j = 0; j < rows[i].cells.length; ++j)
		rows[i].cells[j].addEventListener('click', function() { tblHandler.selectionHighlighterFn(this); tblHandler.clickHandlerFn(this, j); }, false);
        }
    }


    /**************************************************************************/
    addKeyboardInputHandler ()
    {
	const tblHandler = this;
        const inputHandler = function (e) { tblHandler.keyboardInputHandler(e) };

        $('#' + this.searchBoxId).on('input', function(e) {
	    this.timer && clearTimeout(this.timer);
	    this.timer = setTimeout(inputHandler, 300, e);
	});
    }


    /**************************************************************************/
    /* Handles the search box input. */
    
    keyboardInputHandler (e)
    {
        const inputBox = $('#' + this.searchBoxId)
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
	    const rows = this.tableBody.find('tr');
	    rows.hide();
	    var visibleRows = 0;
	    var theRow = null;
            Array.from(rows).filter(row => tblHandler.rowMatcherFn($(row), userInput)).forEach( row => { visibleRows++; theRow = row; $(row).show() } );
	    this.scrollTableToRow(0, false);
	    if (1 == visibleRows)
		theRow.cells[0].click();
        }
    }
}
