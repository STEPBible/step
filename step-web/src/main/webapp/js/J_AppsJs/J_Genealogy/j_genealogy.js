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
     name is followed by an ellipsis.

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
     same name.)





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

/******************************************************************************/
'use strict';
import { ClassGenealogySharedCode }                     from '/js/J_AppsJs/J_Genealogy/j_genealogySharedCode.js';
import { JFrameworkUtils }                              from '/js/J_AppsJs/J_Framework/j_framework.utils.js';
import { ClassJFrameworkModalDialog }                   from '/js/J_AppsJs/J_Framework/j_framework.modalDialog.js';
import { ClassJFrameworkMultiframeCommunicationsSlave } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsSlave.js';
import { JFrameworkUserSettings }                       from '/js/J_AppsJs/J_Framework/j_framework.userSettings.js';
import { ClassJFrameworkTableWithSearchBox }            from '/js/J_AppsJs/J_Framework/j_framework.tableWithSearchBox.js';

export const ModalDialogHandler = new ClassJFrameworkModalDialog();
window.ModalDialogHandler = ModalDialogHandler;


  

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
    ['Male'       , ''],
    ['Female'     , ' ' + u(0x2640) ],
    ['Ancestors'  , '' ],
    ['Group'      , '' ],
    ['People'     , '' ],
    ['PseudoEntry', '']
];


/******************************************************************************/
/* We're using a homebrew font for icons.  This is a list of the roles and the
   letters in the font which represent them. */

const C_Apostle    = 'H';
const C_Group      = 'B';
const C_HighPriest = 'I';
const C_Judge      = 'F';
const C_Musician   = 'E';
const C_Priest     = 'A';
const C_Prophet    = 'J';
const C_Royal      = 'D';
const C_Warrior    = 'C';

const RoleDetails = new Map([
    [ 'Ancestors'  , [C_Group     , 'Ancestors'    ]],
    [ 'Apostle'    , [C_Apostle   , 'An apostle'   ]],
//  [ 'Concubine'  , [null        , null           ]],
    [ 'Emperor'    , [C_Royal     , 'An emperor'   ]],
    [ 'Ethnarch'   , [C_Royal     , 'An ethnarch'  ]],
    [ 'Governor'   , [C_Royal     , 'A governor'   ]],
    [ 'Group'      , [C_Group     , 'A group'      ]],
    [ 'High Priest', [C_HighPriest, 'A High Priest']],
    [ 'Judge'      , [C_Judge     , 'A judge'      ]],
    [ 'King'       , [C_Royal     , 'A King'       ]],
    [ 'People'     , [C_Group     , 'A people'     ]],
    [ 'Musician'   , [C_Musician  , 'A people'     ]],
    [ 'Priest'     , [C_Priest    , 'A priest'     ]],
    [ 'Prince'     , [C_Royal     , 'A prince'     ]],
    [ 'Prophet'    , [C_Prophet   , 'A prophet'    ]],
    [ 'Queen'      , [C_Royal     , 'A queen'      ]],
    [ 'Ruler'      , [C_Royal     , 'A ruler'      ]],
    [ 'Tetrarch'   , [C_Royal     , 'A tetrarch'   ]],
    [ 'Warrior'    , [C_Warrior   , 'A warrior'    ]]
]);





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                             Initialisation                               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This is instantiated here and is therefore available to the HTML file. */

class _ClassInitialisationHandler extends ClassJFrameworkMultiframeCommunicationsSlave
{
    /**************************************************************************/
    /* Called by the data handler once data has been loaded and it's ok to
       proceed. */
    
    afterDataLoaded ()
    {
	PresentationHandler.SubtreeHighlightHandler.markSpecialTrees();
	this._makeInitialSelection();
	
    }


    /*************************************************************************/
    onload ()
    {
	/**********************************************************************/
	function fn (firstTime)
	{
	    const background = getComputedStyle(document.documentElement).getPropertyValue("--clrBackground").trim();
	    const isDark = JFrameworkUtils.isDark(background);
	    const svgBackground = isDark  ? 'lightGray' : 'white';
	    document.documentElement.style.setProperty('--svgBackground', svgBackground);
	}
	
	JFrameworkUserSettings.init(fn);


	
	/*********************************************************************/
	/* No need to have the text saying this is genealogy data if we're
           showing multiple frames on the same screen, because there the
           context makes it obvious.  In fact, doing things that way looks a
           bit clunky, so instead I hide the text by default and show it only
           if in tabbed dialogue mode. */
    
	if (!JFrameworkUtils.isLargeScreen())
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
	ModalDialogHandler.addModalCloseButtonHandlers();
    }


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

    receiveActivation (activatedBy)
    {
	if (0 != FrameWidthLastUsed)
	    return;
	
	const savedData = JFrameworkMultiframeCommunicationsSlave.getSavedData(JFrameworkUtils.myFrameId());
	if (savedData)
	    PresentationHandler.refreshFromDataSavedInParentWindow(savedData);
	LayoutHandler.adjustPositionOfRootNode();
    }

  
    /*************************************************************************/
    /* This can cope with multiple flavours of message, although at present it
       is set up to deal only with a message asking it to move to a new
       person based on their Strong's number.

       Late change: There are a few dummy entries in the collection which are
       needed to make generations align.  All of these have names starting
       with a plus sign, and all have a dummy Strong's number containing
       "0000".  Here we have to find the relevant entry by looking up their
       disambiguated name, rather than by looking up their Strong's. */

    receiveMessage (data, callingFrameId)
    {
	if ('newPerson' in data)
	{
	    const requiredIx = data.newPerson.allDStrongs.includes("0000") ? indexFromName(data.newPerson.disambiguatedName) : indexFromStrongs(data.newPerson.masterDStrongs);
	    if (requiredIx != PresentationHandler.getRootPersonIx())
	    {
		try
		{
		    this._suppressSendMessage = true;
		    PresentationHandler.changeRootToGivenPersonByIndex(requiredIx);
		}
		finally
		{
		    this._suppressSendMessage = false;
		}
	    }

	    ControlsHandler.hideBuiltInTreesDialog();
	}


	this.sendMessageTo(null, { forceTabVisible: 'genealogy'}); // On narrow layout, after a selection change we need to ensure the genealogy window is visible.
    }

    
    /**************************************************************************/
    /* This just gives us a chance to avoid sending messages telling the
       outside world about changes to the current item when it is the outside
       world which initiated the change in the first place. */
    
    sendMessageWithSuppression (targetFrameId, data) // Don't call this sendMessageTo or you'll override the parent version.
    {
	if (!this._suppressSendMessage)
	    this.sendMessageTo(targetFrameId, data);
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
       no selection at all, in which case I have been asked to default to
       Aaron. */
  
    _makeInitialSelection ()
    {
	const urlParms = new URLSearchParams(new URL(window.location.href).search);
	const strong = urlParms.get('strong')
	const showBuiltInTrees = urlParms.has('showBuiltInTrees');
	const savedData = JFrameworkMultiframeCommunicationsSlave.getSavedData(JFrameworkUtils.myFrameId());

	if (savedData)
	    PresentationHandler.refreshFromDataSavedInParentWindow(savedData);

	var rootIx = 0;
	var selectedIx = 0;
	if (strong)
	{
	    const x = strong.split(':');
	    rootIx = DataHandler.lookupStrongs(x[0]);
	    selectedIx = 1 == x.length ? rootIx : DataHandler.lookupStrongs(x[1]);
	}

	renderTreeForName(nameFromIndex(rootIx));

	if (savedData && rootIx == savedData.rootPersonIx)
	    PresentationHandler.changeSelectedPerson(savedData.selectedPersonIx);
	else if (rootIx != selectedIx)
	    PresentationHandler.changeSelectedPerson(selectedIx);

	if (showBuiltInTrees)
	    ControlsHandler.showBuiltInTreesDialog();
    }

    _suppressSendMessage = false;
}

export const InitialisationHandler = new _ClassInitialisationHandler();





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
	return personRecord.role ? personRecord.role: null;
    }

	
    /**************************************************************************/
    /* On records which have more than one emoji as their icon, the emojis
       tend to be rather spaced out.  It would be nice to be able to force
       them closer using kerning or whatever.  Unfortunately, the icon details
       here are used in SVG text nodes, and the CSS options which we could
       normally use are not all available there. */
    
    getSummaryIcon (personRecord)
    {
	const entry = RoleDetails.get(personRecord.role);
	return entry ? entry[0] : '';
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
    isConcubine (personRecord)
    {
	return 'Concubine' === personRecord.role;
    }

	    
    /**************************************************************************/
    isFemale (personRecord)
    {
	return 'Female' === personRecord.type;
    }

	    
    /**************************************************************************/
    isGroup (personRecord)
    {
	return !this.isMale(personRecord) && !this.isFemale(personRecord); // Not too sure about this.
    }


    /**************************************************************************/
    isMale (personRecord)
    {
	return 'Male' === personRecord.type;
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
    hasPartners (personRecord)
    {
	const partners = personRecord.partners || [];
	return partners.length > 0;
    }

  
    /**************************************************************************/
    hasSiblings (personRecord)
    {
	const siblings = personRecord.siblings || [];
	return siblings.length > 0;
    }

  
    /**************************************************************************/
    initialise ()
    {
	const jsonPath = JFrameworkUtils.getFullUrl('html/json/J_AppsJson/J_Genealogy/j_genealogy_min.json');
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
		allNames: [],
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

	    personRecord.display = false;
	    
	    if ('' != personRecord.summaryDescription)
		personRecord.summaryDescription = personRecord.summaryDescription.replaceAll('<br>', ' ');
	    
	    personRecord.genderOrGroupIndicator = genderOrGroupIndicator(personRecord);
	    personRecord.allDStrongs.forEach((entry) => { this._StrongsMap.set(entry, ix) });
	
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
	    const isWoman = DataHandler.isFemale(personRecord);
	    const isGroup = DataHandler.isGroup(personRecord);

	    const textNode = x.append('text')
		  .attr('x', +10) // Adjust position based on parent/child
		  .attr('dy', 3) // Vertical offset
		  .attr('text-anchor', 'start') // Align text properly
		  .attr('transform', 'rotate(30)')
		  .attr('textNodeIx', ix)

	    textNode.append('tspan')
		//.attr('font-size', 'x-large')
	        .classed('retainDefaultAppearance', true)
	        .classed('iconFont', true)
		.text(icon);

	    textNode.append('tspan')
	        .classed('man', isMan)
	        .classed('woman', isWoman)
	        .classed('group', isGroup)
		.text(name);
	    
	    const owningTextNodeX = Number(textNode.attr('x')) + 5;


	    var showNSpouses = 2;
	    for (const partner of personRecord.partners)
	    {
		textNode.append('tspan')
		    .attr('x', owningTextNodeX)
		    .attr('dy', +15)
	            .classed('manSpouse', !isMan)
	            .classed('womanSpouse', isMan)
		    .text('\u2764 ' + nameForDisplayAsSpouse(personRecordFromName(partner.disambiguatedName)))

		if (--showNSpouses < 0)
		{
		    textNode.append('tspan')
			.attr('x', owningTextNodeX)
			.attr('dy', +15)
			.classed('manSpouse', !isMan)
			.classed('womanSpouse', isMan)
			.text('\u2764 etc.')
		    break;
		}
		
	    }
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





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                          Back and forward stack                          **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassBackAndForwardStackHandler
{
    /**************************************************************************/
    back ()
    {
        if (this._currentIndex > 0)
	{
	    DetailsForIndividualTrees.updateCurrent(); // Make sure the current item's transformation is up to date.
            this._currentIndex--;
	    DetailsForIndividualTrees.setCurrent(this._history[this._currentIndex].individualTreesIx);
	    this._updateButtons();
	    this._suppressNewSelection = true;
            this._activateSelection(this._history[this._currentIndex]);
	    this._suppressNewSelection = false;
        }
    }


    /**************************************************************************/
    forward ()
    {
        if (this._currentIndex < this._history.length - 1)
	{
	    DetailsForIndividualTrees.updateCurrent(); // Make sure the current item's transformation is up to date.
            this._currentIndex++;
	    DetailsForIndividualTrees.setCurrent(this._history[this._currentIndex].individualTreesIx);
	    this._updateButtons();
	    this._suppressNewSelection = true;
            this._activateSelection(this._history[this._currentIndex]);
	    this._suppressNewSelection = false;
        }
    }


    /**************************************************************************/
    /* This needs to be called _after_ moving to a new selection. */
    
    newSelection ()
    {
	if (this._suppressNewSelection)
	    return;

        // Clear forward history if navigating to a new page
        if (this._currentIndex < this._history.length - 1)
            this._history = this._history.slice(0, this._currentIndex + 1);
        
        this._history.push(this._makeSelection());
        this._currentIndex++;

	this._updateButtons();
    }


    /**************************************************************************/
    _activateSelection (details)
    {
	PresentationHandler.revisitEarlierDisplay(details);
    }


    /**************************************************************************/
    _makeSelection ()
    {
	return {
 	    name: personRecordFromIndex(PresentationHandler.getRootPersonIx()).simpleName,
	    rootIx: PresentationHandler.getRootPersonIx(),
	    selectedIx: PresentationHandler.getSelectedPersonIx(),
	    individualTreesIx: DetailsForIndividualTrees.getCurrentIx(),
	    selectedRecords: new Set( [...PresentationHandler.getSelectedRecords()] ),
	}
    }
    

    /**************************************************************************/
    _updateButtons ()
    {
	const backButton = document.getElementById('backButton');
	if (this._currentIndex > 0)
	{
	    backButton.classList.remove('jframework-greyedBtn');
	    backButton.title = 'Back to ' + this._history[this._currentIndex - 1].name + '.';
	}
	else
	{
	    backButton.classList.add('jframework-greyedBtn');
	    backButton.title = '';
	}


	const fwdButton = document.getElementById('forwardButton');
	if (this._currentIndex < this._history.length - 1)
	{
	    fwdButton.classList.remove('jframework-greyedBtn');
	    fwdButton.title = 'Forward to ' + this._history[this._currentIndex + 1].name + '.';
	}
	else
	{
	    fwdButton.classList.add('jframework-greyedBtn');
	    fwdButton.title = '';
	}
    }

    
    /**************************************************************************/
    _currentIndex = -1;
    _history = [];
}

export const BackAndForwardStackHandler = new _ClassBackAndForwardStackHandler();
window.BackAndForwardStackHandler = BackAndForwardStackHandler;





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                Retention for details of individual trees                 **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Yet another hairy bit of code ...

   This was set up mainly to support transformation matrices, although it could
   certainly be pressed into use for other purposes too.

   In summary, whenever I draw an entirely new tree, I do so against the
   initial transformation matrix (x:0, y:0, k:1).  In fact, by the time I've
   finished drawing the tree, the matrix will have changed somewhat, because
   that default would have the root of the tree absolutely at the top left
   of the screen, with the left hand side of the tree outside of the window.

   Once I've drawn a tree, though, there is nothing to stop the user from
   panning and zooming it, which will change the transformation matrix.

   If now a new tree is added, we also support back and forward buttons to work
   through the extant list of trees.  And here I presume that if we go back to
   an earlier tree whose transformation matrix has been altered, the user will
   want to see it as it then looked.

   This implies that I need to keep track of the transformation matrix, and
   this turns out to be rather difficult.  If the user scrolls or zooms, the
   matrix is updated, but you can't readily get to find out.  In fact it
   _is_ possible to add an event handler which gets told about the change,
   but there are apparently insurmountable problems in doing so.  Just in case
   you're tempted to try it again, here are a few of the issues:

   - _Without_ an event handler, D3 itself updates the screen to reflect panning
     and zooming.  _With_ an event handler, the transform event is trapped, so
     you have to apply the updates yourself.

   - If you use svg.call(D3Support.zoom.transform, t) to apply the updates,
     that generates new zoom events, which are then picked up by the event
     handler, and you end up in an infinite loop.  You therefore have to take
     steps to avoid having the event handler respond to something which it has
     itself instigated.  Even with this, there are problems -- apparently
     events are likely to hit the event handler in such a way that you cannot
     rely upon seeing all of them.

   - ChatGPT suggested using something like d3.select("#something").attr("transform", event.transform);
     rather than svg.call(D3Support.zoom.transform, t), because this doesn't
     give rise to the kind of looping just mentioned.  However, this doesn't
     work -- trees are initially drawn at the left of the window and then
     repositioned, but with this approach, the left-hand side of the tree is
     actually completely absent, so when the tree is repositioned you only
     get to see the right half of the tree.


   In view of these issues I have had (reluctantly) to give up the idea of
   using an event handler to track panning and zooming.  Instead I have to
   arrange to update my stored records any time when I move away from the
   existing tree (which I _think_ means any time I draw a completely new
   tree or use the forward or back buttons).

   I kind of felt that in fact I could store the transformation matrix as
   part of the data used to support the back and forward buttons, and probably
   I could, but it was turning out to be rather complicated and error prone.

   Hence the present class.  Every time we have a _new_ tree I assign it a
   unique integer index, and associate that index with a transformation
   matrix.  _New_ here means that we have been given a 'new' root and have
   been asked to draw a tree for it.  This raises the question, though, of
   what counts as new:

   - Using the back and forward buttons does not give us a new tree -- it
     simply activated a previously existing one.

   - Changing the _selection_ does not of itself give us a new tree --
     normally it simply highlights something in the existing tree.

   - Changing the root node _does_ give us a new tree.  There is one wrinkle
     here, though.  Imagine you start out with a tree for Aaron.  You then
     select, say, Jochebed from the info box.  This gives us a new tree.
     If you use the Back button to return to Aaron, that does not give a
     new tree.  But if, having gone to Jochebed you then select Aaron as one
     of her children from the info box, this gives you an entirely new copy
     of Aaron, and this _does_ count as a new tree.


   Strictly entries here need to be retained only while their id is associated
   either with the item currently being displayed, or with anything on the
   back and forward stack.  However, I hold only a very small amount of
   information for each item, so we're unlikely to run out of space, and I
   feel it's safer if I retain things forever.
*/

/******************************************************************************/
class _ClassDetailsForIndividualTrees
{

    /**************************************************************************/
    applyTransformationDetails (ixOrDetails = this._current)
    {
	const transform = Number.isInteger(ixOrDetails) ? this._transformation.get(ixOrDetails) : ixOrDetails;
	const t = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k);
	svg.call(D3Support.zoom.transform, t);
    }

    
    /**************************************************************************/
    getCurrentIx ()
    {
	return this._current;
    }

    
    /**************************************************************************/
    /* Called to add details of a new tree.  See head-of-class for
       discussion. */
    
    newTreeA ()
    {
	this.updateCurrent(); // Before we lose the present tree, make sure its transformation matrix is up to date.
	svg.call(D3Support.zoom.transform, d3.zoomIdentity); // Default settings for new tree: no translate, no scale.
    }

    newTreeB ()
    {
	this._transformation.set(++this._counter, this._getTransformationDetails()); // Create an entry for a new tree and record its transformation matrix.
	this._current = this._counter;
    }
    

    /**************************************************************************/
    setCurrent (ix)
    {
	this._current = ix;
    }

    
    /**************************************************************************/
    updateCurrent ()
    {
	if (this._current >= 0)
	    this._transformation.set(this._current, this._getTransformationDetails());
    }
    
    
    /**************************************************************************/
    /* Obtains the current transformation details in the form { x:0, y:0, k:1 }.
       I do this rather than save a reference to the transformation matrix
       itself, since that may change under my feet. */

    _getTransformationDetails ()
    {
	const transform = d3.zoomTransform(svg.node());
	return { x: transform.x, y: transform.y, k: transform.k };
    }

    
    /**************************************************************************/
    _counter = -1;
    _current = -1;
    _transformation = new Map();
}

const DetailsForIndividualTrees = new _ClassDetailsForIndividualTrees();
    

/******************************************************************************/
/* This is instantiated here, and is therefore available for use by the HTML. */

class _ClassPresentationHandler
{
    /**************************************************************************/
    changeRootToFather () { this.reviseTreeNewRoot(indexFromName(personRecordFromIndex(this.getRootPersonIx()).father.disambiguatedName));}
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
	if (ix == this.getSelectedPersonIx())
	    return;
	
	this._refreshRelationsHighlighting(ix);
	this._changeOrRefreshSelectedPerson(ix);
	this.SubtreeHighlightHandler.newSelection(ix, this.getRootPersonIx(), 'S');
//	DetailsForIndividualTrees.update();
//	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    copyLinkToClipboard ()
    {
	const dStrongsRoot = personRecordFromIndex(this.getRootPersonIx()).dStrongs;
	const dStrongsSelected = personRecordFromIndex(this.getSelectedPersonIx()).dStrongs;
	const url = JFrameworkUtils.getFullUrl('html/J_AppsHtml/J_Genealogy/j_peopleSplit3.html?strong=' + dStrongsRoot + ':' + dStrongsSelected);
	navigator.clipboard.writeText(url);
	this.showPopUp('URL copied to clipboard', 'copyToClipboardConfirmation');
    }

	
    /**************************************************************************/
    getRootPersonIx      () { return this._rootPersonIx;      }
    getSelectedPersonIx  () { return this._selectedPersonIx;  }

    getDuplicatedRecords () { return this._duplicatedRecords; }
    getSelectedRecords   () { return this._selectedRecords;   }

    
    /**************************************************************************/
    /* Replaces the entire tree with a new one, at the same time removing
       highlighting etc.  Slightly sneaky stuff to do with transforms ...

       The first time we draw anything at all, I record the transform
       matrix, for use later.  I then reapply this any time I draw a
       new tree, thus guaranteeing that each new tree starts off with no
       transformation (or more strictly that it is centred with the root
       at the top of the window, and with no scaling or translation). */
    
    newTree (ix)
    {
	DetailsForIndividualTrees.newTreeA();

	const rootPerson = personRecordFromIndex(ix);
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPerson, this._selectedRecords);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, ix, ix);
	this.SubtreeHighlightHandler.newSelection(ix, ix, 'T');

	DetailsForIndividualTrees.newTreeB();
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    /* Just redraws the existing content.  The 'if' seems to be required
       because otherwise when moving to tabbed dialog mode, there is a risk
       that redrawing will occur very slightly before the iframe is set up and
       visible, and you then get messages about not being able to find
       children in the family tree. */
    
    refresh ()
    {
	requestAnimationFrame(() => {
	    const box = svg.node().getBBox();
	    if (box.width > 0 && box.height > 0)
	    {
		this._redraw(this._root, this.getRootPersonIx(), this.getSelectedPersonIx());
		this.changeSelectedPerson(this.getSelectedPersonIx());
	    }
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
    /* Called after a resize event.  Simply redraws whatever we were displaying
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
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByRetentionOnly(personRecordFromIndex(this.getRootPersonIx()), setUnion(this._selectedRecords, additionalRecords), this._NOT_USED_excludedRecords);
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
	this._NOT_USED_excludedRecords = [];
	const [additionalRecords, _, __] = SubtreeSelector.createTreeByGenerationOrRetention(tempRootPerson, this._selectedRecords, this._NOT_USED_excludedRecords);

	var rootPerson = personRecordFromIndex(this.getRootPersonIx());
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPerson, setUnion(this._selectedRecords, additionalRecords), this._NOT_USED_excludedRecords);

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
	DetailsForIndividualTrees.newTreeA();
	const rootPerson = personRecordFromIndex(ix);
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(rootPerson, this._selectedRecords, this._NOT_USED_excludedRecords);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, ix, this.getSelectedPersonIx());
	this.SubtreeHighlightHandler.newSelection(-1, ix, 'S');
	DetailsForIndividualTrees.newTreeB();
	BackAndForwardStackHandler.newSelection();
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
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByRetentionOnly(rootPerson, this._selectedRecords, this._NOT_USED_excludedRecords);

	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redraw(root, this.getRootPersonIx(), this.getSelectedPersonIx());
	this.SubtreeHighlightHandler.refresh();
    }
	

    /**************************************************************************/
    revisitEarlierDisplay (details)
    {
	const { name, rootIx, selectedIx, individualTreesIx, selectedRecords } = details;
	const [newSelectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByRetentionOnly(personRecordFromIndex(rootIx), selectedRecords);
	this._setSelectedAndDuplicated(newSelectedRecords, duplicatedRecords);
	requestAnimationFrame(() => {
	    this._redrawUsingJustSelectedRecords(root, personRecordFromIndex(rootIx), selectedIx);
	    DetailsForIndividualTrees.applyTransformationDetails(individualTreesIx);
	});
    }

    
    /**************************************************************************/
    showPopUp (message, popUpId, duration = 1000)
    {
	const popup = document.getElementById(popUpId);
	popup.textContent = message;
	popup.style.display = "block";
	popup.style.opacity = "1";

	// Fade out after 'duration' milliseconds
	setTimeout(() => {
	    popup.style.opacity = "0";
	    setTimeout(() => {
		popup.style.display = "none";
	    }, 1000); // Wait for fade-out transition to finish
	}, duration);
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
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    /* All nodes from Adam to (and including) sons of Noah. */
    
    showTreeAdamToSonsOfNoah ()
    {
	this._treeForRootToTargetAndSiblings('Adam@Gen.2.19-Jud', 'Shem@Gen.5.32-Luk');
	BackAndForwardStackHandler.newSelection();
    }


    /**************************************************************************/
    /* Moses and siblings in the context of Amram. */
    
    showTreeAmramMosesAndAaron ()
    {
	const amramPersonRecord = personRecordFromName('Amram@Exo.6.18-1Ch');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(amramPersonRecord, null, null, 5);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, amramPersonRecord, indexFromName('Moses@Exo.2.10-Rev'));
	BackAndForwardStackHandler.newSelection();
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
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    /* High priests -- family tree from Aaron. */
    
    showTreeHighPriests ()
    {
	this._treeForRootAndNumberOfGenerations('Aaron@Exo.4.14-Heb', 9999);
	BackAndForwardStackHandler.newSelection();
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
	BackAndForwardStackHandler.newSelection();
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
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    /* Jesus' ancestors: Adam to Noah, and then Shem to Jesus. */
    
    showTreeJesusAncestors ()
    {
	const adamPersonRecord = personRecordFromName('Adam@Gen.2.19-Jud');
	const shemPersonRecord = personRecordFromName('Shem@Gen.5.32-Luk');
	const adamToShemSelectedRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(adamPersonRecord, shemPersonRecord, 'B');
	const shemToJesusSelectedRecords = SubtreeSelector.getRecordSetBetweenFromAndTo(shemPersonRecord, personRecordFromName('Jesus@Isa.7.14-Rev'), 'B');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(adamPersonRecord, new Set( [...adamToShemSelectedRecords, ...shemToJesusSelectedRecords] ), null, -1);

//	const rahabPersonRecord = personRecordFromName('Rahab@Jos.2.1-Jas'); Doesn't seem to work, unfortunately.  You _can_ show Rahab, but only at the start of a tree.
//	selectedRecords.add(rahabPersonRecord);

	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, adamPersonRecord);
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    /* Local-ish tree involving Mary. */
    
    showTreeJesus ()
    {
	const fatherOfElizabethPersonRecord = personRecordFromName('father_of_Elizabeth@Luk.1.5');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(fatherOfElizabethPersonRecord, null, null, 9999);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, fatherOfElizabethPersonRecord, indexFromName('Jesus@Isa.7.14-Rev'));
	BackAndForwardStackHandler.newSelection();
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
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    showTreeOriginOfNations ()
    {
	this.showTreeNoahToAbraham();
	BackAndForwardStackHandler.newSelection();
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
	BackAndForwardStackHandler.newSelection();
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
	// BackAndForwardStackHandler.newSelection(); Can't do this -- we have more than one origin for the royal family tree, and that confuses things.
    }

    
    /**************************************************************************/
    /* Saul -- starting at Abiel for n generations. */
    
    showTreeSaul ()
    {
	const abielPersonRecord = personRecordFromName('Abiel@1Sa.9.1-1Ch');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(abielPersonRecord, null, null, 3);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, abielPersonRecord, indexFromName('Saul@1Sa.9.2-Act'));
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    /* Terah through Abraham to Israel. */
    
    showTreeTerahAbrahamAndIsrael ()
    {
	const terahPersonRecord = personRecordFromName('Terah@Gen.11.24-Luk');
	const [selectedRecords, root, duplicatedRecords] = SubtreeSelector.createTreeByGenerationOrRetention(terahPersonRecord, null, null, 3);
	this._setSelectedAndDuplicated(selectedRecords, duplicatedRecords);
	this._redrawUsingJustSelectedRecords(root, terahPersonRecord, indexFromName('Abraham@Gen.11.26-1Pe'));
	BackAndForwardStackHandler.newSelection();
    }

    
    /**************************************************************************/
    translateGraphics (newX, newY)
    {
	ScrollButtonHandler.translateGraphics(newX, newY);
    }


    /**************************************************************************/
    /* I'm not sure we really need _NOT_USED_excludedRecords at all, since we achieve
       the same effect here by removing the excluded records from
       _selectedRecords.  I'm retaining it on the off-chance. */
    
    _addToExcludedRecords (exclusions)
    {
	this._NOT_USED_excludedRecords = setUnion(this._NOT_USED_excludedRecords, exclusions);
	this._selectedRecords = setDifference(this._selectedRecords, this._NOT_USED_excludedRecords);
    }

    
    /**************************************************************************/
    /* Handles highlighting a single individual and their associated text
       node. */
    
    _changeOrRefreshSelectedPerson (ix)
    {
	/**********************************************************************/
	try // Unhighlight the existing selection -- except we won't be able to if the previously highlighted node is no longer in the tree.
	{   // try-catch avoids the need for a test which would rely on me successfully keeping tabs on what's going on.
	    
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
	    InitialisationHandler.sendMessageWithSuppression(null, { newPerson: personRecordFromIndex(ix), reason: 'newSelectionInGenealogy' });



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



	/************************************************************************/
	const nameForDisplayInInfoBox = nameForDisplayInBodyOfInfoBoxGivenPersonRecord(personRecord);
	const fatherName = personRecord.father.disambiguatedName;
	const motherName = personRecord.mother.disambiguatedName;
	const partners   = personRecord.partners || [];
	const children   = personRecord.children || [];
	const siblings   = personRecord.siblings || [];
	const summaryDescription = personRecord.summaryDescription;
	const longDescription = personRecord.longDescription;
	const alternativeNames = 1 == personRecord.allNames.length ? '' : ' Also known as ' + personRecord.allNames.slice(1).map( x => x.replace('@', ':') ) + '.';

	const ambiguity = EmptyFieldMarker == personRecord.ambiguity ? '' :
	      `<p><b>Differing interpretations exist here.</b>  Click <button class="jframework-linkAsButton" title="Details of ambiguity" onclick="window.open('${personRecord.ambiguity}', '_blank', 'noopener,noreferrer')">here</button> for details.</p>`;

	const siblingList = 0 == siblings.length ? '' :
	      `<p><b>Siblings:</b>  ${siblings.length  > 0 ? siblings.map (sibling => `<button class="sibling-link jframework-linkAsButton">${nameForDisplayInBodyOfInfoBoxGivenNameKey(sibling.disambiguatedName)}</button>`).join(", ") : "-" }</p>`;
    
	const childrenList = 0 == children.length ? '' :
	      `<p><b>Children:</b> ${children.length > 0 ? children.map(kid     => `<span class="children-link jframework-linkAsButton">${nameForDisplayInBodyOfInfoBoxGivenNameKey(kid.disambiguatedName)}</span>`).join(", ") : "-" }</p>`;



	/************************************************************************/
	/* This requires a little explanation ...

	   If we go by the genealogy in Luke, there should be 77 generations from
	   Adam to Jesus.  This means that for records which have generation
	   details (not all do), generationsFromAdam and generationsToJesus
	   should add to 77.  In fact, although in all cases the sum is very
	   close to 77, it may be a few adrift, and I add the missing value to
	   generationsFromAdam.

	   I then convert this to a given number of 5%'s of 77, and draw a
	   poor man's bar chart, grey except for a black square which
	   roughly marks where the person comes in the overall count of
	   generations from Adam to Jesus (or more accurately from Adam to
	   the NT, since not all people are in the family tree to Jesus). */
	
	var generations = ''
	if (-1 != personRecord.generationsFromAdam)
	{
	    var generationsFromAdam = personRecord.generationsFromAdam;
	    const variance = -1 == personRecord.generationsToJesus ? 0 : 77 - (generationsFromAdam + personRecord.generationsToJesus);
	    generationsFromAdam += variance;
	    const fromAdamFivePercents = Math.round( (100 * (generationsFromAdam / 77)) / 5);
	    const before = '&#x2588;'.repeat(fromAdamFivePercents);
	    const after  = '&#x2588;'.repeat(20 - fromAdamFivePercents);
	    const leftChevronSvg  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width:0.9em;height:0.9em;vertical-align:middle;" aria-hidden="true"><polyline points="7.5 2 4.5 6 7.5 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	    const rightChevronSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width:0.9em;height:0.9em;vertical-align:middle;" aria-hidden="true"><polyline points="4.5 2 7.5 6 4.5 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	    generations = `<p><b>Timeline:</b> Adam ${leftChevronSvg} <span style='color:lightgray;font-size:small'>${before}</span>&#x2588;<span style='color:lightgray;font-size:small'>${after}</span> ${rightChevronSvg} NT</p>`;
	}


	
	/************************************************************************/
	const summaryDescriptionX = '' == summaryDescription ? '' : '<p>' + summaryDescription + '</p>';
	const longDescriptionX    = '' == longDescription    ? '' : '<p>' + longDescription    + '</p>';



	/************************************************************************/
	var partnerList = '';
	if (DataHandler.isFemale(personRecord))
	{
	    if (0 === partners.length)
		partnerList = '<p><b>Husband:</b> -</p>';
	    else
	    {
		const x = partners.map (partner => `<span class="partner-link jframework-linkAsButton">${nameForDisplayInBodyOfInfoBoxGivenNameKey(partner.disambiguatedName)}</span>`).join(', ');
		partnerList = `<p><b>Husband:</b> ${x}</p>`;
	    }
	} // Female
	
	else if (DataHandler.isMale(personRecord))
	{
	    if (0 === partners.length)
		partnerList = '<p><b>Wife:</b> -</p>';
	    else
	    {
		const x = partners.map (partner => `<span class="partner-link jframework-linkAsButton ${DataHandler.isConcubine(personRecordFromName(partner.disambiguatedName)) ? 'concubine' : 'wife'}">${nameForDisplayInBodyOfInfoBoxGivenNameKey(partner.disambiguatedName)}</span>`).join(', ');
		const hasConcubines = x.includes('concubine');
		const hasWives = x.includes('wife');
		if (1 == partners.length)
		{
		    if (hasConcubines)
			partnerList = `<p><b>Concubine:</b> ${x}</p>`;
		    else
			partnerList = `<p><b>Wife:</b> ${x}</p>`;
		}
		else if (hasConcubines && !hasWives)
		    partnerList = `<p><b>Concubines:</b> ${x.replace('concubines', '')}</p>`;
		else if (!hasConcubines && hasWives)
		    partnerList = `<p><b>Wives:</b> ${x.replace('wife', '')}</p>`;
		else // Has both wives and concubines.
		    partnerList = `<p><b><span class='wife'>Wives</span> and <span class='concubine'>concubines</span>: ${x}</p>`;
		    
	    }
	}
	    



	/************************************************************************/
	const summaryIcon = DataHandler.getSummaryIcon(personRecord);
	const spacer = summaryIcon ? '&nbsp;' : '';
	const multipleReferences = personRecord.allRefsAsRanges.length > 1 ? ' etc' : '';
	infoBoxContent
	    .html(`
              <div style='display:flex; align-items:center'><span class='iconFont'>${summaryIcon}</span>
                <span>
                  ${spacer}
                  <span class="person-link jframework-linkAsButton">${nameForDisplayInInfoBox}</span>
                  <span>&nbsp;${"" === personRecord.role ? "" : (personRecord.role + " ")} (at ${firstScriptureReference(personRecord)}${multipleReferences}).</span>
                  <span>${alternativeNames}</span>
                </span>
                <span id='shareableLink' class='jframework-linkAsButton' style='margin-left:auto' title='Copy to clipboard a URL for this family tree'>Shareable link</span>
              </div>

             <br>${partnerList}

              <p><b>Father:</b> ${fatherName !== EmptyFieldMarker ? `<span class="father-link jframework-linkAsButton">${nameForDisplayInBodyOfInfoBoxGivenNameKey(fatherName)}</span>` : '-' }
              &nbsp;&nbsp;&nbsp;<b>Mother:</b> ${motherName !== EmptyFieldMarker ? `<span class="mother-link jframework-linkAsButton">${nameForDisplayInBodyOfInfoBoxGivenNameKey(motherName)}</span>` : '-' }
              ${siblingList}
              ${childrenList}
              ${generations}
              ${ambiguity}
              ${summaryDescriptionX}
              ${longDescriptionX}
              `);

	infoBoxContent.select('#shareableLink').on('click', () => PresentationHandler.copyLinkToClipboard());
	infoBoxContent.select('.person-link').on('click', () => { PresentationHandler.changeRootToGivenPersonByIndex(ix); });
	if (fatherName !== EmptyFieldMarker)  { infoBoxContent.select   ('.father-link')                                .on('click', () => { PresentationHandler.changeRootToGivenPersonByName(fatherName); }); }
	if (motherName !== EmptyFieldMarker)  { infoBoxContent.select   ('.mother-link')                                .on('click', () => { PresentationHandler.changeRootToGivenPersonByName(motherName); }); }
	siblings .forEach((sibling, index) => { infoBoxContent.selectAll('.sibling-link') .filter((d, i) => i === index).on('click', () => { PresentationHandler.changeRootToGivenPersonByName(sibling.disambiguatedName); }); });
	partners .forEach((partner, index) => { infoBoxContent.selectAll('.partner-link') .filter((d, i) => i === index).on('click', () => { PresentationHandler.changeRootToGivenPersonByName(partner.disambiguatedName); }); });
	children .forEach((kid,     index) => { infoBoxContent.selectAll('.children-link').filter((d, i) => i === index).on('click', () => { PresentationHandler.changeRootToGivenPersonByName(kid.disambiguatedName); }); });



	/************************************************************************/
	/* Accessibility -- make the links available via the keyboard. */
	/*
	infoBoxContent
	    .selectAll('.jframework-linkAsButton')
	    .attr('role', 'link')
	    .attr('tabindex', 0)
	    .attr('aria-label', function () {
		const text = d3.select(this).text();
		return `Draw tree for ${text}`;
	    })
	    .on('keydown', function (event) {
		if (event.key === 'Enter' || event.key === ' ') {
		    event.preventDefault();
		    this.click(); // Trigger the same click handler
		}
	    });
	*/

	

	/************************************************************************/
	/* If we're in an iframe, change all scripture refs to pseudo links which
	   will change the content of the scripture window. */
	   
	if (JFrameworkUtils.targetExists('scripture'))
	{
            const infoBox = document.getElementById('info-box');
            Array.from(infoBox.getElementsByTagName('xref')).forEach (element => {
		element.name = 'button'
		element.classList.add('jframework-linkAsButton');
		element.onclick = function() { JFrameworkMultiframeCommunicationsSlave.sendSetUrlForce('scripture', window.location.origin + '/?skipwelcome&q=' + 'reference=' + element.getAttribute('ref') + '&options=VHN&noredirect') }
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

	const explanationOfThereBeingOnlyASinglePerson = $('#explanationOfThereBeingOnlyASinglePerson');
	if (personRecordFromIndex(rootPersonIx).children.length > 0)
	{
	    explanationOfThereBeingOnlyASinglePerson.hide();
	    return
	}


	const personRecord = personRecordFromIndex(rootPersonIx);
	const personName = personRecord.simpleName;
	const hasFather = DataHandler.hasFather(personRecord);
	const hasMother = DataHandler.hasMother(personRecord);
	const hasParents = hasFather || hasMother;
	const hasLinks = DataHandler.hasSiblings(personRecord) || DataHandler.hasPartners(personRecord);

	if (!hasParents && !hasLinks)
	{
	    document.getElementById('explanationOfThereBeingOnlyASinglePerson').innerHTML = `The Bible does not give details of any people related to ${personName}.  As a result, we can&rsquo;t show you a proper family tree here.`;
	    explanationOfThereBeingOnlyASinglePerson.show();
	    return;
	}
	
	var useLinks = '';
	if (hasFather) useLinks += `. Press the &lsquo;Father&rsquo; button to see ${personName}&rsquo;s father.`;
	if (hasMother)
	{
	    if (!useLinks.endsWith('.')) useLinks += '.';
	    useLinks += ' ';
	    useLinks += `Press the &lsquo;Mother&rsquo; button to see ${personName}&rsquo;s mother.`;
	}
	
	if (hasLinks)
	{
	    if (hasParents)
		useLinks += ' Or click on links in the information box.';
	    else
		useLinks += ' &mdash; click on links in the information box.';
	}

	document.getElementById('explanationOfThereBeingOnlyASinglePerson').innerHTML = `The Bible does not record ${personName} as having any children, so we can&rsquo;t show you any descendants.  However, you can still see other related people${useLinks}`;
	explanationOfThereBeingOnlyASinglePerson.show();
    }

    
    /**************************************************************************/
    /* For use by processing for built-in trees, where we have a specific
       selection of records which need to be processed. */
    
    _redrawUsingJustSelectedRecords (root, rootPersonRecord, selectedPersonIx = null)
    {
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
	if (document.getElementById('highlightRelations').checked)
	    this.changeRelationsHighlighting(true, ix);
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
	    $('#fatherButton').removeClass('jframework-greyedBtn');
	else
	    $('#fatherButton').addClass('jframework-greyedBtn');
    
	if (DataHandler.hasMother(person))
	    $('#motherButton').removeClass('jframework-greyedBtn');
	else
	    $('#motherButton').addClass('jframework-greyedBtn');
    }


    
    /**************************************************************************/
    _duplicatedRecords = new Set();
    _NOT_USED_excludedRecords = new Set();
    _root = null;
    _rootPersonIx = -1;
    _selectedPersonIx = -1;
    _selectedRecords = new Set();
    SubtreeHighlightHandler = new ClassSubtreeHighlightHandler();  
}

export const PresentationHandler = new _ClassPresentationHandler();
window.PresentationHandler = PresentationHandler;





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
	const repositioned = LayoutHandler.adjustPositionOfRootNode(true);



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

class _ClassControlsHandler
{ 
    /**************************************************************************/
    hideBuiltInTreesDialog ()
    {
	ModalDialogHandler.closeIfTopModalDialog(document.getElementById('builtInTreesMenu'));
    }

    
    /**************************************************************************/
    showHelpMenu ()
    {
	const modal = document.getElementById('help');
	ModalDialogHandler.showModalDialog(modal);
	modal.querySelector('.jframework-modalDialogBody').scrollTop = 0;
	modal.style.top = '20px';
	modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + 'px';
    }

  
    /**************************************************************************/
    _wantBuiltInTreesMenuIndividualSearchBox = false;
    showBuiltInTreesDialog ()
    {
	const modal = document.getElementById('builtInTreesMenu');

	if (this._wantBuiltInTreesMenuIndividualSearchBox)
	{
	    document.getElementById('builtInTreesFirstPartWithoutSearchBox').style.display = 'none';
	    document.getElementById('builtInTreesFirstPartWithSearchBox').style.display = 'block';
	}
	else
	{
	    document.getElementById('builtInTreesFirstPartWithoutSearchBox').style.display = 'block';
	    document.getElementById('builtInTreesFirstPartWithSearchBox').style.display = 'none';
	}
	    

	ModalDialogHandler.showModalDialog(modal);

	modal.style.top = '20px';
	modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + 'px';

	document.getElementById('builtInTreesContainer').scrollTop = 0;

	this._showBuiltInTreesDialog_fillTable()
    }

  
    /**********************************************************************/
    _showBuiltInTreesDialog_clickHandlerFn (ix)
    {
	renderTreeForName(nameFromIndex(ix))
	ModalDialogHandler.closeTopModalDialog();
    }


    /**************************************************************************/
    _showBuiltInTreesDialog_fillTable ()
    {
	if (this._wantBuiltInTreesMenuIndividualSearchBox)
	    this._builtInTreesDialogSearchTable = new _ClassSearchTableCommonProcessing(Object.values(DataHandler.GenealogyData),
											'builtInTreesMenuSearchBoxTableContainer',
											this._showBuiltInTreesDialog_clickHandlerFn.bind(this),
											'builtInTreesMenuSearchBox');
    }


    /**************************************************************************/
    showLayoutMenu ()
    {
	const modal = document.getElementById('layoutMenu')

	ModalDialogHandler.showModalDialog(modal);

	modal.style.top = '20px';
	modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + 'px';

	document.getElementById('horizontalSpacingSlider').value = CurrentHorizontalSpacingTicks;
	document.getElementById('verticalSpacingSlider').value = CurrentVerticalSpacingTicks;
	document.getElementById('numberOfGenerationsSlider').value = CurrentNumberOfGenerationsToGrowByOnEachExpansion;
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
	    event.stopPropagation();
	    CurrentVerticalSpacingTicks = parseInt(event.target.value, 10);
	    saveDataInParentWindow();
	    PresentationHandler.refresh();
	});

	document.getElementById('numberOfGenerationsSlider').addEventListener('input', (event) => {
	    event.stopPropagation();
	    CurrentNumberOfGenerationsToGrowByOnEachExpansion = parseInt(event.target.value, 10);
	    saveDataInParentWindow();
	    document.getElementById('numberOfGenerationsLabel').innerText = '' + CurrentNumberOfGenerationsToGrowByOnEachExpansion;
	});
    }
}

export const ControlsHandler = new _ClassControlsHandler();
window.ControlsHandler = ControlsHandler;


  
//window.ModalDialogHandler = ModalDialogHandler;
    




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
	const draggables = document.getElementsByClassName('jframework-draggableContainer');
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
	const header = draggable.querySelector('.jframework-draggableHeader');

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

	ModalDialogHandler.showModalDialog(document.getElementById('personNodeContextMenu')); // Need to show in order to measure size.
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
    }


    /**************************************************************************/
    _contextMenuTarget = null;
    _contextMenu = d3.select('#personNodeContextMenu');
  

    /**********************************************************************/
    _clickHandlerFn (leafNodeIx)
    {
	PresentationHandler.reviseTreeAddBranchDownAsFarAsIndividual(leafNodeIx);
	ModalDialogHandler.closeTopModalDialog();
    }


    /**************************************************************************/
    _fillDescendantsTable (ix)
    {
	const records = []; iterateOverDescendants(personRecordFromIndex(ix), function (personRecord, level) { records.push(personRecord) });
	this._tableHandler = new _ClassSearchTableCommonProcessing(records, 'descendantTableContainer', this._clickHandlerFn.bind(this), 'descendantSearchBox');
    }
}

export const ContextMenuHandler = new ClassContextMenuHandler()
window.ContextMenuHandler = ContextMenuHandler;





/*!****************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**        Common processing for filling and monitoring search tables        **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassSearchTableCommonProcessing
{
    /**************************************************************************/
    constructor (records, tableContainerId, callerClickHandlerFn, searchBoxId)
    {
	this._records = records;
	this._callerClickHandlerFn = callerClickHandlerFn;
	this._GenealogySharedCode = new ClassGenealogySharedCode();

	const tableHandlerArgs =
	{
	    tableContainerId: tableContainerId,
	    bodyBuilderFn: this._tableBodyBuilder.bind(this),
	    clickHandlerFn: this._tableClickHandlerFn.bind(this),
	    selectionHighlighterFn: this._tableRowHighlighter.bind(this),
	    searchBoxId: searchBoxId,
	    rowMatcherFn: this._rowMatcherFn.bind(this),
	    hideTableWhenNotInUse: true,
	    keepSelectedRowVisible: false,
	};
	
	const tableHandler = new ClassJFrameworkTableWithSearchBox(tableHandlerArgs);
	tableHandler.initialise();
    }

    
    /**********************************************************************/
    _rowMatcherFn (row, userInput)
    {
	return this._GenealogySharedCode.rowMatcherFn(row, userInput);
    }


    /**********************************************************************/
    /* Fill in table. */

    _tableBodyBuilder ()
    {
	const me = this;
	var tblBodyHtml = '';
	this._records.forEach(function (personRecord) {
	    if ('Dummy' !== personRecord.simpleName && !personRecord.simpleName.startsWith('+'))
		tblBodyHtml += me._GenealogySharedCode.makeSearchTableRowHtml(nameFromPersonRecord(personRecord), personRecord);
	});

	return tblBodyHtml;
    }




    /**********************************************************************/
    _tableClickHandlerFn (cell, column)
    {
	const row = cell.closest("tr");
	this._callerClickHandlerFn(row.rowIndex);
    }

    
    /**********************************************************************/
    _tableRowHighlighter (selection)
    {
	const row = 'tr' == selection.tagName ? selection : selection.closest('tr');
	    
	// Remove any existing highlighting.
	for (var i = 1; i <= row.cells.length; ++i)
	    $('.tb_col_' + i).css('background', 'white');

	// Highlight target row.
	for (var i = 0; i < row.cells.length; ++i)
	    $(row.cells[i]).css('background', '#FFFFC0');
    }
}





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
function indexFromStrongs (strongs)
{
    return DataHandler.lookupStrongs(strongs);
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
function strongsFromIndex (ix)
{
    return personRecordFromIndex(ix).allDStrongs.join('|');
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

/******************************************************************************/
/* This handles a thing a bit like a TV remote which I was originally using to
   make it easier to scroll through very large trees when using a mouse --
   otherwise you have to repeat a lot of relatively small individual scrolls to
   achieve the same end.

   At the time of writing, we've decided to drop this, but I want to retain the
   code in case we decide to reinstate it. */

class ClassScrollButtonHandler
{		   
    /**************************************************************************/
    constructor ()
    {
	this._haveScrollButton = null !== document.getElementById('jframework-scrollRingScrollUpButton')
	if (!this._haveScrollButton) return;
	
	document.getElementById('jframework-scrollRingScrollUpButton')   .addEventListener('mousedown', () => this._startScrolling(0, +this._scrollSpeed));
	document.getElementById('jframework-scrollRingScrollDownButton') .addEventListener('mousedown', () => this._startScrolling(0, -this._scrollSpeed));
	document.getElementById('jframework-scrollRingScrollLeftButton') .addEventListener('mousedown', () => this._startScrolling(+this._scrollSpeed, 0));
	document.getElementById('jframework-scrollRingScrollRightButton').addEventListener('mousedown', () => this._startScrolling(-this._scrollSpeed, 0));
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
    JFrameworkMultiframeCommunicationsSlave.saveData(JFrameworkUtils.myFrameId(),
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
