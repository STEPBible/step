/******************************************************************************/
/* Functionality
   =============

   - This displays a family tree rooted at a chosen Bible individual.

   - The information comprises a text box giving details of the person and
     their relatives; and a graphical display area which can be configured to
     show either a descendant chain or an ancestor chain.

   - To show a full tree can be rather challenging, given the amount of material
     which may need to be displayed.  Facilities are provided to limit the
     display either to an approximate number of people, or to a number of
     generations.  (These are configurable, but at present only by changing
     the code.  Details below.)  Where the tree is truncated at an individual
     who has children (so that the children are not displayed), the individual's
     name is followed by an ellipsis.  Ditto if showing an ancestor tree and the
     tree is truncated an at individual who has parents who are not shown.

   - There is a node for each individual, represented by a small circle.
     Clicking on that circle or the associated label brings up a window showing
     details of the individual.

   - The display can be scrolled left or right or up or down, and zoomed using
     the mouse wheel.  (At the time of writing you can also control the
     spacings between nodes.  This level of configurability may perhaps be a
     distraction for the user, so we may need to revisit how much control is
     actually needed.)

   - If you click on a different individual amongst those currently displayed,
     the text box is updated to contain details of that individual, but the tree
     is not altered.

   - If you click on a link in the text box, the tree is redrawn rooted at that
     individual, and the text box is updated.

   - You can also select an individual from a drop-down.

   - When you select an individual, the node for that individual is
     highlighted.  When showing an ancestor tree, it is possible that the
     same individual may appear more than once, for example because they may
     be an ancestor of both the mother and father of the individual.  In
     such a case, all instances of that particular individual are highlighted.
     (Note that more than one person may have the same name.  Only occurrences
     of the selected individual are highlighted, not other people with the
     name name.)





   API
   ===

   - The code below starts with a configuration section which lets you specify
     default layout settings.

   - renderTreeForName draws the tree for an individual selected by name.
     The argument should be a fully qualified name -- eg 'Aaron@Exo.4.14-Heb'.

   - renderTreeForStrongs draws the tree for an individual selected by
     Strongs number.

   - The code assumes a set-up like that supplied by index.html, and also
     assumes that my standard people.json file is available.  (Currently
     the records in that file contain quite a number of fields which are
     not used here, so the size of the file can probably be reduced quite
     significantly.)





   Evaluation harness
   ==================

   At present the code is set up mainly as a proof-of-concept.  To get
   round limitations upon accessing files from a web page, for instance,
   it requires you to select the input file manually (despite the fact that
   it is always the same file); and it supplies hooks so that you can alter
   the layout dynamically so as to find out what looks best.

   There are a number of issues to be resolved before this can be used in
   earnest:

   - On entry at present, the tree is drawn for the first person in the
     drop-down.  We may not wish to continue with the drop-down at all (it
     contains an awful lot of entries).  The intention is that the facilities
     should be accessible from the sidebar in much the same way as, say,
     maps can be accessed.  There is also a proposal to have a web page to
     give a more sophisticated means of accessing entries directly than can
     be handled by a simple drop-down.

   - Does it do all the things we might want, in a way which we are happy with
     -- and nothing we do _not_ want?

   - To date I have been trying this only on a desktop machine with a mouse
     and a large screen.  I am not presently sure how this would translate to
     a smaller screen or a touch screen.

   - This needs to be interfaced properly with STEPBible.  That definitely
     means changing things so that the data is picked up automatically rather
     than via a file chooser.  It probably also means coming up with a better
     way of determining the layout parameters.  And it also requires us to
     find a way of passing to the code here details of the person whose
     details are to be displayed.

   - The people.json file is presently just a copy of my full people file.
     In fact it contains a number of fields which the processing here does
     not use, and which could therefore be removed -- probably desirable,
     because the file is large.





   Acknowledgements
   ================

   With grateful thanks to ChatGPT ...


   'Jamie' Jamieson   STEPBible   Jan 2025
*/

/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                           Implementation notes                           **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Coding conventions
   ==================

   - Be aware that I'm way out of my depth with HTML, CSS and Javascript: it's
     ages since I last used them in anger.  So if I do something bizarre here,
     it's probably because I don't know what I'm doing.

   - The code is split into a number of separate 'pages'.  Each starts with
     a comment containing '*!*'.  This makes it possible to distiguish the
     start of each new page from the general code-paragraph-separators, which
     otherwise look very similar.

   - Class members and member functions which start with an underscore are
     intended to be private to that class.  I introduced this convention only
     late in the day, so I may not have got it right in all cases.

   - Function _definitions_ have a space between the function name and the
     opening parenthesis of the parameter list.  Function _calls_ do not.
     This makes it easier of you are looking for definitions.




   Implementation notes
   ====================

   The full data is held in GenealogyData.  This is a map keyed on the
   full names of people (including their scripture references, for
   disambiugation purposes).  Each name is associated with a record which
   holds most of the information taken from the people.json file, with
   some fields slightly modified.

   Each name also has an integer index value associated with it.  This makes it
   possible to refer to people easily, without having to have recourse to full
   names everywhere.  There is no particular significance to the actual index
   values -- I merely need something unique.  In fact, they are the indexes
   into the QualifiedNamesList array.  The nth entry in that is the full name
   of the n'th individual.

   A separate map -- StrongsMap -- relates each dStrongs value to the index
   associated with the individual to whom that Strongs number applies.

   Each node in the tree has an ix member which gives the index for the
   individual represented by that node, thus bringing the two structures
   together.
*/

'use strict';

  

/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                   Configuration -- change as required                    **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

const DefaultNumberOfGenerationsToGrowByOnEachExpansion = 5;
const DefaultHorizontalSpacingActualValue = 50;
const DefaultVerticalSpacingActualValue = 150;
      
var CurrentNumberOfGenerationsToGrowByOnEachExpansion = DefaultNumberOfGenerationsToGrowByOnEachExpansion;
var CurrentHorizontalSpacingTicks = 0;
var CurrentVerticalSpacingTicks = 0;
      




/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                   API                                    **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Draws whatever kind of tree is currently selected (descendant tree or
   ancestor tree), based upon the given name.

   dName: Fully qualified name -- eg 'Aaron@Exo.4.14-Heb'.
*/

function renderTreeForName (dName)
{
    PresentationHandler.newTree(indexFromName(dName));
}


/******************************************************************************/
/* Draws whatever kind of tree is currently selected (descendant tree or
   ancestor tree), based upon the given Strong's value.

   strongs: Strongs number -- eg 'G1234'.
*/

function renderTreeForStrongs (strongs)
{
    PresentationHandler.newTree(DataHandler.lookupStrongs(strongs));
}





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                Globals                                   **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/

const svg = d3.select('svg');
const g = svg.append('g');
const gLinks = g.append('g').attr('class', 'realLinks');
const gNodes = g.append('g').attr('class', 'nodes');

const EmptyFieldMarker = '';                      // Marks empty fields in the data.
var FrameWidthLastUsed = -1;                      // See function 'activation' for details.

const AdamName = 'Adam@Gen.2.19-Jud';
const JesusName = 'Jesus@Isa.7.14-Rev';



/******************************************************************************/
/* Converts integer to single-character string.  Intended mainly to handle
   3-byte Unicode characters. */

function u (charCode)
{
    return String.fromCodePoint(charCode)
}


/******************************************************************************/
const GenderOrGroupIndicators = [
    ['Male', ''],
    ['Female', ' ' + u(0x2640) ],
    ['Group', ' ' + u(0x2642) + u(0x2642) + u(0x2640) + u(0x2640) ],
    ['PseudoEntry', '']
];


/******************************************************************************/
const RoleDetails = [
    [ /\W+a\s+man\W+/i,          ''                     , null                  ],
    [ /\W+group\W+/i,            u(0x1F465)             , 'A group or people'   ], // Two profile heads as a single symbol.
    [ /\W+people\W+/i,           u(0x1F465)             , 'A group or people'   ], // Two profile heads as a single symbol.
    [ /\W+emperor\W+/i,          u(0x1F451)             , 'An emperor'          ], // Crown.
    [ /\W+high\s+priest\W+/i,    u(0x265d)              , 'A high priest'       ], // Chess bishop.
    [ /\W+judge\w+/i,            u(0x2696)              , 'A judge'             ], // Scales.
    [ /\W+king\W+/i,             u(0x1F451)             , 'A king'              ], // Crown.
    [ /\W+prophet\W+/i,          u(0x1F54A)             , 'A prophet'           ], // Dove.
    [ /\W+official\W+/i,         u(0x270D)              , 'An official'         ], // Hand, writing.
    [ /\W+priest\W+/i,           u(0x1F64F)             , 'A priest'            ], // One pair of praying hands.
    [ /\W+prince\W+/i,           u(0x1F451)             , 'A prince'            ], // One crown.
    [ /\W+singer\W+/i,           u(0x1F3A4) + u(0x1F3B5), 'A singer'            ], // Microphone plus musical notes.
    [ /\W+apostle\W+/i,          u(0x1F5E3) + u(0x1F30D), 'An apostle'          ], // Speaking head, and globe.
    [ /\W+queen\W+/i,            u(0x1F451)             , 'A queen'             ], // Two crowns.
    [ /\W+governor\W+/i,         u(0x1F3DB)             , 'A governor'          ], // Classical building.
    [ /\W+ruler\W+/i,            u(0x1F3DB)             , 'A ruler'             ], // Classical building.
    [ /\W+ethnarch\W+/i,         u(0x1F3DB)             , 'An ethnarch'         ], // Classical building.
    [ /\W+tetrarch\W+/i,         u(0x1F3DB)             , 'A tetrarch'          ], // Classical building.
    [ /\W+Egyptian pharaoh\W+/i, u(0x1F451) + u(0x1F42B), 'An Egyptian pharoah' ], // Crown and camel.
    [ /\W+ancestors\W+/i,        u(0x1F465)             , 'A group of ancestors']  // Two profile heads as a single symbol.
];





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                             Initialisation                               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class ClassInitialisationHandler
{
    /**************************************************************************/
    /* This is called if we are running in the context of peopleSplit3.html and
       the tab containing this present page is activated.  There is a problem
       in the tabbed environment, because when this present page is loaded,
       it will not be being displayed, and display:none is treated as zero-
       width page, which means the tree is not positioned correctly when first
       drawn.  This means further that when the tab for the present page is
       activated, the tree will already be in the wrong position (ie root node
       at top left).

       To get round this, I keep track of the window width at the time this
       page is activated.  If it was zero, I know I will need to redraw it.
       This still leaves me needing to have a nudge to tell me that the user
       can see it, because it is only at that point that I can do the redrawing.
       This is handled by the present function, which is called from
       peopleSplit3.html.

       The unpleasantly complicated code below is needed in order to avoid
       trying to centre the tree until after all rendering is sorted out. */

    activationReceiver (activatedBy)
    {
	if (0 != FrameWidthLastUsed)
	    return;
	
	const savedData = MultiframeController.getSavedData(MultiframeController.myFrameId());
	if (savedData)
	    PresentationHandler.refreshFromDataSavedInParentWindow(savedData);
	LayoutHandler.adjustPositionOfRootNode();
    }

  
    /**************************************************************************/
    /* Called by the data handler once data has been loaded and it's ok to
       proceed. */
    
    afterDataLoaded ()
    {
	PresentationHandler.SubtreeHighlightHandler.markSpecialTrees();
	this._populateDropdown();
	this._makeInitialSelection();
    }


    /*************************************************************************/
    onload ()
    {
	/*********************************************************************/
	/* No need to have the text saying this is genealogy data if we're
           showing multiple frames on the same screen, because there the
           context makes it obvious.  In fact, doing things that way looks a
           bit clunky, so instead I hide the text by default and show it only
           if in tabbed dialogue mode. */
    
	if (!MultiframeController.isLargeScreen())
	    $('#pageTitle').show();


    
	/*********************************************************************/
	/* There are some bits of processing which seem to be duplicated in
	   most HTML files, for reasons which, I have to admit, are definitely
	   not clear to me.  I've hived this off to a separate function so
	   I can major here on the bits I _do_ understand. */

	this._doMysteriousInitialisation();



	/*********************************************************************/
	this._initialiseSvg();
	DraggableHandler.initialise();
	ControlsHandler.setupSliders();
    }


    /**************************************************************************/
    /* Just don't understand this bit.  It's duplicated in most of these HTML
       files, which perhaps begs the question of why it not been factored out
       into a single common file.  And I don't know, for instance, why it is
       necessary to have an explicit list of loadFiles when all of these things
       are mentioned at the top of the file anyway (in many cases, I suspect,
       despite the fact that they are not used).  Also I don't know why we
       explicitly wait for jQuery to be loaded, given, again, that it's
       mentioned at the top of the file -- nor why we wait for jQuery but not
       for anything else. */
     
    _doMysteriousInitialisation ()
    {
	var debugOption = '';
	var urlPart1 = window.location.origin;
	var pos = window.location.href.indexOf('/html/');
	if (pos > 8) { // probably running in development environment.
	    urlPart1 = window.location.href.substr(0, pos);
	    debugOption = '&debug';
	}

	if (window.innerWidth > 960)
	{
	    /* $$$$$  Not sure if this is needed -- but if it is, it looks to be doing the wrong thing at present.
               if (!MultiframeController.amInIframe())
               window.location = urlPart1 + '/html/split.html?' + urlPart1 + 
    	       '/?q=reference=Exo.4:14' + 
    	       debugOption + '&skipwelcome&secondURL=' + window.location.origin + window.location.pathname;

               window.location = urlPart1 + '/html/split.html?' + urlPart1 + 
    	       '/?q=reference=Exo.4:14' + 
    	       debugOption + '&skipwelcome&secondURL=' + window.location.origin + window.location.pathname + strongURL;
	    */
	}

	if (typeof jQuery != 'undefined')
	{
	    DataHandler.initialise()
	    return;
	}
	

	this._loadFile(urlPart1 + '/css/bootstrap.css');
	this._loadFile(urlPart1 + '/css/bootstrap-theme.min.css');
	this._loadFile(urlPart1 + '/css/select2.css');
	this._loadFile(urlPart1 + '/css/select2-bootstrap.css');
	this._loadFile(urlPart1 + '/scss/step-template.css');
	this._loadFile(urlPart1 + '/international/en.js');
	this._loadFile(urlPart1 + '/libs/jquery-1.10.2.min.js');
	this._loadFile(urlPart1 + '/libs/underscore-min.js');
	this._loadFile(urlPart1 + '/libs/bootstrap.min.js');
	this._loadFile(urlPart1 + '/libs/backbone.js');
	this._loadFile(urlPart1 + '/libs/backbone.localStorage.js');
	this._loadFile(urlPart1 + '/js/backbone/models/model_settings.js');
	this._loadFile(urlPart1 + '/js/step_constants.js');
	this._loadFile(urlPart1 + '/js/passage_selection.js');
	this._loadFile(urlPart1 + '/js/search_selection.js');

	// Poll for jQuery to come into existence.
	var checkReady = function(callback) {
	    if (window.jQuery) {
		callback(jQuery);
	    }
	    else {
		window.setTimeout(function() { checkReady(callback); }, 200);
	    }
	};

	// Start polling.
	checkReady(function($) {
	    $(function() {
		DataHandler.initialise();
	    });
	});
    }


    /**************************************************************************/
    _initialiseSvg ()
    {
	const defs = svg.append("defs");

	defs.append('marker')
	    .attr('id', 'arrowhead-end')
	    .attr('viewBox', '0 -5 10 10')
	    .attr('refX', 10)
	    .attr('refY', 0)
	    .attr('markerWidth', 6)
	    .attr('markerHeight', 6)
	    .attr('orient', 'auto')
	    .attr('class', 'arrowhead')
	    .append('path')
	    .attr('d', 'M 0,-5 L 10,0 L 0,5');

	defs.append('marker')
	    .attr('id', 'arrowhead-start')
	    .attr('viewBox', '0 -5 10 10')
	    .attr('refX', 0)
	    .attr('refY', 0)
	    .attr('markerWidth', 6)
	    .attr('markerHeight', 6)
	    .attr('orient', 'auto')
	    .append('path')
	    .attr('d', 'M 10,-5 L 0,0 L 10,5') // Pointing backward
	    .attr('class', 'arrowhead');
    }


    /**************************************************************************/
    /* To load CSS files etc dynamically. */
  
    _loadFile(path)
    {
	if (path.endsWith('.js'))
	{
	    var fileref = document.createElement('script');
	    fileref.setAttribute('type', 'text/javascript');
	    fileref.setAttribute('src', path);
	}
	else if (path.endsWith('.css'))
	{
	    var fileref = document.createElement('link');
	    fileref.setAttribute('rel', 'stylesheet');
	    fileref.setAttribute('type', 'text/css');
	    fileref.setAttribute('href', path);
	}
	else
	    return;

	fileref.async = false;
	document.getElementsByTagName('head')[0].appendChild(fileref);
    }


    /**************************************************************************/
    /* The URL for the present page may be 'revised' (including set up for the
       first time) either because of a direct intervention from the 3-panel
       page, or because the people index pane has been used to select a new
       person.

       The former occurs where the 3-panel has been invoked from the sidebar
       as a result of someone looking up Strong's information while reading
       scripture.  The latter (ie when invoked from the people index) occurs
       when already in 3-pane mode, and selecting a new person.

       There is also the possibility that the present code may be called with
       no selection at all, in whichh case I have been asked to default to
       Aaron. */
  
    _makeInitialSelection ()
    {
	const urlParms = new URLSearchParams(new URL(window.location.href).search);
	const strong = urlParms.get("strong")
	const savedData = MultiframeController.getSavedData(MultiframeController.myFrameId());

	if (savedData)
	    PresentationHandler.refreshFromDataSavedInParentWindow(savedData);
	    
	const rootIx = strong ? DataHandler.lookupStrongs(strong) : 0;

	renderTreeForName(nameFromIndex(rootIx));
	if (savedData && rootIx == savedData.rootPersonIx)
	    PresentationHandler.changeSelectedPerson(savedData.selectedPersonIx);
    }


    /**************************************************************************/
    /* Populates the dropdown used to select individuals, and arranges to
       display the first person on the dropdown.  This was created really to
       support initial evaluation of the functionality.  At the time of
       writing, the dropdown has been commented out above, and therefore the
       code here is no longer really required.  I thought it useful to retain
       the code, so I address the fact that it may not actually be required by
       checking to see if the dropdown is actually defined. */

    _populateDropdown ()
    {
/*
	const personSelect = document.getElementById("personSelect");

	if (null == personSelect)
            return;

	personSelect.innerHTML = ""; // Clear previous options
	Object.keys(DataHandler.GenealogyData).forEach(person => {
            const option = document.createElement("option");
            option.value = person;
            option.textContent = person;
            personSelect.appendChild(option);
	});
	
	personSelect.addEventListener("change", () => {
            RootAndSelectedPerson.moveToByName(personSelect.value);
	});
*/
    }
}

const InitialisationHandler = new ClassInitialisationHandler();





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                            Subtree selection                             **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This class is concerned with extracting data from the overall genealogy
   collection, and structuring it in different ways.

   Anything with a name starting getRecordSet returns a set of records.  The
   remainder of the method name indicates the basis upon which that set has
   been selected.

   Sets of records may be useful when, for instance, you need to merge several
   different collections before doing anything with them.

   Anything with a name starting createTree returns three elements -- a set
   containing the selected records, a set containing any elements which are
   duplicated, and a tree structure made up of thunks each of which combines
   a little information of its own and has a collection of children, which are
   themselves other thunks.

   The tree can be used for drawing.  The selected records are available in
   case you need them.  The duplicated records collection reflects cases where
   both of the parents of a set of nodes have been selected, and the nodes
   therefore appear more than once in the tree.  This can be used to avoid
   duplicating child nodes on the tree, by sharing children between the two
   parents.

   Note that I have gone for simplicity over efficiency (although you may
   well query the assertion that this is simple).
*/
  
class ClassSubtreeSelector
{
    /**************************************************************************/
    /* Methods in this section are ones which you would use predominantly to
       prepare data for drawing. */
    /**************************************************************************/

    /**************************************************************************/
    /* Returns a list comprising a set of selected records, a tree, and a set
       of duplicated records based upon the records which lie between a given
       root and any of a collection of leaf nodes.  For a discussion of the
       'line' parameter, see getRecordSetBetweenFromAndTo. */
    
    createTreeByFromAndTos (rootPersonRecord, leafPersonRecords, line = 'B')
    {
	const leafPeople = new Set(leafPersonRecords)

	if (leafPeople.has(rootPersonRecord)) return null;

	var selectedRecords = new Set();
	
	for (const p of leafPersonRecords)
	{
	    const stack = this.getRecordSetBetweenFromAndTo(rootPersonRecord, p, line);
	    if (stack)
		selectedRecords = new Set( [...selectedRecords, ...stack] );
	}

	if (0 == selectedRecords.size)
	    return null;
	else
	{
	    const res = this.createTreeByRetentionOnly(rootPersonRecord, selectedRecords, null);
	    return res;
	}
    }


    /**************************************************************************/
    /* Selects records by taking n generations from the root, but also
       retaining any records marked for retention.

       The main controller of this is the optional 'generations' parameter ...

       - If omitted or supplied as null, it defaults to whatever the user
         has selected as the number of generations to be added on each go.

       - If supplied as less than zero (typically -1), then the tree is
         based purely upon the inclusion and exclusion list.

       - If >= 0, then you get n generations rooted at the root node, but
         augmented / limited by the content of the inclusion and exclusion
	 lists.

       giveUpFn needs some careful thought ...

       - If being asked to consider a record in the exclusion list, it should
         definitely flag that we can give up.

       - If being asked to handle a record in the inclusion list, we should
         definitely _not_ give up.  (Should not give up even if we're past
	 the number of generations, because the number of generations is
	 assessed from the root node, but we may be being called specifically
	 to add extra nodes in addition to the ones covered by that.)

       - Otherwise, things are determined by the generation.
    */
    
    createTreeByGenerationOrRetention (rootPersonRecord, includeRecords, excludeRecords = null, generations = null)
    {
	var generationLimit = generations ? generations : CurrentNumberOfGenerationsToGrowByOnEachExpansion;
	
	const giveUpFn = function (personRecord, generation) {
	    if ('dummyNode' in personRecord) // If we are being called with a dummy root node, assume we always want it.
		return false;
	    
	    if (excludeRecords && excludeRecords.size > 0 && excludeRecords.has(personRecord))
		return true;

	    if (includeRecords && includeRecords.has(personRecord))
		return false;

	    if (generation > generationLimit)
		return true;

	    return false;
	}
	
	const selectedRecords = new Set();
	const duplicatedRecords = new Set();
	const tree = this._createTree(giveUpFn, selectedRecords, duplicatedRecords, rootPersonRecord, false);
	return [selectedRecords, tree, duplicatedRecords];
    }


    /**************************************************************************/
    /* Selects records based upon retention records only. */

    createTreeByRetentionOnly (rootPersonRecord, includeRecords, excludeRecords = null)
    {
	function giveUpFn (personRecord, generation)
	{
	    if ('dummyNode' in personRecord)
		return false; // If we've been called with a dummy record, assume we always include it.
	    
	    if (excludeRecords && excludeRecords.size > 0 && excludeRecords.has(personRecord))
		return true;

	    if (includeRecords && includeRecords.has(personRecord))
		return false;

	    return true;
	}
	
	const selectedRecords = new Set();
	const duplicatedRecords = new Set();
	const tree = this._createTree(giveUpFn, selectedRecords, duplicatedRecords, rootPersonRecord, false);
	return [selectedRecords, tree, duplicatedRecords];
    }

    
    /**************************************************************************/
    /* Gets the records which lie between two personRecords (including those
       people themselves).  'line' determines whether we look at the M(ale)
       line only, the F(emale) line only, or B(oth).  Given the paucity of
       information about women in the Bible, I suspect F doesn't make much
       sense; I include it here only for the sake of completeness.

       Note that the information returned is simply a collection of records.
       It is _not_ organised as a tree. */
    
    getRecordSetBetweenFromAndTo (ancestorPersonRecord, descendantPersonRecord, line = 'B')
    {
	if (ancestorPersonRecord === descendantPersonRecord)
	    return null;
	
	var res = new Set([ancestorPersonRecord]);
	const wantMale   = 'M' === line || 'B' === line;
	const wantFemale = 'F' === line || 'B' === line;
	
	const stack = [];
	
	function consider (personRecord)
	{
	    if (personRecord === ancestorPersonRecord)
	    {
		res = new Set( [...res, ...stack] );
		if ('M' === line)
		    throw(1); // No need to do any more if we're only looking at the male line.
	    }

	    if (wantMale && DataHandler.hasFather(personRecord))
	    {
		stack.push(personRecord);
		consider(DataHandler.getFatherPersonRecord(personRecord));
		stack.pop();
	    }

	    if (wantFemale && DataHandler.hasMother(personRecord))
	    {
		stack.push(personRecord);
		consider(DataHandler.getMotherPersonRecord(personRecord));
		stack.pop();
	    }
	}

	try
	{
	    consider(descendantPersonRecord);
	    return 1 == res.size ? null : res;
	}
	catch (e)
	{
	    return res;
	}
    }

    
    /**************************************************************************/
    /* For the first part of the processing, see _createTreeA.  Having obtained
       details from that, we now need to work out what to do with duplicates.

       In theory we could need to run over an awful lot of nodes here, but we
       rely upon giveUpFn to limit the number.

       After the createTreeA call, allThunks contains a load of thunks of the
       form below, in a map to speed up access:

         { ix: rootPersonRecord.ix, gen: generation, children: [] }

       and duplicates is a collection of personRecords which are duplicated,
       in the sense that both their father and their mother are present, and
       therefore effectively the child itself appears twice, once under each
       parent.  We need to address this, because we don't want any individual
       to appear more than once on the screen.

       The main processing loop deals with that, by selecting the more fit
       of the two parents to retain custody (the more fit one being the
       one more generations from the root of the hierarchy, because then
       arrows from the other parent will point downwards).

       Before the processing loop below, one of the two parents will have
       a genuine thunk for the child, and the other will contain just a
       placeholder thunk, containing dummy information.

       If the dummy is the one to be retained, then we copy information
       across from the real one.

       Then we remove the child thunk from the children of the parent
       which is losing custody.

       And finally, we return the tree which we have constructed, along
       with a list of all the rootPerson records which have been selected
       (via the selectedRecords parameter) and (in duplicatedRecords) a
       collection of records which relate the personRecord of the person
       losing custody to the child personRecord. */

    _createTree (giveUpFn, selectedRecords, duplicatedRecords, rootPersonRecord)
    {
	/**********************************************************************/
	const allThunks = new Map();
	const duplicates = new Set();
	const tree = this._createTreeA(giveUpFn, rootPersonRecord, 0, allThunks, duplicates);


	/**********************************************************************/
	for (const duplicatePersonRecord of duplicates)
	{
/*
	    const re = allThunks.get(personRecordFromName("Rehoboam@1Ki.11.43-Mat"));
	    const ma = allThunks.get(personRecordFromName("Mahalath@2Ch.11.18"));
	    if (!re.children.some( x => 1587 == x.ix ))
		console.log("Re 1587");
	    if (!ma.children.some( x => 1587 == x.ix ))
		console.log("Ma 1587");
	    if (!re.children.some( x => 2653 == x.ix ))
		console.log("Re 2653");
	    if (!ma.children.some( x => 2653 == x.ix ))
		console.log("Ma 2653");
	    
	    console.log(nameFromPersonRecord(duplicatePersonRecord));
*/

	    const fatherName = duplicatePersonRecord.father.disambiguatedName;
	    const motherName = duplicatePersonRecord.mother.disambiguatedName;
	    const fatherPersonRecord = personRecordFromName(fatherName);
	    const motherPersonRecord = personRecordFromName(motherName);
	    const fatherThunk = allThunks.get(fatherPersonRecord);
	    const motherThunk = allThunks.get(motherPersonRecord);
	    const parentThunks = [fatherThunk, motherThunk];

	    const losingCustodyIx = parentThunks[0].gen < parentThunks[1].gen ? 0 : 1;
	    const losingCustodyThunk = parentThunks[losingCustodyIx];
	    const gainingCustodyThunk = parentThunks[1 - losingCustodyIx];
	    const losingCustodyPersonRecord = personRecordFromIndex(losingCustodyThunk.ix);
	    const gainingCustodyPersonRecord = personRecordFromIndex(gainingCustodyThunk.ix);

	    const ixOfChildInParentLosingCustody = losingCustodyThunk.children.findIndex(c => c.ix === duplicatePersonRecord.ix);
	    const childThunk = losingCustodyThunk.children[ixOfChildInParentLosingCustody];

	    losingCustodyThunk.children.splice(ixOfChildInParentLosingCustody, 1);
	    duplicatedRecords.add({bereftParent:losingCustodyPersonRecord, child:duplicatePersonRecord});
	    
	    if (childThunk.gen >= 0) // The parent losing custody has the genuine record, so we need to copy the details actross.
	    {
		const children = gainingCustodyThunk.children;
		const ixOfChildInParentGainingCustory = children.findIndex(c => c.ix === duplicatePersonRecord.ix);
		const targetChildThunk = children[ixOfChildInParentGainingCustory];
		targetChildThunk.ix = childThunk.ix;
		targetChildThunk.gen = childThunk.gen;
		targetChildThunk.children = childThunk.children;
	    }
	}



	/**********************************************************************/
	allThunks.forEach ( thunk => selectedRecords.add(personRecordFromIndex(thunk.ix)) );
	return tree;
    }

    
    /**************************************************************************/
    /* This is fiddly ...

       giveUpFn is a function supplied from above which is used to decide
       when we should abandon further processing, should we wish to do so
       before hitting the end of the data.  The decision can be based upon
       either or both of the record being processed and the depth below the
       root which has been reached.

       The tree is made up of thunks, each of which identifies a single
       person record, the number of generations below the root at which that
       person appears, and a collection of thunks for the children (which
       collection must be called 'children' because that's what d3.js looks
       for).

       The 'generation' parameter gives the depth below the root at which we
       are currently functioning.

       allThunks contains all of the thunks which have been processed.  It is
       useful to the caller in order to run over all thunks without having
       to work across the tree.

       And duplicates contains all of the records which we have hit more
       than once while going down the tree.

       That last comment probably warrants further discussion.

       A given individual will have two parents, four grandparents, etc.  The
       fact that we are working down a tree from a single individual limits
       the likelihood that we will be presenting all of these ancestors on
       the screen at once, but -- particularly early in the chronology --
       it is perfectly possible that we may have both parents on the screen,
       and possibly more than one grandparent, etc.

       To avoid the unncessary burden of procssing the tree below a given
       person multiple times, I do use allThunks to track who I have already
       processed.  However, if both parents of a given individual appear on
       the screen at the same time, I do need to know, because I have to
       decide how to associate the children with them -- see _createTree for
       more details. */
    
    _createTreeA (giveUpFn, rootPersonRecord, generation, allThunks, duplicates)
    {
	/**********************************************************************/
	if (allThunks.has(rootPersonRecord)) // No point in re-exploring a node whose tree we have already looked at.
	{
//	    console.log(nameFromPersonRecord(rootPersonRecord) + " (" + indexFromPersonRecord(rootPersonRecord) + ") : Father: " + rootPersonRecord.father.disambiguatedName + " Mother: " + rootPersonRecord.mother.disambiguatedName);
	    duplicates.add(rootPersonRecord);
	    return { ix: rootPersonRecord.ix, gen: -1, children: [] }; // -1 marks this out as a placeholder for the child.
	}



	/**********************************************************************/
	if (giveUpFn(rootPersonRecord, generation))
	    return null;



	/**********************************************************************/
	const newThunk = { ix: rootPersonRecord.ix, gen: generation, children: [] }

	allThunks.set(rootPersonRecord, newThunk);
	
	for (const c of rootPersonRecord.children)
	{
	    const x = this._createTreeA(giveUpFn, personRecordFromName(c.disambiguatedName), 1 + generation, allThunks, duplicates);
	    if (null != x) newThunk.children.push(x);
	}

	return newThunk;
    }


    /**************************************************************************/
    /* Methods in this section are ones which you would use predominantly to
       work out how to highlight branches. */
    /**************************************************************************/

    /**************************************************************************/
    createPersonRecordCollectionForLine (ancestorPersonRecord, descendantPersonRecord)
    {
	const lineToJesus = JesusName === nameFromPersonRecord(descendantPersonRecord);
	const descendantAndAncestors = this.createPersonRecordCollectionDescendantAndAncestors(descendantPersonRecord, null);

	var selected;
	if (lineToJesus)
	    selected = descendantAndAncestors;
	else
	{
	    const ancestorAndDescendants = this.createPersonRecordCollectionAncestorAndDescendants(ancestorPersonRecord, null);
	    selected = new Set([...descendantAndAncestors].filter(item => ancestorAndDescendants.has(item)));
	}
	
	const nonMaleLineLinks = this._lineDetails(ancestorPersonRecord, descendantPersonRecord, selected);
	//this._dbgNonMaleLineLinks(nonMaleLineLinks);
	return {collection: selected, nonMaleLineLinks: nonMaleLineLinks, ancestorPersonRecord: ancestorPersonRecord, descendantPersonRecord: descendantPersonRecord};
    }

    
    /**************************************************************************/
    /* Returns a set comprising the ancestor node and all descendants.  If
       'within' is non-null, limits the results to records which appear within
       that. */
    
    createPersonRecordCollectionAncestorAndDescendants (ancestor, within = null)
    {
	const res = new Set();
	const doIt = function (personRecord) {
	    if (within && !within.has(personRecord))
		return;

	    res.add(personRecord);
	    
	    for (const c of personRecord.children)
		doIt(personRecordFromName(c.disambiguatedName));
	}

	doIt(ancestor);
	return res;
    }

    
    /**************************************************************************/
    /* Returns a set comprising the descendant node and all ancestors.  If
       'within' is non-null, limits the results to records which appear within
       that. */
    
    createPersonRecordCollectionDescendantAndAncestors (descendant, within = null)
    {
	const res = new Set();
	const doIt = function (personRecord) {
	    if (within && !within.has(personRecord))
		return;

	    res.add(personRecord);

	    var parentName = personRecord.father.disambiguatedName;
	    if (EmptyFieldMarker != parentName)
		doIt(personRecordFromName(parentName));

	    parentName = personRecord.mother.disambiguatedName;
	    if (EmptyFieldMarker != parentName)
		doIt(personRecordFromName(parentName));
	}

	doIt(descendant);
	return res;
    }

    
    /**************************************************************************/
    /* Returns a set comprising the root node and all descendants. */
    
    createPersonRecordCollectionRootAndDescendants (rootPerson)
    {
	const res = new Set();
	const doIt = function (personRecord) {
	    res.add(personRecord);
	    for (const c of personRecord.children)
		doIt(personRecordFromName(c.disambiguatedName));
	}

	try { doIt(rootPerson); } catch (e) {}
	return res;
    }

    
    /**************************************************************************/
    /* This obtains details relevant to marking lines of descent within a
       collection of nodes.  At one point I thought this needed to be sensitive
       to whether it was being asked to work on the line to Jesus, or on the
       line to some other person.  In fact, I no longer believe this to be
       necessary: processing elsewhere can worry about that. */

    _lineDetails (ancestorPersonRecord, descendantPersonRecord, within)
    {
	/**********************************************************************/
	if (ancestorPersonRecord === descendantPersonRecord)
	    return new Set();


	
	/**********************************************************************/
	//within.forEach ( x => console.log('Within: ' + nameFromPersonRecord(x)) );


	
	/**********************************************************************/
	/* Tree traversal utilities. */
	
	function traverseTreePreOrder (personRecord, process)
	{
	    if (!within.has(personRecord) && !'dummyNode' in personRecord) return;

	    try
	    {
		process(personRecord);
		for (const c of personRecord.children)
		    traverseTreePreOrder(personRecordFromName(c.disambiguatedName), process);
	    }
	    catch (e)
	    {
	    }
	}


	function traverseTreePostOrder (personRecord, process)
	{
	    if (!within.has(personRecord) && !'dummyNode' in personRecord) return;

            for (const c of personRecord.children)
		traverseTreePostOrder(personRecordFromName(c.disambiguatedName), process);

	    process(personRecord);
	}



	/**********************************************************************/
	const nonMaleLineLinks = new Map();
	const me = this;



	/**********************************************************************/
	/* Identify all of those nodes for males descended from the ancestor
	   via the male line. */

	function markMaleLine (personRecord)
	{
	    //console.log("Processing: " + nameFromPersonRecord(personRecord));
	    if (DataHandler.isMale(personRecord)) // No need to check 'within' because traverseTree guarantees that.
	    {
		//console.log('Male: ' + nameFromPersonRecord(personRecord));
		personRecord._x_inMaleLine = true;
	    }
	    else
		throw(1); // If this isn't in the male line from the root, nothing else will be either.
	}	    
	    
	traverseTreePreOrder(ancestorPersonRecord, markMaleLine);



	/**********************************************************************/
	/* Because of work done previously, we can know whether a given person
	   is in the male line directly without having to traverse the tree
	   structure here.  In other words, if Joe is a descendant of Jim,
	   we can know whether Joe is in the male line without deducing this
	   from the fact that Jim is. */

	function isInMaleLine (personRecord)
	{
	    return personRecord._x_inMaleLine;
	}

	
	
	/**********************************************************************/
	function addToNonMaleLinks (parentIx, childIx)
	{
	    //console.log('NonMaleLink: Parent: ' + nameFromIndex(parentIx) + ' Child: ' + nameFromIndex(childIx));
	    var existingVal = nonMaleLineLinks.get(parentIx);
	    if (existingVal)
		existingVal.add(childIx);
	    else
	    {
		const newVal = new Set();
		newVal.add(childIx);
		nonMaleLineLinks.set(parentIx, newVal);
	    }
	}


	
	/**********************************************************************/
	function isLeafNode (personRecord)
	{
	    return 0 == personRecord.children.filter( c => within.has(personRecordFromName(c.disambiguatedName)) );
	}



	/**********************************************************************/
	/* If any node has a non-male-line node above it, the link between the
	   two will be non-male-line. */

	within.forEach( personRecord => {
	    for (const parentName of [personRecord.father.disambiguatedName, personRecord.mother.disambiguatedName])
		if (EmptyFieldMarker !== parentName)
	        {
		    const parentRecord = personRecordFromName(parentName);
		    if (within.has(parentRecord) && !isInMaleLine(parentRecord))
			addToNonMaleLinks(indexFromPersonRecord(parentRecord), indexFromPersonRecord(personRecord));
		}
	});


	
	/**********************************************************************/
	/* We now work up from the bottom of the tree.  If all of the links
	   below a given node are non-male-line, the link from that node to
	   its parent should also become non-male line. */
	
	function propagateNonMaleLinks (personRecord)
	{
	    if (!within.has(personRecord))
		return;

	    const personIx = indexFromPersonRecord(personRecord);
	    const nonMaleLinkDetails = nonMaleLineLinks.get(personIx);
	    const nonMaleLinkCount = nonMaleLinkDetails ? nonMaleLinkDetails.size : 0;
	    const childrenInWithin = personRecord.children.filter( x => within.has(personRecordFromName(x.disambiguatedName)) );

	    if (0 == childrenInWithin.length || nonMaleLinkCount != childrenInWithin.length)
		return;

	    for (const parentName of [personRecord.father.disambiguatedName, personRecord.mother.disambiguatedName])
		if (EmptyFieldMarker !== parentName)
	        {
		    const parentRecord = personRecordFromName(parentName);
		    if (within.has(parentRecord))
			addToNonMaleLinks(indexFromPersonRecord(parentRecord), indexFromPersonRecord(personRecord));
		}
	}



	/**********************************************************************/
	traverseTreePostOrder(ancestorPersonRecord, propagateNonMaleLinks);
	const res = new Set(); [...nonMaleLineLinks].map(([key, value]) => { value.forEach( x => { res.add(key + ':' + x); }) });
	within.forEach ( x => delete x._x_inMaleLine );
	return res;
    }

    
    /**************************************************************************/
    /* Adds the immediate children of all nodes which have been selected.  Not
       present because we decided against offering this, but I've retained it
       -- untested -- in case we need it again. */
    
    _addImmediateChildren (selectedRecords, rootPersonRecord)
    {
	selectedRecords.forEach( record => {
	    if (record.children)
		record.children.forEach (child => {
		    selectedRecords.add(personRecordFromName(child.disambiguatedName));
		});
	});
    }




    
    /**************************************************************************/
    /* Debug. */
    /**************************************************************************/

    /**************************************************************************/
    _dbgNonMaleLineLinks (nonMaleLineLinks)
    {
	for (const link of nonMaleLineLinks)
	{
	    const parts = link.split(':');
	    console.log(nameFromIndex(Number(parts[0])) + ' -> ' + nameFromIndex(Number(parts[1])));
	}
    }

    
    /**************************************************************************/
    _dbgPersonRecord (personRecord)
    {
	console.log(nameFromPersonRecord(personRecord));
    }

    
    /**************************************************************************/
    _dbgSet (prefix, selection)
    {
	for (const x of selection)
	    console.log(prefix + ": " + x.simpleName);
    }

    
    /**************************************************************************/
    _dbgTree (prefix, root)
    {
	console.log(prefix + ": " + root.ix + ": " + nameFromIndex(root.ix));
	for (const c of root.children)
	    this._dbgTree(prefix, c);
    }
}

const SubtreeSelector = new ClassSubtreeSelector();


    

  
/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Data handler                                **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class ClassDataHandler
{
    /**************************************************************************/
    GenealogyData = {};      // The fundamental data, slightly amended and extended.
    QualifiedNamesList = []; // Converts indices to names-with-scripture-references.


    /**************************************************************************/
    /* This is called during the drawing process, at which point we genuinely
       do have a node corresponding to everyone of interest, so it is ok to
       clear out the existing data and fill it all in afresh. */
  
    addSvgNodePointersToPersonRecords (nodes)
    {
	for (const key in this.GenealogyData)
	    delete this.GenealogyData[key].treeNode;
    
	for (const node of nodes)
	{
	    const personRecord = personRecordFromTreeNode(node);
	    personRecord.treeNode = node;
	}
    }


    /**************************************************************************/
    getFatherPersonRecord (personRecord)
    {
	const x = personRecord.father.disambiguatedName;
	return EmptyFieldMarker === x ? null : personRecordFromName(x);
    }


    /**************************************************************************/
    getMotherPersonRecord (personRecord)
    {
	const x = personRecord.mother.disambiguatedName;
	return EmptyFieldMarker === x ? null : personRecordFromName(x);
    }


    /**************************************************************************/
    /* I have a collection of dummy records which were put in place to cater
       for special trees where we need to present the appearance of having
       several different subtrees.  This returns the name of the next one
       available. */
    
    getNextAvailableDummyRecordName ()
    {
	return this._makeNameForDummyRecord(++this._nextAvailableDummyRecordNumber);
    }

    
    /**************************************************************************/
    getRoleDescription (personRecord)
    {
	return (-1 == personRecord.roleDataIx) ? null : RoleDetails[personRecord.roleDataIx][2];
    }

	
    /**************************************************************************/
    /* On records which have more than one emoji as their icon, the emojis
       tend to be rather spaced out.  It would be nice to be able to force
       them closer using kerning or whatever.  Unfortunately, the icon details
       here are used in SVG text nodes, and the CSS options which we could
       normally use are not all available there. */
    
    getSummaryIcon (personRecord)
    {
	const ix = personRecord.roleDataIx;
	return -1 == ix ? "" : RoleDetails[ix][1];
    }

    
    /**************************************************************************/
    initialiseDummyRecords ()
    {
	for (var i = 1; i <= this._numberOfDummyRecords; ++i)
	{
	    const record = personRecordFromName(this._makeNameForDummyRecord(i));
	    record.children = [];
	    record.father.disambiguatedName = EmptyFieldMarker;
	}

	this._nextAvailableDummyRecordNumber = 0;
    }

    
    /**************************************************************************/
    /* See comments for isMale. */
	    
    isFemale (personRecord)
    {
	return 'Female' === personRecord.type;
    }

	    
    /**************************************************************************/
    /* I've hived this off to a separate method because I'm not entirely sure
       what should constitute a male in this context.  Is it someone overtly
       marked as male, or is it anyone not marked as female (which would then
       include things like tribes etc)?  I've opted for the latter. */
	    
    isMale (personRecord)
    {
	return !this.isFemale(personRecord);
    }


    /**************************************************************************/
    hasFather (personRecord)
    {
	return EmptyFieldMarker != personRecord.father.disambiguatedName;
    }

  
    /**************************************************************************/
    hasMother (personRecord)
    {
	return EmptyFieldMarker != personRecord.mother.disambiguatedName;
    }
  

    /**************************************************************************/
    hasParent (personRecord)
    {
	return hasFather(personRecord) || hasMother(personRecord);
    }

  
    /**************************************************************************/
    initialise ()
    {
	const jsonPath = MultiframeController.getFullUrl('json/people.json');
	const me = this;
	this._acquireRawGenealogyData(jsonPath, function(text) {
            me.GenealogyData = JSON.parse(text);
	    me._addDummyGenealogyRecord();
	    me._buildIndexes();
	    InitialisationHandler.afterDataLoaded();
	});
    }


    /**************************************************************************/
    /* Returns the full name (including scripture reference) for the individual
       associated with a given Strongs number. */

    lookupStrongs (strongs)
    {
	return this._StrongsMap.get(strongs)
    }

    
    /**************************************************************************/
    _displayedPersonRecords = new Set();
    _StrongsMap = new Map(); // Enables lookup based on dStrongs.

    
    /**************************************************************************/
    /* Reads the JSON file containing the genealogical information. */
  
    _acquireRawGenealogyData (file, callback)
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
    _addDummyGenealogyRecord ()
    {
	for (var i = 1; i <= this._numberOfDummyRecords; ++i)
	{
	    const name = this._makeNameForDummyRecord(i);
	    this.GenealogyData[name] =
	    {
		dummyNode: true,
		disambiguatingRefs: name.split('@')[1],
		father: { disambiguatedName: EmptyFieldMarker },
		mother: { disambiguatedName: EmptyFieldMarker },
		partners: [],
		children: [],
		alternativeNames: [],
		allDStrongs: [],
		ambiguity: EmptyFieldMarker,
		summaryDescription: EmptyFieldMarker,
		longDescription: EmptyFieldMarker,
		generationsFromAdam: -1,
		generationsToJesus: -1,
		roleDataIx: -1
	    };
	}
    }

    
    /**************************************************************************/
    /* Data storage and indexing -- see implementation notes at head of file
       for more information. */

    _buildIndexes ()
    {
	for (const dName in this.GenealogyData)
	{
	    const personRecord = personRecordFromName(dName);
	    const ix = this.QualifiedNamesList.length;
	    this.QualifiedNamesList.push(dName);
	    personRecord.ix = ix;

	    delete personRecord.dStrongs;
	    delete personRecord.tribeOrNation;
	    delete personRecord.allRefsAsRanges;
	    delete personRecord.briefestDescription;
	    delete personRecord.briefDescription;
	
	    personRecord.display = false;
	    
            personRecord.summaryDescription = 'summaryDescription' in personRecord ? personRecord.summaryDescription.split(',')[0].substring(1) : '';
	    if ('' != personRecord.summaryDescription) personRecord.summaryDescription += '.';
	    personRecord.longDescription = personRecord.longDescription.replaceAll('¶', '<p>');
	    personRecord.genderOrGroupIndicator = genderOrGroupIndicator(personRecord);
	    personRecord.allDStrongs.forEach((entry) => { this._StrongsMap.set(entry, ix) });
	    personRecord.roleDataIx = this._getRoleDataIndex(personRecord);
	
	    const x = dName.split('@');
	    personRecord.disambiguatingRefs = x[1];

	    if (x[0].includes('_built_'))
		personRecord.simpleName = x[0].replace('_built_', ' (Built ') + ')';
	    else if (x[0].startsWith('a_wife_of'))
		personRecord.simpleName = x[0].replace('a_wife_of_', 'A wife of ');
	    else if (x[0].startsWith('daughter_of'))
		personRecord.simpleName = x[0].replace('daughter_of_', 'Daughter of ');
	    else if (x[0].startsWith('son_of'))
		personRecord.simpleName = x[0].replace('son_of_', 'Son of ');
	    else if (x[0].startsWith('motherInLaw_of_'))
		personRecord.simpleName = x[0].replace('motherInLaw_of_', 'Mother-in-law of ');
	    else
		personRecord.simpleName = x[0];
	}
    }


    /**************************************************************************/
    _getRoleDataIndex (personRecord)
    {
	var ix = -1;
	for (const [regex, icon, description] of RoleDetails)
	{
	    ++ix;
	    if (regex.test(personRecord.summaryDescription))
		return ix;
	}

	return -1;
    }


    /**************************************************************************/
    /* We may have more than one dummy record, and I'm assuming each needs a
       unique id which looks like the sort of id we'd have for pukka people
       records. */

    _makeNameForDummyRecord (n)
    {
	return 'Dummy@Gen.99.' + n;
    }


    /**************************************************************************/
    _removeFromHierarchyNodesBelow (children)
    {
	for (const child of children)
	{
	    const personRecord = personRecordFromName(child.disambiguatedName);
	    this._displayedPersonRecords.delete(personRecord);
	    this._removeFromHierarchyNodesBelow(personRecord.children);
	}
    }


    /**************************************************************************/
    _nextAvailableDummyRecordNumber = 0;
    _numberOfDummyRecords = 10;
}

const DataHandler = new ClassDataHandler();




    
/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Layout handler                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* There used to be a HorizontalLayoutHandler too, which is why this has been
   hived off as a separate class. */

class ClassVerticalLayoutHandler
{
    /**************************************************************************/
    constructor (fontSizeForNames = 'small')
    {
	this._fontSizeForNames = fontSizeForNames;
    }

    
    /************************************************************************/
    /* Positions the root node so that the tree sits reasonably well within
       the available space. */

    adjustPositionOfRootNode (force = false)
    {
	const svgWidth = svg.node().getBoundingClientRect().width; // Width of SVG container.
	if (this._previousWidth == svgWidth && !force)
	    return false;
	
	this._previousWidth = svgWidth;
	
	var newY = 20
	var newX = svgWidth / 2

	if ('dummyNode' in personRecordFromIndex(PresentationHandler.getRootPersonIx()))
	    newY -= this.getSpacingBetweenLayers();

	PresentationHandler.translateGraphics(newX, newY);

	return true;
    }


    /**************************************************************************/
    /* Renders the text, and positions it so as to avoid clashes as far as
       possible.
       
       CAUTION: Don't try to force into using the standard xxxFromYyy indexing
       functions -- we're dealing with text nodes here, not nodes in the tree
       structure. */

    createAndPositionTextNodes (nodes)
    {
	for (const node of nodes)
	{
	    const ix = indexFromTreeNode(node);
	    const personRecord = personRecordFromIndex(ix);
	    const icon = DataHandler.getSummaryIcon(personRecord);
	    const name = nameForDisplayInTree(personRecord);
	    const x = d3.select(node);

	    const isMan = DataHandler.isMale(personRecord);

	    const textNode = x.append('text')
		  .attr('x', +10) // Adjust position based on parent/child
		  .attr('dy', 3) // Vertical offset
		  .attr('text-anchor', 'start') // Align text properly
		  .attr('transform', 'rotate(30)')
		  .attr('textNodeIx', ix)

	    textNode.append('tspan')
		.attr('font-size', 'x-large')
	        .classed('retainDefaultAppearance', true)
		.text(icon);

	    textNode.append('tspan')
	        .classed('man', isMan)
	        .classed('woman', !isMan)
		.text(name);
	    
	    const owningTextNodeX = Number(textNode.attr('x')) + 5;


	    // If you want to list _all_ of the spouses, remove the 'if' clause,
	    // along with the word 'else'.

	    if (personRecord.partners.length > 1)
		textNode.append('tspan')
		.attr('x', owningTextNodeX)
		.attr('dy', +15)
	        .classed('manSpouse', !isMan)
	        .classed('womanSpouse', isMan)
		.text('\u2764 +Partners');
	    else
		for (const partner of personRecord.partners)
		    textNode.append('tspan')
		            .attr('x', owningTextNodeX)
		            .attr('dy', +15)
	                    .classed('manSpouse', !isMan)
	                    .classed('womanSpouse', isMan)
		            .text('\u2764 ' + nameForDisplayAsSpouse(personRecordFromName(partner.disambiguatedName)))
	}
    }


    /**************************************************************************/
    getFontSizeForNames ()
    {
	return this._fontSizeForNames;
    }

    
    /**************************************************************************/
    getSpacingBetweenLayers ()
    {
	return DefaultVerticalSpacingActualValue + CurrentVerticalSpacingTicks * 20;
    }


    /**************************************************************************/
    getSpacingBetweenSiblings ()
    {
	return DefaultHorizontalSpacingActualValue + CurrentHorizontalSpacingTicks * 20;
    }


    /**************************************************************************/
    renderLinksAndNodes (treeData, duplicatedRecords)
    {
	/**********************************************************************/
	const makeNamePlusRole = function (personRecord)
	{
	    if (null == personRecord)
		return 'Unknown';

	    var res = personRecord.simpleName;
	    var role = DataHandler.getRoleDescription(personRecord);
	    if (role) res += ` (${role})`;
	    return res;
	}


	
	/**********************************************************************/
	const makeParentDetails = function (personRecord)
	{
	    var fatherWithRole = makeNamePlusRole(EmptyFieldMarker == personRecord.father.disambiguatedName ? null : personRecordFromName(personRecord.father.disambiguatedName));
	    var motherWithRole = makeNamePlusRole(EmptyFieldMarker == personRecord.mother.disambiguatedName ? null : personRecordFromName(personRecord.mother.disambiguatedName));
	    var childWithRole  = makeNamePlusRole(personRecord);
	    return `Details for: ${childWithRole}\nFather: ${fatherWithRole}.\nMother: ${motherWithRole}.`;
	}


	
	/**********************************************************************/
	const makeParentDetailsForLinkNode = function (d) {
	    var person = personRecordFromIndex(d.target.data.ix);
	    return makeParentDetails(person);
	}

	

	/**********************************************************************/
	const makeParentDetailsForTreeNode = function (d) {
	    var person = personRecordFromIndex(d.data.ix);
	    return makeParentDetails(person);
	}


	
	/**********************************************************************/
	/* Render nodes.  For special trees which require more than one root,
	   I have a dummy node at the root from which they all inherit, and
	   we don't want to display that or the links which are connected to
	   it. */

	var dummyNodeAtRoot = 'dummyNode' in personRecordFromIndex(treeData.data.ix);
      
	const nodes = gNodes.selectAll('.node')
              .data(treeData.descendants())
              .join('g')
              .attr('class', 'node')
              .attr('ix', d => d.data.ix.toString())
              .attr('transform', d => `translate(${d.x},${d.y})`);

	if (dummyNodeAtRoot)
	    nodes.classed('noDisplay', d => 'dummyNode' in personRecordFromIndex(d.data.ix));

	for (const node of nodes)
	{
	    d3.select(node)
		.append('title')
		.text(d => makeParentDetailsForTreeNode(d));
	}
	
	DataHandler.addSvgNodePointersToPersonRecords(Array.from(nodes));



	/**********************************************************************/
	/* Alternative functions for drawing links -- take your pick. */

	function curvyLink (d) { return d3.linkVertical().x(d => d.x).y(d => d.y)(d); }

	function properFamilyTreeLink (d)
	{
	    const halfY = (d.target.y - d.source.y) / 2;
	    const res = `M${d.source.x},${d.source.y}
                         V${d.source.y + halfY}
                         H${d.target.x}
                         V${d.target.y}`;
	    return res;
	}
	
	function diagonalLink (d)
	{
	    return `M${d.source.x},${d.source.y}
                    L${d.target.x},${d.target.y}`
	}



	/**********************************************************************/
	/* The aim here is to generate something which looks the same as the
           data created for the primary links -- as far as that is helpful in
	   letting us commonise code elsewhere. */

	const fakeLinks = [];
	for (const d of duplicatedRecords)
	{
	    const parentTreeNode = treeNodeFromPersonRecord(d.bereftParent);
	    const childTreeNode = treeNodeFromPersonRecord(d.child);
	    const parentDetails = {x: parentTreeNode.__data__.x, y: parentTreeNode.__data__.y, data: {ix: indexFromPersonRecord(d.bereftParent) }};
	    const childDetails  = {x: childTreeNode .__data__.x, y: childTreeNode. __data__.y, data: {ix: indexFromPersonRecord(d.child)  }};
	    
	    if ('fakeLinkCount' in parentTreeNode.__data__)
		++parentTreeNode.__data__.fakeLinkCount;
	    else
		parentTreeNode.__data__.fakeLinkCount = 1;
	    
	    fakeLinks.push({ source: parentDetails, target: childDetails });
	}
	
	gLinks.selectAll('.secondaryLink')
	    .data(fakeLinks)
            .join('path')
            .attr('class', 'link secondaryLink')
	    .attr('d', curvyLink)
	    .classed('noDisplay', d => { 'dummyNode' in personRecordFromIndex(d.source.data.ix) })
	    .append('title')
	    .text(d => makeParentDetailsForLinkNode(d));

	

	/**********************************************************************/
	/* Do the real links. */

	gLinks.selectAll('.primaryLink')
            .data(treeData.links())
            .join('path')
            .attr('class', 'link primaryLink')
	    .attr('d', curvyLink)
	    .append('title')
	    .text(d => makeParentDetailsForLinkNode(d));



	/**********************************************************************/
	/* Hide any links which originate at a dummy node. */
	
	if (dummyNodeAtRoot)
	{
	    for (const link of gLinks.selectAll('.link').nodes())
	    {
		const d3Link = d3.select(link);
		const sourcePersonRecord = personRecordFromIndex(d3Link.datum().source.data.ix);
		if ('dummyNode' in sourcePersonRecord)
		    d3Link.classed('noDisplay', true);
	    }
	}

/*
	if (dummyNodeAtRoot)
	{
	    const childrenOfRoot = new Set([...personRecordFromIndex(treeData.data.ix).children.map( x => indexFromName(x.disambiguatedName))] );
	
	    for (const link of gLinks.selectAll('.link').nodes()) {
		const ix = d3.select(link).datum().target.data.ix;
		if (childrenOfRoot.has(ix))
		{
		    d3.select(link).classed('noDisplay', true);
		    childrenOfRoot.delete(ix);
		    if (0 == childrenOfRoot.size)
			break;
		}
	    }
	}    
*/

		    
	/**********************************************************************/
	return nodes
    }


    /**************************************************************************/
    _previousWidth = -1;
}

const LayoutHandler = new ClassVerticalLayoutHandler ();



/******************************************************************************/
class ClassSubtreeHighlightHandler
{  
    /**************************************************************************/
    getJesusLineCollection ()
    {
	return this._jesusCollection;
    }

    
    /**************************************************************************/
    /* Information relating to Jesus is always wanted and never changes, so may
       as well set it up straight away. */
    
    markSpecialTrees ()
    {
	const nodeDetails = SubtreeSelector.createPersonRecordCollectionForLine(personRecordFromName(AdamName), personRecordFromName(JesusName));
	const thunk = { highlightClass: 'linkHighlight-jesusLine', selected: true, nodeDetails: nodeDetails };
	this._trees.set('Jesus', thunk);
	this._jesusCollection = thunk.nodeDetails.collection;
    }

    _trees = new Map();
	    

    /**************************************************************************/
    /* 'because' should be either 'S' (this is being called because the user
       has selected a new node by clicking on it) or 'T' (this is being called
       because the user has asked to have the tree extended to cover a new
       individual). */
    
    newSelection (descendantIx, rootIx, because, colour = 'blue')
    {
	if (-1 == descendantIx) descendantIx = this._subtreeHighlightingPreviousDescendantIx;
	this._newSelection(descendantIx, rootIx, because, colour);
	this._subtreeHighlightingPreviousDescendantIx = descendantIx;
	this._subtreeHighlightingPreviousAncestorIx = rootIx;
    }

    
    /***************************************************************************/
    refresh ()
    {
	this._drawAllTrees();
    }

    
    /***************************************************************************/
    _draw (key)
    {
	const { highlightClass, dummySelected, nodeDetails } = this._trees.get(key);
	const { collection, nonMaleLineLinks, ancestorPersonRecord, descendantPersonRecord } = nodeDetails;
	
    	gLinks.selectAll('.link').each(function (d, i) {
	    const element = d3.select(this);
	    const sourceRecordIx = d.source.data.ix;
	    const targetRecordIx = d.target.data.ix;
	    const sourceRecord = personRecordFromIndex(d.source.data.ix);
	    const targetRecord = personRecordFromIndex(d.target.data.ix);
	    const selected = collection.has(sourceRecord) && collection.has(targetRecord);
	    const treatAsFemaleLine = selected && nonMaleLineLinks.has(sourceRecordIx + ':' + targetRecordIx);
	    if (selected) element.classed(highlightClass, true);
	    if (treatAsFemaleLine) element.classed('linkHighlight-femaleLineOverlay', true);
	});
    }


    /**************************************************************************/
    _highlightingClasses = ['linkHighlight-jesusLine', 'linkHighlight-selectedLine', 'linkHighlight-femaleLineOverlay'];
    _drawAllTrees ()
    {
	/**********************************************************************/
	/* Clear existing link highlighting. */
	
	const me = this;
    	gLinks.selectAll('.link').each(function (d, i) {
	    const element = d3.select(this);
	    me._highlightingClasses.forEach(className => { element.classed(className, false) });
	});



	/**********************************************************************/
	for (const [key, value] of this._trees)
	    if (value.selected)
		this._draw(key);
    }


    /**************************************************************************/
    _newSelection (descendantIx, ancestorIx, because, colour)
    {
	/**********************************************************************/
	/* First time.  Draw everything between descendantIx (which will be the
           selected person) and the root. */
	
	if (-1 == this._subtreeHighlightingPreviousDescendantIx)
	{
	    this._subtreeHighlightingPreviousDescendantIx = descendantIx;
	    this._subtreeHighlightingPreviousAncestorIx = ancestorIx;

	    if (descendantIx != ancestorIx) // Nothing to highlight if target and root coincide.
	    {
		const nodeDetails = SubtreeSelector.createPersonRecordCollectionRootAndAncestors(personRecordFromIndex(descendantIx), personRecordFromIndex(ancestorIx));
		this._trees.set('', { highlightClass: 'linkHighlight-selectedLine', selected: true, nodeDetails: nodeDetails} );
	    }

	    this._drawAllTrees();
	    return;
	}

	

	/**********************************************************************/
	/* It might seem there are some simple changes from here on which
           would require very little work.  For instance, what if neither the
           target nor the root have changed?  Trouble is that the user can add
           extra nodes at the bottom of the tree, which would leave both root
           and target unchanged, but would still require us potentially to
           redraw everything.

	   Just one extra thing to be aware of.  If the previous target was
           selected because the user asked to have the branch down to a given
           individual added to the display, it's probably best to assume that's
	   still of interest, so if the new target was as a result of clicking
           on a given node rather than as a result of expanding down to a new
	   individual, it makes sense to retain the previous target. */

	var nodeDetails;
	const ancestorPersonRecord = personRecordFromIndex(ancestorIx);
	const descendantPersonRecord = personRecordFromIndex(descendantIx);


	
	/**********************************************************************/
	/* If we're being called because the user has asked to add the branch
	   down to a given individual, that individual definitely becomes the
	   target and we want all nodes between them and the current root. */
	
	if ('T' == because) // We're targetting an individual, so therefore we definitely want to work with the new target.
	{
	    nodeDetails = SubtreeSelector.createPersonRecordCollectionForLine(ancestorPersonRecord, personRecordFromIndex(descendantIx));
	    this._subtreeHighlightingPreviousTargetSelectedBecause = 'T';
	}



	/**********************************************************************/
	/* If the previous update was because of a selected individual, then
           we retain that individual as the target if the new selection
	   lies within the ancestor chain of that individual.  That way we
	   continue to have the previous highlighting, but that also highlights
	   the new selection. */
	
	else if ('T' == this._subtreeHighlightingPreviousTargetSelectedBecause) // We're being called because they've changed selection and previously we were called because they selected an individual.
	{
	    nodeDetails = SubtreeSelector.createPersonRecordCollectionForLine(ancestorPersonRecord, personRecordFromIndex(this._subtreeHighlightingPreviousDescendantIx));
	    if (nodeDetails.collection.has(descendantPersonRecord))
		nodeDetails.ancestorPersonRecord = personRecordFromIndex(this._subtreeHighlightingPreviousDescendantIx);
	    else
	    {
		nodeDetails = SubtreeSelector.createPersonRecordCollectionForLine(ancestorPersonRecord, personRecordFromIndex(descendantIx));
		this._subtreeHighlightingPreviousTargetSelectedBecause = 'S';
	    }
	}



	/**********************************************************************/
	/* Otherwise, it was 'S' previously and is 'S' now, and we simply want
	   to go with what we've been given. */
	
	else
	    nodeDetails = SubtreeSelector.createPersonRecordCollectionForLine(ancestorPersonRecord, personRecordFromIndex(descendantIx));



	/**********************************************************************/
	this._trees.set('', { highlightClass: 'linkHighlight-selectedLine', selected: true, nodeDetails: nodeDetails} );
	this._drawAllTrees();
    }


    /**************************************************************************/
    _subtreeHighlightingPreviousTargetSelectedBecause = null;
    _subtreeHighlightingPreviousAncestorIx = -1;
    _subtreeHighlightingPreviousDescendantIx = -1;
}


/******************************************************************************/
class ClassPresentationHandler
{
    /**************************************************************************/
    changeRootToFather () { this.reviseTreeNewRoot(indexFromName(personRecordFromIndex(this.getRootPersonIx()).father.disambiguatedName)); }
    changeRootToGivenPersonByIndex (ix) { this.newTree(ix); }
    changeRootToGivenPersonByName (dName) { this.newTree(indexFromName(dName)); }
    changeRootToMother () { this.reviseTreeNewRoot(indexFromName(personRecordFromIndex(this.getRootPersonIx()).mother.disambiguatedName)); }


    /**************************************************************************/
    changeRelationsHighlighting (highlighting, ix = this.getSelectedPersonIx())
    {
	if (-1 == ix)
	    return;

	const sourcePersonRecord = personRecordFromIndex(ix);

	for (const relatedPerson of sourcePersonRecord.siblings)
        {
	    const personRecord = personRecordFromName(relatedPerson.disambiguatedName);
	    try // Try means we don't need to worry if some of the related individuals are not actually displayed.
	    {
		const textNode = personRecord.treeNode.querySelector('text');
		d3.select(textNode).classed('highlightSiblings', highlighting);
	    }
	    catch (e)
	    {
	    }
	}

	
	for (const relatedPerson of sourcePersonRecord.children)
        {
	    const personRecord = personRecordFromName(relatedPerson.disambiguatedName);
	    try // Try means we don't need to worry if some of the related individuals are not actually displayed.
	    {
		const textNode = personRecord.treeNode.querySelector('text');
		d3.select(textNode).classed('highlightChildren', highlighting);
	    }
	    catch (e)
	    {
	    }
	}
    }


    /**************************************************************************/
    /* Changes the highlighting, but does not otherwise change the tree. */
    
    changeSelectedPerson (ix)
    {
	this._refreshRelationsHighlighting(ix);
	this._changeOrRefreshSelectedPerson(ix);
	this.SubtreeHighlightHandler.newSelection(ix, this.getRootPersonIx(), 'S');
    }

    
    /**************************************************************************/
    getRootPersonIx     () { return this._rootPersonIx;     }
    getSelectedPersonIx () { return this._selectedPersonIx; }

    
    /**************************************************************************/
    /* Replaces the entire tree with a new one, at the same time removing
       highlighting etc. */
    
    newTree (ix)
    {
	const rootPerson = personRecordFromIndex(ix);
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPerson, this._selectedRecords);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, ix, ix);
	this.SubtreeHighlightHandler.newSelection(ix, ix, 'T');
    }

    
    /**************************************************************************/
    /* Just redraws the existing content. */
    
    refresh ()
    {
	requestAnimationFrame(() => {
	    this._redraw(this._root, this.getRootPersonIx(), this.getSelectedPersonIx());
	    this.changeSelectedPerson(this.getSelectedPersonIx());
	});
    }

    
    /**************************************************************************/
    /* Called after a reload in order to redraw the previous material with the
       previously-selected scaling and separations etc. */
    
    refreshFromDataSavedInParentWindow (data)
    {
	this._rootPersonIx = data.rootPersonIx;
	this._selectedPersonIx = data.selectedPersonIx;
	
	CurrentNumberOfGenerationsToGrowByOnEachExpansion = data.numberOfGenerationsToGrowByOnEachExpansion;
	CurrentHorizontalSpacingTicks = data.horizontalSpacingTicks;
	CurrentVerticalSpacingTicks = data.verticalSpacingTicks;

	requestAnimationFrame(() => {
	    this._redraw(this._root, this.getRootPersonIx(), this.getSelectedPersonIx());
	    this.changeSelectedPerson(this.getSelectedPersonIx());
	});
    }

    
    /**************************************************************************/
    /* Called after a resize event.  Simply redrws whatever we were displaying
       previously. */
    
    resize ()
    {
	this.refresh();
    }

    
    /**************************************************************************/
    /* Adds to the existing tree a branch all the way down to a selected
       individual. */
    
    reviseTreeAddBranchDownAsFarAsIndividual (ix)
    {
	const rootOfAddition = personRecordFromIndex(this.getSelectedPersonIx());
	const additionalRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(rootOfAddition, personRecordFromIndex(ix), 'B');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByRetentionOnly(personRecordFromIndex(this.getRootPersonIx()), setUnion(this._selectedRecords, additionalRecords), this._excludedRecords);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, this.getRootPersonIx(), this.getSelectedPersonIx())
	this.SubtreeHighlightHandler.newSelection(ix, this.getRootPersonIx(), 'T');
    }

    
    /**************************************************************************/
    /* Retains the existing tree but adds a subtree below a leaf node.  Branch
       highlighting may be incremented to include elements within the new
       subtree. */
    
    reviseTreeAddLeafSubtree (ix)
    {
	var tempRootPerson = personRecordFromIndex(ix);
	const [additionalRecords, _, __] = SubtreeSelector.createTreeByGenerationOrRetention(tempRootPerson, this._selectedRecords, this._excludedRecords);

	var rootPerson = personRecordFromIndex(this.getRootPersonIx());
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPerson, setUnion(this._selectedRecords, additionalRecords), this._excludedRecords);

	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, this.getRootPersonIx(), ix);
	this.SubtreeHighlightHandler.newSelection(ix, this.getRootPersonIx(), 'T');
    }

	
    /**************************************************************************/
    /* Determines a new set of nodes rooted at the ix'th person, adds them to
       any existing records being displayed, and then makes the ix'th person the
       root of the tree.  Branch highlighting will be extended to cover the new
       entries. */

    reviseTreeNewRoot (ix)
    {
	const rootPerson = personRecordFromIndex(ix);
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPerson, this._selectedRecords, this._excludedRecords);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, ix, this.getSelectedPersonIx());
	this.SubtreeHighlightHandler.newSelection(-1, ix, 'S');
	
    }
	

    /**************************************************************************/
    /* Retains the existing tree but removes from it the subtree below a given
       node. */
    
    reviseTreeRemoveSubtree (ix)
    {
	var tempRootPerson = personRecordFromIndex(ix);
	const recordsToRemove = SubtreeSelector.createPersonRecordCollectionRootAndDescendants(tempRootPerson);
	recordsToRemove.delete(tempRootPerson);
	this._addToExcludedRecords(recordsToRemove);

	var rootPerson = personRecordFromIndex(this.getRootPersonIx());
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByRetentionOnly(rootPerson, this._selectedRecords, this._excludedRecords);

	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, this.getRootPersonIx(), this.getSelectedPersonIx());
	this.SubtreeHighlightHandler.refresh();
    }
	

    /**************************************************************************/
    /* Adam to Jesus, male line. */
    
    showTreeAdamToJesus ()
    {
	const adamPersonRecord = personRecordFromName('Adam@Gen.2.19-Jud');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByFromAndTos(adamPersonRecord, [personRecordFromName('Jesus@Isa.7.14-Rev')], 'M');
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, adamPersonRecord);
	this.SubtreeHighlightHandler.refresh();
    }

    
    /**************************************************************************/
    /* All nodes from Adam to (and including) sons of Noah. */
    
    showTreeAdamToSonsOfNoah ()
    {
	this._treeForRootToTargetAndSiblings('Adam@Gen.2.19-Jud', 'Shem@Gen.5.32-Luk');
    }


    /**************************************************************************/
    /* Moses and siblings in the context of Amram. */
    
    showTreeAmramMosesAndAaron ()
    {
	const amramPersonRecord = personRecordFromName('Amram@Exo.6.18-1Ch');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(amramPersonRecord, null, null, 5);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, amramPersonRecord);
    }

    
    /**************************************************************************/
    /* David and some generations below. Including Boaz and Ruth for context. */
    
    showTreeDavid ()
    {
	DataHandler.initialiseDummyRecords();
	const rootPersonRecord = personRecordFromName(DataHandler.getNextAvailableDummyRecordName());
	rootPersonRecord.children = [{ disambiguatedName: 'Boaz@Rut.2.1-Luk' }, { disambiguatedName: 'Ruth@Rut.1.4-Mat' }];
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPersonRecord, null, null, 5 + 1);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, rootPersonRecord, indexFromName('David@Rut.4.17-Rev'));
    }

    
    /**************************************************************************/
    /* High priests -- family tree from Aaron. */
    
    showTreeHighPriests ()
    {
	this._treeForRootAndNumberOfGenerations('Aaron@Exo.4.14-Heb', 9999);
    }

    
    /**************************************************************************/
    /* Starting at Isaac and down to the 12 tribes and their immediate
       children. */
    
    showTreeIsaacIsraelAndTheTwelveTribes ()
    {
	var selectedRecordsAccumulator = new Set();
	const isaacPersonRecord = personRecordFromName('Isaac@Gen.17.19-Jas');
	const israelPersonRecord = personRecordFromName('Israel@Gen.25.26-Rev');
	for (const c of israelPersonRecord.children)
	{
	    const [sel, _, __] = SubtreeSelector.createTreeByGenerationOrRetention(personRecordFromName(c.disambiguatedName), null, null, 1);
	    selectedRecordsAccumulator = new Set( [...selectedRecordsAccumulator, ...sel] );
	}

	const [selectedRecordsIsaacToIsrael, _, __] = SubtreeSelector.createTreeByFromAndTos(isaacPersonRecord, [israelPersonRecord], 'M');

	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(isaacPersonRecord, new Set( [...selectedRecordsAccumulator, ...selectedRecordsIsaacToIsrael] ), null, -1);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, isaacPersonRecord);
    }

    
    /**************************************************************************/
    /* Four generations from Judah. */
    
    showTreeJudahSelectedDescendants ()
    {
	const judahPersonRecord = personRecordFromName('Judah@Gen.29.35-Rev');
	const [generalSelectedRecords, x1, x2] = SubtreeSelector.createTreeByGenerationOrRetention(judahPersonRecord, null, null, 4);
	const amminadabSelectedRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(personRecordFromName('Amminadab@Exo.6.23-Luk'), personRecordFromName('David@Rut.4.17-Rev'), 'M');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(judahPersonRecord, new Set( [...generalSelectedRecords, ...amminadabSelectedRecords] ), null, -1);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, judahPersonRecord);
//$$$	this.SubtreeHighlightHandler.newSelection(this.getRootPersonIx(), this.getSelectedPersonIx(), 'S');
    }

    
    /**************************************************************************/
    /* Heli to Mary. */
    
    showTreeMary ()
    {
	this._treeForRootAndNumberOfGenerations('Heli@Luk.3.23', 9999);
	this.changeSelectedPerson(indexFromName('Mary@Mat.1.16-Act'));
    }

    
    /**************************************************************************/
    showTreeNoahToAbraham ()
    {
	const noahPersonRecord = personRecordFromName('Noah@Gen.5.29-2Pe');
	const [abrahamSelectedRecords, x1, x2] = SubtreeSelector.createTreeByFromAndTos(noahPersonRecord, [personRecordFromName('Abraham@Gen.11.26-1Pe')], 'M');
	const [generalSelectedRecords, x3, x4] = SubtreeSelector.createTreeByGenerationOrRetention(noahPersonRecord, null, null, 3);
	const [cushSelectedRecords,    x5, x6] = SubtreeSelector.createTreeByGenerationOrRetention(personRecordFromName('Cush@Gen.10.6-1Ch'), null, null, 2);
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(noahPersonRecord, new Set( [...abrahamSelectedRecords, ...generalSelectedRecords, ...cushSelectedRecords] ), null, -1);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, noahPersonRecord);
    }

    
    /**************************************************************************/
    showTreeOriginOfNations ()
    {
	this.showTreeNoahToAbraham();
    }

    
    /**************************************************************************/
    /* Rahab to Jesus, male line. */
    
    showTreeRahabToJesus ()
    {
	const rahabPersonRecord = personRecordFromName('Rahab@Jos.2.1-Jas');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByFromAndTos(rahabPersonRecord, [personRecordFromName('Jesus@Isa.7.14-Rev')], 'B');
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, rahabPersonRecord);
	this.SubtreeHighlightHandler.refresh();
    }

    
    /**************************************************************************/
    /* 1) Nebat, 2) Omri (with no limit) and 3) David (with Asa extended for 14
       generations to Jehoiachin).  */

    showTreeRoyalFamily ()
    {
	/*********************************************************************/
	DataHandler.initialiseDummyRecords();


	
	/*********************************************************************/
	/* The dummy node which will act as the root of the overall hierarchy,
	   thus enabling us to avoid having to have multiple trees (which
	   d3.js does not handle). */
	
	const rootPersonRecordName = DataHandler.getNextAvailableDummyRecordName();
	const rootPersonRecord = personRecordFromName(rootPersonRecordName);



	/*********************************************************************/
	/* For Nebat, we need one intermediary dummy node to bring it to the
	   correct level.  We are fortunate that Nebat does not have any
	   parents, so I can add father details temporarily without losing
	   any vital information. */
	
	const nebatDummyRecordName = DataHandler.getNextAvailableDummyRecordName();
	const nebatDummyRecord = personRecordFromName(nebatDummyRecordName);
	
	const nebatPersonRecord = personRecordFromName('Nebat@1Ki.11.26-2Ch');

	nebatDummyRecord.father.disambiguatedName = rootPersonRecordName; // The dummy's father will be the root.  I deal with the link in the other direction shortly.
	nebatDummyRecord.children = [ {disambiguatedName: 'Nebat@1Ki.11.26-2Ch'} ]; // The dummy has the real record as its only child.
	nebatPersonRecord.father.disambiguatedName = nebatDummyRecordName; // The real record has the dummy as its father.
	
	const nebatSelectedRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(nebatDummyRecord, personRecordFromName('Nadab@1Ki.14.20-'));



	/*********************************************************************/
	/* If you thought that was yucky, Omri needs _five_ intermediate
	   levels.  Once again, though, at least he doesn't have any parents
	   for us to worry about. */

	const omriDummyRecordNames = [];
	const omriDummyPersonRecords = [];
	for (var i = 0; i < 5; ++i)
	{
	    const name = DataHandler.getNextAvailableDummyRecordName();
	    omriDummyRecordNames.push(name);
	    omriDummyPersonRecords.push(personRecordFromName(name));
	}

	const omriPersonRecord = personRecordFromName('Omri@1Ki.16.16-Mic');

	omriPersonRecord.father.disambiguatedName = omriDummyRecordNames[0];
	omriDummyPersonRecords[0].children = [ {disambiguatedName: 'Omri@1Ki.16.16-Mic'} ];

	for (var i = 1; i < 5; ++i)
	{
	    omriDummyPersonRecords[i].children = [ {disambiguatedName: omriDummyRecordNames[i - 1]} ];
	    omriDummyPersonRecords[i - 1].father.disambiguatedName = omriDummyRecordNames[i];
	}

	omriDummyPersonRecords[4].father.disambiguatedName = rootPersonRecordName;
	    
	
				       
	/*********************************************************************/
	rootPersonRecord.children = [ {disambiguatedName: omriDummyRecordNames[4]}, {disambiguatedName: 'David@Rut.4.17-Rev'}, {disambiguatedName: nebatDummyRecordName} ];

	const [omriSelectedRecordsA, x1, x2] = SubtreeSelector.createTreeByGenerationOrRetention(personRecordFromName('Omri@1Ki.16.16-Mic' ), null, null, 2);
	const omriSelectedRecordsB = SubtreeSelector.getRecordSetBetweenFromAndTo(personRecordFromName('Omri@1Ki.16.16-Mic' ), personRecordFromName('Jehoiachin@2Ki.24.6-Mat'));
	const davidSelectedRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(personRecordFromName('David@Rut.4.17-Rev' ), personRecordFromName('Ahaziah@2Ki.8.24-2Ch'   ));

	const selectedRecordsA = new Set( [...nebatSelectedRecords, ...omriSelectedRecordsA, ...omriSelectedRecordsB, ...davidSelectedRecords] );
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByRetentionOnly(rootPersonRecord, selectedRecordsA, null);

	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, rootPersonRecord, indexFromName('David@Rut.4.17-Rev'));



	/*********************************************************************/
	/* Remove father details from the actual person records, because they
	   don't really have fathers.  Just hope this isn't premature ... */
	
	nebatPersonRecord.father.disambiguatedName = EmptyFieldMarker;
	omriPersonRecord.father.disambiguatedName  = EmptyFieldMarker;
	
/*
	const rootPersonRecord = personRecordFromName(NameForDummyRecord);
	rootPersonRecord.children = [ {disambiguatedName: 'Omri@1Ki.16.16-Mic'}, {disambiguatedName: 'David@Rut.4.17-Rev'},{disambiguatedName: 'Nebat@1Ki.11.26-2Ch'} ];

	const nebatSelectedRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(personRecordFromName('Nebat@1Ki.11.26-2Ch'), personRecordFromName('Nadab@1Ki.14.20-'       ));
	const [omriSelectedRecordsA, x1, x2] = SubtreeSelector.createTreeByGenerationOrRetention(personRecordFromName('Omri@1Ki.16.16-Mic' ), null, null, 2);
	const omriSelectedRecordsB = SubtreeSelector.getRecordSetBetweenFromAndTo(personRecordFromName('Omri@1Ki.16.16-Mic' ), personRecordFromName('Jehoiachin@2Ki.24.6-Mat'));
	const davidSelectedRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(personRecordFromName('David@Rut.4.17-Rev' ), personRecordFromName('Ahaziah@2Ki.8.24-2Ch'   ));

	const selectedRecordsA = new Set( [...nebatSelectedRecords, ...omriSelectedRecordsA, ...omriSelectedRecordsB, ...davidSelectedRecords] );
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByRetentionOnly(rootPersonRecord, selectedRecordsA, null);

	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, rootPersonRecord, indexFromName('David@Rut.4.17-Rev'));
*/
    }

    
    /**************************************************************************/
    /* Saul -- starting at Abiel for n generations. */
    
    showTreeSaul ()
    {
	const abielPersonRecord = personRecordFromName('Abiel@1Sa.9.1-1Ch');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(abielPersonRecord, null, null, 3);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, abielPersonRecord, indexFromName('Saul@1Sa.9.2-Act'));
    }

    
    /**************************************************************************/
    /* Terah through Abraham to Israel. */
    
    showTreeTerahAbrahamAndIsrael ()
    {
	const terahPersonRecord = personRecordFromName('Terah@Gen.11.24-Luk');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(terahPersonRecord, null, null, 3);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, terahPersonRecord, indexFromName('Israel@Gen.25.26-Rev'));
    }

    
    /**************************************************************************/
    translateGraphics (newX, newY)
    {
	ScrollButtonHandler.translateGraphics(newX, newY);
    }


    /**************************************************************************/
    /* I'm not sure we really need _excludedRecords at all, since we achieve
       the same effect here by removing the excluded records from
       _selectedRecords.  I'm retaining it on the off-chance. */
    
    _addToExcludedRecords (exclusions)
    {
	this._excludedRecords = setUnion(this._excludedRecords, exclusions);
	this._selectedRecords = setDifference(this._selectedRecords, this._excludedRecords);
    }

    
    /**************************************************************************/
    /* Handles highlighting a single individual and their associated text
       node. */
    
    _changeOrRefreshSelectedPerson (ix)
    {
	/**********************************************************************/
	try // Unhighlight the existing selection -- except we won't be able to if the previously highlighted node is no longer in the tree.
	{   // try-catch avoids the need for a test which relies on me successfully keeping tabs on what's going on.
	    
	    circleNodeFromIndex(this.getSelectedPersonIx()).style('fill', 'steelblue');
	    textNodeFromIndex  (this.getSelectedPersonIx()).classed('highlightSelectedIndividual', false);
	}
	catch (e)
	{
	}
	


	/**********************************************************************/
	/* Highlight the new node and update the info box. */
	
	circleNodeFromIndex(ix).style('fill', 'red');
	textNodeFromIndex(ix).classed('highlightSelectedIndividual', true);
	this._fillInfoBox(ix);



	/**********************************************************************/
	/* Inform the rest of the world that the selection has changed, if
           appropriate. */
	
	if (ix != this.getSelectedPersonIx())
	    MultiframeController.sendMessage('peopleIndex', nameFromIndex(ix));



	/**********************************************************************/
	this._setSelectedPersonIx(ix);
    }


    /**************************************************************************/
    /* Fills in the content of the info box, sorts out links, etc. */

    _fillInfoBox (ix)
    {
	/************************************************************************/
	var personRecord = personRecordFromIndex(ix)
	const infoBoxContent = d3.select('#info-box-content')
	const personName = personRecord.simpleName + '@' + personRecord.referenceFromUnifiedName;



	/************************************************************************/
	const fatherName = personRecord.father.disambiguatedName;
	const motherName = personRecord.mother.disambiguatedName;
	const partners   = personRecord.partners || [];
	const children   = personRecord.children || [];
	const siblings   = personRecord.siblings || [];
	const summaryDescription = personRecord.summaryDescription;
	const longDescription = personRecord.longDescription;
	const alternativeNames = 0 == personRecord.alternativeNames.length ? '' : '; aka ' + personRecord.alternativeNames.map( x => x.replace('@', ':') ) + '.';

	const ambiguity = EmptyFieldMarker == personRecord.ambiguity ? '' :
	      `<p><b>Differing interpretations exist here.</b>  Click <a href='${personRecord.ambiguity}' target='_blank'>here</a> for details.</p>`;

	const partnerList = 0 == partners.length ? '' :
	      `<p><b>Partners:</b>  ${partners.length  > 0 ? partners.map (partner => `<span class="partner-link simulatedLink">${nameForDisplayInBodyOfInfoBoxGivenNameKey(partner.disambiguatedName)}</span>`).join(", ") : "-" }</p>`;

	const siblingList = 0 == siblings.length ? '' :
	      `<p><b>Siblings:</b>  ${siblings.length  > 0 ? siblings.map (sibling => `<span class="sibling-link simulatedLink">${nameForDisplayInBodyOfInfoBoxGivenNameKey(sibling.disambiguatedName)}</span>`).join(", ") : "-" }</p>`;
    
	const childrenList = 0 == children.length ? '' :
	      `<p><b>Children:</b> ${children.length > 0 ? children.map(kid     => `<span class="children-link simulatedLink">${nameForDisplayInBodyOfInfoBoxGivenNameKey(kid.disambiguatedName)}</span>`).join(", ") : "-" }</p>`;

	const generationsFromAdam = -1 == personRecord.generationsFromAdam ? '' :
	      `<p><b>Generations after Adam:</b> ${personRecord.generationsFromAdam} or more (see help for explanation).</p>`;

	const generationsToJesus = personRecord.generationsToJesus <= 0 ? '' :
	      `<p><b>Generations before Jesus:</b> ${personRecord.generationsToJesus} or more (see help for explanation).</p>`;

	const summaryDescriptionX = '' == summaryDescription ? '' : '<p>' + summaryDescription + '</p>';

	const longDescriptionX    = '' == longDescription    ? '' : '<p>' + longDescription    + '</p>';
    
	infoBoxContent
	    .html(`
              <p><span style='font-size:x-large'>${DataHandler.getSummaryIcon(personRecord)}</span>
                <span class="person-link simulatedLink">${nameForDisplayInBodyOfInfoBoxGivenPersonRecord(personRecord)}</span>
                &nbsp;(first mentioned at ${firstScriptureReference(personRecord)})
                ${alternativeNames}
              </p>

              ${partnerList}

              <p><b>Father:</b> ${fatherName !== EmptyFieldMarker ? `<span class="father-link simulatedLink">${nameForDisplayInBodyOfInfoBoxGivenNameKey(fatherName)}</span>` : '-' }
              &nbsp;&nbsp;&nbsp;<b>Mother:</b> ${motherName !== EmptyFieldMarker ? `<span class="mother-link simulatedLink">${nameForDisplayInBodyOfInfoBoxGivenNameKey(motherName)}</span>` : '-' }
              ${siblingList}
              ${childrenList}
              ${generationsFromAdam}
              ${generationsToJesus}
              ${ambiguity}
              ${summaryDescriptionX}
              ${longDescriptionX}
              `);

	infoBoxContent.select('.person-link').on('click', () => { PresentationHandler.changeRootToGivenPersonByIndex(ix); });
	if (fatherName !== EmptyFieldMarker)  { infoBoxContent.select   ('.father-link')                                .on('click', () => { PresentationHandler.changeRootToGivenPersonByName(fatherName); }); }
	if (motherName !== EmptyFieldMarker)  { infoBoxContent.select   ('.mother-link')                                .on('click', () => { PresentationHandler.changeRootToGivenPersonByName(motherName); }); }
	siblings .forEach((sibling, index) => { infoBoxContent.selectAll('.sibling-link') .filter((d, i) => i === index).on('click', () => { PresentationHandler.changeRootToGivenPersonByName(sibling.disambiguatedName); }); });
	partners .forEach((partner, index) => { infoBoxContent.selectAll('.partner-link') .filter((d, i) => i === index).on('click', () => { PresentationHandler.changeRootToGivenPersonByName(partner.disambiguatedName); }); });
	children .forEach((kid,     index) => { infoBoxContent.selectAll('.children-link').filter((d, i) => i === index).on('click', () => { PresentationHandler.changeRootToGivenPersonByName(kid.disambiguatedName); }); });
	


	/************************************************************************/
	/* If we're in an iframe, change all scripture refs to psuedo links which
	   will change the content of the scripture window. */
	   
	if (MultiframeController.targetExists('scripture'))
	{
            const infoBox = document.getElementById('info-box');
            Array.from(infoBox.getElementsByTagName('xref')).forEach (element => {
		element.style.color = 'blue';
		element.style.cursor = 'pointer';
		element.onclick = function() { MultiframeController.setUrl('scripture', window.location.origin + '/?skipwelcome&q=' + 'reference=' + element.getAttribute('ref')) }
            });
	}

	document.getElementById('info-box').scrollTop = 0;
    }


    
    /**************************************************************************/
    /* rootPersonIx may or may not signify the same root person as we already
       have.  Either way we can handle things the same way.

       Similarly selectedPersonIx may or may not signify the person already
       selected.  This may influence matters. */
    
    _redraw (root, rootPersonIx, selectedPersonIx)
    {
	this._root = root;
	this._setRootPersonIx(rootPersonIx);
	GraphicsHandler.renderTree(this._root, this._duplicatedRecords);
	this._updateMotherFatherButtons(rootPersonIx);
	this._refreshRelationsHighlighting(selectedPersonIx);
	this._changeOrRefreshSelectedPerson(selectedPersonIx);
    }

    
    /**************************************************************************/
    /* For use by processing for built-in trees, where we have a specific
       selection of records which need to be processed. */
    
    _redrawUsingJustSelectedRecords (root, rootPersonRecord, selectedPersonIx = null)
    {
	ControlsHandler.hideMainMenu();
	const rootPersonIx = indexFromPersonRecord(rootPersonRecord);
	const selectedIx = selectedPersonIx ? selectedPersonIx : rootPersonIx;
	this._redraw(root, rootPersonIx, selectedIx);
	this.SubtreeHighlightHandler.newSelection(selectedIx, rootPersonIx, 'S');
	LayoutHandler.adjustPositionOfRootNode(true);
    }

    
    /**************************************************************************/
    /* Handles highlighting of siblings and children. */
    
    _refreshRelationsHighlighting (ix)
    {
	this.changeRelationsHighlighting(false, this.getSelectedPersonIx());
	this.changeRelationsHighlighting(document.getElementById('highlightRelations').checked);
    }

	
    /**************************************************************************/
    _saveDataInParentWindow ()
    {
	if (-1 != this.getRootPersonIx() && -1 != this.getSelectedPersonIx())
	    saveDataInParentWindow();
    }

    
    /**************************************************************************/
    _setRootPersonIx     (ix) { this._rootPersonIx     = ix; this._saveDataInParentWindow(); }
    _setSelectedPersonIx (ix) { this._selectedPersonIx = ix; this._saveDataInParentWindow(); }

    
    /**************************************************************************/
    _setSelectedAndDuplicated (selectedRecords, duplicatedRecords)
    {
	this._selectedRecords = selectedRecords;
	this._duplicatedRecords = duplicatedRecords;
    }

    
    /**************************************************************************/
    _treeForRootAndNumberOfGenerations (rootName, generations)
    {
	const rootPersonRecord = personRecordFromName(rootName);
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPersonRecord, null, null, generations)
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, rootPersonRecord);
    }

    
    /**************************************************************************/
    _treeForRootToTargetAndSiblings (rootName, targetName)
    {
	const rootPersonRecord = personRecordFromName(rootName);
	const targetPersonRecordA = personRecordFromName(targetName);
	const targetOtherPersonRecords = targetPersonRecordA.siblings.map( x => personRecordFromName(x.disambiguatedName) );
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByFromAndTos(rootPersonRecord, [targetPersonRecordA, ...targetOtherPersonRecords]);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, rootPersonRecord);
    }


    /******************************************************************************/
    _updateMotherFatherButtons (ix)
    {
	const person = personRecordFromIndex(ix);
	if (DataHandler.hasFather(person))
	    $('#fatherButton').removeClass('disabled');
	else
	    $('#fatherButton').addClass('disabled');
    
	if (DataHandler.hasMother(person))
	    $('#motherButton').removeClass('disabled');
	else
	    $('#motherButton').addClass('disabled');
    }


    
    /**************************************************************************/
    _duplicatedRecords = [];
    _excludedRecords = new Set();
    _highlightingChildren = true;
    _highlightingSiblings = true;
    _root = null;
    _rootPersonIx = -1;
    _selectedPersonIx = -1;
    _selectedRecords = new Set();
    SubtreeHighlightHandler = new ClassSubtreeHighlightHandler();  
}

const PresentationHandler = new ClassPresentationHandler();  





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                        General implementation                            **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class ClassGraphicsHandler
{  
    /**************************************************************************/
    /* Draws the tree and creates click handlers etc. */

    renderTree (rootNodeOfDataTree, duplicatedRecords)
    {
	/**********************************************************************/
	//dbgPrintTree(rootNodeOfDataTree);


	
	/**********************************************************************/
	/* Needed to retain original zoom and translation when redrawing. */
	
	const currentTransform = d3.zoomTransform(svg.node());



	/**********************************************************************/
	/* For explanation, see FrameWidthLastUsed. */
    
	FrameWidthLastUsed = window.innerWidth;



	/**********************************************************************/
	const treeLayout = d3.tree()
	      .nodeSize([LayoutHandler.getSpacingBetweenSiblings(), LayoutHandler.getSpacingBetweenLayers()])
	      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5)); // More spacing between unrelated nodes
	const root = d3.hierarchy(rootNodeOfDataTree);
	const treeData = treeLayout(root);



	/**********************************************************************/
	gNodes.selectAll('*').remove(); // Clear previous tree
	gLinks.selectAll('*').remove(); // Clear previous tree



	/**********************************************************************/
	/* Draw tree. */

	const nodes = LayoutHandler.renderLinksAndNodes(treeData, duplicatedRecords)
	nodes.append('circle').attr('r', 5);
	LayoutHandler.createAndPositionTextNodes(nodes);



	/**********************************************************************/
	/* Add functionality to deal with node-clicks. */
    
	const leftClickHandler = function (event, d) { PresentationHandler.changeSelectedPerson(d.data.ix); };
	const rightClickHandler = function (event, d) { ContextMenuHandler.showMenu(event, d); };
	nodes.on('click', leftClickHandler);
	nodes.on('contextmenu', rightClickHandler);
	nodes.style('cursor', 'pointer');
	const textNodes = svg.selectAll('text');
	textNodes.style('font-size', LayoutHandler.getFontSizeForNames());
	const repositioned = LayoutHandler.adjustPositionOfRootNode();



	/**********************************************************************/
	/* Needed to retain original zoom and translation when redrawing. */
	
	if (!this._firstTime && !repositioned)
	    svg.call(D3Support.zoom.transform, currentTransform);
	this._firstTime = false;
    }


    /**************************************************************************/
    _firstTime = true;
}

const GraphicsHandler = new ClassGraphicsHandler();





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                            Controls and menus                            **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                Controls                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class ClassControlsHandler
{ 
    /**************************************************************************/
    showHelpMenu ()
    {
	const me = this;

	document.getElementById('help').style.display = 'flex';
	const menu = document.getElementById('help');
	menu.style.top = '20px';
	menu.style.left = (window.innerWidth - menu.offsetWidth) / 2 + 'px';
    }

  
    /**************************************************************************/
    showMainMenu ()
    {
	const me = this;

	PopUpHandler.popUpIsVisible(function () { me.hideMainMenu() });
	
	document.getElementById('mainMenu').style.display = 'block';

	const menu = document.getElementById('mainMenu');
	//const rect = document.getElementById('mainMenuButton').getBoundingClientRect();
	menu.style.top = '20px';
	menu.style.left = (window.innerWidth - menu.offsetWidth) / 2 + 'px';

	document.getElementById('importantTreesContainer').scrollTop = 0;
	document.getElementById('horizontalSpacingSlider').value = CurrentHorizontalSpacingTicks;
	document.getElementById('verticalSpacingSlider').value = CurrentVerticalSpacingTicks;
	document.getElementById('numberOfGenerationsSlider').value = CurrentNumberOfGenerationsToGrowByOnEachExpansion;
    }

  
    /**************************************************************************/
    hideMainMenu ()
    {
	PopUpHandler.popUpIsInvisible();
	document.getElementById('mainMenu').style.display = 'none';
    }

    
    /****************************************************************************/
    /* Handles the sliders which determine spacing and number of generations. */
  
    setupSliders ()
    {
	document.getElementById('horizontalSpacingSlider').addEventListener('input', (event) => {
	    event.stopPropagation();
	    CurrentHorizontalSpacingTicks = parseInt(event.target.value, 10);
	    saveDataInParentWindow();
	    PresentationHandler.refresh();
	});

	document.getElementById('verticalSpacingSlider').addEventListener('input', (event) => {
	    CurrentVerticalSpacingTicks = parseInt(event.target.value, 10);
	    saveDataInParentWindow();
	    PresentationHandler.refresh();
	});

	document.getElementById('numberOfGenerationsSlider').addEventListener('input', (event) => {
	    CurrentNumberOfGenerationsToGrowByOnEachExpansion = parseInt(event.target.value, 10);
	    saveDataInParentWindow();
	    document.getElementById('numberOfGenerationsLabel').innerText = '' + CurrentNumberOfGenerationsToGrowByOnEachExpansion;
	});
    }
}

const ControlsHandler = new ClassControlsHandler();
  
/******************************************************************************/
class ClassPopUpHandler
{
    /*************************************************************************/
    clickHandler (event)
    {
	this._popUpHideFn();
    }


    /*************************************************************************/
    popUpIsVisible (popUpHideFn)
    {
	this._popUpHideFn = popUpHideFn;
	document.getElementById('popUpOverlay').style.display = 'block';
    }


    /*************************************************************************/
    popUpIsInvisible ()
    {
	document.getElementById('popUpOverlay').style.display = 'none';
    }


    /*************************************************************************/
    _popUpHideFn = null;
}

const PopUpHandler = new ClassPopUpHandler();
    




/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                           Draggable elements                             **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/
  
/******************************************************************************/
class ClassDraggableHandler
{
    /**************************************************************************/
    initialise ()
    {
	const draggables = document.getElementsByClassName('draggableContainer');
	for (const draggable of draggables)
	    (new ClassDraggableHandler()).initialiseFor(draggable);
    }


    /**************************************************************************/
    initialiseFor (draggable)
    {
	this._offsetX = 0;
	this._offsetY = 0;
	this._isDragging = false;
	
	this._draggable = draggable;
	const header = draggable.querySelector('.draggableHeader');

	const me = this;
	
	header.addEventListener('mousedown', (event) => {
	    me._isDragging = true;
	    me._offsetX = event.clientX - draggable.offsetLeft;
	    me._offsetY = event.clientY - draggable.offsetTop;
	    document.body.style.cursor = 'move'; // Change cursor during drag
	});


	document.addEventListener('mousemove', (event) => {
	    if (me._isDragging) {
		const x = event.clientX - me._offsetX;
		const y = event.clientY - me._offsetY;
		draggable.style.left = `${x}px`;
		draggable.style.top = `${y}px`;
	    }
	});


	document.addEventListener('mouseup', () => {
	    me._isDragging = false;
	    document.body.style.cursor = 'default';
	});
    }
}

const DraggableHandler = new ClassDraggableHandler();





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                    Context menu (right mouse button)                     **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class ClassContextMenuHandler
{  
    /**************************************************************************/
    addSubtree ()
    {
	PresentationHandler.reviseTreeAddLeafSubtree(personRecordFromTreeNode(this._contextMenuTarget.node()).ix);
	document.getElementById('expandFamilyTreeButtonContainer').style.display = 'none';
	document.getElementById('removeFamilyTreeButtonContainer').style.display = 'block';
    }


    /**************************************************************************/
    /* Hides the context menu on a click outside of the area it covers. */

    hideMenu ()
    {
	PopUpHandler.popUpIsInvisible();
	document.getElementById('personNodeContextMenu').style.display = 'none';
    }


    /**************************************************************************/
    removeSubtree ()
    {
	PresentationHandler.reviseTreeRemoveSubtree(personRecordFromTreeNode(this._contextMenuTarget.node()).ix);
	document.getElementById('expandFamilyTreeButtonContainer').style.display = 'block';
	document.getElementById('removeFamilyTreeButtonContainer').style.display = 'none';
    }

    
    /**************************************************************************/
    /* Called on a right-mouse click on a node.  Populates the context menu and
       displays it. */
  
    showMenu (event, d)
    {
	/**********************************************************************/
	event.preventDefault(); // Prevent default browser menu



	/**********************************************************************/
	/* Record which node we're working on, and then make the changes necessary
	   to reflect the fact that this is now the selected person. */
    
	this._contextMenuTarget = treeNodeFromIndex(d.data.ix);
	PresentationHandler.changeSelectedPerson(d.data.ix);
	const personRecord = personRecordFromIndex(d.data.ix);



	/**********************************************************************/
	/* Sort out content of context menu. */
    
	document.getElementById('personNodeContextMenuHeader').textContent = prettifyName(nameFromIndex(d.data.ix)); // Title bar.

	this._fillDescendantsTable(d.data.ix);

	if (textNodeFromIndex(PresentationHandler.getSelectedPersonIx()).text().includes('...'))
	{
	    document.getElementById('expandFamilyTreeButtonContainer').style.display = 'block';
	    document.getElementById('removeFamilyTreeButtonContainer').style.display = 'none';
	}
	else if (personRecord.children.length > 0)
	{
	    document.getElementById('expandFamilyTreeButtonContainer').style.display = 'none';
	    document.getElementById('removeFamilyTreeButtonContainer').style.display = 'block';
	}
	else
	{
	    document.getElementById('expandFamilyTreeButtonContainer').style.display = 'none';
	    document.getElementById('removeFamilyTreeButtonContainer').style.display = 'none';
	}

	document.getElementById('descendantSearchBox').value = '';



	/**********************************************************************/
	/* Work out where to position the menu so it's adjacent to the node
           from which it was selected, but doesn't overlap the edges of the
           window. */
    
	const windowWidth = window.innerWidth;
	const windowHeight = window.innerHeight;

	this._contextMenu.style('display', 'block'); // Need to show in order to measure size.
	const menuWidth = this._contextMenu.node().offsetWidth;
	const menuHeight = this._contextMenu.node().offsetHeight;

	// Get click coordinates.
	let posX = event.clientX;
	let posY = event.clientY;

	if (posX + menuWidth > windowWidth) posX -= menuWidth; // Move left if overflowing right
	if (posY + menuHeight > windowHeight) posY -= menuHeight; // Move up if overflowing bottom
	if (posX < 0) posX = (windowWidth - menuWidth) / 2;
	if (posY < 0) posY = (windowHeight - menuHeight) / 2;
    
	this._contextMenu.style('top', `${posY}px`).style('left', `${posX}px`);
	const me = this;
	PopUpHandler.popUpIsVisible(function () { me.hideMenu() });
    }


    /**************************************************************************/
    _contextMenuTarget = null;
    _contextMenu = d3.select('#personNodeContextMenu');
  

    /**************************************************************************/
    _fillDescendantsTable (ix)
    {
	/**********************************************************************/
	/* Fill in table. */

	const tableBodyBuilder = function ()
	{
	    const namesAsSet = new Set();
	    iterateOverDescendants(personRecordFromIndex(ix), function (personRecord, level) {
		const shortDescription = personRecord.shortDescription.split('(')[0].trim();

		var displayName = nameFromPersonRecord(personRecord);
		const x = displayName.split('@');
		var displayName = x[0]; // Name portion only.
		if (displayName.includes('built'))
		{
		    const bits = displayName.split('_built_');
		    displayName = bits[0] + ' (built ' + bits[1] + ')';
		}
			
		const alternativeNames = 0 == personRecord.alternativeNames.length ? '' : '<br>' + personRecord.alternativeNames.map( str => str.split('@')[0] ).join('<br>');
		if (0 != alternativeNames.length) displayName += ' &bull; aka ...';
		displayName += alternativeNames;

		namesAsSet.add(displayName + '\u0001' + personRecord.ix + '\u0001' + shortDescription);
	    });

	    return [...namesAsSet].sort()
		.map ( function (x) {
		    const split = x.split('\u0001');
		    return "<tr>" +
			"<td ix='" + split[1].replace('.', '') + "' class='tb_col tb_col_1 clickable'>" + split[0] + "</td>" +
			"<td class='tb_col tb_col_2 clickable'>" + split[2] + "</td>" +
			"</tr>";
		})
		.join('');
	}



	/**********************************************************************/
	const tableClickHandler = function (cell, column) {
	    const row = cell.closest("tr");
            const firstCell = row.cells[0];
	    const leafNodeIx = firstCell.getAttribute('ix');
	    PresentationHandler.reviseTreeAddBranchDownAsFarAsIndividual(leafNodeIx);
	}


    
	/**********************************************************************/
	const rowMatcherFn = function (row, userInput)
	{
	    const re = new RegExp('^' + userInput, 'i');
	    const matchAgainst = row.find('.tb_col_1').text()
	    return re.test(matchAgainst);
	}



	/**********************************************************************/
	const tableRowHighlighter = function (selection)
	{
	    const row = 'tr' == selection.tagName ? selection : selection.closest('tr');
	    
	    // Remove any existing highlighting.
	    for (var i = 1; i <= row.cells.length; ++i)
		$('.tb_col_' + i).css('background', 'white');

	    // Highlight target row.
	    for (var i = 0; i < row.cells.length; ++i)
		$(row.cells[i]).css('background', '#FFFFC0');
	}



	/**********************************************************************/
	const tableHandlerArgs =
	      {
		  tableContainerId: 'descendantTableContainer',
		  bodyBuilderFn: tableBodyBuilder,
		  clickHandlerFn: tableClickHandler,
		  selectionHighlighterFn: tableRowHighlighter,
		  searchBoxId: 'descendantSearchBox',
		  rowMatcherFn: rowMatcherFn
	      };
	
	const tableHandler = new ClassTableWithSearchBoxHandler(tableHandlerArgs);
	tableHandler.initialise();
    }
}

const ContextMenuHandler = new ClassContextMenuHandler()





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                Utilities                                 **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/


/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                Indexing                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* GenealogyData is established on startup and does not change thereafter.
   It is keyed on the fully qualified name, and each record is the JSON
   representation of a single individual.

   The family tree consists of nodes (drawn as small circles), associated
   text, and links.

   The tree is drawn automatically based upon a dynamically determined
   subtree of the GenealogyData.  This subtree is selected when the system
   identifies the individual who is to appear at the root of the tree (and
   will also differ according to whether we are drawing a descendant or an
   ancestor tree).

   Each node in the tree is automatically given a pointer to the GenealogyData
   entry which it represents.  This is handled by the d3.js library.

   I arrange to add a .treeNode member to each GenealogyData entry participating
   in the currently-displayed tree (and remove these members from GenealogyData
   entries _not_ currently participating).

   Between them, this means I can identify the SVG node given a person record,
   and the person record given the SVG node. */

/******************************************************************************/
function circleNodeFromIndex (index)
{
    return circleNodeFromTreeNode(personRecordFromIndex(index).treeNode);
}

  
/******************************************************************************/
function circleNodeFromTreeNode (treeNode)
{
    return d3.select(treeNode.querySelector('circle'));
}

  
/******************************************************************************/
function fatherRecordFromPersonRecord (personRecord)
{
    const name = personRecord.father.disambiguatedName;
    return EmptyFieldMarker == name ? null : personRecordFromName(name);
}


/******************************************************************************/
function indexFromName (name)
{
    return personRecordFromName(name).ix;
}

  
/******************************************************************************/
function indexFromPersonRecord (personRecord)
{
    return personRecord.ix;
}

  
/******************************************************************************/
function indexFromTextNode (textNode)
{
    const personRecord = personRecordFromTextNode(textNode);
    return personRecord.ix;
}

  
/******************************************************************************/
function indexFromTreeNode (treeNode)
{
    return personRecordFromTreeNode(treeNode).ix;
}

  
/******************************************************************************/
function motherRecordFromPersonRecord (personRecord)
{
    const name = personRecord.mother.disambiguatedName;
    return EmptyFieldMarker == name ? null : personRecordFromName(name);
}

/******************************************************************************/
function nameFromIndex (index)
{
    return DataHandler.QualifiedNamesList[index];
}
  

/******************************************************************************/
function nameFromPersonRecord (personRecord)
{
    return nameFromIndex(personRecord.ix);
}
  

/******************************************************************************/
function personRecordFromIndex (index)
{
    return DataHandler.GenealogyData[nameFromIndex(index)];
}
  

/******************************************************************************/
function personRecordFromName (name)
{
    return DataHandler.GenealogyData[name];
}

  
/******************************************************************************/
function personRecordFromRelatedPersonRecord (relatedPersonRecord)
{
    return personRecordFromName(relatedPersonRecord.disambiguatedName);
}


/******************************************************************************/
function personRecordFromTextNode (textNode)
{
    const treeNode = treeNodeFromTextNode(textNode);
    const ix = Number(treeNode.attr('ix'));
    return personRecordFromIndex(ix);
}

  
/******************************************************************************/
function personRecordFromTreeNode (treeNode)
{
    var ix = Number(treeNode.getAttribute('ix'));
    return personRecordFromIndex(ix);
}

  
/******************************************************************************/
function textNodeFromIndex (ix)
{
    return d3.select(personRecordFromIndex(ix).treeNode.querySelector('text'));
}

/******************************************************************************/
function textNodeFromTreeNode (treeNode)
{
    return d3.select(treeNode.querySelector('text'));
}


/******************************************************************************/
function treeNodeFromIndex (index)
{
    return d3.select(personRecordFromIndex(index).treeNode);
}

  
/******************************************************************************/
function treeNodeFromPersonRecord (personRecord)
{
    return personRecord.treeNode;
}

  
/******************************************************************************/
function treeNodeFromTextNode (textNode)
{
    return d3.select(textNode.node().parentNode);
}





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                               Iteration                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function iterateOverDescendants (personRecord, fn)
{
    iterateOverDescendantsA(fn, personRecord.children, 1);
}


/******************************************************************************/
function iterateOverDescendantsA (fn, children, level)
{
    children.forEach( function (child) {
	const childRecord = personRecordFromRelatedPersonRecord(child);
	fn(childRecord, level);
	iterateOverDescendantsA(fn, childRecord.children, 1 + level);
    });
}


/******************************************************************************/
function iterateOverDisplayedPersonRecords (fn)
{
    iterateOverTreeNodes(function (treeNode) { fn(getPersonRecordFromTreeNode(treeNode)) });
}


/******************************************************************************/
function iterateOverTreeNodes (fn)
{
    for (const node of gNodes.selectAll('.node'))
	fn(node);
}





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                Names                                     **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* The JSON data which represents the genealogy is keyed on what I refer to
   here as dNames.  These comprise the name of the individual, followed by
   an @-sign and then scripture reference information.  This format is needed
   in order to access the genealogy data.

   Then there are various forms of displayed name.  All of these are based
   upon what I refer to here as the baseName, which is the portion of the
   dName before the @-sign (ie it's the actual name of the individual,
   devoid of any scripture reference information).

   This information is augmented with various additional indicators --
   perhaps an emoji at the start of the name to indicate the person's role,
   or an icon at the end of the name to indicate sex, or an ellipsis to
   reflect the fact that the person has children who do not presently
   appear on the screen (trees may be truncated to avoid cluttering things too
   much).

   Each of these various forms is handled here by a separate function, so
   that it is possible to alter each form of presentation independently.
*/

/******************************************************************************/
/* Takes a name possibly including the scripture reference appended to names
   for disambiguation purposes, and returns the basic name devoid of scripture
   details.  Used for display purposes. */

function baseName (dName)
{
    return dName.split("@")[0]
}


/******************************************************************************/
/* Extracts the first scripture reference from a dName. */

function firstScriptureReference (personRecord)
{
    return personRecord.disambiguatingRefs.split("-")[0]
}


/******************************************************************************/
/* Makes an indicator appended to the end of a name to indicate the sex of the
   person or whether the name in fact refers to a group.  PseudoEntry below
   refers to entries I have added to the people.json file while generating it,
   and represent, for instance elements which some people believe to be people,
   and others believe to be towns. */

function genderOrGroupIndicator (personRecord)
{
    for (const [key, text] of GenderOrGroupIndicators)
	if (personRecord.type == key)
            return text

    return '';
}    


/******************************************************************************/
/* Used when listing the spouses of individuals. */

function nameForDisplayAsSpouse (personRecord)  
{
    return personRecord.simpleName + personRecord.genderOrGroupIndicator;
}


/******************************************************************************/
/* Takes a name which may include the scripture references used for
   disambiguation purposes and returns a version of that name suitable for
   display in eg the siblings list in the info box (presently, in fact,
   just the base name). */

function nameForDisplayInBodyOfInfoBoxGivenNameKey (dName)
{
    return personRecordFromName(dName).simpleName;
}


/******************************************************************************/
/* Takes a person record and returns a version of that name suitable for
   display in eg the siblings list in the info box (presently, in fact,
   just the base name). */

function nameForDisplayInBodyOfInfoBoxGivenPersonRecord (personRecord)
{
    return personRecord.simpleName;
}


/******************************************************************************/
/* In the tree we display the base name, a gender / group indicator (where not
   male) and an ellipsis if the tree is 'incomplete' at this point.  There
   is also an icon describing the role of the person, but that gets added
   separately, because I want to have control over how big it is -- small
   icons tend to be difficult to make out.

   By incomplete, I mean if we are not showing all of the children for a given
   node.  In working this out, we need to take into account the possibility
   that the node may be sharing children with another node, so we have to
   count both the actual links (ie the ones for children belonging to this
   node) and the fake links (the links which point to children owned by
   another node). */

function nameForDisplayInTree (personRecord)
{
    const treeNode = treeNodeFromPersonRecord(personRecord);

    var treeNodeChildrenCount = 0;
    if ('children' in treeNode.__data__)
	treeNodeChildrenCount = treeNode.__data__.children.length;

    var treeNodeSharedChildrenCount = 0;
    if ('fakeLinkCount' in treeNode.__data__)
	treeNodeSharedChildrenCount = treeNode.__data__.fakeLinkCount;
    
    const personRecordChildrenCount = personRecord.children.length;
    var continuation = personRecordChildrenCount > treeNodeChildrenCount + treeNodeSharedChildrenCount ? '...' : '';

    return personRecord.simpleName +
	personRecord.genderOrGroupIndicator +
	continuation;
}


/******************************************************************************/
/* Makes fred@Gen.1.1-Rev look slightly easier on the eye. */
  
function prettifyName (uglyName)
{
    return uglyName.split('-')[0].replace('@', ':');
}




/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                       TV remote-style scroll button                      **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class ClassScrollButtonHandler
{		   
    /**************************************************************************/
    constructor ()
    {
	document.getElementById('scrollUpButton')   .addEventListener('mousedown', () => this._startScrolling(0, +this._scrollSpeed));
	document.getElementById('scrollDownButton') .addEventListener('mousedown', () => this._startScrolling(0, -this._scrollSpeed));
	document.getElementById('scrollLeftButton') .addEventListener('mousedown', () => this._startScrolling(+this._scrollSpeed, 0));
	document.getElementById('scrollRightButton').addEventListener('mousedown', () => this._startScrolling(-this._scrollSpeed, 0));
	document.addEventListener('mouseup',    () => this._stopScrolling());
	document.addEventListener('mouseleave', () => this._stopScrolling());
    }

    
    /**************************************************************************/
    translateGraphics (x, y)
    {
	this._stopScrolling();
	this._currentTransform = d3.zoomTransform(svg.node());
	this._currentTransform = d3.zoomIdentity
            .translate(x, y)
            .scale(this._currentTransform.k);
	svg.call(D3Support.zoom.transform, this._currentTransform);
    }	


    /**************************************************************************/
    _startScrolling (dx, dy)
    {
	// Stop any existing scroll to prevent conflicts.
	this._stopScrolling();

	// Ensure we have the most up-to-date transform at the start.
	this._currentTransform = d3.zoomTransform(svg.node());

	this._isScrolling = true;

	// Smooth interval-based scrolling,
	this._scrollInterval = setInterval(() => {
            if (this._isScrolling)
	    {
		// Incrementally update the transformation.
		this._currentTransform = d3.zoomIdentity
                    .translate(this._currentTransform.x + dx, this._currentTransform.y + dy)
                    .scale(this._currentTransform.k);

		// Apply the transformation directly.
		svg.call(D3Support.zoom.transform, this._currentTransform);
            }
	}, 50); // Adjust interval for speed and smoothness.
    }


    /**************************************************************************/
    _stopScrolling()
    {
	this._isScrolling = false;
	clearInterval(this._scrollInterval);
    }

    
    /**************************************************************************/
    _scrollInterval;
    _scrollSpeed = 50;  // Amount to scroll in each step (in pixels)
    _isScrolling = false;
}
    

const ScrollButtonHandler = new ClassScrollButtonHandler();

  



/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                             D3 drag and zoom                             **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* You enter here at your peril ...

   I have spent several days trying to sort this out, not evenly vaguely
   helped by AI.

   The main thing to know is that when dragging, the event.transform.x / .y
   values are a) absolute (ie not deltas since last time); and b) cumulative
   over the course of a session (so if you've dragged right 3 and then drag
   right by another 3, you'll receive an x value of +6).

   You do need to record the initial transform the very first time you drag,
   therefore, bceause without it, things flick to (0, 0) at the start of the
   first drag. */
  
class ClassD3Support
{
    /**************************************************************************/
    constructor ()
    {
	const me = this;

	this.zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', (event) => {
	    const transform = `translate(${event.transform.x + me._originalTranslation[0]}, ${event.transform.y + me._originalTranslation[1]}) scale(${event.transform.k})`;
	    g.attr('transform', transform);
	});
	
	svg.call(this.zoom);

	this.zoom.on('start', function(event) {
	    if (null == me._originalTranslation) // Want the details only on the very first call since onload.
	    {
		const tmp = g.attr('transform');
		me._originalTranslation = tmp.match(/-?\d+(\.\d+)?/g).map(Number);
	    }
	});
    }



    /**************************************************************************/
    _originalTranslation = [0, 0];
}

const D3Support = new ClassD3Support();





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                               Miscellaneous                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function dbgPrintTree (root, indent = '')
{
    if (!root) return;
    console.log(indent + nameFromIndex(root.ix) + (root.children ? '' : ' *** No children ***'));
    for (const c of root.children)
	dbgPrintTree(c, indent + '--');
}


/******************************************************************************/
/* May be useful for debugging. */

function doConsoleLog(x)
{
    console.log(x);
    return true;
}


/******************************************************************************/
/* Saved data which may be required across a reload. */

function saveDataInParentWindow ()
{
    MultiframeController.saveData(MultiframeController.myFrameId(),
				  {rootPersonIx: PresentationHandler.getRootPersonIx(),
				   selectedPersonIx: PresentationHandler.getSelectedPersonIx(),
				   numberOfGenerationsToGrowByOnEachExpansion: CurrentNumberOfGenerationsToGrowByOnEachExpansion,
				   horizontalSpacingTicks: CurrentHorizontalSpacingTicks,
				   verticalSpacingTicks: CurrentVerticalSpacingTicks
				  });
}


/******************************************************************************/
function setDifference (masterRecords, recordsToBeRemoved)
{
    return new Set([...masterRecords].filter(item => !recordsToBeRemoved.has(item)));
}

    
/******************************************************************************/
function setUnion (masterRecords, additionalRecords)
{
    return new Set([...masterRecords, ...additionalRecords]);
}
