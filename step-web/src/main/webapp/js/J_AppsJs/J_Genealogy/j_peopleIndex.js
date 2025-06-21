/******************************************************************************/
/* Code used to support peopleIndex.html. */



  
/******************************************************************************/
'use strict';
import { ClassJFrameworkMultiframeCommunicationsSlave } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsSlave.js';
import { ClassJFrameworkTableWithSearchBox }            from '/js/J_AppsJs/J_Framework/j_framework.tableWithSearchBox.js';
import { JFrameworkUtils }                              from '/js/J_AppsJs/J_Framework/j_framework.utils.js';


/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                               Table handler                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* This class is directly exported for use in j_peopleIndex.html. */

class _ClassJPeopleTableHandler
{
    /**************************************************************************/
    init (hideTableWhenNotInUse)
    {
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
        var jsonFileName = 'J_AppsJson/J_Genealogy/j_genealogy.json';
        const urlPart1 = _Utils.getUrlPart1();
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
            $.getJSON(jsonPath + jsonFileName, function(array) {
		$.each(array, function (key, val) {
		    _PeopleData.push(new _PeopleDataEntry(val.allRefsAsRanges.join(';'), val.allDStrongs, val.dStrongs, key));
		    _PersonFullyQualifiedNameToIndex.set(key, ix++);
		    var shortDescription = val.shortDescription.split('(')[0].trim();
		    if (!shortDescription.endsWith('.')) shortDescription += '.';

		    const x = key.split('@');
		    var displayName = x[0]; // Name portion only.
		    if (displayName.includes('built'))
		    {
			const bits = displayName.split('_built_');
			displayName = bits[0] + ' (built ' + bits[1] + ')';
		    }
			
		    val.alternativeNames.shift();
		    const alternativeNames = 0 == val.alternativeNames.length ? '' : '<br>' + val.alternativeNames.map( str => str.split('@')[0] ).join('<br>');
		    //if (0 != val.alternativeNames.length) console.log(displayName + ": " + val.alternativeNames.join(', '));
		    if (0 != alternativeNames.length) displayName += ' &bull; or ...';
		    displayName += alternativeNames;

		    const shortDescriptionWhere = `First mentioned at ${x[1].split('-')[0]}. `;
			
		    tblBodyHtml += 
			"<tr><td class='jframework-tb_col tb_col_1 jframework-clickable'>" + displayName + '</td>' +
			"<td class='jframework-tb_col tb_col_2 jframework-clickable'>" + shortDescriptionWhere + shortDescription + '</td>' +
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


        /**********************************************************************/
	this._tableHandlerArgs =
        {
	    headerId: 'header',  
	    searchBoxId: 'peopleSearchBox',
	    tableContainerId: 'peopleTableContainer',
	    bodyBuilderFn: tableBodyBuilder,
	    clickHandlerFn: _JEventHandlers.tableClickHandler.bind(_JEventHandlers),
	    rowMatcherFn: rowMatcherFn,
	    hideTableWhenNotInUse: hideTableWhenNotInUse,
	    keepSelectedRowVisible: true
	};
	
	this._tableHandler = new ClassJFrameworkTableWithSearchBox(this._tableHandlerArgs);
	this._tableHandler.initialise();
    }


    /**************************************************************************/
    /* Arranges for the table to fill all of the remaining space below the
       header. */
    
    setTableSize ()
    {
	this._tableHandler.setTableSizeOmitting(this._headerHeight);
	this._tableHandler.redraw();
    };
}

export const JPeopleTableHandler = new _ClassJPeopleTableHandler();



/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
export function doInitialisation ()
{
    /**************************************************************************/
    if (!JFrameworkUtils.isLargeScreen())
        $('#smallScreenInfo').html('<br>For help, use the green button on the Genealogy tab.');
	


    /**************************************************************************/
    const hideTableWhenNotInUse = true;
    JPeopleTableHandler.init(hideTableWhenNotInUse);



    /**************************************************************************/
    var initialPersonIx = 0; // Show Aaron (first person alphabetically) unless otherwise instructed.
    const strong = new URLSearchParams(new URL(window.location.href).search).get("strong");
    if (strong)
    {
        const personIx = _PeopleData.findIndex(person => person.masterDStrongs == strong);
        if (personIx)
            initialPersonIx = personIx;
    }



    /**************************************************************************/
    const dataPreviouslySaved = (window.parent && window.parent.dataStoreForIframes) ? window.parent.dataStoreForIframes.get('genealogy') : null;
    if (dataPreviouslySaved)
	initialPersonIx = dataPreviouslySaved.rootPersonIx;


    
    /**************************************************************************/
    if (hideTableWhenNotInUse)
	_JEventHandlers.sendMessageTo(null, { 'resizeIframe': document.body.scrollHeight + 10 }); // Extra 10 because experience suggests that things may otherwise be cut off at the bottom of the frame.
    


    /**************************************************************************/
    if (initialPersonIx >= 0)
    {
	JPeopleTableHandler._tableHandler.highlightSelection(document.querySelector('.jframework-searchTable').querySelectorAll('tr')[initialPersonIx]);
	_JEventHandlers.selectPersonFollowingTableClick(initialPersonIx);
    }
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                 Internal                                 **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                          The people data itself                          **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _PeopleDataEntry
{
    constructor(refs, dStrongs, masterDStrongs, disambiguatedName)
    {
        this.refs = refs; // May not want this long term -- in which case the data could probably go from j_genealogy.json.
        this.allDStrongs = dStrongs; // All of various Strongs for this person.
        this.masterDStrongs = masterDStrongs; // The Strongs preferred for processing purposes.
	this.disambiguatedName = disambiguatedName;
    }
};
    
const _PeopleData = [];
const _PersonFullyQualifiedNameToIndex = new Map();




/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                Utilities                                 **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassUtils
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
}

const _Utils = new _ClassUtils();





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Event handlers                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
class _ClassJEventHandlers extends ClassJFrameworkMultiframeCommunicationsSlave
{    
    /**************************************************************************/
    /* I have written this stuff in the assumption that the functionality here
       may be used either in wide layout mode or in tabbed dialogue box mode.

       In wide layout mode, the table is always visible, so if the genealogy
       function selects a new person we are able to scroll to show that
       person in the table immediately and highlight them.

       In tabbed dialogue mode, if the genealogy window is visible (which it
       must be for the user to have made a new selection), the people index
       table won't currently be visible, and although there is no problem with
       our _attempting_ to have scrolled to make the person visible in the
       table, it won't have worked.  When the table is made visible,
       this method is called, and we can do the necessary. */

    receiveActivation (sourceFrameId) // Overrides ClassJFrameworkMultiframeCommunicationsSlave
    {
	this._activationHandler();
    }

    
    /**************************************************************************/
    receiveMessage (data, sourceFrameId) // Overrides ClassJFrameworkMultiframeCommunicationsSlave
    {
	if ('disambiguatedName' in data)
	{
	    try
	    {
		this._suppressSendMessage = true;
		this._respondToNewSelection(data.disambiguatedName, sourceFrameId);
	    }
	    finally
	    {
		this._suppressSendMessage = false;
	    }
	}
    }
    

    /**************************************************************************/
    /* This just gives us a chance to avoid sending messages telling the
       outside world about changes to the current item when it is the outside
       world which initiated the change in the first place. */
    
    sendMessageWithSuppression (targetFrameId, data)
    {
	if (!this._suppressSendMessage)
	    this.sendMessageTo(targetFrameId, data);
    }

    
    /**************************************************************************/
    /* See ClassPeopleTableHandler.activationReceiver for discussion. */
    
    _activationHandler ()
    {
	if (-1 != this._attemptedToScrollTo)
	    this.selectPersonFollowingGenealogyChange(this._attemptedToScrollTo, true);
	this._attemptedToScrollTo = -1;
    }
    

    /**************************************************************************/
    _respondToNewSelection (disambiguatedName, sourceFrameId)
    {
	document.getElementById('peopleSearchBox').value = ''; // Need to clear search box and make sure table is fully populated.
	const ix = _PersonFullyQualifiedNameToIndex.get(disambiguatedName);
	JPeopleTableHandler._tableHandler.highlightSelection(document.querySelector('.jframework-searchTable').querySelectorAll('tr')[ix]);
	this.selectPersonFollowingGenealogyChange(ix);
    }

    
    /**************************************************************************/
    /* Inform the world about the change. */
    
    selectPersonFollowingTableClick (ix)
    {
	this.sendMessageWithSuppression('', {strong: _PeopleData[ix].masterDStrongs, allStrongs: _PeopleData[ix].allDStrongs.join('|'), disambiguatedName: _PeopleData[ix].disambiguatedName });
    }


    /*************************************************************************/
    /* Informs the world about the change. */
    
    selectPersonFollowingGenealogyChange (ix)
    {
	this.sendMessageWithSuppression('', {strong: _PeopleData[ix].masterDStrongs, allStrongs: _PeopleData[ix].allDStrongs.join('|'), disambiguatedName: _PeopleData[ix].disambiguatedName });
	this._attemptedToScrollTo = ix;
    }


    /****************************************************************************/
    tableClickHandler (cell, column)
    {
	const row = cell.parentNode;
	this.selectPersonFollowingTableClick(row.i);
    }


    /****************************************************************************/
    _attemptedToScrollTo = -1;
    _suppressSendMessage = false;
}

const _JEventHandlers = new _ClassJEventHandlers();
