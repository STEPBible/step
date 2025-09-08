/******************************************************************************/
/* Code used to support peopleIndex.html. */



  
/******************************************************************************/
'use strict';
import { ClassGenealogySharedCode                     } from '/js/J_AppsJs/J_Genealogy/j_genealogySharedCode.js';
import { ClassJFrameworkMultiframeCommunicationsSlave } from '/js/J_AppsJs/J_Framework/j_framework.multiframeCommunicationsSlave.js';
import { ClassJFrameworkTableWithSearchBox }            from '/js/J_AppsJs/J_Framework/j_framework.tableWithSearchBox.js';
import { JFrameworkUserSettings }                       from '/js/J_AppsJs/J_Framework/j_framework.userSettings.js';
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
	function fn (firstTime)
	{
	    const background = getComputedStyle(document.documentElement).getPropertyValue("--clrBackground").trim();
	    const tableHighlight = JFrameworkUtils.isDark(background) ? 'rgba(255, 0, 0, 0.4)' : 'rgb(255, 255, 192)';
	    document.documentElement.style.setProperty('--jframework-clrPopUpMenuItemBackgroundUnselected', tableHighlight);
	}
	
	JFrameworkUserSettings.init(fn);


	
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

        function tableBodyBuilder ()
	{
	    const me = this;
	    this._GenealogySharedCode = new ClassGenealogySharedCode();

            $.ajaxSetup({async: false});
	    
            var tblBodyHtml = ''
            var ix = 0;
            $.getJSON(jsonPath + jsonFileName, function(array) {
		$.each(array, function (key, val) {
		    _PeopleData.push(new _PeopleDataEntry(val.allDStrongs, val.allNames, val.dStrongs, key));
		    _PersonFullyQualifiedNameToIndex.set(key, ix++);
		    tblBodyHtml += me._GenealogySharedCode.makeSearchTableRowHtml(key, val);
		})
            });

            $.ajaxSetup({async: true});

	    return tblBodyHtml;
	}


        /**********************************************************************/
        function rowMatcherFn (row, userInput)
	{
	    return this._GenealogySharedCode.rowMatcherFn(row, userInput);
	}


        /**********************************************************************/
	this._tableHandlerArgs =
        {
	    headerId: 'header',  
	    searchBoxId: 'peopleSearchBox',
	    tableContainerId: 'peopleTableContainer',
	    bodyBuilderFn: tableBodyBuilder.bind(this),
	    clickHandlerFn: _JEventHandlers.tableClickHandler.bind(_JEventHandlers),
	    rowMatcherFn: rowMatcherFn.bind(this),
	    hideTableWhenNotInUse: true, // hideTableWhenNotInUse,
	    keepSelectedRowVisible: false,
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
    constructor(allDStrongs, allNames, masterDStrongs, disambiguatedName)
    {
        this.allDStrongs = allDStrongs; // All of various Strongs for this person.
        this.allNames = allNames; // All of various Strongs for this person.
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
    /* Originally this method received details of a selection made elsewhere
       (for example by clicking on a person link in the genealogy info box)
       and updated the search app to reflect that selection.  This became
       difficult to manage, and I wasn't even sure it was the right thing to
       do, given the more recent requirement that the search box remember what
       was most recently selected by typing into the box itself.

       I have therefore modified this so that it merely makes sure that if
       the search table is visible, but is supposed to be visible only while
       actively searching, we have a chance to hide it.

       I have commented out the calls which implemented the earlier
       behaviour, but have retained the methods they call in case we ever
       want to revert. */
    
    receiveMessage (data, sourceFrameId) // Overrides ClassJFrameworkMultiframeCommunicationsSlave
    {
	JPeopleTableHandler._tableHandler.hideTable();

/*	
	var disambiguatedName = null;
	if ('disambiguatedName' in data)
	    disambiguatedName = data.disambiguatedName;
	else if ('newPerson' in data)
	    disambiguatedName = data.newPerson.disambiguatedName;
	    
	
	if (null == disambiguatedName)
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
*/
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
	this.sendMessageWithSuppression('', { newPerson: _PeopleData[ix], source: 'peopleIndexTableClick' });
    }


    /*************************************************************************/
    /* Informs the world about the change. */
    
    selectPersonFollowingGenealogyChange (ix)
    {
	this.sendMessageWithSuppression('', { newPerson: _PeopleData[ix], source: 'genealogyChangeMediatedByPeopleIndex' });
	this._attemptedToScrollTo = ix;
    }


    /****************************************************************************/
    tableClickHandler (cell, column)
    {
	const row = cell.parentNode;
	this.selectPersonFollowingTableClick(row.rowIndex);
    }


    /****************************************************************************/
    _attemptedToScrollTo = -1;
    _suppressSendMessage = false;
}

const _JEventHandlers = new _ClassJEventHandlers();
