/******************************************************************************/
/* Code used to support peopleIndex.html. */



  
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
class PeopleDataEntry
{
    constructor(refs, dStrongs, masterDStrongs)
    {
        this.refs = refs; // May not want this long term -- in which case the data could probably go from people.json.
        this.allDStrongs = dStrongs; // All of various Strongs for this person.
        this.masterDStrongs = masterDStrongs; // The Strongs preferred for processing purposes.
    }
};
    
const PeopleData = [];
const PersonFullyQualifiedNameToIndex = new Map();




/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
class ClassUtils
{    
    /**************************************************************************/
    /* Gets the first part of URLs, assuming we are running under /html/,
       and all files will be under that. */

    getUrlPart1 ()
    {
        var urlPart1 = window.location.origin;
        var pos = window.location.href.indexOf('/html/');
        if (pos > 8) // Probably running in development environment.
            urlPart1 = window.location.href.substr(0, pos);
        return urlPart1;
    }


    /**************************************************************************/
    getDebugOption ()
    {
        var debugOption = '';
        var urlPart1 = window.location.origin;
        var pos = window.location.href.indexOf('/html/');
        if (pos > 8) // Probably running in development environment.
        { 
            urlPart1 = window.location.href.substr(0, pos);
            debugOption = '&debug';
        }

        return debugOption;
    }


    /**************************************************************************/
    /* Loads things like css files etc.  This code seems to be duplicated all
       over the place and probably should not be. */

    loadFile (path)
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
}

const Utils = new ClassUtils();



	
      


/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
class ClassUiUpdater
{    
    /**************************************************************************/
    swapPanes ()
    {
        MultiframeController.swapPanes("scripture", "genealogy");
    }
}

const UiUpdater = new ClassUiUpdater();





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**         Classes which make URLs based either on refs or dStrongs         **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/


/******************************************************************************/
class ClassUrlMakerBasedOnRefs
{
    /**************************************************************************/
    /* This is used only for the Gen.1.1 reference associated with the
       instructions pseudo-entry. */

    makeScriptureUrlGivenRef (ref)
    {
	return window.location.origin + '/?skipwelcome&q=' + 'reference=' + ref;
    }
}


/******************************************************************************/
class ClassUrlMakerBasedOnDStrongs
{
    /**************************************************************************/
    /* Genealogy URLs are based upon the master Strongs for the item. */

    makeGenealogyUrl (ix)
    {
	return window.location.origin + '/html/genealogy.html?strong=' + PeopleData[ix].masterDStrongs;
    }


    /**************************************************************************/
    makeScriptureUrl (ix)
    {
	const partialUrl = this.getAllDStrongs(ix);

        var join = '';
	if (PeopleData[ix].allDStrongs.length > 1)
        {
            join = '@srchJoin=(';
            for (var i = 1; i <= PeopleData[ix].allDStrongs.length; ++i)
                join += i + "o";
            join = join.substring(0, join.length - 1) + ")";
        }

	return this.makeScriptureUrlA(join + partialUrl);// + "&options=VHN");
    }

    
    /**************************************************************************/
    makeScriptureUrlA (partialUrl)
    {
	return window.location.origin + '/?skipwelcome&q=' + partialUrl;
//	return window.location.origin + '/?q=' + partialUrl;
    }


    /**************************************************************************/
    getAllDStrongs (ix)
    {
	return '@strong=' + PeopleData[ix].allDStrongs.join('@strong=');
    }
}

const UrlMakerBasedOnDStrongs = new ClassUrlMakerBasedOnDStrongs();
const UrlMakerBasedOnRefs     = new ClassUrlMakerBasedOnRefs();





/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class ClassEventHandlers
{    
    /**************************************************************************/
    /* See ClassPeopleTableHandler.activationReceiver for discussion. */
    
    activationHandler ()
    {
	if (-1 != this._attemptedToScrollTo)
	    this.selectPersonFollowingGenealogyChange(this._attemptedToScrollTo, true);
	this._attemptedToScrollTo = -1;
    }
    

    /**************************************************************************/
    respondToSelectionChangeInGenealogy (fullyQualifiedName)
    {
	document.getElementById('searchBox').value = ''; // Need to clear search box and make sure table is fully populated.
	PeopleTableHandler.TableHandler.showAll()
        const ix = PersonFullyQualifiedNameToIndex.get(fullyQualifiedName);
	this.selectPersonFollowingGenealogyChange(ix);
    }

    
    /**************************************************************************/
    /* Sets the scripture and genealogy windows to point to the selected
       person. */
    
    selectPersonFollowingTableClick (ix)
    {
	this.setScriptureUrl(ix);
        this.setGenealogyUrl(ix);
        PeopleTableHandler.TableHandler.scrollTableToRow(ix);
    }


    /*************************************************************************/
    /* Updates the scripture window content and the table-highlighting to
       reflect a change in the genealogy window. */
    
    selectPersonFollowingGenealogyChange (ix)
    {
	this.setScriptureUrl(ix);
        PeopleTableHandler.TableHandler.scrollTableToRow(ix);
	this._attemptedToScrollTo = ix;
    }


    /**************************************************************************/
    ScriptureWindowSource = '';
    setScriptureUrl (ix)
    {
        const url = UrlMakerBasedOnDStrongs.makeScriptureUrl(ix);
	if (url != this.ScriptureWindowSource)
	{
	    MultiframeController.setUrl('scripture', url);
	    this.ScriptureWindowSource = url;
	}
    }


    /**************************************************************************/
    setGenealogyUrl (ix)
    {
	const url = UrlMakerBasedOnDStrongs.makeGenealogyUrl(ix);
        MultiframeController.setUrl('genealogy', url);
    }


    /****************************************************************************/
    tableClickHandler (cell, column)
    {
	const row = cell.parentNode;
	this.selectPersonFollowingTableClick(row.i);
    }



    /****************************************************************************/
    _attemptedToScrollTo = -1;
}

const EventHandlers = new ClassEventHandlers();





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                      Code modelled on previous files                     **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

class ClassPeopleTableHandler
{
    /**************************************************************************/
    /* I have written this stuff in the assumption that the functionality here
       may be used either in wide layout mode or in tabbed dialogue box mode.
       In wide layout mode, the table is always visible, so if the genealogy
       function selects a new person we are able to scroll to show that
       person in the table immediately and highlight them.  In tabbed dialogue
       mode, if the genealogy window is visible (which it must be for the user
       to have made a new selection), the people index table won't be visible,
       and although there is no problem with our _attempting_ to have scrolled
       to make the person visible in the table, it won't have worked.  When
       the table is made visible, therefore, we need to remedy that. */

    activationReceiver (activatedBy)
    {
	EventHandlers.activationHandler();
    }

    
    /**************************************************************************/
    init ()
    {
        /**********************************************************************/
	this.setSize();



        /**********************************************************************/
        var settings = new SettingsModelList;
        settings.fetch();
        if (settings.length > 0)
        {
            step.settings = settings.at(0);
            var sz = step.settings.get('defaultfont');
	    if (typeof sz !== 'number') sz = 15;
            $('table').css('font-size', sz + 'px');
        }



        /**********************************************************************/
        var jsonFileName = 'people';
        var queryString = window.location.search;
        var pos = queryString.indexOf('jsonFN=');
        if ((pos > 0) && ((queryString.substr(pos-1,1) == '?') || (queryString.substr(pos-1,1) == '&')))
        {
            var tmp = queryString.substr(pos + 7);
            pos = tmp.indexOf('&');
            if (pos == -1)
                jsonFileName = tmp;
            else if (pos > 0)
                jsonFileName = tmp.substr(0,pos);
        }

        const urlPart1 = Utils.getUrlPart1();
        var jsonPath =  urlPart1 + '/html/json/';
        if (urlPart1.indexOf('localhost') == -1 && urlPart1.indexOf('127.0.0.1') == -1)
            jsonPath += ('STEP_SERVER_VERSION_TOKEN'.toLowerCase() !== 'step_server_version_token') ? 'STEP_SERVER_VERSION_TOKEN/' : '';



        /**********************************************************************/
        /* Fill in name and description table. */

        const tableBodyBuilder = function ()
	{
            $.ajaxSetup({async: false});
	    
            var tblBodyHtml = ''
            var ix = 0;
            $.getJSON(jsonPath + jsonFileName + '.json', function(array) {
		$.each(array, function (key, val) {
		    PeopleData.push(new PeopleDataEntry(val.allRefsAsRanges.join(';'), val.allDStrongs, val.dStrongs));
		    PersonFullyQualifiedNameToIndex.set(key, ix++);
		    var shortDescription = val.shortDescription.split('(')[0].trim();
		    if (!shortDescription.endsWith('.')) shortDescription += '.';

		    const x = key.split('@');
		    var displayName = x[0]; // Name portion only.
		    if (displayName.includes('built'))
		    {
			const bits = displayName.split('_built_');
			displayName = bits[0] + ' (built ' + bits[1] + ')';
		    }
			
		    const alternativeNames = 0 == val.alternativeNames.length ? '' : '<br>' + val.alternativeNames.map( str => str.split('@')[0] ).join('<br>');
		    if (0 != alternativeNames.length) displayName += ' &bull; aka ...';
		    displayName += alternativeNames;

		    const shortDescriptionWhere = `First mentioned at ${x[1].split('-')[0]}. `;
			
		    tblBodyHtml += 
			"<tr><td class='tb_col tb_col_1 clickable'>" + displayName + '</td>' +
			"<td class='tb_col tb_col_2 clickable'>" + shortDescriptionWhere + shortDescription + '</td>' +
			"</tr>";
		})
            });

            $.ajaxSetup({async: true});

	    return tblBodyHtml;
	}


        /**********************************************************************/
        const rowMatcherFn = function (row, userInput)
	{
	    const re = new RegExp('^' + userInput.replace('-', ''), 'i');
	    const entries = row.find('.tb_col_1').html().split('<br>');
		
	    for (var ix = 0; ix < entries.length; ++ix)
	    {
		var matchAgainst = entries[ix];
		matchAgainst = matchAgainst.replace('-', '');
		if (re.test(matchAgainst)) return true;
	    }

	    return false;
	}


	/**************************************************************************/
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
	    tableContainerId: 'peopleTableContainer',
	    bodyBuilderFn: tableBodyBuilder,
	    clickHandlerFn: EventHandlers.tableClickHandler.bind(EventHandlers),
	    selectionHighlighterFn: tableRowHighlighter,
	    searchBoxId: 'searchBox',
	    rowMatcherFn: rowMatcherFn
	};
	
	this.TableHandler = new ClassTableWithSearchBoxHandler(tableHandlerArgs);
	this.TableHandler.initialise();
    }


    /**************************************************************************/
    setSize ()
    {
	/**********************************************************************/
        /* Table header. */

        var leftColWidth = '25%';
        var rightColWidth = '75%';
        if (!MultiframeController.isLargeScreen())
        {
          leftColWidth = '35%';
          rightColWidth = '65%';
        }



        /**********************************************************************/
        var fullHeight = $(window).height();
        var remainingHeight = Math.floor((fullHeight - $('#header').height()) * 0.98);
        $('#peopleTableContainer').css('height', remainingHeight + 'px').css('max-height', remainingHeight + 'px');
    }
}

const PeopleTableHandler = new ClassPeopleTableHandler();





/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function doInitialisation ()
{
    accommodateToEnvironment();
    window.messageReceiver = function (source, ix) { EventHandlers.respondToSelectionChangeInGenealogy(ix); };
    PeopleTableHandler.init();

    var initialPersonIx = 0; // Show Aaron (first person alphabetically) unless otherwise instructed.
    const strong = new URLSearchParams(new URL(window.location.href).search).get("strong");
    if (strong)
    {
        const personIx = PeopleData.findIndex(person => person.masterDStrongs == strong);
        if (personIx)
            initialPersonIx = personIx;
    }

    const iframeContainer = window.parent;
    const dataPreviouslySaved = (window.parent && window.parent.dataStoreForIframes) ? window.parent.dataStoreForIframes.get('genealogy') : null;
    if (dataPreviouslySaved)
	initialPersonIx = dataPreviouslySaved.rootPersonIx;
    
    EventHandlers.selectPersonFollowingTableClick(initialPersonIx);
}



/******************************************************************************/
/* In an iframe environment, sets up the other frames.  The line below which
   has been commented out used to add a button which let you swap the
   scriptures and family tree between bottom left and right-hand panes.
   However, we've dropped that because moving iframes always causes their
   content to reset, which means the user loses any context they had
   established. */

function accommodateToEnvironment ()
{
    if (MultiframeController.isLargeScreen())
    {
	window.parent.document.getElementById('genealogy').src = "genealogy.html";
        //$('#controlButtonsHolder').html(`&nbsp;&nbsp;<button title='Swap family tree and scripture panes' class='btn blue' ><span style='font-size:x-large' onclick='UiUpdater.swapPanes()'>&#x1F4D7;&#x2194;&#x1F46A;</span></button>`);
    }
}
